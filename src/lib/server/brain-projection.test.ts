import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { resolveToroContextMock, loadCanonicalBrainReadSliceMock } = vi.hoisted(
  () => ({
    resolveToroContextMock: vi.fn(),
    loadCanonicalBrainReadSliceMock: vi.fn(),
  }),
);

vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: resolveToroContextMock,
}));

vi.mock("@/features/brain/canonical-read", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/brain/canonical-read")>();

  return {
    ...original,
    loadCanonicalBrainReadSlice: loadCanonicalBrainReadSliceMock,
  };
});

import type { ToroResolvedContext } from "@/features/context/types";
import type { CanonicalBrainReadSlice } from "@/features/brain/canonical-read";

import { loadBrainProjectionView } from "./brain-projection";

function resolvedContext(): ToroResolvedContext {
  return {
    userId: "synthetic-user",
    email: null,
    displayName: "Synthetic",
    mode: "organization",
    orgId: "org-a",
    membership: {
      orgId: "org-a",
      membershipId: null,
      membershipType: "employee",
      status: "active",
      roles: ["GERENCIA"],
      employeeId: "employee-a",
      source: "legacy_user_roles",
    },
    availableOrgIds: ["org-a"],
    allowedDataScopes: ["work_private", "work_org", "shared", "system"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

function canonicalSlice(): CanonicalBrainReadSlice {
  return {
    contractVersion: "stage-c-read-v1",
    generatedAt: "2026-09-23T12:00:00.000Z",
    scopeRef: "scope:aaaaaaaaaaaaaaaaaaaa",
    organization: {
      ref: "organization:bbbbbbbbbbbbbbbbbbbb",
      label: "Dreamcatcher Hotel",
      status: "active",
    },
    projects: [],
    sourceAuthority: [],
    domainGovernance: [],
    krossHealth: [],
  };
}

describe("loadBrainProjectionView canonical gate", () => {
  beforeEach(() => {
    resolveToroContextMock.mockReset();
    loadCanonicalBrainReadSliceMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps synthetic mode when the canonical-read flag is off", async () => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "");

    const view = await loadBrainProjectionView();

    expect(view.runtime).toMatchObject({
      mode: "synthetic_only",
      realData: false,
      externalWrite: false,
      stage: "B",
    });
    expect(view.projection.synthetic).toBe(true);
    expect(resolveToroContextMock).not.toHaveBeenCalled();
    expect(loadCanonicalBrainReadSliceMock).not.toHaveBeenCalled();
  });

  it("fails closed to synthetic when no authenticated context resolves", async () => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
    resolveToroContextMock.mockResolvedValue(null);

    const view = await loadBrainProjectionView();

    expect(view.runtime.realData).toBe(false);
    expect(view.projection.synthetic).toBe(true);
    expect(loadCanonicalBrainReadSliceMock).not.toHaveBeenCalled();
  });

  it("fails closed when organization choice is still required", async () => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
    resolveToroContextMock.mockResolvedValue({
      ...resolvedContext(),
      orgId: null,
      membership: null,
      availableOrgIds: ["org-a", "org-b"],
      allowedDataScopes: ["system"],
      canUseOrganizationData: false,
      requiresContextChoice: true,
    });

    const view = await loadBrainProjectionView();

    expect(view.runtime.realData).toBe(false);
    expect(view.runtime.reason).toContain("must choose an organization");
    expect(loadCanonicalBrainReadSliceMock).not.toHaveBeenCalled();
  });

  it("returns canonical read-only mode only for resolved organization context", async () => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
    resolveToroContextMock.mockResolvedValue(resolvedContext());
    loadCanonicalBrainReadSliceMock.mockResolvedValue(canonicalSlice());

    const view = await loadBrainProjectionView();

    expect(view.runtime).toEqual({
      mode: "canonical_read_only",
      realData: true,
      externalWrite: false,
      stage: "C",
      reason:
        "Authenticated, RLS-scoped canonical read projection. External writes remain disabled.",
    });
    expect(view.projection.synthetic).toBe(false);
    expect(view.projection.nodes[0]).toMatchObject({
      kind: "organization",
      label: "Dreamcatcher Hotel",
    });
  });

  it("retains synthetic mode when a canonical source read fails", async () => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
    resolveToroContextMock.mockResolvedValue(resolvedContext());
    loadCanonicalBrainReadSliceMock.mockRejectedValue(
      new Error("synthetic source failure"),
    );

    const view = await loadBrainProjectionView();

    expect(view.runtime.realData).toBe(false);
    expect(view.projection.synthetic).toBe(true);
    expect(view.runtime.reason).toContain("failed closed");
  });
});
