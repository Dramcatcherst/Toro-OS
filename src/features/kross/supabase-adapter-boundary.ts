import "server-only";

import { createHash } from "node:crypto";

import type { NormalizedKrossReservation } from "./normalize-reservation";
import type {
  KrossDryRunAttemptEvidenceAdmission,
  KrossDryRunAttemptReceipt,
  KrossDryRunCheckpointEvidence,
  KrossDryRunFeedAtomicAdmission,
  KrossDryRunFeedCheckpointEvidence,
  KrossDryRunFeedCounts,
  KrossDryRunFeedWriterLease,
  KrossDryRunImportRunEvidence,
  KrossDryRunQuarantineEvidence,
} from "./dry-run-executor";

export type KrossSupabaseAdapterScope = {
  orgId: string;
  propertyId: string;
  feed: string;
};

type KrossSupabaseSafeReservationWriteV1 = {
  org_id: string;
  property_id: string;
  external_reservation_id: string;
  reservation_key: string | null;
  room_id: string | null;
  room_code_raw: string | null;
  check_in: string;
  check_out: string;
  status: string;
  guests_count: number | null;
  adults: number | null;
  children: number | null;
  channel: string | null;
  breakfast_included: boolean | null;
  transactional_authority: "Kross";
  read_only_mirror: true;
  source_is_live: boolean;
  source_system: "Kross";
  source_table: "reservations";
  source_record_id: string;
  snapshot_as_of: string;
  last_synced_at: string;
  source_hash: string;
  data_quality_status: "verified" | "review";
};

type KrossSupabaseSafeImportRunV1 = Omit<
  KrossDryRunImportRunEvidence,
  "sourceReference"
>;

type KrossSupabaseFeedExpectedV1 = {
  feedCheckpoint: KrossDryRunFeedCheckpointEvidence | null;
  attemptReceipt: KrossDryRunAttemptReceipt | null;
  mirrors: Array<{
    identityKey: string;
    expected: KrossSupabaseSafeReservationWriteV1 | null;
  }>;
  importRuns: Array<{
    runKey: string;
    expected: KrossSupabaseSafeImportRunV1 | null;
  }>;
  checkpoints: Array<{
    identityKey: string;
    expected: KrossDryRunCheckpointEvidence | null;
  }>;
};

type KrossSupabaseFeedWriteSetV1 = {
  mirrors: Array<{
    identityKey: string;
    reservation: KrossSupabaseSafeReservationWriteV1;
  }>;
  importRuns: Array<{
    runKey: string;
    evidence: KrossSupabaseSafeImportRunV1;
  }>;
  checkpoints: Array<{
    identityKey: string;
    checkpoint: KrossDryRunCheckpointEvidence;
  }>;
  feedCheckpoint: KrossDryRunFeedCheckpointEvidence;
  attemptReceipt: KrossDryRunAttemptReceipt;
};

type KrossSupabaseAttemptExpectedV1 = {
  receipt: KrossDryRunAttemptReceipt | null;
};

type KrossSupabaseAttemptWriteSetV1 = {
  receipt: KrossDryRunAttemptReceipt;
  quarantine: KrossDryRunQuarantineEvidence | null;
};

type KrossSupabaseAtomicWriteCommonV1 = {
  contractVersion: "kross.supabase.atomic-write.v1";
  requestId: string;
  requestHash: string;
  scope: {
    orgId: string;
    propertyId: string;
    feed: string;
    feedKey: string;
    sourceSystem: "Kross";
    snapshotKind: "reservation_mirror";
  };
  correlation: {
    feedKey: string;
    attemptId: string;
    writerId: string;
    leaseId: string;
    fencingToken: number;
    receiptKey: string;
  };
  proof: {
    feedCheckpointHash: string | null;
    receiptHash: string;
    quarantineHash: string | null;
    counts: KrossDryRunFeedCounts;
  };
};

export type KrossSupabaseAtomicWriteRequestV1 =
  KrossSupabaseAtomicWriteCommonV1 &
    (
      | {
          operation: "commit_feed";
          expected: KrossSupabaseFeedExpectedV1;
          writeSet: KrossSupabaseFeedWriteSetV1;
        }
      | {
          operation: "append_attempt_evidence";
          expected: KrossSupabaseAttemptExpectedV1;
          writeSet: KrossSupabaseAttemptWriteSetV1;
        }
    );

export type KrossSupabaseCommitReadbackV1 = {
  contractVersion: "kross.supabase.atomic-readback.v1";
  requestId: string;
  requestHash: string;
  operation: KrossSupabaseAtomicWriteRequestV1["operation"];
  scope: KrossSupabaseAtomicWriteRequestV1["scope"];
  correlation: KrossSupabaseAtomicWriteRequestV1["correlation"];
  status: "committed";
  commitId: string;
  commitDigest: string;
  proof: KrossSupabaseAtomicWriteRequestV1["proof"];
};

export type KrossSupabaseReadbackRequestV1 = {
  contractVersion: "kross.supabase.atomic-readback-request.v1";
  requestId: string;
  requestHash: string;
  operation: KrossSupabaseAtomicWriteRequestV1["operation"];
  feedKey: string;
  attemptId: string;
  leaseId: string;
  fencingToken: number;
};

export type KrossSupabaseAtomicWriteRawResult =
  | {
      status: "committed";
      requestId: string;
      requestHash: string;
      commitId: string;
      commitDigest: string;
      fencingToken: number;
    }
  | {
      status: "conflict";
      requestId: string;
      requestHash: string;
      conflictCode: string;
    }
  | {
      status: "fenced";
      requestId: string;
      requestHash: string;
      observedFencingToken: number;
    }
  | {
      status: "error";
      requestId: string;
      requestHash: string;
      errorKind: "known_unsent" | "protocol";
    };

export type KrossSupabaseAtomicWritePort = {
  /** The future implementation is one authorized server-side transaction. */
  writeOnce(
    request: KrossSupabaseAtomicWriteRequestV1,
  ): Promise<unknown>;
  /** Read-only correlation proof. It cannot submit or retry a mutation. */
  readback(
    request: KrossSupabaseReadbackRequestV1,
  ): Promise<unknown>;
};

export type KrossSupabaseAtomicWriteOutcome = {
  status: "committed" | "conflict" | "fenced" | "error";
  requestId: string | null;
  requestHash: string | null;
  commitId?: string;
  commitDigest?: string;
  conflictCode?: string;
  observedFencingToken?: number;
  errorKind?:
    | "invalid_request"
    | "invalid_scope"
    | "known_unsent"
    | "protocol"
    | "readback_missing"
    | "readback_mismatch"
    | "ambiguous_unresolved";
  readbackVerified: boolean;
  resolvedFromAmbiguousWrite: boolean;
  retryPolicy: "never_automatic";
};

export type KrossSupabaseRequestMapping =
  | { ok: true; request: KrossSupabaseAtomicWriteRequestV1 }
  | { ok: false; errorKind: "invalid_scope" | "invalid_request" };

type JsonPrimitive = string | number | boolean | null;
type CanonicalJson = JsonPrimitive | CanonicalJson[] | { [key: string]: CanonicalJson };
const trustedAtomicRequests = new WeakSet<object>();

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const maxCanonicalDepth = 64;
const maxCanonicalNodes = 10_000;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function denseArray(value: unknown): value is unknown[] {
  if (!Array.isArray(value)) return false;
  try {
    if (value.length > maxCanonicalNodes) return false;
    const names = Object.getOwnPropertyNames(value);
    if (Object.getOwnPropertySymbols(value).length > 0) return false;
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) return false;
    }
    return names.every((name) => {
      if (name === "length") return true;
      if (!/^(0|[1-9]\d*)$/.test(name)) return false;
      return Number(name) < value.length;
    });
  } catch {
    return false;
  }
}

function canonicalValue(
  value: unknown,
  state: { seen: WeakSet<object>; nodes: number } = {
    seen: new WeakSet<object>(),
    nodes: 0,
  },
  depth = 0,
): CanonicalJson {
  state.nodes += 1;
  if (depth > maxCanonicalDepth || state.nodes > maxCanonicalNodes) {
    throw new Error("Canonical JSON complexity limit exceeded.");
  }
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    if (!denseArray(value) || state.seen.has(value)) {
      throw new Error("Array is not dense canonical JSON.");
    }
    state.seen.add(value);
    try {
      return value.map((nested) =>
        canonicalValue(nested, state, depth + 1),
      );
    } finally {
      state.seen.delete(value);
    }
  }
  if (!record(value)) throw new Error("Value is not canonical JSON.");
  if (state.seen.has(value)) throw new Error("Cyclic JSON is not canonical.");
  state.seen.add(value);
  const output: { [key: string]: CanonicalJson } = {};
  try {
    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new Error("Symbols are not canonical JSON.");
    }
    const enumerableKeys = Object.keys(value);
    if (Object.getOwnPropertyNames(value).length !== enumerableKeys.length) {
      throw new Error("Non-enumerable properties are not canonical JSON.");
    }
    for (const key of enumerableKeys.sort()) {
      if (value[key] === undefined) {
        throw new Error("Undefined is not canonical JSON.");
      }
      output[key] = canonicalValue(value[key], state, depth + 1);
    }
  } finally {
    state.seen.delete(value);
  }
  return output;
}

function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalValue(value));
}

function sha256(value: unknown) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function deepFreezeCanonical<T>(
  value: T,
  seen = new WeakSet<object>(),
  depth = 0,
): T {
  if (value === null || typeof value !== "object") return value;
  if (depth > maxCanonicalDepth || seen.has(value)) {
    throw new Error("Cannot freeze cyclic or over-deep request material.");
  }
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (!denseArray(value)) throw new Error("Cannot freeze a sparse request.");
      for (const nested of value) deepFreezeCanonical(nested, seen, depth + 1);
    } else {
      for (const nested of Object.values(value as Record<string, unknown>)) {
        deepFreezeCanonical(nested, seen, depth + 1);
      }
    }
    return Object.freeze(value);
  } finally {
    seen.delete(value);
  }
}

function encodedKeyPart(value: string) {
  return encodeURIComponent(value.trim());
}

function normalizedScope(scope: KrossSupabaseAdapterScope) {
  const orgId = scope.orgId.trim();
  const propertyId = scope.propertyId.trim();
  const feed = scope.feed.trim();
  if (!uuidPattern.test(orgId) || !uuidPattern.test(propertyId) || !feed) {
    return null;
  }
  return { orgId, propertyId, feed };
}

function canonicalFeedKey(scope: KrossSupabaseAdapterScope) {
  const normalized = normalizedScope(scope);
  if (!normalized) return null;
  return [
    "v1",
    `org=${encodedKeyPart(normalized.orgId)}`,
    `property=${encodedKeyPart(normalized.propertyId)}`,
    "source=Kross",
    "snapshot=reservation_mirror",
    `feed=${encodedKeyPart(normalized.feed)}`,
  ].join("::");
}

function safeReservation(
  reservation: NormalizedKrossReservation,
): KrossSupabaseSafeReservationWriteV1 {
  return {
    org_id: reservation.org_id,
    property_id: reservation.property_id,
    external_reservation_id: reservation.external_reservation_id,
    reservation_key: reservation.reservation_key,
    room_id: reservation.room_id,
    room_code_raw: reservation.room_code_raw,
    check_in: reservation.check_in,
    check_out: reservation.check_out,
    status: reservation.status,
    guests_count: reservation.guests_count,
    adults: reservation.adults,
    children: reservation.children,
    channel: reservation.channel,
    breakfast_included: reservation.breakfast_included,
    transactional_authority: reservation.transactional_authority,
    read_only_mirror: reservation.read_only_mirror,
    source_is_live: reservation.source_is_live,
    source_system: reservation.source_system,
    source_table: reservation.source_table,
    source_record_id: reservation.source_record_id,
    snapshot_as_of: reservation.snapshot_as_of,
    last_synced_at: reservation.last_synced_at,
    source_hash: reservation.source_hash,
    data_quality_status: reservation.data_quality_status,
  };
}

function safeImportRun(
  evidence: KrossDryRunImportRunEvidence,
): KrossSupabaseSafeImportRunV1 {
  return {
    runKey: evidence.runKey,
    mode: evidence.mode,
    status: evidence.status,
    operation: evidence.operation,
    identityKey: evidence.identityKey,
    orgId: evidence.orgId,
    propertyId: evidence.propertyId,
    sourceSystem: evidence.sourceSystem,
    snapshotKind: evidence.snapshotKind,
    feed: evidence.feed,
    artifactHash: evidence.artifactHash,
    recordHash: evidence.recordHash,
    attemptId: evidence.attemptId,
    sourceAsOf: evidence.sourceAsOf,
    observedAt: evidence.observedAt,
    quarantineReason: evidence.quarantineReason,
    readOnly: evidence.readOnly,
    pmsWriteCount: evidence.pmsWriteCount,
  };
}

function safeCheckpoint(
  checkpoint: KrossDryRunCheckpointEvidence,
): KrossDryRunCheckpointEvidence {
  return {
    identityKey: checkpoint.identityKey,
    runKey: checkpoint.runKey,
    sourceAsOf: checkpoint.sourceAsOf,
    recordHash: checkpoint.recordHash,
  };
}

function safeCounts(counts: KrossDryRunFeedCounts): KrossDryRunFeedCounts {
  return {
    read: counts.read,
    accepted: counts.accepted,
    rejected: counts.rejected,
    unchanged: counts.unchanged,
    changed: counts.changed,
    conflict: counts.conflict,
  };
}

function safeFeedCheckpoint(
  checkpoint: KrossDryRunFeedCheckpointEvidence,
): KrossDryRunFeedCheckpointEvidence {
  return {
    feedKey: checkpoint.feedKey,
    artifactHash: checkpoint.artifactHash,
    sourceAsOf: checkpoint.sourceAsOf,
    observedAt: checkpoint.observedAt,
    attemptId: checkpoint.attemptId,
    expectedRowCount: checkpoint.expectedRowCount,
    counts: safeCounts(checkpoint.counts),
  };
}

function safeRowLinks(
  rowLinks: KrossDryRunAttemptReceipt["rowLinks"],
): KrossDryRunAttemptReceipt["rowLinks"] {
  return rowLinks.map(({ ordinal, runKey, recordHash }) => ({
    ordinal,
    runKey,
    recordHash,
  }));
}

function safeRequestFingerprint(evidence: {
  feedKey: string;
  artifactHash: string;
  sourceAsOf: string;
  observedAt: string;
  expectedRowCount: number;
  rowLinks: KrossDryRunAttemptReceipt["rowLinks"];
}) {
  return JSON.stringify({
    version: 1,
    feedKey: evidence.feedKey,
    artifactHash: evidence.artifactHash,
    sourceAsOf: evidence.sourceAsOf,
    observedAt: evidence.observedAt,
    expectedRowCount: evidence.expectedRowCount,
    rowLinks: safeRowLinks(evidence.rowLinks),
  });
}

function safeReceipt(
  receipt: KrossDryRunAttemptReceipt,
): KrossDryRunAttemptReceipt {
  return {
    receiptKey: receipt.receiptKey,
    requestFingerprint: safeRequestFingerprint(receipt),
    attemptId: receipt.attemptId,
    feedKey: receipt.feedKey,
    artifactHash: receipt.artifactHash,
    sourceAsOf: receipt.sourceAsOf,
    observedAt: receipt.observedAt,
    recordedAt: receipt.recordedAt,
    expectedRowCount: receipt.expectedRowCount,
    rowLinks: safeRowLinks(receipt.rowLinks),
    status: receipt.status,
    operation: receipt.operation,
    counts: safeCounts(receipt.counts),
    failureReason: receipt.failureReason,
    checkpointAdvanced: receipt.checkpointAdvanced,
    quarantineKeys: [...receipt.quarantineKeys],
    payloadStored: false,
    readOnly: true,
    pmsWriteCount: 0,
  };
}

function safeQuarantine(
  evidence: KrossDryRunQuarantineEvidence,
  requestFingerprint: string,
): KrossDryRunQuarantineEvidence {
  return {
    quarantineKey: evidence.quarantineKey,
    receiptKey: evidence.receiptKey,
    requestFingerprint,
    attemptId: evidence.attemptId,
    feedKey: evidence.feedKey,
    artifactHash: evidence.artifactHash,
    sourceAsOf: evidence.sourceAsOf,
    observedAt: evidence.observedAt,
    recordedAt: evidence.recordedAt,
    reason: evidence.reason,
    rowLinks: safeRowLinks(evidence.rowLinks),
    payloadStored: false,
    piiStored: false,
    readOnly: true,
    pmsWriteCount: 0,
  };
}

function safeLease(lease: KrossDryRunFeedWriterLease) {
  return {
    feedKey: lease.feedKey,
    writerId: lease.writerId,
    leaseId: lease.leaseId,
    fencingToken: lease.fencingToken,
    acquiredAt: lease.acquiredAt,
    expiresAt: lease.expiresAt,
  };
}

function scopeShape(
  scope: KrossSupabaseAdapterScope,
  currentFeedKey: string,
): KrossSupabaseAtomicWriteCommonV1["scope"] | null {
  const normalized = normalizedScope(scope);
  const expectedFeedKey = canonicalFeedKey(scope);
  if (!normalized || !expectedFeedKey || currentFeedKey !== expectedFeedKey) {
    return null;
  }
  return {
    ...normalized,
    feedKey: expectedFeedKey,
    sourceSystem: "Kross",
    snapshotKind: "reservation_mirror",
  };
}

function leaseAndReceiptMatchFeed(
  feedKey: string,
  lease: KrossDryRunFeedWriterLease,
  receipt: KrossDryRunAttemptReceipt,
) {
  return (
    lease.feedKey === feedKey &&
    receipt.feedKey === feedKey &&
    receipt.receiptKey ===
      `${feedKey}::attempt=${encodedKeyPart(receipt.attemptId)}` &&
    lease.writerId.trim() === lease.writerId &&
    lease.writerId.length > 0 &&
    lease.leaseId.trim() === lease.leaseId &&
    lease.leaseId.length > 0 &&
    Number.isSafeInteger(lease.fencingToken) &&
    lease.fencingToken > 0
  );
}

function importRunMatchesScope(
  scope: KrossSupabaseAtomicWriteCommonV1["scope"],
  run: KrossDryRunImportRunEvidence,
) {
  return (
    run.orgId === scope.orgId &&
    run.propertyId === scope.propertyId &&
    run.feed === scope.feed &&
    run.sourceSystem === "Kross" &&
    run.snapshotKind === "reservation_mirror"
  );
}

function reservationMatchesScope(
  scope: KrossSupabaseAtomicWriteCommonV1["scope"],
  reservation: NormalizedKrossReservation,
) {
  return (
    reservation.org_id === scope.orgId &&
    reservation.property_id === scope.propertyId &&
    reservation.source_record_id ===
      `${reservation.property_id}:${reservation.external_reservation_id}` &&
    reservation.source_system === "Kross" &&
    reservation.transactional_authority === "Kross" &&
    reservation.read_only_mirror
  );
}

function buildRequest<T extends Omit<KrossSupabaseAtomicWriteRequestV1, "requestId" | "requestHash">>(
  body: T,
) {
  const requestHash = sha256(body);
  const request = deepFreezeCanonical({
    ...body,
    requestId: `sha256:${requestHash}`,
    requestHash,
  }) as KrossSupabaseAtomicWriteRequestV1;
  trustedAtomicRequests.add(request);
  return request;
}

function correlation(
  feedKey: string,
  lease: KrossDryRunFeedWriterLease,
  receipt: KrossDryRunAttemptReceipt,
): KrossSupabaseAtomicWriteCommonV1["correlation"] {
  return {
    feedKey,
    attemptId: receipt.attemptId,
    writerId: lease.writerId,
    leaseId: lease.leaseId,
    fencingToken: lease.fencingToken,
    receiptKey: receipt.receiptKey,
  };
}

function proof(
  checkpoint: KrossDryRunFeedCheckpointEvidence | null,
  receipt: KrossDryRunAttemptReceipt,
  quarantine: KrossDryRunQuarantineEvidence | null,
): KrossSupabaseAtomicWriteCommonV1["proof"] {
  return {
    feedCheckpointHash: checkpoint ? sha256(checkpoint) : null,
    receiptHash: sha256(receipt),
    quarantineHash: quarantine ? sha256(quarantine) : null,
    counts: safeCounts(receipt.counts),
  };
}

function mapFeedAdmissionToKrossSupabaseRequestV1Unsafe(
  requestedScope: KrossSupabaseAdapterScope,
  admission: KrossDryRunFeedAtomicAdmission,
): KrossSupabaseRequestMapping {
  const scope = scopeShape(requestedScope, admission.feedKey);
  if (!scope) return { ok: false, errorKind: "invalid_scope" };
  if (
    !leaseAndReceiptMatchFeed(
      admission.feedKey,
      admission.lease,
      admission.attemptReceipt,
    ) ||
    admission.feedCheckpoint.feedKey !== admission.feedKey ||
    (admission.expectedFeedCheckpoint !== null &&
      admission.expectedFeedCheckpoint.feedKey !== admission.feedKey) ||
    (admission.expectedAttemptReceipt !== null &&
      admission.expectedAttemptReceipt.feedKey !== admission.feedKey) ||
    admission.mirrors.some(
      ({ reservation }) => !reservationMatchesScope(scope, reservation),
    ) ||
    admission.expectedMirrors.some(
      ({ expected }) => expected && !reservationMatchesScope(scope, expected),
    ) ||
    admission.importRuns.some(
      ({ evidence }) => !importRunMatchesScope(scope, evidence),
    ) ||
    admission.expectedImportRuns.some(
      ({ expected }) => expected && !importRunMatchesScope(scope, expected),
    )
  ) {
    return { ok: false, errorKind: "invalid_scope" };
  }

  const expected: KrossSupabaseFeedExpectedV1 = {
    feedCheckpoint: admission.expectedFeedCheckpoint
      ? safeFeedCheckpoint(admission.expectedFeedCheckpoint)
      : null,
    attemptReceipt: admission.expectedAttemptReceipt
      ? safeReceipt(admission.expectedAttemptReceipt)
      : null,
    mirrors: admission.expectedMirrors.map(({ identityKey, expected }) => ({
      identityKey,
      expected: expected ? safeReservation(expected) : null,
    })),
    importRuns: admission.expectedImportRuns.map(({ runKey, expected }) => ({
      runKey,
      expected: expected ? safeImportRun(expected) : null,
    })),
    checkpoints: admission.expectedCheckpoints.map(
      ({ identityKey, expected }) => ({
        identityKey,
        expected: expected ? safeCheckpoint(expected) : null,
      }),
    ),
  };
  const writeSet: KrossSupabaseFeedWriteSetV1 = {
    mirrors: admission.mirrors.map(({ identityKey, reservation }) => ({
      identityKey,
      reservation: safeReservation(reservation),
    })),
    importRuns: admission.importRuns.map(({ runKey, evidence }) => ({
      runKey,
      evidence: safeImportRun(evidence),
    })),
    checkpoints: admission.checkpoints.map(({ identityKey, checkpoint }) => ({
      identityKey,
      checkpoint: safeCheckpoint(checkpoint),
    })),
    feedCheckpoint: safeFeedCheckpoint(admission.feedCheckpoint),
    attemptReceipt: safeReceipt(admission.attemptReceipt),
  };
  const lease = safeLease(admission.lease);
  const body = {
    contractVersion: "kross.supabase.atomic-write.v1" as const,
    operation: "commit_feed" as const,
    scope,
    correlation: correlation(admission.feedKey, lease, writeSet.attemptReceipt),
    expected,
    writeSet,
    proof: proof(writeSet.feedCheckpoint, writeSet.attemptReceipt, null),
  };
  const request = buildRequest(body);
  return validateKrossSupabaseAtomicWriteRequestV1(request)
    ? { ok: true, request }
    : { ok: false, errorKind: "invalid_scope" };
}

export function mapFeedAdmissionToKrossSupabaseRequestV1(
  requestedScope: KrossSupabaseAdapterScope,
  admission: KrossDryRunFeedAtomicAdmission,
): KrossSupabaseRequestMapping {
  try {
    return mapFeedAdmissionToKrossSupabaseRequestV1Unsafe(
      requestedScope,
      admission,
    );
  } catch {
    return { ok: false, errorKind: "invalid_request" };
  }
}

function mapAttemptEvidenceToKrossSupabaseRequestV1Unsafe(
  requestedScope: KrossSupabaseAdapterScope,
  admission: KrossDryRunAttemptEvidenceAdmission,
): KrossSupabaseRequestMapping {
  const scope = scopeShape(requestedScope, admission.receipt.feedKey);
  if (!scope) return { ok: false, errorKind: "invalid_scope" };
  if (
    !leaseAndReceiptMatchFeed(
      admission.receipt.feedKey,
      admission.lease,
      admission.receipt,
    ) ||
    (admission.expectedReceipt !== null &&
      admission.expectedReceipt.feedKey !== admission.receipt.feedKey) ||
    (admission.quarantine !== null &&
      admission.quarantine.feedKey !== admission.receipt.feedKey)
  ) {
    return { ok: false, errorKind: "invalid_scope" };
  }

  const receipt = safeReceipt(admission.receipt);
  const quarantine = admission.quarantine
    ? safeQuarantine(admission.quarantine, receipt.requestFingerprint)
    : null;
  const lease = safeLease(admission.lease);
  const body = {
    contractVersion: "kross.supabase.atomic-write.v1" as const,
    operation: "append_attempt_evidence" as const,
    scope,
    correlation: correlation(receipt.feedKey, lease, receipt),
    expected: {
      receipt: admission.expectedReceipt
        ? safeReceipt(admission.expectedReceipt)
        : null,
    },
    writeSet: { receipt, quarantine },
    proof: proof(null, receipt, quarantine),
  };
  const request = buildRequest(body);
  return validateKrossSupabaseAtomicWriteRequestV1(request)
    ? { ok: true, request }
    : { ok: false, errorKind: "invalid_scope" };
}

export function mapAttemptEvidenceToKrossSupabaseRequestV1(
  requestedScope: KrossSupabaseAdapterScope,
  admission: KrossDryRunAttemptEvidenceAdmission,
): KrossSupabaseRequestMapping {
  try {
    return mapAttemptEvidenceToKrossSupabaseRequestV1Unsafe(
      requestedScope,
      admission,
    );
  } catch {
    return { ok: false, errorKind: "invalid_request" };
  }
}

function exactKeys(value: Record<string, unknown>, keys: string[]) {
  try {
    const names = Object.getOwnPropertyNames(value);
    return (
      Object.getOwnPropertySymbols(value).length === 0 &&
      names.length === keys.length &&
      keys.every((key) => names.includes(key))
    );
  } catch {
    return false;
  }
}

const forbiddenKeys = new Set([
  "payload",
  "sourceReference",
  "guestName",
  "guest_name",
  "phone",
  "email",
  "service_role",
  "access_token",
  "refresh_token",
  "cookie",
  "secret",
  "token",
]);

function containsForbiddenKey(
  value: unknown,
  state: { seen: WeakSet<object>; nodes: number } = {
    seen: new WeakSet<object>(),
    nodes: 0,
  },
  depth = 0,
): boolean {
  state.nodes += 1;
  if (depth > maxCanonicalDepth || state.nodes > maxCanonicalNodes) return true;
  if (Array.isArray(value)) {
    if (!denseArray(value) || state.seen.has(value)) return true;
    state.seen.add(value);
    try {
      return value.some((nested) =>
        containsForbiddenKey(nested, state, depth + 1),
      );
    } finally {
      state.seen.delete(value);
    }
  }
  if (!record(value)) return false;
  if (state.seen.has(value)) return true;
  state.seen.add(value);
  try {
    return Object.entries(value).some(
      ([key, nested]) =>
        forbiddenKeys.has(key) ||
        containsForbiddenKey(nested, state, depth + 1),
    );
  } catch {
    return true;
  } finally {
    state.seen.delete(value);
  }
}

const sha256Pattern = /^[a-f0-9]{64}$/;
const reservationKeys = [
  "org_id",
  "property_id",
  "external_reservation_id",
  "reservation_key",
  "room_id",
  "room_code_raw",
  "check_in",
  "check_out",
  "status",
  "guests_count",
  "adults",
  "children",
  "channel",
  "breakfast_included",
  "transactional_authority",
  "read_only_mirror",
  "source_is_live",
  "source_system",
  "source_table",
  "source_record_id",
  "snapshot_as_of",
  "last_synced_at",
  "source_hash",
  "data_quality_status",
];
const importRunKeys = [
  "runKey",
  "mode",
  "status",
  "operation",
  "identityKey",
  "orgId",
  "propertyId",
  "sourceSystem",
  "snapshotKind",
  "feed",
  "artifactHash",
  "recordHash",
  "attemptId",
  "sourceAsOf",
  "observedAt",
  "quarantineReason",
  "readOnly",
  "pmsWriteCount",
];
const checkpointKeys = ["identityKey", "runKey", "sourceAsOf", "recordHash"];
const countsKeys = [
  "read",
  "accepted",
  "rejected",
  "unchanged",
  "changed",
  "conflict",
];
const rowLinkKeys = ["ordinal", "runKey", "recordHash"];
const feedCheckpointKeys = [
  "feedKey",
  "artifactHash",
  "sourceAsOf",
  "observedAt",
  "attemptId",
  "expectedRowCount",
  "counts",
];
const receiptKeys = [
  "receiptKey",
  "requestFingerprint",
  "attemptId",
  "feedKey",
  "artifactHash",
  "sourceAsOf",
  "observedAt",
  "recordedAt",
  "expectedRowCount",
  "rowLinks",
  "status",
  "operation",
  "counts",
  "failureReason",
  "checkpointAdvanced",
  "quarantineKeys",
  "payloadStored",
  "readOnly",
  "pmsWriteCount",
];
const quarantineKeys = [
  "quarantineKey",
  "receiptKey",
  "requestFingerprint",
  "attemptId",
  "feedKey",
  "artifactHash",
  "sourceAsOf",
  "observedAt",
  "recordedAt",
  "reason",
  "rowLinks",
  "payloadStored",
  "piiStored",
  "readOnly",
  "pmsWriteCount",
];

const importRunOperations = new Set([
  "insert",
  "update",
  "replay",
  "reject",
  "quarantine",
  "conflict",
]);
const feedOperations = new Set(["promote", "replay", "reject", "conflict"]);
const feedFailureReasons = new Set([
  "invalid_batch",
  "incomplete_batch",
  "stale_source_as_of",
  "same_cut_conflict",
  "row_rejected",
  "row_conflict",
  "duplicate_identity",
  "checkpoint_changed",
  "attempt_conflict",
  "evidence_conflict",
  "lease_unavailable",
  "writer_fenced",
]);
const rejectFeedFailureReasons = new Set([
  "incomplete_batch",
  "stale_source_as_of",
  "row_rejected",
]);
const conflictFeedFailureReasons = new Set([
  "same_cut_conflict",
  "row_conflict",
  "duplicate_identity",
  "checkpoint_changed",
]);
const totalRejectFeedFailureReasons = new Set([
  "incomplete_batch",
  "stale_source_as_of",
]);
const totalConflictFeedFailureReasons = new Set([
  "same_cut_conflict",
  "checkpoint_changed",
]);
const rowQuarantineReasons = new Set([
  "stale_source_as_of",
  "same_cut_conflict",
  "checkpoint_changed",
]);

function exactRecord(value: unknown, keys: string[]) {
  return record(value) && exactKeys(value, keys) ? value : null;
}

function canonicalString(value: unknown): value is string {
  return (
    typeof value === "string" && value.length > 0 && value.trim() === value
  );
}

function nullableCanonicalString(value: unknown): value is string | null {
  return value === null || canonicalString(value);
}

function finiteTimestamp(value: unknown): value is string {
  return canonicalString(value) && Number.isFinite(Date.parse(value));
}

function nullableNonNegativeInteger(value: unknown): value is number | null {
  return value === null || (Number.isSafeInteger(value) && Number(value) >= 0);
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function isCounts(value: unknown): value is KrossDryRunFeedCounts {
  const candidate = exactRecord(value, countsKeys);
  if (!candidate || !countsKeys.every((key) => nonNegativeInteger(candidate[key]))) {
    return false;
  }
  const counts = candidate as KrossDryRunFeedCounts;
  return (
    counts.read === counts.accepted + counts.rejected &&
    counts.accepted === counts.unchanged + counts.changed &&
    counts.conflict <= counts.rejected
  );
}

function isSafeReservation(
  value: unknown,
): value is KrossSupabaseSafeReservationWriteV1 {
  const candidate = exactRecord(value, reservationKeys);
  return Boolean(
    candidate &&
      typeof candidate.org_id === "string" &&
      uuidPattern.test(candidate.org_id) &&
      typeof candidate.property_id === "string" &&
      uuidPattern.test(candidate.property_id) &&
      canonicalString(candidate.external_reservation_id) &&
      nullableCanonicalString(candidate.reservation_key) &&
      nullableCanonicalString(candidate.room_id) &&
      nullableCanonicalString(candidate.room_code_raw) &&
      canonicalString(candidate.check_in) &&
      canonicalString(candidate.check_out) &&
      canonicalString(candidate.status) &&
      nullableNonNegativeInteger(candidate.guests_count) &&
      nullableNonNegativeInteger(candidate.adults) &&
      nullableNonNegativeInteger(candidate.children) &&
      nullableCanonicalString(candidate.channel) &&
      (candidate.breakfast_included === null ||
        typeof candidate.breakfast_included === "boolean") &&
      candidate.transactional_authority === "Kross" &&
      candidate.read_only_mirror === true &&
      typeof candidate.source_is_live === "boolean" &&
      candidate.source_system === "Kross" &&
      candidate.source_table === "reservations" &&
      canonicalString(candidate.source_record_id) &&
      finiteTimestamp(candidate.snapshot_as_of) &&
      finiteTimestamp(candidate.last_synced_at) &&
      typeof candidate.source_hash === "string" &&
      sha256Pattern.test(candidate.source_hash) &&
      (candidate.data_quality_status === "verified" ||
        candidate.data_quality_status === "review"),
  );
}

function isSafeImportRun(
  value: unknown,
): value is KrossSupabaseSafeImportRunV1 {
  const candidate = exactRecord(value, importRunKeys);
  return Boolean(
    candidate &&
      canonicalString(candidate.runKey) &&
      candidate.mode === "dry_run" &&
      (candidate.status === "accepted" || candidate.status === "rejected") &&
      typeof candidate.operation === "string" &&
      importRunOperations.has(candidate.operation) &&
      nullableCanonicalString(candidate.identityKey) &&
      typeof candidate.orgId === "string" &&
      uuidPattern.test(candidate.orgId) &&
      typeof candidate.propertyId === "string" &&
      uuidPattern.test(candidate.propertyId) &&
      candidate.sourceSystem === "Kross" &&
      candidate.snapshotKind === "reservation_mirror" &&
      canonicalString(candidate.feed) &&
      typeof candidate.artifactHash === "string" &&
      sha256Pattern.test(candidate.artifactHash) &&
      typeof candidate.recordHash === "string" &&
      sha256Pattern.test(candidate.recordHash) &&
      canonicalString(candidate.attemptId) &&
      finiteTimestamp(candidate.sourceAsOf) &&
      finiteTimestamp(candidate.observedAt) &&
      (candidate.quarantineReason === null ||
        (typeof candidate.quarantineReason === "string" &&
          rowQuarantineReasons.has(candidate.quarantineReason))) &&
      candidate.readOnly === true &&
      candidate.pmsWriteCount === 0,
  );
}

function isCheckpoint(
  value: unknown,
): value is KrossDryRunCheckpointEvidence {
  const candidate = exactRecord(value, checkpointKeys);
  return Boolean(
    candidate &&
      canonicalString(candidate.identityKey) &&
      canonicalString(candidate.runKey) &&
      finiteTimestamp(candidate.sourceAsOf) &&
      typeof candidate.recordHash === "string" &&
      sha256Pattern.test(candidate.recordHash),
  );
}

function isRowLinkShape(value: unknown) {
  const candidate = exactRecord(value, rowLinkKeys);
  return Boolean(
    candidate &&
      nonNegativeInteger(candidate.ordinal) &&
      ((candidate.runKey === null && candidate.recordHash === null) ||
        (canonicalString(candidate.runKey) &&
          typeof candidate.recordHash === "string" &&
          sha256Pattern.test(candidate.recordHash))),
  );
}

function isFeedCheckpoint(
  value: unknown,
): value is KrossDryRunFeedCheckpointEvidence {
  const candidate = exactRecord(value, feedCheckpointKeys);
  return Boolean(
    candidate &&
      canonicalString(candidate.feedKey) &&
      typeof candidate.artifactHash === "string" &&
      sha256Pattern.test(candidate.artifactHash) &&
      finiteTimestamp(candidate.sourceAsOf) &&
      finiteTimestamp(candidate.observedAt) &&
      canonicalString(candidate.attemptId) &&
      nonNegativeInteger(candidate.expectedRowCount) &&
      isCounts(candidate.counts),
  );
}

function isReceipt(value: unknown): value is KrossDryRunAttemptReceipt {
  const candidate = exactRecord(value, receiptKeys);
  return Boolean(
    candidate &&
      canonicalString(candidate.receiptKey) &&
      canonicalString(candidate.requestFingerprint) &&
      canonicalString(candidate.attemptId) &&
      canonicalString(candidate.feedKey) &&
      typeof candidate.artifactHash === "string" &&
      sha256Pattern.test(candidate.artifactHash) &&
      finiteTimestamp(candidate.sourceAsOf) &&
      finiteTimestamp(candidate.observedAt) &&
      finiteTimestamp(candidate.recordedAt) &&
      nonNegativeInteger(candidate.expectedRowCount) &&
      denseArray(candidate.rowLinks) &&
      candidate.rowLinks.every(isRowLinkShape) &&
      (candidate.status === "accepted" || candidate.status === "rejected") &&
      typeof candidate.operation === "string" &&
      feedOperations.has(candidate.operation) &&
      isCounts(candidate.counts) &&
      (candidate.failureReason === null ||
        (typeof candidate.failureReason === "string" &&
          feedFailureReasons.has(candidate.failureReason))) &&
      typeof candidate.checkpointAdvanced === "boolean" &&
      denseArray(candidate.quarantineKeys) &&
      candidate.quarantineKeys.every(canonicalString) &&
      candidate.payloadStored === false &&
      candidate.readOnly === true &&
      candidate.pmsWriteCount === 0,
  );
}

function isQuarantine(
  value: unknown,
): value is KrossDryRunQuarantineEvidence {
  const candidate = exactRecord(value, quarantineKeys);
  return Boolean(
    candidate &&
      canonicalString(candidate.quarantineKey) &&
      canonicalString(candidate.receiptKey) &&
      canonicalString(candidate.requestFingerprint) &&
      canonicalString(candidate.attemptId) &&
      canonicalString(candidate.feedKey) &&
      typeof candidate.artifactHash === "string" &&
      sha256Pattern.test(candidate.artifactHash) &&
      finiteTimestamp(candidate.sourceAsOf) &&
      finiteTimestamp(candidate.observedAt) &&
      finiteTimestamp(candidate.recordedAt) &&
      typeof candidate.reason === "string" &&
      feedFailureReasons.has(candidate.reason) &&
      denseArray(candidate.rowLinks) &&
      candidate.rowLinks.every(isRowLinkShape) &&
      candidate.payloadStored === false &&
      candidate.piiStored === false &&
      candidate.readOnly === true &&
      candidate.pmsWriteCount === 0,
  );
}

function canonicalIdentity(reservation: KrossSupabaseSafeReservationWriteV1) {
  return [
    reservation.org_id,
    reservation.property_id,
    reservation.external_reservation_id,
  ].join(":");
}

function canonicalRunKey(
  feedKey: string,
  artifactHash: string,
  recordHash: string,
) {
  return `${feedKey}::artifact=${encodedKeyPart(artifactHash)}::record=${encodedKeyPart(recordHash)}`;
}

function receiptFingerprint(receipt: KrossDryRunAttemptReceipt) {
  return {
    version: 1,
    feedKey: receipt.feedKey,
    artifactHash: receipt.artifactHash,
    sourceAsOf: receipt.sourceAsOf,
    observedAt: receipt.observedAt,
    expectedRowCount: receipt.expectedRowCount,
    rowLinks: receipt.rowLinks,
  };
}

function requestFingerprintMatches(receipt: KrossDryRunAttemptReceipt) {
  try {
    return receipt.requestFingerprint === JSON.stringify(receiptFingerprint(receipt));
  } catch {
    return false;
  }
}

function rowLinksAreCanonical(receipt: KrossDryRunAttemptReceipt) {
  return receipt.rowLinks.every((link, ordinal) => {
    if (link.ordinal !== ordinal) return false;
    if (link.runKey === null || link.recordHash === null) {
      return link.runKey === null && link.recordHash === null;
    }
    return (
      link.runKey ===
      canonicalRunKey(receipt.feedKey, receipt.artifactHash, link.recordHash)
    );
  });
}

function receiptMatchesScope(
  receipt: KrossDryRunAttemptReceipt,
  scope: KrossSupabaseAtomicWriteCommonV1["scope"],
) {
  return (
    receipt.feedKey === scope.feedKey &&
    receipt.receiptKey ===
      `${scope.feedKey}::attempt=${encodedKeyPart(receipt.attemptId)}` &&
    requestFingerprintMatches(receipt) &&
    receipt.counts.read === receipt.rowLinks.length &&
    rowLinksAreCanonical(receipt)
  );
}

function feedCheckpointMatchesScope(
  checkpoint: KrossDryRunFeedCheckpointEvidence,
  scope: KrossSupabaseAtomicWriteCommonV1["scope"],
) {
  return checkpoint.feedKey === scope.feedKey;
}

function importRunMatchesRequestScope(
  run: KrossSupabaseSafeImportRunV1,
  scope: KrossSupabaseAtomicWriteCommonV1["scope"],
) {
  return (
    importRunMatchesScope(scope, run as KrossDryRunImportRunEvidence) &&
    run.runKey === canonicalRunKey(scope.feedKey, run.artifactHash, run.recordHash)
  );
}

function checkpointRunKeyIsCanonical(
  checkpoint: KrossDryRunCheckpointEvidence,
  feedKey: string,
) {
  const prefix = `${feedKey}::artifact=`;
  const marker = "::record=";
  if (!checkpoint.runKey.startsWith(prefix)) return false;
  const remainder = checkpoint.runKey.slice(prefix.length);
  const markerIndex = remainder.indexOf(marker);
  if (markerIndex <= 0 || remainder.indexOf(marker, markerIndex + 1) !== -1) {
    return false;
  }
  const artifactHash = remainder.slice(0, markerIndex);
  return (
    sha256Pattern.test(artifactHash) &&
    checkpoint.runKey ===
      canonicalRunKey(feedKey, artifactHash, checkpoint.recordHash)
  );
}

function uniqueStrings(values: string[]) {
  return new Set(values).size === values.length;
}

function sameEvidence(left: unknown, right: unknown) {
  return canonicalJson(left) === canonicalJson(right);
}

function isFeedExpectedShape(value: unknown): value is KrossSupabaseFeedExpectedV1 {
  const candidate = exactRecord(value, [
    "feedCheckpoint",
    "attemptReceipt",
    "mirrors",
    "importRuns",
    "checkpoints",
  ]);
  return Boolean(
    candidate &&
      (candidate.feedCheckpoint === null || isFeedCheckpoint(candidate.feedCheckpoint)) &&
      (candidate.attemptReceipt === null || isReceipt(candidate.attemptReceipt)) &&
      denseArray(candidate.mirrors) &&
      candidate.mirrors.every((item) => {
        const entry = exactRecord(item, ["identityKey", "expected"]);
        return Boolean(
          entry &&
            canonicalString(entry.identityKey) &&
            (entry.expected === null || isSafeReservation(entry.expected)),
        );
      }) &&
      denseArray(candidate.importRuns) &&
      candidate.importRuns.every((item) => {
        const entry = exactRecord(item, ["runKey", "expected"]);
        return Boolean(
          entry &&
            canonicalString(entry.runKey) &&
            (entry.expected === null || isSafeImportRun(entry.expected)),
        );
      }) &&
      denseArray(candidate.checkpoints) &&
      candidate.checkpoints.every((item) => {
        const entry = exactRecord(item, ["identityKey", "expected"]);
        return Boolean(
          entry &&
            canonicalString(entry.identityKey) &&
            (entry.expected === null || isCheckpoint(entry.expected)),
        );
      }),
  );
}

function isFeedWriteSetShape(value: unknown): value is KrossSupabaseFeedWriteSetV1 {
  const candidate = exactRecord(value, [
    "mirrors",
    "importRuns",
    "checkpoints",
    "feedCheckpoint",
    "attemptReceipt",
  ]);
  return Boolean(
    candidate &&
      denseArray(candidate.mirrors) &&
      candidate.mirrors.every((item) => {
        const entry = exactRecord(item, ["identityKey", "reservation"]);
        return Boolean(
          entry &&
            canonicalString(entry.identityKey) &&
            isSafeReservation(entry.reservation),
        );
      }) &&
      denseArray(candidate.importRuns) &&
      candidate.importRuns.every((item) => {
        const entry = exactRecord(item, ["runKey", "evidence"]);
        return Boolean(
          entry &&
            canonicalString(entry.runKey) &&
            isSafeImportRun(entry.evidence),
        );
      }) &&
      denseArray(candidate.checkpoints) &&
      candidate.checkpoints.every((item) => {
        const entry = exactRecord(item, ["identityKey", "checkpoint"]);
        return Boolean(
          entry &&
            canonicalString(entry.identityKey) &&
            isCheckpoint(entry.checkpoint),
        );
      }) &&
      isFeedCheckpoint(candidate.feedCheckpoint) &&
      isReceipt(candidate.attemptReceipt),
  );
}

function feedRequestRelationshipsAreValid(
  request: Extract<KrossSupabaseAtomicWriteRequestV1, { operation: "commit_feed" }>,
) {
  const { scope, correlation, expected, writeSet } = request;
  const receipt = writeSet.attemptReceipt;
  const checkpoint = writeSet.feedCheckpoint;
  if (
    !receiptMatchesScope(receipt, scope) ||
    !feedCheckpointMatchesScope(checkpoint, scope) ||
    correlation.attemptId !== receipt.attemptId ||
    correlation.receiptKey !== receipt.receiptKey ||
    checkpoint.artifactHash !== receipt.artifactHash ||
    checkpoint.sourceAsOf !== receipt.sourceAsOf ||
    checkpoint.observedAt !== receipt.observedAt ||
    checkpoint.attemptId !== receipt.attemptId ||
    checkpoint.expectedRowCount !== receipt.expectedRowCount ||
    !sameEvidence(checkpoint.counts, receipt.counts) ||
    Date.parse(checkpoint.sourceAsOf) > Date.parse(checkpoint.observedAt) ||
    Date.parse(receipt.observedAt) > Date.parse(receipt.recordedAt) ||
    receipt.status !== "accepted" ||
    receipt.operation !== "promote" ||
    receipt.failureReason !== null ||
    !receipt.checkpointAdvanced ||
    receipt.quarantineKeys.length !== 0 ||
    receipt.expectedRowCount !== receipt.rowLinks.length ||
    receipt.counts.accepted !== receipt.counts.read ||
    receipt.counts.rejected !== 0 ||
    receipt.counts.conflict !== 0
  ) {
    return false;
  }

  if (
    (expected.feedCheckpoint !== null &&
      (!feedCheckpointMatchesScope(expected.feedCheckpoint, scope) ||
        Date.parse(expected.feedCheckpoint.sourceAsOf) >
          Date.parse(expected.feedCheckpoint.observedAt) ||
        Date.parse(checkpoint.sourceAsOf) <=
          Date.parse(expected.feedCheckpoint.sourceAsOf))) ||
    expected.attemptReceipt !== null
  ) {
    return false;
  }

  const mirrors = new Map<string, KrossSupabaseSafeReservationWriteV1>();
  for (const entry of writeSet.mirrors) {
    if (
      entry.identityKey !== canonicalIdentity(entry.reservation) ||
      !reservationMatchesScope(scope, entry.reservation) ||
      mirrors.has(entry.identityKey)
    ) {
      return false;
    }
    mirrors.set(entry.identityKey, entry.reservation);
  }

  const expectedMirrors = new Map<
    string,
    KrossSupabaseSafeReservationWriteV1 | null
  >();
  for (const entry of expected.mirrors) {
    if (
      expectedMirrors.has(entry.identityKey) ||
      (entry.expected
        ? entry.identityKey !== canonicalIdentity(entry.expected) ||
          !reservationMatchesScope(scope, entry.expected)
        : !mirrors.has(entry.identityKey))
    ) {
      return false;
    }
    expectedMirrors.set(entry.identityKey, entry.expected);
  }
  if ([...mirrors.keys()].some((identityKey) => !expectedMirrors.has(identityKey))) {
    return false;
  }

  const runs = new Map<string, KrossSupabaseSafeImportRunV1>();
  for (const entry of writeSet.importRuns) {
    const run = entry.evidence;
    if (
      entry.runKey !== run.runKey ||
      !importRunMatchesRequestScope(run, scope) ||
      run.artifactHash !== checkpoint.artifactHash ||
      run.attemptId !== checkpoint.attemptId ||
      run.sourceAsOf !== checkpoint.sourceAsOf ||
      run.observedAt !== checkpoint.observedAt ||
      run.status !== "accepted" ||
      run.identityKey === null ||
      run.quarantineReason !== null ||
      (run.operation !== "insert" &&
        run.operation !== "update" &&
        run.operation !== "replay") ||
      runs.has(entry.runKey)
    ) {
      return false;
    }
    runs.set(entry.runKey, run);
  }

  const expectedRuns = new Map<string, KrossSupabaseSafeImportRunV1 | null>();
  for (const entry of expected.importRuns) {
    const run = entry.expected;
    if (
      expectedRuns.has(entry.runKey) ||
      (run
        ? entry.runKey !== run.runKey ||
          !importRunMatchesRequestScope(run, scope) ||
          run.status !== "accepted" ||
          run.identityKey === null ||
          run.quarantineReason !== null ||
          (run.operation !== "insert" &&
            run.operation !== "update" &&
            run.operation !== "replay")
        : !runs.has(entry.runKey))
    ) {
      return false;
    }
    expectedRuns.set(entry.runKey, run);
  }
  if (
    [...runs.keys()].some(
      (runKey) => !expectedRuns.has(runKey) || expectedRuns.get(runKey) !== null,
    )
  ) {
    return false;
  }

  const checkpoints = new Map<string, KrossDryRunCheckpointEvidence>();
  for (const entry of writeSet.checkpoints) {
    const rowCheckpoint = entry.checkpoint;
    const reservation = mirrors.get(entry.identityKey);
    const run = runs.get(rowCheckpoint.runKey);
    if (
      checkpoints.has(entry.identityKey) ||
      entry.identityKey !== rowCheckpoint.identityKey ||
      !checkpointRunKeyIsCanonical(rowCheckpoint, scope.feedKey) ||
      !reservation ||
      !run ||
      run.identityKey !== entry.identityKey ||
      rowCheckpoint.recordHash !== run.recordHash ||
      rowCheckpoint.recordHash !== reservation.source_hash ||
      rowCheckpoint.sourceAsOf !== run.sourceAsOf ||
      rowCheckpoint.sourceAsOf !== reservation.snapshot_as_of
    ) {
      return false;
    }
    checkpoints.set(entry.identityKey, rowCheckpoint);
  }

  const expectedCheckpoints = new Map<
    string,
    KrossDryRunCheckpointEvidence | null
  >();
  for (const entry of expected.checkpoints) {
    const rowCheckpoint = entry.expected;
    const reservation = expectedMirrors.get(entry.identityKey);
    if (
      expectedCheckpoints.has(entry.identityKey) ||
      (rowCheckpoint
        ? entry.identityKey !== rowCheckpoint.identityKey ||
          !checkpointRunKeyIsCanonical(rowCheckpoint, scope.feedKey) ||
          !reservation ||
          reservation.source_hash !== rowCheckpoint.recordHash ||
          reservation.snapshot_as_of !== rowCheckpoint.sourceAsOf
        : !checkpoints.has(entry.identityKey))
    ) {
      return false;
    }
    expectedCheckpoints.set(entry.identityKey, rowCheckpoint);
  }
  if (
    [...checkpoints.keys()].some(
      (identityKey) => !expectedCheckpoints.has(identityKey),
    )
  ) {
    return false;
  }

  const linkedRunKeys = receipt.rowLinks.map((link) => link.runKey);
  if (
    linkedRunKeys.some((runKey): runKey is null => runKey === null) ||
    !uniqueStrings(linkedRunKeys as string[]) ||
    expectedRuns.size !== linkedRunKeys.length ||
    [...runs.keys()].some((runKey) => !linkedRunKeys.includes(runKey)) ||
    [...expectedRuns.keys()].some((runKey) => !linkedRunKeys.includes(runKey))
  ) {
    return false;
  }

  const linkedIdentityKeys = new Set<string>();
  const changedIdentityKeys = new Set<string>();
  let derivedChanged = 0;
  let derivedUnchanged = 0;
  const linksAreValid = receipt.rowLinks.every((link) => {
    if (!link.runKey || !link.recordHash) return false;
    const stagedRun = runs.get(link.runKey);
    const run = stagedRun ?? expectedRuns.get(link.runKey);
    if (
      !run ||
      run.status !== "accepted" ||
      !run.identityKey ||
      !importRunMatchesRequestScope(run, scope) ||
      run.artifactHash !== receipt.artifactHash ||
      run.recordHash !== link.recordHash ||
      run.sourceAsOf !== checkpoint.sourceAsOf ||
      Date.parse(run.sourceAsOf) > Date.parse(run.observedAt) ||
      linkedIdentityKeys.has(run.identityKey)
    ) {
      return false;
    }
    linkedIdentityKeys.add(run.identityKey);
    if (!expectedMirrors.has(run.identityKey)) return false;
    const priorMirror = expectedMirrors.get(run.identityKey) ?? null;
    const writtenMirror = mirrors.get(run.identityKey);
    const postMirror = writtenMirror ?? priorMirror;
    if (!expectedCheckpoints.has(run.identityKey)) return false;
    const priorCheckpoint = expectedCheckpoints.get(run.identityKey) ?? null;
    const writtenCheckpoint = checkpoints.get(run.identityKey);
    const postCheckpoint = writtenCheckpoint ?? priorCheckpoint;
    if (
      !postMirror ||
      !postCheckpoint ||
      (priorMirror === null) !== (priorCheckpoint === null) ||
      (writtenMirror === undefined) !== (writtenCheckpoint === undefined) ||
      !reservationMatchesScope(scope, postMirror) ||
      postMirror.source_hash !== run.recordHash ||
      postMirror.snapshot_as_of !== run.sourceAsOf ||
      Date.parse(postMirror.snapshot_as_of) >
        Date.parse(postMirror.last_synced_at) ||
      postCheckpoint.identityKey !== run.identityKey ||
      (writtenCheckpoint !== undefined &&
        postCheckpoint.runKey !== link.runKey) ||
      postCheckpoint.recordHash !== run.recordHash ||
      postCheckpoint.sourceAsOf !== run.sourceAsOf ||
      (writtenMirror !== undefined &&
        writtenMirror.last_synced_at !== run.observedAt)
    ) {
      return false;
    }

    if (priorMirror === null) {
      if (
        !stagedRun ||
        stagedRun.operation !== "insert" ||
        writtenMirror === undefined ||
        writtenCheckpoint === undefined
      ) {
        return false;
      }
    } else {
      const runSourceTime = Date.parse(run.sourceAsOf);
      const priorSourceTime = Date.parse(priorMirror.snapshot_as_of);
      if (runSourceTime < priorSourceTime) return false;
      if (runSourceTime === priorSourceTime) {
        if (
          run.recordHash !== priorMirror.source_hash ||
          writtenMirror !== undefined ||
          writtenCheckpoint !== undefined ||
          (stagedRun !== undefined && stagedRun.operation !== "replay")
        ) {
          return false;
        }
      } else if (
        !stagedRun ||
        stagedRun.operation !== "update" ||
        writtenMirror === undefined ||
        writtenCheckpoint === undefined
      ) {
        return false;
      }
    }
    if (priorMirror === null || priorMirror.source_hash !== run.recordHash) {
      derivedChanged += 1;
      changedIdentityKeys.add(run.identityKey);
    } else {
      derivedUnchanged += 1;
    }
    return true;
  });
  if (!linksAreValid) return false;

  const mirrorKeys = new Set(mirrors.keys());
  if (
    derivedChanged !== receipt.counts.changed ||
    derivedUnchanged !== receipt.counts.unchanged ||
    mirrorKeys.size !== checkpoints.size ||
    [...mirrorKeys].some(
      (identityKey) =>
        !checkpoints.has(identityKey) ||
        !linkedIdentityKeys.has(identityKey) ||
        ![...runs.values()].some((run) => run.identityKey === identityKey),
    ) ||
    [...checkpoints.keys()].some((identityKey) => !mirrorKeys.has(identityKey)) ||
    [...changedIdentityKeys].some((identityKey) => !mirrorKeys.has(identityKey)) ||
    expectedMirrors.size !== linkedIdentityKeys.size ||
    expectedCheckpoints.size !== linkedIdentityKeys.size ||
    [...linkedIdentityKeys].some(
      (identityKey) =>
        !expectedMirrors.has(identityKey) ||
        !expectedCheckpoints.has(identityKey),
    ) ||
    [...expectedMirrors.keys()].some(
      (identityKey) => !linkedIdentityKeys.has(identityKey),
    ) ||
    [...expectedCheckpoints.keys()].some(
      (identityKey) => !linkedIdentityKeys.has(identityKey),
    )
  ) {
    return false;
  }

  return true;
}

function isAttemptExpectedShape(
  value: unknown,
): value is KrossSupabaseAttemptExpectedV1 {
  const candidate = exactRecord(value, ["receipt"]);
  return Boolean(
    candidate && (candidate.receipt === null || isReceipt(candidate.receipt)),
  );
}

function isAttemptWriteSetShape(
  value: unknown,
): value is KrossSupabaseAttemptWriteSetV1 {
  const candidate = exactRecord(value, ["receipt", "quarantine"]);
  return Boolean(
    candidate &&
      isReceipt(candidate.receipt) &&
      (candidate.quarantine === null || isQuarantine(candidate.quarantine)),
  );
}

function rejectedAttemptCountsMatch(receipt: KrossDryRunAttemptReceipt) {
  const reason = receipt.failureReason;
  if (!reason) return false;
  const counts = receipt.counts;
  if (totalRejectFeedFailureReasons.has(reason)) {
    return (
      counts.accepted === 0 &&
      counts.rejected === counts.read &&
      counts.unchanged === 0 &&
      counts.changed === 0 &&
      counts.conflict === 0
    );
  }
  if (reason === "row_rejected") {
    return counts.read > 0 && counts.rejected > 0 && counts.conflict === 0;
  }
  if (totalConflictFeedFailureReasons.has(reason)) {
    return (
      counts.accepted === 0 &&
      counts.rejected === counts.read &&
      counts.unchanged === 0 &&
      counts.changed === 0 &&
      counts.conflict === counts.read
    );
  }
  if (reason === "row_conflict" || reason === "duplicate_identity") {
    return counts.read > 0 && counts.rejected > 0 && counts.conflict > 0;
  }
  return false;
}

function attemptRequestRelationshipsAreValid(
  request: Extract<
    KrossSupabaseAtomicWriteRequestV1,
    { operation: "append_attempt_evidence" }
  >,
) {
  const { scope, correlation, expected, writeSet } = request;
  const { receipt, quarantine } = writeSet;
  if (
    !receiptMatchesScope(receipt, scope) ||
    correlation.attemptId !== receipt.attemptId ||
    correlation.receiptKey !== receipt.receiptKey ||
    Date.parse(receipt.sourceAsOf) > Date.parse(receipt.observedAt) ||
    Date.parse(receipt.observedAt) > Date.parse(receipt.recordedAt) ||
    expected.receipt !== null
  ) {
    return false;
  }
  if (!quarantine) {
    return (
      receipt.status === "accepted" &&
      receipt.operation === "replay" &&
      receipt.failureReason === null &&
      !receipt.checkpointAdvanced &&
      receipt.quarantineKeys.length === 0 &&
      receipt.expectedRowCount === receipt.rowLinks.length &&
      receipt.rowLinks.every(
        (link) => link.runKey !== null && link.recordHash !== null,
      ) &&
      receipt.counts.accepted === receipt.counts.read &&
      receipt.counts.rejected === 0 &&
      receipt.counts.conflict === 0
    );
  }
  return (
    receipt.status === "rejected" &&
    (receipt.operation === "reject" || receipt.operation === "conflict") &&
    receipt.failureReason !== null &&
    (receipt.operation === "reject"
      ? rejectFeedFailureReasons.has(receipt.failureReason) &&
        receipt.counts.conflict === 0
      : conflictFeedFailureReasons.has(receipt.failureReason) &&
        (receipt.counts.read === 0
          ? receipt.counts.conflict === 0
          : receipt.counts.conflict > 0)) &&
    rejectedAttemptCountsMatch(receipt) &&
    (receipt.failureReason === "incomplete_batch"
      ? receipt.expectedRowCount !== receipt.rowLinks.length
      : receipt.expectedRowCount === receipt.rowLinks.length) &&
    !receipt.checkpointAdvanced &&
    quarantine.quarantineKey === `${receipt.receiptKey}::quarantine=batch` &&
    quarantine.receiptKey === receipt.receiptKey &&
    quarantine.requestFingerprint === receipt.requestFingerprint &&
    quarantine.attemptId === receipt.attemptId &&
    quarantine.feedKey === receipt.feedKey &&
    quarantine.artifactHash === receipt.artifactHash &&
    quarantine.sourceAsOf === receipt.sourceAsOf &&
    quarantine.observedAt === receipt.observedAt &&
    quarantine.recordedAt === receipt.recordedAt &&
    quarantine.reason === receipt.failureReason &&
    sameEvidence(quarantine.rowLinks, receipt.rowLinks) &&
    receipt.quarantineKeys.length === 1 &&
    receipt.quarantineKeys[0] === quarantine.quarantineKey
  );
}

function validateKrossSupabaseAtomicWriteRequestV1Unsafe(
  value: unknown,
): value is KrossSupabaseAtomicWriteRequestV1 {
  if (!record(value)) return false;
  if (
    !exactKeys(value, [
      "contractVersion",
      "requestId",
      "requestHash",
      "operation",
      "scope",
      "correlation",
      "expected",
      "writeSet",
      "proof",
    ]) ||
    value.contractVersion !== "kross.supabase.atomic-write.v1" ||
    (value.operation !== "commit_feed" &&
      value.operation !== "append_attempt_evidence") ||
    typeof value.requestId !== "string" ||
    typeof value.requestHash !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.requestHash) ||
    value.requestId !== `sha256:${value.requestHash}` ||
    !record(value.scope) ||
    !record(value.correlation) ||
    !record(value.expected) ||
    !record(value.writeSet) ||
    !record(value.proof) ||
    !exactKeys(value.scope, [
      "orgId",
      "propertyId",
      "feed",
      "feedKey",
      "sourceSystem",
      "snapshotKind",
    ]) ||
    !exactKeys(value.correlation, [
      "feedKey",
      "attemptId",
      "writerId",
      "leaseId",
      "fencingToken",
      "receiptKey",
    ]) ||
    !exactKeys(value.proof, [
      "feedCheckpointHash",
      "receiptHash",
      "quarantineHash",
      "counts",
    ]) ||
    !canonicalString(value.scope.orgId) ||
    !canonicalString(value.scope.propertyId) ||
    !canonicalString(value.scope.feed) ||
    !canonicalString(value.scope.feedKey) ||
    value.scope.sourceSystem !== "Kross" ||
    value.scope.snapshotKind !== "reservation_mirror" ||
    !canonicalString(value.correlation.feedKey) ||
    !canonicalString(value.correlation.attemptId) ||
    !canonicalString(value.correlation.writerId) ||
    !canonicalString(value.correlation.leaseId) ||
    !nonNegativeInteger(value.correlation.fencingToken) ||
    value.correlation.fencingToken <= 0 ||
    !canonicalString(value.correlation.receiptKey) ||
    !isCounts(value.proof.counts) ||
    (value.proof.feedCheckpointHash !== null &&
      (typeof value.proof.feedCheckpointHash !== "string" ||
        !sha256Pattern.test(value.proof.feedCheckpointHash))) ||
    typeof value.proof.receiptHash !== "string" ||
    !sha256Pattern.test(value.proof.receiptHash) ||
    (value.proof.quarantineHash !== null &&
      (typeof value.proof.quarantineHash !== "string" ||
        !sha256Pattern.test(value.proof.quarantineHash))) ||
    containsForbiddenKey(value)
  ) {
    return false;
  }
  const body = { ...value };
  delete body.requestId;
  delete body.requestHash;
  try {
    if (sha256(body) !== value.requestHash) return false;
  } catch {
    return false;
  }
  if (
    value.operation === "commit_feed"
      ? !isFeedExpectedShape(value.expected) ||
        !isFeedWriteSetShape(value.writeSet)
      : !isAttemptExpectedShape(value.expected) ||
        !isAttemptWriteSetShape(value.writeSet)
  ) {
    return false;
  }
  const candidate = value as KrossSupabaseAtomicWriteRequestV1;
  const expectedFeedKey = canonicalFeedKey(candidate.scope);
  if (
    !expectedFeedKey ||
    candidate.scope.feedKey !== expectedFeedKey ||
    candidate.correlation.feedKey !== expectedFeedKey ||
    !candidate.correlation.attemptId.trim() ||
    !candidate.correlation.writerId.trim() ||
    !candidate.correlation.leaseId.trim() ||
    !Number.isSafeInteger(candidate.correlation.fencingToken) ||
    candidate.correlation.fencingToken <= 0
  ) {
    return false;
  }
  if (
    candidate.operation === "commit_feed"
      ? !feedRequestRelationshipsAreValid(candidate)
      : !attemptRequestRelationshipsAreValid(candidate)
  ) {
    return false;
  }
  const receipt =
    candidate.operation === "commit_feed"
      ? candidate.writeSet.attemptReceipt
      : candidate.writeSet.receipt;
  const checkpoint =
    candidate.operation === "commit_feed"
      ? candidate.writeSet.feedCheckpoint
      : null;
  const quarantine =
    candidate.operation === "append_attempt_evidence"
      ? candidate.writeSet.quarantine
      : null;
  const expectedProof = proof(checkpoint, receipt, quarantine);
  return canonicalJson(candidate.proof) === canonicalJson(expectedProof);
}

export function validateKrossSupabaseAtomicWriteRequestV1(
  value: unknown,
): value is KrossSupabaseAtomicWriteRequestV1 {
  try {
    return validateKrossSupabaseAtomicWriteRequestV1Unsafe(value);
  } catch {
    return false;
  }
}

function errorOutcome(
  errorKind: NonNullable<KrossSupabaseAtomicWriteOutcome["errorKind"]>,
  request: KrossSupabaseAtomicWriteRequestV1 | null = null,
): KrossSupabaseAtomicWriteOutcome {
  return {
    status: "error",
    requestId: request?.requestId ?? null,
    requestHash: request?.requestHash ?? null,
    errorKind,
    readbackVerified: false,
    resolvedFromAmbiguousWrite: false,
    retryPolicy: "never_automatic",
  };
}

function readbackRequest(
  request: KrossSupabaseAtomicWriteRequestV1,
): KrossSupabaseReadbackRequestV1 {
  return {
    contractVersion: "kross.supabase.atomic-readback-request.v1",
    requestId: request.requestId,
    requestHash: request.requestHash,
    operation: request.operation,
    feedKey: request.correlation.feedKey,
    attemptId: request.correlation.attemptId,
    leaseId: request.correlation.leaseId,
    fencingToken: request.correlation.fencingToken,
  };
}

function snapshotRecord(value: unknown): Record<string, unknown> | null {
  try {
    if (!record(value) || Object.getOwnPropertySymbols(value).length > 0) {
      return null;
    }
    const names = Object.getOwnPropertyNames(value);
    const snapshot: Record<string, unknown> = {};
    for (const key of names) snapshot[key] = Reflect.get(value, key);
    return snapshot;
  } catch {
    return null;
  }
}

function snapshotExactRecord(
  value: unknown,
  keys: string[],
): Record<string, unknown> | null {
  const snapshot = snapshotRecord(value);
  return snapshot && exactKeys(snapshot, keys) ? snapshot : null;
}

function parseRawResult(value: unknown): KrossSupabaseAtomicWriteRawResult | null {
  try {
    const source = snapshotRecord(value);
    const status = source?.status;
    let candidate: Record<string, unknown> | null = null;
    if (status === "committed") {
      candidate = snapshotExactRecord(source, [
        "status",
        "requestId",
        "requestHash",
        "commitId",
        "commitDigest",
        "fencingToken",
      ]);
      if (
        !candidate ||
        !canonicalString(candidate.requestId) ||
        typeof candidate.requestHash !== "string" ||
        !sha256Pattern.test(candidate.requestHash) ||
        !canonicalString(candidate.commitId) ||
        typeof candidate.commitDigest !== "string" ||
        !sha256Pattern.test(candidate.commitDigest) ||
        !Number.isSafeInteger(candidate.fencingToken) ||
        Number(candidate.fencingToken) <= 0
      ) {
        return null;
      }
      return {
        status,
        requestId: candidate.requestId,
        requestHash: candidate.requestHash,
        commitId: candidate.commitId,
        commitDigest: candidate.commitDigest,
        fencingToken: Number(candidate.fencingToken),
      };
    }
    if (status === "conflict") {
      candidate = snapshotExactRecord(source, [
        "status",
        "requestId",
        "requestHash",
        "conflictCode",
      ]);
      if (
        !candidate ||
        !canonicalString(candidate.requestId) ||
        typeof candidate.requestHash !== "string" ||
        !sha256Pattern.test(candidate.requestHash) ||
        !canonicalString(candidate.conflictCode)
      ) {
        return null;
      }
      return {
        status,
        requestId: candidate.requestId,
        requestHash: candidate.requestHash,
        conflictCode: candidate.conflictCode,
      };
    }
    if (status === "fenced") {
      candidate = snapshotExactRecord(source, [
        "status",
        "requestId",
        "requestHash",
        "observedFencingToken",
      ]);
      if (
        !candidate ||
        !canonicalString(candidate.requestId) ||
        typeof candidate.requestHash !== "string" ||
        !sha256Pattern.test(candidate.requestHash) ||
        !nonNegativeInteger(candidate.observedFencingToken)
      ) {
        return null;
      }
      return {
        status,
        requestId: candidate.requestId,
        requestHash: candidate.requestHash,
        observedFencingToken: Number(candidate.observedFencingToken),
      };
    }
    if (status === "error") {
      candidate = snapshotExactRecord(source, [
        "status",
        "requestId",
        "requestHash",
        "errorKind",
      ]);
      if (
        !candidate ||
        !canonicalString(candidate.requestId) ||
        typeof candidate.requestHash !== "string" ||
        !sha256Pattern.test(candidate.requestHash) ||
        (candidate.errorKind !== "known_unsent" &&
          candidate.errorKind !== "protocol")
      ) {
        return null;
      }
      return {
        status,
        requestId: candidate.requestId,
        requestHash: candidate.requestHash,
        errorKind: candidate.errorKind,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function copyCounts(value: unknown): KrossDryRunFeedCounts | null {
  const candidate = snapshotExactRecord(value, countsKeys);
  if (!candidate || !isCounts(candidate)) return null;
  return {
    read: candidate.read,
    accepted: candidate.accepted,
    rejected: candidate.rejected,
    unchanged: candidate.unchanged,
    changed: candidate.changed,
    conflict: candidate.conflict,
  } as KrossDryRunFeedCounts;
}

function parseCommitReadback(value: unknown): KrossSupabaseCommitReadbackV1 | null {
  try {
    const candidate = snapshotExactRecord(value, [
      "contractVersion",
      "requestId",
      "requestHash",
      "operation",
      "scope",
      "correlation",
      "status",
      "commitId",
      "commitDigest",
      "proof",
    ]);
    const scope = candidate
      ? snapshotExactRecord(candidate.scope, [
          "orgId",
          "propertyId",
          "feed",
          "feedKey",
          "sourceSystem",
          "snapshotKind",
        ])
      : null;
    const correlation = candidate
      ? snapshotExactRecord(candidate.correlation, [
          "feedKey",
          "attemptId",
          "writerId",
          "leaseId",
          "fencingToken",
          "receiptKey",
        ])
      : null;
    const proofCandidate = candidate
      ? snapshotExactRecord(candidate.proof, [
          "feedCheckpointHash",
          "receiptHash",
          "quarantineHash",
          "counts",
        ])
      : null;
    const counts = proofCandidate ? copyCounts(proofCandidate.counts) : null;
    if (
      !candidate ||
      !scope ||
      !correlation ||
      !proofCandidate ||
      !counts ||
      candidate.contractVersion !== "kross.supabase.atomic-readback.v1" ||
      candidate.status !== "committed" ||
      (candidate.operation !== "commit_feed" &&
        candidate.operation !== "append_attempt_evidence") ||
      !canonicalString(candidate.requestId) ||
      typeof candidate.requestHash !== "string" ||
      !sha256Pattern.test(candidate.requestHash) ||
      !canonicalString(candidate.commitId) ||
      typeof candidate.commitDigest !== "string" ||
      !sha256Pattern.test(candidate.commitDigest) ||
      typeof scope.orgId !== "string" ||
      !uuidPattern.test(scope.orgId) ||
      typeof scope.propertyId !== "string" ||
      !uuidPattern.test(scope.propertyId) ||
      !canonicalString(scope.feed) ||
      !canonicalString(scope.feedKey) ||
      scope.sourceSystem !== "Kross" ||
      scope.snapshotKind !== "reservation_mirror" ||
      !canonicalString(correlation.feedKey) ||
      !canonicalString(correlation.attemptId) ||
      !canonicalString(correlation.writerId) ||
      !canonicalString(correlation.leaseId) ||
      !Number.isSafeInteger(correlation.fencingToken) ||
      Number(correlation.fencingToken) <= 0 ||
      !canonicalString(correlation.receiptKey) ||
      (proofCandidate.feedCheckpointHash !== null &&
        (typeof proofCandidate.feedCheckpointHash !== "string" ||
          !sha256Pattern.test(proofCandidate.feedCheckpointHash))) ||
      typeof proofCandidate.receiptHash !== "string" ||
      !sha256Pattern.test(proofCandidate.receiptHash) ||
      (proofCandidate.quarantineHash !== null &&
        (typeof proofCandidate.quarantineHash !== "string" ||
          !sha256Pattern.test(proofCandidate.quarantineHash)))
    ) {
      return null;
    }
    return {
      contractVersion: "kross.supabase.atomic-readback.v1",
      requestId: candidate.requestId,
      requestHash: candidate.requestHash,
      operation: candidate.operation,
      scope: {
        orgId: scope.orgId,
        propertyId: scope.propertyId,
        feed: scope.feed,
        feedKey: scope.feedKey,
        sourceSystem: "Kross",
        snapshotKind: "reservation_mirror",
      },
      correlation: {
        feedKey: correlation.feedKey,
        attemptId: correlation.attemptId,
        writerId: correlation.writerId,
        leaseId: correlation.leaseId,
        fencingToken: Number(correlation.fencingToken),
        receiptKey: correlation.receiptKey,
      },
      status: "committed",
      commitId: candidate.commitId,
      commitDigest: candidate.commitDigest,
      proof: {
        feedCheckpointHash: proofCandidate.feedCheckpointHash as string | null,
        receiptHash: proofCandidate.receiptHash,
        quarantineHash: proofCandidate.quarantineHash as string | null,
        counts,
      },
    };
  } catch {
    return null;
  }
}

function readbackMatches(
  request: KrossSupabaseAtomicWriteRequestV1,
  readback: KrossSupabaseCommitReadbackV1,
  raw: Extract<KrossSupabaseAtomicWriteRawResult, { status: "committed" }> | null,
) {
  try {
    return (
      readback.requestId === request.requestId &&
      readback.requestHash === request.requestHash &&
      readback.operation === request.operation &&
      sameEvidence(readback.scope, request.scope) &&
      sameEvidence(readback.correlation, request.correlation) &&
      sameEvidence(readback.proof, request.proof) &&
      (!raw ||
        (readback.commitId === raw.commitId &&
          readback.commitDigest === raw.commitDigest &&
          raw.fencingToken === request.correlation.fencingToken))
    );
  } catch {
    return false;
  }
}

type ReadbackProbe =
  | { kind: "valid"; value: KrossSupabaseCommitReadbackV1 }
  | { kind: "missing" | "invalid" | "failed" };

async function readbackSafely(
  port: KrossSupabaseAtomicWritePort,
  request: KrossSupabaseAtomicWriteRequestV1,
): Promise<ReadbackProbe> {
  try {
    const raw = await port.readback(readbackRequest(request));
    if (raw === null) return { kind: "missing" };
    const parsed = parseCommitReadback(raw);
    return parsed
      ? { kind: "valid", value: parsed }
      : { kind: "invalid" };
  } catch {
    return { kind: "failed" };
  }
}

async function resolveAmbiguousWriteByReadback(
  port: KrossSupabaseAtomicWritePort,
  request: KrossSupabaseAtomicWriteRequestV1,
): Promise<KrossSupabaseAtomicWriteOutcome> {
  const readback = await readbackSafely(port, request);
  if (
    readback.kind === "valid" &&
    readbackMatches(request, readback.value, null)
  ) {
    return {
      status: "committed",
      requestId: request.requestId,
      requestHash: request.requestHash,
      commitId: readback.value.commitId,
      commitDigest: readback.value.commitDigest,
      readbackVerified: true,
      resolvedFromAmbiguousWrite: true,
      retryPolicy: "never_automatic",
    };
  }
  return errorOutcome("ambiguous_unresolved", request);
}

async function executeKrossSupabaseWriteOnce(
  port: KrossSupabaseAtomicWritePort,
  expectedScope: KrossSupabaseAdapterScope,
  candidate: unknown,
): Promise<KrossSupabaseAtomicWriteOutcome> {
  if (
    !validateKrossSupabaseAtomicWriteRequestV1(candidate) ||
    !trustedAtomicRequests.has(candidate)
  ) {
    return errorOutcome("invalid_request");
  }
  const request = candidate;
  const boundScope = scopeShape(expectedScope, request.scope.feedKey);
  if (!boundScope || !sameEvidence(boundScope, request.scope)) {
    return errorOutcome("invalid_scope", request);
  }
  let rawCandidate: unknown;
  try {
    rawCandidate = await port.writeOnce(request);
  } catch {
    return resolveAmbiguousWriteByReadback(port, request);
  }

  const raw = parseRawResult(rawCandidate);
  if (!raw) return resolveAmbiguousWriteByReadback(port, request);

  if (
    raw.requestId !== request.requestId ||
    raw.requestHash !== request.requestHash
  ) {
    return resolveAmbiguousWriteByReadback(port, request);
  }
  if (raw.status === "conflict") {
    return {
      status: "conflict",
      requestId: request.requestId,
      requestHash: request.requestHash,
      conflictCode: raw.conflictCode,
      readbackVerified: false,
      resolvedFromAmbiguousWrite: false,
      retryPolicy: "never_automatic",
    };
  }
  if (raw.status === "fenced") {
    return {
      status: "fenced",
      requestId: request.requestId,
      requestHash: request.requestHash,
      observedFencingToken: raw.observedFencingToken,
      readbackVerified: false,
      resolvedFromAmbiguousWrite: false,
      retryPolicy: "never_automatic",
    };
  }
  if (raw.status === "error") {
    return errorOutcome(raw.errorKind, request);
  }
  if (raw.fencingToken !== request.correlation.fencingToken) {
    return resolveAmbiguousWriteByReadback(port, request);
  }
  const readback = await readbackSafely(port, request);
  if (readback.kind !== "valid") {
    return errorOutcome(
      readback.kind === "invalid" ? "readback_mismatch" : "readback_missing",
      request,
    );
  }
  if (!readbackMatches(request, readback.value, raw)) {
    return errorOutcome("readback_mismatch", request);
  }
  return {
    status: "committed",
    requestId: request.requestId,
    requestHash: request.requestHash,
    commitId: readback.value.commitId,
    commitDigest: readback.value.commitDigest,
    readbackVerified: true,
    resolvedFromAmbiguousWrite: false,
    retryPolicy: "never_automatic",
  };
}

export function createKrossSupabaseAtomicWriteAdapter(options: {
  scope: KrossSupabaseAdapterScope;
  port: KrossSupabaseAtomicWritePort;
}) {
  const port = options.port;
  const normalized = normalizedScope(options.scope);
  const authorizedScope: Readonly<KrossSupabaseAdapterScope> | null = normalized
    ? Object.freeze({ ...normalized })
    : null;
  return {
    commitFeed: async (
      admission: KrossDryRunFeedAtomicAdmission,
    ): Promise<KrossSupabaseAtomicWriteOutcome> => {
      if (!authorizedScope) return errorOutcome("invalid_scope");
      const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
        authorizedScope,
        admission,
      );
      return mapped.ok
        ? executeKrossSupabaseWriteOnce(
            port,
            authorizedScope,
            mapped.request,
          )
        : errorOutcome(mapped.errorKind);
    },
    appendAttemptEvidence: async (
      admission: KrossDryRunAttemptEvidenceAdmission,
    ): Promise<KrossSupabaseAtomicWriteOutcome> => {
      if (!authorizedScope) return errorOutcome("invalid_scope");
      const mapped = mapAttemptEvidenceToKrossSupabaseRequestV1(
        authorizedScope,
        admission,
      );
      return mapped.ok
        ? executeKrossSupabaseWriteOnce(
            port,
            authorizedScope,
            mapped.request,
          )
        : errorOutcome(mapped.errorKind);
    },
  };
}
