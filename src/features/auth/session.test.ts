import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { getToroSession } from "./session";

type SyntheticUser = {
  id: string;
  email: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
};

type SyntheticClientOptions = {
  user: SyntheticUser | null;
  userError?: { message: string } | null;
  roleRows?: unknown;
  roleError?: { message: string } | null;
};

function syntheticUser(appMetadata: Record<string, unknown> = {}): SyntheticUser {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    email: "synthetic@example.invalid",
    app_metadata: appMetadata,
    user_metadata: { display_name: "Synthetic QA" },
  };
}

function buildSyntheticClient({
  user,
  userError = null,
  roleRows = [],
  roleError = null,
}: SyntheticClientOptions) {
  const getUser = vi.fn().mockResolvedValue({
    data: { user },
    error: userError,
  });

  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.is.mockResolvedValue({ data: roleRows, error: roleError });

  const from = vi.fn().mockReturnValue(query);
  return {
    client: { auth: { getUser }, from },
    from,
    getUser,
    query,
  };
}

describe("getToroSession synthetic request boundaries", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("revalidates auth on each resolver call (new-request equivalent, NOT browser persistence proof)", async () => {
    const authenticated = buildSyntheticClient({
      user: syntheticUser(),
      roleRows: [{ roles: { code: "GERENCIA" } }],
    });
    const signedOut = buildSyntheticClient({ user: null });
    createServerSupabaseClientMock
      .mockResolvedValueOnce(authenticated.client)
      .mockResolvedValueOnce(signedOut.client);

    await expect(getToroSession()).resolves.toMatchObject({ role: "GERENCIA" });
    await expect(getToroSession()).resolves.toBeNull();

    expect(createServerSupabaseClientMock).toHaveBeenCalledTimes(2);
    expect(authenticated.getUser).toHaveBeenCalledTimes(1);
    expect(signedOut.getUser).toHaveBeenCalledTimes(1);
    expect(signedOut.from).not.toHaveBeenCalled();
  });

  it("rechecks membership on a reload-equivalent resolver call and drops an implicit role after revocation (NOT browser persistence proof)", async () => {
    const active = buildSyntheticClient({
      user: syntheticUser(),
      roleRows: [{ roles: { code: "GERENCIA" } }],
    });
    const revoked = buildSyntheticClient({
      user: syntheticUser(),
      roleRows: [],
    });
    createServerSupabaseClientMock
      .mockResolvedValueOnce(active.client)
      .mockResolvedValueOnce(revoked.client);

    await expect(getToroSession()).resolves.toMatchObject({ role: "GERENCIA" });
    await expect(getToroSession()).resolves.toBeNull();

    expect(active.from).toHaveBeenCalledWith("user_roles");
    expect(revoked.from).toHaveBeenCalledWith("user_roles");
  });

  it("queries only active, non-revoked membership rows for the authenticated user", async () => {
    const active = buildSyntheticClient({
      user: syntheticUser(),
      roleRows: [{ roles: [{ code: "GERENCIA" }] }],
    });
    createServerSupabaseClientMock.mockResolvedValue(active.client);

    await expect(getToroSession()).resolves.toMatchObject({ role: "GERENCIA" });

    expect(active.query.eq).toHaveBeenNthCalledWith(
      1,
      "user_id",
      "00000000-0000-4000-8000-000000000001",
    );
    expect(active.query.eq).toHaveBeenNthCalledWith(2, "status", "active");
    expect(active.query.is).toHaveBeenCalledWith("revoked_at", null);
  });

  it("preserves explicit FOUNDER only when paired with an active ADMIN membership row", async () => {
    const founder = buildSyntheticClient({
      user: syntheticUser({ toro_role: "FOUNDER" }),
      roleRows: [{ roles: { code: "ADMIN" } }],
    });
    createServerSupabaseClientMock.mockResolvedValue(founder.client);

    await expect(getToroSession()).resolves.toMatchObject({ role: "FOUNDER" });
    expect(founder.query.eq).toHaveBeenCalledWith("status", "active");
    expect(founder.query.is).toHaveBeenCalledWith("revoked_at", null);
  });

  it("preserves explicit FOUNDER when paired with an active GERENCIA membership row", async () => {
    const founder = buildSyntheticClient({
      user: syntheticUser({ toro_role: "FOUNDER" }),
      roleRows: [{ roles: { code: "GERENCIA" } }],
    });
    createServerSupabaseClientMock.mockResolvedValue(founder.client);

    await expect(getToroSession()).resolves.toMatchObject({ role: "FOUNDER" });
  });

  it("preserves a supported non-Founder metadata role with a valid active membership relation", async () => {
    const reception = buildSyntheticClient({
      user: syntheticUser({ toro_role: "RECEPCION" }),
      roleRows: [{ roles: { code: "EMPLOYEE" } }],
    });
    createServerSupabaseClientMock.mockResolvedValue(reception.client);

    await expect(getToroSession()).resolves.toMatchObject({ role: "RECEPCION" });
  });
});

describe("getToroSession fail-closed membership contract", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("denies FOUNDER metadata when the active membership query returns no rows", async () => {
    const client = buildSyntheticClient({
      user: syntheticUser({ toro_role: "FOUNDER" }),
      roleRows: [],
    });
    createServerSupabaseClientMock.mockResolvedValue(client.client);

    await expect(getToroSession()).resolves.toBeNull();
  });

  it("denies FOUNDER metadata when a revoked membership is filtered out", async () => {
    const client = buildSyntheticClient({
      user: syntheticUser({ toro_role: "FOUNDER" }),
      roleRows: [],
    });
    createServerSupabaseClientMock.mockResolvedValue(client.client);

    await expect(getToroSession()).resolves.toBeNull();
    expect(client.query.eq).toHaveBeenCalledWith("status", "active");
    expect(client.query.is).toHaveBeenCalledWith("revoked_at", null);
  });

  it("denies metadata-derived roles when the membership query errors", async () => {
    const client = buildSyntheticClient({
      user: syntheticUser({ toro_role: "FOUNDER" }),
      roleRows: null,
      roleError: { message: "synthetic membership read failure" },
    });
    createServerSupabaseClientMock.mockResolvedValue(client.client);

    await expect(getToroSession()).resolves.toBeNull();
  });

  it("denies app_metadata role_codes when no active membership row exists", async () => {
    const client = buildSyntheticClient({
      user: syntheticUser({ role_codes: ["GERENCIA"] }),
      roleRows: [],
    });
    createServerSupabaseClientMock.mockResolvedValue(client.client);

    await expect(getToroSession()).resolves.toBeNull();
  });

  it("does not elevate an active ADMIN membership to FOUNDER without explicit metadata", async () => {
    const client = buildSyntheticClient({
      user: syntheticUser(),
      roleRows: [{ roles: { code: "ADMIN" } }],
    });
    createServerSupabaseClientMock.mockResolvedValue(client.client);

    await expect(getToroSession()).resolves.toBeNull();
  });

  it("denies explicit FOUNDER with an active but non-privileged membership", async () => {
    const client = buildSyntheticClient({
      user: syntheticUser({ toro_role: "FOUNDER" }),
      roleRows: [{ roles: { code: "CONTABILIDAD" } }],
    });
    createServerSupabaseClientMock.mockResolvedValue(client.client);

    await expect(getToroSession()).resolves.toBeNull();
  });

  it.each([
    ["non-array query data", { roleRows: { roles: { code: "GERENCIA" } } }],
    ["null relation", { roleRows: [{ roles: null }] }],
    ["empty relation array", { roleRows: [{ roles: [] }] }],
    ["blank membership code", { roleRows: [{ roles: { code: "   " } }] }],
    ["non-string membership code", { roleRows: [{ roles: { code: 7 } }] }],
  ])("denies metadata roles for malformed membership data: %s", async (_label, fixture) => {
    const client = buildSyntheticClient({
      user: syntheticUser({ toro_role: "GERENCIA" }),
      ...fixture,
    });
    createServerSupabaseClientMock.mockResolvedValue(client.client);

    await expect(getToroSession()).resolves.toBeNull();
  });
});
