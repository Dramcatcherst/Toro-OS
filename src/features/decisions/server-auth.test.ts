import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, getToroSessionMock, redirect } = vi.hoisted(() => ({
  createClient: vi.fn(),
  getToroSessionMock: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createClient,
}));

vi.mock("@/features/auth/session", () => ({
  getToroSession: getToroSessionMock,
}));

vi.mock("next/navigation", () => ({ redirect }));

import { listMyDecisions } from "./server";

const validSession = {
  userId: "00000000-0000-4000-8000-000000000001",
  email: "synthetic@example.invalid",
  displayName: "Synthetic QA",
  role: "FOUNDER" as const,
  orgId: "00000000-0000-4000-8000-0000000000aa",
  employeeId: null,
  canonicalRoles: ["ADMIN"] as const,
};

function fixture() {
  const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
  createClient.mockResolvedValue({ rpc });
  return { rpc };
}

describe("decision DAL session boundary", () => {
  beforeEach(() => {
    createClient.mockReset();
    getToroSessionMock.mockReset();
    redirect.mockClear();
  });

  it("redirects and never queries decisions when TORO session is absent", async () => {
    const client = fixture();
    getToroSessionMock.mockResolvedValue(null);

    await expect(listMyDecisions({})).rejects.toThrow(
      "REDIRECT:/login?next=/toro",
    );

    expect(client.rpc).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login?next=/toro");
  });

  it("propagates an unavailable session service without querying decisions", async () => {
    const client = fixture();
    getToroSessionMock.mockRejectedValue(
      new Error("synthetic session unavailable"),
    );

    await expect(listMyDecisions({})).rejects.toThrow(
      "synthetic session unavailable",
    );

    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("requires a valid TORO session before the decisions RPC", async () => {
    const client = fixture();
    getToroSessionMock.mockResolvedValue(validSession);

    await expect(listMyDecisions({ limit: 20 })).resolves.toEqual([]);

    expect(getToroSessionMock).toHaveBeenCalledOnce();
    expect(client.rpc).toHaveBeenCalledExactlyOnceWith("list_my_decisions", {
      p_limit: 20,
    });
    expect(
      getToroSessionMock.mock.invocationCallOrder[0],
    ).toBeLessThan(client.rpc.mock.invocationCallOrder[0]);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("does not bypass SQL authorization after a valid TORO session", async () => {
    const client = fixture();
    getToroSessionMock.mockResolvedValue(validSession);
    client.rpc.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });

    await expect(listMyDecisions({})).rejects.toThrow("permission denied");

    expect(getToroSessionMock).toHaveBeenCalledOnce();
    expect(client.rpc).toHaveBeenCalledOnce();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("rechecks the TORO session on each DAL call and stops after revocation", async () => {
    const client = fixture();
    getToroSessionMock
      .mockResolvedValueOnce(validSession)
      .mockResolvedValueOnce(null);

    await expect(listMyDecisions({})).resolves.toEqual([]);
    await expect(listMyDecisions({})).rejects.toThrow(
      "REDIRECT:/login?next=/toro",
    );

    expect(getToroSessionMock).toHaveBeenCalledTimes(2);
    expect(client.rpc).toHaveBeenCalledOnce();
  });

  it("bounds the requested RPC limit after session validation", async () => {
    const client = fixture();
    getToroSessionMock.mockResolvedValue(validSession);

    await expect(listMyDecisions({ limit: 999 })).resolves.toEqual([]);

    expect(client.rpc).toHaveBeenCalledExactlyOnceWith("list_my_decisions", {
      p_limit: 20,
    });
  });
});
