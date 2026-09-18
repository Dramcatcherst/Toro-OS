import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToroSession, getConnectorHealth } = vi.hoisted(() => ({
  getToroSession: vi.fn(),
  getConnectorHealth: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));
vi.mock("@/lib/server/connector-health", () => ({ getConnectorHealth }));

import { GET } from "./route";

const health = {
  records: [],
  summary: { live: 1, configured: 2, blocked: 0, degraded: 0 },
};

describe("GET /api/connector-health", () => {
  beforeEach(() => {
    getToroSession.mockReset();
    getConnectorHealth.mockReset();
    getConnectorHealth.mockResolvedValue(health);
  });

  it("returns 401 without a TORO session", async () => {
    getToroSession.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    expect(getConnectorHealth).not.toHaveBeenCalled();
  });

  it("returns 403 to non-system roles", async () => {
    getToroSession.mockResolvedValue({ userId: "u1", email: null, displayName: "Reception", role: "RECEPCION" });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(getConnectorHealth).not.toHaveBeenCalled();
  });

  it.each(["FOUNDER", "SYSTEMS"])("returns health to %s", async (role) => {
    getToroSession.mockResolvedValue({ userId: "u1", email: null, displayName: role, role });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ mode: "read_only", externalWrite: false, ...health });
  });
});
