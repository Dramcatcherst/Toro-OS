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
  paymentMovementRef?: string | null;
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
  purchaseTax?: { nativeId: string; percentage: string } | null;
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
  /**
   * Untrusted transport envelope. This object never proves owner authority by
   * itself; only the atomic database admission may resolve it against the
   * canonical signer decision produced through the pinned owner-authority RPC.
   */
  approvalId: string;
  approvalReceiptId: string;
  actorId: string;
  approvedAt: string;
  expiresAt: string;
  decisionId: string;
  decisionRevision: string;
  payloadHash: string;
  state: "approved" | "rejected" | "expired";
};

export const ALEGRA_L3_APPROVAL_TTL_MS = 15 * 60 * 1000;

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
  sourceBillNativeId?: string | null;
  paymentMovementRef?: string | null;
};

// Capture authority before any asynchronous boundary; callbacks cannot replace the
// approved actor, payload, or evidence while the canonical run is being admitted.
export function captureAlegraWriteAuthorization(intent: AlegraWriteIntent, approval: AlegraWriteApproval | null | undefined) {
  const captured = structuredClone({ intent, approval });
  function freeze(value: object) {
    for (const child of Object.values(value)) if (child && typeof child === "object") freeze(child);
    Object.freeze(value);
  }
  freeze(captured);
  return captured;
}

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
  return value.length <= 128 && /^\d+(?:\.\d+)?$/.test(value) && /[1-9]/.test(value);
}

function isCalendarDate(value?: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function sumMatches(subtotal: string, tax: string, total: string) {
  const values = [subtotal, tax, total];
  if (values.some(v => v.length > 128 || !/^\d+(?:\.\d+)?$/.test(v))) return false;
  const scale = Math.max(...values.map(v => v.split(".")[1]?.length ?? 0));
  const units = (v: string) => { const [whole, fraction = ""] = v.split("."); return BigInt(whole + fraction.padEnd(scale, "0")); };
  return units(subtotal) + units(tax) === units(total);
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

  if (!(ALEGRA_WRITE_TYPES as readonly unknown[]).includes(payload.targetType)) errors.push("TARGET_TYPE_UNSUPPORTED");

  if (!normalizeText(scope.tenantId)) errors.push("TENANT_REQUIRED");
  if (!normalizeText(scope.orgId)) errors.push("ORG_REQUIRED");
  if (!normalizeText(scope.legalEntityKey)) errors.push("LEGAL_ENTITY_REQUIRED");
  if (scope.scopeConflict) errors.push("SCOPE_CONFLICT");

  if (!normalizeText(evidence.evidenceHash)) errors.push("EVIDENCE_HASH_REQUIRED");
  if (evidence.sourceRefs.length === 0) errors.push("SOURCE_EVIDENCE_REQUIRED");

  if (!normalizeCurrency(payload.currency)) errors.push("CURRENCY_REQUIRED");
  if (!isPositiveAmount(payload.total)) errors.push("POSITIVE_TOTAL_REQUIRED");
  if (payload.subtotal || payload.tax) {
    if (!payload.subtotal || !payload.tax) errors.push("AMOUNT_COMPONENTS_INCOMPLETE");
    else if (!sumMatches(payload.subtotal, payload.tax, payload.total)) errors.push("AMOUNT_COMPONENTS_MISMATCH");
  }

  if (payload.targetType === "purchase_bill") {
    if (!normalizeText(payload.documentNumber)) errors.push("DOCUMENT_NUMBER_REQUIRED");
    if (!normalizeText(payload.supplierNativeId) && !normalizeText(payload.issuerTaxId)) {
      errors.push("SUPPLIER_IDENTITY_REQUIRED");
    }
    if (!normalizeText(payload.receiverTaxId)) errors.push("RECEIVER_TAX_ID_REQUIRED");
    if (!normalizeText(payload.accountNativeId)) errors.push("ACCOUNT_MAPPING_REQUIRED");
    if (!normalizeText(payload.costCenterNativeId)) errors.push("COST_CENTER_MAPPING_REQUIRED");
    const validIssueDate = isCalendarDate(payload.issueDate);
    const validDueDate = isCalendarDate(payload.dueDate);
    if (!validIssueDate) errors.push("ISSUE_DATE_INVALID");
    if (!validDueDate) errors.push("DUE_DATE_INVALID");
    if (validIssueDate && validDueDate && payload.dueDate! < payload.issueDate!) errors.push("DUE_DATE_BEFORE_ISSUE");
    // A matching period is still subject to the independent open-period
    // authorization in the native server host; syntax never proves it is open.
    if (payload.period !== undefined && payload.period !== null &&
        (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(payload.period) || !validIssueDate || payload.period !== payload.issueDate!.slice(0, 7))) errors.push("PERIOD_ISSUE_DATE_MISMATCH");
  }

  if (payload.targetType === "outgoing_payment") {
    if (!normalizeText(payload.sourceBillNativeId)) errors.push("SOURCE_BILL_REQUIRED");
    if (!normalizeText(payload.paymentMovementRef)) errors.push("PAYMENT_MOVEMENT_REFERENCE_REQUIRED");
    if (!normalizeText(payload.paymentAccountNativeId)) errors.push("PAYMENT_ACCOUNT_REQUIRED");
  }

  if (payload.targetType === "journal") {
    errors.push("JOURNAL_PHASE_NOT_ENABLED");
  }

  return errors;
}

function duplicateIdentity(input: AlegraWriteIntentInput, legacy = false): Record<string, unknown> {
  const { scope, payload } = input;

  return {
    tenantId: normalizeText(scope.tenantId),
    orgId: normalizeText(scope.orgId),
    legalEntityKey: normalizeText(scope.legalEntityKey),
    targetType: payload.targetType,
    businessReference: payload.targetType === "outgoing_payment"
      ? normalizeText(payload.paymentMovementRef)
      : legacy ? normalizeText(payload.documentNumber) : normalizeText(payload.documentNumber).toLowerCase(),
    issuer: payload.targetType === "purchase_bill"
      ? (legacy ? normalizeText(payload.issuerTaxId) : normalizeText(payload.issuerTaxId).replace(/[\s-]/g, "").toLowerCase()) || normalizeText(payload.supplierNativeId)
      : null,
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
      paymentMovementRef: normalizeText(input.payload.paymentMovementRef) || null,
      supplierNativeId: normalizeText(input.payload.supplierNativeId) || null,
      issuerTaxId: normalizeText(input.payload.issuerTaxId) || null,
      receiverTaxId: normalizeText(input.payload.receiverTaxId) || null,
      ...(input.payload.issueDate !== undefined ? { issueDate: normalizeText(input.payload.issueDate) || null } : {}),
      ...(input.payload.dueDate !== undefined ? { dueDate: normalizeText(input.payload.dueDate) || null } : {}),
      ...(input.payload.period !== undefined && input.payload.period !== null ? { period: normalizeText(input.payload.period) } : {}),
      currency: normalizeCurrency(input.payload.currency),
      subtotal: normalizeText(input.payload.subtotal) || null,
      tax: normalizeText(input.payload.tax) || null,
      total: normalizeText(input.payload.total),
      accountNativeId: normalizeText(input.payload.accountNativeId) || null,
      costCenterNativeId: normalizeText(input.payload.costCenterNativeId) || null,
      paymentAccountNativeId: normalizeText(input.payload.paymentAccountNativeId) || null,
      businessPurpose: normalizeText(input.payload.businessPurpose) || null,
      ...(input.payload.purchaseTax !== undefined ? { purchaseTax: input.payload.purchaseTax ? {
        nativeId: normalizeText(input.payload.purchaseTax.nativeId), percentage: normalizeText(input.payload.purchaseTax.percentage),
      } : null } : {}),
    },
  };

  const errors = validateInput(normalized);
  const payloadHash = sha256(normalized);
  const duplicateKey = sha256(duplicateIdentity(normalized));
  // v4 changes business-identity normalization only. The exact payload hash
  // remains independent, and existing v3 intents/receipts are never rewritten.
  const idempotencyKey = `alegra:v4:${duplicateKey}`;

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

export function matchesAlegraWriteIntentIdentity(intent: AlegraWriteIntent, current: AlegraWriteIntent): boolean {
  if (intent.duplicateKey === current.duplicateKey && intent.idempotencyKey === current.idempotencyKey) return true;
  // Validate an existing historic intent with its original identity semantics.
  // New preparation always emits v4; callers must search/reconcile prior v3
  // receipts and provider markers rather than assigning a new key to old work.
  const legacyKey = sha256(duplicateIdentity({ scope: current.scope, evidence: current.evidence, payload: current.payload }, true));
  return intent.duplicateKey === legacyKey && intent.idempotencyKey === `alegra:v3:${legacyKey}`;
}

export function isAlegraWriteBusinessKey(intent: AlegraWriteIntent, candidateKey: string): boolean {
  // A key version change must not hide historic receipts from duplicate search.
  // Legacy-only receipts with another raw spelling need source reconciliation;
  // this recognizes the exact available v3 identity without rewriting it.
  return candidateKey === `alegra:v4:${sha256(duplicateIdentity(intent))}` ||
    candidateKey === `alegra:v3:${sha256(duplicateIdentity(intent, true))}`;
}

export function parseAlegraTimestamp(value: unknown): number {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value) || !isCalendarDate(value.slice(0, 10))) return Number.NaN;
  return Date.parse(value);
}

export function validateAlegraWriteApproval(
  intent: AlegraWriteIntent,
  approval: AlegraWriteApproval | null | undefined,
  now: string,
): { ok: boolean; reason: string } {
  const current = prepareAlegraWriteIntent({ scope: intent.scope, evidence: intent.evidence, payload: intent.payload });
  if (current.payloadHash !== intent.payloadHash || !matchesAlegraWriteIntentIdentity(intent, current)) {
    return { ok: false, reason: "INTENT_CHANGED_AFTER_PREPARATION" };
  }
  if (!intent.validation.ready || !current.validation.ready) {
    return { ok: false, reason: "INTENT_NOT_READY" };
  }

  if (!approval) {
    return { ok: false, reason: "APPROVAL_REQUIRED" };
  }

  if (approval.state !== "approved") {
    return { ok: false, reason: "APPROVAL_NOT_ACTIVE" };
  }

  const checkedAt = parseAlegraTimestamp(now);
  const approvedAt = parseAlegraTimestamp(approval.approvedAt);
  const expiresAt = parseAlegraTimestamp(approval.expiresAt);
  const decisionRevision = parseAlegraTimestamp(approval.decisionRevision);

  if (
    !approval.approvalId.trim() ||
    !approval.approvalReceiptId.trim() ||
    !approval.actorId.trim() ||
    !approval.decisionId.trim() ||
    !approval.decisionRevision.trim() ||
    !Number.isFinite(checkedAt) ||
    !Number.isFinite(approvedAt) ||
    !Number.isFinite(expiresAt) ||
    !Number.isFinite(decisionRevision) ||
    expiresAt <= approvedAt ||
    decisionRevision !== approvedAt
  ) {
    return { ok: false, reason: "APPROVAL_BINDING_INVALID" };
  }

  if (approvedAt > checkedAt) {
    return { ok: false, reason: "APPROVAL_FROM_FUTURE" };
  }

  if (expiresAt <= checkedAt) {
    return { ok: false, reason: "APPROVAL_EXPIRED" };
  }

  if (expiresAt - approvedAt !== ALEGRA_L3_APPROVAL_TTL_MS) {
    return { ok: false, reason: "APPROVAL_TTL_INVALID" };
  }

  if (approval.payloadHash !== intent.payloadHash) {
    return { ok: false, reason: "APPROVAL_PAYLOAD_MISMATCH" };
  }

  return {
    ok: true,
    reason: "APPROVAL_ENVELOPE_VALID_PENDING_CANONICAL_ADMISSION",
  };
}

export function verifyAlegraReadback(
  intent: AlegraWriteIntent,
  readback: AlegraReadback,
): AlegraReadbackVerification {
  const mismatches: string[] = [];

  if (readback.targetType !== intent.targetType) mismatches.push("TARGET_TYPE");
  if (normalizeCurrency(readback.currency) !== normalizeCurrency(intent.payload.currency)) mismatches.push("CURRENCY");
  if (!sumMatches(normalizeText(readback.total), "0", normalizeText(intent.payload.total))) mismatches.push("TOTAL");

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
    if (normalizeText(readback.sourceBillNativeId) !== normalizeText(intent.payload.sourceBillNativeId)) {
      mismatches.push("SOURCE_BILL");
    }
    if (normalizeText(readback.paymentMovementRef) !== normalizeText(intent.payload.paymentMovementRef)) {
      mismatches.push("PAYMENT_MOVEMENT_REFERENCE");
    }
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
