import type {
  ActionLevel,
  ApprovalRequirement,
  OperationalStatus,
  RiskLevel,
} from "./toro-types";

export const BRAIN_CONTRACT_VERSION = "1.0.0" as const;

export type BrainProjectionMode =
  | "focus"
  | "workspace"
  | "timeline"
  | "systems"
  | "demo";

export type BrainNodeKind =
  | "principal"
  | "portfolio"
  | "organization"
  | "business"
  | "workspace"
  | "property"
  | "project"
  | "goal"
  | "person"
  | "team"
  | "role"
  | "agent"
  | "connector"
  | "workflow"
  | "task"
  | "approval"
  | "decision"
  | "kpi"
  | "risk"
  | "incident"
  | "asset"
  | "knowledge"
  | "evidence"
  | "customer"
  | "supplier";

export type BrainRelationType =
  | "owns"
  | "controls"
  | "part_of"
  | "operates"
  | "manages"
  | "member_of"
  | "works_for"
  | "responsible_for"
  | "connected_to"
  | "depends_on"
  | "blocked_by"
  | "triggered_by"
  | "reads_from"
  | "writes_to"
  | "produces"
  | "requires_approval_from"
  | "evidenced_by";

export type BrainVerificationState =
  | "verified"
  | "partially_verified"
  | "unverified"
  | "conflicted"
  | "not_applicable";

export type BrainFreshnessState =
  | "current"
  | "aging"
  | "stale"
  | "unknown";

export type BrainActivityState =
  | "idle"
  | "reading"
  | "analyzing"
  | "waiting"
  | "approval_required"
  | "executing"
  | "verifying"
  | "completed"
  | "failed"
  | "degraded";

export type BrainHealthState =
  | "healthy"
  | "degraded"
  | "unavailable"
  | "unknown"
  | "misconfigured"
  | "unverified";

export type BrainExecutionState =
  | "queued"
  | "reading"
  | "analyzing"
  | "waiting"
  | "approval_required"
  | "approved"
  | "executing"
  | "verifying"
  | "completed"
  | "failed"
  | "rolled_back"
  | "cancelled";

export type BrainApprovalState =
  | "not_required"
  | "required"
  | "pending"
  | "approved"
  | "rejected"
  | "needs_changes"
  | "expired";

export type BrainActorKind =
  | "human"
  | "agent"
  | "workflow"
  | "system"
  | "connector";

export type BrainRedactionClass =
  | "public_reference"
  | "work_org"
  | "work_restricted"
  | "work_private"
  | "personal_private"
  | "system_sensitive"
  | "never_client";

export type BrainEventType =
  | "source.read"
  | "source.synced"
  | "source.failed"
  | "source.freshness_changed"
  | "policy.evaluated"
  | "permission.denied"
  | "action.prepared"
  | "action.started"
  | "action.completed"
  | "action.failed"
  | "action.cancelled"
  | "action.rolled_back"
  | "approval.requested"
  | "approval.approved"
  | "approval.rejected"
  | "approval.needs_changes"
  | "verification.started"
  | "verification.passed"
  | "verification.failed"
  | "evidence.attached"
  | "connector.health_changed"
  | "system.drift_detected"
  | "system.incident_detected"
  | "task.created"
  | "task.completed"
  | "decision.recorded"
  | "risk.detected"
  | "goal.progress_changed"
  | `domain.${string}`;

export type BrainCapabilitySummary = {
  canOpen: boolean;
  canInspectEvidence: boolean;
  canPrepareAction: boolean;
  canExecute: boolean;
  canApprove: boolean;
  actionCeiling: ActionLevel;
  approvalRequirement: ApprovalRequirement;
};

export type BrainSourceSummary = {
  sourceSystem: string;
  authoritySystem: string;
  freshness: BrainFreshnessState;
  verification: BrainVerificationState;
  observedAt?: string;
  authoritative?: boolean;
};

export type BrainProjectionContext = {
  mode: "personal" | "organization";
  scopeRef: string;
  organizationRef?: string;
  workspaceRef?: string;
  isolationMode:
    | "private"
    | "portfolio"
    | "shared_project"
    | "client_isolated"
    | "public_reference";
};

export type BrainNode = {
  id: string;
  kind: BrainNodeKind;
  label: string;
  scopeRef: string;
  status: OperationalStatus;
  risk: RiskLevel;
  verification: BrainVerificationState;
  freshness: BrainFreshnessState;
  sourceSystem: string;
  authoritySystem: string;
  capabilities: BrainCapabilitySummary;
  activity?: BrainActivityState;
  health?: BrainHealthState;
  summary?: string;
  metric?: {
    label: string;
    value: string | number;
    unit?: string;
  };
};

export type BrainEdge = {
  id: string;
  source: string;
  target: string;
  relation: BrainRelationType;
  status?: OperationalStatus;
  risk?: RiskLevel;
  verification?: BrainVerificationState;
  freshness?: BrainFreshnessState;
  summary?: string;
};

export type BrainEvent = {
  eventId: string;
  occurredAt: string;
  scopeRef: string;
  actorKind: BrainActorKind;
  actorRef: string;
  eventType: BrainEventType;
  entityKind: BrainNodeKind;
  entityRef: string;
  summary: string;
  sourceSystem: string;
  authoritySystem: string;
  risk: RiskLevel;
  approvalState: BrainApprovalState;
  executionState: BrainExecutionState;
  verificationState: BrainVerificationState;
  evidenceRefs: string[];
  redactionClass: BrainRedactionClass;
  correlationId: string;
  parentEventId?: string;
  workflowRunRef?: string;
  actionRef?: string;
};

export type BrainProjection = {
  contractVersion: typeof BRAIN_CONTRACT_VERSION;
  generatedAt: string;
  mode: BrainProjectionMode;
  synthetic: boolean;
  context: BrainProjectionContext;
  nodes: BrainNode[];
  edges: BrainEdge[];
  recentEvents?: BrainEvent[];
  sources: BrainSourceSummary[];
  partial: boolean;
  degradedReason?: string;
};
