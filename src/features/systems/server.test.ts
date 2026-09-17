import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToroSession, getConnectorHealth, redirect } = vi.hoisted(() => ({
  getToroSession: vi.fn(),
  getConnectorHealth: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));
vi.mock("@/lib/server/connector-health", () => ({ getConnectorHealth }));
vi.mock("next/navigation", () => ({ redirect }));

import { loadSystemsHealth } from "./server";

const founder = {
  userId: "00000000-0000-0000-0000-000000000001",
  role: "FOUNDER",
  navRole: "FOUNDER",
  displayName: "Founder",
  memberships: [],
};

const health = {
  records: [
    {
      id: "supabase",
      name: "Supabase",
      live: true,
      configured: true,
      mode: "live_read",
      health: "reachable",
      checkedAt: "2026-09-17T22:09:00.000Z",
      detail: "Supabase respondió a una prueba read-only.",
      source: "runtime",
      status: "Active",
      risk: "High",
      confidence: 96,
      approval: "Human review",
      nextAction: "Observe",
    },
  ],
  summary: { live: 1, configured: 1, blocked: 0, degraded: 0 },
};

describe("loadSystemsHealth", () => {
  beforeEach(() => {
    getToroSession.mockReset();
    getConnectorHealth.mockReset();
    redirect.mockClear();
    getToroSession.mockResolvedValue(founder);
    getConnectorHealth.mockResolvedValue(health);
  });

  it("requires an authenticated Founder or Systems role", async () => {
    getToroSession.mockResolvedValue(null);
    await expect(loadSystemsHealth()).rejects.toThrow("redirect:/login?next=/toro/sistemas");
    expect(getConnectorHealth).not.toHaveBeenCalled();

    getToroSession.mockResolvedValue({ ...founder, role: "RECEPCION", navRole: "RECEPCION" });
    await expect(loadSystemsHealth()).rejects.toThrow("redirect:/toro");
    expect(getConnectorHealth).not.toHaveBeenCalled();
  });

  it("allows Founder and Systems to read the runtime health snapshot", async () => {
    await expect(loadSystemsHealth()).resolves.toEqual(health);

    getToroSession.mockResolvedValue({ ...founder, role: "SYSTEMS", navRole: "SYSTEMS" });
    await expect(loadSystemsHealth()).resolves.toEqual(health);
    expect(getConnectorHealth).toHaveBeenCalledTimes(2);
  });
});
