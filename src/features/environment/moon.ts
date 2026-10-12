import { localDay } from "./weather";
export const MOON_SOURCE = "https://aa.usno.navy.mil/data/MoonPhases";
const names: Record<string, string> = {
  "New Moon": "Luna nueva", "First Quarter": "Cuarto creciente",
  "Full Moon": "Luna llena", "Last Quarter": "Cuarto menguante",
};
export type MoonEvent = { label: string; at: string };
export type MoonView = { state: "ready" | "unavailable"; previous: MoonEvent | null; next: MoonEvent[]; sourceUrl: string };
export const emptyMoon = (): MoonView => ({ state: "unavailable", previous: null, next: [], sourceUrl: MOON_SOURCE });
export function moonRequestDate(now: number): string { return localDay(now - 35 * 86_400_000); }
const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
// USNO's primary phases are global instants in UT. This does not supply
// local moonrise/moonset, illumination or sea conditions.
export function projectMoon(input: unknown, requestedDate: string, now: number): MoonView {
  const data = object(input);
  if (!data || !Number.isFinite(now) || requestedDate !== moonRequestDate(now) ||
    data.error != null || data.numphases !== 12 || !Array.isArray(data.phasedata) || data.phasedata.length !== 12)
    return emptyMoon();
  const header = [data.year, data.month, data.day].map(Number);
  if (header.some(n => !Number.isInteger(n)) ||
    header[0] + "-" + String(header[1]).padStart(2, "0") + "-" + String(header[2]).padStart(2, "0") !== requestedDate)
    return emptyMoon();
  const events: MoonEvent[] = [];
  for (const value of data.phasedata) {
    const row = object(value);
    if (!row || typeof row.phase !== "string" || !names[row.phase] || typeof row.time !== "string")
      return emptyMoon();
    const time = /^(\d{1,2}):(\d{2})$/.exec(row.time);
    const [year, month, day] = [row.year, row.month, row.day].map(Number);
    if (!time || ![year, month, day].every(Number.isInteger) || year < 1700 || year > 2100 ||
      month < 1 || month > 12 || day < 1 || day > 31 || +time[1] > 23 || +time[2] > 59) return emptyMoon();
    const date = new Date(Date.UTC(year, month - 1, day, +time[1], +time[2]));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day)
      return emptyMoon();
    events.push({ label: names[row.phase], at: date.toISOString() });
  }
  if (new Set(events.map(e => e.at)).size !== events.length) return emptyMoon();
  events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const before = events.filter(e => Date.parse(e.at) <= now);
  const next = events.filter(e => Date.parse(e.at) > now).slice(0, 4);
  if (!before.length || next.length < 4) return emptyMoon();
  return { state: "ready", previous: before[before.length - 1], next, sourceUrl: MOON_SOURCE };
}
