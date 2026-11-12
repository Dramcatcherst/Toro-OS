import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createAlegraManualHost } from "./alegra-writer-host";
import { createCanonicalAlegraReader } from "./alegra-canonical-reader";
import type { AlegraCallerContext } from "./alegra-writer-control-plane";
import { prepareAlegraWriteIntent } from "./alegra-writer-contract";
import { evaluateAlegraDuplicatePreflight } from "./alegra-writer-dedupe";

// Unit boundary only: the real reader has its own adversarial SELECT tests.
vi.mock("./alegra-canonical-reader", () => ({ createCanonicalAlegraReader: vi.fn() }));
const ca = readFileSync("src/lib/supabase/fixtures/supabase-prod-ca-2021.crt", "utf8");
function fixture() {
  const scope = { tenantId: "synthetic-tenant", orgId: "595801ce-2895-4d91-81ae-e8d1d5cc8593", legalEntityKey: "synthetic-entity" };
  const intent = prepareAlegraWriteIntent({ scope, evidence: { sourceRefs: ["synthetic:source"], evidenceHash: "synthetic-hash" }, payload: {
    targetType: "purchase_bill", documentNumber: "synthetic-invoice", supplierNativeId: "42", issuerTaxId: "synthetic-issuer", receiverTaxId: "synthetic-receiver",
    issueDate: "2026-10-24", dueDate: "2026-10-30", currency: "CRC", subtotal: "100.00", tax: "13.00", total: "113.00", accountNativeId: "51", costCenterNativeId: "7", purchaseTax: { nativeId: "3", percentage: "13" },
  } });
  const context: AlegraCallerContext = { flags: { writerEnabled: true, nativeMutationEnabled: true, recoveryEnabled: false }, intent,
    run: { id: "synthetic-run", orgId: scope.orgId, taskId: "synthetic-task", decisionId: "synthetic-decision", runKey: "synthetic-key", idempotencyKey: intent.idempotencyKey,
      correlationId: "synthetic-correlation", traceId: null, actorKind: "human", actorRef: "synthetic-owner", dotRef: null, agentRef: null,
      actionKey: "alegra_create_purchase_bill", targetSystem: "alegra", executionAuthorityLevel: "L3", businessRisk: "High", status: "queued", verificationStatus: "pending", attemptCount: 0, maxAttempts: 1, leaseOwner: null, fencingToken: 0, leaseExpiresAt: null },
    approval: { approvalId: "synthetic-approval", approvalReceiptId: "synthetic-human-receipt", actorId: "synthetic-owner", decisionId: "synthetic-decision", decisionRevision: "2026-10-24T07:00:00Z", approvedAt: "2026-10-24T07:00:00Z", expiresAt: "2026-10-24T07:15:00Z", payloadHash: intent.payloadHash, state: "approved" },
    duplicateDecision: evaluateAlegraDuplicatePreflight({ intent, candidates: [], now: "2026-10-24T07:00:22Z", maxAgeMs: 60_000,
      sourceStates: ["toro", "alegra", "receipt"].map(source => ({ source: source as "toro" | "alegra" | "receipt", coverage: "complete" as const, checkedAt: "2026-10-24T07:00:22Z" })) }),
    binding: { scope, receiverTaxId: "synthetic-receiver", mainCurrency: "CRC", applicationVersion: "costaRica" }, preparedReceipt: null };
  const reader = { readFlags: vi.fn(async () => ({ writerEnabled: context.flags?.writerEnabled === true, nativeMutationEnabled: context.flags?.nativeMutationEnabled === true, recoveryEnabled: context.flags?.recoveryEnabled === true })), load: vi.fn(async () => context), loadForRecovery: vi.fn(async () => context), authorizeAdmission: vi.fn(async () => true), authorizeNativeCreate: vi.fn(async () => true) };
  vi.mocked(createCanonicalAlegraReader).mockReturnValue(reader);
  const events: string[] = [], configs: Record<string, unknown>[] = [];
  let failConnect = false;
  class Client {
    connection = { stream: { encrypted: true, authorized: true, getPeerCertificate: () => ({ subjectaltname: "DNS:db.abtyrbqlqbsastmridzp.supabase.co" }) } };
    principal: unknown;
    constructor(config: Record<string, unknown>) { configs.push(config); this.principal = config.user; }
    on() { return this; }
    async connect() { events.push("connect"); if (failConnect) throw new Error("SYNTHETIC_PRIVATE_PASSWORD"); }
    async end() { events.push("end"); }
    async query(sql: string, values: unknown[]) {
      if (sql.includes("current_user")) return { rows: [{ principal: this.principal, login_principal: this.principal, database: "postgres" }] };
      events.push(sql);
      if (sql.includes("toro_admit_approved")) return { rows: [{ result: { runId: "synthetic-run", fencingToken: 1, preparedReceiptId: "synthetic-prepared", leaseExpiresAt: "2026-10-24T07:02:00Z" } }] };
      if (sql.includes("toro_heartbeat")) return { rows: [{ result: { runId: "synthetic-run", fencingToken: 1, preparedReceiptId: "synthetic-prepared", leaseExpiresAt: "2026-10-24T07:02:00Z" } }] };
      if (sql.includes("toro_finalize")) return { rows: [{ result: { runId: "synthetic-run", finalReceiptId: "synthetic-final", runStatus: values[5] === "verified" ? "succeeded" : "blocked", verificationStatus: values[5] === "verified" ? "passed" : "partial", replayed: false } }] };
      if (sql.includes("toro_recover_expired")) return { rows: [{ result: { runId: "synthetic-run", finalReceiptId: "synthetic-unknown", fencingToken: 2, runStatus: "blocked", verificationStatus: "partial", providerState: "PROVIDER_STATE_UNKNOWN", replayed: false } }] };
      throw new Error("Unexpected synthetic SQL");
    }
  }
  const requests: Array<{ method: string; path: string; auth: boolean }> = [];
  const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
    const path = new URL(url).pathname.replace("/api/v1", "");
    requests.push({ method: init.method!, path, auth: new Headers(init.headers).has("authorization") });
    let data: unknown;
    if (path === "/company") data = { identification: "synthetic-receiver", currency: { code: "CRC" }, applicationVersion: "costaRica", decimalPrecision: "2" };
    else if (path === "/contacts/42") data = { id: "42", identification: { number: "synthetic-issuer" }, type: ["provider"], status: "active" };
    else if (path === "/categories/51") data = { id: "51", type: "expense", status: "active" };
    else if (path === "/cost-centers/7") data = { id: "7", status: "active" };
    else if (path === "/taxes/3") data = { id: "3", percentage: "13", status: "active" };
    else if (path === "/bills" && init.method === "GET") data = { metadata: { total: 0 }, data: [] };
    else if (path === "/bills" && init.method === "POST") data = { id: "99" };
    else if (path === "/bills/99") data = { id: "99", date: "2026-10-24", dueDate: "2026-10-30", provider: { id: "42" }, numberTemplate: { number: "synthetic-invoice" }, observations: intent.idempotencyKey,
      status: "open", total: 113, totalPaid: 0, balance: 113, retentions: [], payments: [], currency: { code: "CRC" }, costCenter: { id: "7" }, purchases: { items: [], categories: [{ id: "51", price: 100, quantity: 1, discount: 0, tax: [{ id: "3", percentage: "13" }] }] } };
    else throw new Error("Unexpected synthetic HTTP");
    return new Response(JSON.stringify(data), { status: init.method === "POST" ? 201 : 200 });
  });
  const readSecret = vi.fn(async (name: string) => name === "alegra-api.secret" ? JSON.stringify({ email: "synthetic@example.invalid", token: "SYNTHETIC_TOKEN_NOT_REAL" }) : "SYNTHETIC_DATABASE_PASSWORD");
  const options = { Client, ca, readSecret, fetchImpl, target: { orgId: scope.orgId, runId: context.run.id, payloadHash: intent.payloadHash }, workerId: "synthetic-worker", recoveryWorkerId: "synthetic-recovery", now: () => "2026-10-24T07:00:22Z" };
  return { options, reader, context, requests, events, configs, readSecret, failConnect: () => { failConnect = true; } };
}
beforeEach(() => vi.clearAllMocks());
describe("existing-host manual Writer composition", () => {
  it("keeps OFF before reading Writer/Alegra secrets or opening Writer sessions", async () => {
    const f = fixture(); f.context.flags!.writerEnabled = false;
    expect(await createAlegraManualHost(f.options).dispatch()).toMatchObject({ state: "blocked", reason: "WRITER_DISABLED", sessionsClosed: true });
    expect(f.readSecret).not.toHaveBeenCalled(); expect(f.requests).toHaveLength(0); expect(f.configs).toHaveLength(0);
  });
  it("binds real reader methods, one exclusive Writer session, one create and durable readback", async () => {
    const f = fixture();
    expect(await createAlegraManualHost(f.options).dispatch()).toMatchObject({ state: "dispatch_result", result: { ok: true, receipt: { durableReceiptId: "synthetic-final" } }, sessionsClosed: true });
    expect(f.reader.authorizeAdmission).toHaveBeenCalled(); expect(f.reader.authorizeNativeCreate).toHaveBeenCalled();
    expect(f.requests.filter(r => r.method === "POST")).toHaveLength(1);
    expect(f.requests.every(r => r.auth)).toBe(true);
    expect(f.readSecret.mock.calls.filter(c => c[0] === "alegra-api.secret")).toHaveLength(1);
    expect(f.configs).toHaveLength(1); expect(f.events.filter(e => e === "end")).toHaveLength(1);
  });
  it("denies absent reader authority and opens no Writer connection", async () => {
    const f = fixture(); f.reader.load.mockResolvedValue(null as never);
    expect(await createAlegraManualHost(f.options).dispatch()).toMatchObject({ state: "blocked" });
    expect(f.configs).toHaveLength(0); expect(f.requests).toHaveLength(0);
  });
  it("allows only one operation, including concurrent dispatch/recovery", async () => {
    const f = fixture(), host = createAlegraManualHost(f.options);
    const results = await Promise.all([host.dispatch(), host.recover()]);
    expect(results[1]).toMatchObject({ state: "blocked", reason: "CALLER_ALREADY_USED" });
    expect(await host.dispatch()).toMatchObject({ state: "blocked", reason: "CALLER_ALREADY_USED" });
    expect(f.requests.filter(r => r.method === "POST")).toHaveLength(1);
  });
  it("blocks recovery OFF before reading secrets", async () => {
    const f = fixture(); expect(await createAlegraManualHost(f.options).recover()).toMatchObject({ state: "blocked", reason: "RECOVERY_DISABLED" });
    expect(f.readSecret).not.toHaveBeenCalled();
  });
  it("uses the explicit recovery reader and never loads native credentials", async () => {
    const f = fixture(); f.context.flags = { writerEnabled: false, nativeMutationEnabled: false, recoveryEnabled: true };
    Object.assign(f.context.run, { status: "running", attemptCount: 1, fencingToken: 1, leaseOwner: f.options.workerId, leaseExpiresAt: "2026-10-24T07:00:00Z" });
    f.context.preparedReceipt = { id: "synthetic-prepared", orgId: f.context.run.orgId, runId: f.context.run.id, payloadHash: f.context.intent.payloadHash };
    f.reader.load.mockResolvedValue(null as never);
    expect(await createAlegraManualHost(f.options).recover()).toMatchObject({ state: "recovery_result", result: { providerState: "PROVIDER_STATE_UNKNOWN" }, sessionsClosed: true });
    expect(f.reader.loadForRecovery).toHaveBeenCalledTimes(1); expect(f.reader.load).not.toHaveBeenCalled();
    expect(f.requests).toHaveLength(0); expect(f.readSecret.mock.calls.every(call => call[0] !== "alegra-api.secret")).toBe(true);
  });
  it("does not retry a failed native connection or expose its error", async () => {
    const f = fixture(); f.failConnect();
    const host = createAlegraManualHost(f.options);
    const result = await host.dispatch();
    expect(JSON.stringify(result)).not.toContain("SYNTHETIC_PRIVATE_PASSWORD");
    expect(f.events.filter(e => e === "connect")).toHaveLength(1);
    expect(f.requests).toHaveLength(0); await host.dispatch();
    expect(f.events.filter(e => e === "connect")).toHaveLength(1);
  });
  it("rejects shared worker/recovery identity and non-internal modes", () => {
    const f = fixture(); expect(() => createAlegraManualHost({ ...f.options, recoveryWorkerId: f.options.workerId })).toThrow("ALEGRA_HOST_BINDING_REQUIRED");
    const before = process.env.TORO_DEPLOYMENT_MODE; delete process.env.TORO_DEPLOYMENT_MODE;
    try { expect(() => createAlegraManualHost(f.options)).toThrow("ALEGRA_HOST_BINDING_REQUIRED"); } finally { process.env.TORO_DEPLOYMENT_MODE = before; }
  });
});
