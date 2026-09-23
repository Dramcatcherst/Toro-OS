import "server-only";

import { createHash } from "node:crypto";

import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const CANONICAL_BRAIN_READ_CONTRACT = "stage-c-read-v1" as const;

export type CanonicalOrganizationSummary = {
  ref: string;
  label: string;
  status: string;
};

export type CanonicalProjectSummary = {
  ref: string;
  label: string;
  status: string | null;
  priority: string | null;
  businessArea: string | null;
  moduleKey: string | null;
  completionPct: number | null;
  needsRevalidation: boolean;
  sourceSystem: string | null;
  updatedAt: string;
};

export type CanonicalSourceAuthoritySummary = {
  ref: string;
  domain: string;
  officialSource: string;
  authorityLevel: string | null;
  approvalRequired: boolean;
  status: string;
  lastReviewed: string | null;
};

export type CanonicalDomainGovernanceSummary = {
  ref: string;
  domain: string;
  criticality: string;
  qualityTarget: number | null;
  qualityScore: number | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
};

export type CanonicalKrossHealthSummary = {
  ref: string;
  sourceName: string | null;
  snapshotKind: string | null;
  sourceAsOf: string | null;
  observedAt: string | null;
  liveRequired: boolean;
  freshness: string | null;
  safeForCurrentState: boolean;
};

export type CanonicalBrainReadSlice = {
  contractVersion: typeof CANONICAL_BRAIN_READ_CONTRACT;
  generatedAt: string;
  scopeRef: string;
  organization: CanonicalOrganizationSummary;
  projects: CanonicalProjectSummary[];
  sourceAuthority: CanonicalSourceAuthoritySummary[];
  domainGovernance: CanonicalDomainGovernanceSummary[];
  krossHealth: CanonicalKrossHealthSummary[];
};

type OrganizationRow = {
  id: string;
  name: string;
  status: string;
};

type ProjectRow = {
  id: string;
  project_name: string;
  priority: string | null;
  status: string | null;
  business_area: string | null;
  canonical_module_key: string | null;
  completion_pct: number | string | null;
  needs_revalidation: boolean;
  source_system: string | null;
  updated_at: string;
};

type SourceAuthorityRow = {
  id: string;
  domain: string;
  official_source: string;
  human_approval_required: boolean;
  authority_level: string | null;
  rule_status: string;
  last_reviewed: string | null;
};

type DomainGovernanceRow = {
  id: string;
  domain: string;
  criticality: string;
  quality_target: number | string | null;
  current_quality_score: number | string | null;
  last_reviewed_at: string | null;
  next_review_at: string | null;
};

type KrossHealthRow = {
  id: string | null;
  source_name: string | null;
  snapshot_kind: string | null;
  source_as_of: string | null;
  observed_at: string | null;
  live_required: boolean | null;
  freshness_status: string | null;
  safe_for_current_state: boolean | null;
};

function stableProjectionRef(kind: string, canonicalId: string) {
  const digest = createHash("sha256")
    .update(`${kind}:${canonicalId}`)
    .digest("hex")
    .slice(0, 20);

  return `${kind}:${digest}`;
}

function nullableNumber(value: number | string | null): number | null {
  if (value === null) return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function assertOrganizationContext(
  context: ToroResolvedContext,
): asserts context is ToroResolvedContext & {
  mode: "organization";
  orgId: string;
  membership: NonNullable<ToroResolvedContext["membership"]>;
} {
  if (
    context.mode !== "organization" ||
    !context.orgId ||
    !context.membership ||
    context.membership.status !== "active" ||
    context.membership.orgId !== context.orgId ||
    !context.canUseOrganizationData
  ) {
    throw new Error("Canonical Brain read requires an active organization context.");
  }
}

export function projectCanonicalBrainReadSlice(input: {
  orgId: string;
  organization: OrganizationRow;
  projects: ProjectRow[];
  sourceAuthority: SourceAuthorityRow[];
  domainGovernance: DomainGovernanceRow[];
  krossHealth: KrossHealthRow[];
  generatedAt?: string;
}): CanonicalBrainReadSlice {
  return {
    contractVersion: CANONICAL_BRAIN_READ_CONTRACT,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    scopeRef: stableProjectionRef("scope", input.orgId),
    organization: {
      ref: stableProjectionRef("organization", input.organization.id),
      label: input.organization.name,
      status: input.organization.status,
    },
    projects: input.projects.map((row) => ({
      ref: stableProjectionRef("project", row.id),
      label: row.project_name,
      status: row.status,
      priority: row.priority,
      businessArea: row.business_area,
      moduleKey: row.canonical_module_key,
      completionPct: nullableNumber(row.completion_pct),
      needsRevalidation: row.needs_revalidation,
      sourceSystem: row.source_system,
      updatedAt: row.updated_at,
    })),
    sourceAuthority: input.sourceAuthority.map((row) => ({
      ref: stableProjectionRef("authority", row.id),
      domain: row.domain,
      officialSource: row.official_source,
      authorityLevel: row.authority_level,
      approvalRequired: row.human_approval_required,
      status: row.rule_status,
      lastReviewed: row.last_reviewed,
    })),
    domainGovernance: input.domainGovernance.map((row) => ({
      ref: stableProjectionRef("governance", row.id),
      domain: row.domain,
      criticality: row.criticality,
      qualityTarget: nullableNumber(row.quality_target),
      qualityScore: nullableNumber(row.current_quality_score),
      lastReviewedAt: row.last_reviewed_at,
      nextReviewAt: row.next_review_at,
    })),
    krossHealth: input.krossHealth.map((row, index) => ({
      ref: stableProjectionRef(
        "kross-health",
        row.id ?? `${row.source_name ?? "unknown"}:${row.snapshot_kind ?? "unknown"}:${index}`,
      ),
      sourceName: row.source_name,
      snapshotKind: row.snapshot_kind,
      sourceAsOf: row.source_as_of,
      observedAt: row.observed_at,
      liveRequired: row.live_required === true,
      freshness: row.freshness_status,
      safeForCurrentState: row.safe_for_current_state === true,
    })),
  };
}

export async function loadCanonicalBrainReadSlice(
  context: ToroResolvedContext,
): Promise<CanonicalBrainReadSlice> {
  assertOrganizationContext(context);

  const supabase = await createServerSupabaseClient();

  const [
    organizationResult,
    projectsResult,
    authorityResult,
    governanceResult,
    krossResult,
  ] = await Promise.all([
      supabase
        .from("organizations")
        .select("id,name,status")
        .eq("id", context.orgId)
        .is("deleted_at", null)
        .limit(1),
      supabase
        .schema("operations")
        .from("projects")
        .select(
          "id,project_name,priority,status,business_area,canonical_module_key,completion_pct,needs_revalidation,source_system,updated_at",
        )
        .eq("org_id", context.orgId)
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .limit(25),
      supabase
        .schema("integrations")
        .from("source_authority_rules")
        .select(
          "id,domain,official_source,human_approval_required,authority_level,rule_status,last_reviewed",
        )
        .eq("org_id", context.orgId)
        .order("domain", { ascending: true })
        .limit(25),
      supabase
        .schema("integrations")
        .from("domain_governance")
        .select(
          "id,domain,criticality,quality_target,current_quality_score,last_reviewed_at,next_review_at",
        )
        .eq("org_id", context.orgId)
        .order("domain", { ascending: true })
        .limit(25),
      supabase
        .schema("integrations")
        .from("kross_snapshot_health")
        .select(
          "id,source_name,snapshot_kind,source_as_of,observed_at,live_required,freshness_status,safe_for_current_state",
        )
        .eq("org_id", context.orgId)
        .order("observed_at", { ascending: false })
        .limit(25),
    ]);

  for (const result of [
    organizationResult,
    projectsResult,
    authorityResult,
    governanceResult,
    krossResult,
  ]) {
    if (result.error) {
      throw new Error("Canonical Brain read source unavailable.");
    }
  }

  if (!Array.isArray(organizationResult.data) || organizationResult.data.length !== 1) {
    throw new Error("Canonical Brain organization source unavailable.");
  }

  return projectCanonicalBrainReadSlice({
    orgId: context.orgId,
    organization: organizationResult.data[0] as OrganizationRow,
    projects: (projectsResult.data ?? []) as ProjectRow[],
    sourceAuthority: (authorityResult.data ?? []) as SourceAuthorityRow[],
    domainGovernance: (governanceResult.data ?? []) as DomainGovernanceRow[],
    krossHealth: (krossResult.data ?? []) as KrossHealthRow[],
  });
}
