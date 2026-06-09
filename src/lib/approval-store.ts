import { auditEvents, queuedActions } from "./toro-data";
import type { ApprovalRecord } from "./toro-types";

export const approvalSeed: ApprovalRecord[] = queuedActions.map((action) => ({
  id: action.id,
  title: action.title,
  module: action.module,
  targetTool: action.targetTool,
  requestedBy: "TORO OS",
  state: "Pending",
  actionLevel: action.actionLevel,
  updatedAt: "2026-06-09T09:00:00.000Z",
  source: action.source,
  status: action.status,
  risk: action.risk,
  confidence: action.confidence,
  approval: action.approval,
  nextAction: action.nextAction,
}));

export const auditSeed = auditEvents;
