import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToroResolvedContext } from "@/features/context/types";

const io = vi.hoisted(() => ({ sdk: vi.fn(), cookies: vi.fn(), fetch: vi.fn(),
  getUser: vi.fn(), from: vi.fn(), schema: vi.fn(), rpc: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: io.sdk }));
vi.mock("@supabase/ssr", () => ({ createServerClient: io.sdk }));
vi.mock("next/headers", () => ({ cookies: io.cookies }));

import { createBearerSupabaseClient, verifySupabaseBearerToken } from "@/lib/supabase/bearer";
import { createWorkerSupabaseClient } from "@/lib/supabase/worker";
import { resolveToroContextWithSupabase } from "@/features/context/resolver";
import { loadCanonicalBrainReadSliceWithClient } from "@/features/brain/canonical-read";
import { loadOwnerAttentionProjectionWithClient } from "@/features/attention/owner-attention-server";
import { loadBrainProjectionViewForContext } from "./brain-projection";
import { runToroMcpReadTool } from "@/features/mcp/read-adapter-server";
import { resolveToroMcpBearerRuntime, verifyToroMcpBearerToken } from "@/features/mcp/auth";
import { isToroMcpEnabled } from "@/features/mcp/config";
import { loadLos50sEventOps } from "@/features/event-ops/los50s-server";
import { claimNextToroExecutionRun, claimToroExecutionRunById, renewToroExecutionLease,
  transitionToroExecutionRun, resolveFailedToroExecutionRun, completeToroExecutionRun,
  appendToroExecutionReceipt } from "@/features/control-plane/worker-runtime";
import { GET as healthGet } from "@/app/api/system/runtime-health/route";
import { POST as canaryPost } from "@/app/api/system/worker-canary/route";
import { GET as mcpGet, POST as mcpPost } from "@/app/api/mcp/route";
import { GET as metadataGet, OPTIONS as metadataOptions } from "@/app/.well-known/oauth-protected-resource/route";

const client = { auth: { getUser: io.getUser }, from: io.from, schema: io.schema,
  rpc: io.rpc } as unknown as SupabaseClient;
const context: ToroResolvedContext = {
  userId: "synthetic-user", email: null, displayName: "Synthetic", mode: "organization",
  orgId: "synthetic-org", membership: { orgId: "synthetic-org", membershipId: null,
    membershipType: "employee", status: "active", roles: ["ADMIN"], employeeId: null,
    source: "legacy_user_roles" }, availableOrgIds: ["synthetic-org"],
  allowedDataScopes: ["work_org"], allowedTools: [], canUsePersonalVault: false,
  canUseOrganizationData: true, requiresContextChoice: false,
};
const lease = { runId: "synthetic-run", workerId: "synthetic-worker", fencingToken: 1 };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("TORO_DEPLOYMENT_MODE", undefined);
  for (const name of ["TORO_MCP_ENABLED", "TORO_RUNTIME_HEALTH_ENABLED", "TORO_WORKER_CANARY_ENABLED",
    "TORO_BRAIN_CANONICAL_READ_ENABLED", "TORO_OWNER_ATTENTION_READ_ENABLED"]) vi.stubEnv(name, "true");
  for (const name of ["TORO_RUNTIME_HEALTH_TOKEN", "TORO_WORKER_CANARY_TOKEN", "SUPABASE_SECRET_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]) vi.stubEnv(name, "synthetic-never-use");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.invalid");
  vi.stubEnv("TORO_MCP_RESOURCE_URL", "https://synthetic.invalid/api/mcp");
  vi.stubEnv("TORO_WORKER_CANARY_ORG_ID", "synthetic-org");
  vi.stubEnv("TORO_WORKER_CANARY_TASK_ID", "synthetic-task");
  vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "synthetic-sha");
  vi.stubGlobal("fetch", io.fetch);
  for (const fn of Object.values(io)) fn.mockImplementation(() => { throw new Error("unexpected I/O"); });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function noIo() { for (const fn of Object.values(io)) expect(fn).not.toHaveBeenCalled(); }

describe.each([undefined, "public-demo", "INTERNAL"])("runtime seams in demo mode %s", (mode) => {
  beforeEach(() => vi.stubEnv("TORO_DEPLOYMENT_MODE", mode));
  it.each([
    ["bearer factory", () => createBearerSupabaseClient("synthetic-token")],
    ["worker factory", () => createWorkerSupabaseClient()],
  ] as const)("%s rejects before constructing SDK", async (_name, call) => {
    await expect(Promise.resolve().then(call)).rejects.toThrow(/disabled/i);
    noIo();
  });
  it("bearer verification and MCP authentication return no identity", async () => {
    expect(await verifySupabaseBearerToken("synthetic-token")).toBeNull();
    expect(await verifyToroMcpBearerToken(new Request("https://synthetic.invalid"), "synthetic-token")).toBeUndefined();
    noIo();
  });
  it("MCP runtime declines before bearer construction or context resolution", async () => {
    expect(await resolveToroMcpBearerRuntime("synthetic-token")).toEqual({ error: {
      code: "capability_unavailable", message: "Operational reads are disabled in the public demo.", retryable: false,
    } });
    expect(isToroMcpEnabled()).toBe(false);
    noIo();
  });
  it("injected clients cannot bypass identity, Brain, finance or MCP barriers", async () => {
    expect(await resolveToroContextWithSupabase(client, {}, "synthetic-token")).toBeNull();
    await expect(loadCanonicalBrainReadSliceWithClient(context, client)).rejects.toThrow(/disabled/i);
    await expect(loadOwnerAttentionProjectionWithClient(context, client)).rejects.toThrow(/disabled/i);
    expect((await loadBrainProjectionViewForContext(context, client)).projection.synthetic).toBe(true);
    expect((await runToroMcpReadTool("get_business_status", {}, { context, supabase: client })).error?.code).toBe("capability_unavailable");
    noIo();
  });
  it("Event Ops cannot obtain identity or query the backend", async () => {
    expect(await loadLos50sEventOps()).toMatchObject({ state: "unauthenticated" });
    noIo();
  });
});

it.each([
  ["claim next", () => claimNextToroExecutionRun(client, { orgId: "synthetic-org", workerId: lease.workerId })],
  ["claim exact", () => claimToroExecutionRunById(client, { ...lease, orgId: "synthetic-org" })],
  ["renew", () => renewToroExecutionLease(client, lease)],
  ["transition", () => transitionToroExecutionRun(client, { ...lease, expectedStatus: "claimed", nextStatus: "running" })],
  ["retry", () => resolveFailedToroExecutionRun(client, lease)],
  ["complete", () => completeToroExecutionRun(client, lease)],
  ["receipt", () => appendToroExecutionReceipt(client, { ...lease, orgId: "synthetic-org", taskId: "synthetic-task",
    receiptType: "verification", status: "verified", actionKey: "control_plane.noop", actorKind: "system",
    actorRef: lease.workerId, executionAuthorityLevel: "L1", businessRisk: "Low", correlationId: "synthetic-correlation",
    idempotencyKey: "synthetic-idempotency", verificationStatus: "passed" })],
] as const)("worker %s refuses injected SDK writes in demo", async (_name, call) => {
  await expect(call()).rejects.toThrow(/disabled/i);
  noIo();
});

it.each([
  ["health GET", healthGet, "GET"], ["canary POST", canaryPost, "POST"],
  ["MCP GET", mcpGet, "GET"], ["MCP POST", mcpPost, "POST"],
  ["OAuth GET", metadataGet, "GET"], ["OAuth OPTIONS", metadataOptions, "OPTIONS"],
] as const)("%s is closed even without proxy and with matching synthetic authorization", async (_name, handler, method) => {
  const response = await handler(new Request("https://synthetic.invalid/api/mcp", {
    method, headers: { authorization: "Bearer synthetic-never-use", cookie: "synthetic-session=present" },
  }));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ state: "public_demo", operationalAccess: false });
  expect(response.headers.get("cache-control")).toBe("no-store");
  noIo();
});

it("internal MCP still requires its independent exact flag", () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  for (const flag of [undefined, "false", "TRUE", " true "]) {
    vi.stubEnv("TORO_MCP_ENABLED", flag);
    expect(isToroMcpEnabled()).toBe(false);
  }
  vi.stubEnv("TORO_MCP_ENABLED", "true");
  expect(isToroMcpEnabled()).toBe(true);
  noIo();
});

it("internal bearer verification preserves verified identity and rejects provider denial", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  io.sdk.mockReturnValue(client);
  const user = { id: "synthetic-user" };
  io.getUser.mockResolvedValue({ data: { user }, error: null });
  expect(await verifySupabaseBearerToken(" synthetic-token ")).toEqual({ client, user });
  expect(io.getUser).toHaveBeenCalledWith("synthetic-token");
  expect(io.sdk).toHaveBeenCalledWith("https://synthetic.invalid", "synthetic-never-use", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: "Bearer synthetic-token" } },
  });
  io.getUser.mockResolvedValue({ data: { user: null }, error: { message: "synthetic denial" } });
  expect(await verifySupabaseBearerToken("synthetic-token")).toBeNull();
  expect(io.fetch).not.toHaveBeenCalled();
  expect(io.from).not.toHaveBeenCalled();
});
