import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";

import { resolveToroCommsScope } from "./context";

const ORG = "00000000-0000-4000-8000-0000000000aa";

function organizationContext(
  overrides: Partial<ToroResolvedContext> = {},
): ToroResolvedContext {
  return {
    userId: "user-1",
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
      employeeId: "employee-1",
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

describe("resolveToroCommsScope", () => {
  it("allows an active organization context", () => {
    expect(resolveToroCommsScope(organizationContext())).toEqual({
      allowed: true,
      orgId: ORG,
      userId: "user-1",
      employeeId: "employee-1",
    });
  });

  it("allows an active non-employee organization member", () => {
    const context = organizationContext();
    context.membership = {
      ...context.membership!,
      membershipType: null,
      employeeId: null,
    };

    expect(resolveToroCommsScope(context)).toEqual({
      allowed: true,
      orgId: ORG,
      userId: "user-1",
      employeeId: null,
    });
  });

  it("rejects personal context", () => {
    expect(
      resolveToroCommsScope(
        organizationContext({
          mode: "personal",
          orgId: null,
          membership: null,
          canUsePersonalVault: true,
          canUseOrganizationData: false,
          allowedDataScopes: ["personal", "shared", "system"],
        }),
      ),
    ).toEqual({
      allowed: false,
      reason: "organization_context_required",
    });
  });

  it("rejects a suspended or mismatched membership", () => {
    const suspended = organizationContext();
    suspended.membership = {
      ...suspended.membership!,
      status: "suspended",
    };
    expect(resolveToroCommsScope(suspended)).toEqual({
      allowed: false,
      reason: "organization_access_required",
    });

    const mismatched = organizationContext();
    mismatched.membership = {
      ...mismatched.membership!,
      orgId: "00000000-0000-4000-8000-0000000000bb",
    };
    expect(resolveToroCommsScope(mismatched)).toEqual({
      allowed: false,
      reason: "organization_access_required",
    });
  });
});
