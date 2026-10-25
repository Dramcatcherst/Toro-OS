import "server-only";
import { assertInternalRuntime } from "@/lib/server/public-demo";

const writerRpcCapability = Symbol("AlegraWriterRpcClient");
export type AlegraWriterRpcName =
  | "toro_admit_approved_alegra_execution_v1"
  | "toro_heartbeat_alegra_execution_v1"
  | "toro_finalize_alegra_execution_v1"
  | "toro_recover_expired_alegra_execution_v1";
type RpcResult = { data: unknown; error: { message: string } | null };
export type AlegraWriterRpcClient = {
  readonly [writerRpcCapability]: true;
  rpc(name: AlegraWriterRpcName, args: Readonly<Record<string, unknown>>): Promise<RpcResult>;
};

const rpcArguments = new Map<AlegraWriterRpcName, readonly string[]>([
  ["toro_admit_approved_alegra_execution_v1", ["p_org_id", "p_run_id", "p_worker_id", "p_expected_fencing_token", "p_approval_receipt_id", "p_approval_id", "p_approval_actor_id", "p_approval_approved_at", "p_approval_expires_at", "p_payload_hash", "p_decision_revision", "p_lease_seconds"]],
  ["toro_heartbeat_alegra_execution_v1", ["p_org_id", "p_run_id", "p_worker_id", "p_fencing_token", "p_prepared_receipt_id", "p_lease_seconds"]],
  ["toro_finalize_alegra_execution_v1", ["p_org_id", "p_run_id", "p_worker_id", "p_fencing_token", "p_prepared_receipt_id", "p_outcome", "p_receipt"]],
  ["toro_recover_expired_alegra_execution_v1", ["p_org_id", "p_run_id", "p_recovery_worker_id", "p_expected_fencing_token", "p_prepared_receipt_id"]],
]);

/**
 * Local RPC-only capability, never an authentication/privilege attestation.
 * The existing server host must supply a separately authenticated, dedicated
 * principal AFTER reviewed database ACL and credential provisioning. This
 * module never reads worker secrets, enables a flag, or creates a credential.
 * SQL remains responsible for values, scope, approval, lease and fencing.
 */
export function createAlegraWriterRpcClient(input: {
  authenticatedRpc: (name: AlegraWriterRpcName, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>;
}): AlegraWriterRpcClient {
  assertInternalRuntime();
  if (process.env.TORO_DEPLOYMENT_MODE !== "internal") throw new Error("ALEGRA_WRITER_INTERNAL_RUNTIME_REQUIRED");
  if (typeof input?.authenticatedRpc !== "function") throw new Error("ALEGRA_WRITER_RPC_TRANSPORT_REQUIRED");
  const authenticatedRpc = input.authenticatedRpc;
  return Object.freeze({
    [writerRpcCapability]: true as const,
    async rpc(name: AlegraWriterRpcName, args: Readonly<Record<string, unknown>>): Promise<RpcResult> {
      const allowed = rpcArguments.get(name);
      if (!allowed) throw new Error("ALEGRA_WRITER_RPC_FORBIDDEN");
      let captured: Record<string, unknown>;
      try {
        if (!args || typeof args !== "object" || Array.isArray(args)) throw new Error();
        captured = structuredClone(args);
        const keys = Object.keys(captured);
        if (keys.length !== allowed.length || allowed.some(key => !Object.hasOwn(captured, key) || captured[key] === undefined)) throw new Error();
      } catch {
        throw new Error("ALEGRA_WRITER_RPC_ARGUMENTS_FORBIDDEN");
      }
      try {
        const result = await authenticatedRpc(name, captured);
        if (result && result.error === null && Object.hasOwn(result, "data")) return { data: result.data, error: null };
      } catch {
        // The caller receives no credential, provider body, URL or raw error.
        // No retry: a lost response can represent a committed transaction.
      }
      return { data: null, error: { message: "ALEGRA_WRITER_RPC_FAILED" } };
    },
  });
}
