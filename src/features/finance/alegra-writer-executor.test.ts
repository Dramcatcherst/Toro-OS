import { describe, expect, it, vi } from "vitest";

import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { evaluateAlegraDuplicatePreflight } from "./alegra-writer-dedupe";
import {
  executeApprovedAlegraIntent,
  type AlegraWriteTransport,
  type AlegraWriterReceipt,
} from "./alegra-writer-executor";

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

const approval = {
  approvalId: "approval-1",
  actorId: "owner-1",
  approvedAt: "2026-10-09T08:00:00Z",
  payloadHash: intent.payloadHash,
  state: "approved" as const,
};

const clearDuplicates = evaluateAlegraDuplicatePreflight({
  intent,
  candidates: [],
  sourceStates: [
    { source: "toro", coverage: "complete" },
    { source: "alegra", coverage: "complete" },
    { source: "receipt", coverage: "complete" },
  ],
});

function verifiedReadback(nativeId = "bill-1") {
  return {
    nativeId,
    targetType: "purchase_bill" as const,
    documentNumber: "INV-100",
    supplierNativeId: "supplier-42",
    currency: "USD",
    total: "113.00",
    accountNativeId: "expense-software",
    costCenterNativeId: "dreamcatcher",
  };
}

describe("Alegra Writer governed executor", () => {
  it("executes only after approval and verifies readback", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn(async () => ({ state: "created", nativeId: "bill-1" })),
      findByIdempotencyKey: vi.fn(async () => ({ state: "not_found" })),
      readback: vi.fn(async () => verifiedReadback()),
    };

    const result = await executeApprovedAlegraIntent({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      now: "2026-10-09T09:00:00Z",
    });

    expect(result.ok).toBe(true);
    expect(result.receipt.verified).toBe(true);
    expect(result.receipt.nativeId).toBe("bill-1");
    expect(transport.create).toHaveBeenCalledTimes(1);
    expect(transport.readback).toHaveBeenCalledTimes(1);
  });

  it("does not call the provider when approval payload does not match", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn(),
      findByIdempotencyKey: vi.fn(),
      readback: vi.fn(),
    };

    const result = await executeApprovedAlegraIntent({
      intent,
      approval: { ...approval, payloadHash: "wrong" },
      duplicateDecision: clearDuplicates,
      transport,
      now: "2026-10-09T09:00:00Z",
    });

    expect(result.ok).toBe(false);
    expect(result.receipt.reasons).toContain("APPROVAL_PAYLOAD_MISMATCH");
    expect(transport.create).not.toHaveBeenCalled();
  });

  it("does not call the provider if duplicate coverage is stale", async () => {
    const staleDuplicates = evaluateAlegraDuplicatePreflight({
      intent,
      candidates: [],
      sourceStates: [
        { source: "toro", coverage: "complete" },
        { source: "alegra", coverage: "stale" },
        { source: "receipt", coverage: "complete" },
      ],
    });
    const transport: AlegraWriteTransport = {
      create: vi.fn(),
      findByIdempotencyKey: vi.fn(),
      readback: vi.fn(),
    };

    const result = await executeApprovedAlegraIntent({
      intent,
      approval,
      duplicateDecision: staleDuplicates,
      transport,
      now: "2026-10-09T09:00:00Z",
    });

    expect(result.ok).toBe(false);
    expect(result.receipt.reasons).toContain("DUPLICATE_PREFLIGHT_COVERAGE_INSUFFICIENT");
    expect(transport.create).not.toHaveBeenCalled();
  });

  it("recovers an ambiguous create by lookup instead of blind retry", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn(async () => ({ state: "ambiguous" })),
      findByIdempotencyKey: vi.fn(async () => ({ state: "found", nativeId: "bill-ambiguous" })),
      readback: vi.fn(async () => verifiedReadback("bill-ambiguous")),
    };

    const result = await executeApprovedAlegraIntent({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      now: "2026-10-09T09:00:00Z",
    });

    expect(result.ok).toBe(true);
    expect(result.receipt.executionState).toBe("provider_ambiguous_recovered");
    expect(transport.create).toHaveBeenCalledTimes(1);
    expect(transport.findByIdempotencyKey).toHaveBeenCalledTimes(1);
  });

  it("blocks ambiguous state when lookup cannot prove the created object", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn(async () => ({ state: "ambiguous" })),
      findByIdempotencyKey: vi.fn(async () => ({ state: "not_found" })),
      readback: vi.fn(),
    };

    const result = await executeApprovedAlegraIntent({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      now: "2026-10-09T09:00:00Z",
    });

    expect(result.ok).toBe(false);
    expect(result.receipt.verificationState).toBe("PROVIDER_STATE_UNKNOWN");
    expect(result.receipt.reasons).toContain("PROVIDER_AMBIGUOUS_NOT_FOUND_NO_BLIND_RETRY");
    expect(transport.create).toHaveBeenCalledTimes(1);
    expect(transport.readback).not.toHaveBeenCalled();
  });

  it("replays a verified receipt without a second provider mutation", async () => {
    const prior: AlegraWriterReceipt = {
      version: "TORO-ALEGRA-WRITER-RECEIPT-v1",
      idempotencyKey: intent.idempotencyKey,
      payloadHash: intent.payloadHash,
      approvalId: approval.approvalId,
      actorId: approval.actorId,
      nativeId: "bill-1",
      executionState: "provider_created",
      verificationState: "VERIFIED",
      verified: true,
      reasons: [],
      createdAt: "2026-10-09T08:30:00Z",
    };
    const transport: AlegraWriteTransport = {
      create: vi.fn(),
      findByIdempotencyKey: vi.fn(),
      readback: vi.fn(),
    };

    const result = await executeApprovedAlegraIntent({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      priorVerifiedReceipt: prior,
      now: "2026-10-09T09:00:00Z",
    });

    expect(result.ok).toBe(true);
    expect(result.executedProviderMutation).toBe(false);
    expect(result.receipt.executionState).toBe("replayed_verified");
    expect(transport.create).not.toHaveBeenCalled();
  });

  it("never marks a material readback mismatch as verified", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn(async () => ({ state: "created", nativeId: "bill-1" })),
      findByIdempotencyKey: vi.fn(),
      readback: vi.fn(async () => ({ ...verifiedReadback(), total: "114.00" })),
    };

    const result = await executeApprovedAlegraIntent({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      now: "2026-10-09T09:00:00Z",
    });

    expect(result.ok).toBe(false);
    expect(result.receipt.verified).toBe(false);
    expect(result.receipt.verificationState).toBe("READBACK_MISMATCH");
    expect(result.receipt.reasons).toContain("READBACK_TOTAL");
  });
});
