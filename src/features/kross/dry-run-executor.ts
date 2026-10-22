import "server-only";

import {
  adaptKrossReservationPayload,
  type KrossReservationAdapterConfig,
  type KrossAdapterIssue,
} from "./transport-adapter";
import {
  normalizeKrossReservationCandidate,
  type KrossNormalizationIssue,
  type KrossTransportEvidence,
  type NormalizedKrossReservation,
} from "./normalize-reservation";

/**
 * Internal-only execution boundary. It deliberately has no HTTP, Supabase or
 * PMS dependency. A future authorized runtime may provide another store, but
 * this contract cannot activate production writes by itself.
 */
export type KrossDryRunMirrorStore = {
  getMirror(identityKey: string): NormalizedKrossReservation | null;
  saveMirror(identityKey: string, reservation: NormalizedKrossReservation): void;
  getImportRun(runKey: string): KrossDryRunImportRunEvidence | null;
  saveImportRun(runKey: string, evidence: KrossDryRunImportRunEvidence): void;
  mirrorCount(): number;
  importRunCount(): number;
};

export type KrossDryRunImportRunEvidence = {
  runKey: string;
  mode: "dry_run";
  status: "accepted" | "rejected";
  operation: "insert" | "update" | "replay" | "reject";
  identityKey: string | null;
  sourceReference: string;
  sourceHash: string;
  readOnly: true;
  pmsWriteCount: 0;
};

export type KrossDryRunRequest = {
  payload: unknown;
  adapterConfig: KrossReservationAdapterConfig;
  evidence: KrossTransportEvidence;
  nowIso: string;
};

export type KrossDryRunResult = {
  status: "accepted" | "rejected";
  operation: KrossDryRunImportRunEvidence["operation"];
  reservation: NormalizedKrossReservation | null;
  importRun: KrossDryRunImportRunEvidence;
  adapterIssues: KrossAdapterIssue[];
  normalizationIssues: KrossNormalizationIssue[];
  executionIssues: Array<"rejected_source_replay" | "missing_replay_mirror" | "source_replay_conflict" | "stale_source" | "source_version_conflict" | "invalid_source_time">;
  canEnterSafeView: false;
  pmsWriteCount: 0;
};

function artifactRunKey(request: KrossDryRunRequest) {
  return JSON.stringify([
    request.adapterConfig.orgId.trim(),
    request.adapterConfig.propertyId.trim(),
    request.evidence.sourceReference.trim(),
    request.evidence.sourceHash.trim(),
  ]);
}

function runKey(request: KrossDryRunRequest, externalReservationId: string | null) {
  return JSON.stringify([
    request.adapterConfig.orgId.trim(),
    request.adapterConfig.propertyId.trim(),
    externalReservationId,
    request.evidence.sourceReference.trim(),
    request.evidence.sourceHash.trim(),
  ]);
}

function identityKey(reservation: NormalizedKrossReservation) {
  return JSON.stringify([
    reservation.org_id,
    reservation.property_id,
    reservation.external_reservation_id,
  ]);
}

function reservationContent(reservation: NormalizedKrossReservation) {
  // Sync timestamps and artifact hashes may change without a reservation change.
  return JSON.stringify([
    reservation.org_id, reservation.property_id, reservation.external_reservation_id,
    reservation.reservation_key, reservation.room_id, reservation.room_code_raw,
    reservation.check_in, reservation.check_out, reservation.status,
    reservation.guests_count, reservation.adults, reservation.children,
    reservation.channel, reservation.breakfast_included,
  ]);
}

function credibleSourceVersion(reservation: NormalizedKrossReservation, nowMs: number) {
  const source = Date.parse(reservation.snapshot_as_of);
  const observed = Date.parse(reservation.last_synced_at);
  // Business-quality review does not invalidate an otherwise credible version.
  // Future or chronologically impossible provenance cannot establish ordering.
  return Number.isFinite(source) && Number.isFinite(observed) && source <= observed && observed <= nowMs
    ? source
    : null;
}

export function createInMemoryKrossDryRunStore(): KrossDryRunMirrorStore {
  const mirrors = new Map<string, NormalizedKrossReservation>();
  const importRuns = new Map<string, KrossDryRunImportRunEvidence>();

  return {
    getMirror: (key) => mirrors.get(key) ?? null,
    saveMirror: (key, reservation) => mirrors.set(key, reservation),
    getImportRun: (key) => importRuns.get(key) ?? null,
    saveImportRun: (key, evidence) => importRuns.set(key, evidence),
    mirrorCount: () => mirrors.size,
    importRunCount: () => importRuns.size,
  };
}

export function executeKrossDryRun(
  request: KrossDryRunRequest,
  store: KrossDryRunMirrorStore,
): KrossDryRunResult {
  const adapted = adaptKrossReservationPayload(
    request.payload,
    request.adapterConfig,
  );
  const currentRunKey = runKey(request, adapted.candidate?.externalReservationId ?? null);
  const existingRun = store.getImportRun(currentRunKey);
  const existingArtifactRejection = store.getImportRun(artifactRunKey(request));

  function reject(
    normalizationIssues: KrossNormalizationIssue[],
    executionIssue?: KrossDryRunResult["executionIssues"][number],
  ): KrossDryRunResult {
    // Keep an accepted receipt immutable when a later conflicting attempt fails.
    const rejectedKey = existingRun?.status === "accepted"
      ? JSON.stringify([currentRunKey, "reject", executionIssue ?? "validation"])
      : artifactRunKey(request);
    const storedRejection = store.getImportRun(rejectedKey);
    const importRun: KrossDryRunImportRunEvidence = {
      runKey: rejectedKey,
      mode: "dry_run",
      status: "rejected",
      operation: "reject",
      identityKey: adapted.candidate ? JSON.stringify([adapted.candidate.orgId.trim(), adapted.candidate.propertyId.trim(), adapted.candidate.externalReservationId]) : null,
      sourceReference: request.evidence.sourceReference,
      sourceHash: request.evidence.sourceHash,
      readOnly: true,
      pmsWriteCount: 0,
    };
    if (!storedRejection) store.saveImportRun(rejectedKey, importRun);

    return {
      status: "rejected",
      operation: "reject",
      reservation: null,
      importRun: storedRejection ?? importRun,
      adapterIssues: adapted.issues,
      normalizationIssues,
      executionIssues: executionIssue ? [executionIssue] : [],
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

  if (!adapted.candidate) return reject([]);

  // Dry-run provenance is intentionally never eligible for source_is_live.
  // The canonical normalizer still validates shape, scope, dates and hashes.
  const dryRunEvidence: KrossTransportEvidence = {
    ...request.evidence,
    authorizedTransport: false,
    directFromKross: false,
    readOnly: true,
  };
  const normalized = normalizeKrossReservationCandidate(
    adapted.candidate,
    dryRunEvidence,
    request.nowIso,
  );

  if (!normalized.reservation) return reject(normalized.issues);

  const key = identityKey(normalized.reservation);
  const existingMirror = store.getMirror(key);
  if (existingArtifactRejection?.status === "rejected" || existingRun?.status === "rejected") {
    return reject(normalized.issues, "rejected_source_replay");
  }
  if (existingRun && (!existingMirror || existingRun.identityKey !== key)) {
    return reject(normalized.issues, existingMirror ? "source_replay_conflict" : "missing_replay_mirror");
  }
  if (existingMirror) {
    const nowMs = Date.parse(request.nowIso);
    const incomingVersion = credibleSourceVersion(normalized.reservation, nowMs);
    const currentVersion = credibleSourceVersion(existingMirror, nowMs);
    if (currentVersion !== null) {
      if (incomingVersion === null) return reject(normalized.issues, "invalid_source_time");
      if (incomingVersion < currentVersion) return reject(normalized.issues, "stale_source");
      if (incomingVersion === currentVersion && reservationContent(existingMirror) !== reservationContent(normalized.reservation)) {
        return reject(normalized.issues, "source_version_conflict");
      }
    }
    if (existingRun && (Date.parse(normalized.reservation.snapshot_as_of) !== Date.parse(existingMirror.snapshot_as_of) || reservationContent(existingMirror) !== reservationContent(normalized.reservation))) {
      return reject(normalized.issues, "source_replay_conflict");
    }
  }
  if (existingRun) {
    return {
      status: "accepted",
      operation: "replay",
      reservation: existingMirror,
      importRun: existingRun,
      adapterIssues: adapted.issues,
      normalizationIssues: normalized.issues,
      executionIssues: [],
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

  const operation = existingMirror ? "update" : "insert";
  const importRun: KrossDryRunImportRunEvidence = {
    runKey: currentRunKey,
    mode: "dry_run",
    status: "accepted",
    operation,
    identityKey: key,
    sourceReference: request.evidence.sourceReference,
    sourceHash: request.evidence.sourceHash,
    readOnly: true,
    pmsWriteCount: 0,
  };

  store.saveMirror(key, normalized.reservation);
  store.saveImportRun(currentRunKey, importRun);

  return {
    status: "accepted",
    operation,
    reservation: normalized.reservation,
    importRun,
    adapterIssues: adapted.issues,
    normalizationIssues: normalized.issues,
    executionIssues: [],
    canEnterSafeView: false,
    pmsWriteCount: 0,
  };
}
