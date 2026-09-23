import type {
  BrainEdge,
  BrainNode,
  BrainSourceSummary,
} from "@/lib/brain-contracts";

import type { SafeMediaAssignment } from "./types";

export type DreamcatcherBrainSlice = {
  nodes: BrainNode[];
  edges: BrainEdge[];
  sources: BrainSourceSummary[];
  partial: boolean;
  degradedReason?: string;
};

const TARGET_PREFIX: Record<SafeMediaAssignment["targetType"], string> = {
  room: "room",
  knowledge: "knowledge",
  asset: "asset",
};

function sourceSummaries(nodes: BrainNode[]): BrainSourceSummary[] {
  const summaries = new Map<string, BrainSourceSummary>();

  for (const node of nodes) {
    const key = `${node.sourceSystem}::${node.authoritySystem}`;
    const current = summaries.get(key);

    if (!current) {
      summaries.set(key, {
        sourceSystem: node.sourceSystem,
        authoritySystem: node.authoritySystem,
        freshness: node.freshness,
        verification: node.verification,
        authoritative: node.sourceSystem === node.authoritySystem,
      });
      continue;
    }

    if (node.freshness === "stale") current.freshness = "stale";
    if (
      node.verification === "unverified" ||
      node.verification === "conflicted"
    ) {
      current.verification = node.verification;
    } else if (
      node.verification === "partially_verified" &&
      current.verification === "verified"
    ) {
      current.verification = "partially_verified";
    }
  }

  return [...summaries.values()].sort((a, b) =>
    a.sourceSystem.localeCompare(b.sourceSystem),
  );
}

export function composeDreamcatcherBrainSlice(input: {
  scopeRef: string;
  knowledge: BrainNode[];
  media: BrainNode[];
  targets: BrainNode[];
  assignments: SafeMediaAssignment[];
}): DreamcatcherBrainSlice {
  let partial = false;

  const allNodes = [...input.knowledge, ...input.media, ...input.targets];
  const scopedNodes = allNodes.filter((node) => {
    const allowed = node.scopeRef === input.scopeRef;
    if (!allowed) partial = true;
    return allowed;
  });

  const nodeMap = new Map<string, BrainNode>();
  for (const node of scopedNodes) nodeMap.set(node.id, node);

  const edges: BrainEdge[] = [];

  for (const assignment of input.assignments) {
    const verified =
      assignment.verifiedStatus.trim().toLowerCase() === "verified" &&
      !assignment.requiresHumanVerification;

    if (!verified) {
      partial = true;
      continue;
    }

    const source = nodeMap.get(assignment.assetId);
    const targetId = `${TARGET_PREFIX[assignment.targetType]}:${assignment.targetKey}`;
    const target = nodeMap.get(targetId);

    if (!source || source.kind !== "media" || !target) {
      partial = true;
      continue;
    }

    edges.push({
      id: `edge:media-assignment:${assignment.id}`,
      source: source.id,
      target: target.id,
      relation: "connected_to",
      verification: "verified",
      freshness:
        source.freshness === "stale" || target.freshness === "stale"
          ? "stale"
          : "current",
      summary: `${assignment.mediaRole} media assignment`,
    });
  }

  const nodes = [...nodeMap.values()].sort((a, b) => a.id.localeCompare(b.id));
  edges.sort((a, b) => a.id.localeCompare(b.id));

  return {
    nodes,
    edges,
    sources: sourceSummaries(nodes),
    partial,
    degradedReason: partial
      ? "Some candidate, unresolved, stale-scope or unverified relationships were omitted."
      : undefined,
  };
}
