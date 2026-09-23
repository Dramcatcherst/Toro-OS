import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import type { ToroResolvedContext } from "@/features/context/types";

import {
  loadCanonicalBrainReadSlice,
  projectCanonicalBrainReadSlice,
} from "./canonical-read";

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ORG_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const AUTHORITY_ID = "33333333-3333-4333-8333-333333333333";
const GOVERNANCE_ID = "44444444-4444-4444-8444-444444444444";
const KROSS_ID = "55555555-5555-4555-8555-555555555555";

function buildSlice() {
  return projectCanonicalBrainReadSlice({
    orgId: ORG_ID,
    generatedAt: "2026-09-23T11:00:00.000Z",
    projects: [
      {
        id: PROJECT_ID,
        project_name: "Visual Brain",
        priority: "P0",
        status: "active",
        business_area: "Product",
        canonical_module_key: "TORO_CORE",
        completion_pct: "42.5",
        needs_revalidation: false,
        source_system: "Supabase",
        updated_at: "2026-09-23T10:30:00.000Z",
      },
    ],
    sourceAuthority: [
      {
        id: AUTHORITY_ID,
        domain: "reservations",
        official_source: "Kross",
        human_approval_required: true,
        authority_level: "transactional",
        rule_status: "active",
        last_reviewed: "2026-09-23",
      },
    ],
    domainGovernance: [
      {
        id: GOVERNANCE_ID,
        domain: "reservations",
        criticality: "high",
        quality_target: "0.98",
        current_quality_score: "0.91",
        last_reviewed_at: "2026-09-23T09:00:00.000Z",
        next_review_at: "2026-09-24T09:00:00.000Z",
      },
    ],
    krossHealth: [
      {
        id: KROSS_ID,
        source_name: "Kross current reservations",
        snapshot_kind: "operational",
        source_as_of: "2026-09-23T10:15:00.000Z",
        observed_at: "2026-09-23T10:16:00.000Z",
        live_required: true,
        freshness_status: "fresh",
        safe_for_current_state: true,
      },
    ],
  });
}

function buildOrganizationContext(
  overrides: Partial<ToroResolvedContext> = {},
): ToroResolvedContext {
  return {
    userId: "synthetic-user",
    email: "synthetic@example.invalid",
    displayName: "Synthetic QA",
    mode: "organization",
    orgId: ORG_ID,
    membership: {
      orgId: ORG_ID,
      membershipId: null,
      membershipType: "employee",
      status: "active",
      roles: ["GERENCIA"],
      employeeId: "synthetic-employee",
      source: "legacy_user_roles",
    },
    availableOrgIds: [ORG_ID],
    allowedDataScopes: ["work_private", "work_org", "shared", "system"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
    ...overrides,
  };
}

function buildScopedClient() {
  const eqCalls: Array<{ path: string; field: string; value: unknown }> = [];

  const schema = vi.fn((schemaName: string) => ({
    from: vi.fn((tableName: string) => {
      const path = `${schemaName}.${tableName}`;
      const query = {
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
      };

      query.select.mockReturnValue(query);
      query.eq.mockImplementation((field: string, value: unknown) => {
        eqCalls.push({ path, field, value });
        return query;
      });
      query.order.mockReturnValue(query);
      query.limit.mockResolvedValue({ data: [], error: null });

      return query;
    }),
  }));

  return { client: { schema }, eqCalls };
}

describe("projectCanonicalBrainReadSlice", () => {
  it("projects only bounded safe fields for the first Stage C slice", () => {
    const slice = buildSlice();

    expect(slice.projects[0]).toEqual({
      ref: expect.stringMatching(/^project:[a-f0-9]{20}$/),
      label: "Visual Brain",
      status: "active",
      priority: "P0",
      businessArea: "Product",
      moduleKey: "TORO_CORE",
      completionPct: 42.5,
      needsRevalidation: false,
      sourceSystem: "Supabase",
      updatedAt: "2026-09-23T10:30:00.000Z",
    });

    expect(slice.krossHealth[0]).toMatchObject({
      freshness: "fresh",
      safeForCurrentState: true,
    });
  });

  it("does not expose canonical UUIDs in the projected payload", () => {
    const serialized = JSON.stringify(buildSlice());

    for (const rawId of [
      ORG_ID,
      PROJECT_ID,
      AUTHORITY_ID,
      GOVERNANCE_ID,
      KROSS_ID,
    ]) {
      expect(serialized).not.toContain(rawId);
    }
  });

  it("does not contain free-text or private-field names excluded from v1", () => {
    const serialized = JSON.stringify(buildSlice());

    for (const forbiddenKey of [
      "ownerName",
      "owner_name",
      "summary",
      "nextAction",
      "next_action",
      "notes",
      "sourceRecordId",
      "source_record_id",
      "supportingSources",
      "forbiddenSources",
      "readingRule",
    ]) {
      expect(serialized).not.toContain(forbiddenKey);
    }
  });

  it("keeps finance and guest data outside the first slice contract", () => {
    const slice = buildSlice() as Record<string, unknown>;

    expect(slice.finance).toBeUndefined();
    expect(slice.guests).toBeUndefined();
    expect(slice.payments).toBeUndefined();
    expect(slice.employees).toBeUndefined();
  });
});

describe("loadCanonicalBrainReadSlice isolation", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("rejects personal context before opening a canonical data client", async () => {
    const context = buildOrganizationContext({
      mode: "personal",
      orgId: null,
      membership: null,
      allowedDataScopes: ["personal", "shared", "system"],
      canUsePersonalVault: true,
      canUseOrganizationData: false,
    });

    await expect(loadCanonicalBrainReadSlice(context)).rejects.toThrow(
      "Canonical Brain read requires an active organization context.",
    );
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects a membership from a different organization before any read", async () => {
    const context = buildOrganizationContext({
      membership: {
        orgId: OTHER_ORG_ID,
        membershipId: null,
        membershipType: "employee",
        status: "active",
        roles: ["GERENCIA"],
        employeeId: "synthetic-employee",
        source: "legacy_user_roles",
      },
    });

    await expect(loadCanonicalBrainReadSlice(context)).rejects.toThrow(
      "Canonical Brain read requires an active organization context.",
    );
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects organization data when the resolved policy denies it", async () => {
    const context = buildOrganizationContext({
      allowedDataScopes: ["system"],
      canUseOrganizationData: false,
    });

    await expect(loadCanonicalBrainReadSlice(context)).rejects.toThrow(
      "Canonical Brain read requires an active organization context.",
    );
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("scopes every canonical source query to the active organization", async () => {
    const { client, eqCalls } = buildScopedClient();
    createServerSupabaseClientMock.mockResolvedValue(client);

    const slice = await loadCanonicalBrainReadSlice(buildOrganizationContext());

    expect(slice.projects).toEqual([]);
    expect(slice.sourceAuthority).toEqual([]);
    expect(slice.domainGovernance).toEqual([]);
    expect(slice.krossHealth).toEqual([]);

    const orgFilters = eqCalls.filter(({ field }) => field === "org_id");
    expect(orgFilters).toHaveLength(4);
    expect(orgFilters.every(({ value }) => value === ORG_ID)).toBe(true);
    expect(new Set(orgFilters.map(({ path }) => path))).toEqual(
      new Set([
        "operations.projects",
        "integrations.source_authority_rules",
        "integrations.domain_governance",
        "integrations.kross_snapshot_health",
      ]),
    );
  });
});
