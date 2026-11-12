import "server-only";
import { resolveToroContext, resolveToroContextWithSupabase } from "@/features/context/resolver";
import type { ToroResolvedContext } from "@/features/context/types";
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

const denied = (): DirectoryView => ({ state: "denied", links: [], catalogueItems: [], catalogueMode: "reviewed" });
const unavailable = (): DirectoryView => ({ state: "unavailable", links: [], catalogueItems: [], catalogueMode: "fallback" });
const connectionPending = (error: { code?: string } | null | undefined) =>
  error && ["PGRST106", "PGRST202"].includes(error.code ?? "") ? { reason: "connection_pending" as const } : {};

export async function loadHotelDirectory({ includeApprovedNavigation = false, includeCompleteCatalogue = false, expectedContext }: {
  includeApprovedNavigation?: boolean;
  includeCompleteCatalogue?: boolean;
  expectedContext?: Pick<ToroResolvedContext, "userId" | "orgId">;
} = {}): Promise<DirectoryView> {
  try {
    // A page which already resolved its actor must never combine another actor's
    // directory with its existing menu. The preference cookie is not authority.
    const expected = expectedContext ? { userId: expectedContext.userId, orgId: expectedContext.orgId } : null;
    const context = await resolveToroContext({ mode: "organization", ...(expected ? { orgId: expected.orgId } : {}) });
    if (!canReadHotelDirectory(context) || (expected &&
      (context.userId !== expected.userId || context.orgId !== expected.orgId))) return denied();
    const requested = { userId: context.userId, orgId: context.orgId! };
    const account = context.email ?? undefined;
    const navigation = includeApprovedNavigation ? portalNavigation(context) : [];
    const client = await createServerSupabaseClient();
    const navigationState = includeApprovedNavigation ? { navigationAuthorized: true as const } : {};
    // Both returned errors and thrown transport errors use the same fallback.
    const read = async (name: string) => {
      try { return await client.rpc(name); }
      catch { return { data: null, error: { code: "transport_unavailable" } }; }
    };
    const finish = async (view: DirectoryView, complete = false): Promise<DirectoryView> => {
      // Recheck on this same session client after every awaited source/fallback.
      // Even static navigation is withheld if the actor or authorization changed.
      const current = await resolveToroContextWithSupabase(client, { mode: "organization", orgId: requested.orgId });
      if (!canReadHotelDirectory(current) || current.userId !== requested.userId || current.orgId !== requested.orgId ||
        (complete && !canReadCompleteHotelDirectory(current))) return denied();
      return view;
    };

    if (includeCompleteCatalogue && canReadCompleteHotelDirectory(context)) {
      const full = await read("dreamcatcher_tool_catalog_v1");
      const catalogueItems = full.error ? [] : projectCompleteCatalogueRows(context, full.data);
      const operational = full.error ? [] : projectToolRows(context, full.data);
      if (catalogueItems.length === 244) {
        return await finish({ state: "ready", links: [...operational, ...navigation],
          catalogueItems: [...catalogueItems, ...catalogueItemsFromLinks(navigation)],
          catalogueMode: "complete", account, ...navigationState }, true);
      }
      const reviewed = await read("dreamcatcher_tool_links_v1");
      if (reviewed.error) return await finish({ state: "unavailable", links: navigation,
        catalogueItems: catalogueItemsFromLinks(navigation), catalogueMode: "fallback", account,
        ...navigationState, ...connectionPending(reviewed.error ?? full.error) });
      const links = projectToolRows(context, reviewed.data);
      const fallbackLinks = [...links, ...navigation];
      return await finish({ state: links.length ? "ready" : "unavailable", links: fallbackLinks,
        catalogueItems: catalogueItemsFromLinks(fallbackLinks), catalogueMode: "fallback", account, ...navigationState });
    }

    const { data, error } = await read("dreamcatcher_tool_links_v1");
    if (error) return await finish({ state: "unavailable", links: navigation, catalogueItems: catalogueItemsFromLinks(navigation),
      catalogueMode: "fallback", account, ...navigationState, ...connectionPending(error) });
    const links = projectToolRows(context, data);
    const reviewedLinks = [...links, ...navigation];
    return await finish({ state: links.length ? "ready" : "unavailable", links: reviewedLinks,
      catalogueItems: catalogueItemsFromLinks(reviewedLinks), catalogueMode: "reviewed", account, ...navigationState });
  } catch {
    // Failure to verify the session is different from a directory source outage.
    return unavailable();
  }
}
