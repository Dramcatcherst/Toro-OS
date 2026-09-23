import { describe, expect, it } from "vitest";

import { projectKnowledgeNode } from "./knowledge";

const base = {
  id: "00000000-0000-0000-0000-000000000301",
  orgId: "00000000-0000-0000-0000-000000000201",
  knowledgeKey: "housekeeping_laundry_operating_manual_snapshot_2026_09_18_v1",
  title: "Housekeeping + Laundry",
  visibility: "internal",
  verifiedStatus: "verified",
  riskLevel: "high",
  requiresHumanVerification: true,
  lastVerified: "2026-09-18",
  nextReview: null,
  sourceSystem: "Notion/Supabase snapshot",
  sourceAsOf: "2026-09-19T07:02:14Z",
  projectionUpdatedAt: "2026-09-19T07:02:14Z",
  projectionStatus: "NORMALIZED_HISTORICAL_REFERENCE_NOT_OPERATIONAL_APPROVAL",
} as const;

describe("Knowledge Brain projection", () => {
  it("marks a normalized projection stale when the source is newer", () => {
    const node = projectKnowledgeNode(
      {
        ...base,
        sourceAsOf: "2026-09-20T07:02:14Z",
        projectionUpdatedAt: "2026-09-19T07:02:14Z",
      },
      new Date("2026-09-23T06:00:00Z"),
    );

    expect(node.freshness).toBe("stale");
    expect(node.verification).not.toBe("verified");
  });

  it("does not translate historical reference into operational approval", () => {
    const node = projectKnowledgeNode(
      base,
      new Date("2026-09-23T06:00:00Z"),
    );

    expect(node.summary).toMatch(/human review|historical|not operational/i);
    expect(node.capabilities.canExecute).toBe(false);
    expect(node.capabilities.canApprove).toBe(false);
  });

  it("does not expose full knowledge content through the Brain node", () => {
    const node = projectKnowledgeNode(
      base,
      new Date("2026-09-23T06:00:00Z"),
    );

    expect(JSON.stringify(node)).not.toMatch(/content_es|structured_content/i);
  });
});
