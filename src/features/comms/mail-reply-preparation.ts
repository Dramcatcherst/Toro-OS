import "server-only";

import { createHash } from "node:crypto";
import type { ToroResolvedContext } from "../context/types";
import { canUseMailboxBinding, mailboxBindingHealth, type ToroMailboxHealthPolicy } from "./mailbox-bindings";
import { isMailReference, parseSingleMailAddress, toroMailMessageKey } from "./mail-message-identity";
import type { ToroMailOrganizationAccount } from "./toro-mail";

export type ToroMailReplyClass = "R1" | "R2" | "R3";
type Readback = { receiptRef: string; checkedAtMs: number };

/** Loaded from the existing policy registry. An incoming email cannot create this policy. */
export type ToroMailReplyPolicy = {
  key: string;
  authorizationReceiptRef: string;
  orgId: string;
  bindingId: string;
  physicalAccountRef: string;
  senderAddress: string;
  limitScopeKey: string;
  runtimeEnabled: boolean;
  effectiveActivationAtMs: number | null;
  allowedClasses: readonly ToroMailReplyClass[];
  globalDailyCap: number;
  case24hCap: number;
  timeZone: "America/Costa_Rica";
};

/**
 * Prepared by trusted server readers, NOT request JSON, email content or model assertions.
 * Receipt references are provenance for preparation, not cryptographic proofs or grants.
 * This module never persists a case, reserves quota, sends or confers send authority.
 */
export type ToroMailReplyPreparationInput = {
  context: ToroResolvedContext;
  account: ToroMailOrganizationAccount;
  healthPolicy: ToroMailboxHealthPolicy;
  policy: ToroMailReplyPolicy;
  mailboxIdentity: Readback & { bindingId: string; physicalAccountRef: string; status: "verified" | "unknown" };
  sendAs: Readback & { bindingId: string; physicalAccountRef: string; verifiedAddress: string; status: "verified" | "unknown" };
  message: Readback & {
    physicalAccountRef: string;
    providerMessageId: string;
    receivedAtMs: number;
    from: string;
    replyTo: string | null;
    nativeSenderAddress: string;
    recipientAddress: string;
    senderAuthentication: "verified" | "failed" | "unknown";
    origin: "direct_email" | "notification" | "relay" | "unknown";
    autoSubmitted: string | null;
    listId: string | null;
    precedence: string | null;
    autoResponseSuppress: string | null;
    deliveryReport: boolean;
  };
  caseState: Readback & {
    orgId: string;
    caseKey: string;
    sourceMessageKey: string;
    personBindingReceiptRef: string;
    persistenceReceiptRef: string | null;
    versionRef: string;
    handling: "automation" | "human" | "unknown";
    lastHumanReplyAtMs: number | null;
    /** Outcome for this source message, NOT the last message sent in the case. */
    caseSendState: "clear" | "pending_reconciliation" | "unknown";
    sourceActionOutcome: "none" | "verified_sent" | "failed_before_send" | "in_flight" | "unknown";
  };
  content: {
    replyClass: ToroMailReplyClass | "review";
    reviewReceiptRef: string;
    approvedTemplateRef: string;
    restrictedIntent: "none" | "money" | "reservation_change" | "complaint" | "legal" | "hr" | "security" | "unknown";
    knowledge: "current_approved" | "stale" | "unknown";
    knowledgeReceiptRef: string | null;
    missingFields: readonly string[];
  };
  /** Counts include pending reservations; this snapshot NEVER reserves a send slot. */
  ledger: Readback & {
    source: "canonical_ledger";
    limitScopeKey: string;
    orgId: string;
    caseKey: string;
    day: string;
    caseWindowStartMs: number;
    globalDayCount: number;
    case24hCount: number;
  };
};

export type ToroMailReplyPreparation = {
  state: "prepared" | "review" | "blocked";
  canSend: false;
  messageKey: string | null;
  actionKey: string | null;
  blockers: string[];
  /** Required even for a prepared result; there is deliberately no dispatcher here. */
  dispatchRequirements: readonly string[];
};

const DISPATCH_REQUIREMENTS = [
  "reload_policy_identity_and_human_state",
  "bind_approved_template_and_final_content_hash",
  "atomically_reserve_global_and_case_quota_with_fenced_outbox",
  "emit_verified_anti_loop_headers",
  "provider_receipt_and_uncertain_result_reconciliation",
] as const;
const REPLY_CLASSES = new Set(["R1", "R2", "R3"]);
const MINIMAL_FIELDS = new Set(["arrival_date", "departure_date", "guest_count", "room_count"]);
const DAY_MS = 86_400_000;

function instant(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 8_640_000_000_000_000;
}

function recent(evidence: Readback | null | undefined, policy: ToroMailboxHealthPolicy): boolean {
  return Boolean(evidence && isMailReference(evidence.receiptRef) &&
    instant(evidence.checkedAtMs) && evidence.checkedAtMs <= policy.nowMs &&
    policy.nowMs - evidence.checkedAtMs <= policy.maxSyncAgeMs);
}

function absentOrHeader(value: unknown, allowed: string): boolean {
  return value === null || (typeof value === "string" && value.trim().toLowerCase() === allowed);
}

function costaRicaDay(nowMs: number): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Costa_Rica", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(nowMs);
  const part = (kind: string) => parts.find((item) => item.type === kind)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/**
 * Fail-closed server preparation. `prepared` means only that inspected snapshots
 * are consistent enough to persist a proposal in the EXISTING Control Plane.
 * It is not an atomic admission, durable counter implementation or send permit.
 */
export function prepareToroMailReply(input: ToroMailReplyPreparationInput): ToroMailReplyPreparation {
  const blockers: string[] = [];
  const review: string[] = [];
  const result = (messageKey: string | null = null, actionKey: string | null = null): ToroMailReplyPreparation => ({
    state: blockers.length ? "blocked" : review.length ? "review" : "prepared",
    canSend: false,
    messageKey,
    actionKey: blockers.length || review.length ? null : actionKey,
    blockers: [...blockers, ...review],
    dispatchRequirements: DISPATCH_REQUIREMENTS,
  });
  if (!input || !input.context || !input.account || !input.account.binding ||
      !input.policy || !input.message || !input.content || !input.caseState || !input.ledger ||
      !input.healthPolicy || !instant(input.healthPolicy.nowMs) ||
      !Number.isSafeInteger(input.healthPolicy.maxSyncAgeMs) || input.healthPolicy.maxSyncAgeMs <= 0) {
    blockers.push("invalid_preparation_input");
    return result();
  }
  const { context, account, policy, message, caseState, content, ledger, healthPolicy } = input;
  const { binding } = account;
  const messageKey = toroMailMessageKey({ provider: "gmail", physicalAccountRef: message.physicalAccountRef, providerMessageId: message.providerMessageId });
  if (!messageKey) blockers.push("invalid_native_message_identity");
  if (typeof context.userId !== "string" || typeof context.orgId !== "string" ||
      !Array.isArray(context.allowedTools) || !Array.isArray(context.allowedDataScopes) ||
      !canUseMailboxBinding(context, binding) || account.kind !== "organization" || binding.provider !== "gmail" ||
      binding.id !== policy.bindingId || binding.orgId !== policy.orgId || message.physicalAccountRef !== policy.physicalAccountRef) {
    blockers.push("account_or_organization_mismatch");
  }
  if (!isMailReference(policy.physicalAccountRef) || !recent(input.mailboxIdentity, healthPolicy) ||
      input.mailboxIdentity.status !== "verified" || input.mailboxIdentity.bindingId !== policy.bindingId ||
      input.mailboxIdentity.physicalAccountRef !== policy.physicalAccountRef) blockers.push("physical_mailbox_identity_unverified");
  if (account.runtimeAcceptanceVerified !== true || binding.draftEnabled !== true || binding.sendEnabled !== true ||
      mailboxBindingHealth(binding, healthPolicy) !== "healthy") blockers.push("mail_runtime_unverified_or_stale");
  if (!Array.isArray(context.allowedTools) || !context.allowedTools.some((grant) =>
    grant && grant.owner === "organization" && grant.orgId === policy.orgId && grant.provider === "gmail" &&
    Array.isArray(grant.actions) && grant.actions.includes("execute"))) blockers.push("organization_execute_grant_missing");
  if (!isMailReference(policy.key) || !isMailReference(policy.authorizationReceiptRef) || !isMailReference(policy.limitScopeKey)) {
    blockers.push("policy_evidence_missing");
  }
  if (policy.runtimeEnabled !== true || !instant(policy.effectiveActivationAtMs) || policy.effectiveActivationAtMs > healthPolicy.nowMs) {
    blockers.push("pilot_inactive");
  }
  if (!instant(message.receivedAtMs) || message.receivedAtMs > healthPolicy.nowMs ||
      !instant(policy.effectiveActivationAtMs) || message.receivedAtMs <= policy.effectiveActivationAtMs) blockers.push("outside_activation_cutoff");
  if (!recent(message, healthPolicy) || message.checkedAtMs < message.receivedAtMs) blockers.push("message_readback_missing_or_stale");

  const sender = parseSingleMailAddress(message.from);
  const nativeSender = parseSingleMailAddress(message.nativeSenderAddress);
  const recipient = parseSingleMailAddress(message.recipientAddress);
  const fromAddress = parseSingleMailAddress(policy.senderAddress);
  if (!fromAddress || !recent(input.sendAs, healthPolicy) || input.sendAs.status !== "verified" ||
      input.sendAs.bindingId !== policy.bindingId || input.sendAs.physicalAccountRef !== policy.physicalAccountRef || parseSingleMailAddress(input.sendAs.verifiedAddress) !== fromAddress) blockers.push("send_as_identity_unverified");
  if (!sender || sender !== nativeSender || sender !== recipient || sender.toLowerCase() === fromAddress?.toLowerCase() ||
      sender.toLowerCase() === parseSingleMailAddress(binding.normalizedEndpoint)?.toLowerCase() ||
      message.senderAuthentication !== "verified" ||
      (message.replyTo !== null && parseSingleMailAddress(message.replyTo) !== sender)) blockers.push("recipient_identity_unverified");
  if (message.origin !== "direct_email" || sender === "notifications@wespeak.news" ||
      /^(?:no-?reply|do-?not-?reply|mailer-daemon|postmaster)@/.test(sender ?? "")) review.push("notification_requires_original_channel_resolution");
  if (!absentOrHeader(message.autoSubmitted, "no") ||
      message.listId !== null || message.autoResponseSuppress !== null || message.deliveryReport !== false ||
      !absentOrHeader(message.precedence, "normal")) blockers.push("automatic_or_unknown_message_headers");

  if (!recent(caseState, healthPolicy) || caseState.checkedAtMs < message.receivedAtMs ||
      caseState.orgId !== policy.orgId || caseState.sourceMessageKey !== messageKey ||
      !isMailReference(caseState.caseKey) || !isMailReference(caseState.versionRef) || !isMailReference(caseState.personBindingReceiptRef)) {
    blockers.push("case_identity_or_state_unverified");
  }
  if (caseState.handling !== "automation") blockers.push("human_takeover_or_unknown_state");
  if (caseState.lastHumanReplyAtMs !== null &&
      (!instant(caseState.lastHumanReplyAtMs) || caseState.lastHumanReplyAtMs >= message.receivedAtMs)) blockers.push("human_reply_supersedes_automation");
  if (caseState.caseSendState !== "clear") blockers.push("case_send_requires_reconciliation");
  if (caseState.sourceActionOutcome === "verified_sent") blockers.push("already_replied");
  else if (caseState.sourceActionOutcome !== "none" && caseState.sourceActionOutcome !== "failed_before_send") blockers.push("send_requires_reconciliation");

  if (!REPLY_CLASSES.has(content.replyClass) || !Array.isArray(policy.allowedClasses) ||
      policy.allowedClasses.some((kind) => !REPLY_CLASSES.has(kind)) ||
      !policy.allowedClasses.includes(content.replyClass as ToroMailReplyClass) ||
      content.restrictedIntent !== "none") review.push("reply_outside_delegated_classes");
  if (!isMailReference(content.reviewReceiptRef) || !isMailReference(content.approvedTemplateRef)) blockers.push("content_review_evidence_missing");
  if (content.replyClass === "R1" && (content.knowledge !== "current_approved" || !isMailReference(content.knowledgeReceiptRef))) review.push("approved_current_knowledge_required");
  if (content.replyClass === "R2" && (!Array.isArray(content.missingFields) || content.missingFields.length === 0 ||
      content.missingFields.some((field) => !MINIMAL_FIELDS.has(field)))) review.push("minimal_missing_fields_only");
  if (content.replyClass === "R3" && !isMailReference(caseState.persistenceReceiptRef)) blockers.push("acknowledgement_requires_persisted_case");

  if (!Number.isSafeInteger(policy.globalDailyCap) || policy.globalDailyCap <= 0 || policy.globalDailyCap > 20 ||
      !Number.isSafeInteger(policy.case24hCap) || policy.case24hCap <= 0 || policy.case24hCap > 2 ||
      policy.timeZone !== "America/Costa_Rica") blockers.push("invalid_pilot_limits");
  if (!recent(ledger, healthPolicy) || ledger.source !== "canonical_ledger" || ledger.orgId !== policy.orgId ||
      ledger.limitScopeKey !== policy.limitScopeKey || ledger.caseKey !== caseState.caseKey ||
      ledger.day !== costaRicaDay(healthPolicy.nowMs) || ledger.caseWindowStartMs !== ledger.checkedAtMs - DAY_MS ||
      !Number.isSafeInteger(ledger.globalDayCount) || ledger.globalDayCount < 0 ||
      !Number.isSafeInteger(ledger.case24hCount) || ledger.case24hCount < 0) blockers.push("quota_readback_unverified");
  if (ledger.globalDayCount >= policy.globalDailyCap || ledger.case24hCount >= policy.case24hCap) blockers.push("pilot_quota_exhausted");

  const actionKey = messageKey && isMailReference(caseState.caseKey)
    ? "mail-reply-v1:" + createHash("sha256").update(JSON.stringify([policy.orgId, messageKey, "automatic_reply"])).digest("hex")
    : null;
  return result(messageKey, actionKey);
}
