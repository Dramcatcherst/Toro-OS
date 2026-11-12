import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { view, attention } = vi.hoisted(() => ({ view: vi.fn(), attention: vi.fn() }));
vi.mock("@/lib/server/brain-projection", () => ({ loadBrainProjectionViewForContext: view, loadBrainProjectionView: view }));
vi.mock("@/features/attention/owner-attention-server", () => ({ loadOwnerAttentionProjectionWithClient: attention, loadOwnerAttentionProjection: attention }));
import { runToroMcpReadTool } from "./read-adapter-server";
import type { ToroResolvedContext } from "@/features/context/types";
const context = { mode: "organization", userId: "synthetic-user", orgId: "synthetic-org", canUseOrganizationData: true, allowedDataScopes: ["work_org"], requiresContextChoice: false, membership: { status: "active", orgId: "synthetic-org", roles: ["ADMIN"] } } as unknown as ToroResolvedContext;
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true"); vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", "true"); view.mockResolvedValue({ runtime: { realData: false }, projection: { synthetic: true } }); attention.mockResolvedValue({ items: [], generatedAt: "2026-10-22T10:00:00Z", contractVersion: "owner-attention-v1", coverage: { partial: true } }); });
afterEach(() => vi.unstubAllEnvs());
it("R50-10 reads priority evidence without unrelated Brain sources or layout", async () => {
  const result = await runToroMcpReadTool("get_priorities", {}, { context, supabase: {} as never });
  expect(result.error).toBeUndefined(); expect(result.partial).toBe(true);
  expect(result.context?.scopeRef).toBeTruthy();
  expect(attention).toHaveBeenCalledOnce(); expect(view).not.toHaveBeenCalled();
});
it.each(["TORO_BRAIN_CANONICAL_READ_ENABLED", "TORO_OWNER_ATTENTION_READ_ENABLED"])("R50-10 preserves %s gate before priority reads", async flag => {
  vi.stubEnv(flag, "false"); const result = await runToroMcpReadTool("get_priorities", {}, { context, supabase: {} as never });
  expect(result.error).toBeDefined(); expect(attention).not.toHaveBeenCalled(); expect(view).not.toHaveBeenCalled();
});
it("R50-10 preserves role and context restrictions", async () => {
  const denied = { ...context, membership: { ...context.membership!, roles: ["EMPLEADO"] } } as ToroResolvedContext;
  expect((await runToroMcpReadTool("get_priorities", {}, { context: denied, supabase: {} as never })).error).toBeDefined();
  expect(attention).not.toHaveBeenCalled(); expect(view).not.toHaveBeenCalled();
});
it.each([
  { requiresContextChoice: true }, { canUseOrganizationData: false },
  { membership: { ...context.membership!, status: "suspended" } },
  { membership: { ...context.membership!, orgId: "other-org" } },
])("R50-10 rejects unresolved organization access %j before reads", async changed => {
  const denied = { ...context, ...changed } as ToroResolvedContext;
  expect((await runToroMcpReadTool("get_priorities", {}, { context: denied, supabase: {} as never })).error).toBeDefined();
  expect(attention).not.toHaveBeenCalled(); expect(view).not.toHaveBeenCalled();
});
it("R50-08 rejects reversed receipt bounds at the tool boundary without I/O", async () => {
  const result = await runToroMcpReadTool("get_execution_receipts", { since: "2026-10-23T00:00:00Z", until: "2026-10-22T00:00:00Z" }, { context, supabase: {} as never });
  expect(result.error?.code).toBe("invalid_request"); expect(view).not.toHaveBeenCalled();
});
