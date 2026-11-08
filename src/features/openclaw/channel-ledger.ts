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
  accountId: string;
  purposeKey: string;
  chatRef: string;
  caseRef: string;
  destinationBindingId: string;
  expectedVersion: number;
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
  destinationBindingId: string;
  currentVersion: number;
  humanTakeover: boolean;
};

export type ChannelDraftTransition = "draft.read" | "draft.save" | "reply.prepare";

const CHANNEL_DRAFT_FIELDS = new Set([
  "schemaVersion", "accountId", "purposeKey", "chatRef", "caseRef",
  "destinationBindingId", "expectedVersion", "sourceKind", "attachments",
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
  const refs = ["accountId", "purposeKey", "chatRef", "caseRef", "destinationBindingId"] as const;
  if (row.schemaVersion !== CHANNEL_DRAFT_ACTION_SCHEMA ||
      !refs.every((field) => typeof row[field] === "string" && CHANNEL_REF.test(row[field] as string)) ||
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

export function authorizeChannelDraftAction(
  actor: ChannelActor | null,
  context: ChannelDraftContext,
  action: ChannelDraftAction,
  transition: ChannelDraftTransition,
):
  | { ok: true; capability: "conversation.read" | "conversation.write"; writer: "channel_draft_store" | null }
  | { ok: false; error: string } {
  const capability = transition === "draft.read" ? "conversation.read" : "conversation.write";
  if (!authorizeChannelLedger(actor, context, capability)) {
    return { ok: false, error: "channel_actor_denied" };
  }
  if (
    action.accountId !== context.accountId ||
    action.purposeKey !== context.purposeKey ||
    action.chatRef !== context.chatRef ||
    action.caseRef !== context.caseRef ||
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
  return {
    ok: true,
    capability,
    writer: transition === "draft.read" ? null : "channel_draft_store",
  };
}
