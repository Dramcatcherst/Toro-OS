import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { admitApprovedAlegraExecutionRun, finalizeAlegraExecutionRun, heartbeatAlegraExecutionRun, type ToroWorkerRun } from "../control-plane/worker-runtime";
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
        return current?.runId === run.id &&
          current.fencingToken === lease.fencingToken &&
          current.preparedReceiptId === preparedReceiptId;
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
