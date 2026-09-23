import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, resolveToroContextMock } = vi.hoisted(
  () => ({
    createServerSupabaseClientMock: vi.fn(),
    resolveToroContextMock: vi.fn(),
  }),
);

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: resolveToroContextMock,
}));

import type {
  ToroCanonicalRole,
  ToroResolvedContext,
} from "@/features/context/types";

import { getToroSession } from "./session";

const USER = "00000000-0000-4000-8000-000000000001";
const ORG = "00000000-0000-4000-8000-0000000000aa";
const EMPLOYEE = "00000000-0000-4000-8000-000000000011";

function context(
  roles: ToroCanonicalRole[],
  overrides: Partial<ToroResolvedContext> = {},
): ToroResolvedContext {
  return {
    userId: USER,
    email: "synthetic@example.invalid",
    displayName: "Synthetic QA",
    mode: "organization",
    orgId: ORG,
    membership: {
      orgId: ORG,
      membershipId: null,
      membershipType: "employee",
      status: "active",
      roles,
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

function user(appMetadata: Record<string, unknown> = {}) {
  return {
    id: USER,
    email: "synthetic@example.invalid",
    app_metadata: appMetadata,
    user_metadata: { display_name: "Synthetic QA" },
  };
}

function authClient(
  authUser: ReturnType<typeof user> | null,
  error: { message: string } | null = null,
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authUser },
        error,
      }),
    },
  };
}

describe("getToroSession via TORO context", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
    resolveToroContextMock.mockReset();
  });

  it("builds the shell session from the selected organization context", async () => {
    resolveToroContextMock.mockResolvedValue(context(["GERENCIA"]));
    createServerSupabaseClientMock.mockResolvedValue(authClient(user()));

    await expect(getToroSession()).resolves.toEqual({
      userId: USER,
      email: "synthetic@example.invalid",
      displayName: "Synthetic QA",
      role: "GERENCIA",
      orgId: ORG,
      employeeId: EMPLOYEE,
      canonicalRoles: ["GERENCIA"],
    });

    expect(resolveToroContextMock).toHaveBeenCalledWith({
      mode: "organization",
    });
  });

  it("allows a canonical employee into the Portal without a legacy functional role", async () => {
    resolveToroContextMock.mockResolvedValue(context(["EMPLEADO"]));
    createServerSupabaseClientMock.mockResolvedValue(authClient(user()));

    await expect(getToroSession()).resolves.toMatchObject({
      role: "EMPLEADO",
      employeeId: EMPLOYEE,
      canonicalRoles: ["EMPLEADO"],
    });
  });

  it("allows RRHH, department lead and auditor canonical roles", async () => {
    for (const role of ["RRHH", "JEFE_DEPARTAMENTO", "AUDITOR"] as const) {
      resolveToroContextMock.mockResolvedValueOnce(context([role]));
      createServerSupabaseClientMock.mockResolvedValueOnce(authClient(user()));
      await expect(getToroSession()).resolves.toMatchObject({ role });
    }
  });

  it("preserves explicit FOUNDER only with ADMIN or GERENCIA in the active organization", async () => {
    resolveToroContextMock.mockResolvedValue(context(["ADMIN"]));
    createServerSupabaseClientMock.mockResolvedValue(
      authClient(user({ toro_role: "FOUNDER" })),
    );

    await expect(getToroSession()).resolves.toMatchObject({
      role: "FOUNDER",
      canonicalRoles: ["ADMIN"],
    });
  });

  it("denies explicit FOUNDER without privileged membership in the active organization", async () => {
    resolveToroContextMock.mockResolvedValue(context(["CONTABILIDAD"]));
    createServerSupabaseClientMock.mockResolvedValue(
      authClient(user({ toro_role: "FOUNDER" })),
    );

    await expect(getToroSession()).resolves.toBeNull();
  });

  it("maps ADMIN to ADMIN and never infers FOUNDER", async () => {
    resolveToroContextMock.mockResolvedValue(context(["ADMIN"]));
    createServerSupabaseClientMock.mockResolvedValue(authClient(user()));

    await expect(getToroSession()).resolves.toMatchObject({ role: "ADMIN" });
  });

  it("preserves an explicit functional experience inside an active organization", async () => {
    resolveToroContextMock.mockResolvedValue(context(["EMPLEADO"]));
    createServerSupabaseClientMock.mockResolvedValue(
      authClient(user({ toro_role: "RECEPCION" })),
    );

    await expect(getToroSession()).resolves.toMatchObject({
      role: "RECEPCION",
      canonicalRoles: ["EMPLEADO"],
    });
  });

  it("ignores unscoped app_metadata role_codes for organization authorization", async () => {
    resolveToroContextMock.mockResolvedValue(context(["EMPLEADO"]));
    createServerSupabaseClientMock.mockResolvedValue(
      authClient(user({ role_codes: ["GERENCIA"] })),
    );

    await expect(getToroSession()).resolves.toMatchObject({
      role: "EMPLEADO",
      canonicalRoles: ["EMPLEADO"],
    });
  });

  it("fails closed when organization context is unresolved or requires a choice", async () => {
    resolveToroContextMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        context(["GERENCIA"], {
          orgId: null,
          membership: null,
          requiresContextChoice: true,
          canUseOrganizationData: false,
          allowedDataScopes: ["system"],
        }),
      );

    await expect(getToroSession()).resolves.toBeNull();
    await expect(getToroSession()).resolves.toBeNull();

    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("revalidates auth and fails if the authenticated user changed or signed out", async () => {
    resolveToroContextMock
      .mockResolvedValueOnce(context(["GERENCIA"]))
      .mockResolvedValueOnce(context(["GERENCIA"]));

    createServerSupabaseClientMock
      .mockResolvedValueOnce(
        authClient({
          ...user(),
          id: "00000000-0000-4000-8000-000000000099",
        }),
      )
      .mockResolvedValueOnce(authClient(null));

    await expect(getToroSession()).resolves.toBeNull();
    await expect(getToroSession()).resolves.toBeNull();
  });
});
