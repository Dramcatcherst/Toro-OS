import { describe, expect, it } from "vitest";

import { normalizeKrossReservationCandidate, type KrossReservationCandidate, type KrossTransportEvidence } from "./normalize-reservation";
import { adaptKrossReservationPayload } from "./transport-adapter";

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
  it.each([
    { guestsCount: 1, adults: 2, children: null },
    { guestsCount: 1, adults: undefined, children: 2 },
    { guestsCount: 0, adults: 1, children: undefined },
  ])("keeps contradictory partial guest counts out of current truth: %j", counts => {
    const result = normalizeKrossReservationCandidate({ ...candidate, ...counts }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation).toMatchObject({ source_is_live: false, data_quality_status: "review", guests_count: counts.guestsCount });
    expect(result.issues.map(issue => issue.code)).toContain("inconsistent_guest_count");
  });

  it("keeps an unsafe component sum in review even when the total is absent", () => {
    const result = normalizeKrossReservationCandidate({ ...candidate, guestsCount: null, adults: Number.MAX_SAFE_INTEGER, children: 1 }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation?.data_quality_status).toBe("review");
    expect(result.reservation?.guests_count).toBeNull();
    expect(result.issues.map(issue => issue.code)).toContain("inconsistent_guest_count");
  });

  it.each(["false", 0, {}, []])("does not verify an invalid direct breakfast entitlement: %j", breakfastIncluded => {
    const malformed = { ...candidate, breakfastIncluded } as unknown as KrossReservationCandidate;
    const result = normalizeKrossReservationCandidate(malformed, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation).toMatchObject({ breakfast_included: null, source_is_live: false, data_quality_status: "review" });
    expect(result.issues.map(issue => issue.code)).toContain("invalid_breakfast_entitlement");
  });

  it.each([
    { guestsCount: 2, adults: 1, children: null },
    { guestsCount: 2, adults: undefined, children: 0 },
    { guestsCount: null, adults: Number.MAX_SAFE_INTEGER, children: 0 },
  ])("preserves valid partial counts without inventing the missing value: %j", counts => {
    const result = normalizeKrossReservationCandidate({ ...candidate, ...counts }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(true);
    expect(result.reservation).toMatchObject({ guests_count: counts.guestsCount, adults: counts.adults ?? null, children: counts.children ?? null });
  });

  it.each([true, false, null, undefined])("preserves a valid or unknown breakfast entitlement: %s", breakfastIncluded => {
    const result = normalizeKrossReservationCandidate({ ...candidate, breakfastIncluded }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(true);
    expect(result.reservation?.breakfast_included).toBe(breakfastIncluded ?? null);
  });

  it("carries partial count contradictions through the configured transport adapter", () => {
    const mapped = adaptKrossReservationPayload({ id: "R-partial", from: candidate.checkIn, to: candidate.checkOut, status: "confirmed", total: "1", adults: "2" }, {
      orgId: candidate.orgId, propertyId: candidate.propertyId,
      fieldMap: { externalReservationId: "id", checkIn: "from", checkOut: "to", status: "status", guestsCount: "total", adults: "adults" },
    });
    expect(mapped.issues).toEqual([]);
    const result = normalizeKrossReservationCandidate(mapped.candidate!, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation).toMatchObject({ guests_count: 1, adults: 2, children: null, data_quality_status: "review" });
  });

  it.each(["authorizedTransport", "directFromKross", "readOnly"])("does not promote malformed authority flag %s", key => {
    const malformed = { ...evidence, [key]: "false" } as unknown as KrossTransportEvidence;
    const result = normalizeKrossReservationCandidate(candidate, malformed, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation?.source_is_live).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it.each(["", "  ", undefined])("does not verify missing required reservation status %s", status => {
    const result = normalizeKrossReservationCandidate({ ...candidate, status: status as string }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.issues.map(issue => issue.code)).toContain("missing_status");
  });

  it("preserves a nonempty official status without guessing a vendor whitelist", () => {
    const result = normalizeKrossReservationCandidate({ ...candidate, status: "vendor_status_v2" }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(true);
    expect(result.reservation?.status).toBe("vendor_status_v2");
  });

  it.each(["2026-02-29", "2026-02-30", "2026-04-31"])("rejects impossible calendar date %s", (checkIn) => {
    const result = normalizeKrossReservationCandidate({ ...candidate, checkIn }, evidence, "2026-09-23T18:02:00Z");
    expect(result.reservation).toBeNull();
    expect(result.issues.map(issue => issue.code)).toContain("invalid_date");
  });

  it("keeps a valid leap day", () => {
    const result = normalizeKrossReservationCandidate({ ...candidate, checkIn: "2028-02-29", checkOut: "2028-03-01" }, evidence, "2026-09-23T18:02:00Z");
    expect(result.reservation?.check_in).toBe("2028-02-29");
  });

  it("accepts precise ISO source timestamps with a declared timezone", () => {
    const result = normalizeKrossReservationCandidate(candidate, { ...evidence, sourceAsOf: "2026-09-23T18:00:00.123456+00:00" }, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(true);
  });

  it.each(["broken", "2026-02-30T18:02:00Z", "2026-09-23T24:00:00Z", "2026-09-23T18:02:00"])("fails closed for invalid evaluation clock %s", now => {
    const result = normalizeKrossReservationCandidate(candidate, evidence, now);
    expect(result.canEnterSafeView).toBe(false);
    expect(result.issues.map(issue => issue.code)).toContain("invalid_now");
  });

  it("keeps observations preceding their source out of current truth", () => {
    const result = normalizeKrossReservationCandidate(candidate, { ...evidence, observedAt: "2026-09-23T17:59:00Z" }, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.issues.map(issue => issue.code)).toContain("observation_before_source");
  });

  it("does not refresh an old snapshot by importing it now", () => {
    const result = normalizeKrossReservationCandidate(candidate, { ...evidence, sourceAsOf: "2026-09-22T18:00:00Z" }, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation?.data_quality_status).toBe("review");
    expect(result.issues.map(issue => issue.code)).toContain("stale_source_time");
  });

  it("allows exactly six hours and rejects stale source and sync independently", () => {
    const boundary = normalizeKrossReservationCandidate(candidate, evidence, "2026-09-24T00:00:00Z");
    expect(boundary.canEnterSafeView).toBe(true);
    const stale = normalizeKrossReservationCandidate(candidate, evidence, "2026-09-24T00:02:00Z");
    expect(stale.canEnterSafeView).toBe(false);
    expect(stale.issues.map(issue => issue.code)).toEqual(expect.arrayContaining(["stale_source_time", "stale_observed_time"]));
  });

  it("preserves optional mapping failures as review quality through normalization", () => {
    const mapped = adaptKrossReservationPayload({ id: "R1", from: candidate.checkIn, to: candidate.checkOut, status: "confirmed", breakfast: "maybe", guests: "bad" }, {
      orgId: candidate.orgId, propertyId: candidate.propertyId,
      fieldMap: { externalReservationId: "id", checkIn: "from", checkOut: "to", status: "status", breakfastIncluded: "breakfast", guestsCount: "guests" },
    });
    expect(mapped.candidate).not.toBeNull();
    const result = normalizeKrossReservationCandidate(mapped.candidate!, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation).toMatchObject({ breakfast_included: null, guests_count: null, data_quality_status: "review" });
    expect(result.issues.map(issue => issue.code)).toContain("source_mapping_issue");
  });

  it("does not treat contradictory guest counts as verified", () => {
    const result = normalizeKrossReservationCandidate({ ...candidate, guestsCount: 1, adults: 2, children: 1 }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.issues.map(issue => issue.code)).toContain("inconsistent_guest_count");
  });

  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1])("does not verify unsafe guest count %s", guestsCount => {
    const result = normalizeKrossReservationCandidate({ ...candidate, guestsCount }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(false);
    expect(result.reservation?.guests_count).toBeNull();
    expect(result.issues.map(issue => issue.code)).toContain("invalid_guest_count");
  });

  it("preserves absent guest counts without inventing totals", () => {
    const result = normalizeKrossReservationCandidate({ ...candidate, guestsCount: null }, evidence, "2026-09-23T18:02:00Z");
    expect(result.canEnterSafeView).toBe(true);
    expect(result.reservation?.guests_count).toBeNull();
  });
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
