import { describe, expect, it } from "vitest";

import {
  createInMemoryKrossDryRunStore,
  executeKrossDryRun,
  executeKrossFeedDryRun,
  type KrossDryRunAtomicAdmission,
  type KrossDryRunFeedBatchRequest,
} from "./dry-run-executor";

const adapterConfig = {
  orgId: "11111111-1111-1111-1111-111111111111",
  propertyId: "22222222-2222-2222-2222-222222222222",
  fieldMap: {
    externalReservationId: "reservation.id",
    checkIn: "stay.check_in",
    checkOut: "stay.check_out",
    status: "reservation.status",
    roomCodeRaw: "stay.room",
  },
};

const baseEvidence = {
  authorizedTransport: true,
  directFromKross: true,
  readOnly: true,
  sourceAsOf: "2026-09-23T15:00:00.000Z",
  observedAt: "2026-09-23T15:05:00.000Z",
  sourceReference: "synthetic://kross/official-payload/K-100",
  recordHash:
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
};

const baseRequest = {
  adapterConfig,
  evidence: baseEvidence,
  importContext: {
    artifactHash:
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    attemptId: "attempt-001",
    feed: "reservations-export",
  },
  nowIso: "2026-09-23T16:00:00.000Z",
};

function payload(status = "confirmed", id = "K-100") {
  return {
    reservation: { id, status },
    stay: {
      room: "26",
      check_in: "2026-09-25",
      check_out: "2026-09-27",
    },
  };
}

function feedRequest(): KrossDryRunFeedBatchRequest {
  return {
    adapterConfig,
    importContext: {
      artifactHash:
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      attemptId: "feed-attempt-001",
      feed: "reservations-export",
    },
    writerLeaseId: "writer-lease-001",
    sourceAsOf: "2026-09-23T15:10:00.000Z",
    observedAt: "2026-09-23T15:15:00.000Z",
    expectedRowCount: 3,
    rows: [
      {
        payload: payload("confirmed", "K-100"),
        sourceReference: "synthetic://kross/feed/K-100",
        recordHash:
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      },
      {
        payload: payload("cancelled", "K-200"),
        sourceReference: "synthetic://kross/feed/K-200",
        recordHash:
          "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      },
      {
        payload: payload("confirmed", "K-300"),
        sourceReference: "synthetic://kross/feed/K-300",
        recordHash:
          "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
      },
    ],
    nowIso: "2026-09-23T16:00:00.000Z",
  };
}

describe("executeKrossDryRun", () => {
  it("runs official payload through adapter and normalizer without live promotion", () => {
    const store = createInMemoryKrossDryRunStore();
    const result = executeKrossDryRun(
      { ...baseRequest, payload: payload() },
      store,
    );

    expect(result.status).toBe("accepted");
    expect(result.operation).toBe("insert");
    expect(result.reservation).toMatchObject({
      external_reservation_id: "K-100",
      status: "confirmed",
      read_only_mirror: true,
      source_is_live: false,
      data_quality_status: "review",
    });
    expect(result.canEnterSafeView).toBe(false);
    expect(result.pmsWriteCount).toBe(0);
    expect(result.importRun.pmsWriteCount).toBe(0);
    expect(result.importRun).toMatchObject({
      orgId: adapterConfig.orgId,
      propertyId: adapterConfig.propertyId,
      sourceSystem: "Kross",
      snapshotKind: "reservation_mirror",
      feed: "reservations-export",
      artifactHash:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      recordHash:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      attemptId: "attempt-001",
    });
    expect(result.importRun.runKey).toBe(
      "v1::org=11111111-1111-1111-1111-111111111111::property=22222222-2222-2222-2222-222222222222::source=Kross::snapshot=reservation_mirror::feed=reservations-export::artifact=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa::record=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    );
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(1);
  });

  it("replays the same source idempotently without adding a mirror or import run", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = { ...baseRequest, payload: payload() };

    executeKrossDryRun(request, store);
    const replay = executeKrossDryRun(request, store);

    expect(replay.operation).toBe("replay");
    expect(replay.reservation?.external_reservation_id).toBe("K-100");
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(1);
    expect(replay.pmsWriteCount).toBe(0);
    expect(replay.checkpointAdvanced).toBe(false);
  });

  it("keeps attempt identity separate from the canonical run key", () => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossDryRun(
      { ...baseRequest, payload: payload() },
      store,
    );
    const second = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload(),
        importContext: {
          ...baseRequest.importContext,
          attemptId: "attempt-002",
        },
      },
      store,
    );

    expect(second.operation).toBe("replay");
    expect(second.importRun.attemptId).toBe("attempt-002");
    expect(second.importRun.runKey).toBe(first.importRun.runKey);
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(1);
  });

  it("keeps canonical import runs append-only with defensive readback", () => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossDryRun(
      { ...baseRequest, payload: payload() },
      store,
    );
    const returned = store.getImportRun(first.importRun.runKey)!;
    returned.attemptId = "mutated-readback";
    store.saveImportRun(first.importRun.runKey, {
      ...first.importRun,
      attemptId: "overwrite-attempt",
    });

    expect(store.getImportRun(first.importRun.runKey)?.attemptId).toBe(
      "attempt-001",
    );
    expect(store.importRunCount()).toBe(1);
  });

  it("does not collapse distinct records from the same artifact into one run", () => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossDryRun(
      { ...baseRequest, payload: payload() },
      store,
    );
    const second = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("confirmed", "K-200"),
        evidence: {
          ...baseEvidence,
          sourceReference: "synthetic://kross/official-payload/K-200",
          recordHash:
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        },
      },
      store,
    );

    expect(second.operation).toBe("insert");
    expect(second.importRun.artifactHash).toBe(first.importRun.artifactHash);
    expect(second.importRun.recordHash).not.toBe(first.importRun.recordHash);
    expect(second.importRun.runKey).not.toBe(first.importRun.runKey);
    expect(store.mirrorCount()).toBe(2);
    expect(store.importRunCount()).toBe(2);
  });

  it("scopes the canonical run key by organization and property", () => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossDryRun(
      { ...baseRequest, payload: payload() },
      store,
    );
    const second = executeKrossDryRun(
      {
        ...baseRequest,
        adapterConfig: {
          ...adapterConfig,
          propertyId: "33333333-3333-3333-3333-333333333333",
        },
        payload: payload(),
      },
      store,
    );

    expect(first.operation).toBe("insert");
    expect(second.operation).toBe("insert");
    expect(second.importRun.runKey).not.toBe(first.importRun.runKey);
    expect(store.mirrorCount()).toBe(2);
    expect(store.importRunCount()).toBe(2);
  });

  it("rejects an invalid artifact hash without persisting run state", () => {
    const store = createInMemoryKrossDryRunStore();
    const result = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload(),
        importContext: {
          ...baseRequest.importContext,
          artifactHash: "not-a-sha256",
        },
      },
      store,
    );

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("reject");
    expect(result.importContextIssues.map((issue) => issue.code)).toContain(
      "invalid_artifact_hash",
    );
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(0);
    expect(store.checkpointCount()).toBe(0);
  });

  it("updates the same scoped identity and preserves explicit cancellation status", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun(
      { ...baseRequest, payload: payload(), evidence: baseEvidence },
      store,
    );

    const updated = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("cancelled"),
        evidence: {
          ...baseEvidence,
          sourceAsOf: "2026-09-23T15:10:00.000Z",
          observedAt: "2026-09-23T15:15:00.000Z",
          recordHash:
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        },
      },
      store,
    );

    expect(updated.operation).toBe("update");
    expect(updated.reservation?.external_reservation_id).toBe("K-100");
    expect(updated.reservation?.status).toBe("cancelled");
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(2);
    expect(updated.pmsWriteCount).toBe(0);
    expect(updated.checkpointAdvanced).toBe(true);
    expect(store.getCheckpoint(updated.importRun.identityKey!)).toMatchObject({
      sourceAsOf: "2026-09-23T15:10:00.000Z",
      recordHash:
        "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    });
  });

  it("quarantines an older source cut without mutating the mirror or checkpoint", () => {
    const store = createInMemoryKrossDryRunStore();
    const inserted = executeKrossDryRun(
      { ...baseRequest, payload: payload(), evidence: baseEvidence },
      store,
    );
    const key = inserted.importRun.identityKey!;
    const mirrorBefore = store.getMirror(key);
    const checkpointBefore = store.getCheckpoint(key);

    const stale = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("cancelled"),
        evidence: {
          ...baseEvidence,
          sourceAsOf: "2026-09-23T14:00:00.000Z",
          observedAt: "2026-09-23T15:10:00.000Z",
          recordHash:
            "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        },
      },
      store,
    );

    expect(stale.status).toBe("rejected");
    expect(stale.operation).toBe("quarantine");
    expect(stale.quarantineReason).toBe("stale_source_as_of");
    expect(stale.checkpointAdvanced).toBe(false);
    expect(store.getMirror(key)).toEqual(mirrorBefore);
    expect(store.getCheckpoint(key)).toEqual(checkpointBefore);
  });

  it("quarantines a same-cut different-hash conflict without mutating state", () => {
    const store = createInMemoryKrossDryRunStore();
    const inserted = executeKrossDryRun(
      { ...baseRequest, payload: payload(), evidence: baseEvidence },
      store,
    );
    const key = inserted.importRun.identityKey!;
    const mirrorBefore = store.getMirror(key);
    const checkpointBefore = store.getCheckpoint(key);

    const conflict = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("cancelled"),
        evidence: {
          ...baseEvidence,
          observedAt: "2026-09-23T15:10:00.000Z",
          recordHash:
            "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        },
      },
      store,
    );

    expect(conflict.status).toBe("rejected");
    expect(conflict.operation).toBe("conflict");
    expect(conflict.quarantineReason).toBe("same_cut_conflict");
    expect(conflict.checkpointAdvanced).toBe(false);
    expect(store.getMirror(key)).toEqual(mirrorBefore);
    expect(store.getCheckpoint(key)).toEqual(checkpointBefore);
  });

  it("uses the checkpoint rather than a stale mirror as monotonic authority", () => {
    const store = createInMemoryKrossDryRunStore();
    const inserted = executeKrossDryRun(
      { ...baseRequest, payload: payload(), evidence: baseEvidence },
      store,
    );
    const key = inserted.importRun.identityKey!;
    const mirrorBefore = store.getMirror(key);
    const checkpointBefore = store.getCheckpoint(key)!;
    const checkpointAheadStore = {
      ...store,
      getCheckpoint: (identityKey: string) =>
        identityKey === key
          ? {
              ...checkpointBefore,
              sourceAsOf: "2026-09-23T15:20:00.000Z",
              recordHash:
                "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            }
          : store.getCheckpoint(identityKey),
    };

    const intermediate = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("cancelled"),
        evidence: {
          ...baseEvidence,
          sourceAsOf: "2026-09-23T15:10:00.000Z",
          observedAt: "2026-09-23T15:15:00.000Z",
          recordHash:
            "9999999999999999999999999999999999999999999999999999999999999999",
        },
      },
      checkpointAheadStore,
    );

    expect(intermediate.status).toBe("rejected");
    expect(intermediate.operation).toBe("quarantine");
    expect(intermediate.quarantineReason).toBe("stale_source_as_of");
    expect(intermediate.checkpointAdvanced).toBe(false);
    expect(store.getMirror(key)).toEqual(mirrorBefore);
    expect(store.getCheckpoint(key)).toEqual(checkpointBefore);
  });

  it("fails closed when the checkpoint changes between classification and commit", () => {
    const store = createInMemoryKrossDryRunStore();
    const inserted = executeKrossDryRun(
      { ...baseRequest, payload: payload(), evidence: baseEvidence },
      store,
    );
    const key = inserted.importRun.identityKey!;
    const mirrorBefore = store.getMirror(key)!;
    const checkpointBefore = store.getCheckpoint(key)!;
    const concurrentHash =
      "7777777777777777777777777777777777777777777777777777777777777777";
    let injected = false;
    const racingStore = {
      ...store,
      admitAtomically: (admission: KrossDryRunAtomicAdmission) => {
            if (!injected) {
              injected = true;
              const concurrentRun = {
                ...inserted.importRun,
                runKey: "synthetic://concurrent::777",
                operation: "update" as const,
                recordHash: concurrentHash,
                sourceAsOf: "2026-09-23T15:20:00.000Z",
                observedAt: "2026-09-23T15:21:00.000Z",
              };
              const concurrentCommit = store.admitAtomically({
                identityKey: key,
                expectedCheckpoint: checkpointBefore,
                reservation: {
                  ...mirrorBefore,
                  status: "cancelled",
                  snapshot_as_of: "2026-09-23T15:20:00.000Z",
                  last_synced_at: "2026-09-23T15:21:00.000Z",
                  source_hash: concurrentHash,
                },
                importRun: concurrentRun,
                checkpoint: {
                  identityKey: key,
                  runKey: concurrentRun.runKey,
                  sourceAsOf: concurrentRun.sourceAsOf,
                  recordHash: concurrentHash,
                },
              });
              expect(concurrentCommit).toBe(true);
            }
        return store.admitAtomically(admission);
      },
    };

    const raced = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("check_in"),
        evidence: {
          ...baseEvidence,
          sourceAsOf: "2026-09-23T15:10:00.000Z",
          observedAt: "2026-09-23T15:15:00.000Z",
          recordHash:
            "8888888888888888888888888888888888888888888888888888888888888888",
        },
      },
      racingStore,
    );

    expect(raced.status).toBe("rejected");
    expect(raced.operation).toBe("conflict");
    expect(raced.quarantineReason).toBe("checkpoint_changed");
    expect(raced.checkpointAdvanced).toBe(false);
    expect(store.getMirror(key)?.snapshot_as_of).toBe(
      "2026-09-23T15:20:00.000Z",
    );
    expect(store.getCheckpoint(key)?.sourceAsOf).toBe(
      "2026-09-23T15:20:00.000Z",
    );
  });

  it("returns replay when the same run wins the checkpoint race", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun(
      { ...baseRequest, payload: payload(), evidence: baseEvidence },
      store,
    );
    let injected = false;
    const racingStore = {
      ...store,
      admitAtomically: (admission: KrossDryRunAtomicAdmission) => {
        if (!injected) {
          injected = true;
          expect(store.admitAtomically(admission)).toBe(true);
        }
        return store.admitAtomically(admission);
      },
    };

    const replay = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("cancelled"),
        evidence: {
          ...baseEvidence,
          sourceAsOf: "2026-09-23T15:10:00.000Z",
          observedAt: "2026-09-23T15:15:00.000Z",
          recordHash:
            "6666666666666666666666666666666666666666666666666666666666666666",
        },
      },
      racingStore,
    );

    expect(replay.status).toBe("accepted");
    expect(replay.operation).toBe("replay");
    expect(replay.importRun.status).toBe("accepted");
    expect(replay.quarantineReason).toBeNull();
    expect(replay.checkpointAdvanced).toBe(false);
    expect(replay.reservation?.snapshot_as_of).toBe(
      "2026-09-23T15:10:00.000Z",
    );
    expect(store.getImportRun(replay.importRun.runKey)?.status).toBe("accepted");
  });

  it("rejects source time after observation without mutating mirror or checkpoint", () => {
    const store = createInMemoryKrossDryRunStore();
    const inserted = executeKrossDryRun(
      { ...baseRequest, payload: payload(), evidence: baseEvidence },
      store,
    );
    const key = inserted.importRun.identityKey!;
    const mirrorBefore = store.getMirror(key);
    const checkpointBefore = store.getCheckpoint(key);
    const result = executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload(),
        evidence: {
          ...baseEvidence,
          sourceAsOf: "2026-09-23T15:06:00.000Z",
          observedAt: "2026-09-23T15:05:00.000Z",
        },
      },
      store,
    );

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("reject");
    expect(result.normalizationIssues.map((issue) => issue.code)).toContain(
      "source_after_observation",
    );
    expect(result.checkpointAdvanced).toBe(false);
    expect(store.getMirror(key)).toEqual(mirrorBefore);
    expect(store.getCheckpoint(key)).toEqual(checkpointBefore);
    expect(store.mirrorCount()).toBe(1);
    expect(store.checkpointCount()).toBe(1);
  });

  it("rejects a missing external id before mirror creation", () => {
    const store = createInMemoryKrossDryRunStore();
    const result = executeKrossDryRun(
      {
        ...baseRequest,
        payload: {
          reservation: { status: "confirmed" },
          stay: { check_in: "2026-09-25", check_out: "2026-09-27" },
        },
      },
      store,
    );

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("reject");
    expect(result.reservation).toBeNull();
    expect(result.adapterIssues.map((issue) => issue.code)).toContain(
      "mapped_value_missing",
    );
    expect(result.pmsWriteCount).toBe(0);
    expect(result.checkpointAdvanced).toBe(false);
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(1);
  });
});

describe("executeKrossFeedDryRun", () => {
  it("promotes a mixed unchanged/changed feed once with complete counts", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun(
      { ...baseRequest, payload: payload("confirmed", "K-100") },
      store,
    );
    executeKrossDryRun(
      {
        ...baseRequest,
        payload: payload("confirmed", "K-200"),
        evidence: {
          ...baseEvidence,
          sourceReference: "synthetic://kross/official-payload/K-200",
          recordHash:
            "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        },
      },
      store,
    );

    const result = executeKrossFeedDryRun(feedRequest(), store);

    expect(result.status).toBe("accepted");
    expect(result.operation).toBe("promote");
    expect(result.counts).toEqual({
      read: 3,
      accepted: 3,
      rejected: 0,
      unchanged: 1,
      changed: 2,
      conflict: 0,
    });
    expect(result.checkpointAdvanced).toBe(true);
    expect(store.mirrorCount()).toBe(3);
    expect(store.feedCheckpointCount()).toBe(1);
    expect(store.getFeedCheckpoint(result.feedKey)).toMatchObject({
      artifactHash: feedRequest().importContext.artifactHash,
      expectedRowCount: 3,
      counts: result.counts,
    });
    expect(store.getAttemptReceipt(result.feedKey, "feed-attempt-001")).toMatchObject({
      attemptId: "feed-attempt-001",
      feedKey: result.feedKey,
      status: "accepted",
      operation: "promote",
      failureReason: null,
      checkpointAdvanced: true,
      rowLinks: feedRequest().rows.map((row, ordinal) => ({
        ordinal,
        recordHash: row.recordHash,
      })),
      payloadStored: false,
    });
    expect(store.attemptReceiptCount()).toBe(1);
    expect(store.quarantineCount()).toBe(0);
  });

  it("discards every staged row when the final row is invalid", () => {
    const store = createInMemoryKrossDryRunStore();
    const existing = executeKrossDryRun(
      { ...baseRequest, payload: payload("confirmed", "K-100") },
      store,
    );
    const identityKey = existing.importRun.identityKey!;
    const mirrorBefore = store.getMirror(identityKey);
    const checkpointBefore = store.getCheckpoint(identityKey);
    const runCountBefore = store.importRunCount();
    const request = feedRequest();
    request.rows[2] = {
      ...request.rows[2],
      recordHash: "guest-name-Mauricio",
      payload: {
        reservation: { status: "confirmed" },
        stay: { check_in: "2026-09-25", check_out: "2026-09-27" },
      },
    };

    const result = executeKrossFeedDryRun(request, store);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("row_rejected");
    expect(result.counts.read).toBe(3);
    expect(result.counts.rejected).toBe(1);
    expect(store.getMirror(identityKey)).toEqual(mirrorBefore);
    expect(store.getCheckpoint(identityKey)).toEqual(checkpointBefore);
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(runCountBefore);
    expect(store.checkpointCount()).toBe(1);
    expect(store.feedCheckpointCount()).toBe(0);
    const receipt = store.getAttemptReceipt(
      result.feedKey,
      request.importContext.attemptId,
    );
    expect(receipt).toMatchObject({
      status: "rejected",
      operation: "reject",
      failureReason: "row_rejected",
      checkpointAdvanced: false,
      payloadStored: false,
    });
    expect(
      store.getQuarantineRecord(result.feedKey, request.importContext.attemptId),
    ).toMatchObject({
      receiptKey: receipt?.receiptKey,
      reason: "row_rejected",
      payloadStored: false,
      piiStored: false,
    });
    expect(store.attemptReceiptCount()).toBe(1);
    expect(store.quarantineCount()).toBe(1);
  });

  it("rejects one conflicting row without partially promoting the feed", () => {
    const store = createInMemoryKrossDryRunStore();
    executeKrossDryRun(
      { ...baseRequest, payload: payload("confirmed", "K-100") },
      store,
    );
    const request = feedRequest();
    request.sourceAsOf = baseEvidence.sourceAsOf;
    request.observedAt = baseEvidence.observedAt;
    request.rows[0] = {
      ...request.rows[0],
      recordHash:
        "9999999999999999999999999999999999999999999999999999999999999999",
    };
    const mirrorCountBefore = store.mirrorCount();
    const runCountBefore = store.importRunCount();
    const checkpointCountBefore = store.checkpointCount();

    const result = executeKrossFeedDryRun(request, store);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("row_conflict");
    expect(result.counts.conflict).toBe(1);
    expect(store.mirrorCount()).toBe(mirrorCountBefore);
    expect(store.importRunCount()).toBe(runCountBefore);
    expect(store.checkpointCount()).toBe(checkpointCountBefore);
    expect(store.feedCheckpointCount()).toBe(0);
  });

  it("rejects a truncated batch before staging or writes", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = feedRequest();
    request.expectedRowCount = 4;

    const result = executeKrossFeedDryRun(request, store);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("incomplete_batch");
    expect(result.counts.read).toBe(3);
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(0);
    expect(store.checkpointCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.getAttemptReceipt(result.feedKey, "feed-attempt-001")).toMatchObject({
      status: "rejected",
      failureReason: "incomplete_batch",
    });
    expect(store.quarantineCount()).toBe(1);
  });

  it("fails the whole commit when a real import-run race loses the feed CAS", () => {
    const store = createInMemoryKrossDryRunStore();
    const racingStore = {
      ...store,
      admitFeedAtomically: (
        admission: Parameters<typeof store.admitFeedAtomically>[0],
      ) => {
        const concurrentRun = admission.importRuns[0];
        store.saveImportRun(concurrentRun.runKey, {
          ...concurrentRun.evidence,
          attemptId: "concurrent-attempt",
        });
        return store.admitFeedAtomically(admission);
      },
    };

    const result = executeKrossFeedDryRun(feedRequest(), racingStore);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("checkpoint_changed");
    expect(result.counts).toEqual({
      read: 3,
      accepted: 0,
      rejected: 3,
      unchanged: 0,
      changed: 0,
      conflict: 3,
    });
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(1);
    expect(
      store.getImportRun(
        "v1::org=11111111-1111-1111-1111-111111111111::property=22222222-2222-2222-2222-222222222222::source=Kross::snapshot=reservation_mirror::feed=reservations-export::artifact=ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff::record=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      )?.attemptId,
    ).toBe("concurrent-attempt");
    expect(store.checkpointCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.getAttemptReceipt(result.feedKey, "feed-attempt-001")).toMatchObject({
      status: "rejected",
      failureReason: "checkpoint_changed",
    });
    expect(store.quarantineCount()).toBe(1);
  });

  it("rejects a feed admission that tries to overwrite a canonical run", () => {
    const store = createInMemoryKrossDryRunStore();
    const seedRequest = feedRequest();
    const seeded = executeKrossDryRun(
      {
        payload: seedRequest.rows[0].payload,
        adapterConfig,
        evidence: {
          ...baseEvidence,
          sourceAsOf: seedRequest.sourceAsOf,
          observedAt: seedRequest.observedAt,
          sourceReference: seedRequest.rows[0].sourceReference,
          recordHash: seedRequest.rows[0].recordHash,
        },
        importContext: seedRequest.importContext,
        nowIso: seedRequest.nowIso,
      },
      store,
    );
    const canonicalBefore = store.getImportRun(seeded.importRun.runKey)!;
    const overwriteStore = {
      ...store,
      admitFeedAtomically: (
        admission: Parameters<typeof store.admitFeedAtomically>[0],
      ) =>
        store.admitFeedAtomically({
          ...admission,
          importRuns: [
            ...admission.importRuns,
            {
              runKey: seeded.importRun.runKey,
              evidence: {
                ...canonicalBefore,
                attemptId: "overwrite-attempt",
              },
            },
          ],
        }),
    };

    const result = executeKrossFeedDryRun(feedRequest(), overwriteStore);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("checkpoint_changed");
    expect(store.getImportRun(seeded.importRun.runKey)).toEqual(canonicalBefore);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.getAttemptReceipt(result.feedKey, "feed-attempt-001")).toMatchObject({
      status: "rejected",
      failureReason: "checkpoint_changed",
    });
  });

  it("rejects a feed admission with an unlinked staged import run", () => {
    const store = createInMemoryKrossDryRunStore();
    const extraRunHash =
      "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    const tamperedStore = {
      ...store,
      admitFeedAtomically: (
        admission: Parameters<typeof store.admitFeedAtomically>[0],
      ) => {
        const seedRun = admission.importRuns[0];
        const extraRunKey =
          `${admission.feedKey}::artifact=${admission.attemptReceipt.artifactHash}` +
          `::record=${extraRunHash}`;
        return store.admitFeedAtomically({
          ...admission,
          expectedImportRuns: [
            ...admission.expectedImportRuns,
            { runKey: extraRunKey, expected: null },
          ],
          importRuns: [
            ...admission.importRuns,
            {
              runKey: extraRunKey,
              evidence: {
                ...seedRun.evidence,
                runKey: extraRunKey,
                recordHash: extraRunHash,
              },
            },
          ],
        });
      },
    };

    const result = executeKrossFeedDryRun(feedRequest(), tamperedStore);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("checkpoint_changed");
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(0);
    expect(store.checkpointCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.getAttemptReceipt(result.feedKey, "feed-attempt-001")).toMatchObject({
      status: "rejected",
      failureReason: "checkpoint_changed",
    });
  });

  it("replays an exact successful feed without new writes or checkpoint movement", () => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossFeedDryRun(feedRequest(), store);
    const firstReceipt = store.getAttemptReceipt(
      first.feedKey,
      "feed-attempt-001",
    )!;
    const canonicalRunKey = firstReceipt.rowLinks[0].runKey!;
    const canonicalRunBefore = store.getImportRun(canonicalRunKey);
    const mirrorCount = store.mirrorCount();
    const runCount = store.importRunCount();
    const checkpointCount = store.checkpointCount();
    const secondRequest = feedRequest();
    secondRequest.importContext.attemptId = "feed-attempt-002";
    secondRequest.writerLeaseId = "writer-lease-002";

    const replay = executeKrossFeedDryRun(secondRequest, store);

    expect(first.operation).toBe("promote");
    expect(replay.status).toBe("accepted");
    expect(replay.operation).toBe("replay");
    expect(replay.checkpointAdvanced).toBe(false);
    expect(replay.counts).toEqual(first.counts);
    expect(store.mirrorCount()).toBe(mirrorCount);
    expect(store.importRunCount()).toBe(runCount);
    expect(store.checkpointCount()).toBe(checkpointCount);
    expect(store.feedCheckpointCount()).toBe(1);
    expect(store.attemptReceiptCount()).toBe(2);
    expect(store.getAttemptReceipt(first.feedKey, "feed-attempt-001")?.operation).toBe(
      "promote",
    );
    expect(store.getAttemptReceipt(first.feedKey, "feed-attempt-002")?.operation).toBe(
      "replay",
    );
    expect(store.getImportRun(canonicalRunKey)).toEqual(canonicalRunBefore);
  });

  it("rejects a same-cut replay whose row link has no canonical run", () => {
    const store = createInMemoryKrossDryRunStore();
    const accepted = executeKrossFeedDryRun(feedRequest(), store);
    const checkpointBefore = store.getFeedCheckpoint(accepted.feedKey);
    const runCountBefore = store.importRunCount();
    const conflict = feedRequest();
    conflict.importContext.attemptId = "feed-attempt-row-conflict";
    conflict.writerLeaseId = "writer-lease-row-conflict";
    conflict.rows[0].recordHash =
      "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

    const result = executeKrossFeedDryRun(conflict, store);

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("conflict");
    expect(result.failureReason).toBe("same_cut_conflict");
    expect(result.counts.conflict).toBe(3);
    expect(store.getFeedCheckpoint(accepted.feedKey)).toEqual(checkpointBefore);
    expect(store.importRunCount()).toBe(runCountBefore);
    expect(
      store.getAttemptReceipt(result.feedKey, "feed-attempt-row-conflict"),
    ).toMatchObject({ status: "rejected", failureReason: "same_cut_conflict" });
    expect(
      store.getQuarantineRecord(result.feedKey, "feed-attempt-row-conflict"),
    ).toMatchObject({ reason: "same_cut_conflict" });
  });

  it("replays the same attempt from its append-only receipt without mutating it", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = feedRequest();
    const first = executeKrossFeedDryRun(request, store);
    const second = executeKrossFeedDryRun(request, store);
    const firstRead = store.getAttemptReceipt(first.feedKey, "feed-attempt-001")!;
    firstRead.counts.changed = 99;

    expect(first.operation).toBe("promote");
    expect(second.operation).toBe("replay");
    expect(second.checkpointAdvanced).toBe(false);
    expect(store.attemptReceiptCount()).toBe(1);
    expect(store.getAttemptReceipt(first.feedKey, "feed-attempt-001")).toMatchObject({
      operation: "promote",
      checkpointAdvanced: true,
      counts: { changed: 3 },
    });
  });

  it("rejects reuse of one attempt id for different material without overwriting its receipt", () => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossFeedDryRun(feedRequest(), store);
    const changed = feedRequest();
    changed.importContext.artifactHash =
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    const result = executeKrossFeedDryRun(changed, store);

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("conflict");
    expect(result.failureReason).toBe("attempt_conflict");
    expect(store.attemptReceiptCount()).toBe(1);
    expect(store.getAttemptReceipt(first.feedKey, "feed-attempt-001")).toMatchObject({
      artifactHash:
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      status: "accepted",
      operation: "promote",
    });
    expect(store.quarantineCount()).toBe(0);
  });

  it("keeps concurrent divergent rejected evidence append-only and fails closed", () => {
    const store = createInMemoryKrossDryRunStore();
    let injected = false;
    const racingStore = {
      ...store,
      appendAttemptEvidenceAtomically: (
        admission: Parameters<
          typeof store.appendAttemptEvidenceAtomically
        >[0],
      ) => {
        if (!injected) {
          injected = true;
          const conflictingArtifactHash =
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
          const conflictingRowLinks = admission.receipt.rowLinks.map((link) => ({
            ...link,
            runKey:
              link.recordHash === null
                ? null
                : `${admission.receipt.feedKey}::artifact=${conflictingArtifactHash}::record=${link.recordHash}`,
          }));
          const conflictingFingerprint = JSON.stringify({
            version: 1,
            feedKey: admission.receipt.feedKey,
            artifactHash: conflictingArtifactHash,
            sourceAsOf: admission.receipt.sourceAsOf,
            observedAt: admission.receipt.observedAt,
            expectedRowCount: admission.receipt.expectedRowCount,
            rowLinks: conflictingRowLinks,
          });
          expect(
            store.appendAttemptEvidenceAtomically({
              lease: admission.lease,
              expectedReceipt: null,
              receipt: {
                ...admission.receipt,
                artifactHash: conflictingArtifactHash,
                rowLinks: conflictingRowLinks,
                requestFingerprint: conflictingFingerprint,
              },
              quarantine: admission.quarantine
                ? {
                    ...admission.quarantine,
                    artifactHash: conflictingArtifactHash,
                    rowLinks: conflictingRowLinks,
                    requestFingerprint: conflictingFingerprint,
                  }
                : null,
            }),
          ).toBe("inserted");
        }
        return store.appendAttemptEvidenceAtomically(admission);
      },
    };
    const request = feedRequest();
    request.expectedRowCount = 4;

    const result = executeKrossFeedDryRun(request, racingStore);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("attempt_conflict");
    expect(store.attemptReceiptCount()).toBe(1);
    expect(store.quarantineCount()).toBe(1);
    expect(
      store.getAttemptReceipt(result.feedKey, "feed-attempt-001")
        ?.requestFingerprint,
    ).toContain(
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    expect(store.mirrorCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
  });

  it("treats an identical concurrent receipt with a different recorded time as replay", () => {
    const store = createInMemoryKrossDryRunStore();
    let injected = false;
    const racingStore = {
      ...store,
      appendAttemptEvidenceAtomically: (
        admission: Parameters<
          typeof store.appendAttemptEvidenceAtomically
        >[0],
      ) => {
        if (!injected) {
          injected = true;
          const recordedAt = "2026-09-23T15:59:00.000Z";
          expect(
            store.appendAttemptEvidenceAtomically({
              lease: admission.lease,
              expectedReceipt: null,
              receipt: { ...admission.receipt, recordedAt },
              quarantine: admission.quarantine
                ? { ...admission.quarantine, recordedAt }
                : null,
            }),
          ).toBe("inserted");
        }
        return store.appendAttemptEvidenceAtomically(admission);
      },
    };
    const request = feedRequest();
    request.expectedRowCount = 4;

    const result = executeKrossFeedDryRun(request, racingStore);

    expect(result.failureReason).toBe("incomplete_batch");
    expect(store.attemptReceiptCount()).toBe(1);
    expect(
      store.getAttemptReceipt(result.feedKey, "feed-attempt-001")?.recordedAt,
    ).toBe("2026-09-23T15:59:00.000Z");
  });

  it("rejects mismatched receipt and quarantine evidence without partial append", () => {
    const store = createInMemoryKrossDryRunStore();
    const tamperedStore = {
      ...store,
      appendAttemptEvidenceAtomically: (
        admission: Parameters<
          typeof store.appendAttemptEvidenceAtomically
        >[0],
      ) =>
        store.appendAttemptEvidenceAtomically({
          ...admission,
          receipt: { ...admission.receipt, quarantineKeys: [] },
        }),
    };
    const request = feedRequest();
    request.expectedRowCount = 4;

    const result = executeKrossFeedDryRun(request, tamperedStore);

    expect(result.failureReason).toBe("evidence_conflict");
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);
  });

  it("rejects a promotion receipt that disagrees with its feed checkpoint", () => {
    const store = createInMemoryKrossDryRunStore();
    const tamperedStore = {
      ...store,
      admitFeedAtomically: (
        admission: Parameters<typeof store.admitFeedAtomically>[0],
      ) =>
        store.admitFeedAtomically({
          ...admission,
          attemptReceipt: {
            ...admission.attemptReceipt,
            expectedRowCount: admission.attemptReceipt.expectedRowCount + 1,
          },
        }),
    };

    const result = executeKrossFeedDryRun(feedRequest(), tamperedStore);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("checkpoint_changed");
    expect(store.mirrorCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.getAttemptReceipt(result.feedKey, "feed-attempt-001")).toMatchObject({
      status: "rejected",
      failureReason: "checkpoint_changed",
    });
  });

  it("scopes the same attempt id independently by property", () => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossFeedDryRun(feedRequest(), store);
    const secondRequest = feedRequest();
    secondRequest.adapterConfig = {
      ...adapterConfig,
      propertyId: "33333333-3333-3333-3333-333333333333",
    };

    const second = executeKrossFeedDryRun(secondRequest, store);

    expect(first.operation).toBe("promote");
    expect(second.operation).toBe("promote");
    expect(second.feedKey).not.toBe(first.feedKey);
    expect(store.attemptReceiptCount()).toBe(2);
    expect(store.getAttemptReceipt(first.feedKey, "feed-attempt-001")).not.toBeNull();
    expect(store.getAttemptReceipt(second.feedKey, "feed-attempt-001")).not.toBeNull();
  });

  it("does not fabricate durable evidence when attempt identity is missing", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = feedRequest();
    request.importContext.attemptId = "   ";

    const result = executeKrossFeedDryRun(request, store);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("invalid_batch");
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
  });

  it("keeps receipt and quarantine evidence free of payload and source references", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = feedRequest();
    request.rows[2] = {
      ...request.rows[2],
      payload: {
        reservation: { id: "K-PRIVATE", status: "confirmed" },
        stay: { check_in: "2026-09-25" },
      },
      sourceReference: "synthetic://secret/source-reference",
    };

    const result = executeKrossFeedDryRun(request, store);
    const durableEvidence = JSON.stringify({
      receipt: store.getAttemptReceipt(
        result.feedKey,
        request.importContext.attemptId,
      ),
      quarantine: store.getQuarantineRecord(
        result.feedKey,
        request.importContext.attemptId,
      ),
    });

    expect(result.status).toBe("rejected");
    expect(durableEvidence).not.toContain("K-PRIVATE");
    expect(durableEvidence).not.toContain("source-reference");
    expect(durableEvidence).not.toContain('"payload"');
    expect(durableEvidence).not.toContain("external_reservation_id");
    expect(durableEvidence).not.toContain("guest-name-Mauricio");
  });

  it("canonicalizes an artifact hash before checkpointing and replay comparison", () => {
    const store = createInMemoryKrossDryRunStore();
    const firstRequest = feedRequest();
    firstRequest.importContext.artifactHash =
      `  ${firstRequest.importContext.artifactHash}  `;

    const first = executeKrossFeedDryRun(firstRequest, store);
    const replay = executeKrossFeedDryRun(feedRequest(), store);

    expect(first.operation).toBe("promote");
    expect(store.getFeedCheckpoint(first.feedKey)?.artifactHash).toBe(
      feedRequest().importContext.artifactHash,
    );
    expect(replay.operation).toBe("replay");
    expect(replay.failureReason).toBeNull();
  });

  it("rejects an older feed cut without changing the accepted checkpoint", () => {
    const store = createInMemoryKrossDryRunStore();
    const accepted = executeKrossFeedDryRun(feedRequest(), store);
    const checkpointBefore = store.getFeedCheckpoint(accepted.feedKey);
    const stale = feedRequest();
    stale.importContext.attemptId = "feed-attempt-stale";
    stale.writerLeaseId = "writer-lease-stale";
    stale.sourceAsOf = "2026-09-23T15:00:00.000Z";
    stale.observedAt = "2026-09-23T15:05:00.000Z";
    stale.importContext.artifactHash =
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    const result = executeKrossFeedDryRun(stale, store);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("stale_source_as_of");
    expect(store.getFeedCheckpoint(accepted.feedKey)).toEqual(checkpointBefore);
    expect(
      store.getQuarantineRecord(result.feedKey, "feed-attempt-stale"),
    ).toMatchObject({ reason: "stale_source_as_of" });
  });

  it("rejects a different artifact at the same feed cut", () => {
    const store = createInMemoryKrossDryRunStore();
    const accepted = executeKrossFeedDryRun(feedRequest(), store);
    const checkpointBefore = store.getFeedCheckpoint(accepted.feedKey);
    const conflict = feedRequest();
    conflict.importContext.attemptId = "feed-attempt-conflict";
    conflict.writerLeaseId = "writer-lease-conflict";
    conflict.importContext.artifactHash =
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    const result = executeKrossFeedDryRun(conflict, store);

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("conflict");
    expect(result.failureReason).toBe("same_cut_conflict");
    expect(result.counts.conflict).toBe(3);
    expect(store.getFeedCheckpoint(accepted.feedKey)).toEqual(checkpointBefore);
    expect(
      store.getQuarantineRecord(result.feedKey, "feed-attempt-conflict"),
    ).toMatchObject({ reason: "same_cut_conflict" });
  });

  it("fails closed on duplicate reservation identities inside one feed", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = feedRequest();
    request.rows[1] = {
      ...request.rows[1],
      payload: payload("cancelled", "K-100"),
    };

    const result = executeKrossFeedDryRun(request, store);

    expect(result.status).toBe("rejected");
    expect(result.operation).toBe("conflict");
    expect(result.failureReason).toBe("duplicate_identity");
    expect(result.counts.conflict).toBe(1);
    expect(store.mirrorCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
  });

  it("advances one fencing token per new attempt but not for an exact retry", () => {
    const store = createInMemoryKrossDryRunStore();
    const request = feedRequest();

    const first = executeKrossFeedDryRun(request, store);
    const firstLease = store.getFeedLease(first.feedKey)!;
    const exactRetry = executeKrossFeedDryRun(request, store);
    const afterRetry = store.getFeedLease(first.feedKey)!;
    const nextAttempt = feedRequest();
    nextAttempt.importContext.attemptId = "feed-attempt-002";
    nextAttempt.writerLeaseId = "writer-lease-002";
    const replay = executeKrossFeedDryRun(nextAttempt, store);
    const secondLease = store.getFeedLease(first.feedKey)!;

    expect(first.operation).toBe("promote");
    expect(firstLease).toMatchObject({
      writerId: "kross-feed-dry-run",
      leaseId: "writer-lease-001",
      fencingToken: 1,
    });
    expect(exactRetry.operation).toBe("replay");
    expect(afterRetry).toEqual(firstLease);
    expect(replay.operation).toBe("replay");
    expect(secondLease).toMatchObject({
      writerId: "kross-feed-dry-run",
      leaseId: "writer-lease-002",
      fencingToken: 2,
    });
    expect(store.feedLeaseCount()).toBe(1);
  });

  it("makes lease acquisition idempotent and advances only by token CAS", () => {
    const store = createInMemoryKrossDryRunStore({
      now: () => "2026-09-23T16:00:00.000Z",
    });
    const feed = executeKrossFeedDryRun(feedRequest(), store).feedKey;
    const firstRequest = {
      feedKey: feed,
      writerId: "writer-a",
      leaseId: "lease-a",
      expectedToken: 1,
      ttlMs: 60_000,
    };

    const first = store.acquireFeedLeaseAtomically(firstRequest);
    const exact = store.acquireFeedLeaseAtomically(firstRequest);
    const mismatchedTtlReplay = store.acquireFeedLeaseAtomically({
      ...firstRequest,
      ttlMs: 30_000,
    });
    const mismatchedTokenReplay = store.acquireFeedLeaseAtomically({
      ...firstRequest,
      expectedToken: 0,
    });
    const stale = store.acquireFeedLeaseAtomically({
      ...firstRequest,
      writerId: "writer-b",
      leaseId: "lease-b",
    });
    const next = store.acquireFeedLeaseAtomically({
      ...firstRequest,
      writerId: "writer-b",
      leaseId: "lease-b",
      expectedToken: 2,
    });
    const oldGrantRetry = store.acquireFeedLeaseAtomically(firstRequest);

    expect(first).toMatchObject({
      status: "acquired",
      lease: { fencingToken: 2 },
    });
    expect(exact).toMatchObject({
      status: "replay",
      lease: { fencingToken: 2 },
    });
    expect(mismatchedTtlReplay).toEqual({ status: "invalid", lease: null });
    expect(mismatchedTokenReplay).toEqual({ status: "invalid", lease: null });
    expect(stale).toEqual({ status: "cas_conflict", lease: null });
    expect(next).toMatchObject({
      status: "acquired",
      lease: { fencingToken: 3 },
    });
    expect(oldGrantRetry).toMatchObject({
      status: "replay",
      lease: { fencingToken: 2 },
    });
    expect(store.getFeedLease(feed)).toMatchObject({
      writerId: "writer-b",
      leaseId: "lease-b",
      fencingToken: 3,
    });
    expect(
      store.acquireFeedLeaseAtomically({
        ...firstRequest,
        leaseId: "invalid-ttl",
        expectedToken: 3,
        ttlMs: 300_001,
      }),
    ).toEqual({ status: "invalid", lease: null });
  });

  it("retries one durable attempt after lease expiry with a new writer lease", () => {
    let storeNow = "2026-09-23T16:00:00.000Z";
    const store = createInMemoryKrossDryRunStore({ now: () => storeNow });
    let firstFingerprint: string | null = null;
    const interruptedStore = {
      ...store,
      admitFeedAtomically: (
        admission: Parameters<typeof store.admitFeedAtomically>[0],
      ) => {
        firstFingerprint = admission.attemptReceipt.requestFingerprint;
        return "conflict" as const;
      },
      appendAttemptEvidenceAtomically: () => "conflict" as const,
    };
    const request = feedRequest();

    const interrupted = executeKrossFeedDryRun(request, interruptedStore);
    const expiredLease = store.getFeedLease(interrupted.feedKey)!;

    expect(interrupted.failureReason).toBe("evidence_conflict");
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(0);
    expect(store.checkpointCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);

    storeNow = expiredLease.expiresAt;
    const retry = feedRequest();
    retry.writerLeaseId = "writer-lease-002";
    const recovered = executeKrossFeedDryRun(retry, store);
    const recoveredLease = store.getFeedLease(recovered.feedKey)!;

    expect(recovered.status).toBe("accepted");
    expect(recovered.operation).toBe("promote");
    expect(recoveredLease).toMatchObject({
      leaseId: "writer-lease-002",
      fencingToken: 2,
    });
    expect(
      store.getAttemptReceipt(recovered.feedKey, "feed-attempt-001")
        ?.requestFingerprint,
    ).toBe(firstFingerprint);
    expect(store.mirrorCount()).toBe(3);
    expect(store.importRunCount()).toBe(3);
    expect(store.checkpointCount()).toBe(3);
    expect(store.feedCheckpointCount()).toBe(1);
    expect(store.attemptReceiptCount()).toBe(1);
    expect(store.quarantineCount()).toBe(0);
  });

  it("rejects a writer that loses the lease-acquisition CAS before staging", () => {
    const store = createInMemoryKrossDryRunStore();
    let injected = false;
    const racingStore = {
      ...store,
      acquireFeedLeaseAtomically: (
        request: Parameters<typeof store.acquireFeedLeaseAtomically>[0],
      ) => {
        if (!injected) {
          injected = true;
          expect(
            store.acquireFeedLeaseAtomically({
              ...request,
              writerId: "competing-writer",
              leaseId: "competing-lease",
            }).status,
          ).toBe("acquired");
        }
        return store.acquireFeedLeaseAtomically(request);
      },
    };

    const result = executeKrossFeedDryRun(feedRequest(), racingStore);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("lease_unavailable");
    expect(store.feedLeaseCount()).toBe(1);
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(0);
    expect(store.checkpointCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);
  });

  it("fences a superseded writer before the atomic feed admission", () => {
    const store = createInMemoryKrossDryRunStore();
    const racingStore = {
      ...store,
      admitFeedAtomically: (
        admission: Parameters<typeof store.admitFeedAtomically>[0],
      ) => {
        const currentLease = store.getFeedLease(admission.feedKey)!;
        const supersedingLease = store.acquireFeedLeaseAtomically({
          feedKey: admission.feedKey,
          writerId: "superseding-writer",
          leaseId: "superseding-lease",
          expectedToken: currentLease.fencingToken,
          ttlMs: 60_000,
        });
        expect(supersedingLease.lease?.fencingToken).toBe(
          admission.lease.fencingToken + 1,
        );
        return store.admitFeedAtomically(admission);
      },
    };

    const result = executeKrossFeedDryRun(feedRequest(), racingStore);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("writer_fenced");
    expect(store.getFeedLease(result.feedKey)).toMatchObject({
      writerId: "superseding-writer",
      fencingToken: 2,
    });
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(0);
    expect(store.checkpointCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);
  });

  it("fences a superseded writer before rejected evidence is appended", () => {
    const store = createInMemoryKrossDryRunStore();
    const racingStore = {
      ...store,
      appendAttemptEvidenceAtomically: (
        admission: Parameters<
          typeof store.appendAttemptEvidenceAtomically
        >[0],
      ) => {
        const currentLease = store.getFeedLease(admission.receipt.feedKey)!;
        const supersedingLease = store.acquireFeedLeaseAtomically({
          feedKey: admission.receipt.feedKey,
          writerId: "superseding-writer",
          leaseId: "superseding-rejected-lease",
          expectedToken: currentLease.fencingToken,
          ttlMs: 60_000,
        });
        expect(supersedingLease.status).toBe("acquired");
        return store.appendAttemptEvidenceAtomically(admission);
      },
    };
    const request = feedRequest();
    request.expectedRowCount = 4;

    const result = executeKrossFeedDryRun(request, racingStore);

    expect(result.status).toBe("rejected");
    expect(result.failureReason).toBe("writer_fenced");
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);
    expect(store.mirrorCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
  });

  it("rejects wrong fencing evidence without any feed write", () => {
    const store = createInMemoryKrossDryRunStore();
    let captured: Parameters<typeof store.admitFeedAtomically>[0] | null = null;
    const captureStore = {
      ...store,
      admitFeedAtomically: (
        admission: Parameters<typeof store.admitFeedAtomically>[0],
      ) => {
        captured = admission;
        return "conflict" as const;
      },
      appendAttemptEvidenceAtomically: () => "conflict" as const,
    };

    executeKrossFeedDryRun(feedRequest(), captureStore);
    expect(captured).not.toBeNull();
    const validAdmission = captured!;

    const invalidLeases = [
      {
        ...validAdmission.lease,
        fencingToken: validAdmission.lease.fencingToken + 100,
      },
      { ...validAdmission.lease, writerId: "wrong-writer" },
      { ...validAdmission.lease, leaseId: "wrong-lease" },
      { ...validAdmission.lease, feedKey: `${validAdmission.feedKey}::wrong` },
    ];
    for (const lease of invalidLeases) {
      expect(store.admitFeedAtomically({ ...validAdmission, lease })).toBe(
        "fenced",
      );
    }
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(0);
    expect(store.checkpointCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);

    expect(store.admitFeedAtomically(validAdmission)).toBe("committed");
    expect(store.mirrorCount()).toBe(3);
    expect(store.importRunCount()).toBe(3);
    expect(store.checkpointCount()).toBe(3);
    expect(store.feedCheckpointCount()).toBe(1);
    expect(store.attemptReceiptCount()).toBe(1);
  });

  it("rejects wrong fencing evidence without receipt or quarantine", () => {
    const store = createInMemoryKrossDryRunStore();
    let captured: Parameters<
      typeof store.appendAttemptEvidenceAtomically
    >[0] | null = null;
    const captureStore = {
      ...store,
      appendAttemptEvidenceAtomically: (
        admission: Parameters<
          typeof store.appendAttemptEvidenceAtomically
        >[0],
      ) => {
        captured = admission;
        return "conflict" as const;
      },
    };
    const request = feedRequest();
    request.expectedRowCount = 4;

    executeKrossFeedDryRun(request, captureStore);
    expect(captured).not.toBeNull();
    const validAdmission = captured!;

    const invalidLeases = [
      {
        ...validAdmission.lease,
        fencingToken: validAdmission.lease.fencingToken + 100,
      },
      { ...validAdmission.lease, writerId: "wrong-writer" },
      { ...validAdmission.lease, leaseId: "wrong-lease" },
      {
        ...validAdmission.lease,
        feedKey: `${validAdmission.receipt.feedKey}::wrong`,
      },
    ];
    for (const lease of invalidLeases) {
      expect(
        store.appendAttemptEvidenceAtomically({ ...validAdmission, lease }),
      ).toBe("fenced");
    }
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);

    expect(store.appendAttemptEvidenceAtomically(validAdmission)).toBe(
      "inserted",
    );
    expect(store.attemptReceiptCount()).toBe(1);
    expect(store.quarantineCount()).toBe(1);
  });

  it("uses the store clock to fence expired feed promotion", () => {
    let storeNow = "2026-09-23T16:00:00.000Z";
    const store = createInMemoryKrossDryRunStore({ now: () => storeNow });
    let captured: Parameters<typeof store.admitFeedAtomically>[0] | null = null;
    const captureStore = {
      ...store,
      admitFeedAtomically: (
        admission: Parameters<typeof store.admitFeedAtomically>[0],
      ) => {
        captured = admission;
        return "conflict" as const;
      },
      appendAttemptEvidenceAtomically: () => "conflict" as const,
    };

    executeKrossFeedDryRun(feedRequest(), captureStore);
    expect(captured).not.toBeNull();
    storeNow = captured!.lease.expiresAt;

    expect(store.admitFeedAtomically(captured!)).toBe("fenced");
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(0);
    expect(store.checkpointCount()).toBe(0);
    expect(store.feedCheckpointCount()).toBe(0);
    expect(store.attemptReceiptCount()).toBe(0);
  });

  it("uses the store clock to fence expired receipt and quarantine append", () => {
    let storeNow = "2026-09-23T16:00:00.000Z";
    const store = createInMemoryKrossDryRunStore({ now: () => storeNow });
    let captured: Parameters<
      typeof store.appendAttemptEvidenceAtomically
    >[0] | null = null;
    const captureStore = {
      ...store,
      appendAttemptEvidenceAtomically: (
        admission: Parameters<
          typeof store.appendAttemptEvidenceAtomically
        >[0],
      ) => {
        captured = admission;
        return "conflict" as const;
      },
    };
    const request = feedRequest();
    request.expectedRowCount = 4;

    executeKrossFeedDryRun(request, captureStore);
    expect(captured).not.toBeNull();
    storeNow = captured!.lease.expiresAt;

    expect(store.appendAttemptEvidenceAtomically(captured!)).toBe("fenced");
    expect(store.attemptReceiptCount()).toBe(0);
    expect(store.quarantineCount()).toBe(0);
  });
});
