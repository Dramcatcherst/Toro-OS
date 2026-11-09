import type { HotelOperationsView, HotelTask } from "./hotel-operations";

export type HotelHomeSummary = {
  state: "ready" | "unavailable";
  day: string | null;
  queryAt: string | null;
  count: number | null;
  pastDue: number | null;
  dueToday: number | null;
  critical: number | null;
  unassigned: number | null;
  revalidation: number | null;
  withoutDate: number | null;
  next: HotelTask[];
  rowsRead: number | null;
  limitReached: boolean;
  latestUpdatedAt: string | null;
  futureUpdates: number;
};

const dayFormatter = new Intl.DateTimeFormat("en", {
  timeZone: "America/Costa_Rica", calendar: "gregory", numberingSystem: "latn",
  year: "numeric", month: "2-digit", day: "2-digit",
});
function clock(value: string | null): number {
  if (!value || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return Number.NaN;
  return Date.parse(value);
}
function reportingDay(time: number): string | null {
  if (!Number.isFinite(time)) return null;
  const parts = dayFormatter.formatToParts(time);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
const isCritical = (task: HotelTask) => ["critical", "p0"].includes(task.priority.trim().toLowerCase());

/** Presentation of the existing authorized, validated and bounded reader; never a hotel census. */
export function buildHotelHomeSummary(tasks: HotelOperationsView["tasks"], readAt: string | null): HotelHomeSummary {
  const queryTime = clock(readAt);
  if (tasks.state !== "ready") return {
    state: "unavailable", day: null, queryAt: Number.isFinite(queryTime) ? readAt : null, count: null, pastDue: null, dueToday: null, critical: null,
    unassigned: null, revalidation: null, withoutDate: null, next: [], rowsRead: null,
    limitReached: false, latestUpdatedAt: null, futureUpdates: 0,
  };
  const day = reportingDay(queryTime);
  let pastDue = 0, dueToday = 0, critical = 0, unassigned = 0, revalidation = 0, withoutDate = 0;
  let latestTime = Number.NEGATIVE_INFINITY, latestUpdatedAt: string | null = null, futureUpdates = 0;
  const ranked = tasks.items.map((task, index) => {
    const criticalTask = isCritical(task);
    const overdue = Boolean(day && task.dueDate && task.dueDate < day);
    const today = Boolean(day && task.dueDate === day);
    if (criticalTask) critical += 1;
    if (overdue) pastDue += 1;
    if (today) dueToday += 1;
    if (!task.owner?.trim()) unassigned += 1;
    if (task.needsRevalidation) revalidation += 1;
    if (!task.dueDate) withoutDate += 1;
    const changed = clock(task.updatedAt);
    if (Number.isFinite(queryTime) && Number.isFinite(changed)) {
      if (changed > queryTime) futureUpdates += 1;
      else if (changed > latestTime) { latestTime = changed; latestUpdatedAt = task.updatedAt; }
    }
    return { task, index, score: criticalTask ? 0 : overdue ? 1 : today ? 2 : 3 };
  });
  return {
    state: "ready", day, queryAt: Number.isFinite(queryTime) ? readAt : null, count: tasks.items.length, pastDue: day ? pastDue : null, dueToday: day ? dueToday : null,
    critical, unassigned, revalidation, withoutDate, rowsRead: tasks.rowsRead, limitReached: tasks.limitReached,
    latestUpdatedAt, futureUpdates,
    next: ranked.sort((a, b) => a.score - b.score || a.index - b.index).slice(0, 3).map(item => item.task),
  };
}
