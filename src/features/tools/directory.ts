import type { ToroResolvedContext } from "@/features/context/types";

// Scoped reference implementation, not a portfolio-wide permission policy.
export const DIRECTORY_SCOPE = {
  orgId: "595801ce-2895-4d91-81ae-e8d1d5cc8593",
  propertyId: "7ac9e46e-3b56-44d6-96f9-9d0b63bc943b",
  key: "dreamcatcher_system_database_directory_v1",
} as const;

const tasks = [
  ["LINK-048", "🛎️ Ver reservas", "https://dreamcatcherhotel.krossbooking.com/admin/dashboard#/admin/tableau/planner?id=dreamcatcherhotel"],
  ["LINK-002", "💬 Cotizar estancia", "https://dreamcatcherhotel.kross.travel/"],
  ["LINK-178", "📨 Atender huéspedes", "https://app.wespeak.pro/chatv2"],
  ["LINK-086", "👥 Ver equipo", "https://dream-team-public.vercel.app/dreamteam/ingresar"],
  ["LINK-056", "📅 Ver agenda", "https://calendar.google.com/"],
  ["LINK-131", "📁 Buscar documentos", "https://www.dropbox.com/home/Dreamcatcher%20Hotel"],
] as const;

export type ToolLink = { id: string; label: string; url: string };

export function canReadHotelDirectory(context: ToroResolvedContext | null): boolean {
  return Boolean(context && context.mode === "organization" && !context.requiresContextChoice &&
    context.canUseOrganizationData && context.orgId === DIRECTORY_SCOPE.orgId &&
    context.membership?.orgId === context.orgId && context.membership.status === "active" &&
    context.membership.roles.some(role => ["ADMIN", "GERENCIA", "JEFE_DEPARTAMENTO", "AUDITOR"].includes(role)));
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
  return tasks.flatMap(([id, label, expectedUrl]) => {
    const matches = entries.filter((entry: unknown) => object(entry)?.id === id);
    if (matches.length !== 1 || object(matches[0])?.url !== expectedUrl) return [];
    return [{ id, label, url: expectedUrl }];
  });
}
