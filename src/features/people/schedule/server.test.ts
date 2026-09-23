import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import type { ToroResolvedContext } from "@/features/context/types";

import { loadMySchedule } from "./server";

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
  const calls: Array<[string, unknown]> = [];
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    in: vi.fn(),
    gte: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
  };
  q.select.mockReturnValue(q);
  q.eq.mockImplementation((field: string, value: unknown) => {
    calls.push([field, value]);
    return q;
  });
  q.is.mockReturnValue(q);
  q.in.mockReturnValue(q);
  q.gte.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.limit.mockResolvedValue({ data, error });
  q.maybeSingle.mockResolvedValue({ data, error });
  return { q, calls };
}

function client({
  employee = { id: EMPLOYEE, preferred_name: "Synthetic" },
  shifts = [],
  employeeError = null,
  shiftsError = null,
}: {
  employee?: unknown;
  shifts?: unknown;
  employeeError?: unknown;
  shiftsError?: unknown;
} = {}) {
  const employees = query(employee, employeeError);
  const shiftAssignments = query(shifts, shiftsError);
  const from = vi.fn((table: string) => {
    if (table === "employees") return employees.q;
    if (table === "shift_assignments") return shiftAssignments.q;
    throw new Error(`Unexpected table: ${table}`);
  });

  return { from, employees, shiftAssignments };
}

describe("loadMySchedule", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("does not access schedule data in Personal context", async () => {
    await expect(
      loadMySchedule(
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

  it("constrains schedule reads to the active employee and visible states", async () => {
    const c = client({
      shifts: [
        {
          id: "shift-1",
          shift_date: "2026-09-24",
          starts_at: "08:00:00",
          ends_at: "16:00:00",
          break_minutes: 30,
          assignment_status: "published",
          published_at: "2026-09-22T10:00:00Z",
          confirmed_at: null,
        },
      ],
    });
    createServerSupabaseClientMock.mockResolvedValue(c);

    await expect(loadMySchedule(context())).resolves.toMatchObject({
      status: "ready",
      data: {
        employeeId: EMPLOYEE,
        preferredName: "Synthetic",
        shifts: [{ id: "shift-1", assignmentStatus: "published" }],
      },
    });

    expect(c.employees.calls).toContainEqual(["id", EMPLOYEE]);
    expect(c.employees.calls).toContainEqual(["org_id", ORG]);
    expect(c.employees.calls).toContainEqual(["user_id", USER]);

    expect(c.shiftAssignments.calls).toContainEqual(["org_id", ORG]);
    expect(c.shiftAssignments.calls).toContainEqual(["employee_id", EMPLOYEE]);
    expect(c.shiftAssignments.q.in).toHaveBeenCalledWith(
      "assignment_status",
      ["published", "confirmed"],
    );
    expect(c.shiftAssignments.q.gte).toHaveBeenCalledWith(
      "shift_date",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
    expect(c.shiftAssignments.q.limit).toHaveBeenCalledWith(60);

    expect(c.from).not.toHaveBeenCalledWith("shift_templates");
    expect(c.from).not.toHaveBeenCalledWith("salary_history");
  });

  it("blocks an employee identity mismatch", async () => {
    const c = client({
      employee: { id: "other-employee", preferred_name: "Other" },
    });
    createServerSupabaseClientMock.mockResolvedValue(c);

    await expect(loadMySchedule(context())).resolves.toEqual({
      status: "not_available",
      reason: "employee_identity_mismatch",
    });
  });

  it("fails closed when shift assignments cannot be read", async () => {
    const c = client({
      shiftsError: { message: "synthetic schedule read failure" },
    });
    createServerSupabaseClientMock.mockResolvedValue(c);

    await expect(loadMySchedule(context())).resolves.toEqual({
      status: "error",
      reason: "data_unavailable",
      failedSources: ["shift_assignments"],
    });
  });
});
