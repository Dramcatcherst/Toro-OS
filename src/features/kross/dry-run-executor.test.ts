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

  it("imports and independently replays two reservations from the same source file", () => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossDryRun({ ...baseRequest, payload: payload() }, store);
    const second = executeKrossDryRun({ ...baseRequest, payload: payload("confirmed", "K-101") }, store);

    expect(first.operation).toBe("insert");
    expect(second.operation).toBe("insert");
    expect(second.reservation?.external_reservation_id).toBe("K-101");
    expect(first.importRun.runKey).not.toBe(second.importRun.runKey);
    expect(executeKrossDryRun({ ...baseRequest, payload: payload() }, store).operation).toBe("replay");
    expect(executeKrossDryRun({ ...baseRequest, payload: payload("confirmed", "K-101") }, store).operation).toBe("replay");
    expect(store.mirrorCount()).toBe(2);
    expect(store.importRunCount()).toBe(2);
  });

  it.each([
    { orgId: "33333333-3333-3333-3333-333333333333", propertyId: adapterConfig.propertyId },
    { orgId: adapterConfig.orgId, propertyId: "33333333-3333-3333-3333-333333333333" },
  ])("keeps the same external id and file independent across scope $orgId/$propertyId", (scope) => {
    const store = createInMemoryKrossDryRunStore();
    const first = executeKrossDryRun({ ...baseRequest, payload: payload() }, store);
    const second = executeKrossDryRun({ ...baseRequest, adapterConfig: { ...adapterConfig, ...scope }, payload: payload() }, store);

    expect(second.operation).toBe("insert");
    expect(second.importRun.runKey).not.toBe(first.importRun.runKey);
    expect(second.reservation).toMatchObject({ org_id: scope.orgId, property_id: scope.propertyId });
    expect(store.mirrorCount()).toBe(2);
  });

  it("preserves every absent optional field when a newer partial payload changes status", () => {
    const store = createInMemoryKrossDryRunStore();
    const config = {
      ...adapterConfig,
      fieldMap: { ...adapterConfig.fieldMap, reservationKey: "reservation.code", roomId: "stay.room_id", guestsCount: "guests.total", adults: "guests.adults", children: "guests.children", channel: "reservation.channel", breakfastIncluded: "extras.breakfast" },
    };
    executeKrossDryRun({ ...baseRequest, adapterConfig: config, payload: { ...payload(), reservation: { id: "K-100", status: "confirmed", code: "RES-100", channel: "Direct" }, stay: { ...payload().stay, room_id: "room-26" }, guests: { total: 3, adults: 2, children: 1 }, extras: { breakfast: true } } }, store);
    const updated = executeKrossDryRun({ ...baseRequest, adapterConfig: config, payload: { reservation: { id: "K-100", status: "cancelled" }, stay: { check_in: "2026-09-25", check_out: "2026-09-27" } }, evidence: { ...baseEvidence, sourceHash: "hash-sparse-new", sourceAsOf: "2026-09-23T15:01:00.000Z" } }, store);

    expect(updated.operation).toBe("update");
    expect(updated.reservation).toMatchObject({ status: "cancelled", reservation_key: "RES-100", room_id: "room-26", room_code_raw: "26", guests_count: 3, adults: 2, children: 1, channel: "Direct", breakfast_included: true });
    expect(store.mirrorCount()).toBe(1);
  });

  it("applies explicit null, false and zero rather than treating them as absent", () => {
    const store = createInMemoryKrossDryRunStore();
    const config = { ...adapterConfig, fieldMap: { ...adapterConfig.fieldMap, children: "guests.children", breakfastIncluded: "extras.breakfast" } };
    executeKrossDryRun({ ...baseRequest, adapterConfig: config, payload: { ...payload(), guests: { children: 1 }, extras: { breakfast: true } } }, store);
    const updated = executeKrossDryRun({ ...baseRequest, adapterConfig: config, payload: { ...payload(), stay: { ...payload().stay, room: null }, guests: { children: 0 }, extras: { breakfast: false } }, evidence: { ...baseEvidence, sourceHash: "hash-explicit-clear", sourceAsOf: "2026-09-23T15:01:00.000Z" } }, store);

    expect(updated.reservation).toMatchObject({ room_code_raw: null, children: 0, breakfast_included: false });
  });

  it("rejects a late old snapshot without restoring a cancelled reservation", () => {
    const store = createInMemoryKrossDryRunStore();
    const cancelled = executeKrossDryRun({ ...baseRequest, payload: payload("cancelled") }, store);
    const oldRequest = { ...baseRequest, payload: payload(), evidence: { ...baseEvidence, sourceHash: "hash-late-old", sourceAsOf: "2026-09-23T14:00:00.000Z", observedAt: "2026-09-23T15:30:00.000Z" } };
    const rejected = executeKrossDryRun(oldRequest, store);

    expect(rejected.status).toBe("rejected");
    expect(rejected.operation).toBe("reject");
    expect(rejected.normalizationIssues.map((issue) => issue.code)).toContain("older_source_version");
    expect(executeKrossDryRun(oldRequest, store).status).toBe("rejected");
    expect(store.getMirror(cancelled.importRun.identityKey!)?.status).toBe("cancelled");
    expect(store.getMirror(cancelled.importRun.identityKey!)?.source_hash).toBe(baseEvidence.sourceHash);
    expect(store.mirrorCount()).toBe(1);
    expect(store.importRunCount()).toBe(2);
  });

  it("rejects a formerly accepted older replay after a newer cancellation", () => {
    const store = createInMemoryKrossDryRunStore();
    const original = { ...baseRequest, payload: payload() };
    const first = executeKrossDryRun(original, store);
    executeKrossDryRun({ ...baseRequest, payload: payload("cancelled"), evidence: { ...baseEvidence, sourceHash: "hash-cancel-new", sourceAsOf: "2026-09-23T15:01:00.000Z" } }, store);
    const replay = executeKrossDryRun(original, store);

    expect(replay.status).toBe("rejected");
    expect(replay.importRun.status).toBe("rejected");
    expect(store.getMirror(first.importRun.identityKey!)?.status).toBe("cancelled");
    expect(store.getImportRun(first.importRun.runKey)?.status).toBe("accepted");
    expect(store.importRunCount()).toBe(2);
  });
});
