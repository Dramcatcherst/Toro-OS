import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";

const { resolveContext, createClient } = vi.hoisted(() => ({
  resolveContext: vi.fn(), createClient: vi.fn(),
}));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: resolveContext }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: createClient }));

import { createToroInternalWork, createToroInternalWorkWithContext } from "./internal-work-server";

const context: ToroResolvedContext = {
  userId: "user-1", email: null, displayName: "Synthetic manager", mode: "organization", orgId: "org-1",
  membership: { orgId: "org-1", membershipId: "member-1", membershipType: "employee", status: "active",
    roles: ["GERENCIA"], employeeId: "employee-1", source: "organization_memberships" },
  availableOrgIds: ["org-1"], allowedDataScopes: ["work_org"], allowedTools: [],
  canUsePersonalVault: false, canUseOrganizationData: true, requiresContextChoice: false,
};
const input = { action: "maintenance.task", title: "Revisar bomba", description: "Synthetic request",
  priority: "high", projectKey: null, dueDate: null, idempotencyKey: "synthetic-msg-123" };
const existing = { id: "task-1", task_key: "toro_intake:synthetic-msg-123", task_name: "Revisar bomba",
  status: "planned", priority: "high", area: "Maintenance", project_id: null, category: "operations",
  due_date: null, description: "Synthetic request", canonical_module_key: "toro_operations", module_lead: "RICO" };

function clientFor(rows: unknown[]) {
  const q = { select: vi.fn(), eq: vi.fn(), limit: vi.fn(), insert: vi.fn() };
  q.select.mockReturnValue(q); q.eq.mockReturnValue(q);
  q.limit.mockResolvedValue({ data: rows, error: null });
  const from = vi.fn().mockReturnValue(q);
  const client = { schema: vi.fn().mockReturnValue({ from }) };
  return { client, q };
}

describe("shared internal-work execution for Portal and OpenClaw", () => {
  beforeEach(() => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
    vi.stubEnv("TORO_INTERNAL_WORK_WRITE_ENABLED", "true");
    resolveContext.mockReset(); createClient.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("preserves the write gate in the injected channel entry point", async () => {
    vi.stubEnv("TORO_INTERNAL_WORK_WRITE_ENABLED", "false");
    const { client } = clientFor([]);
    await expect(createToroInternalWorkWithContext(input, context, client as never))
      .resolves.toMatchObject({ state: "unavailable" });
    expect(client.schema).not.toHaveBeenCalled();
    await expect(createToroInternalWork(input)).resolves.toMatchObject({ state: "unavailable" });
    expect(resolveContext).not.toHaveBeenCalled(); expect(createClient).not.toHaveBeenCalled();
  });
  it("does not let a valid role cross the active organization boundary", async () => {
    const { client } = clientFor([]);
    const mismatched = { ...context, membership: { ...context.membership!, orgId: "org-other" } };
    await expect(createToroInternalWorkWithContext(input, mismatched, client as never))
      .resolves.toMatchObject({ state: "forbidden" });
    expect(client.schema).not.toHaveBeenCalled();
  });
  it("does not turn phone recognition into an employee write grant", async () => {
    const { client } = clientFor([]);
    const employee = { ...context, membership: { ...context.membership!, roles: ["EMPLEADO" as const] } };
    await expect(createToroInternalWorkWithContext(input, employee, client as never))
      .resolves.toMatchObject({ state: "forbidden" });
    expect(client.schema).not.toHaveBeenCalled();
  });
  it("replays an exact retry without inserting another task", async () => {
    const { client, q } = clientFor([existing]);
    await expect(createToroInternalWorkWithContext(input, context, client as never))
      .resolves.toMatchObject({ state: "replayed", task: { id: "task-1" } });
    expect(q.eq).toHaveBeenCalledWith("org_id", "org-1");
    expect(q.insert).not.toHaveBeenCalled();
  });
  it("reports conflicting content instead of silently accepting the same key", async () => {
    const { client, q } = clientFor([{ ...existing, task_name: "Different work" }]);
    await expect(createToroInternalWorkWithContext(input, context, client as never))
      .resolves.toMatchObject({ state: "conflict" });
    expect(q.insert).not.toHaveBeenCalled();
  });
  it("checks the winning content after a concurrent unique-key collision", async () => {
    const { client, q } = clientFor([]);
    q.limit.mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [{ ...existing, priority: "critical" }], error: null });
    q.insert.mockReturnValue({ select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "23505" } }),
    }) });
    await expect(createToroInternalWorkWithContext(input, context, client as never))
      .resolves.toMatchObject({ state: "conflict" });
    expect(q.insert).toHaveBeenCalledTimes(1);
  });
});
