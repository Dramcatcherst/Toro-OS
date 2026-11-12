import { describe, expect, it } from "vitest";
import { prepareToroMailReply, type ToroMailReplyPreparationInput } from "./mail-reply-preparation";
import { toroMailMessageKey } from "./mail-message-identity";

const NOW = Date.parse("2026-11-13T05:59:00Z"); // Still 12 November in Costa Rica.
const RECEIVED = NOW - 30_000;

function input(): ToroMailReplyPreparationInput {
  const sourceMessageKey = toroMailMessageKey({ provider: "gmail", physicalAccountRef: "mailbox-1", providerMessageId: "native-1" })!;
  return {
    context: {
      userId: "owner-1", email: null, displayName: "Synthetic owner", mode: "organization", orgId: "org-1",
      membership: { orgId: "org-1", membershipId: "membership-1", membershipType: "owner", status: "active", roles: ["ADMIN"], employeeId: null, source: "organization_memberships" },
      availableOrgIds: ["org-1"], allowedDataScopes: ["work_org"],
      allowedTools: [{ provider: "gmail", actions: ["execute"], owner: "organization", orgId: "org-1" }],
      canUsePersonalVault: false, canUseOrganizationData: true, requiresContextChoice: false,
    },
    account: {
      kind: "organization", runtimeAcceptanceVerified: true,
      connectorEvidence: { connectorSessionVerified: true, observedAt: new Date(NOW).toISOString() },
      binding: {
        id: "account-1", orgId: "org-1", propertyId: null, channel: "email", provider: "gmail", endpointKind: "user_mailbox",
        normalizedEndpoint: "admin@hotel.invalid", displayName: "Hotel", businessRole: "admin", authStatus: "connected",
        readEnabled: true, draftEnabled: true, sendEnabled: true, deleteEnabled: false, adminEnabled: false,
        ingestionStatus: "healthy", verificationStatus: "verified", lastSyncAt: new Date(NOW).toISOString(), lastEventAt: null,
        lastErrorCode: null, active: true,
      },
    },
    healthPolicy: { nowMs: NOW, maxSyncAgeMs: 60_000 },
    policy: {
      key: "external_email_specific_approval_policy_v1", authorizationReceiptRef: "receipt-owner-policy", orgId: "org-1",
      bindingId: "account-1", physicalAccountRef: "mailbox-1", senderAddress: "info@hotel.invalid", limitScopeKey: "hotel-mail-global",
      runtimeEnabled: true, effectiveActivationAtMs: NOW - 3_600_000, allowedClasses: ["R1", "R2", "R3"],
      globalDailyCap: 20, case24hCap: 2, timeZone: "America/Costa_Rica",
    },
    mailboxIdentity: { receiptRef: "receipt-mailbox-identity", checkedAtMs: NOW, bindingId: "account-1", physicalAccountRef: "mailbox-1", status: "verified" },
    sendAs: { receiptRef: "receipt-send-as", checkedAtMs: NOW, bindingId: "account-1", physicalAccountRef: "mailbox-1", verifiedAddress: "info@hotel.invalid", status: "verified" },
    message: {
      receiptRef: "receipt-native-read", checkedAtMs: NOW, physicalAccountRef: "mailbox-1", providerMessageId: "native-1", receivedAtMs: RECEIVED,
      from: "Guest <guest@example.invalid>", replyTo: null, nativeSenderAddress: "guest@example.invalid", recipientAddress: "guest@example.invalid",
      senderAuthentication: "verified", origin: "direct_email", autoSubmitted: null, listId: null, precedence: null,
      autoResponseSuppress: null, deliveryReport: false,
    },
    caseState: {
      receiptRef: "receipt-case-read", checkedAtMs: NOW, orgId: "org-1", caseKey: "case-1", sourceMessageKey,
      personBindingReceiptRef: "receipt-person-binding", persistenceReceiptRef: "receipt-persisted-case", versionRef: "case-version-1",
      handling: "automation", lastHumanReplyAtMs: null, caseSendState: "clear", sourceActionOutcome: "none",
    },
    content: {
      replyClass: "R1", reviewReceiptRef: "receipt-content-review", approvedTemplateRef: "template-public-info",
      restrictedIntent: "none", knowledge: "current_approved", knowledgeReceiptRef: "receipt-current-knowledge", missingFields: [],
    },
    ledger: {
      receiptRef: "receipt-ledger-read", checkedAtMs: NOW, source: "canonical_ledger", limitScopeKey: "hotel-mail-global", orgId: "org-1",
      caseKey: "case-1", day: "2026-11-12", caseWindowStartMs: NOW - 86_400_000, globalDayCount: 19, case24hCount: 1,
    },
  };
}

function expectReason(value: ToroMailReplyPreparationInput, reason: string) {
  const result = prepareToroMailReply(value);
  expect(result.canSend).toBe(false);
  expect(result.state).not.toBe("prepared");
  expect(result.actionKey).toBeNull();
  expect(result.blockers).toContain(reason);
}

describe("server-only R1-R3 preparation, without a dispatcher", () => {
  it.each(["R1", "R2", "R3"] as const)("prepares %s while withholding send authority and requiring atomic admission", (replyClass) => {
    const value = input();
    value.content.replyClass = replyClass;
    value.content.missingFields = ["arrival_date", "guest_count"];
    const result = prepareToroMailReply(value);
    expect(result).toMatchObject({ state: "prepared", canSend: false, blockers: [] });
    expect(result.actionKey).toMatch(/^mail-reply-v1:[a-f0-9]{64}$/);
    expect(result.dispatchRequirements).toContain("atomically_reserve_global_and_case_quota_with_fenced_outbox");
  });

  it("retains adopted authority but blocks the actual inactive pilot with no activation cutoff", () => {
    const value = input();
    value.policy.runtimeEnabled = false;
    value.policy.effectiveActivationAtMs = null;
    expectReason(value, "pilot_inactive");
    expect(prepareToroMailReply(value).blockers).not.toContain("policy_evidence_missing");
  });

  it("does not turn ChatGPT connection evidence into TORO runtime acceptance", () => {
    const value = input();
    value.account.runtimeAcceptanceVerified = false;
    expectReason(value, "mail_runtime_unverified_or_stale");
  });

  it("does not accept an organization/provider grant as another account's identity", () => {
    const value = input();
    value.message.physicalAccountRef = "mailbox-2";
    expectReason(value, "account_or_organization_mismatch");
  });

  it("separates colliding native IDs in two verified accounts", () => {
    const first = input();
    const second = input();
    second.policy.bindingId = second.account.binding.id = second.sendAs.bindingId = second.mailboxIdentity.bindingId = "account-2";
    second.policy.physicalAccountRef = second.sendAs.physicalAccountRef = second.message.physicalAccountRef = second.mailboxIdentity.physicalAccountRef = "mailbox-2";
    second.caseState.sourceMessageKey = toroMailMessageKey({ provider: "gmail", physicalAccountRef: "mailbox-2", providerMessageId: "native-1" })!;
    const a = prepareToroMailReply(first);
    const b = prepareToroMailReply(second);
    expect(b.state).toBe("prepared");
    expect(a.messageKey).not.toBe(b.messageKey);
    expect(a.actionKey).not.toBe(b.actionKey);
  });

  it("keeps one logical action when a proposal's class/template/policy reference changes", () => {
    const first = input();
    const second = input();
    second.content.replyClass = "R2";
    second.content.missingFields = ["guest_count"];
    second.content.approvedTemplateRef = "template-missing-details";
    second.policy.authorizationReceiptRef = "new-policy-receipt";
    second.caseState.caseKey = second.ledger.caseKey = "reassigned-case";
    expect(prepareToroMailReply(first).actionKey).toBe(prepareToroMailReply(second).actionKey);
  });

  it("deduplicates aliases and renewed readbacks of the same physical mailbox", () => {
    const first = input();
    const second = input();
    second.policy.bindingId = second.account.binding.id = second.sendAs.bindingId = second.mailboxIdentity.bindingId = "alias-binding-2";
    second.mailboxIdentity.receiptRef = "receipt-reconnected-mailbox";
    second.account.binding.normalizedEndpoint = "info@hotel.invalid";
    const a = prepareToroMailReply(first);
    const b = prepareToroMailReply(second);
    expect(b.state).toBe("prepared");
    expect(b.messageKey).toBe(a.messageKey);
    expect(b.actionKey).toBe(a.actionKey);
  });

  it.each(["notification", "direct_email"] as const)("never replies to a WeSpeak notifier even when origin is %s", (origin) => {
    const value = input();
    Object.assign(value.message, { origin, from: "notifications@wespeak.news", nativeSenderAddress: "notifications@wespeak.news", recipientAddress: "notifications@wespeak.news" });
    expectReason(value, "notification_requires_original_channel_resolution");
  });

  it("rejects a guest address quoted inside a WeSpeak notification as recipient evidence", () => {
    const value = input();
    value.message.from = value.message.nativeSenderAddress = "notifications@wespeak.news";
    value.message.origin = "notification";
    expectReason(value, "recipient_identity_unverified");
  });

  it.each([-1, 0])("rejects messages before/at the activation cutoff (%s ms)", (delta) => {
    const value = input();
    value.message.receivedAtMs = value.policy.effectiveActivationAtMs! + delta;
    expectReason(value, "outside_activation_cutoff");
  });

  it.each(["human", "unknown"] as const)("blocks %s handling rather than assuming automation owns the case", (handling) => {
    const value = input(); value.caseState.handling = handling;
    expectReason(value, "human_takeover_or_unknown_state");
  });

  it("blocks a human answer newer than the triggering message", () => {
    const value = input(); value.caseState.lastHumanReplyAtMs = RECEIVED + 1;
    expectReason(value, "human_reply_supersedes_automation");
  });

  it.each(["unknown", "in_flight"] as const)("requires reconciliation for %s send outcomes", (sourceActionOutcome) => {
    const value = input(); value.caseState.sourceActionOutcome = sourceActionOutcome;
    expectReason(value, "send_requires_reconciliation");
  });

  it("stops replay after verified sending", () => {
    const value = input(); value.caseState.sourceActionOutcome = "verified_sent";
    expectReason(value, "already_replied");
  });

  it("can prepare a new message in the same case after a resolved prior send, but waits for any uncertain case send", () => {
    const first = input(); first.caseState.sourceActionOutcome = "verified_sent";
    expectReason(first, "already_replied");
    const next = input();
    next.message.providerMessageId = "native-2";
    next.caseState.sourceMessageKey = toroMailMessageKey({ provider: "gmail", physicalAccountRef: "mailbox-1", providerMessageId: "native-2" })!;
    expect(prepareToroMailReply(next).state).toBe("prepared");
    next.caseState.caseSendState = "pending_reconciliation";
    expectReason(next, "case_send_requires_reconciliation");
  });

  it("does not authenticate a display-name impersonation or mismatched Reply-To", () => {
    const value = input(); value.message.from = "guest@example.invalid <attacker@example.invalid>";
    expectReason(value, "recipient_identity_unverified");
    value.message.from = "guest@example.invalid";
    value.message.replyTo = "attacker@example.invalid";
    expectReason(value, "recipient_identity_unverified");
  });

  it("requires authentication and the exact independently verified send-as identity", () => {
    const value = input(); value.message.senderAuthentication = "unknown";
    expectReason(value, "recipient_identity_unverified");
    value.message.senderAuthentication = "verified";
    value.sendAs.verifiedAddress = "admin@hotel.invalid";
    expectReason(value, "send_as_identity_unverified");
  });

  it("preserves external recipient local-part case instead of inventing provider equivalence", () => {
    const value = input(); value.message.recipientAddress = "Guest@example.invalid";
    expectReason(value, "recipient_identity_unverified");
  });

  it.each([
    { autoSubmitted: "auto-replied" }, { listId: "list.example" }, { precedence: "bulk" },
    { autoResponseSuppress: "All" }, { deliveryReport: true }, { autoSubmitted: undefined },
  ])("blocks automatic messages or uninspected headers: %o", (patch) => {
    const value = input(); Object.assign(value.message, patch);
    expectReason(value, "automatic_or_unknown_message_headers");
  });

  it("requires fresh server readbacks of message, case and quota", () => {
    for (const key of ["message", "caseState", "ledger"] as const) {
      const value = input(); value[key].checkedAtMs = NOW - 60_001;
      expect(prepareToroMailReply(value).state).toBe("blocked");
    }
    const value = input(); value.caseState.receiptRef = "";
    expectReason(value, "case_identity_or_state_unverified");
  });

  it("checks the global scope and Costa Rica operating day, not an account-local or UTC-day counter", () => {
    const value = input(); value.ledger.limitScopeKey = "account-local";
    expectReason(value, "quota_readback_unverified");
    value.ledger.limitScopeKey = value.policy.limitScopeKey;
    value.ledger.day = "2026-11-13";
    expectReason(value, "quota_readback_unverified");
  });

  it.each([{ globalDayCount: 20 }, { case24hCount: 2 }])("blocks at each pilot cap: %o", (patch) => {
    const value = input(); Object.assign(value.ledger, patch);
    expectReason(value, "pilot_quota_exhausted");
  });

  it("does not accept a calendar-day count for the rolling case window or broader policy caps", () => {
    const value = input(); value.ledger.caseWindowStartMs += 1;
    expectReason(value, "quota_readback_unverified");
    value.ledger.caseWindowStartMs -= 1;
    value.policy.globalDailyCap = 21;
    expectReason(value, "invalid_pilot_limits");
  });

  it("requires the current message-to-person/case link, not a shared notification thread", () => {
    const value = input(); value.caseState.sourceMessageKey = "other-person-same-thread";
    expectReason(value, "case_identity_or_state_unverified");
  });

  it("requires persisted canonical case evidence before an R3 acknowledgement", () => {
    const value = input(); value.content.replyClass = "R3"; value.caseState.persistenceReceiptRef = null;
    expectReason(value, "acknowledgement_requires_persisted_case");
  });

  it("limits R2 to minimum nonsensitive missing query fields", () => {
    const value = input(); value.content.replyClass = "R2"; value.content.missingFields = ["passport"];
    expectReason(value, "minimal_missing_fields_only");
  });

  it("requires approved current knowledge for R1 and excludes financial decisions", () => {
    const value = input(); value.content.knowledge = "stale";
    expectReason(value, "approved_current_knowledge_required");
    value.content.knowledge = "current_approved"; value.content.restrictedIntent = "money";
    expectReason(value, "reply_outside_delegated_classes");
  });

  it("fails closed with incomplete input and grants", () => {
    expect(prepareToroMailReply(null as never)).toMatchObject({ state: "blocked", canSend: false, actionKey: null });
    const value = input(); value.context.allowedTools = [];
    expectReason(value, "organization_execute_grant_missing");
    value.context.userId = 7 as never;
    expectReason(value, "account_or_organization_mismatch");
  });
});
