import { describe, expect, it } from "vitest";

import {
  prepareAlegraWriteIntent,
  validateAlegraWriteApproval,
  verifyAlegraReadback,
} from "./alegra-writer-contract";

const baseInput = {
  scope: {
    tenantId: "tenant-dreamcatcher",
    orgId: "595801ce-2895-4d91-81ae-e8d1d5cc8593",
    legalEntityKey: "atrapa-suenos-santa-teresa-sa",
    propertyId: "7ac9e46e-3b56-44d6-96f9-9d0b63bc943b",
  },
  evidence: {
    sourceRefs: ["gmail:msg-1", "dropbox:file-1"],
    evidenceHash: "sha256:invoice-abc",
    dropboxRef: "/Dreamcatcher Hotel/Administracion/Contabilidad/2026/Alegra/invoice.pdf",
  },
  payload: {
    targetType: "purchase_bill" as const,
    documentNumber: "INV-100",
    supplierNativeId: "supplier-42",
    issuerTaxId: "3-101-000000",
    receiverTaxId: "3-101-999999",
    issueDate: "2026-10-09",
    dueDate: "2026-10-19",
    currency: "usd",
    subtotal: "100.00",
    tax: "13.00",
    total: "113.00",
    accountNativeId: "expense-software",
    costCenterNativeId: "dreamcatcher",
    businessPurpose: "hotel software",
  },
};

describe("TORO Alegra Writer v3 contract", () => {
  it("compares monetary value independently of native decimal display formatting", () => {
    const prepared = prepareAlegraWriteIntent({ ...baseInput, payload: { ...baseInput.payload, issueDate: undefined, dueDate: undefined } });
    expect(verifyAlegraReadback(prepared, { nativeId: "fixture-bill", targetType: "purchase_bill", documentNumber: "INV-100", supplierNativeId: "supplier-42", currency: "USD", total: "113", accountNativeId: "expense-software", costCenterNativeId: "dreamcatcher" }).ok).toBe(true);
  });
  it("verifies the exact source bill and stable movement reference for an outgoing payment", () => {
    const payment = prepareAlegraWriteIntent({ ...baseInput, payload: { targetType: "outgoing_payment", sourceBillNativeId: "fixture-bill", paymentMovementRef: "fixture-movement", paymentAccountNativeId: "fixture-bank", currency: "USD", total: "10.00" } });
    const readback = { nativeId: "fixture-payment", targetType: "outgoing_payment" as const, sourceBillNativeId: "fixture-bill", paymentMovementRef: "fixture-movement", paymentAccountNativeId: "fixture-bank", currency: "USD", total: "10.00" };
    expect(verifyAlegraReadback(payment, readback).ok).toBe(true);
    expect(verifyAlegraReadback(payment, { ...readback, sourceBillNativeId: "other-bill" }).state).toBe("READBACK_MISMATCH");
    expect(verifyAlegraReadback(payment, { ...readback, paymentMovementRef: "other-movement" }).state).toBe("READBACK_MISMATCH");
    expect(verifyAlegraReadback(payment, { ...readback, sourceBillNativeId: undefined, paymentMovementRef: undefined }).ok).toBe(false);
  });
  it("rejects monetary exponent notation and inconsistent decimal totals", () => {
    expect(prepareAlegraWriteIntent({ ...baseInput, payload: { ...baseInput.payload, total: "1e2" } }).validation.ready).toBe(false);
    expect(prepareAlegraWriteIntent({ ...baseInput, payload: { ...baseInput.payload, total: "114.00" } }).validation.errors).toContain("AMOUNT_COMPONENTS_MISMATCH");
  });
  it("keeps the business key when a corrected amount or another source file arrives", () => {
    const original = prepareAlegraWriteIntent(baseInput);
    const corrected = prepareAlegraWriteIntent({
      ...baseInput,
      evidence: { ...baseInput.evidence, evidenceHash: "sha256:other-file", sourceRefs: ["whatsapp:fixture"] },
      payload: { ...baseInput.payload, total: "114.00" },
    });
    expect(corrected.idempotencyKey).toBe(original.idempotencyKey);
    expect(corrected.payloadHash).not.toBe(original.payloadHash);
  });

  it("requires a stable payment movement reference to distinguish partial payments", () => {
    const payment = prepareAlegraWriteIntent({ ...baseInput, payload: {
      targetType: "outgoing_payment", sourceBillNativeId: "fixture-bill", paymentAccountNativeId: "fixture-bank",
      currency: "USD", total: "10.00",
    } });
    expect(payment.validation.errors).toContain("PAYMENT_MOVEMENT_REFERENCE_REQUIRED");
  });

  it("rejects mutation of the intent after its approval hash was calculated", () => {
    const prepared = prepareAlegraWriteIntent(baseInput);
    const granted = { approvalId: "fixture-approval", approvalReceiptId: "fixture-receipt", actorId: "fixture-owner", approvedAt: "2026-10-11T00:00:00Z", expiresAt: "2026-10-11T00:15:00Z", decisionId: "fixture-decision", decisionRevision: "2026-10-11T00:00:00Z", state: "approved" as const, payloadHash: prepared.payloadHash };
    prepared.payload.total = "999.00";
    expect(validateAlegraWriteApproval(prepared, granted, "2026-10-11T00:05:00Z").ok).toBe(false);
  });

  it("creates deterministic payload, duplicate and idempotency hashes", () => {
    const first = prepareAlegraWriteIntent(baseInput);
    const second = prepareAlegraWriteIntent({
      ...baseInput,
      evidence: {
        ...baseInput.evidence,
        sourceRefs: [...baseInput.evidence.sourceRefs].reverse(),
      },
    });

    expect(first.status).toBe("ready_for_approval");
    expect(first.payload.currency).toBe("USD");
    expect(first.payloadHash).toBe(second.payloadHash);
    expect(first.duplicateKey).toBe(second.duplicateKey);
    expect(first.idempotencyKey).toBe(second.idempotencyKey);
    expect(first.execution.allowedWithoutApproval).toBe(false);
  });

  it("blocks unresolved entity scope before approval", () => {
    const intent = prepareAlegraWriteIntent({
      ...baseInput,
      scope: {
        ...baseInput.scope,
        scopeConflict: true,
      },
    });

    expect(intent.status).toBe("blocked");
    expect(intent.validation.errors).toContain("SCOPE_CONFLICT");
  });

  it("binds approval to the exact normalized payload hash", () => {
    const intent = prepareAlegraWriteIntent(baseInput);
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

    expect(validateAlegraWriteApproval(intent, approval, "2026-10-09T08:05:00Z")).toEqual({
      ok: true,
      reason: "APPROVAL_ENVELOPE_VALID_PENDING_CANONICAL_ADMISSION",
    });

    const changed = prepareAlegraWriteIntent({
      ...baseInput,
      payload: {
        ...baseInput.payload,
        total: "114.00",
        tax: "14.00",
      },
    });

    expect(validateAlegraWriteApproval(changed, approval, "2026-10-09T08:05:00Z")).toEqual({
      ok: false,
      reason: "APPROVAL_PAYLOAD_MISMATCH",
    });
  });

  it("requires explicit approval even when validation passes", () => {
    const intent = prepareAlegraWriteIntent(baseInput);
    expect(validateAlegraWriteApproval(intent, null, "2026-10-09T08:05:00Z")).toEqual({
      ok: false,
      reason: "APPROVAL_REQUIRED",
    });
  });

  it.each([
    ["2026-10-09T08:10:00Z", "2026-10-09T08:25:00Z", "2026-10-09T08:05:00Z", "APPROVAL_FROM_FUTURE"],
    ["2026-10-09T08:00:00Z", "2026-10-09T08:15:00Z", "2026-10-09T08:15:00Z", "APPROVAL_EXPIRED"],
    ["2026-10-09T08:00:00Z", "2026-10-09T08:16:00Z", "2026-10-09T08:05:00Z", "APPROVAL_TTL_INVALID"],
  ])("rejects invalid L3 approval time window %#", (approvedAt, expiresAt, checkedAt, reason) => {
    const intent = prepareAlegraWriteIntent(baseInput);
    expect(validateAlegraWriteApproval(intent, {
      approvalId: "approval-time-window",
      approvalReceiptId: "receipt-time-window",
      actorId: "owner-time-window",
      approvedAt,
      expiresAt,
      decisionId: "decision-time-window",
      decisionRevision: approvedAt,
      payloadHash: intent.payloadHash,
      state: "approved",
    }, checkedAt)).toEqual({ ok: false, reason });
  });

  it("detects material readback mismatch instead of claiming success", () => {
    const intent = prepareAlegraWriteIntent(baseInput);
    const result = verifyAlegraReadback(intent, {
      nativeId: "alegra-bill-1",
      targetType: "purchase_bill",
      documentNumber: "INV-100",
      supplierNativeId: "supplier-42",
      currency: "USD",
      total: "114.00",
      accountNativeId: "expense-software",
      costCenterNativeId: "dreamcatcher",
    });

    expect(result.ok).toBe(false);
    expect(result.state).toBe("READBACK_MISMATCH");
    expect(result.mismatches).toContain("TOTAL");
  });

  it("keeps journals blocked until their dedicated balanced-line phase exists", () => {
    const intent = prepareAlegraWriteIntent({
      ...baseInput,
      payload: {
        targetType: "journal",
        currency: "CRC",
        total: "1000",
      },
    });

    expect(intent.status).toBe("blocked");
    expect(intent.validation.errors).toContain("JOURNAL_PHASE_NOT_ENABLED");
  });
});
