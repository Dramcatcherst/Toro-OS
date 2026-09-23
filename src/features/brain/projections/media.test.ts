import { describe, expect, it } from "vitest";

import type { BrainNode } from "@/lib/brain-contracts";

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
});
