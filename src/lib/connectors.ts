import type { ActionLevel, ApprovalRequirement, RiskLevel } from "./toro-types";

export type PreparedConnectorAction = {
  connectorId: string;
  action: string;
  actionLevel: ActionLevel;
  risk: RiskLevel;
  approval: ApprovalRequirement;
  externalWrite: false;
  status: "prepared_only";
  auditMessage: string;
};

export function prepareConnectorAction(input: Omit<PreparedConnectorAction, "externalWrite" | "status" | "auditMessage">): PreparedConnectorAction {
  return {
    ...input,
    externalWrite: false,
    status: "prepared_only",
    auditMessage: "TORO OS v0.3 does not execute external writes. This action is queued for approval and audit review.",
  };
}

export function isSensitiveAction(actionLevel: ActionLevel, risk: RiskLevel) {
  return actionLevel === "execute_with_approval" || actionLevel === "blocked" || risk === "High" || risk === "Critical";
}
