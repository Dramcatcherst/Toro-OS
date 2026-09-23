import type {
  BrainFreshnessState,
  BrainNode,
  BrainVerificationState,
} from "@/lib/brain-contracts";
import type { RiskLevel } from "@/lib/toro-types";

import type { AuthorizedKnowledgeProjection } from "./types";

function normalizeRisk(value: string): RiskLevel {
  switch (value.trim().toLowerCase()) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    default:
      return "Low";
  }
}

function parseTime(value: string | null): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function resolveFreshness(
  row: AuthorizedKnowledgeProjection,
  now: Date,
): BrainFreshnessState {
  const sourceAsOf = parseTime(row.sourceAsOf);
  const projectionAsOf = parseTime(row.projectionUpdatedAt);

  if (sourceAsOf !== null && projectionAsOf !== null && sourceAsOf > projectionAsOf) {
    return "stale";
  }

  if (row.nextReview) {
    const reviewAt = Date.parse(`${row.nextReview}T23:59:59Z`);
    if (!Number.isNaN(reviewAt) && reviewAt < now.getTime()) return "stale";
    return "current";
  }

  if (!row.lastVerified) return "unknown";
  return "aging";
}

function resolveVerification(
  row: AuthorizedKnowledgeProjection,
  freshness: BrainFreshnessState,
): BrainVerificationState {
  if (freshness === "stale") return "partially_verified";

  const verified = row.verifiedStatus.trim().toLowerCase() === "verified";
  if (verified && !row.requiresHumanVerification) return "verified";
  if (verified || row.requiresHumanVerification) return "partially_verified";
  return "unverified";
}

export function projectKnowledgeNode(
  row: AuthorizedKnowledgeProjection,
  now: Date,
): BrainNode {
  const freshness = resolveFreshness(row, now);
  const verification = resolveVerification(row, freshness);
  const historical =
    row.projectionStatus?.toUpperCase().includes("HISTORICAL") ?? false;
  const notOperational =
    row.projectionStatus?.toUpperCase().includes("NOT_OPERATIONAL_APPROVAL") ??
    false;

  const qualifiers = [
    historical ? "historical reference" : null,
    row.requiresHumanVerification ? "human review required" : null,
    notOperational ? "not operational approval" : null,
  ].filter(Boolean);

  return {
    id: `knowledge:${row.knowledgeKey || row.id}`,
    kind: "knowledge",
    label: row.title,
    scopeRef: `org:${row.orgId}`,
    status:
      freshness === "stale" ||
      row.requiresHumanVerification ||
      verification !== "verified"
        ? "Review"
        : "Ready",
    risk: normalizeRisk(row.riskLevel),
    verification,
    freshness,
    sourceSystem: row.sourceSystem ?? "operations.knowledge_items",
    authoritySystem: "TORO Knowledge",
    capabilities: {
      canOpen: true,
      canInspectEvidence: true,
      canPrepareAction: false,
      canExecute: false,
      canApprove: false,
      actionCeiling: "observe",
      approvalRequirement: row.requiresHumanVerification
        ? "Human review"
        : "None",
    },
    summary:
      qualifiers.length > 0
        ? `Governed knowledge: ${qualifiers.join("; ")}.`
        : "Governed knowledge reference.",
  };
}
