import { describe, expect, it } from "vitest";

import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { evaluateAlegraDuplicatePreflight as evaluate } from "./alegra-writer-dedupe";

const checkedAt = "2026-10-11T09:00:00Z";
const window = { now: checkedAt, maxAgeMs: 60_000 };
const evaluateAlegraDuplicatePreflight = (input: Omit<Parameters<typeof evaluate>[0], "now" | "maxAgeMs">) => evaluate({ ...window, ...input });

const intent = prepareAlegraWriteIntent({
  scope: {
    tenantId: "tenant-dreamcatcher",
    orgId: "595801ce-2895-4d91-81ae-e8d1d5cc8593",
    legalEntityKey: "atrapa-suenos-santa-teresa-sa",
  },
  evidence: {
    sourceRefs: ["gmail:1"],
    evidenceHash: "sha256:abc",
  },
  payload: {
    targetType: "purchase_bill",
    documentNumber: "INV-100",
    supplierNativeId: "supplier-42",
    issuerTaxId: "3-101-000000",
    receiverTaxId: "3-101-999999",
    issueDate: "2026-10-11",
    dueDate: "2026-10-21",
    currency: "USD",
    total: "113.00",
    accountNativeId: "expense-software",
    costCenterNativeId: "dreamcatcher",
  },
});

const completeCoverage = [
  { source: "toro" as const, coverage: "complete" as const, checkedAt },
  { source: "alegra" as const, coverage: "complete" as const, checkedAt },
  { source: "receipt" as const, coverage: "complete" as const, checkedAt },
];

describe("Alegra writer duplicate preflight", () => {
  it.each([undefined, "invalid", "2026-10-11T09:00:01Z", "2026-10-11T08:58:59Z"])("rejects missing, malformed, future or expired complete observations: %s", observed => {
    const result = evaluateAlegraDuplicatePreflight({ intent, candidates: [], sourceStates: completeCoverage.map(state => ({ ...state, checkedAt: observed })) });
    expect(result.state).toBe("COVERAGE_INSUFFICIENT");
  });
  it("accepts an observation exactly at the caller's freshness boundary", () => {
    expect(evaluateAlegraDuplicatePreflight({ intent, candidates: [], sourceStates: completeCoverage.map(state => ({ ...state, checkedAt: "2026-10-11T08:59:00Z" })) }).state).toBe("CLEAR");
  });
  it.each([{ now: "invalid", maxAgeMs: 60_000 }, { now: checkedAt, maxAgeMs: 0 }, { now: checkedAt, maxAgeMs: Number.POSITIVE_INFINITY }])("fails closed for an invalid explicit evaluation window %#", invalidWindow => {
    expect(evaluate({ intent, candidates: [], sourceStates: completeCoverage, ...invalidWindow }).state).toBe("COVERAGE_INSUFFICIENT");
  });
  it.each([
    { now: "2026-03-03T09:00:00Z", observed: "2026-02-31T09:00:00Z" },
    { now: "2026-02-31T09:00:00Z", observed: "2026-03-03T09:00:00Z" },
    { now: checkedAt, observed: "2026-10-11T09:00:00" },
    { now: "2026-10-11T09:00:00", observed: checkedAt },
    { now: checkedAt, observed: "2026-10-11" },
    { now: "2026-10-12T00:00:00Z", observed: "2026-10-11T24:00:00Z" },
  ])("requires zoned ISO timestamps with real calendar and clock fields %#", ({ now, observed }) => {
    expect(evaluate({ intent, candidates: [], now, maxAgeMs: 1000, sourceStates: completeCoverage.map(state => ({ ...state, checkedAt: observed })) }).state).toBe("COVERAGE_INSUFFICIENT");
  });
  it("compares valid zoned timestamps as instants", () => {
    expect(evaluate({ intent, candidates: [], now: "2026-10-11T08:00:00.000Z", maxAgeMs: 1000, sourceStates: completeCoverage.map(state => ({ ...state, checkedAt: "2026-10-11T09:00:00+01:00" })) }).state).toBe("CLEAR");
  });
  it.each(["unknown", "duplicate-first", "duplicate-last"])("requires one complete observation per required source: %s", issue => {
    const states = issue === "unknown" ? completeCoverage.map(state => ({ ...state, coverage: "unknown" as "complete" }))
      : issue === "duplicate-first" ? [{ ...completeCoverage[0], coverage: "unavailable" as const }, ...completeCoverage]
      : [...completeCoverage, { ...completeCoverage[0], coverage: "unavailable" as const }];
    expect(evaluateAlegraDuplicatePreflight({ intent, candidates: [], sourceStates: states }).state).toBe("COVERAGE_INSUFFICIENT");
  });
  it.each(["113", "113.0", "00113.000"])("holds a probable duplicate with equivalent decimal amount %s", total => {
    const result = evaluateAlegraDuplicatePreflight({ intent, sourceStates: completeCoverage, candidates: [{ source: "alegra", sourceRef: "fixture:probable", confidence: "probable", supplierNativeId: intent.payload.supplierNativeId, currency: "USD", total }] });
    expect(result.state).toBe("DUPLICATE_CANDIDATE");
  });
  it.each(["113.01", "1.13e2", "113,00"])("does not equate different or ambiguous duplicate amounts %s", total => {
    expect(evaluateAlegraDuplicatePreflight({ intent, sourceStates: completeCoverage, candidates: [{ source: "alegra", sourceRef: "fixture:other", confidence: "probable", supplierNativeId: intent.payload.supplierNativeId, currency: "USD", total }] }).state).toBe("CLEAR");
  });
  it.each([
    { legalEntityKey: "another-entity", targetType: "purchase_bill" },
    { legalEntityKey: intent.scope.legalEntityKey, targetType: "outgoing_payment" },
    {},
  ])("does not treat shared evidence alone as another scope or document type's identity %#", identity => {
    expect(evaluateAlegraDuplicatePreflight({ intent, sourceStates: completeCoverage, candidates: [{ source: "toro", sourceRef: "fixture:shared", confidence: "exact", evidenceHash: intent.evidence.evidenceHash, ...identity }] }).state).toBe("CLEAR");
  });
  it("retains same-scope purchase evidence duplicate detection", () => {
    expect(evaluateAlegraDuplicatePreflight({ intent, sourceStates: completeCoverage, candidates: [{ source: "toro", sourceRef: "fixture:same", confidence: "exact", evidenceHash: intent.evidence.evidenceHash, legalEntityKey: intent.scope.legalEntityKey, targetType: intent.targetType }] }).state).toBe("DUPLICATE_EXACT");
  });
  it("allows separate payment movements supported by the same invoice evidence", () => {
    const payment = prepareAlegraWriteIntent({ scope: intent.scope, evidence: intent.evidence, payload: { targetType: "outgoing_payment", sourceBillNativeId: "fixture-bill", paymentMovementRef: "fixture-first", paymentAccountNativeId: "fixture-bank", currency: "USD", total: "10.00" } });
    expect(evaluateAlegraDuplicatePreflight({ intent: payment, sourceStates: completeCoverage, candidates: [{ source: "receipt", sourceRef: "fixture:second", confidence: "exact", evidenceHash: payment.evidence.evidenceHash, legalEntityKey: payment.scope.legalEntityKey, targetType: payment.targetType, paymentMovementRef: "fixture-second" }] }).state).toBe("CLEAR");
  });
  it("blocks a reused payment movement while allowing a different partial payment reference", () => {
    const payment = prepareAlegraWriteIntent({ scope: intent.scope, evidence: intent.evidence, payload: { targetType: "outgoing_payment", sourceBillNativeId: "fixture-bill", paymentMovementRef: "fixture-movement", paymentAccountNativeId: "fixture-bank", currency: "USD", total: "10.00" } });
    const candidate = { source: "alegra" as const, sourceRef: "fixture-payment", confidence: "exact" as const, legalEntityKey: payment.scope.legalEntityKey, targetType: "outgoing_payment", paymentMovementRef: "fixture-movement", currency: "CRC", total: "999.00" };
    expect(evaluateAlegraDuplicatePreflight({ intent: payment, sourceStates: completeCoverage, candidates: [candidate] }).clear).toBe(false);
    expect(evaluateAlegraDuplicatePreflight({ intent: payment, sourceStates: completeCoverage, candidates: [{ ...candidate, paymentMovementRef: "fixture-partial-two" }] }).clear).toBe(true);
  });
  it("blocks a native document without a Writer key even when amount and currency differ", () => {
    const result = evaluateAlegraDuplicatePreflight({ intent, sourceStates: completeCoverage,
      candidates: [{ source: "alegra", sourceRef: "fixture-native", confidence: "exact", legalEntityKey: intent.scope.legalEntityKey,
        targetType: "purchase_bill", documentNumber: intent.payload.documentNumber, supplierNativeId: intent.payload.supplierNativeId, currency: "CRC", total: "999.00" }] });
    expect(result.clear).toBe(false);
    expect(result.state).toBe("DUPLICATE_EXACT");
  });
  it("blocks an exact prior idempotency receipt", () => {
    const result = evaluateAlegraDuplicatePreflight({
      intent,
      sourceStates: completeCoverage,
      candidates: [
        {
          source: "receipt",
          sourceRef: "receipt-1",
          confidence: "exact",
          idempotencyKey: intent.idempotencyKey,
        },
      ],
    });

    expect(result.clear).toBe(false);
    expect(result.state).toBe("DUPLICATE_EXACT");
  });
  it("still finds a prior v3 receipt for the same business identity after key normalization is versioned", () => {
    expect(evaluateAlegraDuplicatePreflight({ intent, sourceStates: completeCoverage, candidates: [{ source: "receipt", sourceRef: "fixture:historic-v3", confidence: "exact", idempotencyKey: "alegra:v3:ce63845373391d634d082629067450e50b9a550f36791357fc6197a658498910" }] }).state).toBe("DUPLICATE_EXACT");
  });
  it("keeps a matching scoped business key blocked when candidate metadata contradicts it", () => {
    expect(evaluateAlegraDuplicatePreflight({ intent, sourceStates: completeCoverage, candidates: [{ source: "receipt", sourceRef: "fixture:conflicting-metadata", confidence: "exact", idempotencyKey: intent.idempotencyKey, legalEntityKey: "another-entity", targetType: "outgoing_payment" }] }).clear).toBe(false);
  });

  it("blocks exact document identity across Alegra", () => {
    const result = evaluateAlegraDuplicatePreflight({
      intent,
      sourceStates: completeCoverage,
      candidates: [
        {
          source: "alegra",
          sourceRef: "bill-1",
          confidence: "exact",
          legalEntityKey: "atrapa-suenos-santa-teresa-sa",
          targetType: "purchase_bill",
          documentNumber: "INV-100",
          supplierNativeId: "supplier-42",
          currency: "USD",
          total: "113.00",
        },
      ],
    });

    expect(result.state).toBe("DUPLICATE_EXACT");
  });

  it("holds probable same supplier/amount/document for human review", () => {
    const result = evaluateAlegraDuplicatePreflight({
      intent,
      sourceStates: completeCoverage,
      candidates: [
        {
          source: "toro",
          sourceRef: "invoice-candidate",
          confidence: "probable",
          legalEntityKey: "atrapa-suenos-santa-teresa-sa",
          targetType: "purchase_bill",
          documentNumber: "INV-100-REISSUED",
          issuerTaxId: "3-101-000000",
          currency: "USD",
          total: "113.00",
        },
      ],
    });

    expect(result.state).toBe("DUPLICATE_CANDIDATE");
    expect(result.clear).toBe(false);
    expect(result.probableMatches).toHaveLength(1);
  });

  it("does not call the write clear when Alegra coverage is stale", () => {
    const result = evaluateAlegraDuplicatePreflight({
      intent,
      candidates: [],
      sourceStates: [
        { source: "toro", coverage: "complete" },
        { source: "alegra", coverage: "stale" },
        { source: "receipt", coverage: "complete" },
      ],
    });

    expect(result.clear).toBe(false);
    expect(result.state).toBe("COVERAGE_INSUFFICIENT");
  });

  it("is clear only when all three duplicate sources were checked completely", () => {
    const result = evaluateAlegraDuplicatePreflight({
      intent,
      candidates: [],
      sourceStates: completeCoverage,
    });

    expect(result.clear).toBe(true);
    expect(result.state).toBe("CLEAR");
  });
});
