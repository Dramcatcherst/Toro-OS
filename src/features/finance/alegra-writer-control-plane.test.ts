import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { ToroWorkerRun } from "../control-plane/worker-runtime";
import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { evaluateAlegraDuplicatePreflight } from "./alegra-writer-dedupe";
import { createAlegraControlPlaneGate, recoverExpiredAlegraLease } from "./alegra-writer-control-plane";
import { executeApprovedAlegraIntent, type AlegraWriterReceipt } from "./alegra-writer-executor";

const intent = prepareAlegraWriteIntent({ scope: { tenantId: "fixture-tenant", orgId: "fixture-org", legalEntityKey: "fixture-entity" }, evidence: { sourceRefs: ["fixture:original"], evidenceHash: "fixture-byte-hash" }, payload: { targetType: "purchase_bill", documentNumber: "fixture-1", issuerTaxId: "fixture-emitter", receiverTaxId: "fixture-receiver", issueDate: "2026-10-11", dueDate: "2026-10-21", currency: "USD", total: "1.00", accountNativeId: "fixture-account", costCenterNativeId: "fixture-center" } });
const approval = { approvalId: "fixture-approval", approvalReceiptId: "fixture-approval-receipt", actorId: "fixture-owner", approvedAt: "2026-10-11T00:30:00Z", expiresAt: "2026-10-11T00:45:00Z", decisionId: "fixture-decision", decisionRevision: "2026-10-11T00:30:00Z", state: "approved" as const, payloadHash: intent.payloadHash };
const run = { id: "fixture-run", orgId: "fixture-org", taskId: "fixture-task", decisionId: "fixture-decision", runKey: "fixture-run-key", idempotencyKey: intent.idempotencyKey, correlationId: "fixture-correlation", traceId: null, actorKind: "human", actorRef: "fixture-owner", dotRef: null, agentRef: null, actionKey: intent.action, targetSystem: "alegra", executionAuthorityLevel: "L3", businessRisk: "High", status: "queued", verificationStatus: "pending", attemptCount: 0, maxAttempts: 1, leaseOwner: null, fencingToken: 0, leaseExpiresAt: null } satisfies ToroWorkerRun;
const receipt: AlegraWriterReceipt = { version: "TORO-ALEGRA-WRITER-RECEIPT-v1", idempotencyKey: intent.idempotencyKey, payloadHash: intent.payloadHash, approvalId: approval.approvalId, actorId: approval.actorId, nativeId: "fixture-bill", executionState: "provider_created", verificationState: "VERIFIED", verified: true, reasons: [], createdAt: "2026-10-11T00:30:00Z" };
const clearDuplicates = evaluateAlegraDuplicatePreflight({
  intent,
  candidates: [],
  now: "2026-10-11T00:30:00Z",
  maxAgeMs: 60_000,
  sourceStates: [
    { source: "toro", coverage: "complete", checkedAt: "2026-10-11T00:30:00Z" },
    { source: "alegra", coverage: "complete", checkedAt: "2026-10-11T00:30:00Z" },
    { source: "receipt", coverage: "complete", checkedAt: "2026-10-11T00:30:00Z" },
  ],
});

function fixture(input: { onBoundary?: (name: string) => void; admit?: boolean; heartbeat?: boolean; finalizeFromVerifying?: boolean } = {}) {
  let status = "queued";
  const records: Array<Record<string, unknown>> = [];
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const finalReceiptIds = new Map<string, string>();
  const client = {
    async rpc(name: string, args: Record<string, unknown>) {
      input.onBoundary?.(name);
      calls.push({ name, args });
      if (name === "toro_admit_approved_alegra_execution_v1") {
        if (input.admit === false || status !== "queued") return { data: null, error: null };
        status = "running";
        records.push({ org_id: args.p_org_id, run_id: args.p_run_id, idempotency_key: intent.idempotencyKey, status: "prepared", evidence_refs: ["approval:locked-source", "toro-execution-receipt:fixture-approval-receipt"], desired_state: { payloadHash: args.p_payload_hash, approvalId: args.p_approval_id, actorId: args.p_approval_actor_id, decisionRevision: args.p_decision_revision } });
        return { data: { runId: args.p_run_id, fencingToken: 1, leaseExpiresAt: "2026-10-11T01:00:00Z", preparedReceiptId: "fixture-prepared-receipt" }, error: null };
      }
      if (name === "toro_heartbeat_alegra_execution_v1") {
        if (input.heartbeat === false || status !== "running" ||
            args.p_run_id !== "fixture-run" || args.p_worker_id !== "fixture-worker" ||
            args.p_fencing_token !== 1 || args.p_prepared_receipt_id !== "fixture-prepared-receipt")
          return { data: null, error: null };
        return { data: { runId: "fixture-run", fencingToken: 1,
          leaseExpiresAt: "2026-10-11T00:32:00Z",
          preparedReceiptId: "fixture-prepared-receipt" }, error: null };
      }
      if (name === "toro_finalize_alegra_execution_v1") {
        if (input.finalizeFromVerifying && status === "running") status = "verifying";
        const outcome = String(args.p_outcome);
        const envelope = args.p_receipt as { observed_after?: unknown };
        if (!envelope.observed_after || typeof envelope.observed_after !== "object") return { data: null, error: null };
        const workerEvidence = (args.p_receipt as { evidence_refs?: unknown }).evidence_refs;
        if (!Array.isArray(workerEvidence) || !workerEvidence.every(ref => typeof ref === "string" && ref.length > 0)) return { data: null, error: null };
        const observed = envelope.observed_after as Record<string, unknown>;
        const reasons = observed.reasons;
        const nativeId = observed.nativeId;
        const hasNativeId = typeof nativeId === "string" && nativeId.length > 0;
        const hasValidReasons = Array.isArray(reasons) && reasons.length > 0 && reasons.every(reason => typeof reason === "string" && reason.length > 0);
        const validVerified = outcome === "verified" && observed.verified === true && observed.verificationState === "VERIFIED" &&
          (observed.executionState === "provider_created" || observed.executionState === "provider_ambiguous_recovered") &&
          Array.isArray(reasons) && reasons.length === 0 && hasNativeId;
        const validReconciliation = outcome === "reconciliation_required" && observed.verified === false && hasValidReasons && (
          (observed.verificationState === "READBACK_MISMATCH" &&
            (observed.executionState === "provider_created" || observed.executionState === "provider_ambiguous_recovered") && hasNativeId) ||
          (observed.verificationState === "PROVIDER_STATE_UNKNOWN" && (
            observed.executionState === "blocked" ||
            ((observed.executionState === "provider_created" || observed.executionState === "provider_ambiguous_recovered") && hasNativeId)
          )) ||
          (observed.verificationState === "NOT_ATTEMPTED" &&
            (observed.executionState === "blocked" || observed.executionState === "failed") && nativeId === null)
        );
        if (!validVerified && !validReconciliation) return { data: null, error: null };
        const runStatus = outcome === "verified" ? "succeeded" : "blocked";
        const verificationStatus = outcome === "verified" ? "passed" : "partial";
        const key = `${intent.idempotencyKey}:${outcome === "verified" ? "verification" : "reconciliation"}`;
        const existingId = finalReceiptIds.get(key);
        if (existingId && status === runStatus) return { data: { runId: args.p_run_id, finalReceiptId: existingId, runStatus, verificationStatus, replayed: true }, error: null };
        if (!(["running", "verifying"] as string[]).includes(status) || args.p_prepared_receipt_id !== "fixture-prepared-receipt") return { data: null, error: null };
        const finalReceiptId = outcome === "verified" ? "fixture-verified-receipt" : "fixture-reconciliation-receipt";
        finalReceiptIds.set(key, finalReceiptId);
        status = runStatus;
        const preparedEvidence = records[0].evidence_refs as string[];
        const finalEvidence = [...new Set([...preparedEvidence, ...workerEvidence, `toro-execution-receipt:${String(args.p_prepared_receipt_id)}`])].sort();
        records.push({ idempotency_key: key, status: outcome === "verified" ? "verified" : "blocked", supersedes_receipt_id: args.p_prepared_receipt_id, evidence_refs: finalEvidence, observed_after: (args.p_receipt as Record<string, unknown>).observed_after });
        return { data: { runId: args.p_run_id, finalReceiptId, runStatus, verificationStatus, replayed: false }, error: null };
      }
      throw new Error("unexpected fixture RPC");
    },
  } as unknown as SupabaseClient;
  return { client, calls, records, status: () => status };
}

describe("Alegra atomic L3 Control Plane admission", () => {
  it.each(["authorization", "toro_admit_approved_alegra_execution_v1"])("binds authorization to the original actor and content across %s", async (boundary) => {
    const changedIntent = structuredClone(intent);
    const changedApproval = { ...approval };
    const mutate = (name: string) => { if (name === boundary) { changedApproval.actorId = "other-actor"; changedApproval.approvalId = "other-approval"; changedApproval.approvalReceiptId = "other-receipt"; changedApproval.decisionRevision = "other-revision"; changedIntent.payload.total = "999.00"; } };
    const store = fixture({ onBoundary: mutate });
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async (captured) => {
      expect(Object.isFrozen(captured.approval)).toBe(true);
      expect(Object.isFrozen(captured.intent.payload)).toBe(true);
      mutate("authorization"); return true;
    } });
    expect(await gate.beforeDispatch({ intent: changedIntent, approval: changedApproval })).toBe(true);
    expect(store.calls[0].args).toMatchObject({
      p_approval_receipt_id: approval.approvalReceiptId,
      p_approval_approved_at: approval.approvedAt,
      p_decision_revision: approval.decisionRevision,
    });
    expect(store.records[0].desired_state).toEqual({ payloadHash: intent.payloadHash, approvalId: approval.approvalId, actorId: approval.actorId, decisionRevision: approval.decisionRevision });
    expect(await gate.persistReceipt({ ...receipt, actorId: "other-actor" })).toBeNull();
    expect(await gate.persistReceipt(receipt)).toBe("fixture-verified-receipt");
  });

  it.each(["exact", "upper-and-spaced"] as const)(
    "rejects a dispatch worker that reuses the human signer identity (%s) before the admission RPC",
    async alias => {
      const store = fixture();
      const workerId = alias === "exact" ? approval.actorId : "  " + approval.actorId.toUpperCase() + "  ";
      const authorize = vi.fn(async () => true);
      const gate = createAlegraControlPlaneGate({
        supabase: store.client, run, workerId,
        now: () => "2026-10-11T00:30:00Z", authorize,
      });
      expect(await gate.beforeDispatch({ intent, approval })).toBe(false);
      expect(store.calls).toHaveLength(0);
      expect(store.records).toHaveLength(0);
      expect(authorize).not.toHaveBeenCalled();
    },
  );

  it("admits and marks the run in one RPC before provider dispatch", async () => {
    const store = fixture();
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    expect(await gate.beforeDispatch({ intent, approval })).toBe(true);
    expect(await gate.persistReceipt(receipt)).toBe("fixture-verified-receipt");
    expect(store.records[0]).toMatchObject({ org_id: "fixture-org", run_id: "fixture-run", idempotency_key: intent.idempotencyKey, status: "prepared" });
    expect(store.calls.map(c => c.name)).toEqual(["toro_admit_approved_alegra_execution_v1", "toro_finalize_alegra_execution_v1"]);
    expect(store.records[1]).toMatchObject({ supersedes_receipt_id: "fixture-prepared-receipt", status: "verified" });
    expect(store.records[1].evidence_refs).toEqual([
      "approval:locked-source",
      "fixture:original",
      "toro-execution-receipt:fixture-approval-receipt",
      "toro-execution-receipt:fixture-prepared-receipt",
    ]);
    expect(store.status()).toBe("succeeded");
  });

  it("blocks when approval is revoked before the atomic dispatch boundary", async () => {
    const store = fixture({ admit: false });
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    expect(await gate.beforeDispatch({ intent, approval })).toBe(false);
    expect(store.records).toHaveLength(0);
  });

  it("admits only one concurrent dispatch for the same queued run", async () => {
    const store = fixture();
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    expect(await Promise.all([gate.beforeDispatch({ intent, approval }), gate.beforeDispatch({ intent, approval })])).toEqual([true, false]);
  });

  it.each(["authorization", "org", "attempts", "authority", "key", "evidence"])("blocks %s mismatch before an execution record", async (problem) => {
    const store = fixture();
    const candidate = { ...run, ...(problem === "org" ? { orgId: "other" } : {}), ...(problem === "attempts" ? { maxAttempts: 2 } : {}), ...(problem === "authority" ? { executionAuthorityLevel: "L2" as const } : {}), ...(problem === "key" ? { idempotencyKey: "other" } : {}) };
    const candidateApproval = problem === "evidence" ? { ...approval, approvalReceiptId: "" } : approval;
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run: candidate, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => problem !== "authorization" });
    expect(await gate.beforeDispatch({ intent, approval: candidateApproval })).toBe(false);
    expect(store.records).toHaveLength(0);
  });

  it("uses a distinct idempotency key for a reconciliation receipt", async () => {
    const store = fixture();
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    expect(await gate.beforeDispatch({ intent, approval })).toBe(true);
    const result = await gate.persistReceipt({ ...receipt, nativeId: null, executionState: "blocked", verified: false, verificationState: "PROVIDER_STATE_UNKNOWN", reasons: ["PROVIDER_AMBIGUOUS_LOOKUP_UNAVAILABLE"] });
    expect(result).toBe("fixture-reconciliation-receipt");
    expect(store.records[1]).toMatchObject({ idempotency_key: `${intent.idempotencyKey}:reconciliation`, status: "blocked", supersedes_receipt_id: "fixture-prepared-receipt" });
    expect(store.status()).toBe("blocked");
  });

  it("durably blocks a created provider effect when native readback is unavailable", async () => {
    const store = fixture();
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    const result = await executeApprovedAlegraIntent({
      intent,
      approval,
      duplicateDecision: clearDuplicates,
      writerEnabled: true,
      gate,
      now: "2026-10-11T00:30:00Z",
      transport: {
        create: async () => ({ state: "created", nativeId: "fixture-bill" }),
        findByIdempotencyKey: async () => ({ state: "not_found" }),
        readback: async () => { throw new Error("fixture readback unavailable"); },
      },
    });

    expect(result).toMatchObject({
      ok: false,
      executedProviderMutation: true,
      receipt: {
        nativeId: "fixture-bill",
        executionState: "provider_created",
        verificationState: "PROVIDER_STATE_UNKNOWN",
        reasons: ["READBACK_UNAVAILABLE"],
        durableReceiptId: "fixture-reconciliation-receipt",
      },
    });
    expect(store.status()).toBe("blocked");
    expect(store.records[1]).toMatchObject({ status: "blocked", supersedes_receipt_id: "fixture-prepared-receipt" });
  });

  it.each([
    { verificationState: "PROVIDER_STATE_UNKNOWN" as const, executionState: "provider_created" as const, nativeId: "fixture-bill", reasons: [] },
    { verificationState: "PROVIDER_STATE_UNKNOWN" as const, executionState: "blocked" as const, nativeId: null, reasons: [] },
    { verificationState: "READBACK_MISMATCH" as const, executionState: "blocked" as const, nativeId: "fixture-bill", reasons: ["READBACK_TOTAL"] },
    { verificationState: "NOT_ATTEMPTED" as const, executionState: "blocked" as const, nativeId: "fixture-bill", reasons: ["BLOCKED"] },
  ])("fails closed on an incoherent reconciliation envelope %#", async (invalid) => {
    const store = fixture();
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    expect(await gate.beforeDispatch({ intent, approval })).toBe(true);
    expect(await gate.persistReceipt({ ...receipt, ...invalid, verified: false })).toBeNull();
    expect(store.status()).toBe("running");
    expect(store.records).toHaveLength(1);
  });

  it("recovers finalization from verifying and replays the same unique receipt", async () => {
    const store = fixture({ finalizeFromVerifying: true });
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    expect(await gate.beforeDispatch({ intent, approval })).toBe(true);
    expect(await gate.persistReceipt(receipt)).toBe("fixture-verified-receipt");
    expect(await gate.persistReceipt({ ...receipt, createdAt: "2026-10-11T00:31:00Z" })).toBe("fixture-verified-receipt");
    expect(store.records.filter(row => row.status === "verified")).toHaveLength(1);
    expect(store.calls.filter(call => call.name === "toro_finalize_alegra_execution_v1")).toHaveLength(2);
  });

  it("blocks provider POST if live L3 heartbeat rejects its exact fenced run", async () => {
    const store = fixture({ heartbeat: false });
    const gate = createAlegraControlPlaneGate({
      supabase: store.client, run, workerId: "fixture-worker",
      now: () => "2026-10-11T00:30:00Z", authorize: async () => true,
    });
    let providerPosts = 0;
    const result = await executeApprovedAlegraIntent({
      intent, approval, duplicateDecision: clearDuplicates, writerEnabled: true,
      gate, now: "2026-10-11T00:30:00Z",
      transport: {
        create: async () => { providerPosts++; return { state: "created", nativeId: "fixture-bill" }; },
        findByIdempotencyKey: async () => ({ state: "not_found" }),
        readback: async () => { throw new Error("must not reach readback"); },
      },
    });
    expect(providerPosts).toBe(0);
    expect(result.executedProviderMutation).toBe(false);
    expect(result.receipt.reasons).toContain("EXECUTION_LEASE_UNAVAILABLE");
    expect(result.receipt.durableReceiptId).toBe("fixture-reconciliation-receipt");
    expect(store.status()).toBe("blocked");
    expect(store.calls.map(call => call.name)).toEqual([
      "toro_admit_approved_alegra_execution_v1",
      "toro_heartbeat_alegra_execution_v1",
      "toro_finalize_alegra_execution_v1",
    ]);
  });

});


describe("Alegra server-only expired lease recovery caller", () => {
  const expiredRun = {
    ...run,
    status: "running" as const,
    verificationStatus: "pending" as const,
    attemptCount: 1,
    maxAttempts: 1,
    leaseOwner: "fixture-dispatch-worker",
    fencingToken: 4,
    leaseExpiresAt: "2026-10-11T00:20:00Z",
  } satisfies ToroWorkerRun;
  const parameters = {
    run: expiredRun,
    preparedReceiptId: "fixture-prepared-receipt",
    recoveryWorkerId: "fixture-recovery-worker",
    now: () => "2026-10-11T00:30:00Z",
  };

  it("invokes the existing fenced recovery RPC with the expired run and prepared marker", async () => {
    const rpc = vi.fn(async () => ({
      data: { runId: expiredRun.id, finalReceiptId: "fixture-recovery-receipt",
        fencingToken: 5, runStatus: "blocked", verificationStatus: "partial",
        providerState: "PROVIDER_STATE_UNKNOWN", replayed: false },
      error: null,
    }));
    const result = await recoverExpiredAlegraLease({ ...parameters, supabase: { rpc } as unknown as SupabaseClient });
    expect(result).toMatchObject({
      runId: expiredRun.id, fencingToken: 5, finalReceiptId: "fixture-recovery-receipt",
      providerState: "PROVIDER_STATE_UNKNOWN", runStatus: "blocked",
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("toro_recover_expired_alegra_execution_v1", {
      p_org_id: expiredRun.orgId,
      p_run_id: expiredRun.id,
      p_recovery_worker_id: "fixture-recovery-worker",
      p_expected_fencing_token: 4,
      p_prepared_receipt_id: "fixture-prepared-receipt",
    });
  });

  it("rejects a live lease, invalid clock, or unadmitted run without calling any RPC", async () => {
    const rpc = vi.fn();
    const supabase = { rpc } as unknown as SupabaseClient;
    for (const candidate of [
      { ...parameters, now: () => "2026-10-11T00:10:00Z" },
      { ...parameters, now: () => "not-a-date" },
      { ...parameters, run: { ...expiredRun, status: "queued" as const } },
      { ...parameters, run: { ...expiredRun, fencingToken: 0 } },
      { ...parameters, run: { ...expiredRun, leaseExpiresAt: null } },
      { ...parameters, recoveryWorkerId: expiredRun.actorRef },
      { ...parameters, recoveryWorkerId: "  " + expiredRun.actorRef.toUpperCase() + "  " },
      { ...parameters, preparedReceiptId: "" },
    ]) {
      await expect(recoverExpiredAlegraLease({ ...candidate, supabase })).resolves.toBeNull();
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("requires an exact native recovery receipt and rejects mismatched readback", async () => {
    const rpc = vi.fn(async () => ({
      data: { runId: "a-different-run", finalReceiptId: "fixture-recovery-receipt",
        fencingToken: 5, runStatus: "blocked", verificationStatus: "partial",
        providerState: "PROVIDER_STATE_UNKNOWN", replayed: false },
      error: null,
    }));
    const result = await recoverExpiredAlegraLease({ ...parameters, supabase: { rpc } as unknown as SupabaseClient });
    expect(result).toBeNull();
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("preserves the server-side RPC's idempotent recovery replay without a second provider POST", async () => {
    const rpc = vi.fn(async () => ({
      data: { runId: expiredRun.id, finalReceiptId: "fixture-recovery-receipt",
        fencingToken: 5, runStatus: "blocked", verificationStatus: "partial",
        providerState: "PROVIDER_STATE_UNKNOWN", replayed: true },
      error: null,
    }));
    const result = await recoverExpiredAlegraLease({ ...parameters, supabase: { rpc } as unknown as SupabaseClient });
    expect(result?.replayed).toBe(true);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
