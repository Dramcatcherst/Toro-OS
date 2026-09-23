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
