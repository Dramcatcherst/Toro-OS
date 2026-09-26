type UnknownRecord = Record<string, unknown>;

export type DashboardKnowledgeInput = {
  updatedAt: string | null;
  structuredContent: unknown;
} | null;

export type DashboardMvpData = {
  money: {
    available: boolean;
    status: string | null;
    p0Count: number | null;
    p1Count: number | null;
    businessMappingPct: number | null;
    updatedAt: string | null;
  };
  studio: {
    available: boolean;
    status: string | null;
    safeAssetCount: number | null;
    draftDeliverableCount: number | null;
    publicationGated: boolean | null;
    updatedAt: string | null;
  };
};

function record(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function arrayLength(value: unknown): number | null {
  return Array.isArray(value) ? value.length : null;
}

export function buildDashboardMvpData(input: {
  payflow: DashboardKnowledgeInput;
  studio: DashboardKnowledgeInput;
}): DashboardMvpData {
  const payflowRoot = record(input.payflow?.structuredContent);
  const payflow = record(payflowRoot?.toro_payflow_v1);
  const priority = record(payflowRoot?.payflow_priority_guide_r1);
  const audit = record(payflowRoot?.payflow_audit_r3_20260924);
  const recentQuality = record(audit?.data_quality_recent);

  const p0Count = arrayLength(priority?.P0);
  const p1Count = arrayLength(priority?.P1);
  const moneyStatus = text(payflow?.status);
  const moneyAvailable =
    Boolean(payflowRoot) &&
    (moneyStatus !== null || p0Count !== null || p1Count !== null);

  const studioRoot = record(input.studio?.structuredContent);
  const brief = record(studioRoot?.dreamcatcher_pilot_brief_v1);
  const pilot = record(studioRoot?.dreamcatcher_pilot_v1);

  const studioStatus = text(brief?.status);
  const safeAssetCount = arrayLength(brief?.safe_asset_pack);
  const draftDeliverableCount = arrayLength(brief?.deliverables_draft);
  const publicationGate = text(pilot?.publication_gate);
  const studioAvailable =
    Boolean(studioRoot) &&
    (studioStatus !== null ||
      safeAssetCount !== null ||
      draftDeliverableCount !== null);

  return {
    money: {
      available: moneyAvailable,
      status: moneyAvailable ? moneyStatus : null,
      p0Count: moneyAvailable ? p0Count : null,
      p1Count: moneyAvailable ? p1Count : null,
      businessMappingPct: moneyAvailable
        ? finiteNumber(recentQuality?.business_mapping_pct)
        : null,
      updatedAt: moneyAvailable ? input.payflow?.updatedAt ?? null : null,
    },
    studio: {
      available: studioAvailable,
      status: studioAvailable ? studioStatus : null,
      safeAssetCount: studioAvailable ? safeAssetCount : null,
      draftDeliverableCount: studioAvailable ? draftDeliverableCount : null,
      publicationGated: studioAvailable ? publicationGate !== null : null,
      updatedAt: studioAvailable ? input.studio?.updatedAt ?? null : null,
    },
  };
}
