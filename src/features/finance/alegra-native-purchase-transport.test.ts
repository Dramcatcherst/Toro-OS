import { describe, expect, it, vi } from "vitest";
import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { createNativeAlegraPurchaseTransport, prepareNativeAlegraPurchaseBody, type AlegraNativeHttp } from "./alegra-native-purchase-transport";
import { createAlegraNativeHttp } from "./alegra-native-http";
import { executeApprovedAlegraIntent } from "./alegra-writer-executor";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToroWorkerRun } from "../control-plane/worker-runtime";
import { executeGovernedAlegraPurchase } from "./alegra-writer-control-plane";

const scope = { tenantId: "fixture-tenant", orgId: "fixture-org", legalEntityKey: "fixture-entity", propertyId: "fixture-property" };
const binding = { scope, receiverTaxId: "fixture-receiver", mainCurrency: "USD", applicationVersion: "costaRica" };
const now = "2026-10-11T09:00:00Z";
function intent(patch: Record<string, unknown> = {}) {
  return prepareAlegraWriteIntent({ scope, evidence: { sourceRefs: ["fixture:original"], evidenceHash: "fixture-hash" },
    payload: { targetType: "purchase_bill", documentNumber: "fixture-bill", supplierNativeId: "42", issuerTaxId: "fixture-issuer",
      receiverTaxId: "fixture-receiver", issueDate: "2026-10-11", dueDate: "2026-10-21", currency: "USD", subtotal: "100.00",
      tax: "13.00", total: "113.00", accountNativeId: "51", costCenterNativeId: "7", purchaseTax: { nativeId: "3", percentage: "13" }, ...patch } });
}
function nativeBill(prepared = intent()) {
  return { id: "99", date: "2026-10-11", dueDate: "2026-10-21", provider: { id: "42" }, numberTemplate: { number: "fixture-bill" },
    observations: prepared.idempotencyKey, status: "open", total: 113, totalPaid: 0, balance: 113, retentions: [], payments: [],
    costCenter: { id: "7" }, purchases: { items: [], categories: [{ id: "51", price: 100, quantity: 1, discount: 0, tax: [{ id: "3", percentage: "13" }] }] } };
}
type NativeResponse = Awaited<ReturnType<AlegraNativeHttp["request"]>>;
function fixture(override: (request: Parameters<AlegraNativeHttp["request"]>[0]) => NativeResponse | undefined | Promise<NativeResponse | undefined> = () => undefined) {
  const requests: Array<Parameters<AlegraNativeHttp["request"]>[0]> = [];
  const http: AlegraNativeHttp = { async request(request) {
    requests.push(request);
    const alternative = await override(request); if (alternative) return alternative;
    if (request.path === "/company") return { status: 200, data: { identification: "fixture-receiver", currency: { code: "USD" }, applicationVersion: "costaRica", decimalPrecision: "2" } };
    if (request.path === "/contacts/42") return { status: 200, data: { id: "42", identification: { number: "fixture-issuer" }, type: ["provider"], status: "active" } };
    if (request.path === "/categories/51") return { status: 200, data: { id: "51", type: "expense", status: "active" } };
    if (request.path === "/cost-centers/7") return { status: 200, data: { id: "7", status: true } };
    if (request.path === "/taxes/3") return { status: 200, data: { id: "3", percentage: "13", status: "active" } };
    if (request.path === "/bills" && request.method === "GET") return { status: 200, data: { metadata: { total: 0 }, data: [] } };
    if (request.path === "/bills" && request.method === "POST") return { status: 201, data: { id: "99" } };
    if (request.path === "/bills/99") return { status: 200, data: nativeBill() };
    throw new Error("Unexpected synthetic request");
  } };
  const authorize = vi.fn(async () => true);
  const transport = createNativeAlegraPurchaseTransport({ http, binding, now: () => now, mutationEnabled: true, authorizeNativeCreate: authorize });
  return { http, transport, requests, authorize };
}

describe("Native Alegra purchase transport candidate", () => {
  it("serializes a single native request through the supplied secure host client", async () => {
    const wire = vi.fn(async () => new Response('{"id":"99"}', { status: 201, headers: { "Content-Type": "application/json" } }));
    const http = createAlegraNativeHttp({ authenticatedFetch: wire });
    const body = prepareNativeAlegraPurchaseBody(intent(), binding);
    expect(await http.request({ method: "POST", path: "/bills", body })).toEqual({ status: 201, data: { id: "99" } });
    expect(wire).toHaveBeenCalledTimes(1);
    const [url, options] = wire.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.alegra.com/api/v1/bills");
    expect(options.redirect).toBe("error"); expect(options.credentials).toBe("omit");
    expect(JSON.parse(options.body as string)).toEqual(body);
  });
  it.each(["https://other.example/bills", "//other.example/bills", "/bills/../payments", "/payments", "/bills?token=bad"])("rejects unauthorized native routes: %s", async path => {
    const wire = vi.fn();
    await expect(createAlegraNativeHttp({ authenticatedFetch: wire }).request({ method: "POST", path })).rejects.toThrow("NATIVE_HTTP_ROUTE_FORBIDDEN");
    expect(wire).not.toHaveBeenCalled();
  });
  it("does not retry the supplied HTTP client after a network error", async () => {
    const wire = vi.fn(async () => { throw new Error("fixture timeout"); });
    await expect(createAlegraNativeHttp({ authenticatedFetch: wire }).request({ method: "POST", path: "/bills", body: {} })).rejects.toThrow("fixture timeout");
    expect(wire).toHaveBeenCalledTimes(1);
  });
  it("blocks an altered tax mapping against the prior approval hash", async () => {
    const prepared = intent(); const store = fixture();
    prepared.payload.purchaseTax = { nativeId: "4", percentage: "13" };
    expect(await store.transport.create({ intent: prepared, idempotencyKey: prepared.idempotencyKey })).toMatchObject({ state: "blocked", code: "NATIVE_INTENT_INVALID" });
    expect(store.requests).toHaveLength(0);
  });
  it("records a preflight denial without claiming provider dispatch", async () => {
    const store = fixture(); store.authorize.mockResolvedValue(false); const prepared = intent();
    const persist = vi.fn(async () => "fixture-blocked-receipt");
    const result = await executeApprovedAlegraIntent({ intent: prepared, approval: { approvalId: "fixture-approval", approvalReceiptId: "fixture-receipt", actorId: "fixture-owner", approvedAt: now, expiresAt: "2026-10-11T09:15:00Z", decisionId: "fixture-decision", decisionRevision: now, payloadHash: prepared.payloadHash, state: "approved" },
      duplicateDecision: { clear: true, state: "CLEAR", exactMatches: [], probableMatches: [], sourceStates: [], reasons: [] }, transport: store.transport,
      now, writerEnabled: true, gate: { beforeDispatch: async () => true, renewLease: async () => true, persistReceipt: persist } });
    expect(result.executedProviderMutation).toBe(false); expect(result.receipt.durableReceiptId).toBe("fixture-blocked-receipt");
    expect(persist).toHaveBeenCalledTimes(1);
  });
  it("rejects a payment intent with only its derived target changed to purchase", async () => {
    const prepared = intent({ targetType: "outgoing_payment", sourceBillNativeId: "98", paymentMovementRef: "fixture-payment", paymentAccountNativeId: "51" });
    expect(prepared.validation.ready).toBe(true);
    prepared.targetType = "purchase_bill";
    expect(() => prepareNativeAlegraPurchaseBody(prepared, binding)).toThrow("NATIVE_RESOURCE_UNSUPPORTED");
    const store = fixture();
    expect(await store.transport.create({ intent: prepared, idempotencyKey: prepared.idempotencyKey })).toMatchObject({ state: "blocked", code: "NATIVE_RESOURCE_UNSUPPORTED" });
    expect(store.requests).toHaveLength(0);
  });
  it.each(["malformed", "repeated-pages", "repeated-in-page"])("blocks incomplete native identity or unique coverage: %s", async problem => {
    const store = fixture(async request => {
      if (request.path !== "/bills" || request.method !== "GET") return undefined;
      const row = { ...nativeBill(), id: "200", numberTemplate: { number: "fixture-bill-extra" } };
      const data = problem === "malformed" ? [{ numberTemplate: {} }] : problem === "repeated-in-page" ? [row, row] :
        Array.from({ length: 30 }, (_, n) => ({ ...row, id: String(200 + n) }));
      return { status: 200, data: { metadata: { total: problem === "repeated-pages" ? 60 : data.length }, data } };
    });
    const prepared = intent();
    expect(await store.transport.findByIdempotencyKey({ intent: prepared, idempotencyKey: prepared.idempotencyKey })).toMatchObject({ state: "unavailable" });
    expect(await store.transport.create({ intent: prepared, idempotencyKey: prepared.idempotencyKey })).toMatchObject({ state: "blocked", code: "NATIVE_DUPLICATE_OR_COVERAGE_BLOCKED" });
    expect(store.requests.some(r => r.method === "POST")).toBe(false);
  });
  it("checks every filtered page before accepting one unique native marker", async () => {
    const store = fixture(async request => {
      if (request.path !== "/bills") return undefined;
      const data = request.query?.start === "0" ? Array.from({ length: 30 }, (_, n) => ({ ...nativeBill(), id: String(200 + n), numberTemplate: { number: "fixture-bill-extra-" + n } })) : [nativeBill()];
      return { status: 200, data: { metadata: { total: 31 }, data } };
    });
    expect(await store.transport.findByIdempotencyKey({ intent: intent(), idempotencyKey: intent().idempotencyKey })).toEqual({ state: "found", nativeId: "99" });
    expect(store.requests.filter(r => r.path === "/bills").map(r => r.query?.start)).toEqual(["0", "30"]);
  });
  it("builds the documented purchase-category body, never sale items or embedded payments", () => {
    const prepared = intent();
    const body = prepareNativeAlegraPurchaseBody(prepared, binding);
    expect(body).toMatchObject({ date: "2026-10-11", dueDate: "2026-10-21", provider: 42, numberTemplate: { number: "fixture-bill" },
      purchases: { categories: [{ id: 51, price: 100, quantity: 1, tax: [{ id: 3 }] }] }, costCenter: 7 });
    expect(body).not.toHaveProperty("payments"); expect(body).not.toHaveProperty("stamp"); expect(body).not.toHaveProperty("currency");
  });

  it.each([
    ["FOREIGN_CURRENCY_UNSUPPORTED", { currency: "CRC" }],
    ["NATIVE_DATE_INVALID", { issueDate: "2026-02-30" }],
    ["NATIVE_DATE_INVALID", { dueDate: "2026-10-01" }],
    ["NATIVE_ID_INVALID", { supplierNativeId: "../other" }],
    ["NATIVE_TAX_MAPPING_REQUIRED", { purchaseTax: null }],
    ["NATIVE_TAX_TOTAL_MISMATCH", { purchaseTax: { nativeId: "3", percentage: "12" } }],
    ["NATIVE_AMOUNT_UNSUPPORTED", { subtotal: "100.0001", tax: "13.000013", total: "113.000113" }],
  ])("blocks unsupported or unverified input: %s", (reason, patch) => {
    expect(() => prepareNativeAlegraPurchaseBody(intent(patch), binding)).toThrow(reason);
  });

  it("is OFF without an explicit server authorization function and activation", async () => {
    const store = fixture();
    const off = createNativeAlegraPurchaseTransport({ http: store.http, binding, now: () => now });
    expect(await off.create({ intent: intent(), idempotencyKey: intent().idempotencyKey })).toMatchObject({ state: "blocked", code: "NATIVE_WRITER_DISABLED" });
    expect(store.requests).toHaveLength(0);
  });

  it.each(["company", "supplier", "category", "cost", "tax"])("blocks native %s mismatch before any POST", async problem => {
    const store = fixture(async request => {
      if (problem === "company" && request.path === "/company") return { status: 200, data: { identification: "other-receiver", currency: { code: "USD" }, applicationVersion: "costaRica", decimalPrecision: "2" } };
      if (problem === "supplier" && request.path === "/contacts/42") return { status: 200, data: { id: "42", identification: null, type: ["provider"], status: "active" } };
      if (problem === "category" && request.path === "/categories/51") return { status: 200, data: { id: "51", type: "income", status: "active" } };
      if (problem === "cost" && request.path === "/cost-centers/7") return { status: 200, data: { id: "7", status: false } };
      if (problem === "tax" && request.path === "/taxes/3") return { status: 200, data: { id: "3", percentage: "12", status: "active" } };
      return undefined;
    });
    expect((await store.transport.create({ intent: intent(), idempotencyKey: intent().idempotencyKey })).state).toBe("blocked");
    expect(store.requests.some(r => r.method === "POST")).toBe(false);
  });

  it("requires current native authorization after resource checks", async () => {
    const store = fixture(); store.authorize.mockResolvedValue(false);
    expect(await store.transport.create({ intent: intent(), idempotencyKey: intent().idempotencyKey })).toMatchObject({ state: "blocked", code: "NATIVE_AUTHORIZATION_DENIED" });
    expect(store.requests.some(r => r.method === "POST")).toBe(false);
  });

  it("creates once and compares a separately retrieved native bill through the existing executor", async () => {
    const store = fixture(); const prepared = intent();
    const result = await executeApprovedAlegraIntent({ intent: prepared,
      approval: { approvalId: "fixture-approval", approvalReceiptId: "fixture-receipt", actorId: "fixture-owner", approvedAt: now, expiresAt: "2026-10-11T09:15:00Z", decisionId: "fixture-decision", decisionRevision: now, payloadHash: prepared.payloadHash, state: "approved" },
      duplicateDecision: { clear: true, state: "CLEAR", exactMatches: [], probableMatches: [], sourceStates: [], reasons: [] },
      transport: store.transport, now, writerEnabled: true, gate: { beforeDispatch: async () => true, renewLease: async () => true, persistReceipt: async () => "fixture-receipt" } });
    expect(result.ok).toBe(true); expect(result.receipt.verified).toBe(true);
    expect(store.requests.filter(r => r.method === "POST")).toHaveLength(1);
    expect(store.requests.some(r => r.path === "/bills/99")).toBe(true);
    expect(store.authorize).toHaveBeenCalledTimes(1);
  });

  it("recovers a timeout by native business identity and exact TORO marker without another POST", async () => {
    let posted = false;
    const store = fixture(async request => {
      if (request.method === "POST") { posted = true; throw new Error("fixture timeout"); }
      if (request.path === "/bills" && posted) return { status: 200, data: { metadata: { total: 1 }, data: [nativeBill()] } };
      return undefined;
    });
    const prepared = intent();
    expect(await store.transport.create({ intent: prepared, idempotencyKey: prepared.idempotencyKey, beforeNativePost: async () => true })).toMatchObject({ state: "ambiguous" });
    expect(await store.transport.findByIdempotencyKey({ intent: prepared, idempotencyKey: prepared.idempotencyKey })).toEqual({ state: "found", nativeId: "99" });
    expect(store.requests.filter(r => r.method === "POST")).toHaveLength(1);
  });

  it("blocks a native documentary duplicate even without a TORO marker or matching total", async () => {
    const store = fixture(async request => request.path === "/bills" && request.method === "GET"
      ? { status: 200, data: { metadata: { total: 1 }, data: [{ ...nativeBill(), observations: "", total: 999 }] } } : undefined);
    expect((await store.transport.create({ intent: intent(), idempotencyKey: intent().idempotencyKey })).state).toBe("blocked");
    expect(store.requests.some(r => r.method === "POST")).toBe(false);
  });

  it.each(["partial", "multiple", "error"])("does not certify lookup with %s coverage", async problem => {
    const store = fixture(async request => {
      if (request.path !== "/bills") return undefined;
      return problem === "error" ? { status: 503, data: {} } : { status: 200, data: { metadata: { total: problem === "partial" ? 2 : 2 }, data: problem === "partial" ? [] : [nativeBill(), { ...nativeBill(), id: "100" }] } };
    });
    expect((await store.transport.findByIdempotencyKey({ intent: intent(), idempotencyKey: intent().idempotencyKey })).state).toBe("unavailable");
  });

  it.each(["date", "tax", "extra-line", "payment", "foreign"])("refuses native readback altered in %s", async problem => {
    const bill = nativeBill();
    if (problem === "date") bill.date = "2026-10-10";
    if (problem === "tax") bill.purchases.categories[0].tax[0].id = "4";
    if (problem === "extra-line") bill.purchases.categories.push({ ...bill.purchases.categories[0] });
    if (problem === "payment") bill.totalPaid = 1;
    const observed = problem === "foreign" ? { ...bill, currency: { code: "CRC" } } : bill;
    const store = fixture(async request => request.path === "/bills/99" ? { status: 200, data: observed } : undefined);
    await expect(store.transport.readback({ intent: intent(), nativeId: "99" })).rejects.toThrow("NATIVE_READBACK_MISMATCH");
  });

  it("captures binding and payload before authorization awaits", async () => {
    const localBinding = structuredClone(binding); const prepared = intent(); const store = fixture();
    const transport = createNativeAlegraPurchaseTransport({ http: store.http, binding: localBinding, now: () => now, mutationEnabled: true,
      authorizeNativeCreate: async captured => { expect(Object.isFrozen(captured.body)).toBe(true); localBinding.receiverTaxId = "other"; prepared.payload.total = "999.00"; return true; } });
    expect(await transport.create({ intent: prepared, idempotencyKey: prepared.idempotencyKey, beforeNativePost: async () => true })).toMatchObject({ state: "created", nativeId: "99" });
    const posted = store.requests.find(r => r.method === "POST")!;
    expect(posted.body).toMatchObject({ purchases: { categories: [{ price: 100 }] } });
  });

  it("enforces a final fenced lease immediately before the native POST", async () => {
    const store = fixture();
    const prepared = intent();
    const finalHeartbeat = vi.fn(async () => {
      // All native reads and the final business authorization must already
      // have completed before attempting to renew the fenced dispatch lease.
      expect(store.authorize).toHaveBeenCalledTimes(1);
      expect(store.requests.some(r => r.method === "GET" && r.path === "/bills")).toBe(true);
      expect(store.requests.some(r => r.method === "POST")).toBe(false);
      return true;
    });
    const request = { intent: prepared, idempotencyKey: prepared.idempotencyKey,
      beforeNativePost: finalHeartbeat };
    const result = await store.transport.create(request);
    expect(result).toMatchObject({ state: "created", nativeId: "99" });
    expect(finalHeartbeat).toHaveBeenCalledTimes(1);
    expect(store.requests.filter(r => r.method === "POST")).toHaveLength(1);
  });

  it("blocks direct native create without the admitted-run final heartbeat", async () => {
    const store = fixture(), prepared = intent();
    const result = await store.transport.create({ intent: prepared, idempotencyKey: prepared.idempotencyKey });
    expect(result).toMatchObject({ state: "blocked", code: "NATIVE_LEASE_UNAVAILABLE" });
    expect(store.authorize).toHaveBeenCalledTimes(1);
    expect(store.requests.some(r => r.method === "POST")).toBe(false);
  });

  it.each(["denied", "throws"] as const)("blocks the native POST when final heartbeat %s", async failure => {
    const store = fixture(), prepared = intent();
    const finalHeartbeat = vi.fn(async () => {
      if (failure === "throws") throw new Error("fixture lease expired or RPC unavailable");
      return false;
    });
    const request = { intent: prepared, idempotencyKey: prepared.idempotencyKey,
      beforeNativePost: finalHeartbeat };
    const result = await store.transport.create(request);
    expect(result).toMatchObject({ state: "blocked", code: "NATIVE_LEASE_UNAVAILABLE" });
    expect(finalHeartbeat).toHaveBeenCalledTimes(1);
    expect(store.requests.filter(r => r.method === "POST")).toHaveLength(0);
  });

  it("binds two fenced lease renewals to the approved executor and only one native POST", async () => {
    const store = fixture(), prepared = intent(), renewLease = vi.fn(async () => true);
    const result = await executeApprovedAlegraIntent({
      intent: prepared,
      approval: { approvalId: "fixture-approval", approvalReceiptId: "fixture-receipt",
        actorId: "fixture-owner", approvedAt: now, expiresAt: "2026-10-11T09:15:00Z",
        decisionId: "fixture-decision", decisionRevision: now, payloadHash: prepared.payloadHash,
        state: "approved" },
      duplicateDecision: { clear: true, state: "CLEAR", exactMatches: [], probableMatches: [],
        sourceStates: [], reasons: [] },
      transport: store.transport, now, writerEnabled: true,
      gate: { beforeDispatch: async () => true, renewLease,
        persistReceipt: async () => "fixture-receipt" },
    });
    expect(result.ok).toBe(true);
    expect(renewLease).toHaveBeenCalledTimes(2);
    expect(store.requests.filter(r => r.method === "POST")).toHaveLength(1);
  });
});


describe("Existing server-only Alegra purchase composition", () => {
  const prepared = intent();
  const ownerApproval = {
    approvalId: "fixture-approval", approvalReceiptId: "fixture-approval-receipt",
    actorId: "fixture-owner", approvedAt: now, expiresAt: "2026-10-11T09:15:00Z",
    decisionId: "fixture-decision", decisionRevision: now, state: "approved" as const,
    payloadHash: prepared.payloadHash,
  };
  const queuedRun = {
    id: "fixture-run", orgId: scope.orgId, taskId: "fixture-task", decisionId: "fixture-decision",
    runKey: "fixture-run-key", idempotencyKey: prepared.idempotencyKey,
    correlationId: "fixture-correlation", traceId: null, actorKind: "human" as const,
    actorRef: "fixture-owner", dotRef: null, agentRef: null, actionKey: prepared.action,
    targetSystem: "alegra", executionAuthorityLevel: "L3" as const,
    businessRisk: "High" as const, status: "queued" as const,
    verificationStatus: "pending" as const, attemptCount: 0, maxAttempts: 1,
    leaseOwner: null, fencingToken: 0, leaseExpiresAt: null,
  } satisfies ToroWorkerRun;
  const duplicateDecision = {
    clear: true, state: "CLEAR" as const, exactMatches: [], probableMatches: [],
    sourceStates: [
      { source: "toro" as const, coverage: "complete" as const },
      { source: "alegra" as const, coverage: "complete" as const },
      { source: "receipt" as const, coverage: "complete" as const },
    ], reasons: [],
  };

  function composedFixture() {
    const native = fixture();
    const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
      if (name === "toro_admit_approved_alegra_execution_v1") {
        if (args.p_worker_id !== "fixture-worker" || args.p_approval_actor_id !== "fixture-owner")
          return { data: null, error: null };
        return { data: { runId: queuedRun.id, fencingToken: 1,
          leaseExpiresAt: "2026-10-11T09:02:00Z",
          preparedReceiptId: "fixture-prepared-receipt" }, error: null };
      }
      if (name === "toro_heartbeat_alegra_execution_v1") {
        if (args.p_fencing_token !== 1 || args.p_prepared_receipt_id !== "fixture-prepared-receipt")
          return { data: null, error: null };
        return { data: { runId: queuedRun.id, fencingToken: 1,
          leaseExpiresAt: "2026-10-11T09:02:00Z",
          preparedReceiptId: "fixture-prepared-receipt" }, error: null };
      }
      if (name === "toro_finalize_alegra_execution_v1")
        return { data: { runId: queuedRun.id, finalReceiptId: "fixture-durable-receipt",
          runStatus: "succeeded", verificationStatus: "passed", replayed: false }, error: null };
      throw new Error("Unexpected governed RPC");
    });
    const authorizeAdmission = vi.fn(async () => true);
    const authorizeNativeCreate = vi.fn(async () => true);
    const args = {
      supabase: { rpc } as unknown as SupabaseClient,
      run: queuedRun, workerId: "fixture-worker", now: () => now,
      intent: prepared, approval: ownerApproval, duplicateDecision,
      http: native.http, binding,
      authorizeAdmission, authorizeNativeCreate,
    };
    return { native, rpc, authorizeAdmission, authorizeNativeCreate, args };
  }

  it.each([
    { writerEnabled: false, nativeMutationEnabled: false },
    { writerEnabled: true, nativeMutationEnabled: false },
    { writerEnabled: false, nativeMutationEnabled: true },
  ])("stays OFF without both independent runtime gates: %#", async flags => {
    const ctx = composedFixture();
    const outcome = await executeGovernedAlegraPurchase({ ...ctx.args, ...flags });
    expect(outcome).toMatchObject({ ok: false, executedProviderMutation: false,
      receipt: { verificationState: "NOT_ATTEMPTED", reasons: ["WRITER_DISABLED"] } });
    expect(ctx.native.requests).toHaveLength(0);
    expect(ctx.rpc).not.toHaveBeenCalled();
    expect(ctx.authorizeAdmission).not.toHaveBeenCalled();
    expect(ctx.authorizeNativeCreate).not.toHaveBeenCalled();
  });

  it("composes admission, two fenced heartbeats, one native POST, readback and durable finalization", async () => {
    const ctx = composedFixture();
    const outcome = await executeGovernedAlegraPurchase({
      ...ctx.args, writerEnabled: true, nativeMutationEnabled: true,
    });
    expect(outcome).toMatchObject({ ok: true, executedProviderMutation: true,
      receipt: { verified: true, verificationState: "VERIFIED", nativeId: "99",
        durableReceiptId: "fixture-durable-receipt" } });
    expect(ctx.rpc.mock.calls.map(call => call[0])).toEqual([
      "toro_admit_approved_alegra_execution_v1",
      "toro_heartbeat_alegra_execution_v1",
      "toro_heartbeat_alegra_execution_v1",
      "toro_finalize_alegra_execution_v1",
    ]);
    expect(ctx.native.requests.filter(request => request.method === "POST")).toHaveLength(1);
    expect(ctx.native.requests.some(request => request.path === "/bills/99")).toBe(true);
    expect(ctx.authorizeAdmission).toHaveBeenCalledTimes(1);
    expect(ctx.authorizeNativeCreate).toHaveBeenCalledTimes(1);
  });
});
