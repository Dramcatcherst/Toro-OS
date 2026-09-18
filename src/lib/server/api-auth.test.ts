import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToroSession } = vi.hoisted(() => ({
  getToroSession: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));

import { authorizeToroApi } from "./api-auth";

describe("authorizeToroApi", () => {
  beforeEach(() => {
    getToroSession.mockReset();
  });

  it("returns 401 without a valid TORO session", async () => {
    getToroSession.mockResolvedValue(null);
    const result = await authorizeToroApi(["FOUNDER"]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
  });

  it("returns 403 when the authenticated role is outside the allowlist", async () => {
    getToroSession.mockResolvedValue({
      userId: "u1",
      email: null,
      displayName: "Reception",
      role: "RECEPCION",
    });
    const result = await authorizeToroApi(["FOUNDER", "SYSTEMS"]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
  });

  it("returns the session for an allowed role", async () => {
    const session = {
      userId: "u1",
      email: null,
      displayName: "Founder",
      role: "FOUNDER",
    };
    getToroSession.mockResolvedValue(session);
    const result = await authorizeToroApi(["FOUNDER", "SYSTEMS"]);
    expect(result).toEqual({ ok: true, session });
  });

  it("can require authentication while allowing any TORO role", async () => {
    const session = {
      userId: "u2",
      email: null,
      displayName: "Finance",
      role: "FINANZAS",
    };
    getToroSession.mockResolvedValue(session);
    const result = await authorizeToroApi();
    expect(result).toEqual({ ok: true, session });
  });
});
