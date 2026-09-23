import { describe, expect, it } from "vitest";

import type { ToroCanonicalRole, ToroResolvedContext } from "@/features/context/types";

import { resolveAttendanceReviewScope } from "./review-context";

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

describe("resolveAttendanceReviewScope", () => {
  it.each(["ADMIN", "RRHH", "GERENCIA", "AUDITOR", "CONTABILIDAD"] as const)(
    "allows %s attendance review",
    (role) => {
      expect(resolveAttendanceReviewScope(context([role]))).toEqual({
        allowed: true,
        orgId: ORG,
      });
    },
  );

  it.each(["EMPLEADO", "JEFE_DEPARTAMENTO"] as const)(
    "does not grant exception/import review to %s",
    (role) => {
      expect(resolveAttendanceReviewScope(context([role]))).toEqual({
        allowed: false,
        reason: "attendance_review_role_required",
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

    expect(resolveAttendanceReviewScope(personal)).toEqual({
      allowed: false,
      reason: "organization_context_required",
    });
  });
});
