import "server-only";
import { createAlegraDedicatedSession, type AlegraPgConstructor } from "@/lib/supabase/alegra-writer-session";
import { createDedicatedAlegraPostgresClient } from "@/lib/supabase/alegra-writer-postgres";
import { createAlegraWriterRpcClient } from "@/lib/supabase/alegra-writer-rpc";
import { createCanonicalAlegraReader, type CanonicalAlegraReaderTarget } from "./alegra-canonical-reader";
import { createManualAlegraPurchaseCaller } from "./alegra-writer-control-plane";
import { createAlegraNativeHttp } from "./alegra-native-http";

/** Composition for one manual operation on the existing host. No route, timer,
 * queue creation, ambient worker key or approval callbacks from the operator.
 * The packaged entry supplies pinned pg.Client and owner-only secret files.
 */
export function createAlegraManualHost(input: {
  target: CanonicalAlegraReaderTarget; workerId: string; recoveryWorkerId: string;
  Client: AlegraPgConstructor; ca: string; readSecret: (name: string) => Promise<string>;
  now: () => string; fetchImpl?: (url: string, options: RequestInit) => Promise<Response>;
}) {
  if (process.env.TORO_DEPLOYMENT_MODE !== "internal" || typeof input.readSecret !== "function" || typeof input.now !== "function" ||
      !input.workerId?.trim() || !input.recoveryWorkerId?.trim() || input.workerId.trim().toLowerCase() === input.recoveryWorkerId.trim().toLowerCase()) throw new Error("ALEGRA_HOST_BINDING_REQUIRED");
  const { Client, ca, readSecret, now, workerId, recoveryWorkerId } = input;
  const target = Object.freeze({ ...input.target });
  const fetchImpl = input.fetchImpl ?? fetch;
  const readerSession = createAlegraDedicatedSession({ Client, ca, principal: "toro_alegra_writer_reader_v1", readPassword: () => readSecret("alegra-writer-reader-postgres.secret") });
  const writerSession = createAlegraDedicatedSession({ Client, ca, principal: "toro_alegra_writer_v1", readPassword: () => readSecret("alegra-writer-postgres.secret") });
  const reader = createCanonicalAlegraReader({ target, query: readerSession.query, now });
  let writerRpc: ReturnType<typeof createDedicatedAlegraPostgresClient> | undefined;
  const supabase = createAlegraWriterRpcClient({ authenticatedRpc: async (name, args) => {
    if (!writerRpc) {
      // Open/attest the physical session before setting the adapter's metadata
      // assertion. The adapter also checks both principals before every RPC.
      await writerSession.query("select current_user as principal, session_user as login_principal, current_database() as database", []);
      writerRpc = createDedicatedAlegraPostgresClient({ projectId: "abtyrbqlqbsastmridzp", host: "db.abtyrbqlqbsastmridzp.supabase.co", port: 5432,
        database: "postgres", user: "toro_alegra_writer_v1", tlsVerified: true, query: writerSession.query });
    }
    return writerRpc.rpc(name, args);
  } });
  let credentials: Promise<{ email: string; token: string }> | undefined;
  const http = createAlegraNativeHttp({ authenticatedFetch: async (url, options) => {
    const destination = new URL(url);
    if (destination.origin !== "https://api.alegra.com" || !destination.pathname.startsWith("/api/v1/") ||
        options.redirect !== "error" || options.credentials !== "omit") throw new Error("ALEGRA_NATIVE_BINDING_REQUIRED");
    credentials ??= (async () => {
      try {
        const value = JSON.parse(await readSecret("alegra-api.secret"));
        if (typeof value?.email !== "string" || !/^[^\s:@]+@[^\s:@]+$/.test(value.email) ||
            typeof value?.token !== "string" || !value.token || value.token.length > 4096 || /[\r\n\0]/.test(value.token)) throw new Error();
        return { email: value.email as string, token: value.token as string };
      } catch { throw new Error("ALEGRA_NATIVE_CREDENTIAL_UNAVAILABLE"); }
    })();
    const auth = await credentials;
    const headers = new Headers(options.headers);
    headers.set("authorization", "Basic " + Buffer.from(`${auth.email}:${auth.token}`).toString("base64"));
    // Native HTTP already pins verbs/routes/queries, timeout and zero retries.
    return fetchImpl(url, { ...options, headers });
  } });
  let activeOperation: "dispatch" | "recover" = "dispatch";
  const caller = createManualAlegraPurchaseCaller({ target, workerId, recoveryWorkerId, supabase, http, now,
    readCanonicalContext: () => activeOperation === "recover" ? reader.loadForRecovery() : reader.load(),
    authorizeAdmission: reader.authorizeAdmission, authorizeNativeCreate: reader.authorizeNativeCreate });
  let used = false;
  async function operate(operation: "dispatch" | "recover") {
    if (used) return { state: "blocked" as const, reason: "CALLER_ALREADY_USED" };
    used = true;
    activeOperation = operation;
    let result: Record<string, unknown>;
    try {
      const flags = await reader.readFlags();
      if (operation === "dispatch" && (flags.writerEnabled !== true || flags.nativeMutationEnabled !== true)) result = { state: "blocked", reason: "WRITER_DISABLED" };
      else if (operation === "recover" && flags.recoveryEnabled !== true) result = { state: "blocked", reason: "RECOVERY_DISABLED" };
      else result = await caller[operation]();
    } catch {
      // Do not expose credentials or raw SQL/provider responses. No retry.
      result = { state: "blocked", reason: "CANONICAL_CONTEXT_UNAVAILABLE" };
    }
    const readerClosed = await readerSession.close();
    const writerClosed = await writerSession.close();
    return { ...result, sessionsClosed: readerClosed && writerClosed };
  }
  return Object.freeze({ dispatch: () => operate("dispatch"), recover: () => operate("recover") });
}
