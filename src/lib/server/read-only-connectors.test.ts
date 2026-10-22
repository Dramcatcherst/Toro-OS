import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readAirtableRecords, readVercelDeployments } from "./read-only-connectors";
import type { ReadOnlyConnectorResult } from "./read-only-connectors";
import { getConnectorHealth } from "./connector-health";

const fetchMock = vi.fn<typeof fetch>();
const readers = [
  { name: "Airtable", read: () => readAirtableRecords({ baseId: "appFixture", tableId: "tblFixture" }), data: { records: [] } },
  { name: "Vercel", read: () => readVercelDeployments({ projectId: "prj_fixture" }), data: { deployments: [] } },
];

beforeEach(() => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", "true");
  vi.stubEnv("AIRTABLE_TOKEN", "synthetic-airtable-token");
  vi.stubEnv("VERCEL_TOKEN", "synthetic-vercel-token");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(async () => {
  if (vi.isFakeTimers()) {
    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();
  }
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe.each(readers)("$name bounded read", ({ read, data }) => {
  it("cancels an unresponsive provider and returns a bounded safe result", async () => {
    vi.useFakeTimers();
    const probe: { signal?: AbortSignal | null; result?: ReadOnlyConnectorResult<unknown> } = {};
    fetchMock.mockImplementation((_url, options) => new Promise((resolve, reject) => {
      probe.signal = options?.signal;
      const delayed = setTimeout(() => resolve(Response.json(data)), 30_000);
      probe.signal?.addEventListener("abort", () => {
        clearTimeout(delayed);
        reject(new DOMException("synthetic cancellation", "AbortError"));
      }, { once: true });
    }));
    void read().then((result) => { probe.result = result; });
    await vi.advanceTimersByTimeAsync(8_001);
    expect(probe.result).toBeDefined();
    expect(probe.signal?.aborted).toBe(true);
    expect(probe.result).toMatchObject({ configured: true, data: null, externalWrite: false });
    expect(probe.result?.error).toMatch(/timed out/i);
  });

  it("keeps the deadline through response-body consumption", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async (_url, options) => {
      const response = Response.json(data);
      response.json = () => new Promise((resolve, reject) => {
        const delayed = setTimeout(() => resolve(data), 30_000);
        options?.signal?.addEventListener("abort", () => {
          clearTimeout(delayed);
          reject(new DOMException("body cancelled", "AbortError"));
        }, { once: true });
      });
      return response;
    });
    const probe: { result?: ReadOnlyConnectorResult<unknown> } = {};
    void read().then((result) => { probe.result = result; });
    await vi.advanceTimersByTimeAsync(8_001);
    expect(probe.result).toBeDefined();
    expect(probe.result?.error).toMatch(/timed out/i);
  });

  it("contains network failures without echoing their credential-bearing messages", async () => {
    fetchMock.mockRejectedValue(new Error("Authorization: Bearer synthetic-private-detail"));
    const result = await read();
    expect(result).toMatchObject({ configured: true, data: null, externalWrite: false });
    expect(result.error).toMatch(/failed/i);
    expect(JSON.stringify(result)).not.toContain("synthetic-private-detail");
  });

  it("reports invalid provider JSON as unavailable data", async () => {
    fetchMock.mockResolvedValue(new Response("{invalid-json", { status: 200 }));
    expect(await read()).toMatchObject({ configured: true, data: null, error: expect.any(String) });
  });

  it.each([null, [], { records: "invalid", deployments: "invalid" }])("does not certify an unexpected response shape", async (value) => {
    fetchMock.mockResolvedValue(Response.json(value));
    expect(await read()).toMatchObject({ configured: true, data: null, error: expect.any(String) });
  });

  it("preserves a valid empty provider response", async () => {
    fetchMock.mockResolvedValue(Response.json(data));
    expect(await read()).toMatchObject({ configured: true, data, error: null });
  });
});

it("recognizes reachable empty endpoints without inventing business records", async () => {
  fetchMock.mockImplementation(async (url) => Response.json(
    String(url).includes("airtable") ? { records: [] } : { deployments: [] },
  ));
  const result = await getConnectorHealth();
  for (const id of ["airtable", "vercel"]) {
    expect(result.records.find((record) => record.id === id)).toMatchObject({ configured: true, live: true, mode: "live_read" });
  }
});

it.each([NaN, Infinity, 0, -1, 1.5, 101])("R50-09 rejects invalid Airtable pageSize %s before provider I/O", async pageSize => {
  vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", "true"); vi.stubEnv("AIRTABLE_TOKEN", "synthetic-token");
  const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
  const result = await readAirtableRecords({ baseId: "base", tableId: "table", pageSize });
  expect(result.error).toContain("pageSize"); expect(fetchMock).not.toHaveBeenCalled();
});
