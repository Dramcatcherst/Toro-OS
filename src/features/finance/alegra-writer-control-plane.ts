import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  admitApprovedAlegraExecutionRun,
  finalizeAlegraExecutionRun,
  heartbeatAlegraExecutionRun,
  recoverExpiredAlegraExecutionRun,
  type ToroAlegraExpiredLeaseRecovery,
  type ToroWorkerRun,
} from "../control-plane/worker-runtime";
import type { AlegraExecutionGate } from "./alegra-writer-executor";
import { captureAlegraWriteAuthorization, validateAlegraWriteApproval } from "./alegra-writer-contract";
export function createAlegraControlPlaneGate(input: { supabase: SupabaseClient; run: ToroWorkerRun; workerId: string; now: () => string; authorize: AlegraExecutionGate["beforeDispatch"] }): AlegraExecutionGate {
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
  supabase: SupabaseClient;
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
    recoveryWorkerId === run.actorRef ||
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
