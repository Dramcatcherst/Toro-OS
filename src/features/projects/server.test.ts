import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToroSession, createServerSupabaseClient, redirect } = vi.hoisted(() => ({
  getToroSession: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { loadProjectDirectory } from "./server";

function query(result: { data: unknown[] | null; error: { message?: string } | null }) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(async () => result),
  };
  return chain;
}

const session = {
  userId: "00000000-0000-0000-0000-000000000001",
  role: "FOUNDER",
  navRole: "FOUNDER",
  displayName: "Founder",
  memberships: [],
};

describe("loadProjectDirectory", () => {
  beforeEach(() => {
    getToroSession.mockReset();
    createServerSupabaseClient.mockReset();
    redirect.mockClear();
    getToroSession.mockResolvedValue(session);
  });

  it("requires an authenticated TORO session", async () => {
    getToroSession.mockResolvedValue(null);

    await expect(loadProjectDirectory()).rejects.toThrow("redirect:/login?next=/toro/proyectos");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("blocks restricted TORO roles before querying projects", async () => {
    getToroSession.mockResolvedValue({ ...session, role: "RECEPCION", navRole: "RECEPCION" });

    await expect(loadProjectDirectory()).rejects.toThrow("redirect:/toro");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("maps a bounded RLS-governed active project directory without leaking private notes", async () => {
    const projectQuery = query({
      data: [
        {
          id: "00000000-0000-0000-0000-000000000021",
          project_name: "TORO Executive Control",
          status: "In Progress",
          priority: "critical",
          owner_name: "Gerencia",
          next_action: "Cerrar Room 360",
          category: "systems",
          business_area: "hotel",
          updated_at: "2026-09-15T14:45:16.838Z",
          notes: "must-not-leak",
        },
      ],
      error: null,
    });
    const from = vi.fn((table: string) => {
      if (table !== "projects") throw new Error(`unexpected table:${table}`);
      return projectQuery;
    });
    const schema = vi.fn((name: string) => {
      if (name !== "operations") throw new Error(`unexpected schema:${name}`);
      return { from };
    });
    createServerSupabaseClient.mockResolvedValue({ schema });

    const data = await loadProjectDirectory();

    expect(data).toEqual([
      {
        id: "00000000-0000-0000-0000-000000000021",
        title: "TORO Executive Control",
        status: "In Progress",
        priority: "critical",
        owner: "Gerencia",
        nextAction: "Cerrar Room 360",
        category: "systems",
        businessArea: "hotel",
        freshness: "2026-09-15T14:45:16.838Z",
      },
    ]);
    expect(JSON.stringify(data)).not.toContain("must-not-leak");
    expect(projectQuery.select).toHaveBeenCalledWith(
      "id,project_name,status,priority,owner_name,next_action,category,business_area,updated_at",
    );
    expect(projectQuery.eq).toHaveBeenCalledWith("active", true);
    expect(projectQuery.limit).toHaveBeenCalledWith(50);
  });

  it("fails closed on query errors or malformed rows", async () => {
    const failedQuery = query({ data: null, error: { message: "permission denied" } });
    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from: () => failedQuery }),
    });
    await expect(loadProjectDirectory()).rejects.toThrow(/permission denied/i);

    const malformedQuery = query({
      data: [{ id: "bad", project_name: "Bad", status: "Blocked", updated_at: "bad-date" }],
      error: null,
    });
    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from: () => malformedQuery }),
    });
    await expect(loadProjectDirectory()).rejects.toThrow(/project directory payload/i);
  });
});
