import { z } from "zod";
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
  ToroMcpSearchData,
  ToroMcpSearchHit,
  ToroMcpSearchReadLimit,
} from "@/lib/toro-mcp-contracts";
import type { RiskLevel } from "@/lib/toro-types";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

export function boundedMcpReadLimit(value?: number) {
  if (!Number.isFinite(value)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(value as number)));
}

type ProjectionSearchInput = {
  query: string;
  kinds?: readonly string[];
  limit?: number;
};

export function searchToroProjectionResult(
  projection: BrainProjection,
  input: ProjectionSearchInput,
  readLimits: readonly ToroMcpSearchReadLimit[] = [],
): ToroMcpSearchData {
  const query = input.query.trim().toLocaleLowerCase();
  const kinds = new Set((input.kinds ?? []).map((kind) => kind.trim()).filter(Boolean));
  const limit = boundedMcpReadLimit(input.limit);
  const loaded = projection.nodes.filter(
    (node) => node.scopeRef === projection.context.scopeRef,
  );
  const examined = query
    ? loaded.filter((node) => kinds.size === 0 || kinds.has(node.kind))
    : [];
  const matched = examined.filter((node) => [
    node.label,
    node.kind,
    node.summary,
    node.sourceSystem,
    node.authoritySystem,
  ].filter(Boolean).join(" ").toLocaleLowerCase().includes(query));

  const hits = matched.slice(0, limit).map((node) => ({
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

  return {
    hits,
    coverage: {
      universe: "bounded_authorized_read",
      loadedCount: loaded.length,
      examinedCount: examined.length,
      matchedCount: matched.length,
      returnedCount: hits.length,
      resultLimit: limit,
      resultTruncated: matched.length > hits.length,
      readLimits,
      totalAuthorizedCount: null,
      complete: false,
      cursorSupported: false,
    },
  };
}

// Preserve the existing array API for callers that only need hits.
export function searchToroProjection(
  projection: BrainProjection,
  input: ProjectionSearchInput,
): ToroMcpSearchHit[] {
  return searchToroProjectionResult(projection, input).hits;
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
  return attention.items.slice(0, boundedMcpReadLimit(limit)).map((item) => ({
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
    .slice(0, boundedMcpReadLimit(limit))
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

const receiptTimestamp = z.string().datetime({ offset: true });

export function assertMcpReceiptTimeRange(input: { since?: unknown; until?: unknown }) {
  const parse = (value: unknown) => {
    if (value === undefined) return undefined;
    if (!receiptTimestamp.safeParse(value).success) throw new Error("Invalid receipt timestamp.");
    return Date.parse(value as string);
  };
  const since = parse(input.since);
  const until = parse(input.until);
  if (since !== undefined && until !== undefined && since > until) throw new Error("Reversed receipt range.");
  return { since, until };
}

export function executionReceiptsFromProjection(
  projection: BrainProjection,
  input: {
    correlationId?: string;
    actionRef?: string;
    workflowRunRef?: string;
    since?: string;
    until?: string;
    limit?: number;
  } = {},
): ToroMcpExecutionReceipt[] {
  const { since, until } = assertMcpReceiptTimeRange(input);
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
    .filter((event) => {
      const occurred = Date.parse(event.occurredAt);
      return receiptTimestamp.safeParse(event.occurredAt).success &&
        (since === undefined || occurred >= since) && (until === undefined || occurred <= until);
    })
    .slice(0, boundedMcpReadLimit(input.limit))
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
