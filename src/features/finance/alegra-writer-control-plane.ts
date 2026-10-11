import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { appendToroExecutionReceipt, completeToroExecutionRun, renewToroExecutionLease, transitionToroExecutionRun, type ToroWorkerRun } from "../control-plane/worker-runtime";
import type { AlegraExecutionGate } from "./alegra-writer-executor";
import { captureAlegraWriteAuthorization } from "./alegra-writer-contract";
export function createAlegraControlPlaneGate(input: { supabase: SupabaseClient; run: ToroWorkerRun; workerId: string; now: () => string; authorize: AlegraExecutionGate["beforeDispatch"] }): AlegraExecutionGate {
  const run = { ...input.run };
  let attempted = false;
  let admittedHash: string | null = null;
  let evidenceRefs: string[] = [];
  let approvedId: string | null = null;
  let approvedActor: string | null = null;
  const lease = { runId: run.id, workerId: input.workerId, fencingToken: run.fencingToken };
  return {
    async beforeDispatch(request) {
      if (attempted) return false;
      attempted = true;
      const captured = captureAlegraWriteAuthorization(request.intent, request.approval);
      const intent = captured.intent;
      const approval = captured.approval!;
      const now = Date.parse(input.now());
      if (!Number.isFinite(now) || run.orgId !== intent.scope.orgId || run.idempotencyKey !== intent.idempotencyKey ||
          run.targetSystem !== "alegra" || run.actionKey !== intent.action || run.executionAuthorityLevel !== "L3" ||
          !run.decisionId || run.status !== "claimed" || run.leaseOwner !== input.workerId || run.fencingToken < 1 ||
          !run.leaseExpiresAt || !(Date.parse(run.leaseExpiresAt) > now) || !await input.authorize({ intent, approval })) return false;
      if (!await renewToroExecutionLease(input.supabase, lease)) return false;
      if (!await transitionToroExecutionRun(input.supabase, { ...lease, expectedStatus: "claimed", nextStatus: "running" })) return false;
      const marker = await appendToroExecutionReceipt(input.supabase, {
        orgId: run.orgId, runId: run.id, taskId: run.taskId, decisionId: run.decisionId,
        receiptType: "execution", status: "prepared", actionKey: run.actionKey, targetSystem: "alegra",
        actorKind: run.actorKind, actorRef: run.actorRef, executionAuthorityLevel: "L3", businessRisk: run.businessRisk,
        correlationId: run.correlationId, idempotencyKey: run.idempotencyKey, verificationStatus: "pending",
        desiredState: { payloadHash: intent.payloadHash, approvalId: approval.approvalId, actorId: approval.actorId },
        evidenceRefs: intent.evidence.sourceRefs, integrityHash: intent.payloadHash,
        executedState: { phase: "before_provider_dispatch", providerEffect: false },
      });
      if (!marker?.id) return false;
      admittedHash = intent.payloadHash; approvedId = approval.approvalId; approvedActor = approval.actorId;
      evidenceRefs = [...intent.evidence.sourceRefs];
      return true;
    },
    async persistReceipt(receipt) {
      if (!admittedHash || receipt.payloadHash !== admittedHash || receipt.idempotencyKey !== run.idempotencyKey ||
          receipt.approvalId !== approvedId || receipt.actorId !== approvedActor) return null;
      if (receipt.verified) {
        if (!await transitionToroExecutionRun(input.supabase, { ...lease, expectedStatus: "running", nextStatus: "verifying" })) return null;
        return completeToroExecutionRun(input.supabase, { ...lease, receipt: {
          external_reference: receipt.nativeId, desired_state: { payloadHash: admittedHash }, observed_after: receipt,
          verification_method: "alegra_native_readback", evidence_refs: evidenceRefs, integrity_hash: admittedHash,
          source_receipt_system: "alegra", source_receipt_kind: "writer_v3",
        } });
      }
      const saved = await appendToroExecutionReceipt(input.supabase, {
        orgId: run.orgId, runId: run.id, taskId: run.taskId, decisionId: run.decisionId,
        receiptType: "execution", status: "blocked", actionKey: run.actionKey, targetSystem: "alegra",
        actorKind: run.actorKind, actorRef: run.actorRef, executionAuthorityLevel: "L3", businessRisk: run.businessRisk,
        correlationId: run.correlationId, idempotencyKey: run.idempotencyKey, verificationStatus: "partial",
        externalReference: receipt.nativeId, observedAfter: receipt, evidenceRefs, integrityHash: admittedHash,
      });
      if (!await transitionToroExecutionRun(input.supabase, { ...lease, expectedStatus: "running", nextStatus: "blocked", verificationStatus: "partial", errorClass: "ALEGRA_RECONCILIATION_REQUIRED" })) return null;
      return saved?.id ?? null;
    },
  };
}
