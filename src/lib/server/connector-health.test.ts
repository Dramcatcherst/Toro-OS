import { beforeEach, describe, expect, it, vi } from "vitest";

const { readAirtableRecords, readVercelDeployments, readSupabaseHealth } = vi.hoisted(() => ({
  readAirtableRecords: vi.fn(),
  readVercelDeployments: vi.fn(),
  readSupabaseHealth: vi.fn(),
}));

vi.mock("@/lib/server/read-only-connectors", () => ({
  readAirtableRecords,
  readVercelDeployments,
  readSupabaseHealth,
}));

import { getConnectorHealth } from "./connector-health";

describe("getConnectorHealth", () => {
  beforeEach(() => {
    readAirtableRecords.mockReset();
    readVercelDeployments.mockReset();
    readSupabaseHealth.mockReset();
    readAirtableRecords.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: { records: [{}] }, error: null });
    readVercelDeployments.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: { deployments: [{ name: "preview", state: "READY", url: "preview.example" }] }, error: null });
    readSupabaseHealth.mockResolvedValue({ configured: true, externalWrite: false, mode: "read_only", data: { reachable: true }, error: null });
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
});
