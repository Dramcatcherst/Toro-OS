import { describe, expect, it } from "vitest";

import {
  buildBookingAssistPath,
  parseBookingAssistPrefill,
} from "./booking-assist-prefill";

describe("booking assist prefill", () => {
  it("accepts valid bounded prefill values", () => {
    const params = new URLSearchParams(
      "from=2026-10-10&to=2026-10-12&adults=4&children=2&currency=CRC",
    );

    expect(parseBookingAssistPrefill(params)).toEqual({
      from: "2026-10-10",
      to: "2026-10-12",
      adults: 4,
      children: 2,
      currency: "CRC",
    });
  });

  it("fails closed to safe defaults for invalid values", () => {
    const params = new URLSearchParams(
      "from=2026-02-31&to=not-a-date&adults=99&children=-1&currency=EUR",
    );

    expect(parseBookingAssistPrefill(params)).toEqual({
      from: "",
      to: "",
      adults: 2,
      children: 0,
      currency: "USD",
    });
  });

  it("builds a shareable internal prefill path", () => {
    expect(
      buildBookingAssistPath({
        from: "2026-11-01",
        to: "2026-11-04",
        adults: 2,
        children: 0,
        currency: "USD",
      }),
    ).toBe(
      "/booking-assist?from=2026-11-01&to=2026-11-04&adults=2&children=0&currency=USD",
    );
  });
});
