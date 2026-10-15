import type { ToroResolvedContext } from "../context/types";

export type ToroPersonalMailAction =
  | "read"
  | "label"
  | "archive"
  | "draft"
  | "send"
  | "trash"
  | "settings"
  | "delegate"
  | "permanent_delete";

export type ToroPersonalMailboxConnection = {
  ownerUserId: string;
  provider: "gmail";
  status: "pending" | "connected" | "degraded" | "revoked" | "disconnected";
  verificationStatus: "unverified" | "verified" | "conflict";
  /** True only after TORO's own OAuth/runtime readback, not a ChatGPT connector login. */
  runtimeVerified: boolean;
  readEnabled: boolean;
  modifyEnabled: boolean;
  draftEnabled: boolean;
  sendEnabled: boolean;
  settingsEnabled: boolean;
};

export type ToroPersonalMailDecision = {
  /** Classification must come from inspected message/thread evidence. */
  messageClass?: "unreviewed" | "marketing_low_risk" | "protected";
  /** Server Control Plane verifies the receipt before passing this flag. */
  approvalReceiptVerified?: boolean;
};

/**
 * Authorization-only contract for the owner's PRIVATE mailbox.
 * Does not connect Gmail, persist credentials, delete mail, or grant delegation.
 *
 * Business organization mailbox bindings are intentionally NOT consulted here.
 * A company admin, employee, or owner in organization mode cannot read the
 * personal mailbox using organization rights.
 */
export function canUsePersonalMailbox(
  context: ToroResolvedContext,
  connection: ToroPersonalMailboxConnection,
  action: ToroPersonalMailAction,
  decision: ToroPersonalMailDecision = {},
): boolean {
  if (
    context.mode !== "personal" ||
    context.orgId !== null ||
    context.requiresContextChoice ||
    !context.canUsePersonalVault ||
    !context.allowedDataScopes.includes("personal") ||
    !context.userId ||
    context.userId !== connection.ownerUserId ||
    connection.provider !== "gmail" ||
    connection.status !== "connected" ||
    connection.verificationStatus !== "verified" ||
    !connection.runtimeVerified
  ) return false;

  const permissions = context.allowedTools.filter(
    (tool) => tool.provider === "gmail" && tool.owner === "personal" && tool.orgId === null,
  );
  const allows = (grant: "read" | "draft" | "execute") =>
    permissions.some((tool) => tool.actions.includes(grant));
  const approved = decision.approvalReceiptVerified === true;

  switch (action) {
    case "read":
      return connection.readEnabled && allows("read");
    case "label":
    case "archive":
      return (
        connection.modifyEnabled &&
        allows("execute") &&
        (decision.messageClass === "marketing_low_risk" || approved)
      );
    case "draft":
      return connection.draftEnabled && allows("draft");
    case "send":
      return connection.sendEnabled && allows("execute") && approved;
    case "trash":
      return connection.modifyEnabled && allows("execute") && approved;
    case "settings":
      return connection.settingsEnabled && allows("execute") && approved;
    case "delegate":
    case "permanent_delete":
      // Separate, stronger manual flow. Never authorized by this runtime.
      return false;
  }
}
