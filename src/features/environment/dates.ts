import { localDay } from "./weather";
export type DateItem = { key: string; date: string; endDate: string; label: string; kind: "event" | "holiday" };
export type DatesView = { state: "ready" | "unavailable"; items: DateItem[]; truncated: boolean };
export type DateScope = { orgId: string; propertyId: string };
type Row = Record<string, unknown>;
function row(value: unknown): Row | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Row : null;
}
function isoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}
export function projectDates(events: unknown[], holidays: unknown[], scope: DateScope, now: number): DateItem[] {
  if (!Number.isFinite(now)) return [];
  const today = localDay(now);
  const through = localDay(now + 30 * 86_400_000);
  const items: DateItem[] = [];
  for (const input of events) {
    const e = row(input);
    if (!e || e.org_id !== scope.orgId || e.property_id !== scope.propertyId ||
      e.status !== "active" || e.verified_status !== "verified" ||
      e.publish_status !== "published" || e.public_visibility !== true ||
      e.requires_human_verification !== false || !isoDate(e.starts_on)) continue;
    const end = e.ends_on == null ? e.starts_on : e.ends_on;
    if (!isoDate(end) || end < e.starts_on || end < today || e.starts_on > through ||
      !isoDate(e.expires_at) || e.expires_at < today ||
      !isoDate(e.last_verified) || e.last_verified > today ||
      !isoDate(e.next_review) || e.next_review < today) continue;
    if (typeof e.event_key !== "string" || typeof e.name_es !== "string" || !e.name_es.trim()) continue;
    items.push({ key: "event:" + e.event_key, date: e.starts_on, endDate: end, label: e.name_es.slice(0, 160), kind: "event" });
  }
  for (const input of holidays) {
    const h = row(input), data = row(h?.data);
    // Never expose employee-linked private calendar rows. No payroll effects inferred.
    if (!h || h.org_id !== scope.orgId || h.employee_id != null || h.status !== "active" ||
      h.deleted_at != null || !data || !isoDate(data.date) || data.date < today || data.date > through ||
      typeof data.name !== "string" || !data.name.trim() || typeof h.id !== "string") continue;
    items.push({ key: "holiday:" + h.id, date: data.date, endDate: data.date,
      label: data.name.slice(0, 160), kind: "holiday" });
  }
  const groups = new Map<string, DateItem[]>();
  for (const item of items) groups.set(item.key, [...(groups.get(item.key) ?? []), item]);
  // Ambiguous duplicate source identities are omitted instead of merged by name.
  return [...groups.values()].filter(group => group.length === 1).map(group => group[0])
    .sort((a, b) => a.date.localeCompare(b.date) || a.key.localeCompare(b.key));
}
