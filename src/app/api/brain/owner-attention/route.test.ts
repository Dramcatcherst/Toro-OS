import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";
import type { InvoiceRow } from "@/features/attention/owner-attention";

const { resolveContext, createClient, loadBrainView } = vi.hoisted(() => ({
  resolveContext: vi.fn(),
  createClient: vi.fn(),
  loadBrainView: vi.fn(),
}));

// Only external identity/database boundaries are replaced. The route, provider,
// authorization policy and projection builder all execute their real code.
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: resolveContext }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: createClient }));
// The separately tested Brain reader is another external read boundary here.
// MCP, Owner Attention provider, policy and projection still execute real code.
vi.mock("@/lib/server/brain-projection", () => ({ loadBrainProjectionView: loadBrainView }));

import { loadOwnerAttentionProjection } from "@/features/attention/owner-attention-server";
import { runToroMcpReadTool } from "@/features/mcp/read-adapter-server";
import { GET } from "./route";

function ownerContext(): ToroResolvedContext {
  return {
    userId: "synthetic-owner",
    email: "synthetic-owner@example.invalid",
    displayName: "Synthetic owner",
    mode: "organization",
    orgId: "synthetic-org",
    membership: {
      orgId: "synthetic-org",
      membershipId: "synthetic-membership",
      membershipType: "owner",
      status: "active",
      roles: ["ADMIN"],
      employeeId: null,
      source: "organization_memberships",
    },
    availableOrgIds: ["synthetic-org"],
    allowedDataScopes: ["work_org"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

const invoice: InvoiceRow = {
  invoice_key: "synthetic-invoice",
  issuer_name: "Synthetic supplier",
  document_number: "TEST-1",
  due_date: "2026-09-29",
  currency: "USD",
  total: "25.50",
  payment_status: "unpaid",
  obligation_key: null,
  mailbox: "synthetic-finance@example.invalid",
  source_url: "https://example.invalid/synthetic-invoice",
};

type Query = { source: string; filters: Array<[string, unknown]>; limit?: number };
let queries: Query[];
let failingSource: string | undefined;

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
  vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
  vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", "true");
  vi.stubGlobal("fetch", () => { throw new Error("Unexpected external request in synthetic test"); });
  queries = [];
  failingSource = undefined;
  resolveContext.mockResolvedValue(ownerContext());
  loadBrainView.mockResolvedValue({
    runtime: { realData: true },
    projection: {
      contractVersion: "1.0.0", generatedAt: "2026-09-30T12:00:00.000Z",
      mode: "workspace", synthetic: false, partial: false,
      context: { mode: "organization", scopeRef: "synthetic-org", organizationRef: "synthetic-org", isolationMode: "private" },
      nodes: [], edges: [], events: [], sources: [],
    },
  });
  createClient.mockResolvedValue({
    schema: (schema: string) => ({
      from: (table: string) => {
        const source = `${schema}.${table}`;
        const rows = new Map<string, unknown[]>([
          ["operations.communication_followups", []],
          ["operations.obligations", []],
          ["finance.invoices", [invoice]],
        ]);
        if (!rows.has(source)) throw new Error(`Unexpected synthetic source: ${source}`);
        const query: Query = { source, filters: [] };
        queries.push(query);
        const chain = {
          select: () => chain,
          eq: (key: string, value: unknown) => { query.filters.push([key, value]); return chain; },
          limit: (limit: number) => {
            query.limit = limit;
            return Promise.resolve({
              data: rows.get(source),
              error: source === failingSource ? { message: "synthetic-private-source-error" } : null,
            });
          },
        };
        return chain;
      },
    }),
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const disabledConfigurations = [
  [undefined, undefined], ["false", "false"], [undefined, "true"],
  ["", "true"], ["false", "true"], ["TRUE", "true"], ["1", "true"],
  ["true", undefined], ["true", "false"], ["true", "TRUE"],
  ["true", "1"], ["true", " true "],
] as const;

describe("MCP consumer preserves the Owner Attention read boundary", () => {
  // Removing the provider's gate must expose synthetic invoice priorities and
  // fail these assertions: the real MCP consumer cannot bypass that gate.
  it.each(disabledConfigurations)("returns no priorities or database reads for flags %s / %s", async (brain, attention) => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", brain);
    vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", attention);
    const result = await runToroMcpReadTool("get_priorities", { correlationId: "synthetic-correlation" });
    expect(result.error?.code).toBe("degraded");
    expect(result).not.toHaveProperty("data");
    expect(JSON.stringify(result)).not.toMatch(/Synthetic supplier|TEST-1|synthetic-invoice/);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("projects a synthetic priority through the real provider when both capabilities and role allow it", async () => {
    const result = await runToroMcpReadTool("get_priorities", { limit: 1 });
    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject({ items: [expect.objectContaining({ objectRef: "synthetic-invoice", title: "Synthetic supplier — TEST-1", sourceSystem: "TORO Finance", freshness: "unknown", verification: "unverified" })] });
    expect(queries.map(query => query.source)).toEqual(["operations.communication_followups", "operations.obligations", "finance.invoices"]);
    expect(queries.every(query => query.filters.some(([key, value]) => key === "org_id" && value === "synthetic-org"))).toBe(true);
  });

  it("keeps priorities unavailable for a role without Owner Attention permission", async () => {
    const context = ownerContext();
    context.membership!.roles = ["CONTABILIDAD"];
    resolveContext.mockResolvedValue(context);
    const result = await runToroMcpReadTool("get_priorities");
    expect(result.error?.code).toBe("capability_unavailable");
    expect(result).not.toHaveProperty("data");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("does not reach Owner Attention when Brain is a demonstration", async () => {
    const view = await loadBrainView();
    loadBrainView.mockResolvedValue({ ...view, runtime: { realData: false } });
    const result = await runToroMcpReadTool("get_priorities");
    expect(result.error?.code).toBe("capability_unavailable");
    expect(result).not.toHaveProperty("data");
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe("Owner Attention disabled read boundary", () => {
  // Removing either gate must fail these: even a valid owner cannot load data
  // when either capability is disabled, missing or not explicitly true.
  it.each(disabledConfigurations)("route blocks before identity/database for flags %s / %s", async (brain, attention) => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", brain);
    vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", attention);
    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ state: "disabled", ownerAttentionAllowed: false });
    expect(resolveContext).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
    expect(queries).toEqual([]);
  });

  it.each(disabledConfigurations)("provider rejects direct calls before database for flags %s / %s", async (brain, attention) => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", brain);
    vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", attention);
    await expect(loadOwnerAttentionProjection(ownerContext())).rejects.toThrow();
    expect(createClient).not.toHaveBeenCalled();
    expect(queries).toEqual([]);
  });

  it("rechecks the read gate after asynchronous identity resolution", async () => {
    resolveContext.mockImplementation(async () => {
      vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", "false");
      return ownerContext();
    });
    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ state: "runtime_unavailable", ownerAttentionAllowed: false });
    expect(createClient).not.toHaveBeenCalled();
  });
});

const deniedContexts: Array<[string, (context: ToroResolvedContext) => ToroResolvedContext]> = [
  ["unprivileged role", c => ({ ...c, membership: { ...c.membership!, roles: ["CONTABILIDAD"] } })],
  ["suspended membership", c => ({ ...c, membership: { ...c.membership!, status: "suspended" } })],
  ["offboarded membership", c => ({ ...c, membership: { ...c.membership!, status: "offboarded" } })],
  ["wrong organization", c => ({ ...c, membership: { ...c.membership!, orgId: "other-synthetic-org" } })],
  ["personal scope", c => ({ ...c, mode: "personal" })],
  ["missing organization", c => ({ ...c, orgId: null })],
  ["missing membership", c => ({ ...c, membership: null })],
  ["denied organization data", c => ({ ...c, canUseOrganizationData: false })],
];

describe("Owner Attention enabled path still enforces authorization", () => {
  it("rejects an unauthenticated request without business reads", async () => {
    resolveContext.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ state: "unresolved", ownerAttentionAllowed: false });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("requires context choice without leaking organization identifiers or reading business data", async () => {
    const context = { ...ownerContext(), requiresContextChoice: true };
    resolveContext.mockResolvedValue(context);
    const response = await GET();
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ state: "context_choice_required", ownerAttentionAllowed: false, availableOrganizationCount: 1 });
    await expect(loadOwnerAttentionProjection(context)).rejects.toThrow();
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each(deniedContexts)("denies %s in both route and direct provider", async (_label, mutate) => {
    const context = mutate(ownerContext());
    resolveContext.mockResolvedValue(context);
    const response = await GET();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ state: "forbidden", ownerAttentionAllowed: false });
    await expect(loadOwnerAttentionProjection(context)).rejects.toThrow();
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each(["ADMIN", "GERENCIA"] as const)("returns the real projection of synthetic scoped rows for %s only with both gates", async role => {
    const context = ownerContext();
    context.membership!.roles = [role];
    resolveContext.mockResolvedValue(context);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(resolveContext).toHaveBeenCalledWith({ mode: "organization" });
    await expect(response.json()).resolves.toMatchObject({
      state: "ready", ownerAttentionAllowed: true,
      projection: { total: 1, critical: 1, items: [{ key: "synthetic-invoice", title: "Synthetic supplier — TEST-1", amount: 25.5, currency: "USD" }] },
    });
    expect(queries).toEqual([
      { source: "operations.communication_followups", filters: [["org_id", "synthetic-org"], ["active", true]], limit: 100 },
      { source: "operations.obligations", filters: [["org_id", "synthetic-org"], ["active", true]], limit: 150 },
      { source: "finance.invoices", filters: [["org_id", "synthetic-org"], ["active", true]], limit: 200 },
    ]);
  });

  it.each(["operations.communication_followups", "operations.obligations", "finance.invoices"])("fails closed without partial data or diagnostics when %s fails", async source => {
    failingSource = source;
    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ state: "runtime_unavailable", ownerAttentionAllowed: false });
  });

  it("does not expose identity service errors", async () => {
    resolveContext.mockRejectedValue(new Error("synthetic-private-identity-error"));
    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ state: "runtime_unavailable", ownerAttentionAllowed: false });
    expect(createClient).not.toHaveBeenCalled();
  });
});
