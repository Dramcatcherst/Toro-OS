import "server-only";
import type { ToroResolvedContext } from "@/features/context/types";
import { canReadHotelDirectory, DIRECTORY_SCOPE } from "@/features/tools/directory";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { projectDates, type DatesView } from "./dates";
import { emptyWeather, IMN_URLS, localDay, parseImnRegional, type WeatherView } from "./weather";

export type DailyEnvironmentView = { weather: WeatherView; dates: DatesView };
export const emptyEnvironment = (): DailyEnvironmentView => ({
  weather: emptyWeather(), dates: { state: "unavailable", items: [], truncated: false },
});
type DateRead = { events: unknown[]; holidays: unknown[]; truncated: boolean };
export type EnvironmentDependencies = {
  readDates: () => Promise<DateRead>;
  readWeather: (now: number) => Promise<WeatherView>;
  now: () => number;
};
export async function loadDailyEnvironmentWithDependencies(
  context: ToroResolvedContext | null, dependencies: EnvironmentDependencies,
): Promise<DailyEnvironmentView | null> {
  if (!canReadHotelDirectory(context)) return null;
  const now = dependencies.now();
  const [weather, dates] = await Promise.allSettled([
    dependencies.readWeather(now), dependencies.readDates(),
  ]);
  return {
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
        const response = await fetch(source, { signal: controller.signal, redirect: "error", cache: "no-store" });
        if (!response.ok || !response.headers.get("content-type")?.includes("text/html") || !response.body) continue;
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let total = 0;
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            total += chunk.value.byteLength;
            if (total > 1_000_000) { await reader.cancel(); break; }
            chunks.push(chunk.value);
          }
        } finally { reader.releaseLock(); }
        if (total > 1_000_000) continue;
        const bytes = new Uint8Array(total);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        const view = parseImnRegional(new TextDecoder().decode(bytes), source, now);
        if (view.state === "ready") return view;
        if (view.state === "stale") last = view;
      } catch { if (controller.signal.aborted) break; }
    }
    return last;
  } finally { clearTimeout(timer); }
}
export async function loadDailyEnvironment(context: ToroResolvedContext | null): Promise<DailyEnvironmentView | null> {
  // Auth guard runs before any DB client or external request; uses existing grants.
  if (!canReadHotelDirectory(context)) return null;
  const now = Date.now();
  return loadDailyEnvironmentWithDependencies(context, {
    now: () => now, readWeather: readImn,
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
