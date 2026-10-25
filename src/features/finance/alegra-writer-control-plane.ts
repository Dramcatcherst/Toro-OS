import "server-only";
import { isDeepStrictEqual } from "node:util";
import type { AlegraWriterRpcClient } from "@/lib/supabase/alegra-writer-rpc";
import {
  admitApprovedAlegraExecutionRun,
  finalizeAlegraExecutionRun,
  heartbeatAlegraExecutionRun,
  recoverExpiredAlegraExecutionRun,
  type ToroAlegraExpiredLeaseRecovery,
  type ToroWorkerRun,
} from "../control-plane/worker-runtime";
import {
  executeApprovedAlegraIntent,
  type AlegraExecutionGate,
  type AlegraWriterExecutionResult,
  type AlegraWriterReceipt,
} from "./alegra-writer-executor";
import type { AlegraDuplicateDecision } from "./alegra-writer-dedupe";
import {
  createNativeAlegraPurchaseTransport,
  type AlegraNativeHttp,
  type AlegraNativeBinding,
  type NativePurchaseBody,
  prepareNativeAlegraPurchaseBody,
} from "./alegra-native-purchase-transport";
import {
  captureAlegraWriteAuthorization,
  validateAlegraWriteApproval,
  type AlegraWriteApproval,
  type AlegraWriteIntent,
} from "./alegra-writer-contract";
export function createAlegraControlPlaneGate(input: { supabase: AlegraWriterRpcClient; run: ToroWorkerRun; workerId: string; now: () => string; authorize: AlegraExecutionGate["beforeDispatch"] }): AlegraExecutionGate {
  // Capture host bindings once; callers must not redirect an admitted run.
  const { supabase, workerId, now: currentTime, authorize } = input;
  const run = { ...input.run };
  let attempted = false;
  let admittedHash: string | null = null;
  let evidenceRefs: string[] = [];
  let approvedId: string | null = null;
  let approvedActor: string | null = null;
  let preparedReceiptId: string | null = null;
  const lease = { runId: run.id, workerId, fencingToken: run.fencingToken };
  return {
    async beforeDispatch(request) {
      if (attempted) return false;
      attempted = true;
      const captured = captureAlegraWriteAuthorization(request.intent, request.approval);
      const intent = captured.intent;
      const approval = captured.approval!;
      // The signed human and the runtime worker must be distinct identities.
      // Normalize only for comparison; do not modify the fenced worker ID.
      const workerPrincipal = typeof workerId === "string" ? workerId.trim().toLowerCase() : "";
      const signerPrincipal = approval?.actorId?.trim().toLowerCase() ?? "";
      if (!workerPrincipal || !signerPrincipal || workerPrincipal === signerPrincipal) return false;
      const checkedAt = currentTime();
      const now = Date.parse(checkedAt);
      if (!validateAlegraWriteApproval(intent, approval, checkedAt).ok || !Number.isFinite(now) || run.orgId !== intent.scope.orgId || run.idempotencyKey !== intent.idempotencyKey ||
          run.targetSystem !== "alegra" || run.actionKey !== intent.action || run.executionAuthorityLevel !== "L3" ||
          !run.decisionId || run.status !== "queued" || run.attemptCount !== 0 || run.maxAttempts !== 1 || run.fencingToken < 0 ||
          approval.decisionId !== run.decisionId || approval.actorId !== run.actorRef || !(Date.parse(approval.expiresAt) > now) ||
          !await authorize({ intent, approval })) return false;
      // Authorization can await I/O. Sample the bound clock again before RPC.
      // The database remains the final atomic authority at admission.
      if (!validateAlegraWriteApproval(intent, approval, currentTime()).ok) return false;
      const admission = await admitApprovedAlegraExecutionRun(supabase, {
        orgId: run.orgId,
        runId: run.id,
        workerId,
        expectedFencingToken: run.fencingToken,
        approval: {
          approvalReceiptId: approval.approvalReceiptId,
          approvalId: approval.approvalId,
          approvalActorId: approval.actorId,
          approvalApprovedAt: approval.approvedAt,
          approvalExpiresAt: approval.expiresAt,
          payloadHash: intent.payloadHash,
          decisionRevision: approval.decisionRevision,
        },
      });
      if (!admission) return false;
      lease.fencingToken = admission.fencingToken;
      preparedReceiptId = admission.preparedReceiptId;
      admittedHash = intent.payloadHash; approvedId = approval.approvalId; approvedActor = approval.actorId;
      evidenceRefs = [...intent.evidence.sourceRefs];
      return true;
    },
    async renewLease() {
      // Never invent lease identity, change workers, or renew an unadmitted run.
      if (!admittedHash || !preparedReceiptId) return false;
      try {
        const current = await heartbeatAlegraExecutionRun(supabase, {
          orgId: run.orgId,
          ...lease,
          preparedReceiptId,
          leaseSeconds: 60,
        });
        const renewedExpiry = current?.leaseExpiresAt ? Date.parse(current.leaseExpiresAt) : Number.NaN;
        // Never treat an expired or malformed provider lease as a live heartbeat.
        return current?.runId === run.id &&
          current.fencingToken === lease.fencingToken &&
          current.preparedReceiptId === preparedReceiptId &&
          Number.isFinite(renewedExpiry) && renewedExpiry > Date.parse(currentTime());
      } catch {
        return false;
      }
    },
    async persistReceipt(receipt) {
      const capturedReceipt = structuredClone(receipt);
      if (!admittedHash || !preparedReceiptId || capturedReceipt.payloadHash !== admittedHash || capturedReceipt.idempotencyKey !== run.idempotencyKey ||
          capturedReceipt.approvalId !== approvedId || capturedReceipt.actorId !== approvedActor) return null;
      const finalized = await finalizeAlegraExecutionRun(supabase, {
        orgId: run.orgId,
        ...lease,
        preparedReceiptId,
        outcome: capturedReceipt.verified ? "verified" : "reconciliation_required",
        receipt: {
          external_reference: capturedReceipt.nativeId,
          observed_after: capturedReceipt,
          evidence_refs: evidenceRefs,
          integrity_hash: admittedHash,
        },
      });
      return finalized?.finalReceiptId ?? null;
    },
  };
}


/**
 * An existing governed server-only worker may use this exact-target caller
 * after reading the latest admitted run and durable prepared receipt.
 * The database recovery RPC locks/fences the run and is the final authority;
 * this preflight never revives a lease, grants permission or contacts Alegra.
 *
 * Runtime wiring and dedicated least-privilege principal remain separate
 * deployment gates. In particular, do not supply a broad service_role client.
 */
export async function recoverExpiredAlegraLease(input: {
  supabase: AlegraWriterRpcClient;
  run: ToroWorkerRun;
  preparedReceiptId: string;
  recoveryWorkerId: string;
  now: () => string;
}): Promise<ToroAlegraExpiredLeaseRecovery | null> {
  const { supabase, recoveryWorkerId, preparedReceiptId, now: currentTime } = input;
  // Capture the source/run identity once. A caller's later mutation must not
  // redirect the recovery RPC toward another organization or run.
  const run = { ...input.run };
  const observedAt = Date.parse(currentTime());
  const leaseExpiresAt = Date.parse(run.leaseExpiresAt ?? "");

  // No generic queue claim or retry is permitted for L3. On a mismatch,
  // leave the original prepared marker intact for manual reconciliation.
  if (
    !Number.isFinite(observedAt) ||
    !Number.isFinite(leaseExpiresAt) ||
    observedAt < leaseExpiresAt ||
    !run.id?.trim() ||
    !run.orgId?.trim() ||
    !run.decisionId?.trim() ||
    run.targetSystem !== "alegra" ||
    run.actionKey !== "alegra_create_purchase_bill" ||
    run.executionAuthorityLevel !== "L3" ||
    run.actorKind !== "human" ||
    !run.actorRef?.trim() ||
    (run.businessRisk !== "High" && run.businessRisk !== "Critical") ||
    (run.status !== "running" && run.status !== "verifying") ||
    run.verificationStatus !== "pending" ||
    run.attemptCount !== 1 ||
    run.maxAttempts !== 1 ||
    !Number.isSafeInteger(run.fencingToken) ||
    run.fencingToken < 1 ||
    run.fencingToken >= Number.MAX_SAFE_INTEGER ||
    !run.leaseOwner?.trim() ||
    !recoveryWorkerId?.trim() ||
    recoveryWorkerId.trim().toLowerCase() === run.actorRef?.trim().toLowerCase() ||
    !preparedReceiptId?.trim()
  ) {
    return null;
  }

  const result = await recoverExpiredAlegraExecutionRun(supabase, {
    orgId: run.orgId,
    runId: run.id,
    recoveryWorkerId,
    expectedFencingToken: run.fencingToken,
    preparedReceiptId,
  });

  if (
    !result ||
    result.runId !== run.id ||
    result.fencingToken !== run.fencingToken + 1 ||
    result.providerState !== "PROVIDER_STATE_UNKNOWN" ||
    result.runStatus !== "blocked" ||
    result.verificationStatus !== "partial"
  ) return null;

  // Whether recovered or SQL-replayed, this says nothing about the native
  // purchase's existence. Never re-POST; reconcile by independent readback.
  return result;
}


/**
 * Compose existing L3 primitives in the governed server-only host.
 * This is deliberately NOT an API route, credential provider, scheduler, role
 * grant, or activation flag. It performs no provider IO unless BOTH independent
 * caller gates explicitly allow the operation and admission succeeds.
 *
 * Production readiness additionally requires the reviewed L3 SQL deployment,
 * least-privilege runtime principal, exact account/entity native binding and
 * an independently approved document pilot.
 */
export async function executeGovernedAlegraPurchase(input: {
  supabase: AlegraWriterRpcClient;
  run: ToroWorkerRun;
  workerId: string;
  now: () => string;
  intent: AlegraWriteIntent;
  approval: AlegraWriteApproval | null | undefined;
  duplicateDecision: AlegraDuplicateDecision;
  http: AlegraNativeHttp;
  binding: AlegraNativeBinding;
  authorizeAdmission: AlegraExecutionGate["beforeDispatch"];
  authorizeNativeCreate: (captured: {
    intent: AlegraWriteIntent;
    body: NativePurchaseBody;
    company: Record<string, unknown>;
  }) => Promise<boolean>;
  // Host canonical check AFTER a successful heartbeat, including the last
  // awaited lease operation before native POST. Legacy composers may omit it;
  // the manual caller below always supplies it.
  authorizeFinalDispatch?: () => Promise<boolean>;
  writerEnabled?: boolean;
  nativeMutationEnabled?: boolean;
  priorReceipt?: AlegraWriterReceipt | null;
}): Promise<AlegraWriterExecutionResult> {
  // Capture the host's distinct enablement and capabilities once, before I/O.
  // No fallthrough to the native transport on either disabled condition.
  const {
    supabase, run, workerId, now, intent, approval, duplicateDecision,
    http, binding, authorizeAdmission, authorizeNativeCreate,
  } = input;
  const enabled = input.writerEnabled === true &&
    input.nativeMutationEnabled === true &&
    typeof authorizeAdmission === "function" &&
    typeof authorizeNativeCreate === "function";
  const transport = createNativeAlegraPurchaseTransport({
    http, binding, now,
    mutationEnabled: enabled,
    authorizeNativeCreate: enabled ? authorizeNativeCreate : undefined,
  });
  const baseGate = enabled
    ? createAlegraControlPlaneGate({
        supabase, run, workerId, now, authorize: authorizeAdmission,
      })
    : undefined;
  const authorizeFinalDispatch = input.authorizeFinalDispatch;
  const gate = baseGate && authorizeFinalDispatch !== undefined
    ? { ...baseGate, async renewLease() {
        if (!await baseGate.renewLease()) return false;
        try { return typeof authorizeFinalDispatch === "function" && await authorizeFinalDispatch() === true; }
        catch { return false; }
      } }
    : baseGate;

  // The executor captures/freeze-binds the owner's intent + approval before
  // admission, requires both fenced heartbeats, then verifies native readback
  // and saves one durable receipt. No second provider POST on unknown state.
  return executeApprovedAlegraIntent({
    intent, approval, duplicateDecision, transport, gate,
    writerEnabled: enabled,
    priorReceipt: input.priorReceipt,
    now: now(),
  });
}

export type AlegraCallerContext = {
  flags?: { writerEnabled?: boolean; nativeMutationEnabled?: boolean; recoveryEnabled?: boolean };
  run: ToroWorkerRun;
  intent: AlegraWriteIntent;
  approval: AlegraWriteApproval;
  duplicateDecision: AlegraDuplicateDecision;
  binding: AlegraNativeBinding;
  priorReceipt?: AlegraWriterReceipt | null;
  preparedReceipt: { id: string; orgId: string; runId: string; payloadHash: string } | null;
};
type AlegraCallerTarget = { orgId: string; runId: string; payloadHash: string };
type CallerBlocked = { state: "blocked"; reason: string };

/**
 * Manual invocation adapter in the existing server-only Writer lane. No route,
 * timer, credentials, grants or run creation. Commands accept no caller payload,
 * flags or identity. The host must supply authorized canonical reads and a
 * separately authenticated least-privilege RPC client before production use.
 */
export function createManualAlegraPurchaseCaller(input: {
  target: AlegraCallerTarget;
  workerId: string;
  recoveryWorkerId: string;
  supabase: AlegraWriterRpcClient;
  http: AlegraNativeHttp;
  now: () => string;
  readCanonicalContext: (target: Readonly<AlegraCallerTarget>) => Promise<AlegraCallerContext | null>;
  authorizeAdmission: AlegraExecutionGate["beforeDispatch"];
  authorizeNativeCreate: (request: { intent: AlegraWriteIntent; body: NativePurchaseBody; company: Record<string, unknown> }) => Promise<boolean>;
}) {
  if (process.env.TORO_DEPLOYMENT_MODE !== "internal") throw new Error("ALEGRA_CALLER_INTERNAL_REQUIRED");
  const target = Object.freeze({ ...input.target });
  const { supabase, workerId, recoveryWorkerId, now, readCanonicalContext, authorizeAdmission, authorizeNativeCreate } = input;
  if (!target.orgId?.trim() || !target.runId?.trim() || !/^[a-f0-9]{64}$/.test(target.payloadHash) || !workerId?.trim() || !recoveryWorkerId?.trim() ||
      [now, readCanonicalContext, authorizeAdmission, authorizeNativeCreate].some(fn => typeof fn !== "function")) throw new Error("ALEGRA_CALLER_BINDING_REQUIRED");
  const http = { request: input.http.request.bind(input.http) };
  let busy = false, dispatched = false, recovered = false;
  const blocked = (reason: string): CallerBlocked => ({ state: "blocked", reason });
  async function load() {
    try {
      const raw = await readCanonicalContext(target);
      return raw ? structuredClone(raw) : null;
    } catch { return null; }
  }
  function valid(context: AlegraCallerContext) {
    try {
      const { run, intent, approval, binding } = context;
      if (run.id !== target.runId || run.orgId !== target.orgId || intent.scope.orgId !== target.orgId || binding.scope.orgId !== target.orgId ||
          intent.payloadHash !== target.payloadHash || approval.payloadHash !== target.payloadHash || run.idempotencyKey !== intent.idempotencyKey ||
          run.decisionId !== approval.decisionId || run.actorRef !== approval.actorId || run.actorKind !== "human" ||
          run.targetSystem !== "alegra" || run.actionKey !== "alegra_create_purchase_bill" || run.executionAuthorityLevel !== "L3") return false;
      prepareNativeAlegraPurchaseBody(intent, binding);
      return true;
    } catch { return false; }
  }
  function enabled(context: AlegraCallerContext) {
    return context.flags?.writerEnabled === true && context.flags?.nativeMutationEnabled === true;
  }
  function sameAuthority(initial: AlegraCallerContext, fresh: AlegraCallerContext) {
    return valid(fresh) && fresh.duplicateDecision.clear === true && fresh.duplicateDecision.state === "CLEAR" &&
      validateAlegraWriteApproval(fresh.intent, fresh.approval, now()).ok &&
      isDeepStrictEqual(initial.approval, fresh.approval) && isDeepStrictEqual(initial.binding, fresh.binding);
  }
  return Object.freeze({
    async dispatch() {
      if (busy || dispatched) return blocked("CALLER_ALREADY_USED");
      busy = true; dispatched = true;
      try {
        const context = await load();
        if (!context) return blocked("CONTEXT_UNAVAILABLE");
        if (!enabled(context)) return blocked("WRITER_DISABLED");
        if (!valid(context)) return blocked("CANONICAL_TARGET_MISMATCH");
        try {
          const result = await executeGovernedAlegraPurchase({
            supabase, run: context.run, workerId, now, http, binding: context.binding,
            intent: context.intent, approval: context.approval, duplicateDecision: context.duplicateDecision,
            priorReceipt: context.priorReceipt, writerEnabled: true, nativeMutationEnabled: true,
            authorizeAdmission: async request => {
              if (await authorizeAdmission(request) !== true) return false;
              const fresh = await load();
              return !!fresh && enabled(fresh) && sameAuthority(context, fresh);
            },
            authorizeNativeCreate: async request => {
              if (await authorizeNativeCreate(request) !== true) return false;
              const fresh = await load();
              return !!fresh && enabled(fresh) && sameAuthority(context, fresh) &&
                isDeepStrictEqual(request.body, prepareNativeAlegraPurchaseBody(fresh.intent, fresh.binding));
            },
            authorizeFinalDispatch: async () => {
              const fresh = await load();
              return !!fresh && enabled(fresh) && sameAuthority(context, fresh);
            },
          });
          return { state: "dispatch_result" as const, result };
        } catch {
          // An unexpected failure can follow an effect; never claim no effect,
          // expose the raw failure, or re-enter dispatch on this instance.
          return { state: "provider_state_unknown" as const, providerState: "PROVIDER_STATE_UNKNOWN" as const };
        }
      } finally { busy = false; }
    },
    async recover() {
      if (busy || recovered) return blocked("CALLER_ALREADY_USED");
      busy = true; recovered = true;
      try {
        const context = await load();
        if (!context) return blocked("CONTEXT_UNAVAILABLE");
        if (context.flags?.recoveryEnabled !== true) return blocked("RECOVERY_DISABLED");
        const marker = context.preparedReceipt;
        if (!valid(context) || !marker?.id?.trim() || marker.orgId !== target.orgId || marker.runId !== target.runId || marker.payloadHash !== target.payloadHash ||
            context.run.leaseOwner !== workerId || !Number.isFinite(Date.parse(context.run.leaseExpiresAt ?? "")) ||
            !(Date.parse(now()) >= Date.parse(context.run.leaseExpiresAt!))) return blocked("RECOVERY_TARGET_MISMATCH");
        try {
          const result = await recoverExpiredAlegraLease({ supabase, run: context.run, recoveryWorkerId, preparedReceiptId: marker.id, now });
          return result ? { state: "recovery_result" as const, result } : blocked("RECOVERY_NOT_CONFIRMED");
        } catch { return { state: "provider_state_unknown" as const, providerState: "PROVIDER_STATE_UNKNOWN" as const }; }
      } catch { return blocked("RECOVERY_CONTEXT_INVALID"); }
      finally { busy = false; }
    },
  });
}
