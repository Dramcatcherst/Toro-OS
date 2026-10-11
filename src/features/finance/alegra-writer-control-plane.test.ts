import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { ToroWorkerRun } from "../control-plane/worker-runtime";
import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { createAlegraControlPlaneGate } from "./alegra-writer-control-plane";
import type { AlegraWriterReceipt } from "./alegra-writer-executor";

const intent = prepareAlegraWriteIntent({ scope: { tenantId: "fixture-tenant", orgId: "fixture-org", legalEntityKey: "fixture-entity" }, evidence: { sourceRefs: ["fixture:original"], evidenceHash: "fixture-byte-hash" }, payload: { targetType: "purchase_bill", documentNumber: "fixture-1", issuerTaxId: "fixture-emitter", receiverTaxId: "fixture-receiver", currency: "USD", total: "1.00", accountNativeId: "fixture-account", costCenterNativeId: "fixture-center" } });
const approval = { approvalId: "fixture-approval", actorId: "fixture-owner", approvedAt: "2026-10-11T00:00:00Z", state: "approved" as const, payloadHash: intent.payloadHash };
const run = { id: "fixture-run", orgId: "fixture-org", taskId: "fixture-task", decisionId: "fixture-decision", runKey: "fixture-run-key", idempotencyKey: intent.idempotencyKey, correlationId: "fixture-correlation", traceId: null, actorKind: "human", actorRef: "fixture-owner", dotRef: null, agentRef: null, actionKey: intent.action, targetSystem: "alegra", executionAuthorityLevel: "L3", businessRisk: "High", status: "claimed", verificationStatus: "pending", attemptCount: 1, maxAttempts: 1, leaseOwner: "fixture-worker", fencingToken: 1, leaseExpiresAt: "2026-10-11T01:00:00Z" } satisfies ToroWorkerRun;
const receipt: AlegraWriterReceipt = { version: "TORO-ALEGRA-WRITER-RECEIPT-v1", idempotencyKey: intent.idempotencyKey, payloadHash: intent.payloadHash, approvalId: approval.approvalId, actorId: approval.actorId, nativeId: "fixture-bill", executionState: "provider_created", verificationState: "VERIFIED", verified: true, reasons: [], createdAt: "2026-10-11T00:30:00Z" };

function fixture(onBoundary: (name: string) => void = () => {}) {
  let status = "claimed";
  const records: Array<Record<string, unknown>> = [];
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const client = {
    async rpc(name: string, args: Record<string, unknown>) {
      onBoundary(name);
      calls.push({ name, args });
      if (name === "toro_renew_execution_lease_v1") return { data: true, error: null };
      if (name === "toro_transition_execution_run_v1") {
        if (status !== args.p_expected_status) return { data: false, error: null };
        status = String(args.p_next_status); return { data: true, error: null };
      }
      if (name === "toro_complete_execution_run_v1") { records.push(args.p_receipt as Record<string, unknown>); return { data: "fixture-verified-receipt", error: null }; }
      throw new Error("unexpected fixture RPC");
    },
    from(table: string) {
      if (table !== "toro_execution_receipts") throw new Error("unexpected fixture table");
      return { insert(row: Record<string, unknown>) { onBoundary("marker"); records.push(row); return { select() { return { async single() { return { data: { id: "fixture-prepared-receipt" }, error: null }; } }; } }; } };
    },
  } as unknown as SupabaseClient;
  return { client, calls, records };
}

describe("Alegra existing Control Plane binding", () => {
  it.each(["authorization", "toro_renew_execution_lease_v1", "toro_transition_execution_run_v1", "marker"])("binds authorization to the original actor and content across %s", async (boundary) => {
    const changedIntent = structuredClone(intent);
    const changedApproval = { ...approval };
    const mutate = (name: string) => { if (name === boundary) { changedApproval.actorId = "other-actor"; changedApproval.approvalId = "other-approval"; changedIntent.payload.total = "999.00"; } };
    const store = fixture(mutate);
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async (captured) => {
      expect(Object.isFrozen(captured.approval)).toBe(true);
      expect(Object.isFrozen(captured.intent.payload)).toBe(true);
      mutate("authorization"); return true;
    } });
    expect(await gate.beforeDispatch({ intent: changedIntent, approval: changedApproval })).toBe(true);
    expect(store.records[0].desired_state).toEqual({ payloadHash: intent.payloadHash, approvalId: approval.approvalId, actorId: approval.actorId });
    expect(await gate.persistReceipt({ ...receipt, actorId: "other-actor" })).toBeNull();
    expect(await gate.persistReceipt(receipt)).toBe("fixture-verified-receipt");
  });
  it("persists admission and completes through the canonical fenced run", async () => {
    const store = fixture();
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    expect(await gate.beforeDispatch({ intent, approval })).toBe(true);
    expect(await gate.persistReceipt(receipt)).toBe("fixture-verified-receipt");
    expect(store.records[0]).toMatchObject({ org_id: "fixture-org", run_id: "fixture-run", idempotency_key: intent.idempotencyKey, status: "prepared" });
    expect(store.calls.map(c => c.name)).toEqual(["toro_renew_execution_lease_v1", "toro_transition_execution_run_v1", "toro_transition_execution_run_v1", "toro_complete_execution_run_v1"]);
  });

  it("admits only one concurrent dispatch for the same claimed run", async () => {
    const store = fixture();
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => true });
    expect(await Promise.all([gate.beforeDispatch({ intent, approval }), gate.beforeDispatch({ intent, approval })])).toEqual([true, false]);
  });

  it.each(["authorization", "org", "lease", "authority", "key"])("blocks %s mismatch before an execution record", async (problem) => {
    const store = fixture();
    const candidate = { ...run, ...(problem === "org" ? { orgId: "other" } : {}), ...(problem === "lease" ? { leaseExpiresAt: "2026-10-10T00:00:00Z" } : {}), ...(problem === "authority" ? { executionAuthorityLevel: "L2" as const } : {}), ...(problem === "key" ? { idempotencyKey: "other" } : {}) };
    const gate = createAlegraControlPlaneGate({ supabase: store.client, run: candidate, workerId: "fixture-worker", now: () => "2026-10-11T00:30:00Z", authorize: async () => problem !== "authorization" });
    expect(await gate.beforeDispatch({ intent, approval })).toBe(false);
    expect(store.records).toHaveLength(0);
  });
});
