import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  createInMemoryKrossDryRunStore,
  executeKrossFeedDryRun,
  type KrossDryRunAttemptEvidenceAdmission,
  type KrossDryRunFeedAtomicAdmission,
  type KrossDryRunFeedBatchRequest,
} from "./dry-run-executor";
import {
  createKrossSupabaseAtomicWriteAdapter,
  mapAttemptEvidenceToKrossSupabaseRequestV1,
  mapFeedAdmissionToKrossSupabaseRequestV1,
  validateKrossSupabaseAtomicWriteRequestV1,
  type KrossSupabaseAtomicWritePort,
  type KrossSupabaseAtomicWriteRequestV1,
  type KrossSupabaseCommitReadbackV1,
} from "./supabase-adapter-boundary";

const orgId = "11111111-1111-1111-1111-111111111111";
const propertyId = "22222222-2222-2222-2222-222222222222";
const feed = "reservations-export";
const feedKey =
  "v1::org=11111111-1111-1111-1111-111111111111" +
  "::property=22222222-2222-2222-2222-222222222222" +
  "::source=Kross::snapshot=reservation_mirror::feed=reservations-export";
const receiptKey = `${feedKey}::attempt=feed-attempt-001`;

const adapterConfig = {
  orgId,
  propertyId,
  fieldMap: {
    externalReservationId: "reservation.id",
    checkIn: "stay.check_in",
    checkOut: "stay.check_out",
    status: "reservation.status",
    roomCodeRaw: "stay.room",
  },
};

function feedRequest(): KrossDryRunFeedBatchRequest {
  return {
    adapterConfig,
    importContext: {
      artifactHash:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      attemptId: "feed-attempt-001",
      feed,
    },
    writerLeaseId: "writer-lease-001",
    sourceAsOf: "2026-09-23T15:10:00.000Z",
    observedAt: "2026-09-23T15:15:00.000Z",
    expectedRowCount: 1,
    rows: [
      {
        payload: {
          reservation: { id: "K-100", status: "confirmed" },
          stay: {
            room: "26",
            check_in: "2026-09-25",
            check_out: "2026-09-27",
          },
        },
        sourceReference: "synthetic://kross/feed/K-100",
        recordHash:
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      },
    ],
    nowIso: "2026-09-23T16:00:00.000Z",
  };
}

function captureFeedAdmission(): KrossDryRunFeedAtomicAdmission {
  const store = createInMemoryKrossDryRunStore({
    now: () => "2026-09-23T16:00:00.000Z",
  });
  let captured: KrossDryRunFeedAtomicAdmission | null = null;
  executeKrossFeedDryRun(feedRequest(), {
    ...store,
    admitFeedAtomically: (admission) => {
      captured = admission;
      return "fenced";
    },
  });
  if (!captured) throw new Error("Expected a feed admission fixture.");
  return captured;
}

function captureAttemptAdmission(): KrossDryRunAttemptEvidenceAdmission {
  const store = createInMemoryKrossDryRunStore({
    now: () => "2026-09-23T16:00:00.000Z",
  });
  let captured: KrossDryRunAttemptEvidenceAdmission | null = null;
  const request = feedRequest();
  request.expectedRowCount = 2;
  executeKrossFeedDryRun(request, {
    ...store,
    appendAttemptEvidenceAtomically: (admission) => {
      captured = admission;
      return "fenced";
    },
  });
  if (!captured) throw new Error("Expected an attempt-evidence fixture.");
  return captured;
}

function captureReplayAttemptAdmission(): KrossDryRunAttemptEvidenceAdmission {
  const store = createInMemoryKrossDryRunStore({
    now: () => "2026-09-23T16:00:00.000Z",
  });
  executeKrossFeedDryRun(feedRequest(), store);
  let captured: KrossDryRunAttemptEvidenceAdmission | null = null;
  const request = feedRequest();
  request.importContext.attemptId = "feed-attempt-002";
  request.writerLeaseId = "writer-lease-002";
  executeKrossFeedDryRun(request, {
    ...store,
    appendAttemptEvidenceAtomically: (admission) => {
      captured = admission;
      return "fenced";
    },
  });
  if (!captured) throw new Error("Expected a replay attempt fixture.");
  return captured;
}

function committedRaw(request: KrossSupabaseAtomicWriteRequestV1) {
  return {
    status: "committed" as const,
    requestId: request.requestId,
    requestHash: request.requestHash,
    commitId: "commit-001",
    commitDigest:
      "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    fencingToken: request.correlation.fencingToken,
  };
}

function exactReadback(
  request: KrossSupabaseAtomicWriteRequestV1,
): KrossSupabaseCommitReadbackV1 {
  return {
    contractVersion: "kross.supabase.atomic-readback.v1",
    requestId: request.requestId,
    requestHash: request.requestHash,
    operation: request.operation,
    scope: { ...request.scope },
    correlation: { ...request.correlation },
    status: "committed",
    commitId: "commit-001",
    commitDigest:
      "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    proof: { ...request.proof },
  };
}

function committedPort(
  writes: KrossSupabaseAtomicWriteRequestV1[],
  reads: number[],
): KrossSupabaseAtomicWritePort {
  return {
    writeOnce: async (request) => {
      writes.push(request);
      return committedRaw(request);
    },
    readback: async () => {
      reads.push(1);
      return exactReadback(writes[0]);
    },
  };
}

function canonicalTestValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalTestValue);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, canonicalTestValue(nested)]),
  );
}

function rehashRequest(
  request: KrossSupabaseAtomicWriteRequestV1,
): KrossSupabaseAtomicWriteRequestV1 {
  const body = structuredClone(request) as unknown as Record<string, unknown>;
  delete body.requestId;
  delete body.requestHash;
  const requestHash = createHash("sha256")
    .update(JSON.stringify(canonicalTestValue(body)))
    .digest("hex");
  return {
    ...body,
    requestId: `sha256:${requestHash}`,
    requestHash,
  } as KrossSupabaseAtomicWriteRequestV1;
}

function hashTestValue(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalTestValue(value)))
    .digest("hex");
}

function refreshFeedRequestEvidence(
  request: KrossSupabaseAtomicWriteRequestV1,
) {
  if (request.operation !== "commit_feed") {
    throw new Error("Expected a feed request fixture.");
  }
  request.proof = {
    feedCheckpointHash: hashTestValue(request.writeSet.feedCheckpoint),
    receiptHash: hashTestValue(request.writeSet.attemptReceipt),
    quarantineHash: null,
    counts: structuredClone(request.writeSet.attemptReceipt.counts),
  };
  return rehashRequest(request);
}

function refreshAttemptRequestEvidence(
  request: KrossSupabaseAtomicWriteRequestV1,
) {
  if (request.operation !== "append_attempt_evidence") {
    throw new Error("Expected an attempt-evidence request fixture.");
  }
  request.proof = {
    feedCheckpointHash: null,
    receiptHash: hashTestValue(request.writeSet.receipt),
    quarantineHash: request.writeSet.quarantine
      ? hashTestValue(request.writeSet.quarantine)
      : null,
    counts: structuredClone(request.writeSet.receipt.counts),
  };
  return rehashRequest(request);
}

function rebindAdmissionScope(
  admission: KrossDryRunFeedAtomicAdmission,
  nextOrgId: string,
  nextPropertyId: string,
) {
  const nextFeedKey =
    `v1::org=${encodeURIComponent(nextOrgId)}` +
    `::property=${encodeURIComponent(nextPropertyId)}` +
    `::source=Kross::snapshot=reservation_mirror::feed=${encodeURIComponent(feed)}`;
  const reservation = admission.mirrors[0].reservation;
  const nextIdentityKey = `${nextOrgId}:${nextPropertyId}:${reservation.external_reservation_id}`;
  const nextRunKey = `${nextFeedKey}::artifact=${admission.feedCheckpoint.artifactHash}` +
    `::record=${reservation.source_hash}`;

  admission.feedKey = nextFeedKey;
  admission.lease.feedKey = nextFeedKey;
  admission.feedCheckpoint.feedKey = nextFeedKey;
  admission.mirrors[0].identityKey = nextIdentityKey;
  reservation.org_id = nextOrgId;
  reservation.property_id = nextPropertyId;
  reservation.source_record_id =
    `${nextPropertyId}:${reservation.external_reservation_id}`;
  admission.expectedMirrors[0].identityKey = nextIdentityKey;
  admission.importRuns[0].runKey = nextRunKey;
  admission.importRuns[0].evidence.runKey = nextRunKey;
  admission.importRuns[0].evidence.identityKey = nextIdentityKey;
  admission.importRuns[0].evidence.orgId = nextOrgId;
  admission.importRuns[0].evidence.propertyId = nextPropertyId;
  admission.expectedImportRuns[0].runKey = nextRunKey;
  admission.checkpoints[0].identityKey = nextIdentityKey;
  admission.checkpoints[0].checkpoint.identityKey = nextIdentityKey;
  admission.checkpoints[0].checkpoint.runKey = nextRunKey;
  admission.expectedCheckpoints[0].identityKey = nextIdentityKey;
  admission.attemptReceipt.feedKey = nextFeedKey;
  admission.attemptReceipt.receiptKey =
    `${nextFeedKey}::attempt=${encodeURIComponent(admission.attemptReceipt.attemptId)}`;
  admission.attemptReceipt.rowLinks[0].runKey = nextRunKey;
  admission.attemptReceipt.requestFingerprint = JSON.stringify({
    version: 1,
    feedKey: nextFeedKey,
    artifactHash: admission.attemptReceipt.artifactHash,
    sourceAsOf: admission.attemptReceipt.sourceAsOf,
    observedAt: admission.attemptReceipt.observedAt,
    expectedRowCount: admission.attemptReceipt.expectedRowCount,
    rowLinks: admission.attemptReceipt.rowLinks,
  });

  return { admission, nextFeedKey };
}

function rejectingPort(counter: { writes: number; reads: number }) {
  return {
    writeOnce: async (request: KrossSupabaseAtomicWriteRequestV1) => {
      counter.writes += 1;
      return {
        status: "conflict" as const,
        requestId: request.requestId,
        requestHash: request.requestHash,
        conflictCode: "unexpected_remote_write",
      };
    },
    readback: async () => {
      counter.reads += 1;
      return null;
    },
  };
}

describe("Kross Supabase atomic-write boundary", () => {
  it("commits one feed request only after an exact correlated readback", async () => {
    const writes: KrossSupabaseAtomicWriteRequestV1[] = [];
    const reads: number[] = [];
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: committedPort(writes, reads),
    });

    const result = await adapter.commitFeed(captureFeedAdmission());

    expect(result).toMatchObject({
      status: "committed",
      readbackVerified: true,
      retryPolicy: "never_automatic",
      commitId: "commit-001",
    });
    expect(writes).toHaveLength(1);
    expect(reads).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      contractVersion: "kross.supabase.atomic-write.v1",
      operation: "commit_feed",
      scope: {
        orgId,
        propertyId,
        feed,
        feedKey,
        sourceSystem: "Kross",
        snapshotKind: "reservation_mirror",
      },
      correlation: {
        feedKey,
        attemptId: "feed-attempt-001",
        writerId: "kross-feed-dry-run",
        leaseId: "writer-lease-001",
        fencingToken: 1,
        receiptKey,
      },
    });
    expect(writes[0].requestId).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(writes[0].requestHash).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.isFrozen(writes[0])).toBe(true);
    expect(Object.isFrozen(writes[0].scope)).toBe(true);
    if (writes[0].operation === "commit_feed") {
      expect(Object.isFrozen(writes[0].writeSet.mirrors)).toBe(true);
      expect(Object.isFrozen(writes[0].writeSet.attemptReceipt)).toBe(true);
    }
  });

  it("allowlists the write request and excludes payload, references, PII and secrets", async () => {
    const admission = captureFeedAdmission();
    const unsafeReservation = admission.mirrors[0].reservation as unknown as Record<
      string,
      unknown
    >;
    const unsafeRun = admission.importRuns[0].evidence as unknown as Record<
      string,
      unknown
    >;
    unsafeReservation.guestName = "PRIVATE-GUEST-NAME";
    unsafeReservation.phone = "+506-PRIVATE-PHONE";
    unsafeRun.sourceReference = "secret://PRIVATE-SOURCE-REFERENCE";
    unsafeRun.payload = { guest: "PRIVATE-PAYLOAD" };
    unsafeRun.service_role = "PRIVATE-SERVICE-ROLE";
    admission.attemptReceipt.requestFingerprint =
      `{"version":1,"feedKey":"PRIVATE-FINGERPRINT-SECRET",` +
      `"feedKey":${JSON.stringify(admission.attemptReceipt.feedKey)},` +
      `"artifactHash":${JSON.stringify(admission.attemptReceipt.artifactHash)},` +
      `"sourceAsOf":${JSON.stringify(admission.attemptReceipt.sourceAsOf)},` +
      `"observedAt":${JSON.stringify(admission.attemptReceipt.observedAt)},` +
      `"expectedRowCount":${admission.attemptReceipt.expectedRowCount},` +
      `"rowLinks":${JSON.stringify(admission.attemptReceipt.rowLinks)}}`;
    const writes: KrossSupabaseAtomicWriteRequestV1[] = [];
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async (request) => {
          writes.push(request);
          return {
            status: "conflict",
            requestId: request.requestId,
            requestHash: request.requestHash,
            conflictCode: "checkpoint_changed",
          };
        },
        readback: async () => null,
      },
    });

    await adapter.commitFeed(admission);

    const serialized = JSON.stringify(writes[0]);
    expect(serialized).not.toContain("PRIVATE-GUEST-NAME");
    expect(serialized).not.toContain("PRIVATE-PHONE");
    expect(serialized).not.toContain("PRIVATE-SOURCE-REFERENCE");
    expect(serialized).not.toContain("PRIVATE-PAYLOAD");
    expect(serialized).not.toContain("PRIVATE-SERVICE-ROLE");
    expect(serialized).not.toContain("PRIVATE-FINGERPRINT-SECRET");
    expect(serialized).not.toContain("sourceReference");
    expect(serialized).not.toContain('"payload"');
    expect(serialized).not.toContain('"service_role"');
  });

  it("regenerates receipt and quarantine fingerprints before attempt evidence crosses the port", async () => {
    const admission = captureAttemptAdmission();
    if (!admission.quarantine) throw new Error("Expected quarantine fixture.");
    const duplicateKeyFingerprint =
      `{"version":1,"feedKey":"PRIVATE-FINGERPRINT-SECRET",` +
      `"feedKey":${JSON.stringify(admission.receipt.feedKey)},` +
      `"artifactHash":${JSON.stringify(admission.receipt.artifactHash)},` +
      `"sourceAsOf":${JSON.stringify(admission.receipt.sourceAsOf)},` +
      `"observedAt":${JSON.stringify(admission.receipt.observedAt)},` +
      `"expectedRowCount":${admission.receipt.expectedRowCount},` +
      `"rowLinks":${JSON.stringify(admission.receipt.rowLinks)}}`;
    admission.receipt.requestFingerprint = duplicateKeyFingerprint;
    admission.quarantine.requestFingerprint = duplicateKeyFingerprint;
    const writes: KrossSupabaseAtomicWriteRequestV1[] = [];
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async (request) => {
          writes.push(request);
          return {
            status: "conflict",
            requestId: request.requestId,
            requestHash: request.requestHash,
            conflictCode: "checkpoint_changed",
          };
        },
        readback: async () => null,
      },
    });

    await adapter.appendAttemptEvidence(admission);

    expect(writes).toHaveLength(1);
    expect(JSON.stringify(writes[0])).not.toContain(
      "PRIVATE-FINGERPRINT-SECRET",
    );
  });

  it.each([
    ["claims promotion", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence") throw new Error("Expected attempt.");
      request.writeSet.receipt.operation = "promote";
    }],
    ["claims checkpoint advancement", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence") throw new Error("Expected attempt.");
      request.writeSet.receipt.checkpointAdvanced = true;
    }],
    ["declares a different expected row count", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence") throw new Error("Expected attempt.");
      request.writeSet.receipt.expectedRowCount = 999;
      request.writeSet.receipt.requestFingerprint = JSON.stringify({
        version: 1,
        feedKey: request.writeSet.receipt.feedKey,
        artifactHash: request.writeSet.receipt.artifactHash,
        sourceAsOf: request.writeSet.receipt.sourceAsOf,
        observedAt: request.writeSet.receipt.observedAt,
        expectedRowCount: request.writeSet.receipt.expectedRowCount,
        rowLinks: request.writeSet.receipt.rowLinks,
      });
    }],
    ["contains an unresolved row link", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence") throw new Error("Expected attempt.");
      request.writeSet.receipt.rowLinks[0] = {
        ordinal: 0,
        runKey: null,
        recordHash: null,
      };
      request.writeSet.receipt.requestFingerprint = JSON.stringify({
        version: 1,
        feedKey: request.writeSet.receipt.feedKey,
        artifactHash: request.writeSet.receipt.artifactHash,
        sourceAsOf: request.writeSet.receipt.sourceAsOf,
        observedAt: request.writeSet.receipt.observedAt,
        expectedRowCount: request.writeSet.receipt.expectedRowCount,
        rowLinks: request.writeSet.receipt.rowLinks,
      });
    }],
  ] as const)("rejects accepted replay evidence that %s", (_label, mutate) => {
    const mapped = mapAttemptEvidenceToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureReplayAttemptAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid replay fixture.");
    const request = structuredClone(mapped.request);
    mutate(request);

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshAttemptRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it.each([
    ["claims promotion", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence") throw new Error("Expected attempt.");
      request.writeSet.receipt.operation = "promote";
    }],
    ["claims checkpoint advancement", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence") throw new Error("Expected attempt.");
      request.writeSet.receipt.checkpointAdvanced = true;
    }],
  ] as const)("rejects rejected attempt evidence that %s", (_label, mutate) => {
    const mapped = mapAttemptEvidenceToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureAttemptAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid rejected fixture.");
    const request = structuredClone(mapped.request);
    mutate(request);

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshAttemptRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it.each([
    ["uses conflict for incomplete_batch", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence") throw new Error("Expected attempt.");
      request.writeSet.receipt.operation = "conflict";
    }],
    ["uses reject for row_conflict", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence" || !request.writeSet.quarantine) {
        throw new Error("Expected rejected attempt.");
      }
      request.writeSet.receipt.failureReason = "row_conflict";
      request.writeSet.receipt.counts.conflict = 1;
      request.writeSet.quarantine.reason = "row_conflict";
    }],
    ["reports conflict without a conflicting row", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence" || !request.writeSet.quarantine) {
        throw new Error("Expected rejected attempt.");
      }
      request.writeSet.receipt.operation = "conflict";
      request.writeSet.receipt.failureReason = "row_conflict";
      request.writeSet.quarantine.reason = "row_conflict";
    }],
    ["rejects a non-empty incomplete batch with zero rejected rows", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence") throw new Error("Expected attempt.");
      request.writeSet.receipt.counts.accepted = 1;
      request.writeSet.receipt.counts.rejected = 0;
      request.writeSet.receipt.counts.changed = 1;
      request.writeSet.receipt.counts.unchanged = 0;
    }],
    ["persists an invalid_batch that never reaches evidence admission", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence" || !request.writeSet.quarantine) {
        throw new Error("Expected rejected attempt.");
      }
      request.writeSet.receipt.failureReason = "invalid_batch";
      request.writeSet.quarantine.reason = "invalid_batch";
    }],
    ["uses a partial row reason with an incomplete expected count", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence" || !request.writeSet.quarantine) {
        throw new Error("Expected rejected attempt.");
      }
      request.writeSet.receipt.failureReason = "row_rejected";
      request.writeSet.quarantine.reason = "row_rejected";
    }],
    ["labels a complete row set as incomplete_batch", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "append_attempt_evidence" || !request.writeSet.quarantine) {
        throw new Error("Expected rejected attempt.");
      }
      request.writeSet.receipt.expectedRowCount =
        request.writeSet.receipt.rowLinks.length;
      request.writeSet.receipt.requestFingerprint = JSON.stringify({
        version: 1,
        feedKey: request.writeSet.receipt.feedKey,
        artifactHash: request.writeSet.receipt.artifactHash,
        sourceAsOf: request.writeSet.receipt.sourceAsOf,
        observedAt: request.writeSet.receipt.observedAt,
        expectedRowCount: request.writeSet.receipt.expectedRowCount,
        rowLinks: request.writeSet.receipt.rowLinks,
      });
      request.writeSet.quarantine.requestFingerprint =
        request.writeSet.receipt.requestFingerprint;
    }],
  ] as const)("rejects attempt evidence that %s", (_label, mutate) => {
    const mapped = mapAttemptEvidenceToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureAttemptAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid rejected fixture.");
    const request = structuredClone(mapped.request);
    mutate(request);

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshAttemptRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it("derives deterministic request identity and changes it when fencing changes", () => {
    const admission = captureFeedAdmission();
    const first = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      admission,
    );
    const exact = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      admission,
    );
    const nextFence = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      {
        ...admission,
        lease: {
          ...admission.lease,
          fencingToken: admission.lease.fencingToken + 1,
        },
      },
    );

    expect(first.ok).toBe(true);
    expect(exact).toEqual(first);
    expect(nextFence.ok).toBe(true);
    if (!first.ok || !nextFence.ok) throw new Error("Expected valid requests.");
    expect(nextFence.request.requestId).not.toBe(first.request.requestId);
    expect(nextFence.request.requestHash).not.toBe(first.request.requestHash);
  });

  it("rejects a mutated request before the port can write", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid request fixture.");
    const mutated = {
      ...mapped.request,
      unexpectedSecret: "must-not-cross-boundary",
    };
    expect(validateKrossSupabaseAtomicWriteRequestV1(mutated)).toBe(false);
  });

  it("rejects an unknown nested reservation field even after a valid rehash", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid request fixture.");
    const mutated = structuredClone(mapped.request);
    if (mutated.operation !== "commit_feed") {
      throw new Error("Expected a feed request fixture.");
    }
    const unsafeReservation = mutated.writeSet.mirrors[0]
      .reservation as unknown as Record<string, unknown>;
    unsafeReservation.full_name = "PRIVATE NAME";
    const rehashed = rehashRequest(mutated);
    expect(validateKrossSupabaseAtomicWriteRequestV1(rehashed)).toBe(false);
  });

  it("rejects sparse evidence arrays instead of skipping their holes", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const mutated = structuredClone(mapped.request);
    mutated.expected.mirrors = [];
    mutated.expected.importRuns = [];
    mutated.expected.checkpoints = [];
    mutated.writeSet.mirrors = [];
    mutated.writeSet.importRuns = [];
    mutated.writeSet.checkpoints = [];
    const sparseRowLinks = new Array(1) as typeof mutated.writeSet.attemptReceipt.rowLinks;
    mutated.writeSet.attemptReceipt.rowLinks = sparseRowLinks;
    mutated.writeSet.attemptReceipt.requestFingerprint = JSON.stringify({
      version: 1,
      feedKey: mutated.writeSet.attemptReceipt.feedKey,
      artifactHash: mutated.writeSet.attemptReceipt.artifactHash,
      sourceAsOf: mutated.writeSet.attemptReceipt.sourceAsOf,
      observedAt: mutated.writeSet.attemptReceipt.observedAt,
      expectedRowCount: mutated.writeSet.attemptReceipt.expectedRowCount,
      rowLinks: sparseRowLinks,
    });
    mutated.proof.receiptHash = hashTestValue(
      mutated.writeSet.attemptReceipt,
    );
    const rehashed = rehashRequest(mutated);
    expect(validateKrossSupabaseAtomicWriteRequestV1(rehashed)).toBe(false);
  });

  it("rejects an orphan mirror even when its CAS evidence and hash are self-consistent", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const mutated = structuredClone(mapped.request);
    const reservation = structuredClone(mutated.writeSet.mirrors[0].reservation);
    reservation.external_reservation_id = "K-200";
    reservation.source_record_id = `${propertyId}:K-200`;
    reservation.source_hash =
      "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
    const identityKey = `${orgId}:${propertyId}:K-200`;
    mutated.writeSet.mirrors.push({ identityKey, reservation });
    mutated.expected.mirrors.push({ identityKey, expected: null });
    const rehashed = rehashRequest(mutated);
    expect(validateKrossSupabaseAtomicWriteRequestV1(rehashed)).toBe(false);
  });

  it("accepts an unchanged row that safely refreshes its cut with a staged update", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    const priorMirror = structuredClone(request.writeSet.mirrors[0].reservation);
    priorMirror.snapshot_as_of = "2026-09-23T15:09:00.000Z";
    priorMirror.last_synced_at = "2026-09-23T15:14:00.000Z";
    request.expected.mirrors[0].expected = priorMirror;
    request.expected.checkpoints[0].expected = {
      identityKey: request.writeSet.checkpoints[0].identityKey,
      runKey:
        `${feedKey}::artifact=${"e".repeat(64)}` +
        `::record=${priorMirror.source_hash}`,
      sourceAsOf: priorMirror.snapshot_as_of,
      recordHash: priorMirror.source_hash,
    };
    request.writeSet.importRuns[0].evidence.operation = "update";
    request.writeSet.feedCheckpoint.counts.changed = 0;
    request.writeSet.feedCheckpoint.counts.unchanged = 1;
    request.writeSet.attemptReceipt.counts.changed = 0;
    request.writeSet.attemptReceipt.counts.unchanged = 1;

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(true);
  });

  it("rejects insert for a row that already has a prior mirror", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    const priorMirror = structuredClone(request.writeSet.mirrors[0].reservation);
    priorMirror.snapshot_as_of = "2026-09-23T15:09:00.000Z";
    priorMirror.last_synced_at = "2026-09-23T15:14:00.000Z";
    request.expected.mirrors[0].expected = priorMirror;
    request.expected.checkpoints[0].expected = {
      identityKey: request.writeSet.checkpoints[0].identityKey,
      runKey:
        `${feedKey}::artifact=${"e".repeat(64)}` +
        `::record=${priorMirror.source_hash}`,
      sourceAsOf: priorMirror.snapshot_as_of,
      recordHash: priorMirror.source_hash,
    };
    request.writeSet.importRuns[0].evidence.operation = "insert";
    request.writeSet.feedCheckpoint.counts.changed = 0;
    request.writeSet.feedCheckpoint.counts.unchanged = 1;
    request.writeSet.attemptReceipt.counts.changed = 0;
    request.writeSet.attemptReceipt.counts.unchanged = 1;

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it("accepts an expected-only unchanged replay without row writes", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    request.expected.mirrors[0].expected = structuredClone(
      request.writeSet.mirrors[0].reservation,
    );
    request.expected.importRuns[0].expected = structuredClone(
      request.writeSet.importRuns[0].evidence,
    );
    request.expected.checkpoints[0].expected = structuredClone(
      request.writeSet.checkpoints[0].checkpoint,
    );
    request.expected.checkpoints[0].expected.runKey =
      `${feedKey}::artifact=${"e".repeat(64)}` +
      `::record=${request.expected.checkpoints[0].expected.recordHash}`;
    request.writeSet.mirrors = [];
    request.writeSet.importRuns = [];
    request.writeSet.checkpoints = [];
    request.writeSet.feedCheckpoint.counts.changed = 0;
    request.writeSet.feedCheckpoint.counts.unchanged = 1;
    request.writeSet.attemptReceipt.counts.changed = 0;
    request.writeSet.attemptReceipt.counts.unchanged = 1;

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(true);
  });

  it("rejects an expected-only row from an older cut when advancing the feed", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    request.expected.mirrors[0].expected = structuredClone(
      request.writeSet.mirrors[0].reservation,
    );
    request.expected.importRuns[0].expected = structuredClone(
      request.writeSet.importRuns[0].evidence,
    );
    request.expected.checkpoints[0].expected = structuredClone(
      request.writeSet.checkpoints[0].checkpoint,
    );
    request.writeSet.mirrors = [];
    request.writeSet.importRuns = [];
    request.writeSet.checkpoints = [];
    request.writeSet.feedCheckpoint.counts.changed = 0;
    request.writeSet.feedCheckpoint.counts.unchanged = 1;
    request.writeSet.attemptReceipt.counts.changed = 0;
    request.writeSet.attemptReceipt.counts.unchanged = 1;
    request.writeSet.feedCheckpoint.sourceAsOf =
      "2026-09-23T15:11:00.000Z";
    request.writeSet.attemptReceipt.sourceAsOf =
      request.writeSet.feedCheckpoint.sourceAsOf;
    request.writeSet.attemptReceipt.requestFingerprint = JSON.stringify({
      version: 1,
      feedKey: request.writeSet.attemptReceipt.feedKey,
      artifactHash: request.writeSet.attemptReceipt.artifactHash,
      sourceAsOf: request.writeSet.attemptReceipt.sourceAsOf,
      observedAt: request.writeSet.attemptReceipt.observedAt,
      expectedRowCount: request.writeSet.attemptReceipt.expectedRowCount,
      rowLinks: request.writeSet.attemptReceipt.rowLinks,
    });

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it("rejects a row transition that rolls back a newer mirror cut", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    const priorHash = "f".repeat(64);
    const priorMirror = structuredClone(request.writeSet.mirrors[0].reservation);
    priorMirror.source_hash = priorHash;
    priorMirror.snapshot_as_of = "2026-09-23T15:11:00.000Z";
    priorMirror.last_synced_at = "2026-09-23T15:14:00.000Z";
    request.expected.mirrors[0].expected = priorMirror;
    request.expected.checkpoints[0].expected = {
      identityKey: request.writeSet.checkpoints[0].identityKey,
      runKey:
        `${feedKey}::artifact=${"e".repeat(64)}` +
        `::record=${priorHash}`,
      sourceAsOf: priorMirror.snapshot_as_of,
      recordHash: priorHash,
    };
    request.writeSet.importRuns[0].evidence.operation = "update";

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it("rejects a same-cut row transition with a different record hash", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    const priorHash = "f".repeat(64);
    const priorMirror = structuredClone(request.writeSet.mirrors[0].reservation);
    priorMirror.source_hash = priorHash;
    request.expected.mirrors[0].expected = priorMirror;
    request.expected.checkpoints[0].expected = {
      identityKey: request.writeSet.checkpoints[0].identityKey,
      runKey:
        `${feedKey}::artifact=${"e".repeat(64)}` +
        `::record=${priorHash}`,
      sourceAsOf: priorMirror.snapshot_as_of,
      recordHash: priorHash,
    };
    request.writeSet.importRuns[0].evidence.operation = "update";

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it("rejects update for a row with no prior mirror", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    request.writeSet.importRuns[0].evidence.operation = "update";

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it.each([
    ["equal", "2026-09-23T15:10:00.000Z"],
    ["newer", "2026-09-23T15:11:00.000Z"],
  ] as const)(
    "rejects a feed checkpoint whose expected cut is %s to the promoted cut",
    (_label, priorSourceAsOf) => {
      const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
        { orgId, propertyId, feed },
        captureFeedAdmission(),
      );
      if (!mapped.ok || mapped.request.operation !== "commit_feed") {
        throw new Error("Expected a valid feed request fixture.");
      }
      const request = structuredClone(mapped.request);
      request.expected.feedCheckpoint = structuredClone(
        request.writeSet.feedCheckpoint,
      );
      request.expected.feedCheckpoint.artifactHash = "e".repeat(64);
      request.expected.feedCheckpoint.attemptId = "prior-attempt";
      request.expected.feedCheckpoint.sourceAsOf = priorSourceAsOf;
      request.expected.feedCheckpoint.observedAt =
        "2026-09-23T15:12:00.000Z";

      expect(
        validateKrossSupabaseAtomicWriteRequestV1(
          refreshFeedRequestEvidence(request),
        ),
      ).toBe(false);
    },
  );

  it("rejects a feed cut observed before its source timestamp", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    const observedAt = "2026-09-23T15:09:00.000Z";
    request.writeSet.feedCheckpoint.observedAt = observedAt;
    request.writeSet.attemptReceipt.observedAt = observedAt;
    request.writeSet.importRuns[0].evidence.observedAt = observedAt;
    request.writeSet.mirrors[0].reservation.last_synced_at = observedAt;
    request.writeSet.attemptReceipt.requestFingerprint = JSON.stringify({
      version: 1,
      feedKey: request.writeSet.attemptReceipt.feedKey,
      artifactHash: request.writeSet.attemptReceipt.artifactHash,
      sourceAsOf: request.writeSet.attemptReceipt.sourceAsOf,
      observedAt,
      expectedRowCount: request.writeSet.attemptReceipt.expectedRowCount,
      rowLinks: request.writeSet.attemptReceipt.rowLinks,
    });

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it("rejects a feed cut observed after its receipt was recorded", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    const observedAt = "2026-09-23T16:01:00.000Z";
    request.writeSet.feedCheckpoint.observedAt = observedAt;
    request.writeSet.attemptReceipt.observedAt = observedAt;
    request.writeSet.importRuns[0].evidence.observedAt = observedAt;
    request.writeSet.mirrors[0].reservation.last_synced_at = observedAt;
    request.writeSet.attemptReceipt.requestFingerprint = JSON.stringify({
      version: 1,
      feedKey: request.writeSet.attemptReceipt.feedKey,
      artifactHash: request.writeSet.attemptReceipt.artifactHash,
      sourceAsOf: request.writeSet.attemptReceipt.sourceAsOf,
      observedAt,
      expectedRowCount: request.writeSet.attemptReceipt.expectedRowCount,
      rowLinks: request.writeSet.attemptReceipt.rowLinks,
    });

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it("accepts a staged replay run without a redundant mirror or checkpoint write", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    request.expected.mirrors[0].expected = structuredClone(
      request.writeSet.mirrors[0].reservation,
    );
    request.expected.checkpoints[0].expected = structuredClone(
      request.writeSet.checkpoints[0].checkpoint,
    );
    request.writeSet.importRuns[0].evidence.operation = "replay";
    request.writeSet.mirrors = [];
    request.writeSet.checkpoints = [];
    request.writeSet.feedCheckpoint.counts.changed = 0;
    request.writeSet.feedCheckpoint.counts.unchanged = 1;
    request.writeSet.attemptReceipt.counts.changed = 0;
    request.writeSet.attemptReceipt.counts.unchanged = 1;

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(true);
  });

  it.each([
    ["accepted conflict operation", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "commit_feed") throw new Error("Expected feed.");
      request.writeSet.importRuns[0].evidence.operation = "conflict";
    }],
    ["accepted quarantine reason", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "commit_feed") throw new Error("Expected feed.");
      request.writeSet.importRuns[0].evidence.quarantineReason =
        "checkpoint_changed";
    }],
    ["counts contradicted by prior hash", (request: KrossSupabaseAtomicWriteRequestV1) => {
      if (request.operation !== "commit_feed") throw new Error("Expected feed.");
      request.writeSet.feedCheckpoint.counts.changed = 0;
      request.writeSet.feedCheckpoint.counts.unchanged = 1;
      request.writeSet.attemptReceipt.counts.changed = 0;
      request.writeSet.attemptReceipt.counts.unchanged = 1;
    }],
  ] as const)("rejects %s even after a self-consistent rehash", (_label, mutate) => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid feed request fixture.");
    const request = structuredClone(mapped.request);
    mutate(request);

    expect(
      validateKrossSupabaseAtomicWriteRequestV1(
        refreshFeedRequestEvidence(request),
      ),
    ).toBe(false);
  });

  it("returns false instead of throwing for cyclic untrusted request material", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const mutated = structuredClone(mapped.request);
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    mutated.writeSet.mirrors[0].reservation.status = cycle as never;

    expect(() => validateKrossSupabaseAtomicWriteRequestV1(mutated)).not.toThrow();
    expect(validateKrossSupabaseAtomicWriteRequestV1(mutated)).toBe(false);
  });

  it("fails closed on over-wide untrusted material without throwing", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok || mapped.request.operation !== "commit_feed") {
      throw new Error("Expected a valid feed request fixture.");
    }
    const request = structuredClone(mapped.request);
    request.writeSet.attemptReceipt.quarantineKeys = Array.from(
      { length: 10_001 },
      (_, index) => `q-${index}`,
    );

    expect(() => validateKrossSupabaseAtomicWriteRequestV1(request)).not.toThrow();
    expect(validateKrossSupabaseAtomicWriteRequestV1(request)).toBe(false);
  });

  it.each([
    ["source record identity", (value: KrossDryRunFeedAtomicAdmission) => {
      value.mirrors[0].reservation.source_record_id = "foreign-property:K-100";
    }],
    ["observation timestamp", (value: KrossDryRunFeedAtomicAdmission) => {
      value.mirrors[0].reservation.last_synced_at =
        "2026-09-23T15:16:00.000Z";
    }],
    ["mirror identity", (value: KrossDryRunFeedAtomicAdmission) => {
      value.mirrors[0].identityKey = "foreign:property:reservation";
    }],
    ["expected mirror identity", (value: KrossDryRunFeedAtomicAdmission) => {
      value.expectedMirrors[0].identityKey = "foreign:property:reservation";
    }],
    ["run key", (value: KrossDryRunFeedAtomicAdmission) => {
      value.importRuns[0].runKey = `${feedKey}::artifact=foreign::record=foreign`;
    }],
    ["expected run key", (value: KrossDryRunFeedAtomicAdmission) => {
      value.expectedImportRuns[0].runKey = `${feedKey}::artifact=foreign::record=foreign`;
    }],
    ["checkpoint identity", (value: KrossDryRunFeedAtomicAdmission) => {
      value.checkpoints[0].identityKey = "foreign:property:reservation";
    }],
    ["inner checkpoint identity", (value: KrossDryRunFeedAtomicAdmission) => {
      value.checkpoints[0].checkpoint.identityKey = "foreign:property:reservation";
    }],
    ["checkpoint run key", (value: KrossDryRunFeedAtomicAdmission) => {
      value.checkpoints[0].checkpoint.runKey = `${feedKey}::artifact=foreign::record=foreign`;
    }],
    ["expected checkpoint identity", (value: KrossDryRunFeedAtomicAdmission) => {
      value.expectedCheckpoints[0].identityKey = "foreign:property:reservation";
    }],
    ["receipt row link", (value: KrossDryRunFeedAtomicAdmission) => {
      value.attemptReceipt.rowLinks[0].runKey = `${feedKey}::artifact=foreign::record=foreign`;
    }],
  ] as const)(
    "rejects non-canonical feed %s before the port can write",
    async (_label, mutate) => {
      const admission = structuredClone(captureFeedAdmission());
      mutate(admission);
      const counter = { writes: 0, reads: 0 };
      const adapter = createKrossSupabaseAtomicWriteAdapter({
        scope: { orgId, propertyId, feed },
        port: rejectingPort(counter),
      });

      const result = await adapter.commitFeed(admission);

      expect(result).toMatchObject({
        status: "error",
        errorKind: "invalid_scope",
        retryPolicy: "never_automatic",
      });
      expect(counter).toEqual({ writes: 0, reads: 0 });
    },
  );

  it("rejects a fully self-consistent non-UUID tenant scope", async () => {
    const { admission } = rebindAdmissionScope(
      structuredClone(captureFeedAdmission()),
      "tenant:west",
      "hotel:one",
    );
    const counter = { writes: 0, reads: 0 };
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId: "tenant:west", propertyId: "hotel:one", feed },
      port: rejectingPort(counter),
    });

    const result = await adapter.commitFeed(admission);

    expect(result).toMatchObject({
      status: "error",
      errorKind: "invalid_scope",
      retryPolicy: "never_automatic",
    });
    expect(counter).toEqual({ writes: 0, reads: 0 });
  });

  it("rejects uppercase UUID scope instead of creating a second textual identity", async () => {
    const uppercaseOrgId = "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA";
    const { admission } = rebindAdmissionScope(
      structuredClone(captureFeedAdmission()),
      uppercaseOrgId,
      propertyId,
    );
    const counter = { writes: 0, reads: 0 };
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId: uppercaseOrgId, propertyId, feed },
      port: rejectingPort(counter),
    });

    const result = await adapter.commitFeed(admission);

    expect(result).toMatchObject({
      status: "error",
      errorKind: "invalid_scope",
      retryPolicy: "never_automatic",
    });
    expect(counter).toEqual({ writes: 0, reads: 0 });
  });

  it("captures the authorized scope when the adapter is created", async () => {
    const scope = { orgId, propertyId, feed };
    const writes: KrossSupabaseAtomicWriteRequestV1[] = [];
    const reads: number[] = [];
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope,
      port: committedPort(writes, reads),
    });
    scope.propertyId = "33333333-3333-3333-3333-333333333333";

    const result = await adapter.commitFeed(captureFeedAdmission());

    expect(result.status).toBe("committed");
    expect(writes).toHaveLength(1);
    expect(writes[0].scope).toMatchObject({ orgId, propertyId });
  });

  it.each(["mirrors", "importRuns", "checkpoints"] as const)(
    "rejects a rehashed request missing the %s CAS precondition",
    (collection) => {
      const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
        { orgId, propertyId, feed },
        captureFeedAdmission(),
      );
      if (!mapped.ok) throw new Error("Expected a valid request fixture.");
      const mutated = structuredClone(mapped.request);
      if (mutated.operation !== "commit_feed") {
        throw new Error("Expected a feed request fixture.");
      }
      mutated.expected[collection] = [];
      const rehashed = rehashRequest(mutated);
      expect(validateKrossSupabaseAtomicWriteRequestV1(rehashed)).toBe(false);
    },
  );

  it("rejects a rehashed feed request that turns an append-only run into overwrite CAS", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid request fixture.");
    const mutated = structuredClone(mapped.request);
    if (mutated.operation !== "commit_feed") {
      throw new Error("Expected a feed request fixture.");
    }
    mutated.expected.importRuns[0].expected = structuredClone(
      mutated.writeSet.importRuns[0].evidence,
    );
    const rehashed = rehashRequest(mutated);
    expect(validateKrossSupabaseAtomicWriteRequestV1(rehashed)).toBe(false);
  });

  it("rejects a rehashed feed request that turns an append-only receipt into overwrite CAS", () => {
    const mapped = mapFeedAdmissionToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureFeedAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid request fixture.");
    const mutated = structuredClone(mapped.request);
    if (mutated.operation !== "commit_feed") {
      throw new Error("Expected a feed request fixture.");
    }
    mutated.expected.attemptReceipt = structuredClone(
      mutated.writeSet.attemptReceipt,
    );
    const rehashed = rehashRequest(mutated);
    expect(validateKrossSupabaseAtomicWriteRequestV1(rehashed)).toBe(false);
  });

  it("rejects rehashed attempt evidence that turns its receipt into overwrite CAS", () => {
    const mapped = mapAttemptEvidenceToKrossSupabaseRequestV1(
      { orgId, propertyId, feed },
      captureAttemptAdmission(),
    );
    if (!mapped.ok) throw new Error("Expected a valid request fixture.");
    const mutated = structuredClone(mapped.request);
    if (mutated.operation !== "append_attempt_evidence") {
      throw new Error("Expected attempt-evidence request fixture.");
    }
    mutated.expected.receipt = structuredClone(mutated.writeSet.receipt);
    const rehashed = rehashRequest(mutated);
    expect(validateKrossSupabaseAtomicWriteRequestV1(rehashed)).toBe(false);
  });

  it.each([
    ["receipt row link", (value: KrossDryRunAttemptEvidenceAdmission) => {
      value.receipt.rowLinks[0].runKey = `${feedKey}::artifact=foreign::record=foreign`;
    }],
    ["quarantine row link", (value: KrossDryRunAttemptEvidenceAdmission) => {
      if (!value.quarantine) throw new Error("Expected quarantine fixture.");
      value.quarantine.rowLinks[0].runKey = `${feedKey}::artifact=foreign::record=foreign`;
    }],
  ] as const)(
    "rejects non-canonical attempt %s before the port can write",
    async (_label, mutate) => {
      const admission = structuredClone(captureAttemptAdmission());
      mutate(admission);
      const counter = { writes: 0, reads: 0 };
      const adapter = createKrossSupabaseAtomicWriteAdapter({
        scope: { orgId, propertyId, feed },
        port: rejectingPort(counter),
      });

      const result = await adapter.appendAttemptEvidence(admission);

      expect(result).toMatchObject({
        status: "error",
        errorKind: "invalid_scope",
        retryPolicy: "never_automatic",
      });
      expect(counter).toEqual({ writes: 0, reads: 0 });
    },
  );

  it.each(["conflict", "fenced", "error"] as const)(
    "returns remote %s without readback or automatic retry",
    async (status) => {
      let writes = 0;
      let reads = 0;
      const adapter = createKrossSupabaseAtomicWriteAdapter({
        scope: { orgId, propertyId, feed },
        port: {
          writeOnce: async (request) => {
            writes += 1;
            if (status === "conflict") {
              return {
                status,
                requestId: request.requestId,
                requestHash: request.requestHash,
                conflictCode: "checkpoint_changed",
              };
            }
            if (status === "fenced") {
              return {
                status,
                requestId: request.requestId,
                requestHash: request.requestHash,
                observedFencingToken: 2,
              };
            }
            return {
              status,
              requestId: request.requestId,
              requestHash: request.requestHash,
              errorKind: "known_unsent",
            };
          },
          readback: async () => {
            reads += 1;
            return null;
          },
        },
      });

      const result = await adapter.commitFeed(captureFeedAdmission());

      expect(result.status).toBe(status);
      expect(result.retryPolicy).toBe("never_automatic");
      expect(writes).toBe(1);
      expect(reads).toBe(0);
    },
  );

  it("resolves an ambiguous timeout by readback without resending", async () => {
    let writes = 0;
    let reads = 0;
    let request: KrossSupabaseAtomicWriteRequestV1 | null = null;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async (candidate) => {
          writes += 1;
          request = candidate;
          throw new Error("timeout after dispatch");
        },
        readback: async () => {
          reads += 1;
          return exactReadback(request!);
        },
      },
    });

    const result = await adapter.commitFeed(captureFeedAdmission());

    expect(result).toMatchObject({
      status: "committed",
      readbackVerified: true,
      resolvedFromAmbiguousWrite: true,
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(1);
    expect(reads).toBe(1);
  });

  it.each([
    ["null", () => null],
    ["empty object", () => ({})],
    ["unknown status", () => ({ status: "maybe" })],
    [
      "extra committed key",
      (request: KrossSupabaseAtomicWriteRequestV1) => ({
        ...committedRaw(request),
        unexpected: true,
      }),
    ],
    [
      "wrong correlated request",
      (request: KrossSupabaseAtomicWriteRequestV1) => ({
        ...committedRaw(request),
        requestId: `sha256:${"d".repeat(64)}`,
        requestHash: "d".repeat(64),
      }),
    ],
    [
      "wrong committed fencing token",
      (request: KrossSupabaseAtomicWriteRequestV1) => ({
        ...committedRaw(request),
        fencingToken: request.correlation.fencingToken + 1,
      }),
    ],
    [
      "throwing proxy",
      () =>
        new Proxy(
          {},
          {
            ownKeys: () => {
              throw new Error("provider ownKeys failure");
            },
          },
        ),
    ],
  ] as const)("keeps malformed or uncorrelated raw result ambiguous: %s", async (_label, raw) => {
    let writes = 0;
    let reads = 0;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async (request) => {
          writes += 1;
          return raw(request);
        },
        readback: async () => {
          reads += 1;
          return null;
        },
      },
    });

    await expect(adapter.commitFeed(captureFeedAdmission())).resolves.toMatchObject({
      status: "error",
      errorKind: "ambiguous_unresolved",
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(1);
    expect(reads).toBe(1);
  });

  it("keeps a malformed committed result ambiguous and reads back once", async () => {
    let writes = 0;
    let reads = 0;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async (request) => {
          writes += 1;
          return {
            ...committedRaw(request),
            commitId: null,
          } as never;
        },
        readback: async () => {
          reads += 1;
          return null;
        },
      },
    });

    await expect(adapter.commitFeed(captureFeedAdmission())).resolves.toMatchObject({
      status: "error",
      errorKind: "ambiguous_unresolved",
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(1);
    expect(reads).toBe(1);
  });

  it("resolves a malformed raw response only through an exact correlated readback", async () => {
    let writes = 0;
    let reads = 0;
    let request: KrossSupabaseAtomicWriteRequestV1 | null = null;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async (candidate) => {
          writes += 1;
          request = candidate;
          return null;
        },
        readback: async () => {
          reads += 1;
          return exactReadback(request!);
        },
      },
    });

    await expect(adapter.commitFeed(captureFeedAdmission())).resolves.toMatchObject({
      status: "committed",
      readbackVerified: true,
      resolvedFromAmbiguousWrite: true,
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(1);
    expect(reads).toBe(1);
  });

  it("returns readback_mismatch for malformed non-null readback without throwing", async () => {
    let writes = 0;
    let reads = 0;
    let request: KrossSupabaseAtomicWriteRequestV1 | null = null;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async (candidate) => {
          writes += 1;
          request = candidate;
          return committedRaw(candidate);
        },
        readback: async () => {
          reads += 1;
          return {
            ...exactReadback(request!),
            commitId: null,
          } as never;
        },
      },
    });

    await expect(adapter.commitFeed(captureFeedAdmission())).resolves.toMatchObject({
      status: "error",
      errorKind: "readback_mismatch",
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(1);
    expect(reads).toBe(1);
  });

  it("keeps a thrown write ambiguous when its readback is malformed", async () => {
    let writes = 0;
    let reads = 0;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async () => {
          writes += 1;
          throw new Error("timeout after dispatch");
        },
        readback: async () => {
          reads += 1;
          return { status: "committed", commitId: null } as never;
        },
      },
    });

    await expect(adapter.commitFeed(captureFeedAdmission())).resolves.toMatchObject({
      status: "error",
      errorKind: "ambiguous_unresolved",
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(1);
    expect(reads).toBe(1);
  });

  it("treats a failed readback after a committed raw result as missing", async () => {
    let writes = 0;
    let reads = 0;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async (request) => {
          writes += 1;
          return committedRaw(request);
        },
        readback: async () => {
          reads += 1;
          throw new Error("readback unavailable");
        },
      },
    });

    await expect(adapter.commitFeed(captureFeedAdmission())).resolves.toMatchObject({
      status: "error",
      errorKind: "readback_missing",
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(1);
    expect(reads).toBe(1);
  });

  it("keeps an unresolved timeout ambiguous and never resends", async () => {
    let writes = 0;
    let reads = 0;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: {
        writeOnce: async () => {
          writes += 1;
          throw new Error("timeout after dispatch");
        },
        readback: async () => {
          reads += 1;
          return null;
        },
      },
    });

    const result = await adapter.commitFeed(captureFeedAdmission());

    expect(result).toMatchObject({
      status: "error",
      errorKind: "ambiguous_unresolved",
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(1);
    expect(reads).toBe(1);
  });

  it.each([
    ["missing", null],
    ["wrong feed", { feedKey: `${feedKey}::other` }],
    ["wrong token", { fencingToken: 999 }],
    ["wrong receipt", { receiptKey: `${receiptKey}::other` }],
  ] as const)(
    "does not call raw committed verified when readback is %s",
    async (_name, mutation) => {
      const writes: KrossSupabaseAtomicWriteRequestV1[] = [];
      const adapter = createKrossSupabaseAtomicWriteAdapter({
        scope: { orgId, propertyId, feed },
        port: {
          writeOnce: async (request) => {
            writes.push(request);
            return committedRaw(request);
          },
          readback: async () => {
            if (!mutation) return null;
            const exact = exactReadback(writes[0]);
            return {
              ...exact,
              correlation: { ...exact.correlation, ...mutation },
            };
          },
        },
      });

      const result = await adapter.commitFeed(captureFeedAdmission());

      expect(result).toMatchObject({
        status: "error",
        errorKind: mutation ? "readback_mismatch" : "readback_missing",
        retryPolicy: "never_automatic",
      });
    },
  );

  it("maps rejected attempt evidence through one safe transaction and readback", async () => {
    const writes: KrossSupabaseAtomicWriteRequestV1[] = [];
    const reads: number[] = [];
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: { orgId, propertyId, feed },
      port: committedPort(writes, reads),
    });

    const result = await adapter.appendAttemptEvidence(
      captureAttemptAdmission(),
    );

    expect(result.status).toBe("committed");
    expect(writes).toHaveLength(1);
    expect(reads).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      operation: "append_attempt_evidence",
      correlation: {
        feedKey,
        attemptId: "feed-attempt-001",
        receiptKey,
        fencingToken: 1,
      },
      writeSet: {
        receipt: {
          status: "rejected",
          failureReason: "incomplete_batch",
          payloadStored: false,
        },
        quarantine: {
          reason: "incomplete_batch",
          payloadStored: false,
          piiStored: false,
        },
      },
    });
  });

  it("rejects cross-scope material before any transaction or readback", async () => {
    let writes = 0;
    let reads = 0;
    const adapter = createKrossSupabaseAtomicWriteAdapter({
      scope: {
        orgId,
        propertyId: "33333333-3333-3333-3333-333333333333",
        feed,
      },
      port: {
        writeOnce: async () => {
          writes += 1;
          throw new Error("must not run");
        },
        readback: async () => {
          reads += 1;
          return null;
        },
      },
    });

    const result = await adapter.commitFeed(captureFeedAdmission());

    expect(result).toMatchObject({
      status: "error",
      errorKind: "invalid_scope",
      retryPolicy: "never_automatic",
    });
    expect(writes).toBe(0);
    expect(reads).toBe(0);
  });
});
