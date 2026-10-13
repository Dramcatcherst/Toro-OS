import "server-only";
import { resolveToroContext } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canReadHotelDirectory, projectToolRows, type ToolLink } from "./directory";
import { portalNavigation } from "./portal-navigation";

export type DirectoryView = { state: "ready" | "denied" | "unavailable"; links: ToolLink[]; account?: string; reason?: "connection_pending"; navigationAuthorized?: true };

export async function loadHotelDirectory({ includeApprovedNavigation = false }: { includeApprovedNavigation?: boolean } = {}): Promise<DirectoryView> {
  try {
    const context = await resolveToroContext({ mode: "organization" });
    if (!canReadHotelDirectory(context)) return { state: "denied", links: [] };
    const account = context!.email ?? undefined;
    const navigation = includeApprovedNavigation ? portalNavigation(context) : [];
    const client = await createServerSupabaseClient();
    const { data, error } = await client.rpc("dreamcatcher_tool_links_v1");
    if (error) return { state: "unavailable", links: navigation, account, ...(includeApprovedNavigation ? {navigationAuthorized:true as const} : {}),
      ...(["PGRST106", "PGRST202"].includes(error.code) ? { reason: "connection_pending" as const } : {}) };
    const links = projectToolRows(context, data);
    return { state: links.length ? "ready" : "unavailable", links: [...links, ...navigation], account, ...(includeApprovedNavigation ? {navigationAuthorized:true as const} : {}) };
  } catch {
    return { state: "unavailable", links: [] };
  }
}
