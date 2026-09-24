import { describe, expect, it } from "vitest";

import {
  nextQuoteHandoffQuestion,
  prepareQuoteHandoff,
} from "./quote-handoff";

describe("prepareQuoteHandoff", () => {
  it("builds a booking-assist path when required facts are known", () => {
    const result = prepareQuoteHandoff({
      from: "2026-11-01",
      to: "2026-11-04",
      adults: 2,
      children: 1,
      currency: "USD",
    });

    expect(result).toEqual({
      state: "ready",
      path:
        "/booking-assist?from=2026-11-01&to=2026-11-04&adults=2&children=1&currency=USD",
      missing: [],
    });
  });

  it("asks only for the missing material fact", () => {
    const result = prepareQuoteHandoff({
      from: "2026-11-01",
      to: "2026-11-04",
      adults: null,
    });

    expect(result).toEqual({
      state: "needs_input",
      path: null,
      missing: ["adults"],
    });
    expect(nextQuoteHandoffQuestion(result)).toBe("¿Cuántos adultos serían?");
  });

  it("asks for dates together when both are missing", () => {
    const result = prepareQuoteHandoff({
      adults: 2,
    });

    expect(nextQuoteHandoffQuestion(result)).toBe(
      "¿Qué fechas tienes en mente para llegada y salida?",
    );
  });
});
