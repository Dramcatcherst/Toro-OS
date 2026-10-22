import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
// This installed Next version still exports the legacy test-helper name.
import { unstable_doesMiddlewareMatch as unstable_doesProxyMatch } from "next/experimental/testing/server";
import { config, publicSurfaceDecision as proxy } from "./proxy";

beforeEach(() => vi.stubEnv("TORO_DEPLOYMENT_MODE", undefined));
afterEach(() => vi.unstubAllEnvs());

const closed = ["/api/approvals", "/api/connectors/airtable?tableId=fake", "/api/connectors/vercel",
  "/api/brain/context", "/api/brain/context/selection", "/api/brain/internal-work", "/api/brain/owner-attention",
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

it.each(["/brain", "/apple-icon.png", "/favicon.ico", "/icon.png", "/manifest.webmanifest", "/opengraph-image", "/robots.txt", "/twitter-image", "/_next/static/chunks/fake.js"])("allows safe GET/HEAD to %s, not POST", (path) => {
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

it.each(["portal", "internal", undefined])("prevents framing pages and denied responses in deployment %s", mode => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", mode);
  for (const path of ["/login", "/portal", "/brain", "/api/brain/context", "/api/approvals"]) {
    const response = proxy(new NextRequest(`https://toro.invalid${path}`));
    expect(response.headers.get("content-security-policy")).toBe("frame-ancestors 'none'");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("content-security-policy")).not.toContain("script-src");
  }
});

describe("published Portal perimeter", () => {
  beforeEach(() => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
    vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", "true");
    vi.stubEnv("TORO_INTERNAL_WORK_WRITE_ENABLED", "true");
  });

  it("admits only safe reads of the exact public TORO master asset", () => {
    const path = "/brand/toro/toro-logo-master-v1.jpg";
    for (const method of ["GET", "HEAD"]) {
      expect(proxy(new NextRequest(`https://toro.invalid${path}`, { method })).headers.get("x-middleware-next")).toBe("1");
    }
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      expect(proxy(new NextRequest(`https://toro.invalid${path}`, { method })).status).toBe(404);
    }
    expect(proxy(new NextRequest(`https://toro.invalid${path}`, { headers: { "Next-Action": "synthetic-action" } })).status).toBe(404);
    for (const sibling of ["/brand/toro/private.jpg", `${path}/extra`, "/brand/toro/provenance.json"]) {
      expect(proxy(new NextRequest(`https://toro.invalid${sibling}`)).status).toBe(404);
    }
    vi.stubEnv("TORO_DEPLOYMENT_MODE", undefined);
    expect(proxy(new NextRequest(`https://toro.invalid${path}`)).status).toBe(503);
  });

  it.each(["/login", "/portal", "/my-toro", "/my-toro/herramientas", "/brain", "/booking-assist", "/api/brain/context", "/api/brain/owner-attention", "/brand/tools/kross.png", "/brand/tools/wespeak.ico", "/brand/tools/dreamteam.svg", "/brand/tools/google.svg", "/brand/tools/dropbox.svg", "/apple-icon.png", "/favicon.ico", "/icon.png", "/manifest.webmanifest", "/opengraph-image", "/robots.txt", "/twitter-image", "/_next/static/chunks/app.js"])("delegates only safe reads to %s and leaves auth to its guarded reader", path => {
    for (const method of ["GET", "HEAD"]) {
      for (const cookie of ["", "session=synthetic-expired; TORO_DEPLOYMENT_MODE=internal"]) {
        const request = new NextRequest(`https://toro.invalid${path}`, { method, headers: { cookie } });
        expect(unstable_doesProxyMatch({ config, nextConfig: {}, url: request.url })).toBe(true);
        const response = proxy(request);
        expect(response.headers.get("x-middleware-next")).toBe("1");
        expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
        expect(response.headers.get("set-cookie")).toBeNull();
      }
    }
  });

  const denied = ["/api/approvals", "/api/connectors/airtable?tableId=private", "/api/connectors/vercel", "/api/connector-health", "/api/modules", "/api/agent/prepare", "/api/policy/evaluate", "/api/connectors/github-codex", "/api/connectors/dropbox", "/api/brain/internal-work", "/api/system/runtime-health", "/api/system/worker-canary", "/api/mcp", "/api/brain/context/extra", "/api/brain/new-reader", "/modules", "/modules/event-ops", "/onboarding", "/dreamcatcher", "/experience-lab", "/my-toro/private", "/private.pdf", "/.env", "/.git/config", "/_next/static/.env", "/_next/data/fake/portal.json", "/_next/image?url=https://private.invalid/", "/brand/tools/provenance.json", "/%70ortal", "/api%2fbrain/context", "/_next/static/%2e%2e/api/approvals"];
  it.each(denied)("rejects %s even with a session-looking cookie and inherited write flags", async path => {
    for (const method of ["GET", "HEAD", "POST"]) {
      const request = new NextRequest(`https://toro.invalid${path}`, { method, headers: { cookie: "session=synthetic; TORO_DEPLOYMENT_MODE=internal", "x-middleware-subrequest": "proxy:proxy:proxy" } });
      const response = proxy(request);
      expect(response.status).toBe(404);
      expect(response.headers.get("x-middleware-next")).toBeNull();
      expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
      expect(await response.json()).toEqual({ state: "portal_route_unavailable", operationalAccess: false });
    }
  });

  it.each(["/login", "/portal", "/my-toro", "/brain", "/api/brain/context", "/api/brain/owner-attention", "/_next/static/chunks/app.js"])("rejects writes and Server Action dispatch to %s", path => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      expect(proxy(new NextRequest(`https://toro.invalid${path}`, { method })).status).toBe(404);
    }
    for (const method of ["GET", "POST"]) {
      expect(proxy(new NextRequest(`https://toro.invalid${path}`, { method, headers: { "Next-Action": "synthetic-action" } })).status).toBe(404);
    }
  });

  it("admits only a plain POST to the exact context-selection endpoint", async () => {
    const path = "/api/brain/context/selection";
    const admitted = proxy(new NextRequest(`https://toro.invalid${path}`, { method: "POST" }));
    expect(admitted.headers.get("x-middleware-next")).toBe("1");
    expect(admitted.headers.get("cache-control")).toBe("private, no-store, max-age=0");

    for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      expect(proxy(new NextRequest(`https://toro.invalid${path}`, { method })).status).toBe(404);
    }
    expect(proxy(new NextRequest(`https://toro.invalid${path}`, {
      method: "POST",
      headers: { "Next-Action": "synthetic-action" },
    })).status).toBe(404);
    for (const suffix of ["/extra", "%2fextra", "/..%2Fcontext"]) {
      expect(proxy(new NextRequest(`https://toro.invalid${path}${suffix}`, { method: "POST" })).status).toBe(404);
    }
  });

  it("admits local logout as an exact POST without granting another auth route or write method", () => {
    const path = "/api/auth/logout";
    expect(proxy(new NextRequest(`https://toro.invalid${path}`, { method: "POST" })).headers.get("x-middleware-next")).toBe("1");
    for (const method of ["GET", "HEAD", "PUT", "DELETE", "OPTIONS"]) {
      expect(proxy(new NextRequest(`https://toro.invalid${path}`, { method })).status).toBe(404);
    }
    expect(proxy(new NextRequest(`https://toro.invalid${path}`, { method: "POST", headers: { "Next-Action": "synthetic" } })).status).toBe(404);
    expect(proxy(new NextRequest(`https://toro.invalid${path}/extra`, { method: "POST" })).status).toBe(404);
  });

  it("redirects root to the Portal without carrying untrusted query parameters", () => {
    const response = proxy(new NextRequest("https://toro.invalid/?next=https://evil.invalid&mode=internal"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://toro.invalid/portal");
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
  });
});
