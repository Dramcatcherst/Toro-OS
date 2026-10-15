import "server-only";
import { resolveToroContext } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  canReadCompleteHotelDirectory, canReadHotelDirectory, catalogueItemsFromLinks,
  projectCompleteCatalogueRows, projectToolRows,
  type ToolCatalogueItem, type ToolCatalogueMode, type ToolLink,
} from "./directory";
import { portalNavigation } from "./portal-navigation";

export type DirectoryView = {
  state: "ready" | "denied" | "unavailable";
  links: ToolLink[];
  catalogueItems: ToolCatalogueItem[];
  catalogueMode: ToolCatalogueMode;
  account?: string;
  reason?: "connection_pending";
  navigationAuthorized?: true;
};

const connectionPending = (error: { code?: string } | null | undefined) =>
  error && ["PGRST106", "PGRST202"].includes(error.code ?? "") ? { reason: "connection_pending" as const } : {};

export async function loadHotelDirectory({ includeApprovedNavigation = false, includeCompleteCatalogue = false }: {
  includeApprovedNavigation?: boolean;
  includeCompleteCatalogue?: boolean;
} = {}): Promise<DirectoryView> {
  try {
    const context = await resolveToroContext({ mode: "organization" });
    if (!canReadHotelDirectory(context)) return { state: "denied", links: [], catalogueItems: [], catalogueMode: "reviewed" };
    const account = context!.email ?? undefined;
    const navigation = includeApprovedNavigation ? portalNavigation(context) : [];
    const client = await createServerSupabaseClient();
    const navigationState = includeApprovedNavigation ? { navigationAuthorized: true as const } : {};

    if (includeCompleteCatalogue && canReadCompleteHotelDirectory(context)) {
      const full = await client.rpc("dreamcatcher_tool_catalog_v1");
      const catalogueItems = full.error ? [] : projectCompleteCatalogueRows(context, full.data);
      const operational = full.error ? [] : projectToolRows(context, full.data);
      if (catalogueItems.length === 244) {
        return { state: "ready", links: [...operational, ...navigation], catalogueItems, catalogueMode: "complete", account, ...navigationState };
      }

      // Preserve the existing reviewed surface while the versioned catalogue RPC
      // is unavailable or fails strict validation. Full rows are never cached.
      const reviewed = await client.rpc("dreamcatcher_tool_links_v1");
      if (reviewed.error) return { state: "unavailable", links: navigation,
        catalogueItems: catalogueItemsFromLinks(navigation), catalogueMode: "fallback", account,
        ...navigationState, ...connectionPending(reviewed.error ?? full.error) };
      const links = projectToolRows(context, reviewed.data);
      const fallbackLinks = [...links, ...navigation];
      return { state: links.length ? "ready" : "unavailable", links: fallbackLinks,
        catalogueItems: catalogueItemsFromLinks(fallbackLinks), catalogueMode: "fallback", account, ...navigationState };
    }

    const { data, error } = await client.rpc("dreamcatcher_tool_links_v1");
    if (error) return { state: "unavailable", links: navigation, catalogueItems: catalogueItemsFromLinks(navigation),
      catalogueMode: "fallback", account, ...navigationState, ...connectionPending(error) };
    const links = projectToolRows(context, data);
    const reviewedLinks = [...links, ...navigation];
    return { state: links.length ? "ready" : "unavailable", links: reviewedLinks,
      catalogueItems: catalogueItemsFromLinks(reviewedLinks), catalogueMode: "reviewed", account, ...navigationState };
  } catch {
    return { state: "unavailable", links: [], catalogueItems: [], catalogueMode: "fallback" };
  }
}
