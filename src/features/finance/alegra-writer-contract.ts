import { createHash } from "node:crypto";

export const ALEGRA_WRITE_TYPES = [
  "purchase_bill",
  "outgoing_payment",
  "journal",
] as const;

export type AlegraWriteType = (typeof ALEGRA_WRITE_TYPES)[number];

export type AlegraWriteScope = {
  tenantId: string;
  orgId: string;
  legalEntityKey: string;
  propertyId?: string | null;
  projectId?: string | null;
  scopeConflict?: boolean;
};

export type AlegraWriteEvidence = {
  sourceRefs: string[];
  evidenceHash: string;
  dropboxRef?: string | null;
};

export type AlegraWritePayload = {
  targetType: AlegraWriteType;
  documentNumber?: string | null;
  sourceBillNativeId?: string | null;
  supplierNativeId?: string | null;
  issuerTaxId?: string | null;
  receiverTaxId?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  period?: string | null;
  currency: string;
  subtotal?: string | null;
  tax?: string | null;
  total: string;
  accountNativeId?: string | null;
  costCenterNativeId?: string | null;
  paymentAccountNativeId?: string | null;
  businessPurpose?: string | null;
};

export type AlegraWriteIntentInput = {
  scope: AlegraWriteScope;
  evidence: AlegraWriteEvidence;
  payload: AlegraWritePayload;
};

export type AlegraWriteIntent = {
  version: "TORO-ALEGRA-WRITER-v3";
  sourceSystem: "alegra";
  action: "alegra_create_purchase_bill" | "alegra_create_outgoing_payment" | "alegra_create_journal";
  targetType: AlegraWriteType;
  scope: AlegraWriteScope;
  evidence: AlegraWriteEvidence;
  payload: AlegraWritePayload;
  payloadHash: string;
  duplicateKey: string;
  idempotencyKey: string;
  validation: {
    ready: boolean;
    errors: string[];
  };
  approval: {
    required: "Owner approval";
    boundPayloadHash: string;
  };
  execution: {
    allowedWithoutApproval: false;
    providerMutationPrepared: false;
  };
  status: "ready_for_approval" | "blocked";
};

export type AlegraWriteApproval = {
  approvalId: string;
  actorId: string;
  approvedAt: string;
  payloadHash: string;
  state: "approved" | "rejected" | "expired";
};

export type AlegraReadback = {
  nativeId: string;
  targetType: AlegraWriteType;
  documentNumber?: string | null;
  supplierNativeId?: string | null;
  currency: string;
  total: string;
  accountNativeId?: string | null;
  costCenterNativeId?: string | null;
  paymentAccountNativeId?: string | null;
};

export type AlegraReadbackVerification = {
  ok: boolean;
  state: "VERIFIED" | "READBACK_MISMATCH";
  mismatches: string[];
  nativeId: string;
};

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  }

  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

function sha256(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function normalizeText(value?: string | null): string {
  return (value ?? "").trim();
}

function normalizeCurrency(value: string): string {
  return value.trim().toUpperCase();
}

function isPositiveAmount(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function actionFor(targetType: AlegraWriteType): AlegraWriteIntent["action"] {
  switch (targetType) {
    case "purchase_bill":
      return "alegra_create_purchase_bill";
    case "outgoing_payment":
      return "alegra_create_outgoing_payment";
    case "journal":
      return "alegra_create_journal";
  }
}

function validateInput(input: AlegraWriteIntentInput): string[] {
  const errors: string[] = [];
  const { scope, evidence, payload } = input;

  if (!normalizeText(scope.tenantId)) errors.push("TENANT_REQUIRED");
  if (!normalizeText(scope.orgId)) errors.push("ORG_REQUIRED");
  if (!normalizeText(scope.legalEntityKey)) errors.push("LEGAL_ENTITY_REQUIRED");
  if (scope.scopeConflict) errors.push("SCOPE_CONFLICT");

  if (!normalizeText(evidence.evidenceHash)) errors.push("EVIDENCE_HASH_REQUIRED");
  if (evidence.sourceRefs.length === 0) errors.push("SOURCE_EVIDENCE_REQUIRED");

  if (!normalizeCurrency(payload.currency)) errors.push("CURRENCY_REQUIRED");
  if (!isPositiveAmount(payload.total)) errors.push("POSITIVE_TOTAL_REQUIRED");

  if (payload.targetType === "purchase_bill") {
    if (!normalizeText(payload.documentNumber)) errors.push("DOCUMENT_NUMBER_REQUIRED");
    if (!normalizeText(payload.supplierNativeId) && !normalizeText(payload.issuerTaxId)) {
      errors.push("SUPPLIER_IDENTITY_REQUIRED");
    }
    if (!normalizeText(payload.receiverTaxId)) errors.push("RECEIVER_TAX_ID_REQUIRED");
    if (!normalizeText(payload.accountNativeId)) errors.push("ACCOUNT_MAPPING_REQUIRED");
    if (!normalizeText(payload.costCenterNativeId)) errors.push("COST_CENTER_MAPPING_REQUIRED");
  }

  if (payload.targetType === "outgoing_payment") {
    if (!normalizeText(payload.sourceBillNativeId)) errors.push("SOURCE_BILL_REQUIRED");
    if (!normalizeText(payload.paymentAccountNativeId)) errors.push("PAYMENT_ACCOUNT_REQUIRED");
  }

  if (payload.targetType === "journal") {
    errors.push("JOURNAL_PHASE_NOT_ENABLED");
  }

  return errors;
}

function duplicateIdentity(input: AlegraWriteIntentInput): Record<string, unknown> {
  const { scope, evidence, payload } = input;

  return {
    tenantId: normalizeText(scope.tenantId),
    orgId: normalizeText(scope.orgId),
    legalEntityKey: normalizeText(scope.legalEntityKey),
    targetType: payload.targetType,
    documentNumber: normalizeText(payload.documentNumber),
    sourceBillNativeId: normalizeText(payload.sourceBillNativeId),
    supplierNativeId: normalizeText(payload.supplierNativeId),
    issuerTaxId: normalizeText(payload.issuerTaxId),
    evidenceHash: normalizeText(evidence.evidenceHash),
    currency: normalizeCurrency(payload.currency),
    total: normalizeText(payload.total),
  };
}

export function prepareAlegraWriteIntent(input: AlegraWriteIntentInput): AlegraWriteIntent {
  const normalized: AlegraWriteIntentInput = {
    scope: {
      ...input.scope,
      tenantId: normalizeText(input.scope.tenantId),
      orgId: normalizeText(input.scope.orgId),
      legalEntityKey: normalizeText(input.scope.legalEntityKey),
      propertyId: normalizeText(input.scope.propertyId) || null,
      projectId: normalizeText(input.scope.projectId) || null,
    },
    evidence: {
      ...input.evidence,
      sourceRefs: [...input.evidence.sourceRefs].map(normalizeText).filter(Boolean).sort(),
      evidenceHash: normalizeText(input.evidence.evidenceHash),
      dropboxRef: normalizeText(input.evidence.dropboxRef) || null,
    },
    payload: {
      ...input.payload,
      documentNumber: normalizeText(input.payload.documentNumber) || null,
      sourceBillNativeId: normalizeText(input.payload.sourceBillNativeId) || null,
      supplierNativeId: normalizeText(input.payload.supplierNativeId) || null,
      issuerTaxId: normalizeText(input.payload.issuerTaxId) || null,
      receiverTaxId: normalizeText(input.payload.receiverTaxId) || null,
      currency: normalizeCurrency(input.payload.currency),
      subtotal: normalizeText(input.payload.subtotal) || null,
      tax: normalizeText(input.payload.tax) || null,
      total: normalizeText(input.payload.total),
      accountNativeId: normalizeText(input.payload.accountNativeId) || null,
      costCenterNativeId: normalizeText(input.payload.costCenterNativeId) || null,
      paymentAccountNativeId: normalizeText(input.payload.paymentAccountNativeId) || null,
      businessPurpose: normalizeText(input.payload.businessPurpose) || null,
    },
  };

  const errors = validateInput(normalized);
  const payloadHash = sha256(normalized);
  const duplicateKey = sha256(duplicateIdentity(normalized));
  const idempotencyKey = `alegra:v3:${duplicateKey}`;

  return {
    version: "TORO-ALEGRA-WRITER-v3",
    sourceSystem: "alegra",
    action: actionFor(normalized.payload.targetType),
    targetType: normalized.payload.targetType,
    scope: normalized.scope,
    evidence: normalized.evidence,
    payload: normalized.payload,
    payloadHash,
    duplicateKey,
    idempotencyKey,
    validation: {
      ready: errors.length === 0,
      errors,
    },
    approval: {
      required: "Owner approval",
      boundPayloadHash: payloadHash,
    },
    execution: {
      allowedWithoutApproval: false,
      providerMutationPrepared: false,
    },
    status: errors.length === 0 ? "ready_for_approval" : "blocked",
  };
}

export function validateAlegraWriteApproval(
  intent: AlegraWriteIntent,
  approval: AlegraWriteApproval | null | undefined,
): { ok: boolean; reason: string } {
  if (!intent.validation.ready) {
    return { ok: false, reason: "INTENT_NOT_READY" };
  }

  if (!approval) {
    return { ok: false, reason: "APPROVAL_REQUIRED" };
  }

  if (approval.state !== "approved") {
    return { ok: false, reason: "APPROVAL_NOT_ACTIVE" };
  }

  if (approval.payloadHash !== intent.payloadHash) {
    return { ok: false, reason: "APPROVAL_PAYLOAD_MISMATCH" };
  }

  return { ok: true, reason: "APPROVED_EXACT_PAYLOAD" };
}

export function verifyAlegraReadback(
  intent: AlegraWriteIntent,
  readback: AlegraReadback,
): AlegraReadbackVerification {
  const mismatches: string[] = [];

  if (readback.targetType !== intent.targetType) mismatches.push("TARGET_TYPE");
  if (normalizeCurrency(readback.currency) !== normalizeCurrency(intent.payload.currency)) mismatches.push("CURRENCY");
  if (normalizeText(readback.total) !== normalizeText(intent.payload.total)) mismatches.push("TOTAL");

  if (intent.targetType === "purchase_bill") {
    if (normalizeText(readback.documentNumber) !== normalizeText(intent.payload.documentNumber)) {
      mismatches.push("DOCUMENT_NUMBER");
    }
    if (
      normalizeText(readback.supplierNativeId) !== normalizeText(intent.payload.supplierNativeId) &&
      normalizeText(intent.payload.supplierNativeId)
    ) {
      mismatches.push("SUPPLIER");
    }
    if (normalizeText(readback.accountNativeId) !== normalizeText(intent.payload.accountNativeId)) {
      mismatches.push("ACCOUNT");
    }
    if (normalizeText(readback.costCenterNativeId) !== normalizeText(intent.payload.costCenterNativeId)) {
      mismatches.push("COST_CENTER");
    }
  }

  if (intent.targetType === "outgoing_payment") {
    if (
      normalizeText(readback.paymentAccountNativeId) !== normalizeText(intent.payload.paymentAccountNativeId)
    ) {
      mismatches.push("PAYMENT_ACCOUNT");
    }
  }

  return {
    ok: mismatches.length === 0,
    state: mismatches.length === 0 ? "VERIFIED" : "READBACK_MISMATCH",
    mismatches,
    nativeId: readback.nativeId,
  };
}
