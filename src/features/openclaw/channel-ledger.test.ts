import { createChannelDraftServerStore, type ChannelDraftRpc } from "./channel-draft-server";
import type { ChannelActor, ChannelDraftContext } from "./channel-ledger";
import { describe, expect, it } from "vitest";
import { authorizeChannelDraftAction, authorizeChannelLedger, channelCapabilityState, channelSubjectHash, createChannelDraftCanonicalStoreAdapter, persistChannelDraft, validateChannelDraftAction, validateChannelRecord, type ChannelDraftStore, type ChannelDraftStoredRecord } from "./channel-ledger";

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


describe("channel draft CAS runtime contract", () => {
  const action = {
    schemaVersion: "channel-draft-action-v1" as const,
    operationKey: "draft-op-runtime-001",
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

  function fakeStore(options?: {
    initial?: ChannelDraftStoredRecord | null;
    currentVersion?: number;
    readback?: ChannelDraftStoredRecord | null;
    compareThrows?: boolean;
    compareThrowsAfterWrite?: boolean;
    compareReturnsFalseAfterWrite?: boolean;
    lookupThrowsAfterCompare?: boolean;
  }) {
    let record = options?.initial ?? null;
    let version = options?.currentVersion ?? 7;
    let casCalls = 0;
    const store: ChannelDraftStore = {
      async findByOperationKey(key) {
        if (options?.lookupThrowsAfterCompare && casCalls > 0) {
          throw new Error("reconciliation unavailable");
        }
        return record?.operationKey === key.operationKey ? record : null;
      },
      async compareAndSwap(input) {
        casCalls += 1;
        if (options?.compareThrows) throw new Error("ambiguous transport");
        if (version !== input.expectedVersion) return false;
        record = input.next;
        version = input.next.version;
        if (options?.compareThrowsAfterWrite) throw new Error("ambiguous transport after commit");
        if (options?.compareReturnsFalseAfterWrite) return false;
        return true;
      },
      async read() {
        return options && "readback" in options ? options.readback ?? null : record;
      },
    };
    return { store, record: () => record, casCalls: () => casCalls };
  }

  it("fails closed when no canonical store is injected", async () => {
    await expect(persistChannelDraft(actor, context, action)).resolves.toEqual({
      ok: false,
      error: "channel_draft_writer_unavailable",
      effect: "none",
    });
  });

  it("applies one CAS write, verifies readback and replays without a second effect", async () => {
    const fixture = fakeStore();
    const first = await persistChannelDraft(actor, context, action, fixture.store);
    expect(first).toMatchObject({ ok: true, replayed: false, record: { version: 8 } });
    expect(fixture.casCalls()).toBe(1);

    const replay = await persistChannelDraft(
      actor,
      { ...context, currentVersion: 8 },
      action,
      fixture.store,
    );
    expect(replay).toMatchObject({ ok: true, replayed: true, record: { version: 8 } });
    expect(fixture.casCalls()).toBe(1);
  });

  it("rejects stale CAS and operation-key reuse with different content", async () => {
    const stale = fakeStore({ currentVersion: 8 });
    await expect(persistChannelDraft(actor, context, action, stale.store)).resolves.toEqual({
      ok: false,
      error: "draft_version_conflict",
      effect: "none",
    });

    const applied = fakeStore();
    await persistChannelDraft(actor, context, action, applied.store);
    await expect(persistChannelDraft(
      actor,
      { ...context, currentVersion: 8 },
      { ...action, expectedVersion: 8, draftBody: "Contenido distinto." },
      applied.store,
    )).resolves.toEqual({
      ok: false,
      error: "draft_operation_conflict",
      effect: "none",
    });
  });

  it("reconciles committed ambiguous writes and false CAS responses without a retry", async () => {
    const committedThenThrew = fakeStore({ compareThrowsAfterWrite: true });
    await expect(persistChannelDraft(actor, context, action, committedThenThrew.store)).resolves.toMatchObject({
      ok: true,
      replayed: true,
      record: { version: 8 },
    });
    expect(committedThenThrew.casCalls()).toBe(1);

    const concurrentCommit = fakeStore({ compareReturnsFalseAfterWrite: true });
    await expect(persistChannelDraft(actor, context, action, concurrentCommit.store)).resolves.toMatchObject({
      ok: true,
      replayed: true,
      record: { version: 8 },
    });
    expect(concurrentCommit.casCalls()).toBe(1);

    const reconciliationUnavailable = fakeStore({
      currentVersion: 8,
      lookupThrowsAfterCompare: true,
    });
    await expect(persistChannelDraft(
      actor,
      context,
      action,
      reconciliationUnavailable.store,
    )).resolves.toEqual({
      ok: false,
      error: "draft_reconciliation_unavailable",
      effect: "unknown",
    });
    expect(reconciliationUnavailable.casCalls()).toBe(1);
  });

  it("marks an unconfirmed ambiguous write unknown and reconciles failed readback immediately", async () => {
    const ambiguous = fakeStore({ compareThrows: true });
    await expect(persistChannelDraft(actor, context, action, ambiguous.store)).resolves.toEqual({
      ok: false,
      error: "draft_write_result_unknown",
      effect: "unknown",
    });
    expect(ambiguous.casCalls()).toBe(1);

    const missingReadback = fakeStore({ readback: null });
    await expect(persistChannelDraft(actor, context, action, missingReadback.store)).resolves.toMatchObject({
      ok: true,
      replayed: true,
      record: { version: 8 },
    });
    expect(missingReadback.casCalls()).toBe(1);
  });

  it("adapts a reviewed canonical port through one CAS, readback and idempotent replay", async () => {
    let record: ChannelDraftStoredRecord | null = null;
    let compareCalls = 0;
    const store = createChannelDraftCanonicalStoreAdapter({
      async findByOperationKey(key) {
        return { data: record?.operationKey === key.operationKey ? record : null };
      },
      async compareAndSwap(input) {
        compareCalls += 1;
        record = input.next;
        return { data: true };
      },
      async read() {
        return { data: record };
      },
    });

    await expect(persistChannelDraft(actor, context, action, store)).resolves.toMatchObject({
      ok: true,
      replayed: false,
      record: { version: 8 },
    });
    await expect(persistChannelDraft(
      actor,
      { ...context, currentVersion: 8 },
      action,
      store,
    )).resolves.toMatchObject({
      ok: true,
      replayed: true,
      record: { version: 8 },
    });
    expect(compareCalls).toBe(1);
  });

  it("fails closed when the canonical port returns malformed or cross-scope data", async () => {
    const crossScope = {
      orgId: "other",
      userId: context.userId,
      accountId: context.accountId,
      purposeKey: context.purposeKey,
      chatRef: context.chatRef,
      caseRef: context.caseRef,
      shiftRef: context.shiftRef,
      destinationBindingId: context.destinationBindingId,
      operationKey: action.operationKey,
      version: 8,
      draftBody: action.draftBody,
      sourceKind: action.sourceKind,
      attachments: action.attachments,
    };

    const lookupStore = createChannelDraftCanonicalStoreAdapter({
      async findByOperationKey() { return { data: crossScope }; },
      async compareAndSwap() { return { data: true }; },
      async read() { return { data: null }; },
    });
    await expect(persistChannelDraft(actor, context, action, lookupStore)).resolves.toEqual({
      ok: false,
      error: "channel_draft_store_unavailable",
      effect: "none",
    });

    const readbackStore = createChannelDraftCanonicalStoreAdapter({
      async findByOperationKey() { return { data: null }; },
      async compareAndSwap() { return { data: true }; },
      async read() { return { data: crossScope }; },
    });
    await expect(persistChannelDraft(actor, context, action, readbackStore)).resolves.toEqual({
      ok: false,
      error: "draft_readback_unavailable",
      effect: "unknown",
    });

    const malformedCompare = createChannelDraftCanonicalStoreAdapter({
      async findByOperationKey() { return { data: null }; },
      async compareAndSwap() { return { data: "true" }; },
      async read() { return { data: null }; },
    });
    await expect(persistChannelDraft(actor, context, action, malformedCompare)).resolves.toEqual({
      ok: false,
      error: "draft_write_result_unknown",
      effect: "unknown",
    });
  });

});

describe("server channel draft RPC binding (synthetic, not a live release)", () => {
  const who = { userId:"11111111-1111-4111-8111-111111111111", orgId:"22222222-2222-4222-8222-222222222222",
    bindingStatus:"verified" as const, membershipStatus:"active" as const,
    capabilities:["conversation.read","conversation.write"] };
  const ctx = { orgId:who.orgId, userId:who.userId, accountId:"account-hotel", purposeKey:"hotel-operations",
    chatRef:"chat-hashed", caseRef:"case-existing", shiftRef:"shift-today",
    destinationBindingId:"33333333-3333-4333-8333-333333333333", currentVersion:0, humanTakeover:false };
  const key = { orgId:ctx.orgId,userId:ctx.userId,accountId:ctx.accountId,purposeKey:ctx.purposeKey,
    chatRef:ctx.chatRef,caseRef:ctx.caseRef,shiftRef:ctx.shiftRef,destinationBindingId:ctx.destinationBindingId };
  const action = { schemaVersion:"channel-draft-action-v1" as const,operationKey:"operation-one",
    accountId:ctx.accountId,purposeKey:ctx.purposeKey,chatRef:ctx.chatRef,caseRef:ctx.caseRef,
    shiftRef:ctx.shiftRef,destinationBindingId:ctx.destinationBindingId,expectedVersion:0,
    draftBody:"A private draft",sourceKind:"live_transport" as const,attachments:[] };
  function harness() {
    let access: { actor: ChannelActor | null; context: ChannelDraftContext } | null = {actor:who,context:ctx};
    let record: ChannelDraftStoredRecord | null = null;
    let writes = 0;
    let loseWriteResponse = false;
    let revokeAfterRead = false;
    const calls: Array<{name:string;args:Record<string,unknown>}> = [];
    const rpc: ChannelDraftRpc = async (name,args) => {
      calls.push({name,args});
      if (name === "toro_channel_draft_cas_v1") {
        if (record) return {data:false};
        writes++;
        record = {...key,operationKey:String(args.p_operation_key),version:1,draftBody:String(args.p_draft_body),
          sourceKind:"live_transport",attachments:[]};
        if (loseWriteResponse) throw new Error("sensitive provider detail must not escape");
        return {data:true};
      }
      if (revokeAfterRead) access = {actor:{...who,bindingStatus:"revoked"},context:ctx};
      return {data:record};
    };
    return {store:createChannelDraftServerStore(rpc,async()=>access),calls,
      writes:()=>writes,setAccess:(value:typeof access)=>{access=value;},
      loseResponse:()=>{loseWriteResponse=true;},revokeRead:()=>{revokeAfterRead=true;}};
  }
  it("maps all eight scope keys and persists/readbacks/replays with one effect", async () => {
    const h=harness();
    const first=await persistChannelDraft(who,ctx,action,h.store);
    expect(first).toMatchObject({ok:true,replayed:false,record:{version:1,caseRef:ctx.caseRef}});
    expect(h.calls.map(call=>call.name)).toEqual(["toro_channel_draft_find_v1","toro_channel_draft_cas_v1","toro_channel_draft_read_v1"]);
    expect(h.calls[1].args).toEqual({p_org_id:ctx.orgId,p_actor_user_id:ctx.userId,p_account_id:ctx.accountId,
      p_purpose_key:ctx.purposeKey,p_chat_ref:ctx.chatRef,p_case_ref:ctx.caseRef,p_shift_ref:ctx.shiftRef,
      p_destination_binding_id:ctx.destinationBindingId,p_operation_key:action.operationKey,p_expected_version:0,
      p_draft_body:action.draftBody,p_source_kind:"live_transport",p_attachments:[]});
    await expect(persistChannelDraft(who,ctx,action,h.store)).resolves.toMatchObject({ok:true,replayed:true});
    expect(h.writes()).toBe(1);
  });
  it("reconciles a committed write with a lost response before another CAS", async () => {
    const h=harness();h.loseResponse();
    await expect(persistChannelDraft(who,ctx,action,h.store)).resolves.toMatchObject({ok:true,replayed:true});
    expect(h.writes()).toBe(1);
    expect(h.calls.filter(call=>call.name==="toro_channel_draft_cas_v1")).toHaveLength(1);
  });
  it.each(["orgId","userId","accountId","purposeKey","chatRef","caseRef","shiftRef","destinationBindingId"] as const)("rejects changed server %s without an RPC",async field=>{
    const h=harness();h.setAccess({actor:who,context:{...ctx,[field]:"other-scope"}});
    await expect(h.store.read(key)).rejects.toThrow("channel_draft_access_denied");
    expect(h.calls).toHaveLength(0);
  });
  it("hides a durable draft when binding is revoked during a read", async () => {
    const h=harness();await persistChannelDraft(who,ctx,action,h.store);h.revokeRead();
    await expect(h.store.read(key)).rejects.toThrow("channel_draft_access_denied");
  });
  it("blocks takeover and missing canonical write capability before CAS", async () => {
    for (const access of [{actor:who,context:{...ctx,humanTakeover:true}},
      {actor:{...who,capabilities:["conversation.read"]},context:ctx}]) {
      const h=harness();h.setAccess(access);
      await expect(persistChannelDraft(who,ctx,action,h.store)).resolves.toMatchObject({ok:false,effect:"unknown"});
      expect(h.calls.some(call=>call.name==="toro_channel_draft_cas_v1")).toBe(false);
      expect(h.writes()).toBe(0);
    }
  });
  it("does not turn historical input into a live RPC",async()=>{
    const h=harness();
    await expect(persistChannelDraft(who,ctx,{...action,sourceKind:"historical_import"},h.store)).resolves.toMatchObject({ok:false,error:"historical_source_read_only",effect:"none"});
    expect(h.calls).toHaveLength(0);
  });
});

