import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GET as airtableGet } from "./airtable/route";
import { GET as vercelGet } from "./vercel/route";

beforeEach(() => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", "true");
  vi.stubEnv("AIRTABLE_TOKEN", "synthetic-token");
  vi.stubEnv("VERCEL_TOKEN", "synthetic-token");
  vi.stubEnv("AIRTABLE_BASE_ID", undefined);
  vi.stubEnv("VERCEL_PROJECT_ID", undefined);
  vi.stubGlobal("fetch", vi.fn(async (url) => Response.json(
    String(url).includes("airtable") ? { records: [] } : { deployments: [] },
  )));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it("Airtable configuration follows the adapter when the canonical base is used", async () => {
  const response = await airtableGet(new Request("https://synthetic.invalid/api/connectors/airtable?tableId=tblFixture"));
  const payload = await response.json();
  expect(payload.liveRead.configured).toBe(true);
  expect(payload.configured).toBe(true);
});

it("Vercel configuration follows the adapter when the canonical project is used", async () => {
  const payload = await (await vercelGet()).json();
  expect(payload.liveRead.configured).toBe(true);
  expect(payload.configured).toBe(true);
});

it("disabled metadata-only reads do not claim an operationally configured adapter", async () => {
  vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", "false");
  vi.stubEnv("AIRTABLE_BASE_ID", "appFixture");
  vi.stubEnv("VERCEL_PROJECT_ID", "prj_fixture");
  const airtable = await (await airtableGet(new Request("https://synthetic.invalid/api/connectors/airtable"))).json();
  const vercel = await (await vercelGet()).json();
  expect(airtable.configured).toBe(false);
  expect(vercel.configured).toBe(false);
  expect(fetch).not.toHaveBeenCalled();
});

it("does not allow provider read responses to be cached as public data", async () => {
  const responses = [await vercelGet(), await airtableGet(new Request("https://synthetic.invalid/api/connectors/airtable?tableId=tblFixture"))];
  for (const response of responses) expect(response.headers.get("cache-control")).toMatch(/private.*no-store/);
});
