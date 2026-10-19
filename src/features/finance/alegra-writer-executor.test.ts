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
  approvalReceiptId: "approval-receipt-1",
  actorId: "owner-1",
  approvedAt: "2026-10-09T08:00:00Z",
  expiresAt: "2026-10-09T08:15:00Z",
  decisionId: "decision-1",
  decisionRevision: "2026-10-09T08:00:00Z",
  payloadHash: intent.payloadHash,
  state: "approved" as const,
};
const validNow = "2026-10-09T08:05:00Z";

const clearDuplicates = evaluateAlegraDuplicatePreflight({
  intent,
  candidates: [],
  sourceStates: [
    { source: "toro", coverage: "complete" },
    { source: "alegra", coverage: "complete" },
    { source: "receipt", coverage: "complete" },
  ],
});

const gate = {
  beforeDispatch: async () => true,
  renewLease: async () => true,
  persistReceipt: async () => "fixture-durable-receipt",
};

function executeCandidate(input: Parameters<typeof executeApprovedAlegraIntent>[0]) {
  return executeApprovedAlegraIntent({ ...input, writerEnabled: true, gate });
}

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
  it("does not replay an in-memory verification without a durable receipt ID", async () => {
    const result = await executeCandidate({ intent, approval, duplicateDecision: clearDuplicates,
      transport: { create: vi.fn(), findByIdempotencyKey: vi.fn(), readback: vi.fn() },
      priorReceipt: { version: "TORO-ALEGRA-WRITER-RECEIPT-v1", idempotencyKey: intent.idempotencyKey, payloadHash: intent.payloadHash,
        approvalId: approval.approvalId, actorId: approval.actorId, nativeId: "bill-1", executionState: "provider_created",
        verificationState: "VERIFIED", verified: true, reasons: [], createdAt: "2026-10-11T00:00:00Z" }, now: validNow });
    expect(result.ok).toBe(false);
    expect(result.receipt.reasons).toContain("PRIOR_RECEIPT_NOT_DURABLE");
  });

  it("executes only the frozen approval and content captured before admission", async () => {
    const changed = structuredClone(intent);
    const changedApproval = { ...approval };
    const result = await executeApprovedAlegraIntent({ intent: changed, approval: changedApproval, duplicateDecision: clearDuplicates,
      transport: { create: async ({ intent: captured }) => { expect(captured.payload.total).toBe("113.00"); return { state: "created", nativeId: "bill-1" }; }, findByIdempotencyKey: vi.fn(), readback: async () => verifiedReadback() }, writerEnabled: true,
      gate: { ...gate, beforeDispatch: async (captured) => { expect(Object.isFrozen(captured.approval)).toBe(true); changed.payload.total = "999.00"; changedApproval.actorId = "other-actor"; changedApproval.approvalId = "other-approval"; return true; } }, now: validNow });
    expect(result.ok).toBe(true);
    expect(result.receipt.actorId).toBe(approval.actorId);
    expect(result.receipt.approvalId).toBe(approval.approvalId);
  });
  it("requires durable admission before dispatch", async () => {
    const result = await executeApprovedAlegraIntent({ intent, approval, duplicateDecision: clearDuplicates,
      transport: { create: vi.fn(), findByIdempotencyKey: vi.fn(), readback: vi.fn() },
      writerEnabled: true, gate: { ...gate, beforeDispatch: async () => false }, now: validNow });
    expect(result.executedProviderMutation).toBe(false);
    expect(result.receipt.reasons).toContain("EXECUTION_GATE_NOT_ACQUIRED");
  });

  it("preserves the provider effect when readback is unavailable", async () => {
    const result = await executeCandidate({ intent, approval, duplicateDecision: clearDuplicates,
      transport: {
        create: async () => ({ state: "created", nativeId: "bill-1" }),
        findByIdempotencyKey: vi.fn(),
        readback: async () => { throw new Error("fixture readback unavailable"); },
      },
      now: validNow });
    expect(result.ok).toBe(false);
    expect(result.executedProviderMutation).toBe(true);
    expect(result.receipt).toMatchObject({
      nativeId: "bill-1",
      executionState: "provider_created",
      verificationState: "PROVIDER_STATE_UNKNOWN",
      reasons: ["READBACK_UNAVAILABLE"],
      durableReceiptId: "fixture-durable-receipt",
    });
  });

  it("never reports success when saving the provider receipt fails", async () => {
    const result = await executeApprovedAlegraIntent({ intent, approval, duplicateDecision: clearDuplicates,
      transport: { create: async () => ({ state: "created", nativeId: "bill-1" }), findByIdempotencyKey: async () => ({ state: "not_found" }), readback: async () => verifiedReadback() },
      writerEnabled: true, gate: { ...gate, persistReceipt: async () => { throw new Error("fixture store failure"); } }, now: validNow });
    expect(result.ok).toBe(false);
    expect(result.receipt.verificationState).toBe("PROVIDER_STATE_UNKNOWN");
    expect(result.receipt.nativeId).toBe("bill-1");
  });

  it("reconciles a thrown create timeout without a blind second create", async () => {
    const result = await executeCandidate({ intent, approval, duplicateDecision: clearDuplicates,
      transport: { create: async () => { throw new Error("fixture timeout"); }, findByIdempotencyKey: async () => ({ state: "found", nativeId: "bill-1" }), readback: async () => verifiedReadback() }, now: validNow });
    expect(result.ok).toBe(true);
    expect(result.receipt.executionState).toBe("provider_ambiguous_recovered");
  });

  it("is disabled unless the existing worker explicitly supplies its execution gate", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn<AlegraWriteTransport["create"]>(async () => ({ state: "created", nativeId: "bill-1" })),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(),
      readback: vi.fn(async () => verifiedReadback()),
    };
    const result = await executeApprovedAlegraIntent({ intent, approval, duplicateDecision: clearDuplicates, transport, now: validNow });
    expect(result.ok).toBe(false);
    expect(result.receipt.reasons).toContain("WRITER_DISABLED");
    expect(result.executedProviderMutation).toBe(false);
  });

  it("blocks a prior uncertain receipt instead of posting again", async () => {
    const prior: AlegraWriterReceipt = {
      version: "TORO-ALEGRA-WRITER-RECEIPT-v1", idempotencyKey: intent.idempotencyKey,
      payloadHash: intent.payloadHash, approvalId: approval.approvalId, actorId: approval.actorId,
      nativeId: null, executionState: "blocked", verificationState: "PROVIDER_STATE_UNKNOWN",
      verified: false, reasons: ["TIMEOUT"], createdAt: "2026-10-09T08:30:00Z",
    };
    const transport: AlegraWriteTransport = { create: vi.fn(), findByIdempotencyKey: vi.fn(), readback: vi.fn() };
    const result = await executeCandidate({ intent, approval, duplicateDecision: clearDuplicates, transport, priorReceipt: prior, now: validNow });
    expect(result.executedProviderMutation).toBe(false);
    expect(result.receipt.reasons).toContain("PRIOR_EFFECT_REQUIRES_RECONCILIATION");
  });

  it("refuses a native readback belonging to a different created object", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn<AlegraWriteTransport["create"]>(async () => ({ state: "created", nativeId: "bill-1" })),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(),
      readback: vi.fn(async () => verifiedReadback("another-bill")),
    };
    const result = await executeCandidate({ intent, approval, duplicateDecision: clearDuplicates, transport, now: validNow });
    expect(result.receipt.verified).toBe(false);
  });

  it("executes only after approval and verifies readback", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn<AlegraWriteTransport["create"]>(async () => ({ state: "created", nativeId: "bill-1" })),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(async () => ({ state: "not_found" })),
      readback: vi.fn(async () => verifiedReadback()),
    };

    const result = await executeCandidate({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      now: validNow,
    });

    expect(result.ok).toBe(true);
    expect(result.receipt.verified).toBe(true);
    expect(result.receipt.nativeId).toBe("bill-1");
    expect(transport.create).toHaveBeenCalledTimes(1);
    expect(transport.readback).toHaveBeenCalledTimes(1);
  });

  it("does not call the provider when approval payload does not match", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn<AlegraWriteTransport["create"]>(),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(),
      readback: vi.fn(),
    };

    const result = await executeCandidate({
      intent,
      approval: { ...approval, payloadHash: "wrong" },
      duplicateDecision: clearDuplicates,
      transport,
      now: validNow,
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
      create: vi.fn<AlegraWriteTransport["create"]>(),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(),
      readback: vi.fn(),
    };

    const result = await executeCandidate({
      intent,
      approval,
      duplicateDecision: staleDuplicates,
      transport,
      now: validNow,
    });

    expect(result.ok).toBe(false);
    expect(result.receipt.reasons).toContain("DUPLICATE_PREFLIGHT_COVERAGE_INSUFFICIENT");
    expect(transport.create).not.toHaveBeenCalled();
  });

  it("recovers an ambiguous create by lookup instead of blind retry", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn<AlegraWriteTransport["create"]>(async () => ({ state: "ambiguous" })),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(async () => ({ state: "found", nativeId: "bill-ambiguous" })),
      readback: vi.fn(async () => verifiedReadback("bill-ambiguous")),
    };

    const result = await executeCandidate({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      now: validNow,
    });

    expect(result.ok).toBe(true);
    expect(result.receipt.executionState).toBe("provider_ambiguous_recovered");
    expect(transport.create).toHaveBeenCalledTimes(1);
    expect(transport.findByIdempotencyKey).toHaveBeenCalledTimes(1);
  });

  it("blocks ambiguous state when lookup cannot prove the created object", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn<AlegraWriteTransport["create"]>(async () => ({ state: "ambiguous" })),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(async () => ({ state: "not_found" })),
      readback: vi.fn(),
    };

    const result = await executeCandidate({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      now: validNow,
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
      durableReceiptId: "fixture-durable-receipt",
      executionState: "provider_created",
      verificationState: "VERIFIED",
      verified: true,
      reasons: [],
      createdAt: "2026-10-09T08:30:00Z",
    };
    const transport: AlegraWriteTransport = {
      create: vi.fn<AlegraWriteTransport["create"]>(),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(),
      readback: vi.fn(),
    };

    const result = await executeCandidate({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      priorReceipt: prior,
      now: validNow,
    });

    expect(result.ok).toBe(true);
    expect(result.executedProviderMutation).toBe(false);
    expect(result.receipt.executionState).toBe("replayed_verified");
    expect(transport.create).not.toHaveBeenCalled();
  });

  it("never marks a material readback mismatch as verified", async () => {
    const transport: AlegraWriteTransport = {
      create: vi.fn<AlegraWriteTransport["create"]>(async () => ({ state: "created", nativeId: "bill-1" })),
      findByIdempotencyKey: vi.fn<AlegraWriteTransport["findByIdempotencyKey"]>(),
      readback: vi.fn(async () => ({ ...verifiedReadback(), total: "114.00" })),
    };

    const result = await executeCandidate({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      transport,
      now: validNow,
    });

    expect(result.ok).toBe(false);
    expect(result.receipt.verified).toBe(false);
    expect(result.receipt.verificationState).toBe("READBACK_MISMATCH");
    expect(result.receipt.reasons).toContain("READBACK_TOTAL");
  });

  it("heartbeats the admitted lease before any native provider POST", async () => {
    const order: string[] = [];
    const result = await executeCandidate({ intent, approval, duplicateDecision: clearDuplicates,
      transport: {
        create: async () => { order.push("provider"); return { state: "created", nativeId: "bill-1" }; },
        findByIdempotencyKey: vi.fn(),
        readback: async () => verifiedReadback(),
      },
      gate: { ...gate, renewLease: async () => { order.push("heartbeat"); return true; } },
      now: validNow,
    });
    expect(result.ok).toBe(true);
    expect(order).toEqual(["heartbeat", "provider"]);
  });

  it.each(["denied", "throws"] as const)("denies provider create when heartbeat %s", async (failure) => {
    const create = vi.fn(async () => ({ state: "created" as const, nativeId: "bill-1" }));
    const result = await executeCandidate({ intent, approval, duplicateDecision: clearDuplicates,
      transport: { create, findByIdempotencyKey: vi.fn(), readback: vi.fn() },
      gate: { ...gate, renewLease: async () => {
        if (failure === "throws") throw new Error("synthetic rpc unavailable");
        return false;
      } },
      now: validNow,
    });
    expect(result.ok).toBe(false);
    expect(result.executedProviderMutation).toBe(false);
    expect(result.receipt.reasons).toContain("EXECUTION_LEASE_UNAVAILABLE");
    expect(result.receipt.durableReceiptId).toBe("fixture-durable-receipt");
    expect(create).not.toHaveBeenCalled();
  });

});
