import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import type { ToroResolvedContext } from "@/features/context/types";

import { loadAttendanceReview } from "./review-server";

const ORG = "00000000-0000-4000-8000-0000000000aa";

function reviewContext(
  roles: ("ADMIN" | "RRHH" | "GERENCIA" | "AUDITOR" | "CONTABILIDAD")[] = [
    "RRHH",
  ],
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
    order: vi.fn(),
    limit: vi.fn(),
  };
  q.select.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  q.is.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.limit.mockResolvedValue({ data, error });
  return q;
}

function client({
  days = [],
  exceptions = [],
  imports = [],
}: {
  days?: unknown;
  exceptions?: unknown;
  imports?: unknown;
} = {}) {
  const attendanceDays = query(days);
  const attendanceExceptions = query(exceptions);
  const timeImports = query(imports);
  const from = vi.fn((table: string) => {
    if (table === "attendance_days") return attendanceDays;
    if (table === "attendance_exceptions") return attendanceExceptions;
    if (table === "time_imports") return timeImports;
    throw new Error(`Unexpected table: ${table}`);
  });
  return {
    from,
    attendanceDays,
    attendanceExceptions,
    timeImports,
  };
}

describe("loadAttendanceReview", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("does not open a data client for an employee-only role", async () => {
    const employee = reviewContext();
    employee.membership = {
      ...employee.membership!,
      roles: ["EMPLEADO"],
    };

    await expect(loadAttendanceReview(employee)).resolves.toEqual({
      status: "not_available",
      reason: "attendance_review_role_required",
    });

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("reads only safe attendance review sources", async () => {
    const c = client();
    createServerSupabaseClientMock.mockResolvedValue(c);

    await expect(loadAttendanceReview(reviewContext())).resolves.toMatchObject({
      status: "ready",
      data: {
        roles: ["RRHH"],
        days: [],
        openExceptions: [],
        recentImports: [],
      },
    });

    expect(c.from).toHaveBeenCalledWith("attendance_days");
    expect(c.from).toHaveBeenCalledWith("attendance_exceptions");
    expect(c.from).toHaveBeenCalledWith("time_imports");
    expect(c.from).not.toHaveBeenCalledWith("raw_punches");
    expect(c.from).not.toHaveBeenCalledWith("attendance_blocks");
  });

  it("queries only open exceptions for the active organization", async () => {
    const c = client();
    createServerSupabaseClientMock.mockResolvedValue(c);

    await loadAttendanceReview(reviewContext());

    expect(c.attendanceExceptions.eq).toHaveBeenCalledWith("org_id", ORG);
    expect(c.attendanceExceptions.eq).toHaveBeenCalledWith(
      "resolution_status",
      "open",
    );
  });
});
