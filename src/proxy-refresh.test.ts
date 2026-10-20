import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("@/lib/supabase/portal-refresh", () => ({ refreshPortalSession: refresh }));
import { proxy } from "./proxy";

beforeEach(() => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  refresh.mockReset().mockImplementation(async (_request, response) => response);
});
afterEach(() => vi.unstubAllEnvs());

it("refreshes only an admitted private read with an Auth cookie, leaving identity to the guarded reader", async () => {
  const response = await proxy(new NextRequest("https://toro.invalid/portal", {
    headers: { cookie: "sb-abtyrbqlqbsastmridzp-auth-token.0=synthetic-untrusted" },
  }));
  expect(response.headers.get("x-middleware-next")).toBe("1");
  expect(refresh).toHaveBeenCalledOnce();
});

it.each(["/login", "/booking-assist", "/brand/tools/kross.png", "/_next/static/app.js", "/api/approvals", "/.env", "/%70ortal"])("does not refresh an asset, login or rejected route %s", async path => {
  await proxy(new NextRequest(`https://toro.invalid${path}`, { headers: { cookie: "sb-abtyrbqlqbsastmridzp-auth-token=synthetic" } }));
  expect(refresh).not.toHaveBeenCalled();
});

it("allows only POST to the bounded authentication handler, preserving the closed writer perimeter", async () => {
  expect((await proxy(new NextRequest("https://toro.invalid/api/auth/login", { method: "POST" }))).headers.get("x-middleware-next")).toBe("1");
  expect(refresh).not.toHaveBeenCalled();
  for (const method of ["GET", "HEAD", "PUT", "DELETE", "OPTIONS"]) {
    expect((await proxy(new NextRequest("https://toro.invalid/api/auth/login", { method }))).status).toBe(404);
  }
  expect((await proxy(new NextRequest("https://toro.invalid/api/auth/login", {
    method: "POST", headers: { "Next-Action": "synthetic" },
  }))).status).toBe(404);
  expect((await proxy(new NextRequest("https://toro.invalid/api/brain/internal-work", { method: "POST" }))).status).toBe(404);
});

it("refreshes a session only for a same-origin exact context-selection POST", async () => {
  const cookie = "sb-abtyrbqlqbsastmridzp-auth-token.0=synthetic-untrusted";
  const accepted = await proxy(new NextRequest("https://toro.invalid/api/brain/context/selection", {
    method: "POST",
    headers: { cookie, origin: "https://toro.invalid", "sec-fetch-site": "same-origin" },
  }));
  expect(accepted.headers.get("x-middleware-next")).toBe("1");
  expect(refresh).toHaveBeenCalledOnce();

  refresh.mockClear();
  await proxy(new NextRequest("https://toro.invalid/api/brain/context/selection", {
    method: "POST",
    headers: { cookie, origin: "https://attacker.invalid", "sec-fetch-site": "cross-site" },
  }));
  expect(refresh).not.toHaveBeenCalled();
});

it("does not treat an arbitrary cookie as a reason to refresh or grant access", async () => {
  await proxy(new NextRequest("https://toro.invalid/portal", { headers: { cookie: "role=ADMIN; session=fake" } }));
  expect(refresh).not.toHaveBeenCalled();
});
