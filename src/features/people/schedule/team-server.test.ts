import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import type { ToroCanonicalRole, ToroResolvedContext } from "@/features/context/types";

import { loadTeamSchedule } from "./team-server";

const ORG = "00000000-0000-4000-8000-0000000000aa";

function context(
  roles: ToroCanonicalRole[] = ["RRHH"],
): ToroResolvedContext {
  return {
    userId: "user-a",
    email: "synthetic@example.invalid",
    displayName: "Synthetic",
    mode: "organization",
    orgId: ORG,
    membership: {
      orgId: ORG,
      membershipId: null,
      membershipType: "employee",
      status: "active",
      roles,
      employeeId: "employee-a",
      source: "legacy_user_roles",
    },
    availableOrgIds: [ORG],
    allowedDataScopes: ["work_private", "work_org", "shared", "system"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

function query(data: unknown = [], error: unknown = null) {
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    in: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };
  q.select.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  q.is.mockReturnValue(q);
  q.in.mockReturnValue(q);
  q.gte.mockReturnValue(q);
  q.lte.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.limit.mockResolvedValue({ data, error });
  return q;
}

describe("loadTeamSchedule", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("does not open a data client for an employee-only role", async () => {
    await expect(loadTeamSchedule(context(["EMPLEADO"]))).resolves.toEqual({
      status: "not_available",
      reason: "team_schedule_role_required",
    });

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("queries only safe schedule assignments and lets RLS scope rows", async () => {
    const shifts = query([]);
    const from = vi.fn((table: string) => {
      if (table === "shift_assignments") return shifts;
      throw new Error(`Unexpected table: ${table}`);
    });
    createServerSupabaseClientMock.mockResolvedValue({ from });

    const result = await loadTeamSchedule(context(["JEFE_DEPARTAMENTO"]));

    expect(result).toMatchObject({
      status: "ready",
      data: {
        roles: ["JEFE_DEPARTAMENTO"],
        shifts: [],
      },
    });

    expect(from).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith("shift_assignments");
    expect(shifts.eq).toHaveBeenCalledWith("org_id", ORG);
    expect(shifts.in).toHaveBeenCalledWith("assignment_status", [
      "draft",
      "published",
      "confirmed",
    ]);
    expect(shifts.gte).toHaveBeenCalledWith(
      "shift_date",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
    expect(shifts.lte).toHaveBeenCalledWith(
      "shift_date",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
    expect(shifts.limit).toHaveBeenCalledWith(300);

    expect(from).not.toHaveBeenCalledWith("shift_templates");
    expect(from).not.toHaveBeenCalledWith("salary_history");
    expect(from).not.toHaveBeenCalledWith("attendance_days");
  });

  it("fails closed when team schedule cannot be read", async () => {
    const shifts = query([], { message: "synthetic schedule read failure" });
    createServerSupabaseClientMock.mockResolvedValue({
      from: vi.fn().mockReturnValue(shifts),
    });

    await expect(loadTeamSchedule(context())).resolves.toEqual({
      status: "error",
      reason: "data_unavailable",
      failedSources: ["shift_assignments"],
    });
  });
});
