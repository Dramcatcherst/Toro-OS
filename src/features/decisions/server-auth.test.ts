import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, redirect } = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: createClient }));
vi.mock("next/navigation", () => ({ redirect }));

// Keep the real session resolver and role policy; replace only network boundaries.
import { listMyDecisions } from "./server";

const user = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "synthetic@example.invalid",
  app_metadata: { toro_role: "FOUNDER" },
  user_metadata: { display_name: "Synthetic QA" },
};

function fixture({
  identity = user as typeof user | null,
  userError = null as { message: string } | null,
  memberships = [{ roles: { code: "ADMIN" } }] as unknown,
  membershipError = null as { message: string } | null,
} = {}) {
  const getUser = vi.fn().mockResolvedValue({ data: { user: identity }, error: userError });
  const query = { select: vi.fn(), eq: vi.fn(), is: vi.fn() };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.is.mockResolvedValue({ data: memberships, error: membershipError });
  const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
  const from = vi.fn().mockReturnValue(query);
  createClient.mockResolvedValue({ auth: { getUser }, from, rpc });
  return { getUser, query, rpc, from };
}

describe("decision DAL session boundary", () => {
  beforeEach(() => {
    createClient.mockReset();
    redirect.mockClear();
  });

  it.each([
    ["absent identity", { identity: null }],
    ["identity error", { userError: { message: "synthetic auth rejection" } }],
    ["missing or filtered-out revoked membership", { memberships: [] }],
    ["membership query error", { membershipError: { message: "synthetic query failure" } }],
    ["malformed membership", { memberships: [{ roles: null }] }],
    ["Founder without privileged membership", { memberships: [{ roles: { code: "CONTABILIDAD" } }] }],
    ["ADMIN alone is not Founder", { identity: { ...user, app_metadata: { toro_role: "" } } }],
  ])("redirects and never queries decisions with %s", async (_name, options) => {
    const client = fixture(options);

    await expect(listMyDecisions({})).rejects.toThrow("REDIRECT:/login?next=/toro");
    expect(client.rpc).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login?next=/toro");
  });

  it("propagates an unavailable identity service without querying decisions", async () => {
    const client = fixture();
    client.getUser.mockRejectedValue(new Error("synthetic auth unavailable"));

    await expect(listMyDecisions({})).rejects.toThrow("synthetic auth unavailable");
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("checks authenticated identity and active membership before the RPC", async () => {
    const client = fixture();

    await expect(listMyDecisions({ limit: 20 })).resolves.toEqual([]);
    expect(client.query.eq).toHaveBeenCalledWith("user_id", user.id);
    expect(client.query.eq).toHaveBeenCalledWith("status", "active");
    expect(client.query.is).toHaveBeenCalledWith("revoked_at", null);
    expect(client.getUser.mock.invocationCallOrder[0]).toBeLessThan(client.rpc.mock.invocationCallOrder[0]);
    expect(client.query.is.mock.invocationCallOrder[0]).toBeLessThan(client.rpc.mock.invocationCallOrder[0]);
    expect(client.rpc).toHaveBeenCalledExactlyOnceWith("list_my_decisions", { p_limit: 20 });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("does not bypass SQL authorization after a valid session", async () => {
    const client = fixture();
    client.rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });

    await expect(listMyDecisions({})).rejects.toThrow("permission denied");
    expect(client.getUser).toHaveBeenCalledOnce();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("rechecks membership on the next call and stops when it is revoked", async () => {
    const client = fixture();
    await expect(listMyDecisions({})).resolves.toEqual([]);
    client.query.is.mockResolvedValue({ data: [], error: null });

    await expect(listMyDecisions({})).rejects.toThrow("REDIRECT:/login?next=/toro");
    expect(client.getUser).toHaveBeenCalledTimes(2);
    expect(client.rpc).toHaveBeenCalledOnce();
  });
});
