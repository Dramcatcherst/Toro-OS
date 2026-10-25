import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToroResolvedContext } from "@/features/context/types";
import { createToroReportingContext } from "@/lib/reporting-policy";
import { internalCapabilityEnabled } from "@/lib/server/public-demo";
import { portalReadRpcSelected } from "@/lib/server/portal-read-rpc";
import { KROSS_INFORMATIONAL_ROW_LIMIT, projectKrossOperationalSnapshot } from "./operational-snapshot";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELDS = "org_id,property_id,external_reservation_id,check_in,check_out,status,source_system,transactional_authority,read_only_mirror,snapshot_as_of,last_synced_at,source_hash,data_quality_status";

function authorized(context: ToroResolvedContext) {
  return context.mode === "organization" && !!context.userId && !!context.orgId &&
    !context.requiresContextChoice && context.canUseOrganizationData && context.allowedDataScopes.includes("work_org") &&
    context.membership?.status === "active" && context.membership.orgId === context.orgId &&
    context.membership.roles.some(role => role === "ADMIN" || role === "GERENCIA");
}

/** Shared by supported TORO surfaces; no new source, credential, grant or writer. */
export async function loadKrossOperationalSnapshotWithClient(
  context: ToroResolvedContext,
  client: SupabaseClient,
  input: { propertyId: string; asOf?: Date },
) {
  const unavailable = (reason: string) => ({
    state: "unavailable" as const, mode: "informational_snapshot" as const,
    externalWrite: false as const, maxAgeMinutes: 60, reason,
    sourceAsOf: null, counts: null, coverage: null, reportingDate: null, asOf: null,
  });
  if (!internalCapabilityEnabled("TORO_BRAIN_CANONICAL_READ_ENABLED")) return unavailable("read_disabled");
  if (!authorized(context)) return { ...unavailable("not_authorized"), state: "forbidden" as const };
  if (!UUID.test(input.propertyId) || !UUID.test(context.orgId!)) return unavailable("invalid_property_scope");
  let report;
  try {
    report = createToroReportingContext(input.asOf ?? new Date());
    if (portalReadRpcSelected()) return unavailable("session_transport_unsupported");
  } catch { return unavailable("invalid_time_or_transport"); }
  try {
    const result = await client.schema("operations").from("reservations")
      .select(FIELDS, { count: "exact" })
      .eq("org_id", context.orgId!).eq("property_id", input.propertyId)
      .lte("check_in", report.reportingDate).gte("check_out", report.reportingDate)
      .order("external_reservation_id", { ascending: true })
      .limit(KROSS_INFORMATIONAL_ROW_LIMIT + 1)
      .abortSignal(AbortSignal.timeout(8_000));
    if (result.error || !Array.isArray(result.data)) return unavailable("reservation_read_failed");
    return projectKrossOperationalSnapshot(result.data, {
      orgId: context.orgId!, propertyId: input.propertyId, asOf: report.asOf,
      reportingDate: report.reportingDate,
      truncated: result.data.length > KROSS_INFORMATIONAL_ROW_LIMIT ||
        (typeof result.count === "number" && result.count > KROSS_INFORMATIONAL_ROW_LIMIT),
    });
  } catch { return unavailable("reservation_read_failed"); }
}
