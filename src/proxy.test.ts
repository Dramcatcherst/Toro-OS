import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
// This installed Next version still exports the legacy test-helper name.
import { unstable_doesMiddlewareMatch as unstable_doesProxyMatch } from "next/experimental/testing/server";
import { config, proxy } from "./proxy";

beforeEach(() => vi.stubEnv("TORO_DEPLOYMENT_MODE", undefined));
afterEach(() => vi.unstubAllEnvs());

const closed = ["/api/approvals", "/api/connectors/airtable?tableId=fake", "/api/connectors/vercel",
  "/api/brain/context", "/api/brain/internal-work", "/api/brain/owner-attention",
  "/api/connector-health", "/api/agent/prepare", "/api/modules", "/api/policy/evaluate",
  "/api/connectors/dropbox", "/api/connectors/github-codex", "/login", "/modules",
  "/modules/toro", "/my-toro", "/onboarding", "/booking-assist", "/dreamcatcher",
  "/experience-lab", "/private.pdf", "/_next/image?url=https://synthetic.invalid/a",
  "/_next/data/fake/index.json", "/brain/../api/approvals", "/%61pi/approvals"];

describe.each([false, true])("public perimeter, session cookie %s", (session) => {
  it.each(closed)("blocks %s for GET/POST before route handling", async (path) => {
    for (const method of ["GET", "POST"]) {
      const request = new NextRequest(`https://demo.invalid${path}`, {
        method, headers: session ? { cookie: "session=synthetic; TORO_DEPLOYMENT_MODE=internal" } : {},
      });
      expect(unstable_doesProxyMatch({ config, nextConfig: {}, url: request.url })).toBe(true);
      const response = proxy(request);
      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("set-cookie")).toBeNull();
      expect(await response.json()).toEqual(path === "/api/brain/owner-attention" && method === "GET"
        ? { state: "disabled", ownerAttentionAllowed: false }
        : { state: "public_demo", operationalAccess: false });
    }
  });
});

it.each(["/brain", "/favicon.ico", "/_next/static/chunks/fake.js"])("allows safe GET/HEAD to %s, not POST", (path) => {
  for (const method of ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"]) {
    const request = new NextRequest(`https://demo.invalid${path}`, { method, headers: { "Next-Action": "fake-action" } });
    expect(unstable_doesProxyMatch({ config, nextConfig: {}, url: request.url })).toBe(true);
    expect(proxy(request).status).toBe(["GET", "HEAD"].includes(method) ? 200 : 503);
  }
});

it("redirects root without copying arbitrary query parameters", () => {
  const response = proxy(new NextRequest("https://demo.invalid/?next=/api/approvals&mode=internal"));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://demo.invalid/brain");
});

it("internal mode delegates to existing authorization, not a fabricated demo session", () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  expect(proxy(new NextRequest("https://demo.invalid/api/brain/context")).headers.get("x-middleware-next")).toBe("1");
});
