import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";

import { resolvePeopleSelfServiceScope } from "./context";

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

describe("resolvePeopleSelfServiceScope", () => {
  it("allows an active employee in the selected organization", () => {
    expect(resolvePeopleSelfServiceScope(organizationContext())).toEqual({
      allowed: true,
      orgId: ORG,
      employeeId: "employee-1",
    });
  });

  it("rejects personal context", () => {
    expect(
      resolvePeopleSelfServiceScope(
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

  it("rejects an inactive organization membership", () => {
    const context = organizationContext();
    context.membership = {
      ...context.membership!,
      status: "suspended",
    };

    expect(resolvePeopleSelfServiceScope(context)).toEqual({
      allowed: false,
      reason: "organization_access_required",
    });
  });

  it("rejects a membership from another organization", () => {
    const context = organizationContext();
    context.membership = {
      ...context.membership!,
      orgId: "00000000-0000-4000-8000-0000000000bb",
    };

    expect(resolvePeopleSelfServiceScope(context)).toEqual({
      allowed: false,
      reason: "organization_access_required",
    });
  });

  it("requires a linked employee record", () => {
    const context = organizationContext();
    context.membership = {
      ...context.membership!,
      employeeId: null,
    };

    expect(resolvePeopleSelfServiceScope(context)).toEqual({
      allowed: false,
      reason: "employee_link_required",
    });
  });
});
