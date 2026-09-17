import { beforeEach, describe, expect, it, vi } from "vitest";

const { authorizeOpenClawStatus, getOperationalStatus } = vi.hoisted(() => ({
  authorizeOpenClawStatus: vi.fn(),
  getOperationalStatus: vi.fn(),
}));

vi.mock("@/lib/server/machine-auth", () => ({ authorizeOpenClawStatus }));
vi.mock("@/lib/server/operational-status", () => ({ getOperationalStatus }));

import { GET } from "./route";

const status = {
  version: "v1",
  generatedAt: "2026-09-17T22:50:00.000Z",
  currentHotelClaimsAllowed: false,
  hotel: {
    state: "unavailable",
    canClaimCurrent: false,
    sourceAsOf: null,
    ageMinutes: null,
    label: "Sin snapshot operativo verificable",
    metrics: null,
  },
  sources: {
    summary: { live: 2, configured: 5, blocked: 1, degraded: 0 },
    records: [
      {
        id: "vercel",
        name: "Vercel",
        health: "reachable",
        checkedAt: "2026-09-17T22:49:00.000Z",
        live: true,
        detail: "internal deployment detail that machine route does not need",
      },
    ],
  },
  warnings: ["Kross operativo no verificado."],
  chatSummary: "Estado del hotel — operación autenticada no verificada.",
};

describe("GET /api/service/operational-status", () => {
  beforeEach(() => {
    authorizeOpenClawStatus.mockReset();
    getOperationalStatus.mockReset();
    authorizeOpenClawStatus.mockReturnValue({
      ok: true,
      principal: "openclaw-status-reader",
    });
    getOperationalStatus.mockResolvedValue(status);
  });

  it("fails before loading business status when machine auth fails", async () => {
    authorizeOpenClawStatus.mockReturnValue({
      ok: false,
      response: new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 }),
    });

    const response = await GET(new Request("http://localhost/api/service/operational-status"));
    expect(response.status).toBe(401);
    expect(getOperationalStatus).not.toHaveBeenCalled();
  });

  it("returns only the scoped PII-free status projection", async () => {
    const response = await GET(new Request("http://localhost/api/service/operational-status"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toMatch(/no-store/i);

    const body = await response.json();
    expect(body).toEqual({
      version: "v1",
      generatedAt: status.generatedAt,
      currentHotelClaimsAllowed: false,
      hotel: status.hotel,
      sourceSummary: status.sources.summary,
      warnings: status.warnings,
      chatSummary: status.chatSummary,
    });
    expect(JSON.stringify(body)).not.toContain("internal deployment detail");
    expect(JSON.stringify(body)).not.toMatch(/guest|email|phone|token|password/i);
  });
});
