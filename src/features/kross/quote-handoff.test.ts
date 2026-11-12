import { describe, expect, it } from "vitest";

import {
  nextQuoteHandoffQuestion,
  prepareQuoteHandoff,
} from "./quote-handoff";
import { parseBookingAssistPrefill } from "./booking-assist-prefill";

const knownFacts = { from: "2026-11-01", to: "2026-11-04", adults: 2, children: 1, currency: "CRC" as const };

describe("prepareQuoteHandoff", () => {
  it.each([
    { facts: { from: "tomorrow" }, missing: "from" },
    { facts: { from: "2026-02-30" }, missing: "from" },
    { facts: { to: "2026-11-01" }, missing: "to" },
    { facts: { to: "2026-10-31" }, missing: "to" },
    { facts: { adults: 99 }, missing: "adults" },
    { facts: { adults: 1.5 }, missing: "adults" },
    { facts: { children: 99 }, missing: "children" },
    { facts: { children: -1 }, missing: "children" },
    { facts: { children: 1.5 }, missing: "children" },
  ])("asks to correct only invalid supplied facts: %j", ({ facts, missing }) => {
    const result = prepareQuoteHandoff({ ...knownFacts, ...facts });
    expect(result).toEqual({ state: "needs_input", path: null, missing: [missing] });
    expect(nextQuoteHandoffQuestion(result)).not.toBeNull();
    if (missing === "children") expect(nextQuoteHandoffQuestion(result)).toBe("¿Cuántos niños serían?");
  });

  it.each([undefined, null])("keeps the existing omitted-children default %s", children => {
    const result = prepareQuoteHandoff({ ...knownFacts, children });
    expect(result.state).toBe("ready");
    if (result.path) expect(parseBookingAssistPrefill(new URLSearchParams(result.path.split("?")[1]))).toEqual({ ...knownFacts, children: 0 });
  });

  it.each([{ adults: 1, children: 0 }, { adults: 12, children: 6 }])("preserves ready facts through the connected destination: %j", counts => {
    const result = prepareQuoteHandoff({ ...knownFacts, ...counts });
    expect(result.state).toBe("ready");
    if (result.path) expect(parseBookingAssistPrefill(new URLSearchParams(result.path.split("?")[1]))).toEqual({ ...knownFacts, ...counts });
  });

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
