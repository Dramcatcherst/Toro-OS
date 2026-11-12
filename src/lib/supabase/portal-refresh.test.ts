import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
const { create, config } = vi.hoisted(() => ({ create: vi.fn(), config: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: create }));
vi.mock("./env", () => ({ getSupabasePublicConfig: config }));
import { refreshPortalSession } from "./portal-refresh";

beforeEach(() => { create.mockReset(); config.mockReset().mockReturnValue({ url: "https://synthetic.supabase.co", publishableKey: "public-synthetic" }); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("validates with Auth and delivers refreshed cookies to both the request and response without a shared domain", async () => {
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: "synthetic" } }, error: null });
  create.mockImplementation((_url, _key, { cookies }) => {
    getUser.mockImplementation(async () => {
      cookies.setAll([{ name: "sb-synthetic-auth-token", value: "synthetic-refreshed", options: { domain: ".invalid", path: "/private", maxAge: 999999 } }]);
      return { data: { user: { id: "synthetic" } }, error: null };
    });
    return { auth: { getUser } };
  });
  const request = new NextRequest("https://toro.invalid/portal", { headers: { cookie: "sb-synthetic-auth-token=synthetic-old" } });
  const original = NextResponse.next({ headers: { "Content-Security-Policy": "frame-ancestors 'none'", "X-Frame-Options": "DENY" } });
  const response = await refreshPortalSession(request, original);
  expect(getUser).toHaveBeenCalledOnce();
  expect(request.cookies.get("sb-synthetic-auth-token")?.value).toBe("synthetic-refreshed");
  expect(response.cookies.get("sb-synthetic-auth-token")).toMatchObject({ path: "/", secure: true, sameSite: "lax", maxAge: 43200 });
  expect(response.headers.get("set-cookie")).not.toContain("Domain=");
  expect(response.headers.get("x-middleware-request-cookie")).toContain("synthetic-refreshed");
  expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
  expect(response.headers.get("content-security-policy")).toBe("frame-ancestors 'none'");
  expect(response.headers.get("x-frame-options")).toBe("DENY");
});

it("does not invent an identity or emit cookies when Auth fails", async () => {
  create.mockReturnValue({ auth: { getUser: vi.fn().mockRejectedValue(new Error("synthetic provider failure")) } });
  const response = await refreshPortalSession(new NextRequest("https://toro.invalid/portal"), NextResponse.next());
  expect(response.headers.get("set-cookie")).toBeNull();
  expect(response.headers.get("cache-control")).toContain("no-store");
});

it("releases private requests after a bounded Auth refresh and aborts its transport", async () => {
  vi.useFakeTimers();
  let transportSignal: AbortSignal | undefined;
  vi.stubGlobal("fetch", (_url: string, options?: RequestInit) => {
    transportSignal = options?.signal as AbortSignal;
    return new Promise((_resolve, reject) => options?.signal?.addEventListener("abort", () => reject(new Error("synthetic timeout")), { once: true }));
  });
  create.mockImplementation((_url, _key, options) => ({ auth: { getUser: () => (options.global?.fetch ?? fetch)("https://synthetic.supabase.co/auth/v1/user") } }));
  let response: NextResponse | undefined;
  const pending = refreshPortalSession(new NextRequest("https://toro.invalid/portal"), NextResponse.next()).then(value => { response = value; });
  await vi.advanceTimersByTimeAsync(3_001);
  expect(response?.headers.get("cache-control")).toContain("no-store");
  expect(transportSignal?.aborted).toBe(true);
  expect(response?.headers.get("set-cookie")).toBeNull();
  await pending;
});
