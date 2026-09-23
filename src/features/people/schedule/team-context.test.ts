import { describe, expect, it } from "vitest";

import type {
  ToroCanonicalRole,
  ToroResolvedContext,
} from "@/features/context/types";

import { resolveTeamScheduleScope } from "./team-context";

const ORG = "00000000-0000-4000-8000-0000000000aa";

function context(roles: ToroCanonicalRole[]): ToroResolvedContext {
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

describe("resolveTeamScheduleScope", () => {
  it.each(
    ["ADMIN", "RRHH", "GERENCIA", "JEFE_DEPARTAMENTO", "AUDITOR"] as const,
  )("allows %s team schedule review", (role) => {
    expect(resolveTeamScheduleScope(context([role]))).toEqual({
      allowed: true,
      orgId: ORG,
    });
  });

  it.each(["EMPLEADO", "CONTABILIDAD"] as const)(
    "does not grant team schedule review to %s",
    (role) => {
      expect(resolveTeamScheduleScope(context([role]))).toEqual({
        allowed: false,
        reason: "team_schedule_role_required",
      });
    },
  );

  it("rejects Personal context", () => {
    const personal = context(["ADMIN"]);
    personal.mode = "personal";
    personal.orgId = null;
    personal.membership = null;
    personal.canUseOrganizationData = false;
    personal.allowedDataScopes = ["personal", "shared", "system"];

    expect(resolveTeamScheduleScope(personal)).toEqual({
      allowed: false,
      reason: "organization_context_required",
    });
  });
});
