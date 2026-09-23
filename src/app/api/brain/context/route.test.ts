import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveToroContextMock } = vi.hoisted(() => ({
  resolveToroContextMock: vi.fn(),
}));

vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: resolveToroContextMock,
}));

import { GET } from "./route";

describe("GET /api/brain/context", () => {
  beforeEach(() => {
    resolveToroContextMock.mockReset();
  });

  it("returns 503 when runtime context configuration throws", async () => {
    resolveToroContextMock.mockRejectedValue(new Error("synthetic config failure"));

    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      state: "runtime_unconfigured",
      organizationDataAllowed: false,
    });
  });

  it("returns 401 when no authenticated/resolved context exists", async () => {
    resolveToroContextMock.mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      state: "unresolved",
      authenticatedContext: false,
    });
  });

  it("returns 409 without leaking organization ids when context choice is required", async () => {
    resolveToroContextMock.mockResolvedValue({
      userId: "synthetic-user",
      email: null,
      displayName: "Synthetic",
      mode: "organization",
      orgId: null,
      membership: null,
      availableOrgIds: ["org-a", "org-b"],
      allowedDataScopes: ["system"],
      allowedTools: [],
      canUsePersonalVault: false,
      canUseOrganizationData: false,
      requiresContextChoice: true,
    });

    const response = await GET();
    expect(response.status).toBe(409);
    const payload = await response.json();
    expect(payload).toMatchObject({
      state: "context_choice_required",
      availableOrganizationCount: 2,
    });
    expect(JSON.stringify(payload)).not.toContain("org-a");
  });

  it("returns a non-PII resolved summary for an authorized organization context", async () => {
    resolveToroContextMock.mockResolvedValue({
      userId: "synthetic-user",
      email: "hidden@example.invalid",
      displayName: "Hidden",
      mode: "organization",
      orgId: "org-a",
      membership: {
        orgId: "org-a",
        membershipId: null,
        membershipType: "employee",
        status: "active",
        roles: ["GERENCIA"],
        employeeId: "employee-a",
        source: "legacy_user_roles",
      },
      availableOrgIds: ["org-a"],
      allowedDataScopes: ["work_private", "work_org", "shared", "system"],
      allowedTools: [],
      canUsePersonalVault: false,
      canUseOrganizationData: true,
      requiresContextChoice: false,
    });

    const response = await GET();
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({
      state: "resolved",
      authenticatedContext: true,
      organizationDataAllowed: true,
      membershipSource: "legacy_user_roles",
      roleCount: 1,
      employeeLinked: true,
    });
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("hidden@example.invalid");
    expect(serialized).not.toContain("synthetic-user");
    expect(serialized).not.toContain("org-a");
    expect(serialized).not.toContain("employee-a");
  });
});
