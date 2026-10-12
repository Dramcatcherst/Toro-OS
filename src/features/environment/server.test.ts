import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: vi.fn() }));
import { loadDailyEnvironmentWithDependencies, emptyEnvironment } from "./server";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
it.each(["personal", "other-org", "inactive"])("does not read sources for %s", async reason => {
  const context = authorizedContext();
  if (reason === "personal") context.mode = "personal";
  if (reason === "other-org") context.orgId = "other";
  if (reason === "inactive") context.membership!.status = "suspended";
  const readDates = vi.fn(), readWeather = vi.fn(), now = vi.fn();
  expect(await loadDailyEnvironmentWithDependencies(context, { readDates, readWeather, now })).toBeNull();
  expect(readDates).not.toHaveBeenCalled();
  expect(readWeather).not.toHaveBeenCalled();
  expect(now).not.toHaveBeenCalled();
});
it("keeps an empty successful dates read distinct from failed weather", async () => {
  const result = await loadDailyEnvironmentWithDependencies(authorizedContext(), {
    now: () => Date.parse("2026-10-12T06:30:00Z"),
    readWeather: async () => { throw new Error("unavailable"); },
    readDates: async () => ({ events: [], holidays: [], truncated: false }),
  });
  expect(result?.weather.state).toBe("unavailable");
  expect(result?.dates).toEqual({ state: "ready", items: [], truncated: false });
});
it("does not turn a source outage into 'no events'", async () => {
  const result = await loadDailyEnvironmentWithDependencies(authorizedContext(), {
    now: () => Date.parse("2026-10-12T06:30:00Z"),
    readWeather: async () => emptyEnvironment().weather,
    readDates: async () => { throw new Error("denied"); },
  });
  expect(result?.dates.state).toBe("unavailable");
});

beforeEach(() => vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal"));
afterEach(() => vi.unstubAllEnvs());
it("rejects operational source reads in public demo even with supplied hotel context", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "public_demo");
  const readDates = vi.fn(), readWeather = vi.fn(), now = vi.fn();
  expect(await loadDailyEnvironmentWithDependencies(authorizedContext(), { readDates, readWeather, now })).toBeNull();
  expect(readDates).not.toHaveBeenCalled();
  expect(readWeather).not.toHaveBeenCalled();
});
