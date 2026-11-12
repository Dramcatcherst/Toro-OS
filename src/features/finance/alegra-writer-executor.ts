import {
  captureAlegraWriteAuthorization,
  isAlegraWriteBusinessKey,
  parseAlegraTimestamp,
  validateAlegraWriteApproval,
  verifyAlegraReadback,
  type AlegraReadback,
  type AlegraWriteApproval,
  type AlegraWriteIntent,
} from "./alegra-writer-contract";
import type { AlegraDuplicateDecision } from "./alegra-writer-dedupe";

export type AlegraProviderCreateResult =
  | { state: "blocked"; code: string }
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
    // The native transport must check the admitted fenced lease again AFTER
    // all provider preflight reads, immediately before its single POST.
    // Optional only for legacy/test transports; native production fails closed.
    beforeNativePost?: () => Promise<boolean>;
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
  // A fresh fenced heartbeat is required after admission and before provider create.
  renewLease(): Promise<boolean>;
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

function priorReconciliationReceipt(input: AlegraExecutionInput, prior: AlegraWriterReceipt, reason: string): AlegraWriterReceipt {
  return {
    ...blockedReceipt({ ...input, reason, verificationState: "PROVIDER_STATE_UNKNOWN" }),
    // These are reconciliation pointers to the earlier effect, not verification
    // of that effect or a new durable receipt. Do not lose them on a blocked replay.
    nativeId: typeof prior.nativeId === "string" && prior.nativeId.trim() ? prior.nativeId : null,
    ...(typeof prior.durableReceiptId === "string" && prior.durableReceiptId.trim()
      ? { durableReceiptId: prior.durableReceiptId } : {}),
  };
}

export async function executeApprovedAlegraIntent(input: AlegraExecutionInput): Promise<AlegraWriterExecutionResult> {
  input = { ...input, ...captureAlegraWriteAuthorization(input.intent, input.approval) };
  if (input.writerEnabled !== true || !input.gate) {
    return { ok: false, executedProviderMutation: false,
      receipt: blockedReceipt({ ...input, reason: "WRITER_DISABLED" }) };
  }
  // Capture capabilities and mutable evidence without freezing the host's objects.
  const transport = input.transport;
  const gate = input.gate;
  const create = transport?.create, find = transport?.findByIdempotencyKey, readback = transport?.readback;
  const beforeDispatch = gate.beforeDispatch, renewLease = gate.renewLease, persistReceipt = gate.persistReceipt;
  if ([create, find, readback, beforeDispatch, renewLease, persistReceipt].some(method => typeof method !== "function")) {
    return { ok: false, executedProviderMutation: false,
      receipt: blockedReceipt({ ...input, reason: "EXECUTION_CAPABILITY_INVALID" }) };
  }
  input = { ...input,
    priorReceipt: input.priorReceipt ? structuredClone(input.priorReceipt) : input.priorReceipt,
    priorVerifiedReceipt: input.priorVerifiedReceipt ? structuredClone(input.priorVerifiedReceipt) : input.priorVerifiedReceipt,
    duplicateDecision: structuredClone(input.duplicateDecision),
    transport: { create: create.bind(transport), findByIdempotencyKey: find.bind(transport), readback: readback.bind(transport) },
    gate: { beforeDispatch: beforeDispatch.bind(gate), renewLease: renewLease.bind(gate), persistReceipt: persistReceipt.bind(gate) },
  };
  const result = await executeWithGate(input);
  if (!result.executedProviderMutation && !result.admitted) return result;
  try {
    const receiptId = await input.gate!.persistReceipt(result.receipt);
    if (!receiptId) throw new Error("Missing durable receipt");
    return { ...result, receipt: { ...result.receipt, durableReceiptId: receiptId } };
  } catch {
    return { ...result, ok: false, receipt: { ...result.receipt, verified: false,
      verificationState: "PROVIDER_STATE_UNKNOWN", reasons: [...result.receipt.reasons, "RECEIPT_PERSISTENCE_UNCERTAIN"] } };
  }
}

async function executeWithGate(input: AlegraExecutionInput): Promise<AlegraWriterExecutionResult> {
  // Capture the already admitted gate's renewal method before any await,
  // so the native transport uses the exact same worker/fence and receipt.
  const originalGate = input.gate;
  const renewLease = originalGate && typeof originalGate.renewLease === "function"
    ? originalGate.renewLease.bind(originalGate)
    : null;
  const approvalDecision = validateAlegraWriteApproval(input.intent, input.approval, input.now);
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
  if (prior && prior.idempotencyKey !== input.intent.idempotencyKey && isAlegraWriteBusinessKey(input.intent, prior.idempotencyKey)) {
    return { ok: false, executedProviderMutation: false, receipt: priorReconciliationReceipt(input, prior,
      "PRIOR_IDENTITY_VERSION_REQUIRES_RECONCILIATION") };
  }
  if (prior?.verified && prior.idempotencyKey === input.intent.idempotencyKey && !prior.durableReceiptId) {
    return { ok: false, executedProviderMutation: false, receipt: blockedReceipt({ ...input, reason: "PRIOR_RECEIPT_NOT_DURABLE" }) };
  }
  if (prior?.idempotencyKey === input.intent.idempotencyKey &&
      (!prior.verified || prior.payloadHash !== input.intent.payloadHash)) {
    return { ok: false, executedProviderMutation: false, receipt: priorReconciliationReceipt(input, prior,
      "PRIOR_EFFECT_REQUIRES_RECONCILIATION") };
  }

  if (prior?.idempotencyKey === input.intent.idempotencyKey && prior.verified && (
    typeof prior.actorId !== "string" || !prior.actorId.trim() ||
    typeof prior.approvalId !== "string" || !prior.approvalId.trim() ||
    prior.verified !== true || prior.version !== "TORO-ALEGRA-WRITER-RECEIPT-v1" ||
    typeof prior.nativeId !== "string" || !prior.nativeId.trim() ||
    typeof prior.durableReceiptId !== "string" || !prior.durableReceiptId.trim() ||
    prior.verificationState !== "VERIFIED" ||
    !["provider_created", "provider_ambiguous_recovered", "replayed_verified"].includes(prior.executionState) ||
    !Array.isArray(prior.reasons) || prior.reasons.some(reason => reason !== "IDEMPOTENT_REPLAY") ||
    !Number.isFinite(parseAlegraTimestamp(prior.createdAt))
  )) return { ok: false, executedProviderMutation: false, receipt: blockedReceipt({ ...input,
    reason: "PRIOR_RECEIPT_REQUIRES_RECONCILIATION", verificationState: "PROVIDER_STATE_UNKNOWN" }) };

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

  const revalidated = validateAlegraWriteApproval(input.intent, input.approval, input.now);
  if (!revalidated.ok) {
    return { ok: false, executedProviderMutation: false, admitted: true,
      receipt: blockedReceipt({ ...input, reason: revalidated.reason }) };
  }

  // A prepared marker is not permission to POST with an expired lease.
  // On heartbeat failure keep the marker auditable and block without provider I/O.
  let leaseReady = false;
  try {
    leaseReady = renewLease ? await renewLease() === true : false;
  } catch {
    leaseReady = false;
  }
  if (!leaseReady) {
    return { ok: false, executedProviderMutation: false, admitted: true,
      receipt: blockedReceipt({ ...input, reason: "EXECUTION_LEASE_UNAVAILABLE" }) };
  }

  let createResult: AlegraProviderCreateResult;
  try {
    createResult = await input.transport.create({
      intent: input.intent,
      idempotencyKey: input.intent.idempotencyKey,
      beforeNativePost: renewLease ?? undefined,
    });
  } catch {
    createResult = { state: "ambiguous" };
  }

  // A malformed result cannot establish that the admitted POST had no effect.
  if (!createResult || typeof createResult !== "object" || Array.isArray(createResult) ||
      !["blocked", "failed", "created", "ambiguous"].includes(createResult.state) ||
      (createResult.state === "created" && (typeof createResult.nativeId !== "string" || !createResult.nativeId.trim())) ||
      ((createResult.state === "blocked" || createResult.state === "failed") && (typeof createResult.code !== "string" || !createResult.code.trim())) ||
      (createResult.state === "failed" && typeof createResult.retryable !== "boolean")) {
    createResult = { state: "ambiguous" };
  }

  let nativeId: string | null = null;
  let executionState: AlegraWriterReceipt["executionState"] = "provider_created";

  if (createResult.state === "blocked") {
    return { ok: false, executedProviderMutation: false, admitted: true,
      receipt: blockedReceipt({ ...input, reason: createResult.code }) };
  }

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
    const returnedId = typeof createResult.nativeId === "string" && createResult.nativeId.trim()
      ? createResult.nativeId : null;
    let lookup: AlegraProviderLookupResult;
    try {
      lookup = await input.transport.findByIdempotencyKey({ intent: input.intent, idempotencyKey: input.intent.idempotencyKey });
    } catch {
      lookup = { state: "unavailable" };
    }

    if (!lookup || typeof lookup !== "object" || Array.isArray(lookup) ||
        !["found", "not_found", "unavailable"].includes(lookup.state) ||
        (lookup.state === "found" && (typeof lookup.nativeId !== "string" || !lookup.nativeId.trim()))) lookup = { state: "unavailable" };
    const conflictingId = lookup.state === "found" && returnedId !== null && lookup.nativeId !== returnedId;
    if (lookup.state !== "found" || conflictingId) {
      return {
        ok: false,
        executedProviderMutation: true,
        receipt: {
          ...blockedReceipt({
            intent: input.intent,
            approval: input.approval,
            reason:
              conflictingId ? "PROVIDER_NATIVE_ID_CONFLICT" : lookup.state === "unavailable"
                ? "PROVIDER_AMBIGUOUS_LOOKUP_UNAVAILABLE"
                : "PROVIDER_AMBIGUOUS_NOT_FOUND_NO_BLIND_RETRY",
            now: input.now,
            verificationState: "PROVIDER_STATE_UNKNOWN",
          }),
          nativeId: returnedId,
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
  let verification: ReturnType<typeof verifyAlegraReadback>;
  try {
    readback = await input.transport.readback({ intent: input.intent, nativeId });
    verification = verifyAlegraReadback(input.intent, readback);
    if (readback.nativeId !== nativeId) {
      verification.ok = false;
      verification.state = "READBACK_MISMATCH";
      verification.mismatches.push("NATIVE_ID");
    }
  } catch {
    return { ok: false, executedProviderMutation: true, receipt: { ...blockedReceipt({ ...input,
      reason: "READBACK_UNAVAILABLE", verificationState: "PROVIDER_STATE_UNKNOWN" }), nativeId, executionState } };
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
