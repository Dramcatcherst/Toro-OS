import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";

const mocks = vi.hoisted(() => ({ sdk: vi.fn(), context: vi.fn(), fetch: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.sdk }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContextWithSupabase: mocks.context }));
import { DREAMTEAM_LOGIN_ENDPOINT, dreamTeamLogin } from "./dreamteam-login";

const origin = "https://toro.invalid";
const cookie = "sb-abtyrbqlqbsastmridzp-auth-token";
const client = { fixture: "fresh-client" };
const credentials = { identifier: "synthetic-user", password: "Synthetic-password-fixture", nextPath: "/portal" };
const context: ToroResolvedContext = { userId: "00000000-0000-4000-8000-000000000001", email: null,
  displayName: "Synthetic", mode: "organization", orgId: "00000000-0000-4000-8000-0000000000aa",
  membership: { orgId: "00000000-0000-4000-8000-0000000000aa", membershipId: null, membershipType: null,
    status: "active", roles: ["GERENCIA"], employeeId: null, source: "legacy_user_roles" },
  availableOrgIds: ["00000000-0000-4000-8000-0000000000aa"], allowedDataScopes: ["work_org"], allowedTools: [],
  canUsePersonalVault: false, canUseOrganizationData: true, requiresContextChoice: false };

function request(body: unknown = credentials, headers: Record<string, string> = {}, method = "POST") {
  return new Request(`${origin}/api/auth/login`, { method,
    headers: { origin, "content-type": "application/json", ...headers },
    ...(["GET", "HEAD"].includes(method) ? {} : { body: JSON.stringify(body) }) });
}
function upstream({ status = 200, body = JSON.stringify({ ok: true, nextPath: "/" }), cookies = [`${cookie}=synthetic-fresh-cookie; Path=/; Domain=dream-team-public.vercel.app; SameSite=None`], retryAfter }: {
  status?: number; body?: string; cookies?: string[]; retryAfter?: string;
} = {}) {
  const headers = new Headers({ "content-type": "application/json" });
  for (const value of cookies) headers.append("set-cookie", value);
  if (retryAfter) headers.set("retry-after", retryAfter);
  return new Response(body, { status, headers });
}
async function failure(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
  expect(response.headers.get("set-cookie")).toBeNull();
  const body = JSON.stringify(await response.json());
  expect(body).not.toContain(credentials.identifier);
  expect(body).not.toContain(credentials.password);
  expect(body).not.toContain("synthetic-fresh-cookie");
  expect(body).not.toContain("private-upstream-detail");
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abtyrbqlqbsastmridzp.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "synthetic-public-config");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", undefined);
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.fetch.mockImplementation(async () => upstream());
  mocks.sdk.mockReturnValue(client); mocks.context.mockResolvedValue(context);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("fresh DreamTeam login adapter", () => {
  it("uses the authoritative fixed destination and forwards neither an existing session nor caller-controlled headers", async () => {
    const response = await dreamTeamLogin(request(credentials, {
      cookie: `${cookie}.2=old-portal-chunk; unrelated=fixture`, authorization: "Bearer caller-fixture",
      "x-forwarded-for": "192.0.2.10", "user-agent": "caller-agent", "x-provider": "https://attacker.invalid",
    }));
    expect(response.status).toBe(200);
    expect(mocks.fetch).toHaveBeenCalledOnce();
    const [url, options] = mocks.fetch.mock.calls[0];
    expect(url).toBe(DREAMTEAM_LOGIN_ENDPOINT);
    expect(options).toMatchObject({ method: "POST", redirect: "error", cache: "no-store",
      headers: { "Content-Type": "application/json", "User-Agent": "TORO-Portal-Identity/1" } });
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(Object.keys(options.headers)).toEqual(["Content-Type", "User-Agent"]);
    expect(JSON.parse(options.body)).toEqual({ identifier: credentials.identifier, password: credentials.password, nextPath: "/" });
    expect(mocks.context).toHaveBeenCalledWith(client, {}, undefined, expect.any(Function));
    expect(await response.json()).toEqual({ ok: true, nextPath: "/portal" });
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    const issued = response.cookies.getAll();
    expect(issued.find(item => item.name === cookie)).toMatchObject({ value: "synthetic-fresh-cookie", path: "/", secure: true, sameSite: "lax", httpOnly: false, maxAge: 43200 });
    expect(issued.find(item => item.name === cookie)?.domain).toBeUndefined();
    expect(issued.find(item => item.name === `${cookie}.2`)).toMatchObject({ value: "", maxAge: 0 });
    expect(issued.some(item => item.name === "unrelated")).toBe(false);
  });

  it("uses only matching provider cookies, accepts refresh updates, and never exposes them through JSON", async () => {
    mocks.fetch.mockImplementation(async () => upstream({ cookies: [`${cookie}.0=synthetic-part0; Path=/`, `${cookie}.1=synthetic-part1; Path=/`, "foreign=ignored; Domain=attacker.invalid"] }));
    mocks.context.mockImplementation(async () => {
      const options = mocks.sdk.mock.calls[0][2];
      expect(options.cookies.getAll()).toEqual([{ name: `${cookie}.0`, value: "synthetic-part0" }, { name: `${cookie}.1`, value: "synthetic-part1" }]);
      options.cookies.setAll([{ name: `${cookie}.0`, value: "synthetic-refreshed" }, { name: "foreign", value: "ignored" }]);
      return context;
    });
    const response = await dreamTeamLogin(request());
    expect(response.cookies.get(`${cookie}.0`)?.value).toBe("synthetic-refreshed");
    expect(response.cookies.get("foreign")).toBeUndefined();
    expect(JSON.stringify(await response.json())).not.toContain("synthetic-part");
  });

  it("preserves an existing password exactly and delegates username normalization to DreamTeam", async () => {
    await dreamTeamLogin(request({ ...credentials, identifier: " Synthetic-USER ", password: "  existing-password  " }));
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body)).toEqual({ identifier: "Synthetic-USER", password: "  existing-password  ", nextPath: "/" });
  });

  it.each([undefined, "internal", "PORTAL"])("rejects deployment mode %s before provider I/O", async mode => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", mode);
    await failure(await dreamTeamLogin(request()), 404); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it.each([{ origin: "https://attacker.invalid" }, { origin: "" }, { "content-type": "text/plain" }, { "Next-Action": "fixture" }] as Record<string, string>[])("rejects origin/media/action boundary %j before I/O", async headers => {
    await failure(await dreamTeamLogin(request(credentials, headers)), 403); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("rejects non-POST calls", async () => {
    await failure(await dreamTeamLogin(request(undefined, {}, "GET")), 403); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it.each([{ ...credentials, password: "" }, { ...credentials, identifier: "a" }, { ...credentials, provider: "https://attacker.invalid" }, { ...credentials, nextPath: "x".repeat(2100) }])("rejects malformed/extra/oversized input without I/O", async body => {
    await failure(await dreamTeamLogin(request(body)), 400); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("checks canonical Supabase origin before forwarding credentials", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://other-project.supabase.co");
    await failure(await dreamTeamLogin(request()), 503); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it.each([400, 401, 403])("sanitizes upstream rejection %s without issuing cookies", async status => {
    mocks.fetch.mockImplementation(async () => upstream({ status, body: JSON.stringify({ error: "private-upstream-detail" }) }));
    await failure(await dreamTeamLogin(request()), 401); expect(mocks.sdk).not.toHaveBeenCalled();
  });
  it.each([["45", "45"], ["invalid-date", "900"]])("preserves only a bounded numeric retry after %s", async (sent, expected) => {
    mocks.fetch.mockImplementation(async () => upstream({ status: 429, retryAfter: sent }));
    const response = await dreamTeamLogin(request());
    await failure(response, 429); expect(response.headers.get("retry-after")).toBe(expected); expect(mocks.sdk).not.toHaveBeenCalled();
  });
  it.each(["network", "redirect", "timeout"])("fails closed on %s without leaking diagnostics", async kind => {
    mocks.fetch.mockRejectedValue(new Error(`private-upstream-detail:${kind}`));
    await failure(await dreamTeamLogin(request()), 503); expect(mocks.sdk).not.toHaveBeenCalled();
  });
  it.each([{ status: 503 }, { body: "not-json" }, { body: "x".repeat(2049) }, { cookies: [] }, { cookies: ["sb-other-auth-token=synthetic"] }, { cookies: [`${cookie}=; Path=/`] }, { cookies: [`${cookie}=${"x".repeat(24001)}`] }, { cookies: Array.from({ length: 9 }, (_, index) => `foreign${index}=fixture`) }])("rejects unavailable/malformed/unbounded provider response %j", async options => {
    mocks.fetch.mockImplementation(async () => upstream(options));
    await failure(await dreamTeamLogin(request()), 503); expect(mocks.sdk).not.toHaveBeenCalled();
  });
  it("does not bypass required password replacement", async () => {
    mocks.fetch.mockImplementation(async () => upstream({ body: JSON.stringify({ ok: true, nextPath: "/actualizar-contrasena?required=1" }) }));
    await failure(await dreamTeamLogin(request()), 403); expect(mocks.sdk).not.toHaveBeenCalled();
  });
  it("does not issue cookies when canonical identity/session/role verification rejects the fresh session", async () => {
    mocks.context.mockResolvedValue(null);
    await failure(await dreamTeamLogin(request()), 403);
  });
  it("identifies a post-password verification failure without blaming the password or leaking provider/account details", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.context.mockImplementation(async (_client, _request, _token, diagnose) => {
      diagnose("auth_identity");
      return null;
    });
    const response = await dreamTeamLogin(request());
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toContain("La contraseña fue aceptada");
    expect(body.error).toContain("PV01");
    expect(JSON.stringify(body)).not.toContain(credentials.identifier);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(warning).toHaveBeenCalledExactlyOnceWith("[TORO portal login] verification failed", { code: "PV01" });
    warning.mockRestore();
  });
  it("retains explicit multi-organization choice instead of selecting an organization", async () => {
    mocks.context.mockResolvedValue({ ...context, orgId: null, membership: null, requiresContextChoice: true, canUseOrganizationData: false });
    const response = await dreamTeamLogin(request({ ...credentials, nextPath: "/\\attacker.invalid" }));
    expect(await response.json()).toEqual({ ok: true, nextPath: "/my-toro" });
  });
});
