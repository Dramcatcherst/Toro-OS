import { describe, expect, it } from "vitest";

import type { BrainNode } from "@/lib/brain-contracts";
import { projectMediaNode } from "./media";

const base = {
  id: "00000000-0000-0000-0000-000000000101",
  orgId: "00000000-0000-0000-0000-000000000201",
  assetKey: "ROOM-25-HERO",
  assetType: "image",
  title: "Room 25 hero",
  publicUrl: "https://example.invalid/room25.jpg",
  subjectType: "room",
  subjectKey: "DC-ROOM-25",
  rightsStatus: "cleared",
  rightsVerified: true,
  publicSafe: true,
  verifiedStatus: "verified",
  requiresHumanVerification: false,
  riskLevel: "low",
  sourceSystem: "content.media_assets",
  lastVerified: "2026-09-22",
  nextReview: "2026-10-22",
  updatedAt: "2026-09-22T20:00:00Z",
} as const;

describe("Brain media contract", () => {
  it("supports a media node without requiring storage-private fields", () => {
    const node: BrainNode = {
      id: "media:room-25-hero",
      kind: "media",
      label: "Room 25 hero image",
      scopeRef: "org:dreamcatcher",
      status: "Ready",
      risk: "Low",
      verification: "verified",
      freshness: "current",
      sourceSystem: "content.media_assets",
      authoritySystem: "TORO Content",
      capabilities: {
        canOpen: true,
        canInspectEvidence: true,
        canPrepareAction: false,
        canExecute: false,
        canApprove: false,
        actionCeiling: "observe",
        approvalRequirement: "None",
      },
      media: {
        mediaType: "image",
        provenanceState: "verified",
        rightsState: "cleared",
        aiDisclosure: "original",
      },
    };

    expect(node.kind).toBe("media");
    expect(node.media?.rightsState).toBe("cleared");
    expect(JSON.stringify(node)).not.toContain("provider_path");
  });

  it("projects only minimized safe media metadata", () => {
    const node = projectMediaNode(base, new Date("2026-09-23T06:00:00Z"));

    expect(node?.kind).toBe("media");
    expect(node?.media?.rightsState).toBe("cleared");
    expect(node?.capabilities.canOpen).toBe(true);
    expect(JSON.stringify(node)).not.toMatch(
      /provider_path|source_path|internal_notes|raw_metadata/i,
    );
  });

  it("does not expose a media node as open when rights are unresolved", () => {
    const node = projectMediaNode(
      {
        ...base,
        rightsVerified: false,
        rightsStatus: "unknown",
        requiresHumanVerification: true,
      },
      new Date("2026-09-23T06:00:00Z"),
    );

    expect(node?.media?.rightsState).toBe("unknown");
    expect(node?.verification).not.toBe("verified");
    expect(node?.capabilities.canOpen).toBe(false);
  });

  it("fails closed on an unsupported media type", () => {
    expect(
      projectMediaNode(
        { ...base, assetType: "<script>" },
        new Date("2026-09-23T06:00:00Z"),
      ),
    ).toBeNull();
  });
});
