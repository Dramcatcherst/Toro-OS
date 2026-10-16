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
  if (health === "healthy" && canUseMailboxBindingForRuntime(account.binding)) {
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
          labelAndArchive: readable && canExecute ? "message_evidence_required" : "blocked",
          trash: readable && canExecute ? "approval_and_readback_required" : "blocked",
          unsubscribe: readable && canExecute ? "native_provider_review_required" : "blocked",
          send: readable && canExecute && account.connection.sendEnabled
            ? "approval_and_readback_required"
            : "blocked",
          permanentDelete: "separate_human_gate",
        },
      }];
    }

    if (!organizationVisible(context, account)) return [];
    const readable = canUseMailboxBinding(context, account.binding);
    const canModify = readable && account.binding.deleteEnabled;
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
        send: readable && account.binding.sendEnabled
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
