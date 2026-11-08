import { createHmac } from "node:crypto";

/** Transport identifiers are opaque. Never put raw phone numbers or chat IDs in TORO rows. */
export function channelSubjectHash(secret: string, account: string, subject: string) {
  if (secret.length < 32 || !account.trim() || !subject.trim()) {
    throw new Error("Channel identity is not configured.");
  }
  return createHmac("sha256", secret)
    .update(JSON.stringify([account, subject]))
    .digest("hex");
}

export type ChannelActor = {
  userId: string;
  orgId: string;
  bindingStatus: "verified" | "revoked" | "unverified";
  membershipStatus: "active" | "inactive";
  capabilities: readonly string[];
};

export function authorizeChannelLedger(
  actor: ChannelActor | null,
  thread: { orgId: string; userId: string },
  capability: "conversation.read" | "conversation.write",
) {
  return Boolean(
    actor &&
      actor.bindingStatus === "verified" &&
      actor.membershipStatus === "active" &&
      actor.orgId === thread.orgId &&
      actor.userId === thread.userId &&
      actor.capabilities.includes(capability),
  );
}

export type ChannelRecordKind =
  | "guest_list"
  | "maintenance_note"
  | "receipt"
  | "closing"
  | "news";

const RECORD_KINDS = new Set<ChannelRecordKind>([
  "guest_list", "maintenance_note", "receipt", "closing", "news",
]);

export function validateChannelRecord(input: unknown):
  | { ok: true; value: { kind: ChannelRecordKind; title: string; body: string; evidenceRefs: string[]; messageId: string } }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Invalid record." };
  }
  const row = input as Record<string, unknown>;
  if (typeof row.kind !== "string" || !RECORD_KINDS.has(row.kind as ChannelRecordKind)) {
    return { ok: false, error: "Unsupported record kind." };
  }
  if (typeof row.title !== "string" || !row.title.trim() || row.title.length > 180 ||
      typeof row.body !== "string" || !row.body.trim() || row.body.length > 10000 ||
      typeof row.messageId !== "string" || !/^[A-Za-z0-9._:-]{4,180}$/.test(row.messageId)) {
    return { ok: false, error: "Invalid record fields." };
  }
  if (!Array.isArray(row.evidenceRefs) || row.evidenceRefs.length > 20 ||
      !row.evidenceRefs.every((ref) => typeof ref === "string" && /^[A-Za-z0-9/_:.-]{4,300}$/.test(ref))) {
    return { ok: false, error: "Invalid evidence references." };
  }
  return {
    ok: true,
    value: {
      kind: row.kind as ChannelRecordKind,
      title: row.title.trim(),
      body: row.body.trim(),
      evidenceRefs: row.evidenceRefs as string[],
      messageId: row.messageId,
    },
  };
}

export function channelCapabilityState(input: {
  paired: boolean;
  allowed: boolean;
  sourceHealthy: boolean;
  sourceFresh: boolean;
}) {
  if (!input.paired || !input.allowed) return "DENIED" as const;
  if (!input.sourceHealthy) return "UNAVAILABLE" as const;
  if (!input.sourceFresh) return "STALE" as const;
  return "READY" as const;
}


export const CHANNEL_DRAFT_ACTION_SCHEMA = "channel-draft-action-v1" as const;

export type ChannelDraftAction = {
  schemaVersion: typeof CHANNEL_DRAFT_ACTION_SCHEMA;
  operationKey: string;
  accountId: string;
  purposeKey: string;
  chatRef: string;
  caseRef: string;
  shiftRef: string;
  destinationBindingId: string;
  expectedVersion: number;
  draftBody: string;
  sourceKind: "live_transport" | "historical_import";
  attachments: Array<{
    evidenceRef: string;
    state: "ready" | "pending" | "failed";
  }>;
};

export type ChannelDraftContext = {
  orgId: string;
  userId: string;
  accountId: string;
  purposeKey: string;
  chatRef: string;
  caseRef: string;
  shiftRef: string;
  destinationBindingId: string;
  currentVersion: number;
  humanTakeover: boolean;
};

export type ChannelDraftTransition = "draft.read" | "draft.save" | "reply.prepare";

const CHANNEL_DRAFT_FIELDS = new Set([
  "schemaVersion", "operationKey", "accountId", "purposeKey", "chatRef", "caseRef",
  "shiftRef", "destinationBindingId", "expectedVersion", "draftBody", "sourceKind", "attachments",
]);
const CHANNEL_REF = /^[A-Za-z0-9/_:.-]{4,300}$/;

export function validateChannelDraftAction(input: unknown):
  | { ok: true; value: ChannelDraftAction }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Invalid channel draft action." };
  }
  const row = input as Record<string, unknown>;
  if (Object.keys(row).some((field) => !CHANNEL_DRAFT_FIELDS.has(field))) {
    return { ok: false, error: "Channel draft scope must be resolved by the server." };
  }
  const refs = ["operationKey", "accountId", "purposeKey", "chatRef", "caseRef", "shiftRef", "destinationBindingId"] as const;
  if (row.schemaVersion !== CHANNEL_DRAFT_ACTION_SCHEMA ||
      !refs.every((field) => typeof row[field] === "string" && CHANNEL_REF.test(row[field] as string)) ||
      typeof row.draftBody !== "string" || !row.draftBody.trim() || row.draftBody.length > 10000 ||
      !Number.isSafeInteger(row.expectedVersion) || (row.expectedVersion as number) < 0 ||
      (row.sourceKind !== "live_transport" && row.sourceKind !== "historical_import") ||
      !Array.isArray(row.attachments) || row.attachments.length > 20) {
    return { ok: false, error: "Invalid channel draft fields." };
  }
  const attachments = row.attachments as unknown[];
  if (!attachments.every((attachment) => {
    if (!attachment || typeof attachment !== "object" || Array.isArray(attachment)) return false;
    const item = attachment as Record<string, unknown>;
    return Object.keys(item).every((field) => field === "evidenceRef" || field === "state") &&
      typeof item.evidenceRef === "string" && CHANNEL_REF.test(item.evidenceRef) &&
      (item.state === "ready" || item.state === "pending" || item.state === "failed");
  })) {
    return { ok: false, error: "Invalid channel draft attachments." };
  }
  const evidenceRefs = attachments.map((attachment) => (attachment as { evidenceRef: string }).evidenceRef);
  if (new Set(evidenceRefs).size !== evidenceRefs.length) {
    return { ok: false, error: "Duplicate channel draft attachments." };
  }
  return { ok: true, value: row as ChannelDraftAction };
}

type ChannelDraftPolicyDecision =
  | { ok: true; capability: "conversation.read" | "conversation.write" }
  | { ok: false; error: string };

function authorizeChannelDraftPolicy(
  actor: ChannelActor | null,
  context: ChannelDraftContext,
  action: ChannelDraftAction,
  transition: ChannelDraftTransition,
): ChannelDraftPolicyDecision {
  const capability = transition === "draft.read" ? "conversation.read" : "conversation.write";
  if (!authorizeChannelLedger(actor, context, capability)) {
    return { ok: false, error: "channel_actor_denied" };
  }
  if (
    action.accountId !== context.accountId ||
    action.purposeKey !== context.purposeKey ||
    action.chatRef !== context.chatRef ||
    action.caseRef !== context.caseRef ||
    action.shiftRef !== context.shiftRef ||
    action.destinationBindingId !== context.destinationBindingId
  ) {
    return { ok: false, error: "channel_context_mismatch" };
  }
  if (transition !== "draft.read" && action.sourceKind === "historical_import") {
    return { ok: false, error: "historical_source_read_only" };
  }
  if (transition !== "draft.read" && context.humanTakeover) {
    return { ok: false, error: "human_takeover_active" };
  }
  if (transition !== "draft.read" && action.expectedVersion !== context.currentVersion) {
    return { ok: false, error: "draft_version_conflict" };
  }
  if (transition === "reply.prepare" && action.attachments.some((attachment) => attachment.state !== "ready")) {
    return { ok: false, error: "attachment_incomplete" };
  }
  return { ok: true, capability };
}

export function authorizeChannelDraftAction(
  actor: ChannelActor | null,
  context: ChannelDraftContext,
  action: ChannelDraftAction,
  transition: ChannelDraftTransition,
):
  | { ok: true; capability: "conversation.read"; writer: null }
  | { ok: false; error: string } {
  const decision = authorizeChannelDraftPolicy(actor, context, action, transition);
  if (!decision.ok) return decision;
  if (transition !== "draft.read") {
    return { ok: false, error: "channel_draft_writer_unavailable" };
  }
  return {
    ok: true,
    capability: "conversation.read",
    writer: null,
  };
}

export type ChannelDraftStoreKey = {
  orgId: string;
  userId: string;
  accountId: string;
  purposeKey: string;
  chatRef: string;
  caseRef: string;
  shiftRef: string;
  destinationBindingId: string;
};

export type ChannelDraftStoredRecord = ChannelDraftStoreKey & {
  operationKey: string;
  version: number;
  draftBody: string;
  sourceKind: ChannelDraftAction["sourceKind"];
  attachments: ChannelDraftAction["attachments"];
};

export type ChannelDraftStore = {
  findByOperationKey(
    key: ChannelDraftStoreKey & { operationKey: string },
  ): Promise<ChannelDraftStoredRecord | null>;
  compareAndSwap(input: {
    key: ChannelDraftStoreKey;
    expectedVersion: number;
    next: ChannelDraftStoredRecord;
  }): Promise<boolean>;
  read(key: ChannelDraftStoreKey): Promise<ChannelDraftStoredRecord | null>;
};

export type ChannelDraftCanonicalPort = {
  findByOperationKey(
    key: ChannelDraftStoreKey & { operationKey: string },
  ): Promise<{ data: unknown; error?: unknown }>;
  compareAndSwap(input: {
    key: ChannelDraftStoreKey;
    expectedVersion: number;
    next: ChannelDraftStoredRecord;
  }): Promise<{ data: unknown; error?: unknown }>;
  read(
    key: ChannelDraftStoreKey,
  ): Promise<{ data: unknown; error?: unknown }>;
};

const CHANNEL_DRAFT_STORED_FIELDS = new Set([
  "orgId", "userId", "accountId", "purposeKey", "chatRef", "caseRef",
  "shiftRef", "destinationBindingId", "operationKey", "version", "draftBody",
  "sourceKind", "attachments",
]);

function normalizeChannelDraftStoredRecord(
  input: unknown,
  expectedKey: ChannelDraftStoreKey,
  expectedOperationKey?: string,
): ChannelDraftStoredRecord | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const row = input as Record<string, unknown>;
  if (Object.keys(row).some((field) => !CHANNEL_DRAFT_STORED_FIELDS.has(field))) return null;
  if (!Object.entries(expectedKey).every(([field, value]) => row[field] === value)) return null;
  if (
    typeof row.operationKey !== "string" ||
    !CHANNEL_REF.test(row.operationKey) ||
    (expectedOperationKey !== undefined && row.operationKey !== expectedOperationKey) ||
    !Number.isSafeInteger(row.version) ||
    (row.version as number) < 1 ||
    typeof row.draftBody !== "string" ||
    !row.draftBody.trim() ||
    row.draftBody.length > 10000 ||
    (row.sourceKind !== "live_transport" && row.sourceKind !== "historical_import") ||
    !Array.isArray(row.attachments) ||
    row.attachments.length > 20
  ) {
    return null;
  }
  const attachments = row.attachments as unknown[];
  if (!attachments.every((attachment) => {
    if (!attachment || typeof attachment !== "object" || Array.isArray(attachment)) return false;
    const item = attachment as Record<string, unknown>;
    return Object.keys(item).every((field) => field === "evidenceRef" || field === "state") &&
      Object.keys(item).length === 2 &&
      typeof item.evidenceRef === "string" &&
      CHANNEL_REF.test(item.evidenceRef) &&
      (item.state === "ready" || item.state === "pending" || item.state === "failed");
  })) {
    return null;
  }
  const normalizedAttachments = attachments.map((attachment) => {
    const item = attachment as ChannelDraftStoredRecord["attachments"][number];
    return { evidenceRef: item.evidenceRef, state: item.state };
  });
  if (new Set(normalizedAttachments.map((attachment) => attachment.evidenceRef)).size !== normalizedAttachments.length) {
    return null;
  }
  return {
    ...expectedKey,
    operationKey: row.operationKey,
    version: row.version as number,
    draftBody: row.draftBody,
    sourceKind: row.sourceKind,
    attachments: normalizedAttachments,
  };
}

/**
 * Reviewable adapter boundary for a future canonical backend.
 * It binds no RPC name, credentials or live writer. The server must inject a
 * reviewed port; transport errors and malformed/cross-scope rows fail closed.
 */
export function createChannelDraftCanonicalStoreAdapter(
  port: ChannelDraftCanonicalPort,
): ChannelDraftStore {
  return {
    async findByOperationKey(key) {
      const result = await port.findByOperationKey(key);
      if (result.error) throw new Error("channel_draft_lookup_failed");
      if (result.data === null) return null;
      const record = normalizeChannelDraftStoredRecord(result.data, key, key.operationKey);
      if (!record) throw new Error("channel_draft_lookup_invalid");
      return record;
    },
    async compareAndSwap(input) {
      const result = await port.compareAndSwap(input);
      if (result.error || typeof result.data !== "boolean") {
        throw new Error("channel_draft_compare_invalid");
      }
      return result.data;
    },
    async read(key) {
      const result = await port.read(key);
      if (result.error) throw new Error("channel_draft_read_failed");
      if (result.data === null) return null;
      const record = normalizeChannelDraftStoredRecord(result.data, key);
      if (!record) throw new Error("channel_draft_read_invalid");
      return record;
    },
  };
}

export type ChannelDraftMutationResult =
  | { ok: true; replayed: boolean; record: ChannelDraftStoredRecord }
  | { ok: false; error: string; effect: "none" | "unknown" };

function channelDraftStoreKey(
  context: ChannelDraftContext,
): ChannelDraftStoreKey {
  return {
    orgId: context.orgId,
    userId: context.userId,
    accountId: context.accountId,
    purposeKey: context.purposeKey,
    chatRef: context.chatRef,
    caseRef: context.caseRef,
    shiftRef: context.shiftRef,
    destinationBindingId: context.destinationBindingId,
  };
}

function canonicalDraftAttachments(attachments: ChannelDraftAction["attachments"]) {
  return [...attachments]
    .map((attachment) => ({
      evidenceRef: attachment.evidenceRef,
      state: attachment.state,
    }))
    .sort((left, right) => left.evidenceRef.localeCompare(right.evidenceRef));
}

function channelDraftRecordFingerprint(record: ChannelDraftStoredRecord) {
  return JSON.stringify({
    orgId: record.orgId,
    userId: record.userId,
    accountId: record.accountId,
    purposeKey: record.purposeKey,
    chatRef: record.chatRef,
    caseRef: record.caseRef,
    shiftRef: record.shiftRef,
    destinationBindingId: record.destinationBindingId,
    operationKey: record.operationKey,
    version: record.version,
    draftBody: record.draftBody,
    sourceKind: record.sourceKind,
    attachments: canonicalDraftAttachments(record.attachments),
  });
}

function channelDraftRecordsEqual(
  left: ChannelDraftStoredRecord,
  right: ChannelDraftStoredRecord,
) {
  return channelDraftRecordFingerprint(left) === channelDraftRecordFingerprint(right);
}

function channelDraftRecordForAction(
  key: ChannelDraftStoreKey,
  action: ChannelDraftAction,
): ChannelDraftStoredRecord {
  return {
    ...key,
    operationKey: action.operationKey,
    version: action.expectedVersion + 1,
    draftBody: action.draftBody,
    sourceKind: action.sourceKind,
    attachments: canonicalDraftAttachments(action.attachments),
  };
}

/**
 * Server-side persistence contract only. No live store is bound here.
 * A caller must inject the reviewed canonical writer; missing bindings fail closed.
 */
export async function persistChannelDraft(
  actor: ChannelActor | null,
  context: ChannelDraftContext,
  input: unknown,
  store?: ChannelDraftStore,
): Promise<ChannelDraftMutationResult> {
  const parsed = validateChannelDraftAction(input);
  if (!parsed.ok) return { ok: false, error: parsed.error, effect: "none" };
  const action = parsed.value;
  const decision = authorizeChannelDraftPolicy(actor, context, action, "draft.save");
  if (!decision.ok) return { ...decision, effect: "none" };
  if (!store) {
    return { ok: false, error: "channel_draft_writer_unavailable", effect: "none" };
  }

  const key = channelDraftStoreKey(context);
  let existing: ChannelDraftStoredRecord | null;
  try {
    existing = await store.findByOperationKey({ ...key, operationKey: action.operationKey });
  } catch {
    return { ok: false, error: "channel_draft_store_unavailable", effect: "none" };
  }

  const next = channelDraftRecordForAction(key, action);
  if (existing) {
    if (channelDraftRecordsEqual(existing, next)) {
      return { ok: true, replayed: true, record: existing };
    }
    return { ok: false, error: "draft_operation_conflict", effect: "none" };
  }

  let applied: boolean;
  try {
    applied = await store.compareAndSwap({
      key,
      expectedVersion: action.expectedVersion,
      next,
    });
  } catch {
    return { ok: false, error: "draft_write_result_unknown", effect: "unknown" };
  }
  if (!applied) {
    return { ok: false, error: "draft_version_conflict", effect: "none" };
  }

  let readback: ChannelDraftStoredRecord | null;
  try {
    readback = await store.read(key);
  } catch {
    return { ok: false, error: "draft_readback_unavailable", effect: "unknown" };
  }
  if (!readback || !channelDraftRecordsEqual(readback, next)) {
    return { ok: false, error: "draft_readback_mismatch", effect: "unknown" };
  }
  return { ok: true, replayed: false, record: readback };
}
