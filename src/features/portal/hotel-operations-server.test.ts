import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
import { HOTEL_OPERATIONS_SCOPE as scope, HOTEL_TASK_READ_LIMIT, emptyHotelOperations } from "./hotel-operations";
const mocks = vi.hoisted(() => ({ revalidate: vi.fn(), allocate: vi.fn(), rpc: vi.fn(), selected: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContextWithSupabase: mocks.revalidate }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.allocate }));
vi.mock("@/lib/server/portal-read-rpc", () => ({ portalReadRpcSelected: mocks.selected, readPortalBrainRpc: mocks.rpc }));
import { loadHotelOperations, loadHotelOperationsWithClient } from "./hotel-operations-server";
const cut = "2026-11-07T12:00:00.000Z";
const task = { id: "11111111-1111-4111-8111-111111111111", org_id: scope.orgId, property_id: scope.propertyId,
  task_name: "Synthetic task", status: "blocked", priority: "critical", area: "Recepción", owner_name: null,
  assignee_name: null, due_date: null, source_system: "TORO", updated_at: cut, needs_revalidation: true };
function database(taskData: unknown[] | null = [task], taskError: unknown = null, healthError: unknown = null) {
  const chains: Record<string, Record<string, ReturnType<typeof vi.fn>>> = {};
  const db = { schema: vi.fn((schema: string) => ({ from: vi.fn((table: string) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const name of ["select", "eq", "or", "order"]) chain[name] = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockResolvedValue({ data: schema === "operations" ? taskData : [], error: schema === "operations" ? taskError : healthError });
    chains[table] = chain; return chain;
  }) })) };
  return { db: db as unknown as SupabaseClient, schema: db.schema, chains };
}
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal"); vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
  mocks.selected.mockReturnValue(false); mocks.revalidate.mockResolvedValue(authorizedContext());
});
afterEach(() => vi.unstubAllEnvs());
it("reads only bounded exact-property fields with the authenticated client and rechecks identity", async () => {
  const { db, schema, chains } = database(); const result = await loadHotelOperationsWithClient(authorizedContext(), db);
  expect(result.state).toBe("ready"); expect(result.tasks.items[0].canonicalRef).toBe(task.id); expect(result.readAt).not.toBeNull();
  expect(schema.mock.calls.map(call => call[0])).toEqual(["operations", "integrations"]);
  for (const table of ["tasks", "kross_snapshot_health"]) {
    expect(chains[table].eq).toHaveBeenCalledWith("org_id", scope.orgId);
    expect(chains[table].eq).toHaveBeenCalledWith("property_id", scope.propertyId);
    expect(chains[table].select.mock.calls[0][0]).not.toMatch(/notes|evidence|reservation|guest|\*/);
  }
  expect(chains.tasks.limit).toHaveBeenCalledWith(HOTEL_TASK_READ_LIMIT + 1);
  expect(chains.tasks.or).toHaveBeenCalledWith(expect.stringContaining("status.is.null"));
  expect(mocks.revalidate).toHaveBeenCalledExactlyOnceWith(db, { mode: "organization", orgId: scope.orgId });
});
it.each(["disabled", "other_org", "auditor", "choice"])("does no source/client allocation for %s context", async reason => {
  const context = authorizedContext();
  if (reason === "disabled") vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "false");
  if (reason === "other_org") { context.orgId = "other"; context.membership!.orgId = "other"; }
  if (reason === "auditor") context.membership!.roles = ["AUDITOR"];
  if (reason === "choice") context.requiresContextChoice = true;
  await loadHotelOperations(context); expect(mocks.allocate).not.toHaveBeenCalled();
});
it.each(["actor", "role", "membership", "failure"])("drops all rows after %s changes during the await", async reason => {
  const current = authorizedContext();
  if (reason === "actor") current.userId = "another";
  if (reason === "role") current.membership!.roles = ["AUDITOR"];
  if (reason === "membership") current.membership!.status = "offboarded";
  if (reason === "failure") mocks.revalidate.mockRejectedValue(new Error("private_sentinel")); else mocks.revalidate.mockResolvedValue(current);
  const result = await loadHotelOperationsWithClient(authorizedContext(), database().db);
  expect(result).toEqual(emptyHotelOperations("denied"));
});
it("keeps a source failure partial and missing tasks distinct from a verified empty list", async () => {
  const result = await loadHotelOperationsWithClient(authorizedContext(), database(null, { message: "private_sentinel" }).db);
  expect(result.state).toBe("partial"); expect(result.tasks.rowsRead).toBeNull(); expect(result.tasks.state).toBe("unavailable");
  expect(JSON.stringify(result)).not.toContain("private_sentinel");
  const both = await loadHotelOperationsWithClient(authorizedContext(), database(null, {}, {}).db);
  expect(both.state).toBe("unavailable");
});
it("uses the existing optional RPC envelope without a direct schema fallback", async () => {
  mocks.selected.mockReturnValue(true); mocks.rpc.mockResolvedValue({ generatedAt: cut,
    hotelOperations: { propertyId: scope.propertyId, tasks: { rows: [task], limit: 201 }, krossHealth: { rows: [], limit: 26 } } });
  const { db, schema } = database(); const result = await loadHotelOperationsWithClient(authorizedContext(), db);
  expect(result.state).toBe("ready"); expect(result.readAt).toBe(cut); expect(result.tasks.items[0].canonicalRef).toBe(task.id);
  expect(schema).not.toHaveBeenCalled();
});
it.each(["old_contract", "rpc_error", "bad_mode"])("does not invent data or bypass the %s transport", async reason => {
  mocks.selected.mockReturnValue(true);
  if (reason === "old_contract") mocks.rpc.mockResolvedValue({ generatedAt: cut });
  if (reason === "rpc_error") mocks.rpc.mockRejectedValue(new Error("private_sentinel"));
  if (reason === "bad_mode") mocks.selected.mockImplementation(() => { throw new Error("private_sentinel"); });
  const { db, schema } = database(); const result = await loadHotelOperationsWithClient(authorizedContext(), db);
  expect(result.state).toBe("unavailable"); expect(result.tasks.rowsRead).toBeNull(); expect(schema).not.toHaveBeenCalled();
  expect(JSON.stringify(result)).not.toContain("private_sentinel");
});
it("keeps an invalid task projection partial even when the RPC call succeeds", async () => {
  mocks.selected.mockReturnValue(true); mocks.rpc.mockResolvedValue({ generatedAt: cut,
    hotelOperations: { propertyId: scope.propertyId, tasks: { rows: [task, task], limit: 201 }, krossHealth: { rows: [], limit: 26 } } });
  const result = await loadHotelOperationsWithClient(authorizedContext(), database().db);
  expect(result.state).toBe("partial"); expect(result.tasks.state).toBe("unavailable"); expect(result.tasks.rowsRead).toBeNull();
});
