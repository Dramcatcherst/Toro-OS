import {
  BRAIN_CONTRACT_VERSION,
  type BrainFreshnessState,
  type BrainNode,
  type BrainProjection,
  type BrainSourceSummary,
  type BrainVerificationState,
} from "@/lib/brain-contracts";
import type { OperationalStatus, RiskLevel } from "@/lib/toro-types";

import type {
  CanonicalBrainReadSlice,
  CanonicalDomainGovernanceSummary,
  CanonicalKrossHealthSummary,
  CanonicalProjectSummary,
  CanonicalSourceAuthoritySummary,
} from "./canonical-read";

const PROJECT_LIMIT = 5;
const KROSS_LIMIT = 5;
const AUTHORITY_LIMIT = 4;
const GOVERNANCE_LIMIT = 4;

const observeOnly = {
  canOpen: true,
  canInspectEvidence: false,
  canPrepareAction: false,
  canExecute: false,
  canApprove: false,
  actionCeiling: "observe" as const,
  approvalRequirement: "None" as const,
};

function projectStatus(status: string | null): OperationalStatus {
  const normalized = status?.trim().toLowerCase() ?? "";
  if (["active", "in_progress", "in progress", "running"].includes(normalized)) {
    return "Active";
  }
  if (["completed", "complete", "done", "ready"].includes(normalized)) {
    return "Ready";
  }
  if (normalized === "blocked") return "Blocked";
  if (normalized === "queued") return "Queued";
  if (normalized === "draft") return "Draft";
  return "Review";
}

function freshnessFromDate(
  value: string | null,
  generatedAt: string,
): BrainFreshnessState {
  if (!value) return "unknown";
  const observed = Date.parse(value);
  const generated = Date.parse(generatedAt);
  if (!Number.isFinite(observed) || !Number.isFinite(generated)) return "unknown";

  const age = Math.max(0, generated - observed);
  if (age <= 48 * 60 * 60 * 1000) return "current";
  if (age <= 7 * 24 * 60 * 60 * 1000) return "aging";
  return "stale";
}

function freshnessFromSource(value: string | null): BrainFreshnessState {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized === "fresh" || normalized === "current") return "current";
  if (normalized === "aging" || normalized === "recent") return "aging";
  if (normalized === "stale") return "stale";
  return "unknown";
}

function criticalityRisk(value: string): RiskLevel {
  const normalized = value.trim().toLowerCase();
  if (normalized === "critical") return "Critical";
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  return "Low";
}

function projectNode(
  project: CanonicalProjectSummary,
  scopeRef: string,
  generatedAt: string,
): BrainNode {
  return {
    id: project.ref,
    kind: "project",
    label: project.label,
    scopeRef,
    status: projectStatus(project.status),
    risk: project.needsRevalidation ? "Medium" : "Low",
    verification: project.needsRevalidation ? "unverified" : "verified",
    freshness: freshnessFromDate(project.updatedAt, generatedAt),
    sourceSystem: project.sourceSystem ?? "Supabase",
    authoritySystem: "TORO Projects",
    capabilities: observeOnly,
    activity: "idle",
    summary: [
      project.businessArea,
      project.priority,
      project.moduleKey,
    ].filter(Boolean).join(" · ") || undefined,
    metric:
      project.completionPct === null
        ? undefined
        : { label: "Completion", value: project.completionPct, unit: "%" },
  };
}

function authorityNode(
  rule: CanonicalSourceAuthoritySummary,
  scopeRef: string,
  generatedAt: string,
): BrainNode {
  return {
    id: rule.ref,
    kind: "knowledge",
    label: `${rule.domain} authority`,
    scopeRef,
    status: rule.status.trim().toLowerCase() === "active" ? "Active" : "Review",
    risk: rule.approvalRequired ? "Medium" : "Low",
    verification: rule.lastReviewed ? "verified" : "unverified",
    freshness: freshnessFromDate(rule.lastReviewed, generatedAt),
    sourceSystem: "TORO Data",
    authoritySystem: rule.officialSource,
    capabilities: observeOnly,
    activity: "idle",
    summary: rule.authorityLevel
      ? `Official source: ${rule.officialSource} · ${rule.authorityLevel}`
      : `Official source: ${rule.officialSource}`,
  };
}

function governanceVerification(
  item: CanonicalDomainGovernanceSummary,
): BrainVerificationState {
  if (item.qualityScore === null || item.qualityTarget === null) return "unverified";
  return item.qualityScore >= item.qualityTarget
    ? "verified"
    : "partially_verified";
}

function governanceNode(
  item: CanonicalDomainGovernanceSummary,
  scopeRef: string,
  generatedAt: string,
): BrainNode {
  const verification = governanceVerification(item);
  const freshness = item.nextReviewAt
    ? Date.parse(item.nextReviewAt) < Date.parse(generatedAt)
      ? "stale"
      : "current"
    : freshnessFromDate(item.lastReviewedAt, generatedAt);

  return {
    id: item.ref,
    kind: "knowledge",
    label: `${item.domain} governance`,
    scopeRef,
    status:
      verification === "verified" && freshness !== "stale" ? "Ready" : "Review",
    risk: criticalityRisk(item.criticality),
    verification,
    freshness,
    sourceSystem: "Supabase",
    authoritySystem: "TORO Data",
    capabilities: observeOnly,
    activity: "idle",
    summary: `Criticality: ${item.criticality}`,
    metric:
      item.qualityScore === null
        ? undefined
        : { label: "Quality", value: item.qualityScore },
  };
}

function krossNode(
  item: CanonicalKrossHealthSummary,
  scopeRef: string,
): BrainNode {
  const safe = item.safeForCurrentState;
  return {
    id: item.ref,
    kind: "connector",
    label: item.sourceName ?? item.snapshotKind ?? "Kross source",
    scopeRef,
    status: safe ? "Ready" : "Review",
    risk: safe ? "Low" : "High",
    verification: safe ? "verified" : "unverified",
    freshness: freshnessFromSource(item.freshness),
    sourceSystem: item.sourceName ?? "Kross",
    authoritySystem: "Kross",
    capabilities: observeOnly,
    activity: "idle",
    health: safe ? "healthy" : "degraded",
    summary: item.liveRequired
      ? "Live-required Kross source"
      : "Supporting Kross source",
  };
}

function sourceSummary(
  rule: CanonicalSourceAuthoritySummary,
  generatedAt: string,
): BrainSourceSummary {
  return {
    sourceSystem: rule.officialSource,
    authoritySystem: rule.officialSource,
    freshness: freshnessFromDate(rule.lastReviewed, generatedAt),
    verification: rule.lastReviewed ? "verified" : "unverified",
    authoritative: true,
  };
}

export function buildCanonicalBrainProjection(
  slice: CanonicalBrainReadSlice,
): BrainProjection {
  const projects = slice.projects.slice(0, PROJECT_LIMIT);
  const kross = slice.krossHealth.slice(0, KROSS_LIMIT);
  const authority = slice.sourceAuthority.slice(0, AUTHORITY_LIMIT);
  const governance = slice.domainGovernance.slice(0, GOVERNANCE_LIMIT);

  const root: BrainNode = {
    id: slice.organization.ref,
    kind: "organization",
    label: slice.organization.label,
    scopeRef: slice.scopeRef,
    status: projectStatus(slice.organization.status),
    risk: "Low",
    verification: "verified",
    freshness: "current",
    sourceSystem: "Supabase",
    authoritySystem: "TORO Identity",
    capabilities: observeOnly,
    activity: "idle",
  };

  const nodes = [
    root,
    ...projects.map((item) =>
      projectNode(item, slice.scopeRef, slice.generatedAt),
    ),
    ...kross.map((item) => krossNode(item, slice.scopeRef)),
    ...authority.map((item) =>
      authorityNode(item, slice.scopeRef, slice.generatedAt),
    ),
    ...governance.map((item) =>
      governanceNode(item, slice.scopeRef, slice.generatedAt),
    ),
  ];

  const edges = nodes
    .filter((node) => node.id !== root.id)
    .map((node) => ({
      id: `edge:${root.id}:${node.id}`,
      source: root.id,
      target: node.id,
      relation:
        node.kind === "connector"
          ? ("connected_to" as const)
          : node.kind === "project"
            ? ("operates" as const)
            : ("controls" as const),
      verification: node.verification,
      freshness: node.freshness,
    }));

  const sourceMap = new Map<string, BrainSourceSummary>();
  sourceMap.set("Supabase", {
    sourceSystem: "Supabase",
    authoritySystem: "TORO structured runtime",
    freshness: "current",
    verification: "verified",
    authoritative: false,
  });

  for (const item of authority) {
    sourceMap.set(
      item.officialSource,
      sourceSummary(item, slice.generatedAt),
    );
  }

  const partial =
    slice.projects.length > PROJECT_LIMIT ||
    slice.krossHealth.length > KROSS_LIMIT ||
    slice.sourceAuthority.length > AUTHORITY_LIMIT ||
    slice.domainGovernance.length > GOVERNANCE_LIMIT;

  return {
    contractVersion: BRAIN_CONTRACT_VERSION,
    generatedAt: slice.generatedAt,
    mode: "workspace",
    synthetic: false,
    context: {
      mode: "organization",
      scopeRef: slice.scopeRef,
      organizationRef: slice.organization.ref,
      isolationMode: "private",
    },
    nodes,
    edges,
    sources: [...sourceMap.values()],
    partial,
    degradedReason: partial
      ? "Focused projection intentionally capped; expand through governed detail views."
      : undefined,
  };
}

export type CanonicalBrainLayout = Record<string, { x: number; y: number }>;

function spread(
  ids: string[],
  y: number,
  left = 12,
  right = 88,
): CanonicalBrainLayout {
  if (ids.length === 0) return {};
  if (ids.length === 1) return { [ids[0]]: { x: 50, y } };

  return Object.fromEntries(
    ids.map((id, index) => [
      id,
      {
        x: left + ((right - left) * index) / (ids.length - 1),
        y,
      },
    ]),
  );
}

export function buildCanonicalBrainLayout(
  projection: BrainProjection,
): CanonicalBrainLayout {
  const root = projection.nodes.find((node) => node.kind === "organization");
  const projects = projection.nodes
    .filter((node) => node.kind === "project")
    .map((node) => node.id);
  const connectors = projection.nodes
    .filter((node) => node.kind === "connector")
    .map((node) => node.id);
  const authority = projection.nodes
    .filter((node) => node.kind === "knowledge" && node.id.startsWith("authority:"))
    .map((node) => node.id);
  const governance = projection.nodes
    .filter((node) => node.kind === "knowledge" && node.id.startsWith("governance:"))
    .map((node) => node.id);

  return {
    ...(root ? { [root.id]: { x: 50, y: 8 } } : {}),
    ...spread(projects, 28),
    ...spread(connectors, 48),
    ...spread(authority, 67),
    ...spread(governance, 84),
  };
}
