import "server-only";
import { assertInternalRuntime, isPortalDeployment } from "@/lib/server/public-demo";
import {
  authorizeChannelLedger, createChannelDraftCanonicalStoreAdapter, validateChannelDraftAction,
  CHANNEL_DRAFT_ACTION_SCHEMA, type ChannelActor, type ChannelDraftContext,
  type ChannelDraftCanonicalPort, type ChannelDraftStoreKey,
} from "./channel-ledger";

type RpcName = "toro_channel_draft_find_v1" | "toro_channel_draft_read_v1" | "toro_channel_draft_cas_v1";
export type ChannelDraftRpc = (name: RpcName, args: Record<string, unknown>) =>
  PromiseLike<{ data: unknown; error?: unknown }>;
export type ResolveChannelDraftAccess = () => Promise<{
  actor: ChannelActor | null;
  context: ChannelDraftContext;
} | null>;

const keyFields = ["orgId", "userId", "accountId", "purposeKey", "chatRef", "caseRef", "shiftRef", "destinationBindingId"] as const;
function snapshotKey(key: ChannelDraftStoreKey): ChannelDraftStoreKey {
  return Object.fromEntries(keyFields.map(field => [field, key[field]])) as ChannelDraftStoreKey;
}
function params(key: ChannelDraftStoreKey) {
  return {
    p_org_id: key.orgId, p_actor_user_id: key.userId, p_account_id: key.accountId,
    p_purpose_key: key.purposeKey, p_chat_ref: key.chatRef, p_case_ref: key.caseRef,
    p_shift_ref: key.shiftRef, p_destination_binding_id: key.destinationBindingId,
  };
}

/**
 * Reviewed RPC binding only. No client/credential allocation, route, flag or live caller.
 * The existing privileged server must inject its RPC and freshly resolved canonical access.
 * Database release and real actor/case acceptance remain separate prerequisites.
 */
function assertDraftRuntime() {
  assertInternalRuntime();
  if (isPortalDeployment()) throw new Error("channel_draft_runtime_unavailable");
}

export function createChannelDraftServerStore(rpc: ChannelDraftRpc, resolveAccess: ResolveChannelDraftAccess) {
  assertDraftRuntime();
  async function authorize(key: ChannelDraftStoreKey, write: boolean) {
    assertDraftRuntime();
    let access: Awaited<ReturnType<ResolveChannelDraftAccess>>;
    try { access = await resolveAccess(); }
    catch { throw new Error("channel_draft_access_denied"); }
    assertDraftRuntime();
    if (!access || !authorizeChannelLedger(access.actor, key, write ? "conversation.write" : "conversation.read") ||
        !keyFields.every(field => access.context[field] === key[field]) ||
        (write && access.context.humanTakeover)) {
      throw new Error("channel_draft_access_denied");
    }
  }
  async function invoke(key: ChannelDraftStoreKey, name: RpcName, args: Record<string, unknown>, write = false) {
    await authorize(key, write);
    let result: { data: unknown; error?: unknown };
    try { result = await rpc(name, args); }
    catch { throw new Error("channel_draft_rpc_unavailable"); }
    // Withhold read content and write confirmation after a concurrent revocation.
    // The existing persistence contract reconciles ambiguous writes by operation key.
    await authorize(key, write);
    if (result.error) throw new Error("channel_draft_rpc_unavailable");
    return { data: result.data };
  }
  const port: ChannelDraftCanonicalPort = {
    async findByOperationKey(input) {
      const key = snapshotKey(input);
      const operationKey = input.operationKey;
      if (!/^[A-Za-z0-9/_:.-]{4,300}$/.test(operationKey)) throw new Error("channel_draft_operation_invalid");
      return invoke(key, "toro_channel_draft_find_v1", { ...params(key), p_operation_key: operationKey });
    },
    async read(input) {
      const key = snapshotKey(input);
      return invoke(key, "toro_channel_draft_read_v1", params(key));
    },
    async compareAndSwap(input) {
      const key = snapshotKey(input.key);
      const next = input.next;
      const parsed = validateChannelDraftAction({
        schemaVersion: CHANNEL_DRAFT_ACTION_SCHEMA, operationKey: next.operationKey,
        accountId: next.accountId, purposeKey: next.purposeKey, chatRef: next.chatRef,
        caseRef: next.caseRef, shiftRef: next.shiftRef, destinationBindingId: next.destinationBindingId,
        expectedVersion: input.expectedVersion, draftBody: next.draftBody,
        sourceKind: next.sourceKind, attachments: next.attachments,
      });
      if (!parsed.ok || !Number.isSafeInteger(next.version) || !keyFields.every(field => next[field] === key[field]) ||
          next.version !== input.expectedVersion + 1 || next.sourceKind !== "live_transport") {
        throw new Error("channel_draft_payload_invalid");
      }
      // Detach request values before any await; a caller cannot mutate in-flight scope/body.
      const action = { ...parsed.value, attachments: parsed.value.attachments.map(item => ({ ...item })) };
      return invoke(key, "toro_channel_draft_cas_v1", {
        ...params(key), p_operation_key: action.operationKey, p_expected_version: action.expectedVersion,
        p_draft_body: action.draftBody, p_source_kind: action.sourceKind, p_attachments: action.attachments,
      }, true);
    },
  };
  return createChannelDraftCanonicalStoreAdapter(port);
}

