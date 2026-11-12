import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAlegraManualHost } from "./alegra-writer-host";
import { createSyntheticAlegraHostFixture } from "./alegra-writer-synthetic.fixture";

// Real canonical reader, host, session adapter, caller and native transport.
// Only physical PostgreSQL and HTTP boundaries are synthetic; no vi.mock.
beforeEach(() => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("REAL_NETWORK_FORBIDDEN"); }));
});
afterEach(() => { expect(fetch).not.toHaveBeenCalled(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("manual Writer host with real canonical reader and synthetic IO", () => {
  it("verifies an omitted CRC currency and replays durably without a second fake POST", async () => {
    const f = createSyntheticAlegraHostFixture();
    const fakeFetch = f.hostOptions.fetchImpl;
    f.hostOptions.fetchImpl = async (url, init) => {
      const response = await fakeFetch(url, init);
      if (new URL(url).pathname.endsWith("/bills/99")) {
        const bill = await response.json(); delete bill.currency;
        return new Response(JSON.stringify(bill), { status: response.status });
      }
      return response;
    };
    expect(await createAlegraManualHost(f.hostOptions).dispatch()).toMatchObject({ state: "dispatch_result",
      result: { ok: true, receipt: { nativeId: "99", verified: true, durableReceiptId: f.finalReceiptId } } });
    const requestCount = f.requests.length;
    expect(await createAlegraManualHost(f.hostOptions).dispatch()).toMatchObject({ state: "dispatch_result",
      result: { ok: true, executedProviderMutation: false, receipt: { executionState: "replayed_verified", nativeId: "99" } } });
    expect(f.requests).toHaveLength(requestCount);
    expect(f.requests.filter(request => request.method === "POST")).toHaveLength(1);
  });

  it("persists tax:null as UNKNOWN with its native ID and blocks a fresh host from posting again", async () => {
    const f = createSyntheticAlegraHostFixture();
    const fakeFetch = f.hostOptions.fetchImpl;
    f.hostOptions.fetchImpl = async (url, init) => {
      const response = await fakeFetch(url, init);
      if (new URL(url).pathname.endsWith("/bills/99")) {
        const bill = await response.json(); bill.purchases.categories[0].tax = null;
        return new Response(JSON.stringify(bill), { status: response.status });
      }
      return response;
    };
    expect(await createAlegraManualHost(f.hostOptions).dispatch()).toMatchObject({ state: "dispatch_result",
      result: { ok: false, receipt: { nativeId: "99", verified: false, verificationState: "PROVIDER_STATE_UNKNOWN", durableReceiptId: f.finalReceiptId } } });
    expect(f.row.final_receipt).toMatchObject({ observed_after: { nativeId: "99", verificationState: "PROVIDER_STATE_UNKNOWN" } });
    const requestCount = f.requests.length;
    expect(await createAlegraManualHost(f.hostOptions).dispatch()).toMatchObject({ state: "dispatch_result",
      result: { ok: false, executedProviderMutation: false, receipt: { nativeId: "99", verificationState: "PROVIDER_STATE_UNKNOWN", durableReceiptId: f.finalReceiptId } } });
    expect(f.requests).toHaveLength(requestCount);
    expect(f.requests.filter(request => request.method === "POST")).toHaveLength(1);
    expect(f.rpcNames.filter(name => name === "toro_admit_approved_alegra_execution_v1")).toHaveLength(1);
  });
  it("keeps OFF after only a Reader connection and secret; closes it without Writer/API access", async () => {
    const f = createSyntheticAlegraHostFixture({ writerEnabled: false });
    expect(await createAlegraManualHost(f.hostOptions).dispatch()).toEqual({ state: "blocked", reason: "WRITER_DISABLED", sessionsClosed: true });
    expect(f.secretNames).toEqual(["alegra-writer-reader-postgres.secret"]);
    expect(f.sessions).toEqual([{ principal: "toro_alegra_writer_reader_v1", connects: 1, closes: 1, destroys: 0 }]);
    expect(f.rpcNames).toEqual([]); expect(f.requests).toEqual([]);
    expect(f.queries.some(query => query.sql.includes("alegra-canonical-flags-v1"))).toBe(true);
    expect(f.queries.some(query => query.sql.includes("alegra-canonical-context-v1"))).toBe(false);
  });

  it("uses live approval reads for one fake POST, native GET readback and a durable synthetic receipt", async () => {
    const f = createSyntheticAlegraHostFixture(), host = createAlegraManualHost(f.hostOptions);
    expect(await host.dispatch()).toMatchObject({ state: "dispatch_result", sessionsClosed: true,
      result: { ok: true, receipt: { verified: true, nativeId: "99", durableReceiptId: f.finalReceiptId } } });
    expect(f.requests.filter(request => request.method === "POST")).toHaveLength(1);
    expect(f.requests.some(request => request.method === "GET" && request.path === "/bills/99")).toBe(true);
    expect(f.requests.every(request => request.authenticated)).toBe(true);
    expect(f.rpcNames.filter(name => name === "toro_admit_approved_alegra_execution_v1")).toHaveLength(1);
    expect(f.rpcNames.filter(name => name === "toro_finalize_alegra_execution_v1")).toHaveLength(1);
    expect(f.queries.filter(query => query.sql.includes("alegra-canonical-context-v1")).length).toBeGreaterThanOrEqual(5);
    expect(f.row.final_receipt).toMatchObject({ id: f.finalReceiptId, supersedes_receipt_id: f.preparedReceiptId,
      observed_after: { verified: true, nativeId: "99", payloadHash: f.intent.payloadHash } });
    expect(f.sessions.map(session => [session.principal, session.connects, session.closes])).toEqual([
      ["toro_alegra_writer_reader_v1", 1, 1], ["toro_alegra_writer_v1", 1, 1],
    ]);
    expect(await host.dispatch()).toMatchObject({ state: "blocked", reason: "CALLER_ALREADY_USED" });
    expect(f.requests.filter(request => request.method === "POST")).toHaveLength(1);
  });

  it("rejects missing canonical approval before opening the Writer or loading native credentials", async () => {
    const f = createSyntheticAlegraHostFixture(); f.row.approval_receipt = null;
    expect(await createAlegraManualHost(f.hostOptions).dispatch()).toEqual({ state: "blocked", reason: "CONTEXT_UNAVAILABLE", sessionsClosed: true });
    expect(f.secretNames).toEqual(["alegra-writer-reader-postgres.secret"]);
    expect(f.rpcNames).toEqual([]); expect(f.requests).toEqual([]); expect(f.sessions).toHaveLength(1);
    expect(f.sessions[0].closes).toBe(1);
  });

  it("rejects a decision revision changed after the initial read before admission or provider access", async () => {
    const f = createSyntheticAlegraHostFixture();
    f.beforeContextRead(count => { if (count === 2) f.decision.updated_at = "2026-10-24T06:15:00.000001Z"; });
    expect(await createAlegraManualHost(f.hostOptions).dispatch()).toMatchObject({ state: "dispatch_result", sessionsClosed: true, result: { ok: false } });
    expect(f.secretNames).toEqual(["alegra-writer-reader-postgres.secret"]);
    expect(f.rpcNames).toEqual([]); expect(f.requests).toEqual([]); expect(f.sessions).toHaveLength(1);
    expect(f.sessions[0].closes).toBe(1);
  });

  it("recovers only the expired admitted snapshot as UNKNOWN with no provider requests", async () => {
    const f = createSyntheticAlegraHostFixture(); f.prepareExpiredRecovery();
    f.decision.decision_value = "rejected"; f.row.approval_revoked = true; f.openPolicy.structured_content.status = "closed";
    expect(await createAlegraManualHost(f.hostOptions).recover()).toMatchObject({ state: "recovery_result", sessionsClosed: true,
      result: { providerState: "PROVIDER_STATE_UNKNOWN", runStatus: "blocked", verificationStatus: "partial", fencingToken: 2, finalReceiptId: f.recoveryReceiptId } });
    expect(f.rpcNames).toEqual(["toro_recover_expired_alegra_execution_v1"]);
    expect(f.secretNames).toEqual(["alegra-writer-reader-postgres.secret", "alegra-writer-postgres.secret"]);
    expect(f.requests).toEqual([]); expect(f.sessions).toHaveLength(2);
    expect(f.sessions.every(session => session.connects === 1 && session.closes === 1)).toBe(true);
  });
});
