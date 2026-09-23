import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import type { ToroResolvedContext } from "@/features/context/types";

import { submitMyLeaveRequest } from "./server";

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

const validInput = {
  leaveType: "vacation",
  startsOn: "2026-10-01",
  endsOn: "2026-10-03",
  reason: "Descanso familiar",
};

describe("submitMyLeaveRequest", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("uses only the employee identity from TORO context", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: "00000000-0000-4000-8000-000000000099",
      error: null,
    });
    createServerSupabaseClientMock.mockResolvedValue({ rpc });

    await expect(
      submitMyLeaveRequest(context(), {
        ...validInput,
        employeeId: "00000000-0000-4000-8000-000000000088",
      }),
    ).resolves.toEqual({
      status: "created",
      id: "00000000-0000-4000-8000-000000000099",
    });

    expect(rpc).toHaveBeenCalledExactlyOnceWith("submit_leave_request", {
      p_org_id: ORG,
      p_employee_id: EMPLOYEE,
      p_leave_type: "vacation",
      p_starts_on: "2026-10-01",
      p_ends_on: "2026-10-03",
      p_reason: "Descanso familiar",
    });
  });

  it("does not open a database client outside an employee organization context", async () => {
    await expect(
      submitMyLeaveRequest(
        context({
          mode: "personal",
          orgId: null,
          membership: null,
          canUseOrganizationData: false,
          allowedDataScopes: ["personal", "shared", "system"],
        }),
        validInput,
      ),
    ).resolves.toEqual({
      status: "not_available",
      reason: "organization_context_required",
    });

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects invalid input before calling the RPC", async () => {
    const rpc = vi.fn();
    createServerSupabaseClientMock.mockResolvedValue({ rpc });

    await expect(
      submitMyLeaveRequest(context(), {
        ...validInput,
        endsOn: "2026-09-01",
      }),
    ).resolves.toMatchObject({ status: "invalid" });

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps overlap and authorization errors without exposing raw SQL messages", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { message: "leave dates overlap" },
      })
      .mockResolvedValueOnce({
        data: null,
        error: { message: "not authorized" },
      });

    createServerSupabaseClientMock.mockResolvedValue({ rpc });

    await expect(
      submitMyLeaveRequest(context(), validInput),
    ).resolves.toEqual({
      status: "error",
      error: "Ya existe una solicitud que se cruza con esas fechas.",
    });

    await expect(
      submitMyLeaveRequest(context(), validInput),
    ).resolves.toEqual({
      status: "error",
      error: "No tienes permiso para registrar esta solicitud.",
    });
  });

  it("fails safely when the RPC does not return a request id", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    createServerSupabaseClientMock.mockResolvedValue({ rpc });

    await expect(
      submitMyLeaveRequest(context(), validInput),
    ).resolves.toEqual({
      status: "error",
      error: "TORO no pudo confirmar la creación de la solicitud.",
    });
  });
});
