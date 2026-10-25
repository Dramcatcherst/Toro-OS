import { describe, expect, it, vi } from "vitest";
import { createDedicatedAlegraPostgresClient } from "./alegra-writer-postgres";

function fixture() {
  const calls: Array<{ sql: string; values: unknown[] }> = [];
  const options = { projectId: "abtyrbqlqbsastmridzp", host: "db.abtyrbqlqbsastmridzp.supabase.co", port: 5432,
    user: "toro_alegra_writer_v1", database: "postgres", tlsVerified: true,
    query: async (sql: string, values: unknown[]) => { calls.push({ sql, values }); return { rows: sql.startsWith("select current_user")
      ? [{ principal: "toro_alegra_writer_v1", login_principal: "toro_alegra_writer_v1", database: "postgres" }] : [{ result: { run_id: "fixture-run" } }] }; },
  };
  return { options, calls };
}
const heartbeat = { p_org_id: "fixture-org", p_run_id: "fixture-run", p_worker_id: "worker'); select evil(); --", p_fencing_token: 1, p_prepared_receipt_id: "fixture-marker", p_lease_seconds: 60 };
describe("separate dedicated PostgreSQL Writer adapter", () => {
  it("binds only the pinned project/direct endpoint and uses typed values rather than SQL interpolation", async () => {
    const f = fixture();
    expect(await createDedicatedAlegraPostgresClient(f.options).rpc("toro_heartbeat_alegra_execution_v1", heartbeat)).toEqual({ data: { run_id: "fixture-run" }, error: null });
    expect(f.calls).toHaveLength(2);
    expect(f.calls[1]).toEqual({ sql: "select public.toro_heartbeat_alegra_execution_v1($1::uuid,$2::uuid,$3::text,$4::bigint,$5::uuid,$6::integer) as result", values: ["fixture-org", "fixture-run", "worker'); select evil(); --", 1, "fixture-marker", 60] });
  });
  it.each([
    ["toro_admit_approved_alegra_execution_v1", { p_org_id: "org", p_run_id: "run", p_worker_id: "worker", p_expected_fencing_token: 0, p_approval_receipt_id: "receipt", p_approval_id: "approval", p_approval_actor_id: "actor", p_approval_approved_at: "start", p_approval_expires_at: "end", p_payload_hash: "hash", p_decision_revision: "revision", p_lease_seconds: 120 },
      "select public.toro_admit_approved_alegra_execution_v1($1::uuid,$2::uuid,$3::text,$4::bigint,$5::uuid,$6::text,$7::text,$8::timestamptz,$9::timestamptz,$10::text,$11::text,$12::integer) as result",
      ["org", "run", "worker", 0, "receipt", "approval", "actor", "start", "end", "hash", "revision", 120]],
    ["toro_finalize_alegra_execution_v1", { p_org_id: "org", p_run_id: "run", p_worker_id: "worker", p_fencing_token: 1, p_prepared_receipt_id: "marker", p_outcome: "verified", p_receipt: { observed_after: {} } },
      "select public.toro_finalize_alegra_execution_v1($1::uuid,$2::uuid,$3::text,$4::bigint,$5::uuid,$6::text,$7::jsonb) as result",
      ["org", "run", "worker", 1, "marker", "verified", { observed_after: {} }]],
    ["toro_recover_expired_alegra_execution_v1", { p_org_id: "org", p_run_id: "run", p_recovery_worker_id: "recovery", p_expected_fencing_token: 1, p_prepared_receipt_id: "marker" },
      "select public.toro_recover_expired_alegra_execution_v1($1::uuid,$2::uuid,$3::text,$4::bigint,$5::uuid) as result", ["org", "run", "recovery", 1, "marker"]],
  ] as const)("maps the exact scalar-jsonb %s signature", async (name, args, sql, values) => {
    const f = fixture();
    expect(await createDedicatedAlegraPostgresClient(f.options).rpc(name, args)).toEqual({ data: { run_id: "fixture-run" }, error: null });
    expect(f.calls[1]).toEqual({ sql, values });
  });
  it.each(["projectId", "host", "user", "database", "port", "tlsVerified"])("rejects wrong %s before touching the session", field => {
    const f = fixture(); const query = vi.fn();
    expect(() => createDedicatedAlegraPostgresClient({ ...f.options, query, [field]: field === "tlsVerified" ? false : field === "port" ? 6543 : "wrong" })).toThrow("ALEGRA_WRITER_CONNECTION_BINDING_REQUIRED");
    expect(query).not.toHaveBeenCalled();
  });
  it.each(["service_role", "postgres", "authenticated", "anon"])("rejects effective principal %s before any RPC", async principal => {
    const query = vi.fn(async () => ({ rows: [{ principal, login_principal: principal, database: "postgres" }] }));
    expect(await createDedicatedAlegraPostgresClient({ ...fixture().options, query }).rpc("toro_heartbeat_alegra_execution_v1", heartbeat)).toEqual({ data: null, error: { message: "ALEGRA_WRITER_RPC_FAILED" } });
    expect(query).toHaveBeenCalledTimes(1);
  });
  it("rejects SET ROLE from a broad login even if current_user is dedicated", async () => {
    const query = vi.fn(async () => ({ rows: [{ principal: "toro_alegra_writer_v1", login_principal: "postgres", database: "postgres" }] }));
    expect((await createDedicatedAlegraPostgresClient({ ...fixture().options, query }).rpc("toro_heartbeat_alegra_execution_v1", heartbeat)).error).not.toBeNull();
    expect(query).toHaveBeenCalledTimes(1);
  });
  it("denies generic RPCs before even the identity handshake", async () => {
    const f = fixture(); await expect(createDedicatedAlegraPostgresClient(f.options).rpc("resolve_toro_decision" as never, heartbeat)).rejects.toThrow("ALEGRA_WRITER_RPC_FORBIDDEN");
    expect(f.calls).toHaveLength(0);
  });
  it("captures the query binding and returns no raw session error or retry", async () => {
    const query = vi.fn(async () => { throw new Error("fixture-credential-must-not-escape"); });
    const options = { ...fixture().options, query }; const client = createDedicatedAlegraPostgresClient(options);
    options.query = vi.fn();
    expect(await client.rpc("toro_heartbeat_alegra_execution_v1", heartbeat)).toEqual({ data: null, error: { message: "ALEGRA_WRITER_RPC_FAILED" } });
    expect(query).toHaveBeenCalledTimes(1); expect(options.query).not.toHaveBeenCalled();
  });
});
