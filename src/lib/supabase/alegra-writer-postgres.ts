import "server-only";
import { createAlegraWriterRpcClient, type AlegraWriterRpcName } from "./alegra-writer-rpc";

type Query = (sql: string, values: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;
const statements: Record<AlegraWriterRpcName, { keys: string[]; casts: string[] }> = {
  toro_admit_approved_alegra_execution_v1: {
    keys: ["p_org_id", "p_run_id", "p_worker_id", "p_expected_fencing_token", "p_approval_receipt_id", "p_approval_id", "p_approval_actor_id", "p_approval_approved_at", "p_approval_expires_at", "p_payload_hash", "p_decision_revision", "p_lease_seconds"],
    casts: ["uuid", "uuid", "text", "bigint", "uuid", "text", "text", "timestamptz", "timestamptz", "text", "text", "integer"],
  },
  toro_finalize_alegra_execution_v1: { keys: ["p_org_id", "p_run_id", "p_worker_id", "p_fencing_token", "p_prepared_receipt_id", "p_outcome", "p_receipt"], casts: ["uuid", "uuid", "text", "bigint", "uuid", "text", "jsonb"] },
  toro_heartbeat_alegra_execution_v1: { keys: ["p_org_id", "p_run_id", "p_worker_id", "p_fencing_token", "p_prepared_receipt_id", "p_lease_seconds"], casts: ["uuid", "uuid", "text", "bigint", "uuid", "integer"] },
  toro_recover_expired_alegra_execution_v1: { keys: ["p_org_id", "p_run_id", "p_recovery_worker_id", "p_expected_fencing_token", "p_prepared_receipt_id"], casts: ["uuid", "uuid", "text", "bigint", "uuid"] },
};
/**
 * Prepared adapter; does not open a connection, load secrets or enable LOGIN.
 * The host must inject ONE exclusively leased, TLS-verified direct session.
 * Metadata alone is not TLS/project attestation: native connection acceptance
 * and secure credential delivery remain separate production gates.
 */
export function createDedicatedAlegraPostgresClient(input: {
  projectId: string; host: string; port: number; user: string; database: string;
  tlsVerified: boolean; query: Query;
}) {
  if (input.projectId !== "abtyrbqlqbsastmridzp" || input.host !== "db.abtyrbqlqbsastmridzp.supabase.co" ||
      input.port !== 5432 || input.user !== "toro_alegra_writer_v1" || input.database !== "postgres" ||
      input.tlsVerified !== true || typeof input.query !== "function") throw new Error("ALEGRA_WRITER_CONNECTION_BINDING_REQUIRED");
  const query = input.query;
  return createAlegraWriterRpcClient({ authenticatedRpc: async (name, args) => {
    const identity = await query("select current_user as principal, session_user as login_principal, current_database() as database", []);
    if (identity.rows.length !== 1 || identity.rows[0].principal !== "toro_alegra_writer_v1" ||
        identity.rows[0].login_principal !== "toro_alegra_writer_v1" || identity.rows[0].database !== "postgres") throw new Error("ALEGRA_WRITER_PRINCIPAL_REQUIRED");
    const statement = statements[name];
    const sql = `select public.${name}(${statement.casts.map((cast, index) => `$${index + 1}::${cast}`).join(",")}) as result`;
    const result = await query(sql, statement.keys.map(key => args[key]));
    if (result.rows.length !== 1 || !Object.hasOwn(result.rows[0], "result")) throw new Error("ALEGRA_WRITER_RPC_RESULT_REQUIRED");
    return { data: result.rows[0].result, error: null };
  } });
}
