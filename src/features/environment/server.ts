import "server-only";
import { emptyMoon, moonRequestDate, projectMoon, type MoonView } from "./moon";
import { readBoundedText } from "./transport";
import type { ToroResolvedContext } from "@/features/context/types";
import { canReadHotelDirectory, DIRECTORY_SCOPE } from "@/features/tools/directory";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { projectDates, type DatesView } from "./dates";
import { emptyWeather, IMN_URLS, localDay, parseImnRegional, type WeatherView } from "./weather";

export type DailyEnvironmentView = { weather: WeatherView; dates: DatesView; moon: MoonView };
export const emptyEnvironment = (): DailyEnvironmentView => ({
  moon: emptyMoon(), weather: emptyWeather(), dates: { state: "unavailable", items: [], truncated: false },
});
type DateRead = { events: unknown[]; holidays: unknown[]; truncated: boolean };
export type EnvironmentDependencies = {
  readDates: () => Promise<DateRead>;
  readWeather: (now: number) => Promise<WeatherView>;
  readMoon?: (now: number) => Promise<MoonView>;
  now: () => number;
};
export async function loadDailyEnvironmentWithDependencies(
  context: ToroResolvedContext | null, dependencies: EnvironmentDependencies,
): Promise<DailyEnvironmentView | null> {
  if (!canReadHotelDirectory(context)) return null;
  const now = dependencies.now();
  const [weather, dates, moon] = await Promise.allSettled([
    dependencies.readWeather(now), dependencies.readDates(),
    dependencies.readMoon ? dependencies.readMoon(now) : Promise.resolve(emptyMoon()),
  ]);
  return {
    moon: moon.status === "fulfilled" ? moon.value : emptyMoon(),
    weather: weather.status === "fulfilled" ? weather.value : emptyWeather(),
    dates: dates.status === "fulfilled" ? {
      state: "ready", truncated: dates.value.truncated,
      items: projectDates(dates.value.events, dates.value.holidays,
        { orgId: DIRECTORY_SCOPE.orgId, propertyId: DIRECTORY_SCOPE.propertyId }, now),
    } : { state: "unavailable", items: [], truncated: false },
  };
}
async function readImn(now: number): Promise<WeatherView> {
  // Shared six-second budget across fixed official URLs; no credentials or redirects.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  let last = emptyWeather();
  try {
    for (const source of IMN_URLS) {
      try {
        const response = await fetch(source, { signal: controller.signal, redirect: "error", next: { revalidate: 600 } });
        if (!response.ok || !response.headers.get("content-type")?.includes("text/html") || !response.body) continue;
        const html = await readBoundedText(response);
        if (html === null) continue;
        const view = parseImnRegional(html, source, now);
        if (view.state === "ready") return view;
        if (view.state === "stale") last = view;
      } catch { if (controller.signal.aborted) break; }
    }
    return last;
  } finally { clearTimeout(timer); }
}
async function readMoon(now: number): Promise<MoonView> {
  const requestedDate = moonRequestDate(now);
  const url = "https://aa.usno.navy.mil/api/moon/phases/date?date=" + requestedDate + "&nump=12";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "error",
      next: { revalidate: 3600 } });
    if (!response.headers.get("content-type")?.includes("json")) return emptyMoon();
    const text = await readBoundedText(response, 100_000);
    if (text === null) return emptyMoon();
    return projectMoon(JSON.parse(text), requestedDate, now);
  } catch { return emptyMoon(); }
  finally { clearTimeout(timer); }
}
export async function loadDailyEnvironment(context: ToroResolvedContext | null): Promise<DailyEnvironmentView | null> {
  // Auth guard runs before any DB client or external request; uses existing grants.
  if (!canReadHotelDirectory(context)) return null;
  const now = Date.now();
  return loadDailyEnvironmentWithDependencies(context, {
    now: () => now, readWeather: readImn, readMoon,
    readDates: async () => {
      const client = await createServerSupabaseClient(); // user session / RLS, never service role
      const today = localDay(now), through = localDay(now + 30 * 86_400_000);
      const [events, holidays] = await Promise.all([
        client.schema("catalog").from("local_events")
          .select("org_id,property_id,event_key,name_es,starts_on,ends_on,status,verified_status,publish_status,public_visibility,requires_human_verification,expires_at,last_verified,next_review")
          .eq("org_id", DIRECTORY_SCOPE.orgId).eq("property_id", DIRECTORY_SCOPE.propertyId)
          .eq("status", "active").eq("verified_status", "verified").eq("publish_status", "published")
          .eq("public_visibility", true).eq("requires_human_verification", false)
          .gte("expires_at", today).gte("next_review", today).lte("last_verified", today)
          .lte("starts_on", through).order("starts_on", { ascending: false }).limit(101),
        client.from("holidays").select("id,org_id,employee_id,data,status,deleted_at")
          .eq("org_id", DIRECTORY_SCOPE.orgId).eq("status", "active")
          .is("employee_id", null).is("deleted_at", null)
          .gte("data->>date", today).lte("data->>date", through)
          .order("data->>date", { ascending: true }).limit(101),
      ]);
      if (events.error || holidays.error) throw new Error("Environment dates unavailable");
      return { events: events.data ?? [], holidays: holidays.data ?? [],
        truncated: (events.data?.length ?? 0) >= 101 || (holidays.data?.length ?? 0) >= 101 };
    },
  });
}
