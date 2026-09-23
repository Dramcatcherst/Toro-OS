import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePathMock,
  resolveToroContextMock,
  submitMyLeaveRequestMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  resolveToroContextMock: vi.fn(),
  submitMyLeaveRequestMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: resolveToroContextMock,
}));

vi.mock("./server", () => ({
  submitMyLeaveRequest: submitMyLeaveRequestMock,
}));

import type { ToroResolvedContext } from "@/features/context/types";

import {
  initialLeaveRequestActionState,
  submitLeaveRequestAction,
} from "./actions";

const context: ToroResolvedContext = {
  userId: "user-1",
  email: "synthetic@example.invalid",
  displayName: "Synthetic",
  mode: "organization",
  orgId: "org-1",
  membership: {
    orgId: "org-1",
    membershipId: null,
    membershipType: "employee",
    status: "active",
    roles: ["EMPLEADO"],
    employeeId: "employee-1",
    source: "legacy_user_roles",
  },
  availableOrgIds: ["org-1"],
  allowedDataScopes: ["work_private", "work_org", "shared", "system"],
  allowedTools: [],
  canUsePersonalVault: false,
  canUseOrganizationData: true,
  requiresContextChoice: false,
};

function form() {
  const data = new FormData();
  data.set("leaveType", "vacation");
  data.set("startsOn", "2026-10-01");
  data.set("endsOn", "2026-10-03");
  data.set("reason", "Descanso familiar");
  data.set("employeeId", "must-not-be-forwarded");
  return data;
}

describe("submitLeaveRequestAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockReset();
    resolveToroContextMock.mockReset();
    submitMyLeaveRequestMock.mockReset();
  });

  it("resolves organization context and forwards no employee identity from the form", async () => {
    resolveToroContextMock.mockResolvedValue(context);
    submitMyLeaveRequestMock.mockResolvedValue({
      status: "created",
      id: "request-1",
    });

    await expect(
      submitLeaveRequestAction(initialLeaveRequestActionState, form()),
    ).resolves.toEqual({
      status: "success",
      message: "Solicitud enviada. Quedó pendiente de revisión.",
      requestId: "request-1",
    });

    expect(resolveToroContextMock).toHaveBeenCalledWith({
      mode: "organization",
    });
    expect(submitMyLeaveRequestMock).toHaveBeenCalledWith(context, {
      leaveType: "vacation",
      startsOn: "2026-10-01",
      endsOn: "2026-10-03",
      reason: "Descanso familiar",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/toro/solicitudes");
    expect(revalidatePathMock).toHaveBeenCalledWith("/toro/mi-perfil");
  });

  it("fails closed when organization context is ambiguous", async () => {
    resolveToroContextMock.mockResolvedValue({
      ...context,
      orgId: null,
      membership: null,
      requiresContextChoice: true,
      canUseOrganizationData: false,
      allowedDataScopes: ["system"],
    });

    await expect(
      submitLeaveRequestAction(initialLeaveRequestActionState, form()),
    ).resolves.toMatchObject({ status: "error" });

    expect(submitMyLeaveRequestMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns validation errors without revalidating", async () => {
    resolveToroContextMock.mockResolvedValue(context);
    submitMyLeaveRequestMock.mockResolvedValue({
      status: "invalid",
      error: "Use fechas válidas.",
    });

    await expect(
      submitLeaveRequestAction(initialLeaveRequestActionState, form()),
    ).resolves.toEqual({
      status: "error",
      message: "Use fechas válidas.",
    });

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
