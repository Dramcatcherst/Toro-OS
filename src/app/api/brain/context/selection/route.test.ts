import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ resolveContext: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: mocks.resolveContext,
}));

import { TORO_ACTIVE_ORGANIZATION_COOKIE } from "@/features/context/organization-selection";
import { POST } from "./route";

const ORIGIN = "https://toro.invalid";
const ORG_ID = "00000000-0000-4000-8000-0000000000aa";
const USER_ID = "00000000-0000-4000-8000-000000000001";

function request(
  body = `intent=select&organizationId=${ORG_ID}`,
  headers: Record<string, string> = {},
  method = "POST",
) {
  return new Request(`${ORIGIN}/api/brain/context/selection`, {
    method,
    headers: {
      origin: ORIGIN,
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "sec-fetch-site": "same-origin",
      ...headers,
    },
    ...(["GET", "HEAD"].includes(method) ? {} : { body }),
  });
}

function resolvedContext(overrides: Record<string, unknown> = {}) {
  return {
    userId: USER_ID,
    mode: "organization",
    orgId: ORG_ID,
    membership: { orgId: ORG_ID, status: "active" },
    availableOrgIds: [ORG_ID],
    allowedDataScopes: ["work_org"],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/brain/context/selection", () => {
  it("revalidates active membership and sets only a host session preference", async () => {
    mocks.resolveContext.mockResolvedValue(resolvedContext());

    const response = await POST(request());

    expect(mocks.resolveContext).toHaveBeenCalledExactlyOnceWith({
      mode: "organization",
      orgId: ORG_ID,
    });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/my-toro`);
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(response.cookies.get(TORO_ACTIVE_ORGANIZATION_COOKIE)).toMatchObject({
      value: `${USER_ID}:${ORG_ID}`,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).not.toMatch(/domain=/i);
    expect(setCookie).not.toMatch(/max-age=|expires=/i);
  });

  it.each([
    `intent=select&organizationId=not-an-organization`,
    `intent=select&intent=clear&organizationId=${ORG_ID}`,
    `intent=select&organizationId=${ORG_ID}&organizationId=${ORG_ID}`,
    `intent=select&organizationId=${ORG_ID}&provider=attacker`,
    "intent=clear&organizationId=unexpected",
  ])("rejects malformed or duplicate form input and clears any old preference: %s", async (body) => {
    const response = await POST(request(body));

    expect(mocks.resolveContext).not.toHaveBeenCalled();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/my-toro?context=invalid`);
    expect(response.cookies.get(TORO_ACTIVE_ORGANIZATION_COOKIE)).toMatchObject({
      value: "",
      path: "/",
      maxAge: 0,
    });
  });

  it.each([
    null,
    resolvedContext({ orgId: "00000000-0000-4000-8000-0000000000bb" }),
    resolvedContext({ membership: { orgId: ORG_ID, status: "inactive" } }),
    resolvedContext({ mode: "personal" }),
    resolvedContext({ availableOrgIds: [] }),
    resolvedContext({ allowedDataScopes: ["system"] }),
    resolvedContext({ canUsePersonalVault: true }),
    resolvedContext({ canUseOrganizationData: false }),
    resolvedContext({ requiresContextChoice: true }),
  ])("fails closed for an unauthorized or inconsistent resolved context", async (context) => {
    mocks.resolveContext.mockResolvedValue(context);

    const response = await POST(request());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/my-toro?context=invalid`);
    expect(response.cookies.get(TORO_ACTIVE_ORGANIZATION_COOKIE)?.maxAge).toBe(0);
  });

  it("authenticates before clearing the selected context", async () => {
    mocks.resolveContext.mockResolvedValue({ userId: "user-1", mode: "personal" });

    const response = await POST(request("intent=clear"));

    expect(mocks.resolveContext).toHaveBeenCalledExactlyOnceWith({ mode: "personal" });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/my-toro`);
    expect(response.cookies.get(TORO_ACTIVE_ORGANIZATION_COOKIE)?.maxAge).toBe(0);
  });

  it("returns an expired session to login while also clearing a stale preference", async () => {
    mocks.resolveContext.mockResolvedValue(null);

    const response = await POST(request("intent=clear"));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/login?next=/my-toro`);
    expect(response.cookies.get(TORO_ACTIVE_ORGANIZATION_COOKIE)?.maxAge).toBe(0);
  });

  it.each([
    { origin: "https://attacker.invalid" },
    { origin: "" },
    { "sec-fetch-site": "cross-site" },
    { "content-type": "text/plain" },
    { "Next-Action": "synthetic-action" },
  ] as Record<string, string>[])("rejects request boundary %j without resolving identity", async (headers) => {
    const response = await POST(request(undefined, headers));

    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(mocks.resolveContext).not.toHaveBeenCalled();
  });

  it("requires an Origin header", async () => {
    const response = await POST(new Request(`${ORIGIN}/api/brain/context/selection`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `intent=select&organizationId=${ORG_ID}`,
    }));
    expect(response.status).toBe(403);
    expect(mocks.resolveContext).not.toHaveBeenCalled();
  });

  it("fails closed and clears a stale preference when resolution throws", async () => {
    mocks.resolveContext.mockRejectedValue(new Error("synthetic private failure"));
    const response = await POST(request());
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/my-toro?context=invalid`);
    expect(response.cookies.get(TORO_ACTIVE_ORGANIZATION_COOKIE)?.maxAge).toBe(0);
  });

  it("rejects non-POST, oversized and non-Portal requests before identity resolution", async () => {
    expect((await POST(request("", {}, "GET"))).status).toBe(403);
    expect((await POST(request("x".repeat(513)))).status).toBe(413);
    expect((await POST(request("intent=clear", { "content-length": "invalid" }))).status).toBe(413);
    expect((await POST(request("x".repeat(513), { "content-length": "12" }))).status).toBe(413);
    vi.stubEnv("TORO_DEPLOYMENT_MODE", undefined);
    expect((await POST(request())).status).toBe(404);
    vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
    expect((await POST(request())).status).toBe(404);
    expect(mocks.resolveContext).not.toHaveBeenCalled();
  });
});
