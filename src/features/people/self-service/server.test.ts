import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import type { ToroResolvedContext } from "@/features/context/types";

import { loadMyPeopleSelfService } from "./server";

const ORG = "00000000-0000-4000-8000-0000000000aa";
const USER = "00000000-0000-4000-8000-000000000001";
const EMPLOYEE = "00000000-0000-4000-8000-000000000011";

function context(overrides: Partial<ToroResolvedContext> = {}): ToroResolvedContext {
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

type TableFixture = {
  data: unknown;
  error?: { message: string } | null;
};

function buildQuery(fixture: TableFixture) {
  const calls: Array<[string, unknown]> = [];
  const inCalls: Array<[string, unknown[]]> = [];
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    is: vi.fn(),
    gte: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockImplementation((field: string, value: unknown) => {
    calls.push([field, value]);
    return query;
  });
  query.in.mockImplementation((field: string, values: unknown[]) => {
    inCalls.push([field, values]);
    return query;
  });
  query.is.mockReturnValue(query);
  query.gte.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockResolvedValue({
    data: fixture.data,
    error: fixture.error ?? null,
  });
  query.maybeSingle.mockResolvedValue({
    data: fixture.data,
    error: fixture.error ?? null,
  });

  return { query, calls, inCalls };
}

function buildClient({
  employee = {
    id: EMPLOYEE,
    preferred_name: "Synthetic",
    employment_status: "active",
    hire_date: "2026-01-01",
    work_area: "Recepción",
  },
  employeeError = null,
  profileEmployeeId = EMPLOYEE,
  payroll = [{
    id: "line-1",
    payroll_period_id: "period-1",
    regular_minutes: 4800,
    overtime_minutes: 0,
    gross_amount: "250000",
    deduction_amount: "25000",
    net_amount: "225000",
    line_status: "paid",
    calculation_snapshot: {
      period_from: "2026-09-01",
      period_to: "2026-09-15",
      hourly_rate: "SHOULD_NOT_PROJECT",
    },
  }],
  payrollError = null,
}: {
  employee?: unknown;
  employeeError?: { message: string } | null;
  profileEmployeeId?: string;
  payroll?: unknown;
  payrollError?: { message: string } | null;
} = {}) {
  const employees = buildQuery({ data: employee, error: employeeError });
  const shifts = buildQuery({ data: [] });
  const leaveRequests = buildQuery({ data: [] });
  const leaveBalances = buildQuery({ data: [] });
  const attendance = buildQuery({ data: [] });
  const payrollLines = buildQuery({ data: payroll, error: payrollError });

  const tables: Record<string, ReturnType<typeof buildQuery>> = {
    employees,
    shift_assignments: shifts,
    leave_requests: leaveRequests,
    leave_balances: leaveBalances,
    attendance_days: attendance,
    payroll_lines: payrollLines,
  };

  const from = vi.fn((table: string) => {
    const target = tables[table];
    if (!target) throw new Error(`Unexpected table: ${table}`);
    return target.query;
  });

  const rpc = vi.fn().mockResolvedValue({
    data: {
      employeeId: profileEmployeeId,
      preferredName: "Synthetic",
      phone: "",
      personalEmail: "",
      address: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
    },
    error: null,
  });

  return { client: { from, rpc }, tables, from, rpc };
}

describe("loadMyPeopleSelfService", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("does not touch People data from Personal context", async () => {
    const personal = context({
      mode: "personal",
      orgId: null,
      membership: null,
      canUsePersonalVault: true,
      canUseOrganizationData: false,
      allowedDataScopes: ["personal", "shared", "system"],
    });

    await expect(loadMyPeopleSelfService(personal)).resolves.toEqual({
      status: "not_available",
      reason: "organization_context_required",
    });

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("constrains employee identity by employee, organization and authenticated user id", async () => {
    const mock = buildClient();
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    const result = await loadMyPeopleSelfService(context());

    expect(result).toMatchObject({
      status: "ready",
      data: {
        employment: {
          employeeId: EMPLOYEE,
          preferredName: "Synthetic",
          employmentStatus: "active",
        },
        payrollReceipts: [{
          id: "line-1",
          payrollPeriodId: "period-1",
          periodFrom: "2026-09-01",
          periodTo: "2026-09-15",
          grossAmount: 250000,
          deductionAmount: 25000,
          netAmount: 225000,
          lineStatus: "paid",
        }],
        source: "supabase_canonical",
      },
    });

    expect(mock.tables.employees.calls).toContainEqual(["id", EMPLOYEE]);
    expect(mock.tables.employees.calls).toContainEqual(["org_id", ORG]);
    expect(mock.tables.employees.calls).toContainEqual(["user_id", USER]);
  });

  it("constrains payroll receipts by organization, employee and final status", async () => {
    const mock = buildClient();
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    await loadMyPeopleSelfService(context());

    expect(mock.tables.payroll_lines.calls).toContainEqual(["org_id", ORG]);
    expect(mock.tables.payroll_lines.calls).toContainEqual(["employee_id", EMPLOYEE]);
    expect(mock.tables.payroll_lines.inCalls).toContainEqual([
      "line_status",
      ["approved", "paid"],
    ]);
  });

  it("blocks a private-profile employee mismatch", async () => {
    const mock = buildClient({
      profileEmployeeId: "00000000-0000-4000-8000-000000000099",
    });
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    await expect(loadMyPeopleSelfService(context())).resolves.toEqual({
      status: "not_available",
      reason: "employee_identity_mismatch",
    });
  });

  it("fails closed when the self employee identity query errors", async () => {
    const mock = buildClient({
      employee: null,
      employeeError: { message: "synthetic identity read failure" },
    });
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    await expect(loadMyPeopleSelfService(context())).resolves.toEqual({
      status: "error",
      reason: "data_unavailable",
      failedSources: ["employee_identity"],
    });
  });

  it("fails closed when own payroll cannot be read", async () => {
    const mock = buildClient({
      payroll: null,
      payrollError: { message: "synthetic payroll read failure" },
    });
    createServerSupabaseClientMock.mockResolvedValue(mock.client);

    await expect(loadMyPeopleSelfService(context())).resolves.toEqual({
      status: "error",
      reason: "data_unavailable",
      failedSources: ["payroll_receipts"],
    });
  });
});
