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
