import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToroResolvedContext } from "@/features/context/types";
import { resolveToroContextWithSupabase } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { internalCapabilityEnabled } from "@/lib/server/public-demo";
import { portalReadRpcSelected, readPortalBrainRpc } from "@/lib/server/portal-read-rpc";
import { canReadHotelOperations, emptyHotelOperations, HOTEL_OPERATIONS_SCOPE, HOTEL_TASK_READ_LIMIT,
  HOTEL_KROSS_HEALTH_LIMIT, projectHotelKrossHealth, projectHotelTasks, type HotelOperationsView } from "./hotel-operations";

const taskFields = "id,org_id,property_id,task_name,status,priority,area,owner_name,assignee_name,due_date,source_system,updated_at,needs_revalidation";
const healthFields = "id,org_id,property_id,source_name,snapshot_kind,source_as_of,observed_at,live_required,freshness_status,safe_for_current_state";

/** Uses the existing authenticated RLS client. Never allocates a worker/service-role client. */
export async function loadHotelOperationsWithClient(context: ToroResolvedContext, client: SupabaseClient): Promise<HotelOperationsView> {
  if (!internalCapabilityEnabled("TORO_BRAIN_CANONICAL_READ_ENABLED")) return emptyHotelOperations("disabled");
  if (!canReadHotelOperations(context)) return emptyHotelOperations("denied");
  const requested = { userId: context.userId, orgId: context.orgId };
  let rpcSelected: boolean;
  try { rpcSelected = portalReadRpcSelected(); }
  catch { return emptyHotelOperations("unavailable", "transport_unavailable"); }
  if (rpcSelected) {
    try {
      const bundle = await readPortalBrainRpc(context, client);
      // Old deployments are valid Brain readers but do not carry property-scoped operations.
      if (!bundle.hotelOperations) return emptyHotelOperations("unavailable", "transport_unavailable");
      const tasks = projectHotelTasks(bundle.hotelOperations.tasks.rows);
      const kross = projectHotelKrossHealth(bundle.hotelOperations.krossHealth.rows, bundle.generatedAt);
      const available = Number(tasks.state === "ready") + Number(kross.state === "ready");
      return { state: available === 2 ? "ready" : available === 1 ? "partial" : "unavailable",
        readAt: bundle.generatedAt, tasks, kross };
    } catch { return emptyHotelOperations("unavailable"); }
  }
  const scope = HOTEL_OPERATIONS_SCOPE;
  const read = async (kind: "tasks" | "kross") => {
    try {
      if (kind === "tasks") return await client.schema("operations").from("tasks").select(taskFields)
        .eq("org_id", scope.orgId).eq("property_id", scope.propertyId).eq("active", true)
        .or("status.is.null,status.not.in.(completed,cancelled,canceled,done,closed)")
        .order("updated_at", { ascending: false }).limit(HOTEL_TASK_READ_LIMIT + 1);
      return await client.schema("integrations").from("kross_snapshot_health").select(healthFields)
        .eq("org_id", scope.orgId).eq("property_id", scope.propertyId)
        .order("observed_at", { ascending: false }).limit(HOTEL_KROSS_HEALTH_LIMIT + 1);
    } catch { return { data: null, error: { code: "source_unavailable" } }; }
  };
  const [tasksRead, healthRead] = await Promise.all([read("tasks"), read("kross")]);
  const readAt = new Date().toISOString();
  // Revalidate identity, membership and scope after all awaited sources, before releasing any row.
  let current: ToroResolvedContext | null;
  try { current = await resolveToroContextWithSupabase(client, { mode: "organization", orgId: scope.orgId }); }
  catch { return emptyHotelOperations("denied"); }
  if (!canReadHotelOperations(current) || current!.userId !== requested.userId || current!.orgId !== requested.orgId ||
    !canReadHotelOperations(context) || context.userId !== requested.userId || context.orgId !== requested.orgId) {
    return emptyHotelOperations("denied");
  }
  const tasks = tasksRead.error ? emptyHotelOperations("unavailable").tasks : projectHotelTasks(tasksRead.data);
  const kross = healthRead.error ? emptyHotelOperations("unavailable").kross : projectHotelKrossHealth(healthRead.data, readAt);
  const available = Number(tasks.state === "ready") + Number(kross.state === "ready");
  return { state: available === 2 ? "ready" : available === 1 ? "partial" : "unavailable", readAt, tasks, kross };
}

export async function loadHotelOperations(context: ToroResolvedContext): Promise<HotelOperationsView> {
  if (!internalCapabilityEnabled("TORO_BRAIN_CANONICAL_READ_ENABLED")) return emptyHotelOperations("disabled");
  if (!canReadHotelOperations(context)) return emptyHotelOperations("denied");
  try { return await loadHotelOperationsWithClient(context, await createServerSupabaseClient()); }
  catch { return emptyHotelOperations("unavailable"); }
}
