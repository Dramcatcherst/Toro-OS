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
  getImportRun(runKey: string): KrossDryRunImportRunEvidence | null;
  saveImportRun(runKey: string, evidence: KrossDryRunImportRunEvidence): void;
  saveImportRunIfAbsent(
    runKey: string,
    evidence: KrossDryRunImportRunEvidence,
  ): KrossDryRunImportRunEvidence;
  getCheckpoint(identityKey: string): KrossDryRunCheckpointEvidence | null;
  admitAtomically(admission: KrossDryRunAtomicAdmission): boolean;
  getFeedCheckpoint(feedKey: string): KrossDryRunFeedCheckpointEvidence | null;
  getFeedLease(feedKey: string): KrossDryRunFeedWriterLease | null;
  acquireFeedLeaseAtomically(
    acquisition: KrossDryRunFeedLeaseAcquisition,
  ): KrossDryRunFeedLeaseAcquisitionResult;
  getAttemptReceipt(
    feedKey: string,
    attemptId: string,
  ): KrossDryRunAttemptReceipt | null;
  getQuarantineRecord(
    feedKey: string,
    attemptId: string,
  ): KrossDryRunQuarantineEvidence | null;
  appendAttemptEvidenceAtomically(
    admission: KrossDryRunAttemptEvidenceAdmission,
  ): KrossDryRunAttemptEvidenceWriteResult;
  admitFeedAtomically(
    admission: KrossDryRunFeedAtomicAdmission,
  ): KrossDryRunFeedAdmissionResult;
  mirrorCount(): number;
  importRunCount(): number;
  checkpointCount(): number;
  feedCheckpointCount(): number;
  attemptReceiptCount(): number;
  quarantineCount(): number;
  feedLeaseCount(): number;
};

/**
 * Hosted feed adapters implement only this fenced surface. The unfenced row
 * mutators on KrossDryRunMirrorStore are reserved for the isolated overlay and
 * must never be wired directly to persistent feed storage.
 */
export type KrossDryRunFencedFeedStore = Pick<
  KrossDryRunMirrorStore,
  | "getMirror"
  | "getImportRun"
  | "getCheckpoint"
  | "getFeedCheckpoint"
  | "getFeedLease"
  | "acquireFeedLeaseAtomically"
  | "getAttemptReceipt"
  | "getQuarantineRecord"
  | "appendAttemptEvidenceAtomically"
  | "admitFeedAtomically"
  | "mirrorCount"
  | "importRunCount"
  | "checkpointCount"
  | "feedCheckpointCount"
  | "attemptReceiptCount"
  | "quarantineCount"
  | "feedLeaseCount"
>;

export type KrossDryRunAtomicAdmission = {
  identityKey: string;
  expectedCheckpoint: KrossDryRunCheckpointEvidence | null;
  reservation: NormalizedKrossReservation;
  importRun: KrossDryRunImportRunEvidence;
  checkpoint: KrossDryRunCheckpointEvidence;
};

export type KrossDryRunFeedCounts = {
  read: number;
  accepted: number;
  rejected: number;
  unchanged: number;
  changed: number;
  conflict: number;
};

export type KrossDryRunFeedCheckpointEvidence = {
  feedKey: string;
  artifactHash: string;
  sourceAsOf: string;
  observedAt: string;
  attemptId: string;
  expectedRowCount: number;
  counts: KrossDryRunFeedCounts;
};

export type KrossDryRunFeedWriterLease = {
  feedKey: string;
  writerId: string;
  leaseId: string;
  fencingToken: number;
  acquiredAt: string;
  expiresAt: string;
};

export type KrossDryRunFeedLeaseAcquisition = {
  feedKey: string;
  writerId: string;
  leaseId: string;
  expectedToken: number;
  ttlMs: number;
};

export type KrossDryRunFeedLeaseAcquisitionResult =
  | {
      status: "acquired" | "replay";
      lease: KrossDryRunFeedWriterLease;
    }
  | {
      status: "cas_conflict" | "invalid";
      lease: null;
    };

type KrossDryRunExpectedMirror = {
  identityKey: string;
  expected: NormalizedKrossReservation | null;
};

type KrossDryRunExpectedImportRun = {
  runKey: string;
  expected: KrossDryRunImportRunEvidence | null;
};

type KrossDryRunExpectedCheckpoint = {
  identityKey: string;
  expected: KrossDryRunCheckpointEvidence | null;
};

export type KrossDryRunFeedAtomicAdmission = {
  feedKey: string;
  lease: KrossDryRunFeedWriterLease;
  expectedFeedCheckpoint: KrossDryRunFeedCheckpointEvidence | null;
  expectedAttemptReceipt: KrossDryRunAttemptReceipt | null;
  expectedMirrors: KrossDryRunExpectedMirror[];
  expectedImportRuns: KrossDryRunExpectedImportRun[];
  expectedCheckpoints: KrossDryRunExpectedCheckpoint[];
  mirrors: Array<{
    identityKey: string;
    reservation: NormalizedKrossReservation;
  }>;
  importRuns: Array<{
    runKey: string;
    evidence: KrossDryRunImportRunEvidence;
  }>;
  checkpoints: Array<{
    identityKey: string;
    checkpoint: KrossDryRunCheckpointEvidence;
  }>;
  feedCheckpoint: KrossDryRunFeedCheckpointEvidence;
  attemptReceipt: KrossDryRunAttemptReceipt;
};

export type KrossDryRunCheckpointEvidence = {
  identityKey: string;
  runKey: string;
  sourceAsOf: string;
  recordHash: string;
};

export type KrossDryRunImportContext = {
  artifactHash: string;
  attemptId: string;
  feed: string;
};

export type KrossDryRunImportContextIssue = {
  code: "invalid_artifact_hash" | "missing_attempt_id" | "missing_feed";
  message: string;
};

export type KrossDryRunQuarantineReason =
  | "stale_source_as_of"
  | "same_cut_conflict"
  | "checkpoint_changed";

export type KrossDryRunImportRunEvidence = {
  runKey: string;
  mode: "dry_run";
  status: "accepted" | "rejected";
  operation:
    | "insert"
    | "update"
    | "replay"
    | "reject"
    | "quarantine"
    | "conflict";
  identityKey: string | null;
  orgId: string;
  propertyId: string;
  sourceSystem: "Kross";
  snapshotKind: "reservation_mirror";
  feed: string;
  sourceReference: string;
  artifactHash: string;
  recordHash: string;
  attemptId: string;
  sourceAsOf: string;
  observedAt: string;
  quarantineReason: KrossDryRunQuarantineReason | null;
  readOnly: true;
  pmsWriteCount: 0;
};

export type KrossDryRunRequest = {
  payload: unknown;
  adapterConfig: KrossReservationAdapterConfig;
  evidence: KrossTransportEvidence;
  importContext: KrossDryRunImportContext;
  nowIso: string;
};

export type KrossDryRunFeedBatchRequest = {
  adapterConfig: KrossReservationAdapterConfig;
  importContext: KrossDryRunImportContext;
  writerLeaseId: string;
  sourceAsOf: string;
  observedAt: string;
  expectedRowCount: number;
  rows: Array<{
    payload: unknown;
    sourceReference: string;
    recordHash: string;
  }>;
  nowIso: string;
};

export type KrossDryRunFeedFailureReason =
  | "invalid_batch"
  | "incomplete_batch"
  | "stale_source_as_of"
  | "same_cut_conflict"
  | "row_rejected"
  | "row_conflict"
  | "duplicate_identity"
  | "checkpoint_changed"
  | "attempt_conflict"
  | "evidence_conflict"
  | "lease_unavailable"
  | "writer_fenced";

export type KrossDryRunFeedResult = {
  status: "accepted" | "rejected";
  operation: "promote" | "replay" | "reject" | "conflict";
  feedKey: string;
  counts: KrossDryRunFeedCounts;
  checkpointAdvanced: boolean;
  failureReason: KrossDryRunFeedFailureReason | null;
  canEnterSafeView: false;
  pmsWriteCount: 0;
};

export type KrossDryRunAttemptRowLink = {
  ordinal: number;
  runKey: string | null;
  recordHash: string | null;
};

export type KrossDryRunAttemptReceipt = {
  receiptKey: string;
  requestFingerprint: string;
  attemptId: string;
  feedKey: string;
  artifactHash: string;
  sourceAsOf: string;
  observedAt: string;
  recordedAt: string;
  expectedRowCount: number;
  rowLinks: KrossDryRunAttemptRowLink[];
  status: KrossDryRunFeedResult["status"];
  operation: KrossDryRunFeedResult["operation"];
  counts: KrossDryRunFeedCounts;
  failureReason: KrossDryRunFeedFailureReason | null;
  checkpointAdvanced: boolean;
  quarantineKeys: string[];
  payloadStored: false;
  readOnly: true;
  pmsWriteCount: 0;
};

export type KrossDryRunQuarantineEvidence = {
  quarantineKey: string;
  receiptKey: string;
  requestFingerprint: string;
  attemptId: string;
  feedKey: string;
  artifactHash: string;
  sourceAsOf: string;
  observedAt: string;
  recordedAt: string;
  reason: KrossDryRunFeedFailureReason;
  rowLinks: KrossDryRunAttemptRowLink[];
  payloadStored: false;
  piiStored: false;
  readOnly: true;
  pmsWriteCount: 0;
};

export type KrossDryRunAttemptEvidenceAdmission = {
  lease: KrossDryRunFeedWriterLease;
  expectedReceipt: KrossDryRunAttemptReceipt | null;
  receipt: KrossDryRunAttemptReceipt;
  quarantine: KrossDryRunQuarantineEvidence | null;
};

export type KrossDryRunAttemptEvidenceWriteResult =
  | "inserted"
  | "replay"
  | "conflict"
  | "fenced";

export type KrossDryRunFeedAdmissionResult =
  | "committed"
  | "conflict"
  | "fenced";

export type KrossDryRunResult = {
  status: "accepted" | "rejected";
  operation: KrossDryRunImportRunEvidence["operation"];
  reservation: NormalizedKrossReservation | null;
  importRun: KrossDryRunImportRunEvidence;
  adapterIssues: KrossAdapterIssue[];
  importContextIssues: KrossDryRunImportContextIssue[];
  normalizationIssues: KrossNormalizationIssue[];
  quarantineReason: KrossDryRunQuarantineReason | null;
  checkpointAdvanced: boolean;
  canEnterSafeView: false;
  pmsWriteCount: 0;
};

function encodedKeyPart(value: string) {
  return encodeURIComponent(value.trim());
}

function scopedRunKey(
  adapterConfig: KrossReservationAdapterConfig,
  importContext: KrossDryRunImportContext,
  recordHash: string,
) {
  return [
    "v1",
    `org=${encodedKeyPart(adapterConfig.orgId)}`,
    `property=${encodedKeyPart(adapterConfig.propertyId)}`,
    "source=Kross",
    "snapshot=reservation_mirror",
    `feed=${encodedKeyPart(importContext.feed)}`,
    `artifact=${encodedKeyPart(importContext.artifactHash)}`,
    `record=${encodedKeyPart(recordHash)}`,
  ].join("::");
}

function runKey(request: KrossDryRunRequest) {
  return scopedRunKey(
    request.adapterConfig,
    request.importContext,
    request.evidence.recordHash,
  );
}

function importContextIssues(
  context: KrossDryRunImportContext,
): KrossDryRunImportContextIssue[] {
  const issues: KrossDryRunImportContextIssue[] = [];
  if (!context.feed.trim()) {
    issues.push({
      code: "missing_feed",
      message: "A governed feed identifier is required.",
    });
  }
  if (!/^[a-f0-9]{64}$/.test(context.artifactHash.trim())) {
    issues.push({
      code: "invalid_artifact_hash",
      message: "Artifact checksum must be a canonical lowercase SHA-256 value.",
    });
  }
  if (!context.attemptId.trim()) {
    issues.push({
      code: "missing_attempt_id",
      message: "A unique attempt identifier is required.",
    });
  }
  return issues;
}

function importRunBase(
  request: KrossDryRunRequest,
  currentRunKey: string,
) {
  return {
    runKey: currentRunKey,
    mode: "dry_run" as const,
    orgId: request.adapterConfig.orgId.trim(),
    propertyId: request.adapterConfig.propertyId.trim(),
    sourceSystem: "Kross" as const,
    snapshotKind: "reservation_mirror" as const,
    feed: request.importContext.feed.trim(),
    sourceReference: request.evidence.sourceReference,
    artifactHash: request.importContext.artifactHash.trim(),
    recordHash: request.evidence.recordHash.trim(),
    attemptId: request.importContext.attemptId.trim(),
    sourceAsOf: request.evidence.sourceAsOf,
    observedAt: request.evidence.observedAt,
    readOnly: true as const,
    pmsWriteCount: 0 as const,
  };
}

function feedKey(request: KrossDryRunFeedBatchRequest) {
  return [
    "v1",
    `org=${encodedKeyPart(request.adapterConfig.orgId)}`,
    `property=${encodedKeyPart(request.adapterConfig.propertyId)}`,
    "source=Kross",
    "snapshot=reservation_mirror",
    `feed=${encodedKeyPart(request.importContext.feed)}`,
  ].join("::");
}

function attemptReceiptKey(currentFeedKey: string, attemptId: string) {
  return `${currentFeedKey}::attempt=${encodedKeyPart(attemptId)}`;
}

function quarantineKey(receiptKey: string) {
  return `${receiptKey}::quarantine=batch`;
}

function feedRowLinks(
  request: KrossDryRunFeedBatchRequest,
  importContext: KrossDryRunImportContext,
): KrossDryRunAttemptRowLink[] {
  return request.rows.map((row, ordinal) => {
    const recordHash = row.recordHash.trim();
    const isCanonicalRecordHash = /^[a-f0-9]{64}$/.test(recordHash);
    return {
      ordinal,
      recordHash: isCanonicalRecordHash ? recordHash : null,
      runKey: isCanonicalRecordHash
        ? scopedRunKey(request.adapterConfig, importContext, recordHash)
        : null,
    };
  });
}

function feedRequestFingerprint(
  currentFeedKey: string,
  request: KrossDryRunFeedBatchRequest,
  importContext: KrossDryRunImportContext,
  rowLinks: KrossDryRunAttemptRowLink[],
) {
  return JSON.stringify({
    version: 1,
    feedKey: currentFeedKey,
    artifactHash: importContext.artifactHash,
    sourceAsOf: request.sourceAsOf,
    observedAt: request.observedAt,
    expectedRowCount: request.expectedRowCount,
    rowLinks,
  });
}

function cloneAttemptReceipt(
  receipt: KrossDryRunAttemptReceipt,
): KrossDryRunAttemptReceipt {
  return {
    ...receipt,
    rowLinks: receipt.rowLinks.map((link) => ({ ...link })),
    counts: { ...receipt.counts },
    quarantineKeys: [...receipt.quarantineKeys],
  };
}

function cloneQuarantineEvidence(
  evidence: KrossDryRunQuarantineEvidence,
): KrossDryRunQuarantineEvidence {
  return {
    ...evidence,
    rowLinks: evidence.rowLinks.map((link) => ({ ...link })),
  };
}

function cloneImportRunEvidence(
  evidence: KrossDryRunImportRunEvidence,
): KrossDryRunImportRunEvidence {
  return { ...evidence };
}

function cloneFeedLease(
  lease: KrossDryRunFeedWriterLease,
): KrossDryRunFeedWriterLease {
  return { ...lease };
}

function feedLeaseIsActive(
  current: KrossDryRunFeedWriterLease | null,
  candidate: KrossDryRunFeedWriterLease,
  storeNow: string,
) {
  const acquiredAtMs = Date.parse(candidate.acquiredAt);
  const expiresAtMs = Date.parse(candidate.expiresAt);
  const storeNowMs = Date.parse(storeNow);
  return (
    current !== null &&
    evidenceMatches(current, candidate) &&
    candidate.feedKey.trim() === candidate.feedKey &&
    candidate.feedKey.length > 0 &&
    candidate.writerId.trim() === candidate.writerId &&
    candidate.writerId.length > 0 &&
    candidate.leaseId.trim() === candidate.leaseId &&
    candidate.leaseId.length > 0 &&
    Number.isSafeInteger(candidate.fencingToken) &&
    candidate.fencingToken > 0 &&
    Number.isFinite(acquiredAtMs) &&
    Number.isFinite(expiresAtMs) &&
    Number.isFinite(storeNowMs) &&
    acquiredAtMs <= storeNowMs &&
    storeNowMs < expiresAtMs
  );
}

function attemptReceiptFingerprint(receipt: KrossDryRunAttemptReceipt) {
  return JSON.stringify({
    version: 1,
    feedKey: receipt.feedKey,
    artifactHash: receipt.artifactHash,
    sourceAsOf: receipt.sourceAsOf,
    observedAt: receipt.observedAt,
    expectedRowCount: receipt.expectedRowCount,
    rowLinks: receipt.rowLinks,
  });
}

function countsAreConsistent(counts: KrossDryRunFeedCounts) {
  return (
    counts.read === counts.accepted + counts.rejected &&
    counts.accepted === counts.unchanged + counts.changed &&
    counts.conflict <= counts.rejected &&
    Object.values(counts).every(
      (value) => Number.isInteger(value) && value >= 0,
    )
  );
}

function rowLinksAreConsistent(receipt: KrossDryRunAttemptReceipt) {
  return receipt.rowLinks.every((link, index) => {
    if (link.ordinal !== index) return false;
    if (link.runKey === null || link.recordHash === null) {
      return link.runKey === null && link.recordHash === null;
    }
    return (
      /^[a-f0-9]{64}$/.test(link.recordHash) &&
      link.runKey ===
        `${receipt.feedKey}::artifact=${encodedKeyPart(receipt.artifactHash)}::record=${encodedKeyPart(link.recordHash)}`
    );
  });
}

function attemptEvidenceIsConsistent(
  receipt: KrossDryRunAttemptReceipt,
  quarantine: KrossDryRunQuarantineEvidence | null,
) {
  const canonicalReceiptKey = attemptReceiptKey(
    receipt.feedKey,
    receipt.attemptId,
  );
  if (
    receipt.receiptKey !== canonicalReceiptKey ||
    receipt.requestFingerprint !== attemptReceiptFingerprint(receipt) ||
    !countsAreConsistent(receipt.counts) ||
    !rowLinksAreConsistent(receipt) ||
    receipt.payloadStored ||
    !receipt.readOnly ||
    receipt.pmsWriteCount !== 0
  ) {
    return false;
  }
  if (receipt.status === "accepted") {
    return (
      receipt.operation === "replay" &&
      receipt.failureReason === null &&
      !receipt.checkpointAdvanced &&
      receipt.quarantineKeys.length === 0 &&
      quarantine === null
    );
  }
  const expectedQuarantineKey = quarantineKey(canonicalReceiptKey);
  return Boolean(
    receipt.failureReason &&
      !receipt.checkpointAdvanced &&
      receipt.quarantineKeys.length === 1 &&
      receipt.quarantineKeys[0] === expectedQuarantineKey &&
      quarantine &&
      quarantine.quarantineKey === expectedQuarantineKey &&
      quarantine.receiptKey === canonicalReceiptKey &&
      quarantine.requestFingerprint === receipt.requestFingerprint &&
      quarantine.attemptId === receipt.attemptId &&
      quarantine.feedKey === receipt.feedKey &&
      quarantine.artifactHash === receipt.artifactHash &&
      quarantine.sourceAsOf === receipt.sourceAsOf &&
      quarantine.observedAt === receipt.observedAt &&
      quarantine.recordedAt === receipt.recordedAt &&
      quarantine.reason === receipt.failureReason &&
      evidenceMatches(quarantine.rowLinks, receipt.rowLinks) &&
      !quarantine.payloadStored &&
      !quarantine.piiStored &&
      quarantine.readOnly &&
      quarantine.pmsWriteCount === 0,
  );
}

function promotionReceiptIsConsistent(
  receipt: KrossDryRunAttemptReceipt,
  checkpoint: KrossDryRunFeedCheckpointEvidence,
  resolveRun: (runKey: string) => KrossDryRunImportRunEvidence | null,
) {
  const canonicalReceiptKey = attemptReceiptKey(
    receipt.feedKey,
    receipt.attemptId,
  );
  return (
    receipt.receiptKey === canonicalReceiptKey &&
    receipt.requestFingerprint === attemptReceiptFingerprint(receipt) &&
    countsAreConsistent(receipt.counts) &&
    rowLinksAreConsistent(receipt) &&
    receipt.status === "accepted" &&
    receipt.operation === "promote" &&
    receipt.failureReason === null &&
    receipt.checkpointAdvanced &&
    receipt.quarantineKeys.length === 0 &&
    !receipt.payloadStored &&
    receipt.readOnly &&
    receipt.pmsWriteCount === 0 &&
    receipt.feedKey === checkpoint.feedKey &&
    receipt.attemptId === checkpoint.attemptId &&
    receipt.artifactHash === checkpoint.artifactHash &&
    receipt.sourceAsOf === checkpoint.sourceAsOf &&
    receipt.observedAt === checkpoint.observedAt &&
    receipt.expectedRowCount === checkpoint.expectedRowCount &&
    evidenceMatches(receipt.counts, checkpoint.counts) &&
    receipt.rowLinks.length === checkpoint.expectedRowCount &&
    new Set(receipt.rowLinks.map((link) => link.runKey)).size ===
      receipt.rowLinks.length &&
    receipt.rowLinks.every((link) => {
      if (!link.runKey || !link.recordHash) return false;
      const run = resolveRun(link.runKey);
      return Boolean(
        run &&
          run.status === "accepted" &&
          run.runKey === link.runKey &&
          run.artifactHash === receipt.artifactHash &&
          run.recordHash === link.recordHash,
      );
    })
  );
}

function replayReceiptIsConsistent(
  receipt: KrossDryRunAttemptReceipt,
  checkpoint: KrossDryRunFeedCheckpointEvidence,
  resolveRun: (runKey: string) => KrossDryRunImportRunEvidence | null,
) {
  return (
    attemptEvidenceIsConsistent(receipt, null) &&
    receipt.status === "accepted" &&
    receipt.operation === "replay" &&
    receipt.feedKey === checkpoint.feedKey &&
    receipt.artifactHash === checkpoint.artifactHash &&
    receipt.sourceAsOf === checkpoint.sourceAsOf &&
    receipt.observedAt === checkpoint.observedAt &&
    receipt.expectedRowCount === checkpoint.expectedRowCount &&
    evidenceMatches(receipt.counts, checkpoint.counts) &&
    receipt.rowLinks.length === checkpoint.expectedRowCount &&
    new Set(receipt.rowLinks.map((link) => link.runKey)).size ===
      receipt.rowLinks.length &&
    receipt.rowLinks.every((link) => {
      if (!link.runKey || !link.recordHash) return false;
      const run = resolveRun(link.runKey);
      return Boolean(
        run &&
          run.status === "accepted" &&
          run.runKey === link.runKey &&
          run.artifactHash === receipt.artifactHash &&
          run.recordHash === link.recordHash,
      );
    })
  );
}

function storedAttemptEvidenceIsConsistent(
  receipt: KrossDryRunAttemptReceipt,
  quarantine: KrossDryRunQuarantineEvidence | null,
  checkpoint: KrossDryRunFeedCheckpointEvidence | null,
  resolveRun: (runKey: string) => KrossDryRunImportRunEvidence | null,
) {
  if (receipt.status === "rejected") {
    return attemptEvidenceIsConsistent(receipt, quarantine);
  }
  if (!checkpoint || quarantine) return false;
  return receipt.operation === "promote"
    ? promotionReceiptIsConsistent(receipt, checkpoint, resolveRun)
    : replayReceiptIsConsistent(receipt, checkpoint, resolveRun);
}

function feedCounts(read: number): KrossDryRunFeedCounts {
  return {
    read,
    accepted: 0,
    rejected: 0,
    unchanged: 0,
    changed: 0,
    conflict: 0,
  };
}

function evidenceMatches<T>(current: T | null, expected: T | null) {
  return JSON.stringify(current) === JSON.stringify(expected);
}

function feedCheckpointsMatch(
  current: KrossDryRunFeedCheckpointEvidence | null,
  expected: KrossDryRunFeedCheckpointEvidence | null,
) {
  return evidenceMatches(current, expected);
}

function identityKey(reservation: NormalizedKrossReservation) {
  return [
    reservation.org_id,
    reservation.property_id,
    reservation.external_reservation_id,
  ].join(":");
}

function checkpointsMatch(
  current: KrossDryRunCheckpointEvidence | null,
  expected: KrossDryRunCheckpointEvidence | null,
) {
  if (!current || !expected) return current === expected;
  return (
    current.identityKey === expected.identityKey &&
    current.runKey === expected.runKey &&
    current.sourceAsOf === expected.sourceAsOf &&
    current.recordHash === expected.recordHash
  );
}

export type KrossDryRunInMemoryStoreOptions = {
  now?: () => string;
};

export function createInMemoryKrossDryRunStore(
  options: KrossDryRunInMemoryStoreOptions = {},
): KrossDryRunMirrorStore {
  const mirrors = new Map<string, NormalizedKrossReservation>();
  const importRuns = new Map<string, KrossDryRunImportRunEvidence>();
  const checkpoints = new Map<string, KrossDryRunCheckpointEvidence>();
  const feedCheckpoints = new Map<string, KrossDryRunFeedCheckpointEvidence>();
  const feedLeases = new Map<string, KrossDryRunFeedWriterLease>();
  const feedLeaseGrants = new Map<
    string,
    {
      lease: KrossDryRunFeedWriterLease;
      expectedToken: number;
      ttlMs: number;
    }
  >();
  const attemptReceipts = new Map<string, KrossDryRunAttemptReceipt>();
  const quarantines = new Map<string, KrossDryRunQuarantineEvidence>();
  let lastStoreNowMs = Number.NEGATIVE_INFINITY;
  const storeNow = () => {
    const rawNow = (options.now ?? (() => new Date().toISOString()))();
    const rawNowMs = Date.parse(rawNow);
    if (!Number.isFinite(rawNowMs)) return rawNow;
    lastStoreNowMs = Math.max(lastStoreNowMs, rawNowMs);
    return new Date(lastStoreNowMs).toISOString();
  };

  return {
    getMirror: (key) => mirrors.get(key) ?? null,
    getImportRun: (key) => {
      const evidence = importRuns.get(key);
      return evidence ? cloneImportRunEvidence(evidence) : null;
    },
    saveImportRun: (key, evidence) => {
      if (!importRuns.has(key)) {
        importRuns.set(key, cloneImportRunEvidence(evidence));
      }
    },
    saveImportRunIfAbsent: (key, evidence) => {
      const existing = importRuns.get(key);
      if (existing) return cloneImportRunEvidence(existing);
      const stored = cloneImportRunEvidence(evidence);
      importRuns.set(key, stored);
      return cloneImportRunEvidence(stored);
    },
    getCheckpoint: (key) => checkpoints.get(key) ?? null,
    admitAtomically: ({
      identityKey,
      expectedCheckpoint,
      reservation,
      importRun,
      checkpoint,
    }) => {
      // Synchronous in-memory commit for the local proof. A hosted store must
      // implement this contract with one database transaction/CAS.
      const currentCheckpoint = checkpoints.get(identityKey) ?? null;
      if (
        !checkpointsMatch(currentCheckpoint, expectedCheckpoint) ||
        importRuns.has(importRun.runKey)
      ) {
        return false;
      }
      mirrors.set(identityKey, reservation);
      importRuns.set(importRun.runKey, cloneImportRunEvidence(importRun));
      checkpoints.set(identityKey, checkpoint);
      return true;
    },
    getFeedCheckpoint: (key) => feedCheckpoints.get(key) ?? null,
    getFeedLease: (key) => {
      const lease = feedLeases.get(key);
      return lease ? cloneFeedLease(lease) : null;
    },
    acquireFeedLeaseAtomically: ({
      feedKey: requestedFeedKey,
      writerId,
      leaseId,
      expectedToken,
      ttlMs,
    }) => {
      const acquiredAt = storeNow();
      const acquiredAtMs = Date.parse(acquiredAt);
      const current = feedLeases.get(requestedFeedKey) ?? null;
      const grantKey = `${requestedFeedKey}::lease=${encodedKeyPart(leaseId)}`;
      const existingGrant = feedLeaseGrants.get(grantKey) ?? null;
      if (
        !requestedFeedKey ||
        requestedFeedKey.trim() !== requestedFeedKey ||
        !writerId ||
        writerId.trim() !== writerId ||
        !leaseId ||
        leaseId.trim() !== leaseId ||
        !Number.isSafeInteger(expectedToken) ||
        expectedToken < 0 ||
        !Number.isSafeInteger(ttlMs) ||
        ttlMs <= 0 ||
        ttlMs > 300_000 ||
        !Number.isFinite(acquiredAtMs)
      ) {
        return { status: "invalid", lease: null };
      }
      if (existingGrant) {
        if (
          existingGrant.lease.writerId !== writerId ||
          existingGrant.expectedToken !== expectedToken ||
          existingGrant.ttlMs !== ttlMs
        ) {
          return { status: "invalid", lease: null };
        }
        return {
          status: "replay",
          lease: cloneFeedLease(existingGrant.lease),
        };
      }
      const currentToken = current?.fencingToken ?? 0;
      if (
        currentToken !== expectedToken ||
        !Number.isSafeInteger(currentToken) ||
        currentToken >= Number.MAX_SAFE_INTEGER
      ) {
        return { status: "cas_conflict", lease: null };
      }
      const lease: KrossDryRunFeedWriterLease = {
        feedKey: requestedFeedKey,
        writerId,
        leaseId,
        fencingToken: currentToken + 1,
        acquiredAt,
        expiresAt: new Date(acquiredAtMs + ttlMs).toISOString(),
      };
      feedLeases.set(requestedFeedKey, lease);
      feedLeaseGrants.set(grantKey, { lease, expectedToken, ttlMs });
      return { status: "acquired", lease: cloneFeedLease(lease) };
    },
    getAttemptReceipt: (currentFeedKey, attemptId) => {
      const receipt = attemptReceipts.get(
        attemptReceiptKey(currentFeedKey, attemptId),
      );
      return receipt ? cloneAttemptReceipt(receipt) : null;
    },
    getQuarantineRecord: (currentFeedKey, attemptId) => {
      const evidence = quarantines.get(
        quarantineKey(attemptReceiptKey(currentFeedKey, attemptId)),
      );
      return evidence ? cloneQuarantineEvidence(evidence) : null;
    },
    appendAttemptEvidenceAtomically: ({
      lease,
      expectedReceipt,
      receipt,
      quarantine,
    }) => {
      if (
        lease.feedKey !== receipt.feedKey ||
        !feedLeaseIsActive(
          feedLeases.get(receipt.feedKey) ?? null,
          lease,
          storeNow(),
        )
      ) {
        return "fenced";
      }
      const canonicalReceiptKey = attemptReceiptKey(
        receipt.feedKey,
        receipt.attemptId,
      );
      const currentReceipt = attemptReceipts.get(canonicalReceiptKey) ?? null;
      const currentQuarantine = quarantines.get(
        quarantineKey(canonicalReceiptKey),
      ) ?? null;
      const existingIsConsistent = currentReceipt
        ? storedAttemptEvidenceIsConsistent(
            currentReceipt,
            currentQuarantine,
            feedCheckpoints.get(currentReceipt.feedKey) ?? null,
            (candidateRunKey) => importRuns.get(candidateRunKey) ?? null,
          )
        : currentQuarantine === null;
      const incomingIsConsistent = storedAttemptEvidenceIsConsistent(
        receipt,
        quarantine,
        feedCheckpoints.get(receipt.feedKey) ?? null,
        (candidateRunKey) => importRuns.get(candidateRunKey) ?? null,
      );
      if (currentReceipt) {
        return existingIsConsistent &&
          incomingIsConsistent &&
          currentReceipt.requestFingerprint === receipt.requestFingerprint
          ? "replay"
          : "conflict";
      }
      if (expectedReceipt || currentQuarantine) return "conflict";
      if (!incomingIsConsistent) return "conflict";
      attemptReceipts.set(canonicalReceiptKey, cloneAttemptReceipt(receipt));
      if (quarantine) {
        quarantines.set(
          quarantine.quarantineKey,
          cloneQuarantineEvidence(quarantine),
        );
      }
      return "inserted";
    },
    admitFeedAtomically: (admission) => {
      if (
        admission.lease.feedKey !== admission.feedKey ||
        !feedLeaseIsActive(
          feedLeases.get(admission.feedKey) ?? null,
          admission.lease,
          storeNow(),
        )
      ) {
        return "fenced";
      }
      const currentFeedCheckpoint =
        feedCheckpoints.get(admission.feedKey) ?? null;
      const currentAttemptReceipt =
        attemptReceipts.get(admission.attemptReceipt.receiptKey) ?? null;
      const stagedRuns = new Map(
        admission.importRuns.map(({ runKey: stagedRunKey, evidence }) => [
          stagedRunKey,
          evidence,
        ]),
      );
      const stagedRunKeys = admission.importRuns.map(({ runKey }) => runKey);
      const linkedRunKeys = admission.attemptReceipt.rowLinks
        .map(({ runKey }) => runKey)
        .filter((runKey): runKey is string => runKey !== null);
      if (
        !feedCheckpointsMatch(
          currentFeedCheckpoint,
          admission.expectedFeedCheckpoint,
        ) ||
        !evidenceMatches(
          currentAttemptReceipt,
          admission.expectedAttemptReceipt,
        ) ||
        admission.attemptReceipt.receiptKey !==
          attemptReceiptKey(
            admission.attemptReceipt.feedKey,
            admission.attemptReceipt.attemptId,
          ) ||
        admission.attemptReceipt.feedKey !== admission.feedKey ||
        quarantines.has(
          quarantineKey(admission.attemptReceipt.receiptKey),
        ) ||
        !promotionReceiptIsConsistent(
          admission.attemptReceipt,
          admission.feedCheckpoint,
          (candidateRunKey) =>
            stagedRuns.get(candidateRunKey) ??
            importRuns.get(candidateRunKey) ??
            null,
        )
      ) {
        return "conflict";
      }
      if (
        new Set(stagedRunKeys).size !== stagedRunKeys.length ||
        stagedRunKeys.some(
          (stagedRunKey) =>
            linkedRunKeys.filter((runKey) => runKey === stagedRunKey).length !==
            1,
        )
      ) {
        return "conflict";
      }
      if (
        admission.expectedMirrors.some(
          ({ identityKey, expected }) =>
            !evidenceMatches(mirrors.get(identityKey) ?? null, expected),
        ) ||
        admission.expectedImportRuns.some(
          ({ runKey: expectedRunKey, expected }) =>
            !evidenceMatches(importRuns.get(expectedRunKey) ?? null, expected),
        ) ||
        admission.expectedCheckpoints.some(
          ({ identityKey, expected }) =>
            !checkpointsMatch(
              checkpoints.get(identityKey) ?? null,
              expected,
            ),
        )
      ) {
        return "conflict";
      }
      if (
        admission.importRuns.some(({ runKey: admittedRunKey }) => {
          const expected = admission.expectedImportRuns.find(
            ({ runKey: expectedRunKey }) =>
              expectedRunKey === admittedRunKey,
          );
          return !expected || expected.expected !== null || importRuns.has(admittedRunKey);
        })
      ) {
        return "conflict";
      }

      for (const { identityKey, reservation } of admission.mirrors) {
        mirrors.set(identityKey, reservation);
      }
      for (const { runKey: admittedRunKey, evidence } of admission.importRuns) {
        importRuns.set(admittedRunKey, cloneImportRunEvidence(evidence));
      }
      for (const { identityKey, checkpoint } of admission.checkpoints) {
        checkpoints.set(identityKey, checkpoint);
      }
      feedCheckpoints.set(admission.feedKey, admission.feedCheckpoint);
      attemptReceipts.set(
        admission.attemptReceipt.receiptKey,
        cloneAttemptReceipt(admission.attemptReceipt),
      );
      return "committed";
    },
    mirrorCount: () => mirrors.size,
    importRunCount: () => importRuns.size,
    checkpointCount: () => checkpoints.size,
    feedCheckpointCount: () => feedCheckpoints.size,
    attemptReceiptCount: () => attemptReceipts.size,
    quarantineCount: () => quarantines.size,
    feedLeaseCount: () => feedLeases.size,
  };
}

export function executeKrossDryRun(
  request: KrossDryRunRequest,
  store: KrossDryRunMirrorStore,
): KrossDryRunResult {
  const currentRunKey = runKey(request);
  const contextIssues = importContextIssues(request.importContext);
  if (contextIssues.length > 0) {
    const importRun: KrossDryRunImportRunEvidence = {
      ...importRunBase(request, currentRunKey),
      status: "rejected",
      operation: "reject",
      identityKey: null,
      quarantineReason: null,
    };
    return {
      status: "rejected",
      operation: "reject",
      reservation: null,
      importRun,
      adapterIssues: [],
      importContextIssues: contextIssues,
      normalizationIssues: [],
      quarantineReason: null,
      checkpointAdvanced: false,
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

  const existingRun = store.getImportRun(currentRunKey);

  const adapted = adaptKrossReservationPayload(
    request.payload,
    request.adapterConfig,
  );

  if (!adapted.candidate) {
    const importRun: KrossDryRunImportRunEvidence = {
      ...importRunBase(request, currentRunKey),
      status: "rejected",
      operation: "reject",
      identityKey: null,
      quarantineReason: null,
    };
    if (!existingRun) store.saveImportRun(currentRunKey, importRun);

    return {
      status: "rejected",
      operation: "reject",
      reservation: null,
      importRun: existingRun ?? importRun,
      adapterIssues: adapted.issues,
      importContextIssues: contextIssues,
      normalizationIssues: [],
      quarantineReason: importRun.quarantineReason,
      checkpointAdvanced: false,
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
      ...importRunBase(request, currentRunKey),
      status: "rejected",
      operation: "reject",
      identityKey: null,
      quarantineReason: null,
    };
    if (!existingRun) store.saveImportRun(currentRunKey, importRun);

    return {
      status: "rejected",
      operation: "reject",
      reservation: null,
      importRun: existingRun ?? importRun,
      adapterIssues: adapted.issues,
      importContextIssues: contextIssues,
      normalizationIssues: normalized.issues,
      quarantineReason: importRun.quarantineReason,
      checkpointAdvanced: false,
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

  const key = identityKey(normalized.reservation);
  const existingMirror = store.getMirror(key);
  const existingCheckpoint = store.getCheckpoint(key);
  if (existingRun) {
    const replayAccepted = existingRun.status === "accepted";
    const attemptEvidence = {
      ...existingRun,
      attemptId: request.importContext.attemptId.trim(),
      observedAt: request.evidence.observedAt,
    };
    return {
      status: replayAccepted ? "accepted" : "rejected",
      operation: replayAccepted ? "replay" : existingRun.operation,
      reservation: replayAccepted
        ? (existingMirror ?? normalized.reservation)
        : null,
      importRun: attemptEvidence,
      adapterIssues: adapted.issues,
      importContextIssues: contextIssues,
      normalizationIssues: normalized.issues,
      quarantineReason: existingRun.quarantineReason,
      checkpointAdvanced: false,
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

  if (existingMirror || existingCheckpoint) {
    const incomingSourceAsOf = Date.parse(normalized.reservation.snapshot_as_of);
    const currentSourceAsOf = Date.parse(
      existingCheckpoint?.sourceAsOf ?? existingMirror!.snapshot_as_of,
    );
    const currentRecordHash =
      existingCheckpoint?.recordHash ?? existingMirror!.source_hash;
    const isStale = incomingSourceAsOf < currentSourceAsOf;
    const isSameCutConflict =
      incomingSourceAsOf === currentSourceAsOf &&
      normalized.reservation.source_hash !== currentRecordHash;

    if (isStale || isSameCutConflict) {
      const quarantineReason: KrossDryRunQuarantineReason = isStale
        ? "stale_source_as_of"
        : "same_cut_conflict";
      const operation = isStale ? "quarantine" : "conflict";
      const importRun: KrossDryRunImportRunEvidence = {
        ...importRunBase(request, currentRunKey),
        status: "rejected",
        operation,
        identityKey: key,
        quarantineReason,
      };
      store.saveImportRun(currentRunKey, importRun);

      return {
        status: "rejected",
        operation,
        reservation: null,
        importRun,
        adapterIssues: adapted.issues,
        importContextIssues: contextIssues,
        normalizationIssues: normalized.issues,
        quarantineReason,
        checkpointAdvanced: false,
        canEnterSafeView: false,
        pmsWriteCount: 0,
      };
    }

    if (
      incomingSourceAsOf === currentSourceAsOf &&
      normalized.reservation.source_hash === currentRecordHash
    ) {
      const importRun: KrossDryRunImportRunEvidence = {
        ...importRunBase(request, currentRunKey),
        status: "accepted",
        operation: "replay",
        identityKey: key,
        quarantineReason: null,
      };
      store.saveImportRun(currentRunKey, importRun);

      return {
        status: "accepted",
        operation: "replay",
        reservation: existingMirror ?? normalized.reservation,
        importRun,
        adapterIssues: adapted.issues,
        importContextIssues: contextIssues,
        normalizationIssues: normalized.issues,
        quarantineReason: null,
        checkpointAdvanced: false,
        canEnterSafeView: false,
        pmsWriteCount: 0,
      };
    }
  }

  const operation = existingMirror ? "update" : "insert";
  const importRun: KrossDryRunImportRunEvidence = {
    ...importRunBase(request, currentRunKey),
    status: "accepted",
    operation,
    identityKey: key,
    quarantineReason: null,
  };

  const admitted = store.admitAtomically({
    identityKey: key,
    expectedCheckpoint: existingCheckpoint,
    reservation: normalized.reservation,
    importRun,
    checkpoint: {
      identityKey: key,
      runKey: currentRunKey,
      sourceAsOf: normalized.reservation.snapshot_as_of,
      recordHash: normalized.reservation.source_hash,
    },
  });

  if (!admitted) {
    const concurrentConflict: KrossDryRunImportRunEvidence = {
      ...importRun,
      status: "rejected",
      operation: "conflict",
      quarantineReason: "checkpoint_changed",
    };
    const canonicalRun = store.saveImportRunIfAbsent(
      currentRunKey,
      concurrentConflict,
    );

    if (canonicalRun.status === "accepted") {
      return {
        status: "accepted",
        operation: "replay",
        reservation: store.getMirror(key) ?? normalized.reservation,
        importRun: canonicalRun,
        adapterIssues: adapted.issues,
        importContextIssues: contextIssues,
        normalizationIssues: normalized.issues,
        quarantineReason: canonicalRun.quarantineReason,
        checkpointAdvanced: false,
        canEnterSafeView: false,
        pmsWriteCount: 0,
      };
    }

    return {
      status: "rejected",
      operation: canonicalRun.operation,
      reservation: null,
      importRun: canonicalRun,
      adapterIssues: adapted.issues,
      importContextIssues: contextIssues,
      normalizationIssues: normalized.issues,
      quarantineReason: canonicalRun.quarantineReason,
      checkpointAdvanced: false,
      canEnterSafeView: false,
      pmsWriteCount: 0,
    };
  }

  return {
    status: "accepted",
    operation,
    reservation: normalized.reservation,
    importRun,
    adapterIssues: adapted.issues,
    importContextIssues: contextIssues,
    normalizationIssues: normalized.issues,
    quarantineReason: null,
    checkpointAdvanced: true,
    canEnterSafeView: false,
    pmsWriteCount: 0,
  };
}

function createKrossFeedOverlayStore(base: KrossDryRunFencedFeedStore) {
  const expectedMirrors = new Map<
    string,
    NormalizedKrossReservation | null
  >();
  const expectedImportRuns = new Map<
    string,
    KrossDryRunImportRunEvidence | null
  >();
  const expectedCheckpoints = new Map<
    string,
    KrossDryRunCheckpointEvidence | null
  >();
  const mirrorWrites = new Map<string, NormalizedKrossReservation>();
  const importRunWrites = new Map<string, KrossDryRunImportRunEvidence>();
  const checkpointWrites = new Map<string, KrossDryRunCheckpointEvidence>();

  const captureMirror = (key: string) => {
    if (!expectedMirrors.has(key)) {
      expectedMirrors.set(key, base.getMirror(key));
    }
    return expectedMirrors.get(key) ?? null;
  };
  const captureImportRun = (key: string) => {
    if (!expectedImportRuns.has(key)) {
      expectedImportRuns.set(key, base.getImportRun(key));
    }
    return expectedImportRuns.get(key) ?? null;
  };
  const captureCheckpoint = (key: string) => {
    if (!expectedCheckpoints.has(key)) {
      expectedCheckpoints.set(key, base.getCheckpoint(key));
    }
    return expectedCheckpoints.get(key) ?? null;
  };

  const overlay: KrossDryRunMirrorStore = {
    getMirror: (key) => mirrorWrites.get(key) ?? captureMirror(key),
    getImportRun: (key) => importRunWrites.get(key) ?? captureImportRun(key),
    saveImportRun: (key, evidence) => {
      captureImportRun(key);
      importRunWrites.set(key, evidence);
    },
    saveImportRunIfAbsent: (key, evidence) => {
      const existing = importRunWrites.get(key) ?? captureImportRun(key);
      if (existing) return existing;
      importRunWrites.set(key, evidence);
      return evidence;
    },
    getCheckpoint: (key) =>
      checkpointWrites.get(key) ?? captureCheckpoint(key),
    admitAtomically: ({
      identityKey: admittedIdentityKey,
      expectedCheckpoint,
      reservation,
      importRun,
      checkpoint,
    }) => {
      const currentCheckpoint =
        checkpointWrites.get(admittedIdentityKey) ??
        captureCheckpoint(admittedIdentityKey);
      if (!checkpointsMatch(currentCheckpoint, expectedCheckpoint)) return false;
      captureMirror(admittedIdentityKey);
      captureImportRun(importRun.runKey);
      mirrorWrites.set(admittedIdentityKey, reservation);
      importRunWrites.set(importRun.runKey, importRun);
      checkpointWrites.set(admittedIdentityKey, checkpoint);
      return true;
    },
    getFeedCheckpoint: (key) => base.getFeedCheckpoint(key),
    getFeedLease: (key) => base.getFeedLease(key),
    acquireFeedLeaseAtomically: () => ({
      status: "invalid",
      lease: null,
    }),
    getAttemptReceipt: (currentFeedKey, attemptId) =>
      base.getAttemptReceipt(currentFeedKey, attemptId),
    getQuarantineRecord: (currentFeedKey, attemptId) =>
      base.getQuarantineRecord(currentFeedKey, attemptId),
    appendAttemptEvidenceAtomically: () => "conflict",
    admitFeedAtomically: () => "conflict",
    mirrorCount: () => base.mirrorCount(),
    importRunCount: () => base.importRunCount(),
    checkpointCount: () => base.checkpointCount(),
    feedCheckpointCount: () => base.feedCheckpointCount(),
    attemptReceiptCount: () => base.attemptReceiptCount(),
    quarantineCount: () => base.quarantineCount(),
    feedLeaseCount: () => base.feedLeaseCount(),
  };

  return {
    store: overlay,
    snapshot: () => ({
      expectedMirrors: [...expectedMirrors].map(([identityKey, expected]) => ({
        identityKey,
        expected,
      })),
      expectedImportRuns: [...expectedImportRuns].map(([runKey, expected]) => ({
        runKey,
        expected,
      })),
      expectedCheckpoints: [...expectedCheckpoints].map(
        ([identityKey, expected]) => ({ identityKey, expected }),
      ),
      mirrors: [...mirrorWrites].map(([identityKey, reservation]) => ({
        identityKey,
        reservation,
      })),
      importRuns: [...importRunWrites].map(([runKey, evidence]) => ({
        runKey,
        evidence,
      })),
      checkpoints: [...checkpointWrites].map(([identityKey, checkpoint]) => ({
        identityKey,
        checkpoint,
      })),
    }),
  };
}

function rejectedFeedResult(
  currentFeedKey: string,
  counts: KrossDryRunFeedCounts,
  failureReason: KrossDryRunFeedFailureReason,
  operation: "reject" | "conflict" = "reject",
): KrossDryRunFeedResult {
  return {
    status: "rejected",
    operation,
    feedKey: currentFeedKey,
    counts,
    checkpointAdvanced: false,
    failureReason,
    canEnterSafeView: false,
    pmsWriteCount: 0,
  };
}

function replayedAttemptResult(
  receipt: KrossDryRunAttemptReceipt,
): KrossDryRunFeedResult {
  return {
    status: receipt.status,
    operation: receipt.status === "accepted" ? "replay" : receipt.operation,
    feedKey: receipt.feedKey,
    counts: { ...receipt.counts },
    checkpointAdvanced: false,
    failureReason: receipt.failureReason,
    canEnterSafeView: false,
    pmsWriteCount: 0,
  };
}

function attemptConflictResult(
  currentFeedKey: string,
  read: number,
  reason:
    | "attempt_conflict"
    | "evidence_conflict"
    | "lease_unavailable"
    | "writer_fenced" = "attempt_conflict",
): KrossDryRunFeedResult {
  return rejectedFeedResult(
    currentFeedKey,
    {
      read,
      accepted: 0,
      rejected: read,
      unchanged: 0,
      changed: 0,
      conflict: read,
    },
    reason,
    "conflict",
  );
}

function attemptEvidence(
  request: KrossDryRunFeedBatchRequest,
  importContext: KrossDryRunImportContext,
  currentFeedKey: string,
  requestFingerprint: string,
  rowLinks: KrossDryRunAttemptRowLink[],
  result: KrossDryRunFeedResult,
) {
  const receiptKey = attemptReceiptKey(
    currentFeedKey,
    importContext.attemptId,
  );
  const currentQuarantineKey =
    result.status === "rejected" ? quarantineKey(receiptKey) : null;
  const receipt: KrossDryRunAttemptReceipt = {
    receiptKey,
    requestFingerprint,
    attemptId: importContext.attemptId,
    feedKey: currentFeedKey,
    artifactHash: importContext.artifactHash,
    sourceAsOf: request.sourceAsOf,
    observedAt: request.observedAt,
    recordedAt: request.nowIso,
    expectedRowCount: request.expectedRowCount,
    rowLinks: rowLinks.map((link) => ({ ...link })),
    status: result.status,
    operation: result.operation,
    counts: { ...result.counts },
    failureReason: result.failureReason,
    checkpointAdvanced: result.checkpointAdvanced,
    quarantineKeys: currentQuarantineKey ? [currentQuarantineKey] : [],
    payloadStored: false,
    readOnly: true,
    pmsWriteCount: 0,
  };
  const quarantine: KrossDryRunQuarantineEvidence | null =
    currentQuarantineKey && result.failureReason
      ? {
          quarantineKey: currentQuarantineKey,
          receiptKey,
          requestFingerprint,
          attemptId: importContext.attemptId,
          feedKey: currentFeedKey,
          artifactHash: importContext.artifactHash,
          sourceAsOf: request.sourceAsOf,
          observedAt: request.observedAt,
          recordedAt: request.nowIso,
          reason: result.failureReason,
          rowLinks: rowLinks.map((link) => ({ ...link })),
          payloadStored: false,
          piiStored: false,
          readOnly: true,
          pmsWriteCount: 0,
        }
      : null;
  return { receipt, quarantine };
}

function persistAttemptOutcome(
  store: KrossDryRunFencedFeedStore,
  lease: KrossDryRunFeedWriterLease,
  request: KrossDryRunFeedBatchRequest,
  importContext: KrossDryRunImportContext,
  currentFeedKey: string,
  requestFingerprint: string,
  rowLinks: KrossDryRunAttemptRowLink[],
  result: KrossDryRunFeedResult,
): KrossDryRunFeedResult {
  const { receipt, quarantine } = attemptEvidence(
    request,
    importContext,
    currentFeedKey,
    requestFingerprint,
    rowLinks,
    result,
  );
  const writeResult = store.appendAttemptEvidenceAtomically({
    lease,
    expectedReceipt: null,
    receipt,
    quarantine,
  });
  if (writeResult === "fenced") {
    return attemptConflictResult(
      currentFeedKey,
      request.rows.length,
      "writer_fenced",
    );
  }
  if (writeResult === "inserted") return result;
  if (writeResult === "replay") {
    const existing = store.getAttemptReceipt(
      currentFeedKey,
      importContext.attemptId,
    );
    if (existing) return replayedAttemptResult(existing);
  }
  const racedReceipt = store.getAttemptReceipt(
    currentFeedKey,
    importContext.attemptId,
  );
  if (racedReceipt) {
    if (racedReceipt.requestFingerprint !== requestFingerprint) {
      return attemptConflictResult(currentFeedKey, request.rows.length);
    }
    const racedQuarantine = store.getQuarantineRecord(
      currentFeedKey,
      importContext.attemptId,
    );
    if (
      evidenceMatches(racedReceipt, receipt) &&
      evidenceMatches(racedQuarantine, quarantine)
    ) {
      return replayedAttemptResult(racedReceipt);
    }
  }
  return attemptConflictResult(
    currentFeedKey,
    request.rows.length,
    "evidence_conflict",
  );
}

export function executeKrossFeedDryRun(
  request: KrossDryRunFeedBatchRequest,
  store: KrossDryRunFencedFeedStore,
): KrossDryRunFeedResult {
  const importContext: KrossDryRunImportContext = {
    artifactHash: request.importContext.artifactHash.trim(),
    attemptId: request.importContext.attemptId.trim(),
    feed: request.importContext.feed.trim(),
  };
  const currentFeedKey = feedKey({ ...request, importContext });
  const baseCounts = feedCounts(request.rows.length);
  const nowMs = Date.parse(request.nowIso);
  const sourceAsOfMs = Date.parse(request.sourceAsOf);
  const observedAtMs = Date.parse(request.observedAt);
  const invalidContext =
    importContextIssues(importContext).length > 0 ||
    !request.adapterConfig.orgId.trim() ||
    !request.adapterConfig.propertyId.trim() ||
    !request.writerLeaseId.trim() ||
    !Number.isFinite(nowMs) ||
    !Number.isFinite(sourceAsOfMs) ||
    !Number.isFinite(observedAtMs) ||
    sourceAsOfMs > observedAtMs ||
    observedAtMs > nowMs;

  if (invalidContext) {
    baseCounts.rejected = baseCounts.read;
    return rejectedFeedResult(currentFeedKey, baseCounts, "invalid_batch");
  }
  const rowLinks = feedRowLinks(request, importContext);
  const requestFingerprint = feedRequestFingerprint(
    currentFeedKey,
    request,
    importContext,
    rowLinks,
  );
  const expectedAttemptReceipt = store.getAttemptReceipt(
    currentFeedKey,
    importContext.attemptId,
  );
  if (expectedAttemptReceipt) {
    if (expectedAttemptReceipt.requestFingerprint === requestFingerprint) {
      return replayedAttemptResult(expectedAttemptReceipt);
    }
    return attemptConflictResult(currentFeedKey, request.rows.length);
  }
  const currentLease = store.getFeedLease(currentFeedKey);
  const leaseAcquisition = store.acquireFeedLeaseAtomically({
    feedKey: currentFeedKey,
    writerId: "kross-feed-dry-run",
    leaseId: request.writerLeaseId.trim(),
    expectedToken: currentLease?.fencingToken ?? 0,
    ttlMs: 60_000,
  });
  if (!leaseAcquisition.lease) {
    return attemptConflictResult(
      currentFeedKey,
      request.rows.length,
      "lease_unavailable",
    );
  }
  const writerLease = leaseAcquisition.lease;
  if (
    !Number.isInteger(request.expectedRowCount) ||
    request.expectedRowCount < 0 ||
    request.expectedRowCount !== request.rows.length
  ) {
    baseCounts.rejected = baseCounts.read;
    return persistAttemptOutcome(
      store,
      writerLease,
      request,
      importContext,
      currentFeedKey,
      requestFingerprint,
      rowLinks,
      rejectedFeedResult(currentFeedKey, baseCounts, "incomplete_batch"),
    );
  }

  const expectedFeedCheckpoint = store.getFeedCheckpoint(currentFeedKey);
  if (expectedFeedCheckpoint) {
    const checkpointSourceAsOf = Date.parse(expectedFeedCheckpoint.sourceAsOf);
    if (sourceAsOfMs < checkpointSourceAsOf) {
      baseCounts.rejected = baseCounts.read;
      return persistAttemptOutcome(
        store,
        writerLease,
        request,
        importContext,
        currentFeedKey,
        requestFingerprint,
        rowLinks,
        rejectedFeedResult(
          currentFeedKey,
          baseCounts,
          "stale_source_as_of",
        ),
      );
    }
    if (sourceAsOfMs === checkpointSourceAsOf) {
      if (
        importContext.artifactHash !== expectedFeedCheckpoint.artifactHash ||
        request.expectedRowCount !== expectedFeedCheckpoint.expectedRowCount
      ) {
        baseCounts.rejected = baseCounts.read;
        baseCounts.conflict = baseCounts.read;
        return persistAttemptOutcome(
          store,
          writerLease,
          request,
          importContext,
          currentFeedKey,
          requestFingerprint,
          rowLinks,
          rejectedFeedResult(
            currentFeedKey,
            baseCounts,
            "same_cut_conflict",
            "conflict",
          ),
        );
      }
      const replayResult: KrossDryRunFeedResult = {
        status: "accepted",
        operation: "replay",
        feedKey: currentFeedKey,
        counts: { ...expectedFeedCheckpoint.counts },
        checkpointAdvanced: false,
        failureReason: null,
        canEnterSafeView: false,
        pmsWriteCount: 0,
      };
      const replayEvidence = attemptEvidence(
        request,
        importContext,
        currentFeedKey,
        requestFingerprint,
        rowLinks,
        replayResult,
      );
      if (
        !replayReceiptIsConsistent(
          replayEvidence.receipt,
          expectedFeedCheckpoint,
          (candidateRunKey) => store.getImportRun(candidateRunKey),
        )
      ) {
        baseCounts.rejected = baseCounts.read;
        baseCounts.conflict = baseCounts.read;
        return persistAttemptOutcome(
          store,
          writerLease,
          request,
          importContext,
          currentFeedKey,
          requestFingerprint,
          rowLinks,
          rejectedFeedResult(
            currentFeedKey,
            baseCounts,
            "same_cut_conflict",
            "conflict",
          ),
        );
      }
      return persistAttemptOutcome(
        store,
        writerLease,
        request,
        importContext,
        currentFeedKey,
        requestFingerprint,
        rowLinks,
        replayResult,
      );
    }
  }

  const overlay = createKrossFeedOverlayStore(store);
  const counts = feedCounts(request.rows.length);
  const identities = new Set<string>();
  let duplicateIdentity = false;

  for (const row of request.rows) {
    const recordHash = row.recordHash.trim();
    const result = executeKrossDryRun(
      {
        payload: row.payload,
        adapterConfig: request.adapterConfig,
        evidence: {
          authorizedTransport: true,
          directFromKross: true,
          readOnly: true,
          sourceAsOf: request.sourceAsOf,
          observedAt: request.observedAt,
          sourceReference: row.sourceReference,
          recordHash,
        },
        importContext,
        nowIso: request.nowIso,
      },
      overlay.store,
    );

    const rowIdentity = result.importRun.identityKey;
    if (rowIdentity && identities.has(rowIdentity)) {
      duplicateIdentity = true;
      counts.rejected += 1;
      counts.conflict += 1;
      continue;
    }
    if (rowIdentity) identities.add(rowIdentity);

    if (result.status === "rejected") {
      counts.rejected += 1;
      if (result.operation === "conflict") counts.conflict += 1;
      continue;
    }

    counts.accepted += 1;
    const priorHash = rowIdentity
      ? store.getMirror(rowIdentity)?.source_hash
      : null;
    if (priorHash === recordHash) counts.unchanged += 1;
    else counts.changed += 1;
  }

  if (duplicateIdentity) {
    return persistAttemptOutcome(
      store,
      writerLease,
      request,
      importContext,
      currentFeedKey,
      requestFingerprint,
      rowLinks,
      rejectedFeedResult(
        currentFeedKey,
        counts,
        "duplicate_identity",
        "conflict",
      ),
    );
  }
  if (counts.rejected > 0) {
    return persistAttemptOutcome(
      store,
      writerLease,
      request,
      importContext,
      currentFeedKey,
      requestFingerprint,
      rowLinks,
      rejectedFeedResult(
        currentFeedKey,
        counts,
        counts.conflict > 0 ? "row_conflict" : "row_rejected",
        counts.conflict > 0 ? "conflict" : "reject",
      ),
    );
  }

  const feedCheckpoint: KrossDryRunFeedCheckpointEvidence = {
    feedKey: currentFeedKey,
    artifactHash: importContext.artifactHash,
    sourceAsOf: request.sourceAsOf,
    observedAt: request.observedAt,
    attemptId: importContext.attemptId,
    expectedRowCount: request.expectedRowCount,
    counts,
  };
  const successfulResult: KrossDryRunFeedResult = {
    status: "accepted",
    operation: "promote",
    feedKey: currentFeedKey,
    counts,
    checkpointAdvanced: true,
    failureReason: null,
    canEnterSafeView: false,
    pmsWriteCount: 0,
  };
  const { receipt: attemptReceipt } = attemptEvidence(
    request,
    importContext,
    currentFeedKey,
    requestFingerprint,
    rowLinks,
    successfulResult,
  );
  const admitted = store.admitFeedAtomically({
    feedKey: currentFeedKey,
    lease: writerLease,
    expectedFeedCheckpoint,
    expectedAttemptReceipt,
    ...overlay.snapshot(),
    feedCheckpoint,
    attemptReceipt,
  });
  if (admitted !== "committed") {
    const racedReceipt = store.getAttemptReceipt(
      currentFeedKey,
      importContext.attemptId,
    );
    if (racedReceipt) {
      return racedReceipt.requestFingerprint === requestFingerprint
        ? replayedAttemptResult(racedReceipt)
        : attemptConflictResult(currentFeedKey, request.rows.length);
    }
    if (admitted === "fenced") {
      return attemptConflictResult(
        currentFeedKey,
        request.rows.length,
        "writer_fenced",
      );
    }
    return persistAttemptOutcome(
      store,
      writerLease,
      request,
      importContext,
      currentFeedKey,
      requestFingerprint,
      rowLinks,
      rejectedFeedResult(
      currentFeedKey,
      {
        ...counts,
        accepted: 0,
        rejected: counts.read,
        unchanged: 0,
        changed: 0,
        conflict: counts.read,
      },
      "checkpoint_changed",
      "conflict",
      ),
    );
  }

  return successfulResult;
}
