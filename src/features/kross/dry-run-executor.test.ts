import { describe, expect, it } from "vitest";

import {
  createInMemoryKrossDryRunStore,
  executeKrossDryRun,
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
  sourceHash: "hash-k-100-v1",
};

const baseRequest = {
  adapterConfig,
  evidence: baseEvidence,
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
        evidence: { ...baseEvidence, sourceHash: "hash-k-100-v2" },
      },
      store,
    );

    expect(updated.operation).toBe("update");
    expect(updated.reservation?.external_reservation_id).toBe("K-100");
    expect(updated.reservation?.status).toBe("cancelled");
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(2);
    expect(updated.pmsWriteCount).toBe(0);
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
    expect(store.mirrorCount()).toBe(0);
    expect(store.importRunCount()).toBe(1);
  });
});
