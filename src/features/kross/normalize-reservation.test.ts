import { describe, expect, it } from "vitest";

import { normalizeKrossReservationCandidate } from "./normalize-reservation";

const candidate = {
  orgId: "11111111-1111-1111-1111-111111111111",
  propertyId: "22222222-2222-2222-2222-222222222222",
  externalReservationId: "KROSS-123",
  reservationKey: "RES-123",
  roomCodeRaw: "26",
  checkIn: "2026-09-23",
  checkOut: "2026-09-25",
  status: "confirmed",
  guestsCount: 2,
  adults: 2,
  children: 0,
  channel: "Direct",
};

const evidence = {
  authorizedTransport: true,
  directFromKross: true,
  readOnly: true,
  sourceAsOf: "2026-09-23T18:00:00.000Z",
  observedAt: "2026-09-23T18:01:00.000Z",
  sourceReference: "kross://reservations/run-1",
  sourceHash: "abc123",
};

describe("normalizeKrossReservationCandidate", () => {
  it("marks a directly evidenced authorized read-only Kross row as verified live", () => {
    const result = normalizeKrossReservationCandidate(
      candidate,
      evidence,
      "2026-09-23T18:02:00.000Z",
    );

    expect(result.issues).toEqual([]);
    expect(result.canEnterSafeView).toBe(true);
    expect(result.reservation).toMatchObject({
      transactional_authority: "Kross",
      read_only_mirror: true,
      source_is_live: true,
      data_quality_status: "verified",
      source_system: "Kross",
      source_table: "reservations",
      source_record_id:
        "22222222-2222-2222-2222-222222222222:KROSS-123",
    });
  });

  it("keeps indirect or unauthorized material out of live truth", () => {
    const result = normalizeKrossReservationCandidate(
      candidate,
      {
        ...evidence,
        authorizedTransport: false,
        directFromKross: false,
      },
      "2026-09-23T18:02:00.000Z",
    );

    expect(result.reservation?.source_is_live).toBe(false);
    expect(result.reservation?.data_quality_status).toBe("review");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "transport_not_authorized",
        "transport_not_direct",
      ]),
    );
  });

  it("rejects missing external identity instead of guessing one", () => {
    const result = normalizeKrossReservationCandidate(
      { ...candidate, externalReservationId: " " },
      evidence,
      "2026-09-23T18:02:00.000Z",
    );

    expect(result.reservation).toBeNull();
    expect(result.canEnterSafeView).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "missing_external_id",
    );
  });

  it("rejects reversed stay dates", () => {
    const result = normalizeKrossReservationCandidate(
      { ...candidate, checkIn: "2026-09-25", checkOut: "2026-09-23" },
      evidence,
      "2026-09-23T18:02:00.000Z",
    );

    expect(result.reservation).toBeNull();
    expect(result.issues.map((issue) => issue.code)).toContain(
      "checkout_before_checkin",
    );
  });

  it("rejects future source timestamps", () => {
    const result = normalizeKrossReservationCandidate(
      candidate,
      {
        ...evidence,
        sourceAsOf: "2026-09-23T19:00:00.000Z",
      },
      "2026-09-23T18:02:00.000Z",
    );

    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation?.source_is_live).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "future_source_time",
    );
  });

  it("namespaces source identity by property to avoid cross-property collisions", () => {
    const a = normalizeKrossReservationCandidate(
      candidate,
      evidence,
      "2026-09-23T18:02:00.000Z",
    );
    const b = normalizeKrossReservationCandidate(
      {
        ...candidate,
        propertyId: "33333333-3333-3333-3333-333333333333",
      },
      evidence,
      "2026-09-23T18:02:00.000Z",
    );

    expect(a.reservation?.source_record_id).not.toBe(
      b.reservation?.source_record_id,
    );
  });
});
