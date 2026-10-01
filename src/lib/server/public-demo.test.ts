import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const io = vi.hoisted(() => ({
  fetch: vi.fn(), sdk: vi.fn(), cookies: vi.fn(), blobGet: vi.fn(), blobPut: vi.fn(),
  readFile: vi.fn(), writeFile: vi.fn(), mkdir: vi.fn(),
}));
vi.mock("@supabase/ssr", () => ({ createServerClient: io.sdk }));
vi.mock("next/headers", () => ({ cookies: io.cookies }));
vi.mock("@vercel/blob", () => ({ get: io.blobGet, put: io.blobPut }));
vi.mock("node:fs/promises", () => ({ readFile: io.readFile, writeFile: io.writeFile, mkdir: io.mkdir }));

import { readAirtableRecords, readVercelDeployments } from "./read-only-connectors";
import { getApprovalLedger, persistApprovalLedger } from "./approval-ledger";
import { loadBrainProjectionView } from "./brain-projection";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveToroContext } from "@/features/context/resolver";
import { loadCanonicalBrainReadSlice } from "@/features/brain/canonical-read";
import { loadOwnerAttentionProjection } from "@/features/attention/owner-attention-server";
import { createToroInternalWork } from "@/features/actions/internal-work-server";
import { runToroMcpReadTool } from "@/features/mcp/read-adapter-server";
import type { ToroResolvedContext } from "@/features/context/types";
import Home from "@/app/page";
import { NextRequest } from "next/server";
import { GET as approvalGet, POST as approvalPost } from "@/app/api/approvals/route";
import { GET as airtableGet } from "@/app/api/connectors/airtable/route";
import { GET as vercelGet } from "@/app/api/connectors/vercel/route";
import { GET as contextGet } from "@/app/api/brain/context/route";
import { GET as attentionGet } from "@/app/api/brain/owner-attention/route";
import { POST as internalPost } from "@/app/api/brain/internal-work/route";

const context: ToroResolvedContext = {
  userId: "demo-user", email: null, displayName: "Synthetic", mode: "organization",
  orgId: "demo-org", membership: { orgId: "demo-org", membershipId: null,
    membershipType: "employee", status: "active", roles: ["ADMIN"], employeeId: null,
    source: "legacy_user_roles" },
  availableOrgIds: ["demo-org"], allowedDataScopes: ["work_org"], allowedTools: [],
  canUsePersonalVault: false, canUseOrganizationData: true, requiresContextChoice: false,
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("TORO_DEPLOYMENT_MODE", undefined);
  for (const flag of ["TORO_BRAIN_CANONICAL_READ_ENABLED", "TORO_OWNER_ATTENTION_READ_ENABLED",
    "TORO_LEGACY_OPERATIONS_ENABLED", "TORO_INTERNAL_WORK_WRITE_ENABLED"]) vi.stubEnv(flag, "true");
  for (const key of ["AIRTABLE_TOKEN", "VERCEL_TOKEN", "BLOB_READ_WRITE_TOKEN"]) vi.stubEnv(key, "synthetic-never-use");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.invalid");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "synthetic-never-use");
  vi.stubGlobal("fetch", io.fetch);
  io.fetch.mockImplementation(async () => new Response('{"private":"sentinel"}'));
  io.cookies.mockResolvedValue({ getAll: () => [{ name: "synthetic-session", value: "authenticated-fixture" }] });
  io.sdk.mockImplementation(() => { throw new Error("unexpected SDK call"); });
  io.blobGet.mockResolvedValue(null);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function expectNoIo() {
  for (const mock of Object.values(io)) expect(mock).not.toHaveBeenCalled();
}

describe.each([false, true])("public demo isolates providers; session %s", (session) => {
  beforeEach(() => io.cookies.mockResolvedValue({ getAll: () => session ? [{ name: "session", value: "synthetic" }] : [] }));
  const cases = [
    ["Airtable", () => readAirtableRecords({ baseId: "fake", tableId: "fake" })],
    ["Vercel", () => readVercelDeployments({ projectId: "fake" })],
    ["ledger read", () => getApprovalLedger()],
    ["ledger write", () => persistApprovalLedger([])],
    ["Supabase factory", () => createServerSupabaseClient()],
    ["context resolver", () => resolveToroContext({ mode: "organization" })],
    ["canonical provider", () => loadCanonicalBrainReadSlice(context)],
    ["finance provider", () => loadOwnerAttentionProjection(context)],
    ["internal work", () => createToroInternalWork({ action: "task.create", title: "Synthetic task", idempotencyKey: "demo-key-12345" })],
    ["MCP consumer", () => runToroMcpReadTool("get_business_status", {})],
  ] as const;

  it.each(cases)("%s performs zero I/O", async (_name, call) => {
    await Promise.allSettled([call()]);
    expectNoIo();
  });

  it.each([undefined, "public-demo", "false", "INTERNAL", " internal "])("mode %s stays synthetic", async (mode) => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", mode);
    const view = await loadBrainProjectionView();
    expect(view.runtime).toMatchObject({ mode: "synthetic_only", realData: false, externalWrite: false });
    expect(view.projection.synthetic).toBe(true);
    expectNoIo();
  });

  it("root redirects before loading the operational console", async () => {
    await expect(Home()).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/brain;307;" });
    expectNoIo();
  });
});

it.each(["blob", "file", "cookie"])("ledger cannot fall through to %s persistence", async (backend) => {
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", backend === "blob" ? "synthetic" : undefined);
  vi.stubEnv("VERCEL", backend === "cookie" ? "1" : undefined);
  const set = vi.fn();
  await expect(getApprovalLedger()).rejects.toThrow("disabled");
  await expect(persistApprovalLedger([], { set } as unknown as NonNullable<Parameters<typeof persistApprovalLedger>[1]>)).rejects.toThrow("disabled");
  expect(set).not.toHaveBeenCalled();
  expectNoIo();
});

it("route handlers fail closed even when called without proxy", async () => {
  const request = () => new NextRequest("https://demo.invalid/api/approvals", {
    method: "POST", body: JSON.stringify({ id: "synthetic-id", state: "Approved", action: "task.create", title: "Synthetic task", idempotencyKey: "demo-key-12345" }),
  });
  const responses = await Promise.all([approvalGet(), approvalPost(request()), airtableGet(request()),
    vercelGet(), contextGet(), attentionGet(), internalPost(request())]);
  for (const response of responses) {
    expect(response.status).toBe(503);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(JSON.stringify(await response.json())).not.toContain("sentinel");
  }
  expectNoIo();
});

it("internal mode alone enables neither legacy reads/persistence nor work writes nor Brain reads", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  for (const flag of ["TORO_BRAIN_CANONICAL_READ_ENABLED", "TORO_OWNER_ATTENTION_READ_ENABLED",
    "TORO_LEGACY_OPERATIONS_ENABLED", "TORO_INTERNAL_WORK_WRITE_ENABLED"]) vi.stubEnv(flag, undefined);
  expect((await readAirtableRecords({ baseId: "fake", tableId: "fake" })).data).toBeNull();
  expect((await readVercelDeployments({ projectId: "fake" })).data).toBeNull();
  await expect(getApprovalLedger()).rejects.toThrow("disabled");
  await expect(persistApprovalLedger([])).rejects.toThrow("disabled");
  expect((await createToroInternalWork({ action: "task.create", title: "Synthetic task", idempotencyKey: "demo-key-12345" })).state).toBe("unavailable");
  expect((await loadBrainProjectionView()).projection.synthetic).toBe(true);
  await expect(loadCanonicalBrainReadSlice(context)).rejects.toThrow("disabled");
  await expect(loadOwnerAttentionProjection(context)).rejects.toThrow("disabled");
  expectNoIo();
});

it("internal write capability still requires authenticated identity", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  const getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
  io.sdk.mockReturnValue({ auth: { getUser } });
  const result = await createToroInternalWork({ action: "task.create", title: "Synthetic task", idempotencyKey: "demo-key-12345" });
  expect(result).toEqual({ state: "unauthenticated" });
  expect(getUser).toHaveBeenCalledOnce();
  expect(io.fetch).not.toHaveBeenCalled();
  expect(io.blobPut).not.toHaveBeenCalled();
});

it.each(["ADMIN", "GERENCIA", "EMPLEADO"])("explicit internal write retains scoped role policy for %s", async (role) => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  const insert = vi.fn();
  const tables: string[] = [];
  const from = (table: string) => {
    tables.push(table);
    const query = {
      select: () => query, eq: () => query, is: () => query,
      then: (resolve: (value: { error: null; data: { org_id: string; roles: { code: string } }[] }) => unknown) =>
        Promise.resolve({ error: null, data: [{ org_id: "demo-org", roles: { code: role } }] }).then(resolve),
      limit: async () => ({ error: null, data: table === "user_roles"
        ? [{ org_id: "demo-org", roles: { code: role } }] : [] }),
      insert: (draft: unknown) => { insert(draft); return query; },
      single: async () => ({ error: null, data: { id: "synthetic-task", task_key: "toro_intake:demo-key-12345", task_name: "Synthetic task" } }),
    };
    return query;
  };
  io.sdk.mockReturnValue({
    auth: { getUser: async () => ({ data: { user: { id: "demo-user", email: "synthetic@example.invalid" } }, error: null }) },
    from, schema: () => ({ from }),
  });
  const result = await createToroInternalWork({ action: "task.create", title: "Synthetic task", idempotencyKey: "demo-key-12345", orgId: "untrusted-org" });
  if (role === "EMPLEADO") {
    expect(result.state).toBe("forbidden");
    expect(insert).not.toHaveBeenCalled();
    expect(tables).not.toContain("tasks");
  } else {
    expect(result.state).toBe("created");
    expect(insert).toHaveBeenCalledOnce();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ org_id: "demo-org", task_key: "toro_intake:demo-key-12345" }));
  }
  expect(io.fetch).not.toHaveBeenCalled();
  expect(io.blobPut).not.toHaveBeenCalled();
});
