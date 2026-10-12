export type TidePrediction = {
  orgId: string;
  propertyId: string;
  locationId: string;
  stationName: string;
  localReferenceVerified: boolean;
  timezone: string;
  issuedAt: string;
  validUntil: string;
  sourceUrl: string;
  datum: string;
  extremes: { at: string; kind: "high" | "low"; heightMeters: number }[];
};
export type TideView = {
  state: "unavailable" | "invalid" | "stale" | "ready";
  extremes: TidePrediction["extremes"];
  next: TidePrediction["extremes"][number] | null;
  station: string | null;
  sourceUrl: string | null;
};
export type EnvironmentScope = { orgId: string; propertyId: string; locationId: string };
const empty = (state: TideView["state"]): TideView =>
  ({ state, extremes: [], next: null, station: null, sourceUrl: null });
const instant = (value: string) =>
  /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;

// Provider adapters must supply normalized, scoped predictions. No nearest-station
// assumption, phase-to-tide estimate, stale recommendation or raw payload exposure.
export function projectTides(input: TidePrediction | null, scope: EnvironmentScope, now: number): TideView {
  if (!input) return empty("unavailable");
  const issued = instant(input.issuedAt);
  const until = instant(input.validUntil);
  let url: URL;
  try { url = new URL(input.sourceUrl); } catch { return empty("invalid"); }
  if (!Number.isFinite(now) || input.orgId !== scope.orgId ||
    input.propertyId !== scope.propertyId || input.locationId !== scope.locationId ||
    !input.localReferenceVerified || input.timezone !== "America/Costa_Rica" ||
    !input.stationName.trim() || !input.datum.trim() ||
    url.protocol !== "https:" || url.username || url.password ||
    !["miocimar.ucr.ac.cr", "www.miocimar.ucr.ac.cr", "unacostasegura.una.ac.cr"].includes(url.hostname) ||
    !Number.isFinite(issued) || !Number.isFinite(until) || issued > now || until <= issued ||
    !Array.isArray(input.extremes) ||
    input.extremes.some(e => !Number.isFinite(instant(e.at)) ||
      !["high", "low"].includes(e.kind) || !Number.isFinite(e.heightMeters) ||
      instant(e.at) < issued || instant(e.at) >= until)) return empty("invalid");
  if (until <= now) return empty("stale");
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: input.timezone,
    year: "numeric", month: "2-digit", day: "2-digit" });
  const unique = [...new Map(input.extremes.map(e => [e.at + "|" + e.kind, e])).values()];
  // Conflicting duplicate values are not silently resolved.
  if (unique.some(e => input.extremes.some(other =>
    other.at === e.at && other.kind === e.kind && other.heightMeters !== e.heightMeters)))
    return empty("invalid");
  const sorted = unique.sort((a, b) => instant(a.at) - instant(b.at));
  return {
    state: "ready",
    extremes: sorted.filter(e => date.format(new Date(e.at)) === date.format(new Date(now))),
    next: sorted.find(e => instant(e.at) > now) ?? null,
    station: input.stationName, sourceUrl: url.toString(),
  };
}
