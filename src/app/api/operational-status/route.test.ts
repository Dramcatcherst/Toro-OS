import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToroSession, getOperationalStatus } = vi.hoisted(() => ({
  getToroSession: vi.fn(),
  getOperationalStatus: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));
vi.mock("@/lib/server/operational-status", () => ({ getOperationalStatus }));

import { GET } from "./route";

const statusEnvelope = {
  version: "v1",
  generatedAt: "2026-09-17T22:31:00.000Z",
  currentHotelClaimsAllowed: false,
  hotel: {
    state: "unavailable",
    canClaimCurrent: false,
    sourceAsOf: null,
    ageMinutes: null,
    label: "Sin snapshot operativo verificable",
    metrics: null,
  },
  sources: { summary: { live: 1, configured: 2, blocked: 0, degraded: 0 }, records: [] },
  warnings: ["Kross operativo no verificado."],
};

describe("GET /api/operational-status", () => {
  beforeEach(() => {
    getToroSession.mockReset();
    getOperationalStatus.mockReset();
    getOperationalStatus.mockResolvedValue(statusEnvelope);
  });

  it("returns 401 without a TORO session", async () => {
    getToroSession.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    expect(getOperationalStatus).not.toHaveBeenCalled();
  });

  it("returns 403 to roles outside the executive/system status scope", async () => {
    getToroSession.mockResolvedValue({ userId: "u1", email: null, displayName: "Reception", role: "RECEPCION" });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(getOperationalStatus).not.toHaveBeenCalled();
  });

  it.each(["FOUNDER", "GERENCIA", "SYSTEMS"])("returns the governed envelope to %s", async (role) => {
    getToroSession.mockResolvedValue({ userId: "u1", email: null, displayName: role, role });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(statusEnvelope);
  });
});
