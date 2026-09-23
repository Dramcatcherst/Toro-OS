import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToroSession, listMyDecisions, createServerSupabaseClient, redirect } = vi.hoisted(() => ({
  getToroSession: vi.fn(),
  listMyDecisions: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));
vi.mock("@/features/decisions/server", () => ({ listMyDecisions }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { loadExecutiveHome } from "./server";

type QueryResult = { data: unknown[] | null; error: { message?: string } | null };

function query(result: QueryResult) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(async () => result),
  };
  return chain;
}

function supabaseWith(
  taskResult: QueryResult,
  projectResult: QueryResult,
  maintenanceResult: { data: unknown; error: { message?: string } | null } = {
    data: { round: null, checks: [] },
    error: null,
  },
) {
  const taskQuery = query(taskResult);
  const projectQuery = query(projectResult);
  const from = vi.fn((table: string) => {
    if (table === "tasks") return taskQuery;
    if (table === "projects") return projectQuery;
    throw new Error(`unexpected table:${table}`);
  });
  const schema = vi.fn((name: string) => {
    if (name !== "operations") throw new Error(`unexpected schema:${name}`);
    return { from };
  });
  const rpc = vi.fn(async (name: string) => {
    if (name !== "get_current_maintenance_round") {
      throw new Error(`unexpected rpc:${name}`);
    }
    return maintenanceResult;
  });
  return { schema, from, rpc, taskQuery, projectQuery };
}

const session = {
  userId: "00000000-0000-0000-0000-000000000001",
  role: "FOUNDER",
  navRole: "FOUNDER",
  displayName: "Founder",
  memberships: [],
};

describe("loadExecutiveHome operational signals", () => {
  beforeEach(() => {
    getToroSession.mockReset();
    listMyDecisions.mockReset();
    createServerSupabaseClient.mockReset();
    redirect.mockClear();
    getToroSession.mockResolvedValue(session);
    listMyDecisions.mockResolvedValue([]);
  });

  it("requires a valid TORO session before reading operational signals", async () => {
    getToroSession.mockResolvedValue(null);

    await expect(loadExecutiveHome()).rejects.toThrow("redirect:/login?next=/toro");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("maps only critical/high blocked tasks into executive exceptions and active projects into the portfolio", async () => {
    const client = supabaseWith(
      {
        data: [
          {
            id: "00000000-0000-0000-0000-000000000011",
            task_name: "Resolver integración bloqueada",
            category: "systems",
            area: "TORO",
            priority: "critical",
            status: "blocked",
            updated_at: "2026-09-15T14:44:46.859Z",
            description: "must-not-leak",
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: "00000000-0000-0000-0000-000000000021",
            project_name: "TORO Executive Control",
            status: "In Progress",
            owner_name: "Gerencia",
            next_action: "Cerrar Room 360",
            updated_at: "2026-09-15T14:45:16.838Z",
            notes: "must-not-leak",
          },
        ],
        error: null,
      },
    );
    createServerSupabaseClient.mockResolvedValue(client);

    const data = await loadExecutiveHome();

    expect(data.exceptions).toEqual([
      {
        id: "00000000-0000-0000-0000-000000000011",
        title: "Resolver integración bloqueada",
        domain: "TORO",
        source: "TORO · operations.tasks",
        freshness: "2026-09-15T14:44:46.859Z",
      },
    ]);
    expect(data.projects).toEqual([
      {
        id: "00000000-0000-0000-0000-000000000021",
        title: "TORO Executive Control",
        milestone: null,
        blocker: null,
        nextAction: "Cerrar Room 360",
        owner: "Gerencia",
        status: "In Progress",
      },
    ]);
    expect(JSON.stringify(data)).not.toContain("must-not-leak");
    expect(data.systemHealth.status).toBe("degraded");
    expect(data.systemHealth.label).toMatch(/desactualizada/i);

    expect(client.taskQuery.eq).toHaveBeenCalledWith("active", true);
    expect(client.taskQuery.eq).toHaveBeenCalledWith("status", "blocked");
    expect(client.taskQuery.in).toHaveBeenCalledWith("priority", ["critical", "high"]);
    expect(client.taskQuery.limit).toHaveBeenCalledWith(5);

    expect(client.projectQuery.eq).toHaveBeenCalledWith("active", true);
    expect(client.projectQuery.in).toHaveBeenCalledWith("status", ["Blocked", "In Progress"]);
    expect(client.projectQuery.limit).toHaveBeenCalledWith(6);
  });


  it("adds maintenance signals without replacing existing task exceptions", async () => {
    const fresh = new Date().toISOString();
    const client = supabaseWith(
      {
        data: [{
          id: "00000000-0000-0000-0000-000000000031",
          task_name: "Bloqueo operativo existente",
          category: "operations",
          area: "Hotel",
          priority: "high",
          status: "blocked",
          updated_at: fresh,
        }],
        error: null,
      },
      { data: [], error: null },
      {
        data: {
          round: {
            round_key: "MNT-DAILY-P0-P1-20260923",
            round_name: "Ronda diaria mantenimiento · P0/P1 · 23/09/2026",
            round_status: "ready",
            total_checks: 21,
            required_checks: 21,
            pass_checks: 0,
            fail_checks: 0,
            not_reviewed_checks: 0,
            pending_checks: 21,
            closure_ready_passes: 0,
            last_check_updated_at: fresh,
          },
          checks: [{
            check_id: "00000000-0000-0000-0000-000000000041",
            check_order: 10,
            block_label: "P0 · Agua/Humedad",
            area_label: "#22",
            result_status: "pending",
            requires_supervisor_review: true,
            supervisor_confirmed: false,
            captured_at: null,
          }],
        },
        error: null,
      },
    );
    createServerSupabaseClient.mockResolvedValue(client);

    const data = await loadExecutiveHome();

    expect(data.exceptions.map((item) => item.title)).toEqual([
      "Bloqueo operativo existente",
      "1 P0 de mantenimiento pendientes de verificación",
    ]);
    expect(data.delegatedActions).toEqual([
      expect.objectContaining({
        title: "Ronda P0/P1 de mantenimiento",
        nextStep: "0/21 revisados · 0 FAIL · 21 pendientes",
      }),
    ]);
    expect(client.rpc).toHaveBeenCalledWith("get_current_maintenance_round");
  });

  it("keeps fresh successful operational sources as connected but explicitly partial coverage", async () => {
    const fresh = new Date().toISOString();
    const client = supabaseWith(
      {
        data: [{
          id: "00000000-0000-0000-0000-000000000012",
          task_name: "Bloqueo reciente",
          category: "systems",
          area: "TORO",
          priority: "high",
          status: "blocked",
          updated_at: fresh,
        }],
        error: null,
      },
      {
        data: [{
          id: "00000000-0000-0000-0000-000000000023",
          project_name: "Proyecto reciente",
          status: "In Progress",
          owner_name: null,
          next_action: null,
          updated_at: fresh,
        }],
        error: null,
      },
    );
    createServerSupabaseClient.mockResolvedValue(client);

    const data = await loadExecutiveHome();

    expect(data.systemHealth.status).toBe("unknown");
    expect(data.systemHealth.label).toMatch(/cobertura parcial/i);
  });

  it("degrades honestly when one operational source fails without hiding the source that still works", async () => {
    const client = supabaseWith(
      { data: null, error: { message: "tasks unavailable" } },
      {
        data: [
          {
            id: "00000000-0000-0000-0000-000000000022",
            project_name: "Proyecto activo",
            status: "Blocked",
            owner_name: null,
            next_action: null,
            updated_at: "2026-09-15T10:00:00.000Z",
          },
        ],
        error: null,
      },
    );
    createServerSupabaseClient.mockResolvedValue(client);

    const data = await loadExecutiveHome();

    expect(data.exceptions).toEqual([]);
    expect(data.projects).toHaveLength(1);
    expect(data.systemHealth.status).toBe("degraded");
    expect(data.systemHealth.label).toMatch(/tareas/i);
  });

  it("rejects malformed operational rows instead of treating them as current truth", async () => {
    const client = supabaseWith(
      {
        data: [{ id: "not-a-uuid", task_name: "bad", category: null, area: null, priority: "critical", status: "blocked", updated_at: "bad-date" }],
        error: null,
      },
      { data: [], error: null },
    );
    createServerSupabaseClient.mockResolvedValue(client);

    await expect(loadExecutiveHome()).rejects.toThrow(/executive task payload/i);
  });
});
