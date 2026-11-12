import { describe, expect, it, vi } from "vitest";
import { createAlegraWriterRpcClient } from "@/lib/supabase/alegra-writer-rpc";
import { createManualAlegraPurchaseCaller, type AlegraCallerContext } from "./alegra-writer-control-plane";
import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { evaluateAlegraDuplicatePreflight } from "./alegra-writer-dedupe";

function fixture() {
  const scope = { tenantId: "fixture-tenant", orgId: "fixture-org", legalEntityKey: "fixture-entity" };
  const intent = prepareAlegraWriteIntent({ scope, evidence: { sourceRefs: ["fixture:original"], evidenceHash: "fixture-source-hash" }, payload: {
    targetType: "purchase_bill", documentNumber: "fixture-bill", supplierNativeId: "42", issuerTaxId: "fixture-issuer", receiverTaxId: "fixture-receiver",
    issueDate: "2026-10-23", dueDate: "2026-10-30", currency: "CRC", subtotal: "100.00", tax: "13.00", total: "113.00",
    accountNativeId: "51", costCenterNativeId: "7", purchaseTax: { nativeId: "3", percentage: "13" },
  } });
  const context: AlegraCallerContext = {
    flags: { writerEnabled: true, nativeMutationEnabled: true, recoveryEnabled: true },
    run: { id: "fixture-run", orgId: scope.orgId, taskId: "fixture-task", decisionId: "fixture-decision", runKey: "fixture-key", idempotencyKey: intent.idempotencyKey,
      correlationId: "fixture-correlation", traceId: null, actorKind: "human", actorRef: "fixture-human", dotRef: null, agentRef: null,
      actionKey: "alegra_create_purchase_bill", targetSystem: "alegra", executionAuthorityLevel: "L3", businessRisk: "High", status: "queued", verificationStatus: "pending",
      attemptCount: 0, maxAttempts: 1, leaseOwner: null, fencingToken: 0, leaseExpiresAt: null },
    intent, approval: { approvalId: "fixture-approval", approvalReceiptId: "fixture-human-receipt", actorId: "fixture-human", decisionId: "fixture-decision",
      decisionRevision: "2026-10-23T23:35:00Z", approvedAt: "2026-10-23T23:35:00Z", expiresAt: "2026-10-23T23:50:00Z", payloadHash: intent.payloadHash, state: "approved" },
    duplicateDecision: evaluateAlegraDuplicatePreflight({ intent, candidates: [], now: "2026-10-23T23:35:00Z", maxAgeMs: 60_000,
      sourceStates: ["toro", "alegra", "receipt"].map(source => ({ source: source as "toro" | "alegra" | "receipt", coverage: "complete" as const, checkedAt: "2026-10-23T23:35:00Z" })) }),
    binding: { scope, receiverTaxId: "fixture-receiver", mainCurrency: "CRC", applicationVersion: "costaRica" },
    preparedReceipt: null,
  };
  const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const rpc = createAlegraWriterRpcClient({ authenticatedRpc: async (name, args) => {
    rpcCalls.push({ name, args });
    if (name === "toro_admit_approved_alegra_execution_v1") return { data: { runId: "fixture-run", fencingToken: 1, preparedReceiptId: "fixture-prepared", leaseExpiresAt: "2026-10-23T23:37:00Z" }, error: null };
    if (name === "toro_heartbeat_alegra_execution_v1") return { data: { runId: "fixture-run", fencingToken: 1, preparedReceiptId: "fixture-prepared", leaseExpiresAt: "2026-10-23T23:36:00Z" }, error: null };
    if (name === "toro_finalize_alegra_execution_v1") return { data: { runId: "fixture-run", finalReceiptId: "fixture-final", runStatus: args.p_outcome === "verified" ? "succeeded" : "blocked", verificationStatus: args.p_outcome === "verified" ? "passed" : "partial", replayed: false }, error: null };
    return { data: { runId: "fixture-run", finalReceiptId: "fixture-unknown", fencingToken: 2, runStatus: "blocked", verificationStatus: "partial", providerState: "PROVIDER_STATE_UNKNOWN", replayed: false }, error: null };
  } });
  const requests: Array<{ method: string; path: string; body?: unknown }> = [];
  const http = { async request(request: { method: "GET" | "POST"; path: string; body?: unknown }) {
    requests.push(request);
    if (request.path === "/company") return { status: 200, data: { identification: "fixture-receiver", currency: { code: "CRC" }, applicationVersion: "costaRica", decimalPrecision: "2" } };
    if (request.path === "/contacts/42") return { status: 200, data: { id: "42", identification: { number: "fixture-issuer" }, type: ["provider"], status: "active" } };
    if (request.path === "/categories/51") return { status: 200, data: { id: "51", type: "expense", status: "active" } };
    if (request.path === "/cost-centers/7") return { status: 200, data: { id: "7", status: "active" } };
    if (request.path === "/taxes/3") return { status: 200, data: { id: "3", percentage: "13", status: "active" } };
    if (request.path === "/bills" && request.method === "GET") return { status: 200, data: { metadata: { total: 0 }, data: [] } };
    if (request.path === "/bills" && request.method === "POST") return { status: 201, data: { id: "99" } };
    if (request.path === "/bills/99") return { status: 200, data: { id: "99", date: "2026-10-23", dueDate: "2026-10-30", provider: { id: "42" }, numberTemplate: { number: "fixture-bill" }, observations: intent.idempotencyKey,
      status: "open", total: 113, totalPaid: 0, balance: 113, retentions: [], payments: [], currency: { code: "CRC" }, costCenter: { id: "7" },
      purchases: { items: [], categories: [{ id: "51", price: 100, quantity: 1, discount: 0, tax: [{ id: "3", percentage: "13" }] }] } } };
    throw new Error("Unexpected fixture request");
  } };
  const options = { target: { orgId: scope.orgId, runId: "fixture-run", payloadHash: intent.payloadHash }, workerId: "fixture-worker", recoveryWorkerId: "fixture-recovery", supabase: rpc,
    now: () => "2026-10-23T23:35:22Z", http, readCanonicalContext: vi.fn(async () => context), authorizeAdmission: vi.fn(async () => true), authorizeNativeCreate: vi.fn(async () => true) };
  return { context, options, rpcCalls, requests };
}

describe("manual Alegra exact-target caller", () => {
  it.each([undefined, {}, { writerEnabled: true }, { nativeMutationEnabled: true }, { writerEnabled: "true", nativeMutationEnabled: true }])("treats missing or invalid dispatch flags as OFF", async flags => {
    const f = fixture(); f.context.flags = flags as never;
    expect(await createManualAlegraPurchaseCaller(f.options).dispatch()).toMatchObject({ state: "blocked" });
    expect(f.rpcCalls).toHaveLength(0); expect(f.requests).toHaveLength(0);
  });
  it("composes admission, two heartbeats, exactly one create, native readback and durable finalization", async () => {
    const f = fixture();
    expect(await createManualAlegraPurchaseCaller(f.options).dispatch()).toMatchObject({ state: "dispatch_result", result: { ok: true, receipt: { verified: true, durableReceiptId: "fixture-final" } } });
    expect(f.rpcCalls.map(c => c.name)).toEqual(["toro_admit_approved_alegra_execution_v1", "toro_heartbeat_alegra_execution_v1", "toro_heartbeat_alegra_execution_v1", "toro_finalize_alegra_execution_v1"]);
    expect(f.requests.filter(r => r.method === "POST")).toHaveLength(1);
    expect(f.requests.some(r => r.path === "/bills/99")).toBe(true);
  });
  it.each(["org", "run", "hash", "decision", "binding"])("rejects crossed canonical %s before any IO", async problem => {
    const f = fixture();
    if (problem === "org") f.context.run.orgId = "wrong";
    if (problem === "run") f.context.run.id = "wrong";
    if (problem === "hash") f.context.intent.payloadHash = "b".repeat(64);
    if (problem === "decision") f.context.run.decisionId = "wrong";
    if (problem === "binding") f.context.binding.scope.orgId = "wrong";
    expect(await createManualAlegraPurchaseCaller(f.options).dispatch()).toMatchObject({ state: "blocked" });
    expect(f.rpcCalls).toHaveLength(0); expect(f.requests).toHaveLength(0);
  });
  it("reloads flags at admission and blocks revocation after initial load", async () => {
    const f = fixture(); let reads = 0;
    f.options.readCanonicalContext = vi.fn(async () => { if (++reads === 2) f.context.flags!.writerEnabled = false; return f.context; });
    expect(await createManualAlegraPurchaseCaller(f.options).dispatch()).toMatchObject({ state: "dispatch_result", result: { ok: false } });
    expect(reads).toBeGreaterThanOrEqual(2); expect(f.rpcCalls).toHaveLength(0); expect(f.requests).toHaveLength(0);
  });
  it("reloads native authority and never posts after revocation during preflight", async () => {
    const f = fixture();
    f.options.authorizeNativeCreate = vi.fn(async () => { f.context.flags!.nativeMutationEnabled = false; return true; });
    await createManualAlegraPurchaseCaller(f.options).dispatch();
    expect(f.options.authorizeNativeCreate).toHaveBeenCalledTimes(1); expect(f.requests.filter(r => r.method === "POST")).toHaveLength(0);
  });
  it("blocks a newly observed canonical duplicate at the final authorization boundary", async () => {
    const f = fixture();
    f.options.authorizeNativeCreate = vi.fn(async () => { f.context.duplicateDecision.clear = false; return true; });
    await createManualAlegraPurchaseCaller(f.options).dispatch();
    expect(f.requests.filter(r => r.method === "POST")).toHaveLength(0);
  });
  it("blocks admission when its awaited authorizer revokes the Writer", async () => {
    const f = fixture();
    f.options.authorizeAdmission = vi.fn(async () => { f.context.flags!.writerEnabled = false; return true; });
    await createManualAlegraPurchaseCaller(f.options).dispatch();
    expect(f.rpcCalls).toHaveLength(0); expect(f.requests).toHaveLength(0);
  });
  it.each(["revoked", "expired"])("checks canonical authority after the last heartbeat: %s", async problem => {
    const f = fixture(); let heartbeats = 0; let clock = "2026-10-23T23:35:22Z";
    f.options.now = () => clock;
    if (problem === "expired") Object.assign(f.context.approval, { approvedAt: "2026-10-23T23:20:25Z", decisionRevision: "2026-10-23T23:20:25Z", expiresAt: "2026-10-23T23:35:25Z" });
    const original = f.options.supabase;
    f.options.supabase = createAlegraWriterRpcClient({ authenticatedRpc: async (name, args) => {
      const result = await original.rpc(name, args);
      if (name === "toro_heartbeat_alegra_execution_v1" && ++heartbeats === 2) {
        if (problem === "revoked") f.context.flags!.nativeMutationEnabled = false;
        else clock = "2026-10-23T23:35:25Z";
      }
      return result;
    } });
    await createManualAlegraPurchaseCaller(f.options).dispatch();
    expect(heartbeats).toBe(2); expect(f.requests.filter(r => r.method === "POST")).toHaveLength(0);
  });
  it.each(["admission", "native"])("preserves the independent %s authorizer denial", async boundary => {
    const f = fixture();
    if (boundary === "admission") f.options.authorizeAdmission = vi.fn(async () => false);
    else f.options.authorizeNativeCreate = vi.fn(async () => false);
    expect(await createManualAlegraPurchaseCaller(f.options).dispatch()).toMatchObject({ state: "dispatch_result", result: { ok: false } });
    expect(f.requests.filter(r => r.method === "POST")).toHaveLength(0);
  });
  it("captures host target and worker identities before any asynchronous work", async () => {
    const f = fixture(); const caller = createManualAlegraPurchaseCaller(f.options);
    f.options.target.orgId = "replacement"; f.options.workerId = "replacement";
    expect(await caller.dispatch()).toMatchObject({ state: "dispatch_result", result: { ok: true } });
    expect(f.rpcCalls[0].args.p_worker_id).toBe("fixture-worker");
  });
  it("allows at most one dispatch even when called concurrently", async () => {
    const f = fixture(); const caller = createManualAlegraPurchaseCaller(f.options);
    const results = await Promise.all([caller.dispatch(), caller.dispatch()]);
    expect(results.filter(r => r.state === "blocked")).toHaveLength(1);
    expect(f.requests.filter(r => r.method === "POST")).toHaveLength(1);
  });
  it("sanitizes canonical loading failure without RPC or provider traffic", async () => {
    const f = fixture(); f.options.readCanonicalContext = vi.fn(async () => { throw new Error("fixture-secret"); });
    expect(await createManualAlegraPurchaseCaller(f.options).dispatch()).toEqual({ state: "blocked", reason: "CONTEXT_UNAVAILABLE" });
    expect(f.rpcCalls).toHaveLength(0); expect(f.requests).toHaveLength(0);
  });
  it("recovers only the exact expired prepared marker with its independent gate, even while dispatch is OFF", async () => {
    const f = fixture(); f.context.flags = { recoveryEnabled: true }; Object.assign(f.context.run, { status: "running", attemptCount: 1, fencingToken: 1, leaseOwner: "fixture-worker", leaseExpiresAt: "2026-10-23T23:34:00Z" });
    f.context.preparedReceipt = { id: "fixture-prepared", orgId: "fixture-org", runId: "fixture-run", payloadHash: f.context.intent.payloadHash };
    expect(await createManualAlegraPurchaseCaller(f.options).recover()).toMatchObject({ state: "recovery_result", result: { providerState: "PROVIDER_STATE_UNKNOWN" } });
    expect(f.rpcCalls).toEqual([{ name: "toro_recover_expired_alegra_execution_v1", args: { p_org_id: "fixture-org", p_run_id: "fixture-run", p_recovery_worker_id: "fixture-recovery", p_expected_fencing_token: 1, p_prepared_receipt_id: "fixture-prepared" } }]);
    expect(f.requests).toHaveLength(0);
  });
  it.each(["disabled", "wrong-marker", "unexpired"])("blocks unsafe recovery: %s", async problem => {
    const f = fixture(); Object.assign(f.context.run, { status: "running", attemptCount: 1, fencingToken: 1, leaseOwner: "fixture-worker", leaseExpiresAt: "2026-10-23T23:34:00Z" });
    f.context.preparedReceipt = { id: "fixture-prepared", orgId: "fixture-org", runId: "fixture-run", payloadHash: f.context.intent.payloadHash };
    if (problem === "disabled") f.context.flags = {};
    if (problem === "wrong-marker") f.context.preparedReceipt.runId = "wrong";
    if (problem === "unexpired") f.context.run.leaseExpiresAt = "2026-10-23T23:36:00Z";
    expect(await createManualAlegraPurchaseCaller(f.options).recover()).toMatchObject({ state: "blocked" });
    expect(f.rpcCalls).toHaveLength(0); expect(f.requests).toHaveLength(0);
  });
  it("sanitizes a failed recovery clock before any RPC", async () => {
    const f = fixture(); Object.assign(f.context.run, { status: "running", attemptCount: 1, fencingToken: 1, leaseOwner: "fixture-worker", leaseExpiresAt: "2026-10-23T23:34:00Z" });
    f.context.preparedReceipt = { id: "fixture-prepared", orgId: "fixture-org", runId: "fixture-run", payloadHash: f.context.intent.payloadHash };
    f.options.now = () => { throw new Error("fixture-secret-clock"); };
    expect(await createManualAlegraPurchaseCaller(f.options).recover()).toEqual({ state: "blocked", reason: "RECOVERY_CONTEXT_INVALID" });
    expect(f.rpcCalls).toHaveLength(0);
  });
});
