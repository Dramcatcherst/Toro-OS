import { describe, expect, it } from "vitest";
import { authorizeChannelLedger, channelCapabilityState, channelSubjectHash, validateChannelRecord } from "./channel-ledger";

const actor = {
  userId: "owner", orgId: "dreamcatcher", bindingStatus: "verified" as const,
  membershipStatus: "active" as const, capabilities: ["conversation.read", "conversation.write"],
};
const thread = { userId: "owner", orgId: "dreamcatcher" };

describe("channel ledger boundaries", () => {
  it("isolates identical sender IDs across channel accounts and rejects weak secrets", () => {
    const key = "a".repeat(32);
    expect(channelSubjectHash(key, "hotel", "sender"))
      .not.toBe(channelSubjectHash(key, "personal", "sender"));
    expect(() => channelSubjectHash("short", "hotel", "sender")).toThrow();
  });

  it("denies unpaired, revoked, inactive, cross-user and cross-org reads", () => {
    expect(authorizeChannelLedger(actor, thread, "conversation.read")).toBe(true);
    expect(authorizeChannelLedger(null, thread, "conversation.read")).toBe(false);
    expect(authorizeChannelLedger({ ...actor, bindingStatus: "revoked" }, thread, "conversation.read")).toBe(false);
    expect(authorizeChannelLedger({ ...actor, membershipStatus: "inactive" }, thread, "conversation.read")).toBe(false);
    expect(authorizeChannelLedger(actor, { ...thread, userId: "employee" }, "conversation.read")).toBe(false);
    expect(authorizeChannelLedger(actor, { ...thread, orgId: "other" }, "conversation.read")).toBe(false);
    expect(authorizeChannelLedger({ ...actor, capabilities: ["conversation.read"] }, thread, "conversation.write")).toBe(false);
  });

  it("requires durable records to carry provider message identity and evidence references", () => {
    const record = { kind: "guest_list", title: "Invitados", body: "Ana, Luis", messageId: "wamid.1234", evidenceRefs: ["dropbox/media/1234"] };
    expect(validateChannelRecord(record).ok).toBe(true);
    expect(validateChannelRecord({ ...record, messageId: "" }).ok).toBe(false);
    expect(validateChannelRecord({ ...record, evidenceRefs: ["https://example.com/?token=secret"] }).ok).toBe(false);
  });

  it("distinguishes permission failure from source outage and stale mirror", () => {
    expect(channelCapabilityState({ paired: false, allowed: true, sourceHealthy: true, sourceFresh: true })).toBe("DENIED");
    expect(channelCapabilityState({ paired: true, allowed: true, sourceHealthy: false, sourceFresh: true })).toBe("UNAVAILABLE");
    expect(channelCapabilityState({ paired: true, allowed: true, sourceHealthy: true, sourceFresh: false })).toBe("STALE");
  });
});
