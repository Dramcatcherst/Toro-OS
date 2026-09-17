import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { readAirtableRecords, readVercelDeployments, readSupabaseHealth, readKrossPublicHealth } = vi.hoisted(() => ({
  readAirtableRecords: vi.fn(),
  readVercelDeployments: vi.fn(),
  readSupabaseHealth: vi.fn(),
  readKrossPublicHealth: vi.fn(),
}));

vi.mock("@/lib/server/read-only-connectors", () => ({
  readAirtableRecords,
  readVercelDeployments,
  readSupabaseHealth,
  readKrossPublicHealth,
}));

import { getConnectorHealth } from "./connector-health";

describe("getConnectorHealth", () => {
  beforeEach(() => {
    vi.stubEnv("AIRTABLE_BASE_ID", "app-explicit-health-base");
    readAirtableRecords.mockReset();
    readVercelDeployments.mockReset();
    readSupabaseHealth.mockReset();
    readKrossPublicHealth.mockReset();
    readAirtableRecords.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: { records: [{}] }, error: null });
    readVercelDeployments.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: { deployments: [{ name: "preview", state: "READY", url: "preview.example" }] }, error: null });
    readSupabaseHealth.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: { reachable: true }, error: null });
    readKrossPublicHealth.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: { reachable: true, finalUrl: "https://dreamcatcherhotel.kross.travel/" }, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("treats Supabase as a first-class live connector and timestamps active probes", async () => {
    const result = await getConnectorHealth();
    const supabase = result.records.find((record) => record.id === "supabase");

    expect(supabase).toMatchObject({
      configured: true,
      live: true,
      mode: "live_read",
      health: "reachable",
    });
    expect(supabase?.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.summary.live).toBeGreaterThanOrEqual(3);
  });

  it("does not call a static Ready/Active connector live when it has no runtime probe", async () => {
    const result = await getConnectorHealth();
    const codex = result.records.find((record) => record.id === "codex");

    expect(codex).toMatchObject({
      live: false,
      health: "configured_unverified",
    });
    expect(codex?.detail).toMatch(/sin prueba runtime/i);
  });

  it("marks configured Supabase as degraded when the live probe fails", async () => {
    readSupabaseHealth.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: null, error: "Supabase read failed with 503." });

    const result = await getConnectorHealth();
    const supabase = result.records.find((record) => record.id === "supabase");

    expect(supabase).toMatchObject({
      configured: true,
      live: false,
      mode: "read_only",
      health: "degraded",
    });
    expect(supabase?.detail).toMatch(/503/);
  });

  it("marks missing Supabase configuration as unconfigured rather than disconnected live", async () => {
    readSupabaseHealth.mockResolvedValue({ configured: false, externalWrite: false, mode: "read_only", data: null, error: "Supabase public config is not configured." });

    const result = await getConnectorHealth();
    const supabase = result.records.find((record) => record.id === "supabase");

    expect(supabase).toMatchObject({
      configured: false,
      live: false,
      health: "unconfigured",
    });
  });

  it("distinguishes a reachable Kross public booking engine from authenticated operational health", async () => {
    const result = await getConnectorHealth();
    const kross = result.records.find((record) => record.id === "kross");

    expect(kross).toMatchObject({
      configured: true,
      live: false,
      health: "configured_unverified",
    });
    expect(kross?.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(kross?.detail).toMatch(/motor público.*reachable/i);
    expect(kross?.detail).toMatch(/operación autenticada.*no verificada/i);
  });

  it("marks Kross degraded when even the public booking surface is unreachable", async () => {
    readKrossPublicHealth.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: null, error: "Kross public read failed with 503." });

    const result = await getConnectorHealth();
    const kross = result.records.find((record) => record.id === "kross");

    expect(kross).toMatchObject({
      configured: true,
      live: false,
      health: "degraded",
    });
    expect(kross?.detail).toMatch(/503/);
  });
});
