import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveToroContextMock, submitMyLeaveRequestMock } = vi.hoisted(() => ({
  resolveToroContextMock: vi.fn(),
  submitMyLeaveRequestMock: vi.fn(),
}));

vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: resolveToroContextMock,
}));

vi.mock("@/features/people/leave/server", () => ({
  submitMyLeaveRequest: submitMyLeaveRequestMock,
}));

import { POST } from "./route";

const context = {
  userId: "user-a",
  email: "synthetic@example.invalid",
  displayName: "Synthetic",
  mode: "organization" as const,
  orgId: "org-a",
  membership: {
    orgId: "org-a",
    membershipId: null,
    membershipType: "employee" as const,
    status: "active" as const,
    roles: ["EMPLEADO" as const],
    employeeId: "employee-a",
    source: "legacy_user_roles" as const,
  },
  availableOrgIds: ["org-a"],
  allowedDataScopes: ["work_private" as const, "work_org" as const],
  allowedTools: [],
  canUsePersonalVault: false,
  canUseOrganizationData: true,
  requiresContextChoice: false,
};

function request(body: unknown) {
  return new Request("https://example.invalid/api/toro/people/leave-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/toro/people/leave-requests", () => {
  beforeEach(() => {
    resolveToroContextMock.mockReset();
    submitMyLeaveRequestMock.mockReset();
  });

  it("returns 201 for a governed self-service request", async () => {
    resolveToroContextMock.mockResolvedValue(context);
    submitMyLeaveRequestMock.mockResolvedValue({
      status: "created",
      id: "request-a",
    });

    const response = await POST(
      request({
        leaveType: "vacation",
        startsOn: "2026-10-01",
        endsOn: "2026-10-03",
        reason: "Descanso familiar",
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: "request-a" });
    expect(submitMyLeaveRequestMock).toHaveBeenCalledOnce();
  });

  it("denies unresolved organization context before submission", async () => {
    resolveToroContextMock.mockResolvedValue(null);

    const response = await POST(request({}));

    expect(response.status).toBe(401);
    expect(submitMyLeaveRequestMock).not.toHaveBeenCalled();
  });

  it("does not expose internal errors", async () => {
    resolveToroContextMock.mockResolvedValue(context);
    submitMyLeaveRequestMock.mockResolvedValue({
      status: "error",
      error: "No fue posible registrar la solicitud.",
    });

    const response = await POST(request({}));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "No fue posible registrar la solicitud.",
    });
  });
});
