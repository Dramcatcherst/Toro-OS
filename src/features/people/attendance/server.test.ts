import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import type { ToroResolvedContext } from "@/features/context/types";

import { loadMyAttendance } from "./server";

const USER = "00000000-0000-4000-8000-000000000001";
const ORG = "00000000-0000-4000-8000-0000000000aa";
const EMPLOYEE = "00000000-0000-4000-8000-000000000011";

function context(
  overrides: Partial<ToroResolvedContext> = {},
): ToroResolvedContext {
  return {
    userId: USER,
    email: "synthetic@example.invalid",
    displayName: "Synthetic",
    mode: "organization",
    orgId: ORG,
    membership: {
      orgId: ORG,
      membershipId: null,
      membershipType: "employee",
      status: "active",
      roles: ["EMPLEADO"],
      employeeId: EMPLOYEE,
      source: "legacy_user_roles",
    },
    availableOrgIds: [ORG],
    allowedDataScopes: ["work_private", "work_org", "shared", "system"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
    ...overrides,
  };
}

function query(data: unknown, error: unknown = null) {
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
  };
  q.select.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  q.is.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.limit.mockResolvedValue({ data, error });
  q.maybeSingle.mockResolvedValue({ data, error });
  return q;
}

function client({
  employee = { id: EMPLOYEE, preferred_name: "Synthetic" },
  attendance = [],
  employeeError = null,
  attendanceError = null,
}: {
  employee?: unknown;
  attendance?: unknown;
  employeeError?: unknown;
  attendanceError?: unknown;
} = {}) {
  const employees = query(employee, employeeError);
  const attendanceDays = query(attendance, attendanceError);
  return {
    employees,
    attendanceDays,
    from: vi.fn((table: string) => {
      if (table === "employees") return employees;
      if (table === "attendance_days") return attendanceDays;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

describe("loadMyAttendance", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("does not access attendance in Personal context", async () => {
    await expect(
      loadMyAttendance(
        context({
          mode: "personal",
          orgId: null,
          membership: null,
          allowedDataScopes: ["personal", "shared", "system"],
          canUsePersonalVault: true,
          canUseOrganizationData: false,
        }),
      ),
    ).resolves.toEqual({
      status: "not_available",
      reason: "organization_context_required",
    });

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("constrains the identity and attendance queries to the active employee", async () => {
    const c = client({
      attendance: [
        {
          id: "day-1",
          work_date: "2026-09-22",
          actual_worked_minutes: 480,
          worked_minutes: 480,
          attendance_status: "complete",
          approval_status: "approved",
          payroll_eligible: true,
        },
      ],
    });
    createServerSupabaseClientMock.mockResolvedValue(c);

    const result = await loadMyAttendance(context());

    expect(result).toMatchObject({
      status: "ready",
      data: {
        employeeId: EMPLOYEE,
        preferredName: "Synthetic",
      },
    });

    expect(c.employees.eq).toHaveBeenCalledWith("id", EMPLOYEE);
    expect(c.employees.eq).toHaveBeenCalledWith("org_id", ORG);
    expect(c.employees.eq).toHaveBeenCalledWith("user_id", USER);
    expect(c.attendanceDays.eq).toHaveBeenCalledWith("org_id", ORG);
    expect(c.attendanceDays.eq).toHaveBeenCalledWith("employee_id", EMPLOYEE);
    expect(c.attendanceDays.limit).toHaveBeenCalledWith(45);
  });

  it("blocks an employee identity mismatch", async () => {
    const c = client({
      employee: { id: "other-employee", preferred_name: "Other" },
    });
    createServerSupabaseClientMock.mockResolvedValue(c);

    await expect(loadMyAttendance(context())).resolves.toEqual({
      status: "not_available",
      reason: "employee_identity_mismatch",
    });
  });

  it("fails closed when canonical attendance cannot be read", async () => {
    const c = client({
      attendanceError: { message: "synthetic read failure" },
    });
    createServerSupabaseClientMock.mockResolvedValue(c);

    await expect(loadMyAttendance(context())).resolves.toEqual({
      status: "error",
      reason: "data_unavailable",
      failedSources: ["attendance"],
    });
  });
});
