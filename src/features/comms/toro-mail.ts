import type { ToroResolvedContext } from "../context/types";
import {
  canUseMailboxBinding,
  isMailboxBindingReadable,
  mailboxBindingHealth,
  type ToroMailboxBinding,
} from "./mailbox-bindings";
import {
  canUsePersonalMailbox,
  type ToroPersonalMailboxConnection,
} from "./personal-mailbox-guard";

/**
 * Fixed governance baseline for TORO Mail. The hourly loop applies these
 * controls; it never manufactures fifty code changes to satisfy a counter.
 */
export const TORO_MAIL_GOVERNANCE_CONTROLS = [
  "identity.owner_verified",
  "identity.provider_account_readback",
  "identity.personal_org_isolation",
  "identity.active_org_membership",
  "identity.context_choice_resolved",
  "identity.per_account_grant",
  "identity.no_wildcard_identity",
  "identity.third_party_read_only",
  "identity.revoked_fails_closed",
  "identity.exact_provider_mapping",
  "privacy.metadata_first",
  "privacy.body_on_demand",
  "privacy.attachment_explicit",
  "privacy.no_tokens_in_receipts",
  "privacy.no_bodies_in_receipts",
  "privacy.no_bulk_mailbox_copy",
  "privacy.retention_known",
  "privacy.pii_redacted",
  "privacy.personal_business_separation",
  "privacy.tenant_source_ids_preserved",
  "runtime.connector_not_oauth",
  "runtime.oauth_per_user",
  "runtime.server_only_secret",
  "runtime.minimum_scopes",
  "runtime.token_lifecycle",
  "runtime.incremental_cursor",
  "runtime.deduplication",
  "runtime.idempotent_replay",
  "runtime.gap_recovery",
  "runtime.freshness_readback",
  "action.read_only_default",
  "action.reversible_first",
  "action.bounded_object_set",
  "action.trash_requires_approval",
  "action.native_unsubscribe",
  "action.send_separate_capability",
  "action.no_permanent_delete",
  "action.before_readback",
  "action.after_readback",
  "action.partial_failure_reconciliation",
  "evidence.receipt_id",
  "evidence.object_ids_hash",
  "evidence.timestamps",
  "evidence.explicit_outcome",
  "evidence.durable_error",
  "automation.no_duplicate_scheduler",
  "automation.bounded_safe_batches",
  "automation.quiet_when_unchanged",
  "automation.usage_guard",
  "automation.rollback_and_one_next_action",
] as const;

export type ToroMailGovernanceControl =
  (typeof TORO_MAIL_GOVERNANCE_CONTROLS)[number];

export type ToroMailConnectorEvidence = {
  /** A ChatGPT/plugin session is evidence for that surface only. */
  connectorSessionVerified: boolean;
  observedAt: string | null;
};

export type ToroMailPersonalAccount = {
  kind: "personal";
  id: string;
  endpoint: string;
  displayName: string;
  connection: ToroPersonalMailboxConnection;
  connectorEvidence: ToroMailConnectorEvidence;
};

export type ToroMailOrganizationAccount = {
  kind: "organization";
  binding: ToroMailboxBinding;
  connectorEvidence: ToroMailConnectorEvidence;
  /** True only after every TORO Mail runtime-acceptance gate is evidenced. */
  runtimeAcceptanceVerified: boolean;
};

export type ToroMailAccount =
  | ToroMailPersonalAccount
  | ToroMailOrganizationAccount;

export type ToroMailRuntimeState =
  | "runtime_verified"
  | "connector_only"
  | "degraded"
  | "unverified";

export type ToroMailAccountProjection = {
  id: string;
  endpoint: string;
  displayName: string;
  provider: string;
  scope: "personal" | "organization";
  runtimeState: ToroMailRuntimeState;
  connectorObservedAt: string | null;
  readable: boolean;
  actionPolicy: {
    labelAndArchive: "message_evidence_required" | "blocked";
    trash: "approval_and_readback_required" | "blocked";
    unsubscribe: "native_provider_review_required" | "blocked";
    send: "approval_and_readback_required" | "blocked";
    permanentDelete: "separate_human_gate";
  };
};

function personalVisible(
  context: ToroResolvedContext,
  account: ToroMailPersonalAccount,
) {
  return Boolean(
    context.mode === "personal" &&
      context.orgId === null &&
      !context.requiresContextChoice &&
      context.canUsePersonalVault &&
      context.allowedDataScopes.includes("personal") &&
      context.userId &&
      context.userId === account.connection.ownerUserId,
  );
}

function organizationVisible(
  context: ToroResolvedContext,
  account: ToroMailOrganizationAccount,
) {
  return Boolean(
    context.mode === "organization" &&
      context.orgId &&
      context.orgId === account.binding.orgId &&
      context.membership?.status === "active" &&
      context.canUseOrganizationData &&
      !context.requiresContextChoice,
  );
}

function personalRuntimeState(
  account: ToroMailPersonalAccount,
): ToroMailRuntimeState {
  if (
    account.connection.status === "degraded" ||
    account.connection.status === "revoked" ||
    account.connection.status === "disconnected" ||
    account.connection.verificationStatus === "conflict"
  ) return "degraded";
  if (
    account.connection.status === "connected" &&
    account.connection.verificationStatus === "verified" &&
    account.connection.runtimeVerified
  ) return "runtime_verified";
  if (account.connectorEvidence.connectorSessionVerified) return "connector_only";
  return "unverified";
}

function organizationRuntimeState(
  account: ToroMailOrganizationAccount,
): ToroMailRuntimeState {
  const health = mailboxBindingHealth(account.binding);
  if (health === "degraded" || health === "unavailable") return "degraded";
  if (
    health === "healthy" &&
    account.runtimeAcceptanceVerified &&
    canUseMailboxBindingForRuntime(account.binding)
  ) {
    return "runtime_verified";
  }
  if (account.connectorEvidence.connectorSessionVerified) return "connector_only";
  return "unverified";
}

function canUseMailboxBindingForRuntime(binding: ToroMailboxBinding) {
  return Boolean(
    isMailboxBindingReadable(binding) &&
      binding.verificationStatus === "verified" &&
      binding.lastSyncAt,
  );
}

function hasOrganizationToolGrant(
  context: ToroResolvedContext,
  binding: ToroMailboxBinding,
  action: "read" | "draft" | "execute",
) {
  return context.allowedTools.some(
    (tool) =>
      tool.owner === "organization" &&
      tool.orgId === binding.orgId &&
      tool.provider === binding.provider &&
      tool.actions.includes(action),
  );
}

export function projectToroMail(
  context: ToroResolvedContext,
  accounts: readonly ToroMailAccount[],
): ToroMailAccountProjection[] {
  return accounts.flatMap<ToroMailAccountProjection>((account) => {
    if (account.kind === "personal") {
      if (!personalVisible(context, account)) return [];
      const readable = canUsePersonalMailbox(context, account.connection, "read");
      const canExecute = context.allowedTools.some((tool) =>
        tool.owner === "personal" &&
        tool.orgId === null &&
        tool.actions.includes("execute") &&
        tool.provider === (account.connection.provider === "gmail" ? "gmail" : "outlook-email"),
      );
      const canModify = readable && account.connection.modifyEnabled && canExecute;
      return [{
        id: account.id,
        endpoint: account.endpoint,
        displayName: account.displayName,
        provider: account.connection.provider,
        scope: "personal" as const,
        runtimeState: personalRuntimeState(account),
        connectorObservedAt: account.connectorEvidence.observedAt,
        readable,
        actionPolicy: {
          labelAndArchive: canModify ? "message_evidence_required" : "blocked",
          trash: canModify ? "approval_and_readback_required" : "blocked",
          unsubscribe: canModify ? "native_provider_review_required" : "blocked",
          send: readable && canExecute && account.connection.sendEnabled
            ? "approval_and_readback_required"
            : "blocked",
          permanentDelete: "separate_human_gate",
        },
      }];
    }

    if (!organizationVisible(context, account)) return [];
    const readable = canUseMailboxBinding(context, account.binding);
    const canExecute = hasOrganizationToolGrant(
      context,
      account.binding,
      "execute",
    );
    const canModify = readable && account.binding.deleteEnabled && canExecute;
    const canSend = readable && account.binding.sendEnabled && canExecute;
    return [{
      id: account.binding.id,
      endpoint: account.binding.normalizedEndpoint,
      displayName: account.binding.displayName ?? account.binding.normalizedEndpoint,
      provider: account.binding.provider,
      scope: "organization" as const,
      runtimeState: organizationRuntimeState(account),
      connectorObservedAt: account.connectorEvidence.observedAt,
      readable,
      actionPolicy: {
        labelAndArchive: canModify ? "message_evidence_required" : "blocked",
        trash: canModify ? "approval_and_readback_required" : "blocked",
        unsubscribe: canModify ? "native_provider_review_required" : "blocked",
        send: canSend
          ? "approval_and_readback_required"
          : "blocked",
        permanentDelete: "separate_human_gate",
      },
    }];
  });
}

export type ToroMailReceiptAction =
  | "search"
  | "read"
  | "label"
  | "archive"
  | "trash"
  | "unsubscribe"
  | "draft"
  | "send"
  | "permanent_delete";

export type ToroMailActionReceipt = {
  receiptId: string;
  accountId: string;
  action: ToroMailReceiptAction;
  requestedAt: string;
  completedAt: string | null;
  providerObjectIdsHash: string | null;
  beforeReadback: string | null;
  afterReadback: string | null;
  approvalReceiptId: string | null;
  outcome: "prepared" | "succeeded" | "failed" | "partial";
};

export type ToroMailReceiptValidation = {
  valid: boolean;
  errors: string[];
};

export function validateToroMailActionReceipt(
  receipt: ToroMailActionReceipt,
): ToroMailReceiptValidation {
  const errors: string[] = [];
  const writeActions: ToroMailReceiptAction[] = [
    "label", "archive", "trash", "unsubscribe", "send", "permanent_delete",
  ];
  const approvalActions: ToroMailReceiptAction[] = [
    "trash", "unsubscribe", "send", "permanent_delete",
  ];

  if (!receipt.receiptId.trim()) errors.push("missing_receipt_id");
  if (!receipt.accountId.trim()) errors.push("missing_account_id");
  if (receipt.outcome === "succeeded" && !receipt.completedAt) {
    errors.push("missing_completion_time");
  }
  if (writeActions.includes(receipt.action)) {
    if (!receipt.providerObjectIdsHash) errors.push("missing_object_ids_hash");
    if (!receipt.beforeReadback) errors.push("missing_before_readback");
    if (!receipt.afterReadback) errors.push("missing_after_readback");
  }
  if (approvalActions.includes(receipt.action) && !receipt.approvalReceiptId) {
    errors.push("missing_approval_receipt");
  }
  if (receipt.action === "permanent_delete") {
    errors.push("permanent_delete_requires_separate_human_flow");
  }

  return { valid: errors.length === 0, errors };
}
