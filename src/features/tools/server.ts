import "server-only";
import { resolveToroContext } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canReadHotelDirectory, projectToolRows, type ToolLink } from "./directory";

export type DirectoryView = { state: "ready" | "denied" | "unavailable"; links: ToolLink[]; account?: string; reason?: "connection_pending" };

export async function loadHotelDirectory(): Promise<DirectoryView> {
  try {
    const context = await resolveToroContext({ mode: "organization" });
    if (!canReadHotelDirectory(context)) return { state: "denied", links: [] };
    const account = context!.email ?? undefined;
    const client = await createServerSupabaseClient();
    const { data, error } = await client.rpc("dreamcatcher_tool_links_v1");
    if (error) return { state: "unavailable", links: [], account,
      ...(["PGRST106", "PGRST202"].includes(error.code) ? { reason: "connection_pending" as const } : {}) };
    const links = projectToolRows(context, data);
    return { state: links.length ? "ready" : "unavailable", links, account };
  } catch {
    return { state: "unavailable", links: [] };
  }
}
