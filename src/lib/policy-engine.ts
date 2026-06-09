import type { ActionLevel, ApprovalRequirement, RiskLevel } from "./toro-types";

export type PolicyDecision = {
  allowed: boolean;
  approval: ApprovalRequirement;
  reason: string;
};

const blockedActions = new Set([
  "publish_social",
  "send_whatsapp",
  "change_price",
  "change_availability",
  "cancel_reservation",
  "issue_invoice",
  "charge_payment",
  "refund_payment",
  "delete_media",
  "delete_record",
]);

export function evaluatePolicy(input: {
  action: string;
  actionLevel: ActionLevel;
  risk: RiskLevel;
  externalImpact: boolean;
}): PolicyDecision {
  if (blockedActions.has(input.action)) {
    return {
      allowed: false,
      approval: "Blocked",
      reason: "This action is blocked in TORO OS v0.3 because it can affect external systems or sensitive business state.",
    };
  }

  if (input.externalImpact || input.risk === "Critical" || input.actionLevel === "execute_with_approval") {
    return {
      allowed: true,
      approval: "Owner approval",
      reason: "Action may be prepared, but execution requires owner approval and audit logging.",
    };
  }

  if (input.risk === "High") {
    return {
      allowed: true,
      approval: "Human review",
      reason: "High-risk action may be queued for human review only.",
    };
  }

  return {
    allowed: true,
    approval: "Human review",
    reason: "Action is safe to prepare and queue; no external write will be executed.",
  };
}
