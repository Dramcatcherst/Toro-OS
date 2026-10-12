import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
import type { CanonicalBrainReadSlice } from "@/features/brain/canonical-read";
const mocks = vi.hoisted(() => ({ context: vi.fn(), read: vi.fn(), client: vi.fn() }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: mocks.context }));
vi.mock("@/features/brain/canonical-read", () => ({ loadCanonicalBrainReadSliceWithClient: mocks.read }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.client }));
import { resolveCurrentToroReadOnlyMenu } from "./server";
import { portalProjectFocus } from "./portal-projects";

const slice = (): CanonicalBrainReadSlice => ({ contractVersion: "stage-c-read-v1", generatedAt: "2026-10-12T02:00:00Z",
  scopeRef: "scope:qa", organization: { ref: "organization:qa", label: "Synthetic", status: "active" },
  projects: [{ ref: "project:qa", label: "Synthetic project", status: "BLOCKED", priority: "P1", businessArea: null,
    moduleKey: null, completionPct: null, needsRevalidation: true, sourceSystem: null, updatedAt: "2026-08-01T00:00:00Z" }],
  sourceAuthority: [], domainGovernance: [], krossHealth: [] });
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "rpc_v1");
  const context = authorizedContext(); context.membership!.roles = ["ADMIN"];
  mocks.context.mockResolvedValue(context); mocks.read.mockResolvedValue(slice());
  mocks.client.mockResolvedValue({ schema: () => { throw new Error("Direct schema read forbidden"); } });
});
afterEach(() => vi.unstubAllEnvs());
it("reads approved projects once, exposes their historical evidence and keeps other sources blocked", async () => {
  const view = await resolveCurrentToroReadOnlyMenu("projects.status");
  expect(mocks.read).toHaveBeenCalledTimes(1);
  expect(view?.focus?.coverage).toContain("total organizacional desconocido");
  expect(view?.focus?.items[0].evidence?.observedAt).toBe("2026-08-01T00:00:00Z");
  expect(view?.focus?.items[0].detail).toBe("Requiere revalidación.");
  expect(view?.focusableCapabilities).toEqual(["projects.status"]);
  expect(view?.menu?.items.filter(item => item.state === "READ_ONLY").map(item => item.capability)).toEqual(["projects.status"]);
});
it("fails closed on RPC rejection without a direct fallback", async () => {
  mocks.read.mockRejectedValue(new Error("Scope changed"));
  const view = await resolveCurrentToroReadOnlyMenu("projects.status");
  expect(view?.focus).toBeNull(); expect(view?.focusableCapabilities).toEqual([]);
});
it("does not interpret an empty authorized batch as complete organization coverage", async () => {
  const data = slice(); data.projects = []; mocks.read.mockResolvedValue(data);
  const view = await resolveCurrentToroReadOnlyMenu("projects.status");
  expect(view?.focus).toBeNull(); expect(view?.focusableCapabilities).toEqual([]);
});
it("does not read projects when context choice is pending", async () => {
  const context = authorizedContext(); context.requiresContextChoice = true; mocks.context.mockResolvedValue(context);
  expect((await resolveCurrentToroReadOnlyMenu("projects.status"))?.state).toBe("context_choice_required");
  expect(mocks.read).not.toHaveBeenCalled();
});
it("rejects a misspelled transport without reading", async () => {
  vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "rpc_typo");
  expect((await resolveCurrentToroReadOnlyMenu("projects.status"))?.focus).toBeNull();
  expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.client).not.toHaveBeenCalled();
});
it("only serializes the evidence fields already approved for the project view", () => {
  const result = portalProjectFocus(slice(), "Proyectos");
  expect(JSON.stringify(result)).not.toContain("scope:qa");
  expect(JSON.stringify(result)).not.toContain("project:qa");
  expect(result.items[0].evidence.reportedSource).toBe("No informada");
  expect(result.coverage).toContain("tope 25");
});
