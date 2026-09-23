import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveToroContext, createServerSupabaseClient } = vi.hoisted(() => ({
  resolveToroContext: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/features/context/resolver", () => ({ resolveToroContext }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));

import { loadAuthorizedBrainProjection } from "./server";

const ORG_A = "00000000-0000-4000-8000-0000000000aa";
const ORG_B = "00000000-0000-4000-8000-0000000000bb";

const context = {
  userId: "user-a",
  email: "synthetic@example.invalid",
  displayName: "Synthetic QA",
  mode: "organization" as const,
  orgId: ORG_A,
  membership: {
    orgId: ORG_A,
    membershipId: null,
    membershipType: "employee" as const,
    status: "active" as const,
    roles: ["GERENCIA" as const],
    employeeId: "employee-a",
    source: "legacy_user_roles" as const,
  },
  availableOrgIds: [ORG_A],
  allowedDataScopes: ["work_org" as const, "shared" as const, "system" as const],
  allowedTools: [],
  canUsePersonalVault: false,
  canUseOrganizationData: true,
  requiresContextChoice: false,
};

type Result = { data: unknown[] | null; error: { message?: string } | null };

function query(result: Result) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(async () => result),
  };
  return chain;
}

function client(results?: Partial<Record<string, Result>>) {
  const queries = new Map<string, ReturnType<typeof query>>();

  const schema = vi.fn((schemaName: string) => ({
    from: (table: string) => {
      const key = `${schemaName}.${table}`;
      const q = query(
        results?.[key] ?? {
          data: [],
          error: null,
        },
      );
      queries.set(key, q);
      return q;
    },
  }));

  return { client: { schema }, queries };
}

describe("loadAuthorizedBrainProjection", () => {
  beforeEach(() => {
    resolveToroContext.mockReset();
    createServerSupabaseClient.mockReset();
  });

  it("fails closed before reading business data when organization context is unavailable", async () => {
    resolveToroContext.mockResolvedValue(null);

    await expect(
      loadAuthorizedBrainProjection({ mode: "organization", orgId: ORG_B }),
    ).resolves.toBeNull();

    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("scopes every canonical source query to the resolved organization", async () => {
    resolveToroContext.mockResolvedValue(context);
    const fixture = client();
    createServerSupabaseClient.mockResolvedValue(fixture.client);

    const projection = await loadAuthorizedBrainProjection({
      mode: "organization",
      orgId: ORG_B,
    });

    expect(projection?.context.organizationRef).toBe(ORG_A);
    expect(projection?.synthetic).toBe(false);
    for (const key of [
      "operations.knowledge_items",
      "content.media_assets",
      "content.media_assignments",
      "core.rooms",
    ]) {
      expect(fixture.queries.get(key)?.eq).toHaveBeenCalledWith("org_id", ORG_A);
    }
  });

  it("returns minimized Knowledge and media projections without raw structured content", async () => {
    resolveToroContext.mockResolvedValue(context);
    const fixture = client({
      "operations.knowledge_items": {
        data: [
          {
            id: "00000000-0000-0000-0000-000000000301",
            org_id: ORG_A,
            knowledge_key: "housekeeping_laundry_operating_manual_snapshot_2026_09_18_v1",
            title: "Housekeeping + Laundry",
            visibility: "internal",
            verified_status: "verified",
            risk_level: "high",
            requires_human_verification: true,
            last_verified: "2026-09-18",
            next_review: null,
            source_system: "Notion/Supabase snapshot",
            structured_content: {
              normalized_projection_r3: {
                source_as_of: "2026-09-19T07:02:14Z",
                recorded_at: "2026-09-23T06:30:23Z",
                status: "NORMALIZED_HISTORICAL_REFERENCE_NOT_OPERATIONAL_APPROVAL",
                body_markdown: "must-not-leak",
              },
            },
            updated_at: "2026-09-23T06:30:23Z",
          },
        ],
        error: null,
      },
      "content.media_assets": {
        data: [
          {
            id: "00000000-0000-0000-0000-000000000101",
            org_id: ORG_A,
            asset_key: "ROOM-25-HERO",
            asset_type: "image",
            title: "Room 25 hero",
            public_url: "https://example.invalid/room25.jpg",
            subject_type: "room",
            subject_key: "DC-ROOM-25",
            rights_status: "pending",
            rights_verified: false,
            public_safe: false,
            verified_status: "needs_verification",
            requires_human_verification: true,
            risk_level: "high",
            source_system: "dropbox",
            last_verified: "2026-09-14",
            next_review: null,
            updated_at: "2026-09-14T23:08:56Z",
            source_path: "must-not-leak",
          },
        ],
        error: null,
      },
    });
    createServerSupabaseClient.mockResolvedValue(fixture.client);

    const projection = await loadAuthorizedBrainProjection();

    expect(projection?.nodes.some((node) => node.kind === "knowledge")).toBe(true);
    expect(projection?.nodes.some((node) => node.kind === "media")).toBe(true);
    expect(JSON.stringify(projection)).not.toMatch(
      /must-not-leak|body_markdown|structured_content|source_path/i,
    );
  });

  it("degrades safely when one source read fails without exposing the raw error", async () => {
    resolveToroContext.mockResolvedValue(context);
    const fixture = client({
      "content.media_assets": {
        data: null,
        error: { message: "permission denied: secret detail" },
      },
    });
    createServerSupabaseClient.mockResolvedValue(fixture.client);

    const projection = await loadAuthorizedBrainProjection();

    expect(projection?.partial).toBe(true);
    expect(projection?.degradedReason).toMatch(/source unavailable/i);
    expect(JSON.stringify(projection)).not.toContain("secret detail");
  });
});
