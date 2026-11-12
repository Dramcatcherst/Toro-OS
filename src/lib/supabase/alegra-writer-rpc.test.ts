import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { heartbeatAlegraExecutionRun } from "@/features/control-plane/worker-runtime";
import { createAlegraWriterRpcClient, type AlegraWriterRpcClient } from "./alegra-writer-rpc";

const heartbeat = {
  p_org_id: "fixture-org", p_run_id: "fixture-run", p_worker_id: "fixture-worker",
  p_fencing_token: 1, p_prepared_receipt_id: "fixture-prepared", p_lease_seconds: 60,
};
const cases = [
  ["toro_admit_approved_alegra_execution_v1", {
    p_org_id: "fixture-org", p_run_id: "fixture-run", p_worker_id: "fixture-worker",
    p_expected_fencing_token: 0, p_approval_receipt_id: "fixture-approval-receipt",
    p_approval_id: "fixture-approval", p_approval_actor_id: "fixture-human",
    p_approval_approved_at: "2026-10-23T12:00:00Z", p_approval_expires_at: "2026-10-23T12:15:00Z",
    p_payload_hash: "a".repeat(64), p_decision_revision: "2026-10-23T12:00:00Z", p_lease_seconds: 120,
  }],
  ["toro_heartbeat_alegra_execution_v1", heartbeat],
  ["toro_finalize_alegra_execution_v1", {
    p_org_id: "fixture-org", p_run_id: "fixture-run", p_worker_id: "fixture-worker",
    p_fencing_token: 1, p_prepared_receipt_id: "fixture-prepared", p_outcome: "verified",
    p_receipt: { integrity_hash: "a".repeat(64), observed_after: { nativeId: "fixture-bill" } },
  }],
  ["toro_recover_expired_alegra_execution_v1", {
    p_org_id: "fixture-org", p_run_id: "fixture-run", p_recovery_worker_id: "fixture-recovery",
    p_expected_fencing_token: 1, p_prepared_receipt_id: "fixture-prepared",
  }],
] as const;

describe("Alegra Writer RPC capability", () => {
  it("requires explicit wrapping instead of accepting a generic Supabase client by type", () => {
    expectTypeOf<SupabaseClient>().not.toExtend<AlegraWriterRpcClient>();
    expectTypeOf<Parameters<typeof heartbeatAlegraExecutionRun>[0]>().toEqualTypeOf<AlegraWriterRpcClient>();
  });
  it.each(cases)("allows only the explicit %s boundary with captured arguments", async (name, args) => {
    const received: unknown[] = [];
    const client = createAlegraWriterRpcClient({ authenticatedRpc: async (rpc, params) => {
      received.push([rpc, params]);
      return { data: [{ run_id: "fixture-run" }], error: null };
    } });
    expect(await client.rpc(name, args)).toEqual({ data: [{ run_id: "fixture-run" }], error: null });
    expect(received).toEqual([[name, args]]);
    expect((received[0] as unknown[])[1]).not.toBe(args);
  });

  it.each(["resolve_toro_decision", "toro_transition_execution_run_v1", "toro_complete_execution_run_v1", "public.toro_heartbeat_alegra_execution_v1", "toString", "__proto__"])("denies %s before transport", async name => {
    const transport = vi.fn();
    const client = createAlegraWriterRpcClient({ authenticatedRpc: transport });
    // Exercise the runtime boundary even when a JavaScript caller bypasses types.
    await expect(client.rpc(name as never, heartbeat)).rejects.toThrow("ALEGRA_WRITER_RPC_FORBIDDEN");
    expect(transport).not.toHaveBeenCalled();
  });

  it.each([
    { ...heartbeat, p_outcome: "verified" },
    { p_org_id: "fixture-org" },
    { ...heartbeat, p_run_id: undefined },
  ])("denies an altered RPC argument shape before transport", async args => {
    const transport = vi.fn();
    const client = createAlegraWriterRpcClient({ authenticatedRpc: transport });
    await expect(client.rpc("toro_heartbeat_alegra_execution_v1", args)).rejects.toThrow("ALEGRA_WRITER_RPC_ARGUMENTS_FORBIDDEN");
    expect(transport).not.toHaveBeenCalled();
  });

  it("captures the transport once and cannot be redirected by changing its input", async () => {
    const original = vi.fn(async () => ({ data: "original", error: null }));
    const replacement = vi.fn(async () => ({ data: "replacement", error: null }));
    const options = { authenticatedRpc: original };
    const client = createAlegraWriterRpcClient(options);
    options.authenticatedRpc = replacement;
    expect(await client.rpc("toro_heartbeat_alegra_execution_v1", heartbeat)).toEqual({ data: "original", error: null });
    expect(replacement).not.toHaveBeenCalled();
    expect(Object.isFrozen(client)).toBe(true);
    expect("from" in client || "auth" in client || "schema" in client || "storage" in client).toBe(false);
  });

  it.each(["throw", "return"])("sanitizes a transport error (%s), discards data and never retries", async mode => {
    const transport = vi.fn(async () => {
      if (mode === "throw") throw new Error("fixture-secret-must-not-escape");
      return { data: "unverified", error: { message: "fixture-secret-must-not-escape" } };
    });
    const client = createAlegraWriterRpcClient({ authenticatedRpc: transport });
    expect(await client.rpc("toro_heartbeat_alegra_execution_v1", heartbeat)).toEqual({ data: null, error: { message: "ALEGRA_WRITER_RPC_FAILED" } });
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("requires an explicit transport and does not fall back to a generic worker", () => {
    expect(() => createAlegraWriterRpcClient({ authenticatedRpc: undefined as never })).toThrow("ALEGRA_WRITER_RPC_TRANSPORT_REQUIRED");
  });

  it.each(["public_demo", "portal", undefined])("cannot be constructed outside internal mode (%s)", mode => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", mode);
    try {
      expect(() => createAlegraWriterRpcClient({ authenticatedRpc: vi.fn() })).toThrow();
    } finally { vi.unstubAllEnvs(); }
  });

  it("runs the real heartbeat validator through the narrow capability", async () => {
    const client = createAlegraWriterRpcClient({ authenticatedRpc: async () => ({
      data: { run_id: "fixture-run", fencing_token: 1, prepared_receipt_id: "fixture-prepared", lease_expires_at: "2026-10-23T12:01:00Z" }, error: null,
    }) });
    expect(await heartbeatAlegraExecutionRun(client, {
      orgId: "fixture-org", runId: "fixture-run", workerId: "fixture-worker", fencingToken: 1, preparedReceiptId: "fixture-prepared",
    })).toEqual({ runId: "fixture-run", fencingToken: 1, preparedReceiptId: "fixture-prepared", leaseExpiresAt: "2026-10-23T12:01:00Z" });
  });

  it("isolates nested receipt data from caller mutation while transport waits", async () => {
    const params = { ...cases[2][1], p_receipt: { integrity_hash: "a".repeat(64), observed_after: { nativeId: "fixture-bill" } } };
    let captured: Record<string, unknown> | undefined;
    let finish!: () => void;
    const waiting = new Promise<void>(resolve => { finish = resolve; });
    const client = createAlegraWriterRpcClient({ authenticatedRpc: async (_, args) => {
      captured = args;
      await waiting;
      return { data: null, error: null };
    } });
    const result = client.rpc("toro_finalize_alegra_execution_v1", params);
    params.p_receipt.observed_after.nativeId = "changed";
    expect(captured?.p_receipt).toEqual({ integrity_hash: "a".repeat(64), observed_after: { nativeId: "fixture-bill" } });
    finish();
    await result;
  });
});
