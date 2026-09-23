import { describe, expect, it } from "vitest";

import type { BrainNode } from "@/lib/brain-contracts";
import { composeDreamcatcherBrainSlice } from "./dreamcatcher";

const capabilities = {
  canOpen: true,
  canInspectEvidence: true,
  canPrepareAction: false,
  canExecute: false,
  canApprove: false,
  actionCeiling: "observe" as const,
  approvalRequirement: "None" as const,
};

const mediaNode: BrainNode = {
  id: "media:ROOM-25-HERO",
  kind: "media",
  label: "Room 25 hero",
  scopeRef: "org:dreamcatcher",
  status: "Ready",
  risk: "Low",
  verification: "verified",
  freshness: "current",
  sourceSystem: "content.media_assets",
  authoritySystem: "TORO Content",
  capabilities,
  media: {
    mediaType: "image",
    provenanceState: "verified",
    rightsState: "cleared",
    aiDisclosure: "unknown",
  },
};

const roomNode: BrainNode = {
  id: "room:DC-ROOM-25",
  kind: "asset",
  label: "Room 25",
  scopeRef: "org:dreamcatcher",
  status: "Active",
  risk: "Low",
  verification: "verified",
  freshness: "current",
  sourceSystem: "core.rooms",
  authoritySystem: "TORO Data",
  capabilities,
};

describe("composeDreamcatcherBrainSlice", () => {
  it("creates a relationship only from a verified assignment to a resolved target", () => {
    const slice = composeDreamcatcherBrainSlice({
      scopeRef: "org:dreamcatcher",
      knowledge: [],
      media: [mediaNode],
      targets: [roomNode],
      assignments: [
        {
          id: "assignment:1",
          assetId: "media:ROOM-25-HERO",
          targetType: "room",
          targetKey: "DC-ROOM-25",
          mediaRole: "hero",
          verifiedStatus: "verified",
          requiresHumanVerification: false,
        },
      ],
    });

    expect(slice.nodes.map((node) => node.id)).toEqual([
      "media:ROOM-25-HERO",
      "room:DC-ROOM-25",
    ]);
    expect(slice.edges).toContainEqual(
      expect.objectContaining({
        source: "media:ROOM-25-HERO",
        target: "room:DC-ROOM-25",
        relation: "connected_to",
        verification: "verified",
      }),
    );
  });

  it("does not promote a candidate assignment to a canonical edge", () => {
    const slice = composeDreamcatcherBrainSlice({
      scopeRef: "org:dreamcatcher",
      knowledge: [],
      media: [mediaNode],
      targets: [roomNode],
      assignments: [
        {
          id: "assignment:2",
          assetId: "media:ROOM-25-HERO",
          targetType: "room",
          targetKey: "DC-ROOM-25",
          mediaRole: "candidate",
          verifiedStatus: "needs_verification",
          requiresHumanVerification: true,
        },
      ],
    });

    expect(slice.edges).toEqual([]);
    expect(slice.partial).toBe(true);
  });

  it("does not create an edge when the target entity is unresolved", () => {
    const slice = composeDreamcatcherBrainSlice({
      scopeRef: "org:dreamcatcher",
      knowledge: [],
      media: [mediaNode],
      targets: [],
      assignments: [
        {
          id: "assignment:3",
          assetId: "media:ROOM-25-HERO",
          targetType: "room",
          targetKey: "DC-ROOM-25",
          mediaRole: "hero",
          verifiedStatus: "verified",
          requiresHumanVerification: false,
        },
      ],
    });

    expect(slice.edges).toEqual([]);
    expect(slice.partial).toBe(true);
  });
});
