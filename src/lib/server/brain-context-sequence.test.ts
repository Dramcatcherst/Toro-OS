import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToroResolvedContext } from "@/features/context/types";
import type { CanonicalBrainReadSlice } from "@/features/brain/canonical-read";

const { resolveContextMock, readSliceMock, readSliceWithClientMock } = vi.hoisted(() => ({
  resolveContextMock: vi.fn(),
  readSliceMock: vi.fn(),
  readSliceWithClientMock: vi.fn(),
}));

// Only the session and I/O boundaries are substituted. The provider, deployment
// gate, canonical mapper and demo fixtures are the real application modules.
// These are synthetic contract tests, not hosted authentication or RLS proof.
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: resolveContextMock }));
vi.mock("@/features/brain/canonical-read", () => ({
  loadCanonicalBrainReadSlice: readSliceMock,
  loadCanonicalBrainReadSliceWithClient: readSliceWithClientMock,
}));

import {
  loadBrainProjectionView,
  loadBrainProjectionViewForContext,
  type BrainProjectionView,
} from "./brain-projection";

const routes = ["explicit-context", "session-resolver"] as const;
type Route = (typeof routes)[number];
// Neither test client can make a network call; the adapter is replaced above.
const clientA = Object.freeze({}) as SupabaseClient;
const clientB = Object.freeze({}) as SupabaseClient;

function context(orgId = "synthetic-org-a"): ToroResolvedContext {
  return {
    userId: "synthetic-user", email: null, displayName: "Synthetic",
    mode: "organization", orgId,
    membership: {
      orgId, membershipId: null, membershipType: "employee", status: "active",
      roles: ["GERENCIA"], employeeId: null, source: "legacy_user_roles",
    },
    availableOrgIds: [orgId],
    allowedDataScopes: ["work_private", "work_org", "shared", "system"],
    allowedTools: [], canUsePersonalVault: false, canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

function sliceForContext(c: ToroResolvedContext): CanonicalBrainReadSlice {
  const second = c.orgId === "synthetic-org-b";
  return {
    contractVersion: "stage-c-read-v1", generatedAt: "2026-10-10T21:00:00.000Z",
    scopeRef: `scope:${(second ? "b" : "a").repeat(20)}`,
    organization: {
      ref: `organization:${(second ? "d" : "c").repeat(20)}`,
      label: second ? "Synthetic organization B" : "Synthetic organization A",
      status: "active",
    },
    projects: [], sourceAuthority: [], domainGovernance: [], krossHealth: [],
  };
}

async function invoke(route: Route, c: ToroResolvedContext | null = context()) {
  if (route === "session-resolver") {
    resolveContextMock.mockResolvedValue(c);
    return loadBrainProjectionView();
  }
  if (!c) throw new Error("The explicit-context fixture requires a context.");
  return loadBrainProjectionViewForContext(c, c.orgId === "synthetic-org-b" ? clientB : clientA);
}

function expectSyntheticWithoutPreviousData(view: BrainProjectionView) {
  expect(view.runtime).toMatchObject({
    mode: "synthetic_only", realData: false, externalWrite: false, stage: "B",
  });
  expect(view.projection.synthetic).toBe(true);
  expect(JSON.stringify(view)).not.toContain("Synthetic organization A");
  expect(JSON.stringify(view)).not.toContain("Synthetic organization B");
  expect(JSON.stringify(view)).not.toContain("PRIVATE_SENTINEL");
}

async function firstAuthorizedRead(route: Route) {
  const first = await invoke(route);
  expect(first.runtime).toMatchObject({ realData: true, externalWrite: false, stage: "C" });
  expect(first.projection.synthetic).toBe(false);
  expect(first.projection.nodes.some(node => node.label === "Synthetic organization A")).toBe(true);
  readSliceMock.mockClear();
  readSliceWithClientMock.mockClear();
  resolveContextMock.mockClear();
}

const deniedContexts: [string, (c: ToroResolvedContext) => ToroResolvedContext][] = [
  // Intentionally contradictory derived grant: mode must still independently deny.
  ["personal mode with a stale organization grant", c => ({ ...c, mode: "personal" })],
  ["missing organization", c => ({ ...c, orgId: null })],
  ["missing membership", c => ({ ...c, membership: null })],
  ["invited membership", c => ({ ...c, membership: { ...c.membership!, status: "invited" } })],
  ["suspended membership", c => ({ ...c, membership: { ...c.membership!, status: "suspended" } })],
  ["offboarded membership", c => ({ ...c, membership: { ...c.membership!, status: "offboarded" } })],
  ["another organization's membership", c => ({ ...c, membership: { ...c.membership!, orgId: "synthetic-org-b" } })],
  ["withdrawn organization data grant", c => ({ ...c, canUseOrganizationData: false })],
  ["organization choice still required", c => ({ ...c, requiresContextChoice: true })],
];

beforeEach(() => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
  resolveContextMock.mockReset();
  readSliceMock.mockReset().mockImplementation(sliceForContext);
  readSliceWithClientMock.mockReset().mockImplementation(sliceForContext);
});
afterEach(() => vi.unstubAllEnvs());

for (const route of routes) {
  describe(`Brain context sequence: ${route}`, () => {
    it.each(deniedContexts)("does not reuse an authorized result after %s", async (_name, change) => {
      await firstAuthorizedRead(route);
      const denied = await invoke(route, change(context()));
      expectSyntheticWithoutPreviousData(denied);
      expect(readSliceMock).not.toHaveBeenCalled();
      expect(readSliceWithClientMock).not.toHaveBeenCalled();
    });

    it("does not return the previous canonical result after a source failure", async () => {
      await firstAuthorizedRead(route);
      readSliceMock.mockRejectedValue(new Error("SOURCE_FAILURE_PRIVATE_SENTINEL"));
      readSliceWithClientMock.mockRejectedValue(new Error("SOURCE_FAILURE_PRIVATE_SENTINEL"));
      expectSyntheticWithoutPreviousData(await invoke(route));
    });

    it("honors a disabled read gate after a successful read", async () => {
      await firstAuthorizedRead(route);
      vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "false");
      expectSyntheticWithoutPreviousData(await invoke(route));
      expect(readSliceMock).not.toHaveBeenCalled();
      expect(readSliceWithClientMock).not.toHaveBeenCalled();
      expect(resolveContextMock).not.toHaveBeenCalled();
    });

    it("keeps public demo closed even when the canonical read flag is true", async () => {
      vi.stubEnv("TORO_DEPLOYMENT_MODE", "public_demo");
      expectSyntheticWithoutPreviousData(await invoke(route));
      expect(readSliceMock).not.toHaveBeenCalled();
      expect(readSliceWithClientMock).not.toHaveBeenCalled();
      expect(resolveContextMock).not.toHaveBeenCalled();
    });

    it("returns only scope B after scope A and preserves the caller's read path", async () => {
      await firstAuthorizedRead(route);
      const secondContext = context("synthetic-org-b");
      const second = await invoke(route, secondContext);
      expect(second.runtime).toMatchObject({ realData: true, externalWrite: false, stage: "C" });
      expect(second.projection.synthetic).toBe(false);
      expect(second.projection.context.scopeRef).toBe(`scope:${"b".repeat(20)}`);
      expect(JSON.stringify(second)).toContain("Synthetic organization B");
      expect(JSON.stringify(second)).not.toContain("Synthetic organization A");
      if (route === "explicit-context") {
        expect(readSliceWithClientMock).toHaveBeenCalledTimes(1);
        expect(readSliceWithClientMock).toHaveBeenCalledWith(secondContext, clientB);
        expect(readSliceMock).not.toHaveBeenCalled();
        expect(resolveContextMock).not.toHaveBeenCalled();
      } else {
        expect(readSliceMock).toHaveBeenCalledTimes(1);
        expect(readSliceMock).toHaveBeenCalledWith(secondContext);
        expect(readSliceWithClientMock).not.toHaveBeenCalled();
      }
    });
  });
}

it("discards the previous canonical result when the session no longer resolves", async () => {
  await firstAuthorizedRead("session-resolver");
  expectSyntheticWithoutPreviousData(await invoke("session-resolver", null));
  expect(readSliceMock).not.toHaveBeenCalled();
  expect(readSliceWithClientMock).not.toHaveBeenCalled();
});

it("hides resolver errors and previous data after a successful session read", async () => {
  await firstAuthorizedRead("session-resolver");
  resolveContextMock.mockRejectedValue(new Error("SESSION_FAILURE_PRIVATE_SENTINEL"));
  expectSyntheticWithoutPreviousData(await loadBrainProjectionView());
  expect(readSliceMock).not.toHaveBeenCalled();
  expect(readSliceWithClientMock).not.toHaveBeenCalled();
});
