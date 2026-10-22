import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Runtime import permits the RED check before this new endpoint exists.
const endpoint = "./route";
const cookie = "sb-abtyrbqlqbsastmridzp-auth-token";
beforeEach(() => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("provider unavailable"); }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function request(headers: Record<string, string> = {}) {
  return new NextRequest("https://toro.invalid/api/auth/logout", { method: "POST", headers: {
    origin: "https://toro.invalid", "sec-fetch-site": "same-origin",
    cookie: `${cookie}=synthetic; ${cookie}.0=part0; ${cookie}.8=part8; toro_active_organization_v1=synthetic-preference; sb-other-auth-token=other-project; theme=night`,
    ...headers,
  } });
}

it("clears only this project's host cookies and context even when Auth is unavailable", async () => {
  const { POST } = await import(endpoint);
  const response = await POST(request());
  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe("https://toro.invalid/login?next=/portal");
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.cookies.getAll().map((item: { name: string }) => item.name).sort()).toEqual([
    cookie, `${cookie}.0`, `${cookie}.8`, "toro_active_organization_v1",
  ].sort());
  for (const cleared of response.cookies.getAll()) {
    expect(cleared).toMatchObject({ value: "", path: "/", secure: true, maxAge: 0, sameSite: "lax" });
    expect(cleared.domain).toBeUndefined();
  }
  expect(fetch).not.toHaveBeenCalled();
});

it.each([{ origin: "https://outside.invalid" }, { origin: "" }, { "sec-fetch-site": "cross-site" }, { "Next-Action": "synthetic" }] as Record<string, string>[])("rejects a logout outside the same-origin boundary: %j", async headers => {
  const { POST } = await import(endpoint);
  const response = await POST(request(headers));
  expect(response.status).toBe(403);
  expect(response.headers.get("set-cookie")).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});

it("keeps local logout unavailable in public demo", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", undefined);
  const { POST } = await import(endpoint);
  const response = await POST(request());
  expect(response.status).toBe(404);
  expect(response.headers.get("set-cookie")).toBeNull();
});
