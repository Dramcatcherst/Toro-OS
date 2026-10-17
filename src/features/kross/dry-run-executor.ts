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
  canEnterSafeView: false;
  pmsWriteCount: 0;
};

function runKey(request: KrossDryRunRequest, externalReservationId: string | null) {
  // A file checksum identifies an artifact, not each reservation within it.
  // Encoding the tuple also avoids delimiter collisions in source references.
  return JSON.stringify([
    request.adapterConfig.orgId.trim(),
    request.adapterConfig.propertyId.trim(),
    request.evidence.sourceReference.trim(),
    request.evidence.sourceHash.trim(),
    externalReservationId,
  ]);
}

function identityKey(reservation: NormalizedKrossReservation) {
  return [
    reservation.org_id,
    reservation.property_id,
    reservation.external_reservation_id,
  ].join(":");
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

  if (!adapted.candidate) {
    const importRun: KrossDryRunImportRunEvidence = {
      runKey: currentRunKey,
      mode: "dry_run",
      status: "rejected",
      operation: "reject",
      identityKey: null,
      sourceReference: request.evidence.sourceReference,
      sourceHash: request.evidence.sourceHash,
      readOnly: true,
      pmsWriteCount: 0,
    };
    if (!existingRun) store.saveImportRun(currentRunKey, importRun);

    return {
      status: "rejected",
      operation: "reject",
      reservation: null,
      importRun: existingRun ?? importRun,
      adapterIssues: adapted.issues,
      normalizationIssues: [],
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

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

  if (!normalized.reservation) {
    const importRun: KrossDryRunImportRunEvidence = {
      runKey: currentRunKey,
      mode: "dry_run",
      status: "rejected",
      operation: "reject",
      identityKey: null,
      sourceReference: request.evidence.sourceReference,
      sourceHash: request.evidence.sourceHash,
      readOnly: true,
      pmsWriteCount: 0,
    };
    if (!existingRun) store.saveImportRun(currentRunKey, importRun);

    return {
      status: "rejected",
      operation: "reject",
      reservation: null,
      importRun: existingRun ?? importRun,
      adapterIssues: adapted.issues,
      normalizationIssues: normalized.issues,
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

  const key = identityKey(normalized.reservation);
  const existingMirror = store.getMirror(key);
  if (
    existingMirror &&
    Date.parse(normalized.reservation.snapshot_as_of) < Date.parse(existingMirror.snapshot_as_of)
  ) {
    const importRun: KrossDryRunImportRunEvidence = {
      runKey: currentRunKey,
      mode: "dry_run",
      status: "rejected",
      operation: "reject",
      identityKey: key,
      sourceReference: request.evidence.sourceReference,
      sourceHash: request.evidence.sourceHash,
      readOnly: true,
      pmsWriteCount: 0,
    };
    // Do not rewrite an earlier accepted receipt when an old event reappears.
    if (!existingRun) store.saveImportRun(currentRunKey, importRun);
    return {
      status: "rejected",
      operation: "reject",
      reservation: null,
      importRun,
      adapterIssues: adapted.issues,
      normalizationIssues: [
        ...normalized.issues,
        { code: "older_source_version", message: "An older source snapshot cannot replace the stored reservation." },
      ],
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }
  if (existingRun) {
    return {
      status: existingRun.status,
      operation: existingRun.status === "accepted" ? "replay" : "reject",
      reservation: existingRun.status === "accepted" ? existingMirror ?? normalized.reservation : null,
      importRun: existingRun,
      adapterIssues: adapted.issues,
      normalizationIssues: normalized.issues,
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

  const reservation = { ...normalized.reservation };
  if (existingMirror) {
    const optionalFieldMap = {
      reservationKey: "reservation_key", roomId: "room_id", roomCodeRaw: "room_code_raw",
      guestsCount: "guests_count", adults: "adults", children: "children",
      channel: "channel", breakfastIncluded: "breakfast_included",
    } as const;
    for (const [field, column] of Object.entries(optionalFieldMap)) {
      if (!Object.prototype.hasOwnProperty.call(adapted.candidate, field)) {
        Object.assign(reservation, { [column]: existingMirror[column] });
      }
    }
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

  store.saveMirror(key, reservation);
  store.saveImportRun(currentRunKey, importRun);

  return {
    status: "accepted",
    operation,
    reservation,
    importRun,
    adapterIssues: adapted.issues,
    normalizationIssues: normalized.issues,
    canEnterSafeView: false,
    pmsWriteCount: 0,
  };
}
