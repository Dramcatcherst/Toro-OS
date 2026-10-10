import "server-only";
import { resolveToroContext } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canReadHotelDirectory, DIRECTORY_SCOPE, projectHotelLinks, type ToolLink } from "./directory";

export type DirectoryView = { state: "ready" | "denied" | "unavailable"; links: ToolLink[] };

export async function loadHotelDirectory(): Promise<DirectoryView> {
  try {
    const context = await resolveToroContext({ mode: "organization" });
    if (!canReadHotelDirectory(context)) return { state: "denied", links: [] };
    const client = await createServerSupabaseClient();
    const { data, error } = await client.schema("operations").from("knowledge_items")
      .select("org_id,property_id,knowledge_key,visibility,structured_content")
      .eq("org_id", context!.orgId!)
      .eq("property_id", DIRECTORY_SCOPE.propertyId)
      .eq("knowledge_key", DIRECTORY_SCOPE.key)
      .eq("visibility", "internal").maybeSingle();
    if (error) return { state: "unavailable", links: [] };
    const links = projectHotelLinks(context, data);
    return { state: links.length ? "ready" : "unavailable", links };
  } catch {
    return { state: "unavailable", links: [] };
  }
}
