import { describe, expect, it } from "vitest";

import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { evaluateAlegraDuplicatePreflight } from "./alegra-writer-dedupe";

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
    currency: "USD",
    total: "113.00",
    accountNativeId: "expense-software",
    costCenterNativeId: "dreamcatcher",
  },
});

const completeCoverage = [
  { source: "toro" as const, coverage: "complete" as const },
  { source: "alegra" as const, coverage: "complete" as const },
  { source: "receipt" as const, coverage: "complete" as const },
];

describe("Alegra writer duplicate preflight", () => {
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
