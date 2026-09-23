import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { resolveToroContext } from "./resolver";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const ORG_A = "00000000-0000-4000-8000-0000000000aa";
const ORG_B = "00000000-0000-4000-8000-0000000000bb";

type Fixture = {
  roleRows?: unknown;
  roleError?: { message: string } | null;
  employeeRowsByOrg?: Record<string, Array<{
    id: string;
    preferred_name?: string | null;
    position_id?: string | null;
    work_area?: string | null;
    positions?: { code?: string | null; name?: string | null } | null;
  }>>;
  employeeError?: boolean;
};

function buildClient({
  roleRows = [],
  roleError = null,
  employeeRowsByOrg = {},
  employeeError = false,
}: Fixture = {}) {
  const getUser = vi.fn().mockResolvedValue({
    data: {
      user: {
        id: USER_ID,
        email: "synthetic@example.invalid",
        app_metadata: {},
        user_metadata: { display_name: "Synthetic QA" },
      },
    },
    error: null,
  });

  function roleQuery() {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      is: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.is.mockResolvedValue({ data: roleRows, error: roleError });
    return query;
  }

  function employeeQuery() {
    let selectedOrg: string | null = null;
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      is: vi.fn(),
      limit: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockImplementation((field: string, value: string) => {
      if (field === "org_id") selectedOrg = value;
      return query;
    });
    query.is.mockReturnValue(query);
    query.limit.mockImplementation(async () => ({
      data: selectedOrg ? employeeRowsByOrg[selectedOrg] ?? [] : [],
      error: employeeError ? { message: "synthetic employee read failure" } : null,
    }));
    return query;
  }

  const from = vi.fn((table: string) => {
    if (table === "user_roles") return roleQuery();
    if (table === "employees") return employeeQuery();
    throw new Error(`Unexpected table: ${table}`);
  });

  return { auth: { getUser }, from };
}

describe("resolveToroContext", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("allows personal context for an authenticated user with no organization roles", async () => {
    createServerSupabaseClientMock.mockResolvedValue(buildClient());

    await expect(resolveToroContext({ mode: "personal" })).resolves.toMatchObject({
      userId: USER_ID,
      mode: "personal",
      orgId: null,
      availableOrgIds: [],
      allowedDataScopes: ["personal", "shared", "system"],
      canUsePersonalVault: true,
      canUseOrganizationData: false,
      requiresContextChoice: false,
    });
  });

  it("resolves the only active organization from user_roles during transition", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      buildClient({
        roleRows: [{ org_id: ORG_A, roles: { code: "GERENCIA" } }],
        employeeRowsByOrg: {
          [ORG_A]: [{
            id: "employee-a",
            preferred_name: "Alex",
            position_id: "position-a",
            work_area: "Recepción",
            positions: { code: "RECEPTION", name: "Recepción" },
          }],
        },
      }),
    );

    await expect(resolveToroContext()).resolves.toMatchObject({
      mode: "organization",
      orgId: ORG_A,
      membership: {
        orgId: ORG_A,
        membershipType: "employee",
        status: "active",
        roles: ["GERENCIA"],
        employeeId: "employee-a",
        employeePreferredName: "Alex",
        positionId: "position-a",
        positionCode: "RECEPTION",
        positionName: "Recepción",
        workArea: "Recepción",
        source: "legacy_user_roles",
      },
      allowedDataScopes: ["work_private", "work_org", "shared", "system"],
      canUsePersonalVault: false,
      canUseOrganizationData: true,
      requiresContextChoice: false,
    });
  });

  it("requires an explicit choice when the user belongs to multiple organizations", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      buildClient({
        roleRows: [
          { org_id: ORG_A, roles: { code: "ADMIN" } },
          { org_id: ORG_B, roles: { code: "GERENCIA" } },
        ],
      }),
    );

    await expect(resolveToroContext()).resolves.toMatchObject({
      mode: "organization",
      orgId: null,
      availableOrgIds: [ORG_A, ORG_B],
      allowedDataScopes: ["system"],
      canUsePersonalVault: false,
      canUseOrganizationData: false,
      requiresContextChoice: true,
    });
  });

  it("resolves the requested organization when it is an active membership", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      buildClient({
        roleRows: [
          { org_id: ORG_A, roles: { code: "ADMIN" } },
          { org_id: ORG_B, roles: { code: "CONTABILIDAD" } },
        ],
      }),
    );

    await expect(
      resolveToroContext({ mode: "organization", orgId: ORG_B }),
    ).resolves.toMatchObject({
      orgId: ORG_B,
      membership: {
        roles: ["CONTABILIDAD"],
        source: "legacy_user_roles",
      },
      canUsePersonalVault: false,
      canUseOrganizationData: true,
    });
  });

  it("fails closed for a requested organization without active membership", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      buildClient({
        roleRows: [{ org_id: ORG_A, roles: { code: "ADMIN" } }],
      }),
    );

    await expect(
      resolveToroContext({ mode: "organization", orgId: ORG_B }),
    ).resolves.toBeNull();
  });

  it("never unlocks personal scope from an ADMIN role", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      buildClient({
        roleRows: [{ org_id: ORG_A, roles: { code: "ADMIN" } }],
      }),
    );

    const context = await resolveToroContext({
      mode: "organization",
      orgId: ORG_A,
    });

    expect(context?.allowedDataScopes).not.toContain("personal");
    expect(context?.canUsePersonalVault).toBe(false);
  });

  it("keeps personal context available when organization-role lookup fails", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      buildClient({
        roleRows: null,
        roleError: { message: "synthetic role failure" },
      }),
    );

    await expect(
      resolveToroContext({ mode: "personal" }),
    ).resolves.toMatchObject({
      mode: "personal",
      orgId: null,
      availableOrgIds: [],
      allowedDataScopes: ["personal", "shared", "system"],
      canUsePersonalVault: true,
      canUseOrganizationData: false,
      requiresContextChoice: false,
    });
  });

  it("fails closed when role membership data cannot be read", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      buildClient({
        roleRows: null,
        roleError: { message: "synthetic role failure" },
      }),
    );

    await expect(resolveToroContext()).resolves.toBeNull();
  });

  it("fails closed when employee relationship lookup errors", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      buildClient({
        roleRows: [{ org_id: ORG_A, roles: { code: "GERENCIA" } }],
        employeeError: true,
      }),
    );

    await expect(
      resolveToroContext({ mode: "organization", orgId: ORG_A }),
    ).resolves.toBeNull();
  });
});
