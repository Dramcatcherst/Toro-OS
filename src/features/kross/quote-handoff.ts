import { buildBookingAssistPath } from "./booking-assist-prefill";
import { isKrossDateOnly, isKrossAdultCount, isKrossChildCount } from "./public-search-link";

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
      missing: Array<"from" | "to" | "adults" | "children">;
    };

export function prepareQuoteHandoff(
  facts: QuoteHandoffFacts,
): QuoteHandoffPreparation {
  const missing: Array<"from" | "to" | "adults" | "children"> = [];
  const from = isKrossDateOnly(facts.from) ? facts.from : null;
  const to = isKrossDateOnly(facts.to) ? facts.to : null;
  const children = facts.children ?? 0;

  if (!from) missing.push("from");
  if (!to || (from && to <= from)) missing.push("to");
  if (!isKrossAdultCount(facts.adults)) {
    missing.push("adults");
  }
  if (!isKrossChildCount(children)) missing.push("children");

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
      from: from ?? undefined,
      to: to ?? undefined,
      adults: facts.adults ?? undefined,
      children,
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
  if (preparation.missing.includes("children")) {
    return "¿Cuántos niños serían?";
  }

  return null;
}
