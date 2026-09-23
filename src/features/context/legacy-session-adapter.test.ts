import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "./types";
import { resolveLegacySessionRole } from "./legacy-session-adapter";

const ORG_A = "00000000-0000-4000-8000-0000000000aa";

function orgContext(
  roles: ToroResolvedContext["membership"] extends infer _T ? any[] : never,
): ToroResolvedContext {
  return {
    userId: "user-a",
    email: "synthetic@example.invalid",
    displayName: "Synthetic QA",
    mode: "organization",
    orgId: ORG_A,
    membership: {
      orgId: ORG_A,
      membershipId: null,
      membershipType: "employee",
      status: "active",
      roles,
      employeeId: "employee-a",
      source: "legacy_user_roles",
    },
    availableOrgIds: [ORG_A],
    allowedDataScopes: ["work_private", "work_org", "shared", "system"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

describe("resolveLegacySessionRole", () => {
  it("preserves founder only with ADMIN in the active organization", () => {
    expect(
      resolveLegacySessionRole({
        context: orgContext(["ADMIN"]),
        explicitToroRole: "FOUNDER",
      }),
    ).toBe("FOUNDER");
  });

  it("preserves founder with GERENCIA in the active organization", () => {
    expect(
      resolveLegacySessionRole({
        context: orgContext(["GERENCIA"]),
        explicitToroRole: "FOUNDER",
      }),
    ).toBe("FOUNDER");
  });

  it("does not infer founder from ADMIN alone", () => {
    expect(
      resolveLegacySessionRole({
        context: orgContext(["ADMIN"]),
      }),
    ).toBeNull();
  });

  it("denies founder metadata without ADMIN/GERENCIA in the active organization", () => {
    expect(
      resolveLegacySessionRole({
        context: orgContext(["CONTABILIDAD"]),
        explicitToroRole: "FOUNDER",
      }),
    ).toBeNull();
  });

  it("maps GERENCIA from the active organization", () => {
    expect(
      resolveLegacySessionRole({
        context: orgContext(["GERENCIA"]),
      }),
    ).toBe("GERENCIA");
  });

  it("maps CONTABILIDAD to FINANZAS", () => {
    expect(
      resolveLegacySessionRole({
        context: orgContext(["CONTABILIDAD"]),
      }),
    ).toBe("FINANZAS");
  });

  it("returns null for personal context", () => {
    const personal: ToroResolvedContext = {
      ...orgContext(["GERENCIA"]),
      mode: "personal",
      orgId: null,
      membership: null,
      allowedDataScopes: ["personal", "shared", "system"],
      canUsePersonalVault: true,
      canUseOrganizationData: false,
    };

    expect(
      resolveLegacySessionRole({
        context: personal,
        explicitToroRole: "FOUNDER",
      }),
    ).toBeNull();
  });

  it("does not accept a membership object from a different organization", () => {
    const context = orgContext(["GERENCIA"]);
    context.membership = {
      ...context.membership!,
      orgId: "00000000-0000-4000-8000-0000000000bb",
    };

    expect(resolveLegacySessionRole({ context })).toBeNull();
  });
});
