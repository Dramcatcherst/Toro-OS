import {
  captureAlegraWriteAuthorization,
  validateAlegraWriteApproval,
  verifyAlegraReadback,
  type AlegraReadback,
  type AlegraWriteApproval,
  type AlegraWriteIntent,
} from "./alegra-writer-contract";
import type { AlegraDuplicateDecision } from "./alegra-writer-dedupe";

export type AlegraProviderCreateResult =
  | { state: "created"; nativeId: string }
  | { state: "ambiguous"; nativeId?: string | null; detail?: string | null }
  | { state: "failed"; code: string; retryable: boolean; detail?: string | null };

export type AlegraProviderLookupResult =
  | { state: "found"; nativeId: string }
  | { state: "not_found" }
  | { state: "unavailable"; detail?: string | null };

export type AlegraWriteTransport = {
  create(input: {
    intent: AlegraWriteIntent;
    idempotencyKey: string;
  }): Promise<AlegraProviderCreateResult>;
  findByIdempotencyKey(input: {
    intent: AlegraWriteIntent;
    idempotencyKey: string;
  }): Promise<AlegraProviderLookupResult>;
  readback(input: {
    intent: AlegraWriteIntent;
    nativeId: string;
  }): Promise<AlegraReadback>;
};

export type AlegraWriterReceipt = {
  version: "TORO-ALEGRA-WRITER-RECEIPT-v1";
  idempotencyKey: string;
  payloadHash: string;
  approvalId: string;
  actorId: string;
  nativeId: string | null;
  executionState:
    | "replayed_verified"
    | "provider_created"
    | "provider_ambiguous_recovered"
    | "blocked"
    | "failed";
  verificationState:
    | "VERIFIED"
    | "READBACK_MISMATCH"
    | "NOT_ATTEMPTED"
    | "PROVIDER_STATE_UNKNOWN";
  verified: boolean;
  reasons: string[];
  createdAt: string;
  durableReceiptId?: string | null;
};

export type AlegraExecutionGate = {
  // The canonical worker must atomically admit this action and persist its dispatch marker.
  beforeDispatch(input: { intent: AlegraWriteIntent; approval: AlegraWriteApproval }): Promise<boolean>;
  persistReceipt(receipt: AlegraWriterReceipt): Promise<string | null>;
};

type AlegraExecutionInput = {
  intent: AlegraWriteIntent;
  approval: AlegraWriteApproval | null | undefined;
  duplicateDecision: AlegraDuplicateDecision;
  transport: AlegraWriteTransport;
  priorReceipt?: AlegraWriterReceipt | null;
  /** Compatibility for earlier, non-deployed callers; uncertain receipts are blocked too. */
  priorVerifiedReceipt?: AlegraWriterReceipt | null;
  writerEnabled?: boolean;
  gate?: AlegraExecutionGate;
  now: string;
};

export type AlegraWriterExecutionResult = {
  ok: boolean;
  executedProviderMutation: boolean;
  receipt: AlegraWriterReceipt;
  admitted?: boolean;
};

function blockedReceipt(input: {
  intent: AlegraWriteIntent;
  approval?: AlegraWriteApproval | null;
  reason: string;
  now: string;
  verificationState?: AlegraWriterReceipt["verificationState"];
}): AlegraWriterReceipt {
  return {
    version: "TORO-ALEGRA-WRITER-RECEIPT-v1",
    idempotencyKey: input.intent.idempotencyKey,
    payloadHash: input.intent.payloadHash,
    approvalId: input.approval?.approvalId ?? "",
    actorId: input.approval?.actorId ?? "",
    nativeId: null,
    executionState: "blocked",
    verificationState: input.verificationState ?? "NOT_ATTEMPTED",
    verified: false,
    reasons: [input.reason],
    createdAt: input.now,
  };
}

export async function executeApprovedAlegraIntent(input: AlegraExecutionInput): Promise<AlegraWriterExecutionResult> {
  input = { ...input, ...captureAlegraWriteAuthorization(input.intent, input.approval) };
  if (input.writerEnabled !== true || !input.gate) {
    return { ok: false, executedProviderMutation: false,
      receipt: blockedReceipt({ ...input, reason: "WRITER_DISABLED" }) };
  }
  const result = await executeWithGate(input);
  if (!result.executedProviderMutation && !result.admitted) return result;
  try {
    const receiptId = await input.gate.persistReceipt(result.receipt);
    if (!receiptId) throw new Error("Missing durable receipt");
    return { ...result, receipt: { ...result.receipt, durableReceiptId: receiptId } };
  } catch {
    return { ...result, ok: false, receipt: { ...result.receipt, verified: false,
      verificationState: "PROVIDER_STATE_UNKNOWN", reasons: [...result.receipt.reasons, "RECEIPT_PERSISTENCE_UNCERTAIN"] } };
  }
}

async function executeWithGate(input: AlegraExecutionInput): Promise<AlegraWriterExecutionResult> {
  const approvalDecision = validateAlegraWriteApproval(input.intent, input.approval);
  if (!approvalDecision.ok) {
    return {
      ok: false,
      executedProviderMutation: false,
      receipt: blockedReceipt({
        intent: input.intent,
        approval: input.approval,
        reason: approvalDecision.reason,
        now: input.now,
      }),
    };
  }

  const prior = input.priorReceipt ?? input.priorVerifiedReceipt;
  if (prior?.verified && prior.idempotencyKey === input.intent.idempotencyKey && !prior.durableReceiptId) {
    return { ok: false, executedProviderMutation: false, receipt: blockedReceipt({ ...input, reason: "PRIOR_RECEIPT_NOT_DURABLE" }) };
  }
  if (prior?.idempotencyKey === input.intent.idempotencyKey &&
      (!prior.verified || prior.payloadHash !== input.intent.payloadHash)) {
    return { ok: false, executedProviderMutation: false, receipt: blockedReceipt({ ...input,
      reason: "PRIOR_EFFECT_REQUIRES_RECONCILIATION", verificationState: "PROVIDER_STATE_UNKNOWN" }) };
  }

  if (!input.duplicateDecision.clear || input.duplicateDecision.state !== "CLEAR") {
    return {
      ok: false,
      executedProviderMutation: false,
      receipt: blockedReceipt({
        intent: input.intent,
        approval: input.approval,
        reason: `DUPLICATE_PREFLIGHT_${input.duplicateDecision.state}`,
        now: input.now,
      }),
    };
  }

  if (
    prior?.verified &&
    prior.idempotencyKey === input.intent.idempotencyKey &&
    prior.payloadHash === input.intent.payloadHash
  ) {
    return {
      ok: true,
      executedProviderMutation: false,
      receipt: {
        ...prior,
        executionState: "replayed_verified",
        reasons: [...prior.reasons, "IDEMPOTENT_REPLAY"],
        createdAt: input.now,
      },
    };
  }

  try {
    if (!input.approval || !await input.gate!.beforeDispatch({ intent: input.intent, approval: input.approval })) {
      return { ok: false, executedProviderMutation: false, receipt: blockedReceipt({ ...input, reason: "EXECUTION_GATE_NOT_ACQUIRED" }) };
    }
  } catch {
    return { ok: false, executedProviderMutation: false, receipt: blockedReceipt({ ...input, reason: "EXECUTION_GATE_UNAVAILABLE" }) };
  }

  const revalidated = validateAlegraWriteApproval(input.intent, input.approval);
  if (!revalidated.ok) {
    return { ok: false, executedProviderMutation: false, admitted: true,
      receipt: blockedReceipt({ ...input, reason: revalidated.reason }) };
  }

  let createResult: AlegraProviderCreateResult;
  try {
    createResult = await input.transport.create({ intent: input.intent, idempotencyKey: input.intent.idempotencyKey });
  } catch {
    createResult = { state: "ambiguous" };
  }

  let nativeId: string | null = null;
  let executionState: AlegraWriterReceipt["executionState"] = "provider_created";

  if (createResult.state === "failed") {
    return {
      ok: false,
      executedProviderMutation: true,
      receipt: {
        ...blockedReceipt({
          intent: input.intent,
          approval: input.approval,
          reason: `PROVIDER_FAILED_${createResult.code}`,
          now: input.now,
        }),
        executionState: "failed",
      },
    };
  }

  if (createResult.state === "created") {
    nativeId = createResult.nativeId;
  }

  if (createResult.state === "ambiguous") {
    let lookup: AlegraProviderLookupResult;
    try {
      lookup = await input.transport.findByIdempotencyKey({ intent: input.intent, idempotencyKey: input.intent.idempotencyKey });
    } catch {
      lookup = { state: "unavailable" };
    }

    if (lookup.state !== "found") {
      return {
        ok: false,
        executedProviderMutation: true,
        receipt: {
          ...blockedReceipt({
            intent: input.intent,
            approval: input.approval,
            reason:
              lookup.state === "unavailable"
                ? "PROVIDER_AMBIGUOUS_LOOKUP_UNAVAILABLE"
                : "PROVIDER_AMBIGUOUS_NOT_FOUND_NO_BLIND_RETRY",
            now: input.now,
            verificationState: "PROVIDER_STATE_UNKNOWN",
          }),
          executionState: "blocked",
        },
      };
    }

    nativeId = lookup.nativeId;
    executionState = "provider_ambiguous_recovered";
  }

  if (!nativeId) {
    return {
      ok: false,
      executedProviderMutation: true,
      receipt: blockedReceipt({
        intent: input.intent,
        approval: input.approval,
        reason: "NATIVE_ID_REQUIRED_FOR_READBACK",
        now: input.now,
      }),
    };
  }

  let readback: AlegraReadback;
  try {
    readback = await input.transport.readback({ intent: input.intent, nativeId });
  } catch {
    return { ok: false, executedProviderMutation: true, receipt: { ...blockedReceipt({ ...input,
      reason: "READBACK_UNAVAILABLE", verificationState: "PROVIDER_STATE_UNKNOWN" }), nativeId } };
  }
  const verification = verifyAlegraReadback(input.intent, readback);
  if (readback.nativeId !== nativeId) {
    verification.ok = false;
    verification.state = "READBACK_MISMATCH";
    verification.mismatches.push("NATIVE_ID");
  }

  return {
    ok: verification.ok,
    executedProviderMutation: true,
    receipt: {
      version: "TORO-ALEGRA-WRITER-RECEIPT-v1",
      idempotencyKey: input.intent.idempotencyKey,
      payloadHash: input.intent.payloadHash,
      approvalId: input.approval?.approvalId ?? "",
      actorId: input.approval?.actorId ?? "",
      nativeId,
      executionState,
      verificationState: verification.state,
      verified: verification.ok,
      reasons: verification.ok ? [] : verification.mismatches.map((item) => `READBACK_${item}`),
      createdAt: input.now,
    },
  };
}
