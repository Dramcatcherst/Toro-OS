import {
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
};

export type AlegraWriterExecutionResult = {
  ok: boolean;
  executedProviderMutation: boolean;
  receipt: AlegraWriterReceipt;
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

export async function executeApprovedAlegraIntent(input: {
  intent: AlegraWriteIntent;
  approval: AlegraWriteApproval | null | undefined;
  duplicateDecision: AlegraDuplicateDecision;
  transport: AlegraWriteTransport;
  priorVerifiedReceipt?: AlegraWriterReceipt | null;
  now: string;
}): Promise<AlegraWriterExecutionResult> {
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
    input.priorVerifiedReceipt?.verified &&
    input.priorVerifiedReceipt.idempotencyKey === input.intent.idempotencyKey &&
    input.priorVerifiedReceipt.payloadHash === input.intent.payloadHash
  ) {
    return {
      ok: true,
      executedProviderMutation: false,
      receipt: {
        ...input.priorVerifiedReceipt,
        executionState: "replayed_verified",
        reasons: [...input.priorVerifiedReceipt.reasons, "IDEMPOTENT_REPLAY"],
        createdAt: input.now,
      },
    };
  }

  const createResult = await input.transport.create({
    intent: input.intent,
    idempotencyKey: input.intent.idempotencyKey,
  });

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
    const lookup = await input.transport.findByIdempotencyKey({
      intent: input.intent,
      idempotencyKey: input.intent.idempotencyKey,
    });

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

  const readback = await input.transport.readback({
    intent: input.intent,
    nativeId,
  });
  const verification = verifyAlegraReadback(input.intent, readback);

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
