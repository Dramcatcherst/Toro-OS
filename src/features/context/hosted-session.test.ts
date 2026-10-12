import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveToroContextWithSupabase } from "./resolver";

const userId = "00000000-0000-4000-8000-000000000001";
const orgA = "00000000-0000-4000-8000-0000000000aa";
const orgB = "00000000-0000-4000-8000-0000000000bb";
function fixture({ force = false, roleRows = [{ org_id: orgA, roles: { code: "GERENCIA" } }], allowed = true }: {
  force?: boolean; roleRows?: unknown; allowed?: boolean;
} = {}) {
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: userId, email: null, app_metadata: { force_password_change: force } } }, error: null });
  const rpc = vi.fn().mockResolvedValue({ data: { allowed }, error: null });
  const eq = vi.fn();
  const from = vi.fn((table: string) => {
    const query = { select: vi.fn(), eq, is: vi.fn(), limit: vi.fn() };
    query.select.mockReturnValue(query); eq.mockReturnValue(query);
    query.is.mockImplementation(() => table === "user_roles" ? Promise.resolve({ data: roleRows, error: null }) : query);
    query.limit.mockResolvedValue({ data: [], error: null });
    return query;
  });
  return { client: { auth: { getUser }, rpc, from } as unknown as SupabaseClient, getUser, rpc, from, eq };
}
beforeEach(() => { vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal"); vi.stubGlobal("fetch", () => { throw new Error("network forbidden"); }); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("Portal identity remains subject to DreamTeam session revocation", () => {
  it("checks Auth, session and active/non-revoked roles before resolving the organization", async () => {
    const test = fixture();
    const result = await resolveToroContextWithSupabase(test.client);
    expect(result).toMatchObject({ userId, orgId: orgA, canUseOrganizationData: true, membership: { status: "active", roles: ["GERENCIA"] } });
    expect(test.eq).toHaveBeenCalledWith("user_id", userId); expect(test.eq).toHaveBeenCalledWith("status", "active");
    expect(test.rpc).toHaveBeenCalledWith("enforce_user_session", { p_user_agent_hash: null, p_network_hash: null });
    expect(test.getUser.mock.invocationCallOrder[0]).toBeLessThan(test.rpc.mock.invocationCallOrder[0]);
    expect(test.rpc.mock.invocationCallOrder[0]).toBeLessThan(test.from.mock.invocationCallOrder[0]);
  });
  it.each(["missing", "expired"])("rejects %s Auth identity before any session/role query", async reason => {
    const test = fixture(); test.getUser.mockResolvedValue({ data: { user: null }, error: reason === "expired" ? { message: "expired" } : null });
    expect(await resolveToroContextWithSupabase(test.client)).toBeNull(); expect(test.rpc).not.toHaveBeenCalled(); expect(test.from).not.toHaveBeenCalled();
  });
  it("does not bypass a required password change", async () => {
    const test = fixture({ force: true });
    expect(await resolveToroContextWithSupabase(test.client)).toBeNull(); expect(test.rpc).not.toHaveBeenCalled(); expect(test.from).not.toHaveBeenCalled();
  });
  it("rejects a revoked/timed-out session before any organization read", async () => {
    const test = fixture({ allowed: false });
    expect(await resolveToroContextWithSupabase(test.client)).toBeNull(); expect(test.from).not.toHaveBeenCalled();
  });
  it("does not turn policy transport failure into a readable context", async () => {
    const test = fixture(); test.rpc.mockRejectedValue(new Error("private exception"));
    expect(await resolveToroContextWithSupabase(test.client)).toBeNull(); expect(test.from).not.toHaveBeenCalled();
  });
  it.each([{ roleRows: [] }, { roleRows: [{ org_id: orgA, roles: { code: "service_role" } }] }])("rejects missing/noncanonical memberships %j", async ({ roleRows }) => {
    const test = fixture({ roleRows }); expect(await resolveToroContextWithSupabase(test.client)).toBeNull();
  });
  it("never substitutes another organization and preserves explicit context choice", async () => {
    const single = fixture(); expect(await resolveToroContextWithSupabase(single.client, { orgId: orgB })).toBeNull();
    const multi = fixture({ roleRows: [{ org_id: orgA, roles: { code: "ADMIN" } }, { org_id: orgB, roles: { code: "GERENCIA" } }] });
    expect(await resolveToroContextWithSupabase(multi.client)).toMatchObject({ orgId: null, requiresContextChoice: true, canUseOrganizationData: false, membership: null });
    expect(multi.from).not.toHaveBeenCalledWith("employees");
  });
  it("rechecks session policy on every private resolution", async () => {
    const test = fixture(); expect(await resolveToroContextWithSupabase(test.client)).not.toBeNull();
    test.rpc.mockResolvedValue({ data: { allowed: false, reason: "revoked" }, error: null });
    expect(await resolveToroContextWithSupabase(test.client)).toBeNull(); expect(test.rpc).toHaveBeenCalledTimes(2);
  });
  it("preserves the existing internal runtime while the extra hosted-session guard is Portal-only", async () => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal"); const test = fixture({ allowed: false });
    expect(await resolveToroContextWithSupabase(test.client)).not.toBeNull(); expect(test.rpc).not.toHaveBeenCalled();
  });
});
