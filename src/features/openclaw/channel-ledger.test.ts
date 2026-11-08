import { describe, expect, it } from "vitest";
import { authorizeChannelDraftAction, authorizeChannelLedger, channelCapabilityState, channelSubjectHash, validateChannelDraftAction, validateChannelRecord } from "./channel-ledger";

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


describe("versioned channel draft contract", () => {
  const action = {
    schemaVersion: "channel-draft-action-v1" as const,
    operationKey: "draft-op-fixture-001",
    accountId: "account-hotel",
    purposeKey: "hotel-operations",
    chatRef: "chat-fixture-001",
    caseRef: "case-fixture-001",
    shiftRef: "shift-2026-11-07-night",
    destinationBindingId: "binding-reception",
    expectedVersion: 7,
    draftBody: "Borrador operativo sin enviar.",
    sourceKind: "live_transport" as const,
    attachments: [{ evidenceRef: "dropbox/media/fixture-001", state: "ready" as const }],
  };
  const context = {
    orgId: "dreamcatcher",
    userId: "owner",
    accountId: action.accountId,
    purposeKey: action.purposeKey,
    chatRef: action.chatRef,
    caseRef: action.caseRef,
    shiftRef: action.shiftRef,
    destinationBindingId: action.destinationBindingId,
    currentVersion: 7,
    humanTakeover: false,
  };

  it("accepts only the versioned identity contract and never client-supplied actor scope", () => {
    expect(validateChannelDraftAction(action)).toEqual({ ok: true, value: action });
    expect(validateChannelDraftAction({ ...action, orgId: "other" })).toEqual({
      ok: false,
      error: "Channel draft scope must be resolved by the server.",
    });
    expect(validateChannelDraftAction({ ...action, attachments: [
      ...action.attachments,
      action.attachments[0],
    ] }).ok).toBe(false);
    expect(validateChannelDraftAction({ ...action, operationKey: "" }).ok).toBe(false);
    expect(validateChannelDraftAction({ ...action, draftBody: " " }).ok).toBe(false);
    expect(validateChannelDraftAction({ ...action, draftBody: "x".repeat(10001) }).ok).toBe(false);
  });

  it("maps reads to the existing ledger and fails closed without a verified draft writer", () => {
    expect(authorizeChannelDraftAction(actor, context, action, "draft.read")).toEqual({
      ok: true,
      capability: "conversation.read",
      writer: null,
    });
    expect(authorizeChannelDraftAction(actor, context, action, "draft.save")).toEqual({
      ok: false,
      error: "channel_draft_writer_unavailable",
    });
    expect(authorizeChannelDraftAction(actor, context, action, "reply.prepare")).toEqual({
      ok: false,
      error: "channel_draft_writer_unavailable",
    });
  });

  it.each([
    ["accountId", "account-personal"],
    ["purposeKey", "owner-private"],
    ["chatRef", "chat-other"],
    ["caseRef", "case-other"],
    ["shiftRef", "shift-other"],
    ["destinationBindingId", "binding-other"],
  ] as const)("denies a context switch in %s", (field, value) => {
    expect(authorizeChannelDraftAction(actor, context, { ...action, [field]: value }, "draft.save"))
      .toEqual({ ok: false, error: "channel_context_mismatch" });
  });

  it("keeps the assigned shift across local midnight and never derives it from the calendar date", () => {
    expect(authorizeChannelDraftAction(actor, context, action, "draft.read").ok).toBe(true);
    expect(authorizeChannelDraftAction(
      actor,
      { ...context, shiftRef: "shift-2026-11-08-day" },
      action,
      "draft.read",
    )).toEqual({ ok: false, error: "channel_context_mismatch" });
    expect(validateChannelDraftAction({ ...action, localDate: "2026-11-08" })).toEqual({
      ok: false,
      error: "Channel draft scope must be resolved by the server.",
    });
  });

  it("denies other identities and scopes before choosing a writer", () => {
    expect(authorizeChannelDraftAction({ ...actor, userId: "employee" }, context, action, "draft.save"))
      .toEqual({ ok: false, error: "channel_actor_denied" });
    expect(authorizeChannelDraftAction({ ...actor, orgId: "other" }, context, action, "draft.save"))
      .toEqual({ ok: false, error: "channel_actor_denied" });
  });

  it("prevents double response after human takeover and stale concurrent edits", () => {
    expect(authorizeChannelDraftAction(actor, { ...context, humanTakeover: true }, action, "reply.prepare"))
      .toEqual({ ok: false, error: "human_takeover_active" });
    expect(authorizeChannelDraftAction(actor, { ...context, currentVersion: 8 }, action, "draft.save"))
      .toEqual({ ok: false, error: "draft_version_conflict" });
  });

  it("keeps incomplete attachments valid for recovery but never prepares a reply", () => {
    const pending = { ...action, attachments: [{ ...action.attachments[0], state: "pending" as const }] };
    expect(validateChannelDraftAction(pending)).toEqual({ ok: true, value: pending });
    expect(authorizeChannelDraftAction(actor, context, pending, "draft.save"))
      .toEqual({ ok: false, error: "channel_draft_writer_unavailable" });
    expect(authorizeChannelDraftAction(actor, context, pending, "reply.prepare"))
      .toEqual({ ok: false, error: "attachment_incomplete" });
  });

  it("keeps historical imports readable and rejects writes or simulated replies", () => {
    const historical = { ...action, sourceKind: "historical_import" as const };
    expect(authorizeChannelDraftAction(actor, context, historical, "draft.read").ok).toBe(true);
    expect(authorizeChannelDraftAction(actor, context, historical, "draft.save"))
      .toEqual({ ok: false, error: "historical_source_read_only" });
    expect(authorizeChannelDraftAction(actor, context, historical, "reply.prepare"))
      .toEqual({ ok: false, error: "historical_source_read_only" });
  });
});
