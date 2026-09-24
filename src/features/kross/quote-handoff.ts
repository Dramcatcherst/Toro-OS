import { buildBookingAssistPath } from "./booking-assist-prefill";

export type QuoteHandoffFacts = {
  from?: string | null;
  to?: string | null;
  adults?: number | null;
  children?: number | null;
  currency?: "USD" | "CRC" | null;
};

export type QuoteHandoffPreparation =
  | {
      state: "ready";
      path: string;
      missing: [];
    }
  | {
      state: "needs_input";
      path: null;
      missing: Array<"from" | "to" | "adults">;
    };

export function prepareQuoteHandoff(
  facts: QuoteHandoffFacts,
): QuoteHandoffPreparation {
  const missing: Array<"from" | "to" | "adults"> = [];

  if (!facts.from) missing.push("from");
  if (!facts.to) missing.push("to");
  if (!Number.isInteger(facts.adults) || (facts.adults ?? 0) < 1) {
    missing.push("adults");
  }

  if (missing.length) {
    return {
      state: "needs_input",
      path: null,
      missing,
    };
  }

  return {
    state: "ready",
    path: buildBookingAssistPath({
      from: facts.from ?? undefined,
      to: facts.to ?? undefined,
      adults: facts.adults ?? undefined,
      children:
        Number.isInteger(facts.children) && (facts.children ?? 0) >= 0
          ? facts.children ?? 0
          : 0,
      currency: facts.currency ?? "USD",
    }),
    missing: [],
  };
}

export function nextQuoteHandoffQuestion(
  preparation: QuoteHandoffPreparation,
): string | null {
  if (preparation.state === "ready") return null;

  if (preparation.missing.includes("from") && preparation.missing.includes("to")) {
    return "¿Qué fechas tienes en mente para llegada y salida?";
  }
  if (preparation.missing.includes("from")) {
    return "¿Qué día sería la llegada?";
  }
  if (preparation.missing.includes("to")) {
    return "¿Qué día sería la salida?";
  }
  if (preparation.missing.includes("adults")) {
    return "¿Cuántos adultos serían?";
  }

  return null;
}
