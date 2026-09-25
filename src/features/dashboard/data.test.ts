import { describe, expect, test } from "vitest";

import { buildDashboardMvpData } from "./data";

describe("buildDashboardMvpData", () => {
  test("projects PayFlow and Studio canonical state without inventing values", () => {
    const data = buildDashboardMvpData({
      payflow: {
        updatedAt: "2026-09-25T06:00:00Z",
        structuredContent: {
          toro_payflow_v1: { status: "ACTIVE_DESIGN_STAGING_ON_PRIMARY" },
          payflow_priority_guide_r1: {
            P0: [{ provider: "A" }, { provider: "B" }],
            P1: [{ provider: "C" }],
          },
          payflow_audit_r3_20260924: {
            data_quality_recent: { business_mapping_pct: 100 },
          },
        },
      },
      studio: {
        updatedAt: "2026-09-25T06:10:00Z",
        structuredContent: {
          dreamcatcher_pilot_brief_v1: {
            status: "BRIEF_READY_DRAFT_PRODUCTION_ALLOWED",
            safe_asset_pack: [{ asset_key: "1" }, { asset_key: "2" }, { asset_key: "3" }],
            deliverables_draft: ["reel", "story"],
          },
          dreamcatcher_pilot_v1: {
            publication_gate: "approval required",
          },
        },
      },
    });

    expect(data.money.available).toBe(true);
    expect(data.money.p0Count).toBe(2);
    expect(data.money.p1Count).toBe(1);
    expect(data.money.businessMappingPct).toBe(100);
    expect(data.money.status).toBe("ACTIVE_DESIGN_STAGING_ON_PRIMARY");

    expect(data.studio.available).toBe(true);
    expect(data.studio.safeAssetCount).toBe(3);
    expect(data.studio.draftDeliverableCount).toBe(2);
    expect(data.studio.status).toBe("BRIEF_READY_DRAFT_PRODUCTION_ALLOWED");
    expect(data.studio.publicationGated).toBe(true);
  });

  test("fails closed when canonical knowledge is unavailable or malformed", () => {
    const data = buildDashboardMvpData({
      payflow: null,
      studio: {
        updatedAt: null,
        structuredContent: {},
      },
    });

    expect(data.money.available).toBe(false);
    expect(data.money.p0Count).toBeNull();
    expect(data.studio.available).toBe(false);
    expect(data.studio.safeAssetCount).toBeNull();
  });
});
