import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createAlegraDedicatedSession } from "./alegra-writer-session";

const ca = readFileSync("src/lib/supabase/fixtures/supabase-prod-ca-2021.crt", "utf8");
function fixture() {
  const configs: Record<string, unknown>[] = [];
  const events: string[] = [];
  let failConnect = false, failQuery = false, failEnd = false, authorized = true;
  let stallQuery = false, stallEnd = false;
  let principal = "toro_alegra_writer_v1";
  let errorHandler: () => void = () => {};
  class Client {
    connection = { stream: { encrypted: true, get authorized() { return authorized; }, destroy: () => { events.push("destroy"); }, getPeerCertificate: () => ({ subjectaltname: "DNS:db.abtyrbqlqbsastmridzp.supabase.co" }) } };
    constructor(config: Record<string, unknown>) { configs.push(config); }
    on(_name: string, handler: () => void) { errorHandler = handler; return this; }
    async connect() { events.push("connect"); if (failConnect) throw new Error("PRIVATE_PASSWORD"); }
    async query(sql: string, values: unknown[]) {
      events.push(sql);
      if (failQuery) throw new Error("PRIVATE_SQL_PASSWORD");
      if (stallQuery) return new Promise<{ rows: Record<string, unknown>[] }>(() => {});
      if (sql.includes("current_user")) return { rows: [{ principal, login_principal: principal, database: "postgres" }] };
      return { rows: [{ value: values[0] }] };
    }
    async end() { events.push("end"); if (failEnd) throw new Error("PRIVATE_END"); if (stallEnd) await new Promise<void>(() => {}); }
  }
  const readPassword = vi.fn(async () => "SYNTHETIC_PASSWORD_NEVER_REAL");
  const options = { Client, ca, principal: "toro_alegra_writer_v1" as const, readPassword };
  return { options, configs, events, readPassword, poison: () => errorHandler(),
    failConnect: () => { failConnect = true; }, failQuery: () => { failQuery = true; }, failEnd: () => { failEnd = true; },
    stallQuery: () => { stallQuery = true; }, stallEnd: () => { stallEnd = true; },
    untrustedTls: () => { authorized = false; }, wrongPrincipal: () => { principal = "postgres"; } };
}
describe("exclusive Writer PostgreSQL session", () => {
  it("bounds a stalled query, poisons the session and never retries", async () => {
    vi.useFakeTimers();
    try {
      const f = fixture(), session = createAlegraDedicatedSession(f.options);
      await session.query("select $1", [1]); f.stallQuery();
      const pending = expect(session.query("select $1", [2])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
      await vi.advanceTimersByTimeAsync(12_001); await pending;
      await expect(session.query("select $1", [2])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
      expect(f.events.filter(e => e === "select $1")).toHaveLength(2);
      expect(f.events).toContain("destroy");
      expect(f.configs[0]).toMatchObject({ statement_timeout: 10_000, lock_timeout: 5_000, query_timeout: 12_000 });
      await session.close();
    } finally { vi.useRealTimers(); }
  });
  it("bounds a stalled identity query before issuing application SQL", async () => {
    vi.useFakeTimers();
    try {
      const f = fixture(); f.stallQuery();
      const session = createAlegraDedicatedSession(f.options);
      const pending = expect(session.query("select $1", [2])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
      await vi.advanceTimersByTimeAsync(12_001); await pending;
      expect(f.events).not.toContain("select $1"); expect(f.events).toContain("destroy");
      await session.close();
    } finally { vi.useRealTimers(); }
  });
  it("bounds a stalled close, destroys the socket and reports unconfirmed closure", async () => {
    vi.useFakeTimers();
    try {
      const f = fixture(), session = createAlegraDedicatedSession(f.options);
      await session.query("select $1", [1]); f.stallEnd();
      const closing = session.close(); await vi.advanceTimersByTimeAsync(5_001);
      expect(await closing).toBe(false); expect(await session.close()).toBe(false);
      expect(f.events.filter(e => e === "end")).toHaveLength(1); expect(f.events).toContain("destroy");
    } finally { vi.useRealTimers(); }
  });
  it("opens lazily, pins all connection fields/TLS and closes once", async () => {
    const f = fixture(), session = createAlegraDedicatedSession(f.options);
    expect(f.readPassword).not.toHaveBeenCalled();
    expect(await session.query("select $1", [7])).toEqual({ rows: [{ value: 7 }] });
    expect(f.configs).toHaveLength(1);
    expect(f.configs[0]).toMatchObject({ host: "db.abtyrbqlqbsastmridzp.supabase.co", port: 5432, user: "toro_alegra_writer_v1", database: "postgres", pipeline: false,
      ssl: { ca, servername: "db.abtyrbqlqbsastmridzp.supabase.co", rejectUnauthorized: true, minVersion: "TLSv1.2" } });
    expect(f.configs[0]).not.toHaveProperty("connectionString");
    await session.close(); await session.close();
    expect(f.events.filter(e => e === "connect")).toHaveLength(1);
    expect(f.events.filter(e => e === "end")).toHaveLength(1);
    await expect(session.query("select 1", [])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
  });
  it("rejects a different CA or broad principal before reading any credential", () => {
    const f = fixture();
    expect(() => createAlegraDedicatedSession({ ...f.options, ca: "wrong" })).toThrow("ALEGRA_SESSION_BINDING_REQUIRED");
    expect(() => createAlegraDedicatedSession({ ...f.options, principal: "postgres" as never })).toThrow("ALEGRA_SESSION_BINDING_REQUIRED");
    expect(f.readPassword).not.toHaveBeenCalled();
  });
  it.each(["connect", "tls", "identity", "query"])("permanently poisons %s failures without replay or raw error", async kind => {
    const f = fixture(), session = createAlegraDedicatedSession(f.options);
    if (kind === "connect") f.failConnect();
    if (kind === "tls") f.untrustedTls();
    if (kind === "identity") f.wrongPrincipal();
    if (kind === "query") f.failQuery();
    await expect(session.query("select $1", [9])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
    await expect(session.query("select $1", [9])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
    await session.close();
    expect(f.events.filter(e => e === "connect")).toHaveLength(1);
    expect(f.events.filter(e => e === "select $1")).toHaveLength(0);
    expect(f.readPassword).toHaveBeenCalledTimes(1);
  });
  it("never replays a failed application query", async () => {
    const f = fixture(), session = createAlegraDedicatedSession(f.options);
    await session.query("select $1", [1]); f.failQuery();
    await expect(session.query("select $1", [2])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
    await expect(session.query("select $1", [2])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
    expect(f.events.filter(e => e === "select $1")).toHaveLength(2);
    await session.close();
  });
  it("handles an asynchronous driver error and rejects concurrent session use", async () => {
    const f = fixture(), session = createAlegraDedicatedSession(f.options);
    const first = session.query("select $1", [1]);
    await expect(session.query("select $1", [2])).rejects.toThrow("ALEGRA_SESSION_BUSY");
    await first; f.poison();
    await expect(session.query("select $1", [3])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
    await session.close();
  });
  it("sanitizes credential and close errors, never reconnecting", async () => {
    const f = fixture(); f.options.readPassword = vi.fn(async () => { throw new Error("SECRET"); });
    const session = createAlegraDedicatedSession(f.options);
    await expect(session.query("select 1", [])).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
    expect(await session.close()).toBe(true); expect(f.configs).toHaveLength(0);
    const g = fixture(), other = createAlegraDedicatedSession(g.options);
    await other.query("select 1", []); g.failEnd();
    expect(await other.close()).toBe(false); expect(await other.close()).toBe(false);
  });
  it("does not open a session after close while credential loading was pending", async () => {
    const f = fixture(); let release!: (password: string) => void;
    f.options.readPassword = vi.fn(() => new Promise<string>(resolve => { release = resolve; }));
    const session = createAlegraDedicatedSession(f.options);
    const pending = session.query("select 1", []);
    await session.close(); release("SYNTHETIC_PASSWORD_NOT_REAL");
    await expect(pending).rejects.toThrow("ALEGRA_SESSION_UNAVAILABLE");
    expect(f.configs).toHaveLength(0); expect(f.events).toHaveLength(0);
  });
});
