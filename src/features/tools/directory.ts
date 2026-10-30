import type { ToroResolvedContext } from "@/features/context/types";

// Scoped reference implementation, not a portfolio-wide permission policy.
export const DIRECTORY_SCOPE = {
  orgId: "595801ce-2895-4d91-81ae-e8d1d5cc8593",
  propertyId: "7ac9e46e-3b56-44d6-96f9-9d0b63bc943b",
  key: "dreamcatcher_system_database_directory_v1",
} as const;

export const REVIEWED_HOTEL_LINKS = [
  // Provider keys from data/toro_tool_catalog_seed.json. Mapping a destination
  // does not create a grant or demonstrate that the connection is operational.
  ["LINK-048", "🛎️ Ver reservas", "https://dreamcatcherhotel.krossbooking.com/admin/dashboard#/admin/tableau/planner?id=dreamcatcherhotel", "kross"],
  ["LINK-002", "💬 Cotizar estancia", "https://dreamcatcherhotel.kross.travel/", "kross"],
  ["LINK-178", "📨 Atender huéspedes", "https://app.wespeak.pro/chatv2", "wespeak"],
  // Navigation only. No DreamTeam connector grant is inferred or created.
  ["LINK-086", "👥 Ver equipo", "https://dream-team-public.vercel.app/dreamteam/ingresar", null],
  ["LINK-056", "📅 Ver agenda", "https://calendar.google.com/", "google-calendar"],
  ["LINK-131", "📁 Buscar documentos", "https://www.dropbox.com/home/Dreamcatcher%20Hotel", "dropbox"],
  // Public profile only. Hotel Center/feed ownership remains a separate provider check.
  ["LINK-244", "🏨 Ver Google Hotels", "https://www.google.co.cr/travel/hotels/entity/CgsIpKWViNeV4ufCARAB", null],
] as const;

export type ToolLink = { id: string; label: string; url: string };
export type ReviewedCatalogueItem = ToolLink & { kind: "reviewed" };
export type DirectoryCatalogueItem = {
  kind: "directory";
  id: string;
  label: string;
  url: string | null;
  name: string;
  purpose: string;
  project: string;
  category: string;
  provider: string;
  state: string;
  lifecycle: string;
  priority: string;
  linkType: string;
  scope: string;
  homeEligible: boolean;
};
export type ToolCatalogueItem = ReviewedCatalogueItem | DirectoryCatalogueItem;
export type ToolCatalogueMode = "complete" | "reviewed" | "fallback";

const CATALOGUE_FIELDS = [
  "id", "name", "url", "purpose", "project", "category", "provider", "state", "lifecycle",
  "priority", "link_type", "scope", "home_eligible",
] as const;
const SENSITIVE_QUERY_KEY = /^(?:access[_-]?token|id_token|refresh_token|api[_-]?key|auth|authorization|code|credential|jwt|key|password|passwd|secret|sig|signature|signed|token|x-amz-(?:credential|signature|security-token)|x-goog-(?:credential|signature))$/i;
const CONTROL_CHAR = /[\u0000-\u001F\u007F]/;

// Owner-authorized read of the existing RLS directory, not external tool execution.
// allowedTools remains untouched; connector operations still require its grants.
export function canReadHotelDirectory(context: ToroResolvedContext | null): context is ToroResolvedContext {
  return Boolean(context && context.userId?.trim() && context.mode === "organization" && !context.requiresContextChoice &&
    context.allowedDataScopes?.includes("work_org") &&
    context.canUseOrganizationData && context.orgId === DIRECTORY_SCOPE.orgId &&
    context.membership?.orgId === context.orgId && context.membership.status === "active" &&
    context.membership.roles.some(role => ["ADMIN", "GERENCIA", "JEFE_DEPARTAMENTO", "AUDITOR"].includes(role)));
}

export function canReadCompleteHotelDirectory(context: ToroResolvedContext | null): context is ToroResolvedContext {
  return canReadHotelDirectory(context) && context.membership!.roles.some(role => role === "ADMIN" || role === "GERENCIA");
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

export function projectHotelLinks(context: ToroResolvedContext | null, input: unknown): ToolLink[] {
  if (!canReadHotelDirectory(context)) return [];
  const row = object(input);
  if (!row || row.org_id !== DIRECTORY_SCOPE.orgId || row.property_id !== DIRECTORY_SCOPE.propertyId ||
    row.knowledge_key !== DIRECTORY_SCOPE.key || row.visibility !== "internal") return [];
  const directory = object(object(row.structured_content)?.link_directory);
  if (!directory || !Array.isArray(directory.entries)) return [];
  return projectToolRows(context, directory.entries);
}

// The scoped security-invoker RPC returns only id/url; recheck destinations
// before rendering, including duplicate IDs and unreviewed redirects.
export function projectToolRows(context: ToroResolvedContext | null, input: unknown): ToolLink[] {
  if (!canReadHotelDirectory(context) || !Array.isArray(input)) return [];
  const entries: unknown[] = input;
  // Only explicitly reviewed destinations leave the server. Account metadata,
  // unrelated projects, raw evidence and the rest of the mixed registry stay out.
  return REVIEWED_HOTEL_LINKS.flatMap(([id, label, expectedUrl]) => {
    const matches = entries.filter((entry: unknown) => object(entry)?.id === id);
    if (matches.length !== 1 || object(matches[0])?.url !== expectedUrl) return [];
    return [{ id, label, url: expectedUrl }];
  });
}

function exactCatalogueRow(value: unknown): Record<string, unknown> | null {
  const row = object(value);
  if (!row) return null;
  const keys = Object.keys(row).sort();
  const expected = [...CATALOGUE_FIELDS].sort();
  return keys.length === expected.length && keys.every((key, index) => key === expected[index]) ? row : null;
}

function safeText(row: Record<string, unknown>, key: string, max: number): string | null {
  const value = row[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max && !CONTROL_CHAR.test(trimmed) ? trimmed : null;
}

function safeDestination(value: unknown): string | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 2048 || CONTROL_CHAR.test(value)) return undefined;
  if (value.startsWith("tel:")) return /^tel:\+?[0-9(). -]{5,30}$/.test(value) ? value : undefined;
  let parsed: URL;
  try { parsed = new URL(value); } catch { return undefined; }
  if (parsed.protocol === "mailto:") {
    try {
      if (CONTROL_CHAR.test(decodeURIComponent(value))) return undefined;
    } catch { return undefined; }
    return /^mailto:[^?\s@]+@[^?\s@]+(?:\?[^\s]*)?$/.test(value) &&
      ![...parsed.searchParams.keys()].some(key => SENSITIVE_QUERY_KEY.test(key)) ? value : undefined;
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) return undefined;
  const fragment = parsed.hash.slice(1);
  const firstQuestion = fragment.indexOf("?");
  const fragmentQuery = firstQuestion < 0 ? "" : fragment.slice(firstQuestion + 1);
  if ([...parsed.searchParams.keys(), ...new URLSearchParams(fragment).keys(),
    ...new URLSearchParams(fragmentQuery).keys()]
    .some(key => SENSITIVE_QUERY_KEY.test(key))) return undefined;
  return value;
}

/** Strict projection of this RPC response, not proof of a global source census. */
export function projectCompleteCatalogueRows(context: ToroResolvedContext | null, input: unknown): DirectoryCatalogueItem[] {
  if (!canReadCompleteHotelDirectory(context) || !Array.isArray(input) || input.length < 1 || input.length > 1000) return [];
  const items: DirectoryCatalogueItem[] = [];
  const ids = new Set<string>();
  for (const value of input) {
    const row = exactCatalogueRow(value);
    if (!row) return [];
    const id = safeText(row, "id", 32);
    const name = safeText(row, "name", 160);
    const purpose = safeText(row, "purpose", 512);
    const project = safeText(row, "project", 120);
    const category = safeText(row, "category", 80);
    const provider = safeText(row, "provider", 160);
    const state = safeText(row, "state", 80);
    const lifecycle = safeText(row, "lifecycle", 80);
    const priority = safeText(row, "priority", 80);
    const linkType = safeText(row, "link_type", 80);
    const scope = safeText(row, "scope", 160);
    const url = safeDestination(row.url);
    if (!id || !/^LINK-\d{3,}$/.test(id) || ids.has(id) || !name || !purpose || !project || !category ||
      !provider || !state || !lifecycle || !priority || !linkType || !scope || url === undefined || typeof row.home_eligible !== "boolean") return [];
    ids.add(id);
    items.push({ kind: "directory", id, label: name, url, name, purpose, project, category, provider,
      state, lifecycle, priority, linkType, scope, homeEligible: row.home_eligible });
  }
  return items;
}

export function catalogueItemsFromLinks(links: readonly ToolLink[]): ReviewedCatalogueItem[] {
  return links.map(link => ({ ...link, kind: "reviewed" as const }));
}
