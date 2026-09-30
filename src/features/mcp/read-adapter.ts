import type {
  OwnerAttentionProjection,
} from "@/features/attention/owner-attention";
import type {
  BrainNode,
  BrainProjection,
} from "@/lib/brain-contracts";
import type {
  ToroMcpBusinessStatusData,
  ToroMcpDecisionItem,
  ToroMcpExecutionReceipt,
  ToroMcpPriorityItem,
  ToroMcpSearchHit,
} from "@/lib/toro-mcp-contracts";
import type { RiskLevel } from "@/lib/toro-types";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

function boundedLimit(value?: number) {
  if (!Number.isFinite(value)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(value as number)));
}

export function searchToroProjection(
  projection: BrainProjection,
  input: {
    query: string;
    kinds?: readonly string[];
    limit?: number;
  },
): ToroMcpSearchHit[] {
  const query = input.query.trim().toLocaleLowerCase();
  if (!query) return [];

  const kinds = new Set((input.kinds ?? []).map((kind) => kind.trim()).filter(Boolean));
  const limit = boundedLimit(input.limit);

  return projection.nodes
    .filter((node) => kinds.size === 0 || kinds.has(node.kind))
    .map((node) => {
      const searchable = [
        node.label,
        node.kind,
        node.summary,
        node.sourceSystem,
        node.authoritySystem,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return { node, searchable };
    })
    .filter(({ searchable }) => searchable.includes(query))
    .slice(0, limit)
    .map(({ node }) => ({
      objectRef: node.id,
      kind: node.kind,
      label: node.label,
      scopeRef: node.scopeRef,
      summary: node.summary,
      sourceSystem: node.sourceSystem,
      authoritySystem: node.authoritySystem,
      freshness: node.freshness,
      verification: node.verification,
      canOpen: node.capabilities.canOpen,
      canInspectEvidence: node.capabilities.canInspectEvidence,
    }));
}

function attentionRisk(priority: "critical" | "high" | "normal"): RiskLevel {
  if (priority === "critical") return "Critical";
  if (priority === "high") return "High";
  return "Low";
}

export function prioritiesFromOwnerAttention(
  attention: OwnerAttentionProjection,
  limit = DEFAULT_LIMIT,
): ToroMcpPriorityItem[] {
  return attention.items.slice(0, boundedLimit(limit)).map((item) => ({
    objectRef: item.dedupeRef,
    title: item.title,
    reason: [item.kind, item.state].filter(Boolean).join(" · "),
    scopeRef: "owner-attention",
    ownerRef: item.humanOwner ?? item.ownerAgent ?? undefined,
    dueAt: item.dueDate ?? undefined,
    risk: attentionRisk(item.priority),
    evidenceRefs: item.sourceUrl ? [item.sourceUrl] : [],
    sourceSystem: item.sourceSystem,
    authoritySystem: item.sourceSystem,
    freshness: "unknown",
    verification: "unverified",
  }));
}

export function businessStatusFromProjection(
  projection: BrainProjection,
): ToroMcpBusinessStatusData {
  const countsByKind: ToroMcpBusinessStatusData["countsByKind"] = {};
  const riskCounts: ToroMcpBusinessStatusData["riskCounts"] = {};

  for (const node of projection.nodes) {
    countsByKind[node.kind] = (countsByKind[node.kind] ?? 0) + 1;
    riskCounts[node.risk] = (riskCounts[node.risk] ?? 0) + 1;
  }

  const organization = projection.nodes.find(
    (node) => node.kind === "organization" || node.kind === "business",
  );

  return {
    scopeRef: projection.context.scopeRef,
    organization: organization
      ? {
          objectRef: organization.id,
          label: organization.label,
          status: organization.status,
        }
      : undefined,
    nodeCount: projection.nodes.length,
    countsByKind,
    riskCounts,
    sources: projection.sources,
    partial: projection.partial,
    degradedReason: projection.degradedReason,
  };
}

export function pendingDecisionsFromProjection(
  projection: BrainProjection,
  limit = DEFAULT_LIMIT,
): ToroMcpDecisionItem[] {
  return projection.nodes
    .filter((node) => node.kind === "decision" || node.kind === "approval")
    .slice(0, boundedLimit(limit))
    .map((node) => ({
      decisionRef: node.id,
      title: node.label,
      requiredAuthority: node.capabilities.approvalRequirement,
      state: node.status,
      evidenceRefs: [],
    }));
}

function isReceiptEvent(eventType: string) {
  return [
    "action.completed",
    "action.failed",
    "action.cancelled",
    "action.rolled_back",
    "verification.passed",
    "verification.failed",
  ].includes(eventType);
}

export function executionReceiptsFromProjection(
  projection: BrainProjection,
  input: {
    correlationId?: string;
    actionRef?: string;
    workflowRunRef?: string;
    limit?: number;
  } = {},
): ToroMcpExecutionReceipt[] {
  return (projection.recentEvents ?? [])
    .filter((event) => isReceiptEvent(event.eventType))
    .filter(
      (event) =>
        !input.correlationId || event.correlationId === input.correlationId,
    )
    .filter((event) => !input.actionRef || event.actionRef === input.actionRef)
    .filter(
      (event) =>
        !input.workflowRunRef || event.workflowRunRef === input.workflowRunRef,
    )
    .slice(0, boundedLimit(input.limit))
    .map((event) => ({
      receiptRef: event.eventId,
      scopeRef: event.scopeRef,
      correlationId: event.correlationId,
      actionRef: event.actionRef,
      workflowRunRef: event.workflowRunRef,
      actorRef: event.actorRef,
      summary: event.summary,
      occurredAt: event.occurredAt,
      executionState: event.executionState,
      verificationState: event.verificationState,
      evidenceRefs: event.evidenceRefs,
      sourceSystem: event.sourceSystem,
      authoritySystem: event.authoritySystem,
    }));
}

export function projectionHasRealDecisionSource(projection: BrainProjection) {
  return projection.nodes.some(
    (node: BrainNode) => node.kind === "decision" || node.kind === "approval",
  );
}

export function projectionHasReceiptSource(projection: BrainProjection) {
  return (projection.recentEvents ?? []).some((event) =>
    isReceiptEvent(event.eventType),
  );
}
