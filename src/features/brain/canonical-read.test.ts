import { describe, expect, it } from "vitest";

import {
  projectCanonicalBrainReadSlice,
} from "./canonical-read";

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const AUTHORITY_ID = "33333333-3333-4333-8333-333333333333";
const GOVERNANCE_ID = "44444444-4444-4444-8444-444444444444";
const KROSS_ID = "55555555-5555-4555-8555-555555555555";

function buildSlice() {
  return projectCanonicalBrainReadSlice({
    orgId: ORG_ID,
    generatedAt: "2026-09-23T11:00:00.000Z",
    organization: {
      id: ORG_ID,
      name: "Dreamcatcher Hotel",
      status: "active",
    },
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

describe("projectCanonicalBrainReadSlice", () => {
  it("projects only bounded safe fields for the first Stage C slice", () => {
    const slice = buildSlice();

    expect(slice.organization).toEqual({
      ref: expect.stringMatching(/^organization:[a-f0-9]{20}$/),
      label: "Dreamcatcher Hotel",
      status: "active",
    });

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
