import { z } from "zod";
import type { ToroResolvedContext } from "@/features/context/types";
import { canReadHotelDirectory, DIRECTORY_SCOPE } from "@/features/tools/directory";
import { resolvePortalTab } from "./portal-navigation-state";

/** Dreamcatcher's existing property, not a tenant-wide operational permission. */
export const HOTEL_OPERATIONS_SCOPE = DIRECTORY_SCOPE;
export const HOTEL_TASK_READ_LIMIT = 200;
export const HOTEL_TASK_DISPLAY_LIMIT = 12;
export const HOTEL_KROSS_HEALTH_LIMIT = 25;
export const HOTEL_OPERATIONS_URL = "/portal?tab=operations";
export const HOTEL_MANUAL_CONTINGENCY_URL = "https://dreamcatcher-control-hotel.maufertoro.chatgpt.site";

const text = z.string().trim().min(1).max(400);
const nullableText = z.string().trim().max(400).transform(value => value || null).nullable();
const timestamp = z.string().datetime({ offset: true });
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const time = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}).nullable();
const scoped = { org_id: z.literal(HOTEL_OPERATIONS_SCOPE.orgId), property_id: z.literal(HOTEL_OPERATIONS_SCOPE.propertyId) };
const taskRow = z.object({ ...scoped, id: z.string().uuid(), task_name: text,
  status: nullableText, priority: nullableText, area: nullableText, owner_name: nullableText,
  assignee_name: nullableText, due_date: date, source_system: nullableText,
  updated_at: timestamp, needs_revalidation: z.boolean() }).strict();
const healthRow = z.object({ ...scoped, id: z.string().uuid().nullable(), source_name: nullableText,
  snapshot_kind: nullableText, source_as_of: timestamp.nullable(), observed_at: timestamp.nullable(),
  live_required: z.boolean().nullable(), freshness_status: nullableText,
  safe_for_current_state: z.boolean().nullable() }).strict();

export type HotelTask = {
  canonicalRef: string; title: string; status: string; priority: string; area: string;
  owner: string | null; dueDate: string | null; sourceSystem: string; updatedAt: string;
  needsRevalidation: boolean;
};
export type HotelKrossHealth = {
  sourceName: string; snapshotKind: string; sourceAsOf: string | null; observedAt: string | null;
  freshness: "fresh" | "stale" | "unknown"; sourceAgeMinutes: number | null;
};
export type HotelSourceState = "ready" | "unavailable" | "transport_unavailable";
export type HotelOperationsView = {
  state: "ready" | "partial" | "unavailable" | "denied" | "disabled";
  readAt: string | null;
  tasks: { state: HotelSourceState; items: HotelTask[]; rowsRead: number | null; limitReached: boolean; total: null };
  kross: { state: HotelSourceState; items: HotelKrossHealth[]; limitReached: boolean; occupancy: null };
};
export function canReadHotelOperations(context: ToroResolvedContext | null) {
  return canReadHotelDirectory(context) && context.membership!.roles.some(role => role === "ADMIN" || role === "GERENCIA");
}
export const hotelOperationsRpcSchema = z.object({
  propertyId: z.literal(HOTEL_OPERATIONS_SCOPE.propertyId),
  tasks: z.object({ rows: z.array(taskRow).max(HOTEL_TASK_READ_LIMIT + 1), limit: z.literal(HOTEL_TASK_READ_LIMIT + 1) }).strict(),
  krossHealth: z.object({ rows: z.array(healthRow).max(HOTEL_KROSS_HEALTH_LIMIT + 1), limit: z.literal(HOTEL_KROSS_HEALTH_LIMIT + 1) }).strict(),
}).strict();
export function emptyHotelOperations(state: HotelOperationsView["state"], sourceState: HotelSourceState = "unavailable"): HotelOperationsView {
  return { state, readAt: null,
    tasks: { state: sourceState, items: [], rowsRead: null, limitReached: false, total: null },
    kross: { state: sourceState, items: [], limitReached: false, occupancy: null } };
}

const terminal = new Set(["completed", "cancelled", "canceled", "done", "closed"]);
function rank(priority: string | null) {
  const key = priority?.toLowerCase();
  return key === "critical" || key === "p0" ? 0 : key === "high" || key === "p1" || key === "urgent" ? 1 : 2;
}

/** Reject the whole affected source on malformed rows or mismatched scope. */
export function projectHotelTasks(input: unknown): HotelOperationsView["tasks"] {
  const parsed = z.array(taskRow).max(HOTEL_TASK_READ_LIMIT + 1).safeParse(input);
  if (!parsed.success || new Set(parsed.data.map(row => row.id)).size !== parsed.data.length) {
    return emptyHotelOperations("unavailable").tasks;
  }
  const batch = parsed.data.slice(0, HOTEL_TASK_READ_LIMIT);
  const eligible = batch.filter(row => !terminal.has(row.status?.toLowerCase() ?? ""));
  eligible.sort((a, b) => rank(a.priority) - rank(b.priority) ||
    (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999") || b.updated_at.localeCompare(a.updated_at) || a.id.localeCompare(b.id));
  return { state: "ready", rowsRead: batch.length, limitReached: parsed.data.length > HOTEL_TASK_READ_LIMIT,
    total: null, items: eligible.map(row => ({
      canonicalRef: row.id, title: row.task_name, status: row.status ?? "unknown", priority: row.priority ?? "unknown",
      area: row.area ?? "Área por verificar", owner: row.assignee_name ?? row.owner_name,
      dueDate: row.due_date, sourceSystem: row.source_system ?? "TORO", updatedAt: row.updated_at,
      needsRevalidation: row.needs_revalidation,
    })) };
}

export function projectHotelKrossHealth(input: unknown, readAt: string): HotelOperationsView["kross"] {
  const parsed = z.array(healthRow).max(HOTEL_KROSS_HEALTH_LIMIT + 1).safeParse(input);
  const now = Date.parse(readAt);
  if (!parsed.success || !Number.isFinite(now)) return emptyHotelOperations("unavailable").kross;
  return { state: "ready", occupancy: null, limitReached: parsed.data.length > HOTEL_KROSS_HEALTH_LIMIT,
    items: parsed.data.slice(0, HOTEL_KROSS_HEALTH_LIMIT).map(row => {
      const sourceTime = row.source_as_of ? Date.parse(row.source_as_of) : Number.NaN;
      const valid = Number.isFinite(sourceTime) && sourceTime <= now;
      const age = valid ? Math.floor((now - sourceTime) / 60000) : null;
      const freshness = age === null ? "unknown" : now - sourceTime > 60 * 60000 ? "stale"
        : row.freshness_status === "fresh" && row.safe_for_current_state === true ? "fresh" : "unknown";
      return { sourceName: row.source_name ?? "Fuente sin identificar", snapshotKind: row.snapshot_kind ?? "Tipo por verificar",
        sourceAsOf: row.source_as_of, observedAt: row.observed_at, freshness, sourceAgeMinutes: age };
    }) };
}

export function initialPortalTab(value: string | string[] | undefined, hotelAllowed: boolean) {
  return resolvePortalTab(value, hotelAllowed);
}
