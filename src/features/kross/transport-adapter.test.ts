import { describe, expect, it } from "vitest";

import { adaptKrossReservationPayload } from "./transport-adapter";

const config = {
  orgId: "11111111-1111-1111-1111-111111111111",
  propertyId: "22222222-2222-2222-2222-222222222222",
  fieldMap: {
    externalReservationId: "reservation.id",
    reservationKey: "reservation.code",
    roomCodeRaw: "stay.room",
    checkIn: "stay.check_in",
    checkOut: "stay.check_out",
    status: "reservation.status",
    guestsCount: "guests.total",
    adults: "guests.adults",
    children: "guests.children",
    channel: "reservation.channel",
    breakfastIncluded: "extras.breakfast",
  },
};

describe("adaptKrossReservationPayload", () => {
  it.each([{ id: "R1" }, ["R1"], true, Number.MAX_SAFE_INTEGER + 1])("rejects invalid mapped identity %j", id => {
    const result = adaptKrossReservationPayload({ reservation: { id, status: "confirmed" }, stay: { check_in: "2026-09-23", check_out: "2026-09-25" } }, config);
    expect(result.candidate).toBeNull();
    expect(result.issues.map(issue => issue.code)).toContain("invalid_text_value");
  });

  it.each([".", "reservation..id", "toString", "__proto__.id"])("rejects unsafe mapped identity path %s", externalReservationId => {
    const result = adaptKrossReservationPayload({ reservation: { id: "R1", status: "confirmed" }, stay: { check_in: "2026-09-23", check_out: "2026-09-25" } }, { ...config, fieldMap: { ...config.fieldMap, externalReservationId } });
    expect(result.candidate).toBeNull();
  });

  it("keeps explicitly mapped safe numeric identities", () => {
    const result = adaptKrossReservationPayload({ reservation: { id: 123, status: "confirmed" }, stay: { check_in: "2026-09-23", check_out: "2026-09-25" } }, config);
    expect(result.candidate?.externalReservationId).toBe("123");
  });

  it.each([".", "__proto__.guests"])("reports invalid optional mapping path %s instead of treating it as absent", guestsCount => {
    const result = adaptKrossReservationPayload({ reservation: { id: "R1", status: "confirmed" }, stay: { check_in: "2026-09-23", check_out: "2026-09-25" } }, { ...config, fieldMap: { ...config.fieldMap, guestsCount } });
    expect(result.candidate).not.toBeNull();
    expect(result.issues.map(issue => issue.code)).toContain("invalid_mapping_path");
    expect(result.candidate?.mappingIssues).toEqual(expect.arrayContaining([expect.objectContaining({ field: "guestsCount", code: "invalid_mapping_path" })]));
  });

  it("preserves blank numeric values as absent and rejects imprecise integers", () => {
    const source = { reservation: { id: "R1", status: "confirmed" }, stay: { check_in: "2026-09-23", check_out: "2026-09-25" }, guests: { total: "   ", adults: Number.MAX_SAFE_INTEGER + 1 } };
    const result = adaptKrossReservationPayload(source, config);
    expect(result.candidate?.guestsCount).toBeNull();
    expect(result.candidate?.adults).toBeNull();
    expect(result.issues.map(issue => issue.code)).toContain("invalid_numeric_value");
  });
  it("maps a synthetic official-shape candidate without embedding vendor field names in core normalization", () => {
    const result = adaptKrossReservationPayload(
      {
        reservation: {
          id: "K-100",
          code: "ABC-100",
          status: "confirmed",
          channel: "Direct",
        },
        stay: {
          room: "26",
          check_in: "2026-09-23",
          check_out: "2026-09-25",
        },
        guests: {
          total: "3",
          adults: 2,
          children: 1,
        },
        extras: {
          breakfast: "yes",
        },
      },
      config,
    );

    expect(result.issues).toEqual([]);
    expect(result.candidate).toMatchObject({
      orgId: config.orgId,
      propertyId: config.propertyId,
      externalReservationId: "K-100",
      reservationKey: "ABC-100",
      roomCodeRaw: "26",
      checkIn: "2026-09-23",
      checkOut: "2026-09-25",
      status: "confirmed",
      guestsCount: 3,
      adults: 2,
      children: 1,
      channel: "Direct",
      breakfastIncluded: true,
    });
  });

  it("fails closed when a required mapped value is absent", () => {
    const result = adaptKrossReservationPayload(
      {
        reservation: { status: "confirmed" },
        stay: {
          check_in: "2026-09-23",
          check_out: "2026-09-25",
        },
      },
      config,
    );

    expect(result.candidate).toBeNull();
    expect(result.issues.map((issue) => issue.code)).toContain(
      "mapped_value_missing",
    );
  });

  it("does not silently coerce invalid guest counts", () => {
    const result = adaptKrossReservationPayload(
      {
        reservation: {
          id: "K-101",
          status: "confirmed",
        },
        stay: {
          check_in: "2026-09-23",
          check_out: "2026-09-25",
        },
        guests: {
          total: "two",
        },
      },
      config,
    );

    expect(result.candidate).not.toBeNull();
    expect(result.candidate?.guestsCount).toBeNull();
    expect(result.issues.map((issue) => issue.code)).toContain(
      "invalid_numeric_value",
    );
  });

  it("rejects non-object payloads", () => {
    const result = adaptKrossReservationPayload([], config);
    expect(result.candidate).toBeNull();
    expect(result.issues).toEqual([
      expect.objectContaining({ code: "invalid_payload" }),
    ]);
  });
});
