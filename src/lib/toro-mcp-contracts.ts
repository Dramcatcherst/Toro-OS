import type {
  BrainFreshnessState,
  BrainNodeKind,
  BrainProjection,
  BrainProjectionMode,
  BrainVerificationState,
} from "./brain-contracts";
import type {
  ActionLevel,
  ApprovalRequirement,
  RiskLevel,
} from "./toro-types";

export const TORO_MCP_CONTRACT_VERSION = "1.0.0" as const;

export const TORO_MCP_CORE_TOOL_NAMES = [
  "get_brain_status",
  "search_toro",
  "get_priorities",
  "get_business_status",
  "get_pending_decisions",
  "get_execution_receipts",
] as const;

export const TORO_MCP_AUXILIARY_TOOL_NAMES = ["get_toro_profile"] as const;

export type ToroMcpCoreToolName = (typeof TORO_MCP_CORE_TOOL_NAMES)[number];
export type ToroMcpAuxiliaryToolName =
  (typeof TORO_MCP_AUXILIARY_TOOL_NAMES)[number];
export type ToroMcpToolName = ToroMcpCoreToolName | ToroMcpAuxiliaryToolName;

export type ToroMcpErrorCode =
  | "unauthenticated"
  | "context_choice_required"
  | "forbidden"
  | "invalid_request"
  | "not_found"
  | "stale_source"
  | "conflicted_source"
  | "capability_unavailable"
  | "runtime_unconfigured"
  | "degraded"
  | "rate_limited"
  | "internal_error";

export type ToroMcpContextSummary = {
  mode: "personal" | "organization";
  scopeRef: string;
  organizationRef?: string;
  workspaceRef?: string;
};

export type ToroMcpSourceSummary = {
  sourceSystem: string;
  authoritySystem: string;
  freshness: BrainFreshnessState;
  verification: BrainVerificationState;
  observedAt?: string;
  authoritative?: boolean;
};

export type ToroMcpError = {
  code: ToroMcpErrorCode;
  message: string;
  retryable: boolean;
  nextAction?: string;
};

export type ToroMcpResponse<T> = {
  contractVersion: typeof TORO_MCP_CONTRACT_VERSION;
  tool: ToroMcpToolName;
  generatedAt: string;
  correlationId: string;
  context?: ToroMcpContextSummary;
  partial: boolean;
  sources: ToroMcpSourceSummary[];
  data?: T;
  error?: ToroMcpError;
};

export type ToroMcpToolDescriptor = {
  name: ToroMcpToolName;
  purpose: string;
  readOnlyHint: boolean;
  destructiveHint: boolean;
  sideEffect: "none" | "governed_write";
  actionCeiling: ActionLevel;
  approvalRequirement: ApprovalRequirement;
  requiredCapabilities: readonly string[];
};

export const TORO_MCP_CORE_TOOLS: readonly ToroMcpToolDescriptor[] = [
  {
    name: "get_brain_status",
    purpose: "Read the permission-filtered TORO Brain status/projection.",
    readOnlyHint: true,
    destructiveHint: false,
    sideEffect: "none",
    actionCeiling: "observe",
    approvalRequirement: "None",
    requiredCapabilities: ["brain.read"],
  },
  {
    name: "search_toro",
    purpose: "Search canonical TORO objects in authorized scopes.",
    readOnlyHint: true,
    destructiveHint: false,
    sideEffect: "none",
    actionCeiling: "observe",
    approvalRequirement: "None",
    requiredCapabilities: ["knowledge.search"],
  },
  {
    name: "get_priorities",
    purpose: "Read prioritized attention/work for the resolved actor and scope.",
    readOnlyHint: true,
    destructiveHint: false,
    sideEffect: "none",
    actionCeiling: "analyze",
    approvalRequirement: "None",
    requiredCapabilities: ["attention.read"],
  },
  {
    name: "get_business_status",
    purpose: "Read a cross-domain status for an authorized business scope.",
    readOnlyHint: true,
    destructiveHint: false,
    sideEffect: "none",
    actionCeiling: "analyze",
    approvalRequirement: "None",
    requiredCapabilities: ["business.status.read"],
  },
  {
    name: "get_pending_decisions",
    purpose: "Read decisions/approvals visible to the resolved actor.",
    readOnlyHint: true,
    destructiveHint: false,
    sideEffect: "none",
    actionCeiling: "observe",
    approvalRequirement: "None",
    requiredCapabilities: ["decisions.read"],
  },
  {
    name: "get_execution_receipts",
    purpose: "Read verified execution/result lineage from canonical TORO evidence.",
    readOnlyHint: true,
    destructiveHint: false,
    sideEffect: "none",
    actionCeiling: "observe",
    approvalRequirement: "None",
    requiredCapabilities: ["evidence.read"],
  },
] as const;

export const TORO_MCP_ACTION_LIFECYCLE = [
  "Intent",
  "Policy",
  "Approval",
  "Execution",
  "Verification",
  "Receipt",
  "Memory",
] as const;

export type ToroMcpBrainStatusInput = {
  scopeRef?: string;
  mode?: Exclude<BrainProjectionMode, "demo">;
  focusRef?: string;
  correlationId?: string;
};

export type ToroMcpBrainStatusData = BrainProjection;

export type ToroMcpSearchInput = {
  query: string;
  scopeRef?: string;
  kinds?: readonly string[];
  limit?: number;
  cursor?: string;
  correlationId?: string;
};

export type ToroMcpSearchHit = {
  objectRef: string;
  kind: string;
  label: string;
  scopeRef: string;
  summary?: string;
  sourceSystem: string;
  authoritySystem: string;
  freshness: BrainFreshnessState;
  verification: BrainVerificationState;
  canOpen: boolean;
  canInspectEvidence: boolean;
};

export type ToroMcpPriorityHorizon =
  | "now"
  | "7_30d"
  | "30_90d"
  | "strategic";

export type ToroMcpPriorityItem = {
  objectRef: string;
  title: string;
  reason: string;
  scopeRef: string;
  ownerRef?: string;
  dueAt?: string;
  blocker?: string;
  nextSafeStep?: string;
  risk: RiskLevel;
  evidenceRefs: readonly string[];
  sourceSystem: string;
  authoritySystem: string;
  freshness: BrainFreshnessState;
  verification: BrainVerificationState;
};

export type ToroMcpDecisionItem = {
  decisionRef: string;
  title: string;
  reasonBlocked?: string;
  recommendation?: string;
  alternatives?: readonly string[];
  consequence?: string;
  deadline?: string;
  requiredAuthority: ApprovalRequirement;
  state: string;
  evidenceRefs: readonly string[];
};

export type ToroMcpExecutionReceipt = {
  receiptRef: string;
  scopeRef: string;
  correlationId: string;
  actionRef?: string;
  workflowRunRef?: string;
  actorRef: string;
  summary: string;
  occurredAt: string;
  executionState: string;
  verificationState: BrainVerificationState;
  evidenceRefs: readonly string[];
  sourceSystem: string;
  authoritySystem: string;
  rollbackRef?: string;
  cancellationRef?: string;
};

export type ToroMcpPrioritiesInput = {
  scopeRef?: string;
  horizon?: ToroMcpPriorityHorizon;
  limit?: number;
  correlationId?: string;
};

export type ToroMcpBusinessStatusInput = {
  scopeRef?: string;
  sections?: readonly string[];
  correlationId?: string;
};

export type ToroMcpPendingDecisionsInput = {
  scopeRef?: string;
  state?: string;
  limit?: number;
  correlationId?: string;
};

export type ToroMcpExecutionReceiptsInput = {
  scopeRef?: string;
  correlationId?: string;
  receiptCorrelationId?: string;
  actionRef?: string;
  workflowRunRef?: string;
  since?: string;
  until?: string;
  limit?: number;
};

export type ToroMcpBusinessStatusData = {
  scopeRef: string;
  organization?: {
    objectRef: string;
    label: string;
    status: string;
  };
  nodeCount: number;
  countsByKind: Partial<Record<BrainNodeKind, number>>;
  riskCounts: Partial<Record<RiskLevel, number>>;
  sources: readonly ToroMcpSourceSummary[];
  partial: boolean;
  degradedReason?: string;
};
