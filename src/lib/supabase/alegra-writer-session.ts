import "server-only";
import { createHash } from "node:crypto";
import { checkServerIdentity, type PeerCertificate } from "node:tls";

const HOST = "db.abtyrbqlqbsastmridzp.supabase.co";
export const ALEGRA_DATABASE_CA_SHA256 = "700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7";
type Principal = "toro_alegra_writer_v1" | "toro_alegra_writer_reader_v1";
type QueryResult = { rows: Array<Record<string, unknown>> };
export type AlegraPgClient = {
  connect(): Promise<void>;
  query(sql: string, values: unknown[]): Promise<QueryResult>;
  end(): Promise<void>;
  on(name: "error", handler: () => void): unknown;
  connection: { stream: { encrypted?: boolean; authorized?: boolean; destroy?: () => void; getPeerCertificate(): { subjectaltname?: string } } };
};
export type AlegraPgConstructor = new (options: Record<string, unknown>) => AlegraPgClient;

/** Internal transport, never exposed as a model tool or generic SQL endpoint.
 * One pinned pg.Client for its entire lifetime. No Pool, SET ROLE or reconnect.
 * The manual host creates separate instances for reader and four-RPC Writer.
 */
export function createAlegraDedicatedSession(input: {
  Client: AlegraPgConstructor; ca: string; principal: Principal; readPassword: () => Promise<string>;
}) {
  if (process.env.TORO_DEPLOYMENT_MODE !== "internal" || typeof input.Client !== "function" ||
      !["toro_alegra_writer_v1", "toro_alegra_writer_reader_v1"].includes(input.principal) ||
      typeof input.readPassword !== "function" || typeof input.ca !== "string" ||
      createHash("sha256").update(input.ca).digest("hex") !== ALEGRA_DATABASE_CA_SHA256) throw new Error("ALEGRA_SESSION_BINDING_REQUIRED");
  const { Client, ca, principal, readPassword } = input;
  let client: AlegraPgClient | undefined;
  let started = false, poisoned = false, closed = false, busy = false;
  let closeResult: Promise<boolean> | undefined;
  function destroy() { try { client?.connection.stream.destroy?.(); } catch { /* no raw driver errors */ } }
  async function bounded<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([operation, new Promise<never>((_, reject) => {
        timer = setTimeout(() => { poisoned = true; destroy(); reject(new Error("ALEGRA_SESSION_UNAVAILABLE")); }, milliseconds);
      })]);
    } finally { if (timer) clearTimeout(timer); }
  }
  async function open() {
    if (client && !poisoned && !closed) return client;
    if (started || poisoned || closed) throw new Error();
    started = true;
    const password = await bounded(readPassword(), 5_000);
    if (closed || poisoned) throw new Error();
    if (typeof password !== "string" || password.length < 16 || password.length > 1024 || /[\r\n\0]/.test(password)) throw new Error();
    client = new Client({ host: HOST, port: 5432, database: "postgres", user: principal, password,
      application_name: "toro-alegra-writer-v1", connectionTimeoutMillis: 10_000,
      statement_timeout: 10_000, lock_timeout: 5_000, query_timeout: 12_000,
      sslnegotiation: "postgres", pipeline: false,
      ssl: { ca, rejectUnauthorized: true, servername: HOST, checkServerIdentity, minVersion: "TLSv1.2" } });
    client.on("error", () => { poisoned = true; });
    await bounded(client.connect(), 10_000);
    const stream = client.connection.stream;
    if (poisoned || stream.encrypted !== true || stream.authorized !== true ||
        checkServerIdentity(HOST, stream.getPeerCertificate() as PeerCertificate)) throw new Error();
    const identity = await bounded(client.query("select current_user as principal, session_user as login_principal, current_database() as database", []), 12_000);
    if (poisoned || identity.rows.length !== 1 || identity.rows[0].principal !== principal ||
        identity.rows[0].login_principal !== principal || identity.rows[0].database !== "postgres") throw new Error();
    return client;
  }
  return Object.freeze({
    async query(sql: string, values: unknown[]): Promise<QueryResult> {
      if (closed || poisoned) throw new Error("ALEGRA_SESSION_UNAVAILABLE");
      if (busy) throw new Error("ALEGRA_SESSION_BUSY");
      busy = true;
      try {
        const connection = await open();
        if (poisoned || closed) throw new Error();
        const result = await bounded(connection.query(sql, values), 12_000);
        if (poisoned || closed) throw new Error();
        return result;
      } catch {
        poisoned = true;
        throw new Error("ALEGRA_SESSION_UNAVAILABLE");
      } finally { busy = false; }
    },
    close(): Promise<boolean> {
      closed = true;
      closeResult ??= (async () => {
        if (!client) return true;
        try { await bounded(client.end(), 5_000); return true; } catch { poisoned = true; destroy(); return false; }
      })();
      return closeResult;
    },
  });
}
