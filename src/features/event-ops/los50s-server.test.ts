import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";

import { canReadLos50sEventOps } from "./los50s-server";

function context(roles: string[]): ToroResolvedContext {
  return {
    userId: "user-1",
    email: "admin@example.com",
    displayName: "Admin",
    mode: "organization",
    orgId: "org-1",
    membership: {
      orgId: "org-1",
      membershipId: null,
      membershipType: "owner",
      status: "active",
      roles: roles as ToroResolvedContext["membership"] extends infer M
        ? M extends { roles: infer R } ? R : never
        : never,
      employeeId: null,
      source: "legacy_user_roles",
    },
    availableOrgIds: ["org-1"],
    allowedDataScopes: ["work_org"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

describe("Los50s Event Ops authorization", () => {
  it("allows ADMIN and GERENCIA only", () => {
    expect(canReadLos50sEventOps(context(["ADMIN"]))).toBe(true);
    expect(canReadLos50sEventOps(context(["GERENCIA"]))).toBe(true);
    expect(canReadLos50sEventOps(context(["CONTABILIDAD"]))).toBe(false);
    expect(canReadLos50sEventOps(context(["EMPLEADO"]))).toBe(false);
  });

  it("fails closed without organization scope", () => {
    const value = context(["ADMIN"]);
    value.orgId = null;
    value.membership = null;
    value.canUseOrganizationData = false;
    expect(canReadLos50sEventOps(value)).toBe(false);
  });
});
