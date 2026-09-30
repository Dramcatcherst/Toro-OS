import type { BrainNode, BrainProjection, BrainSourceSummary } from "@/lib/brain-contracts";
import type { BrainLayout, BrainProjectionView } from "@/lib/server/brain-projection";

export type BrainDisplayMode = "demo" | "read-only" | "unavailable";
export type BrainClientView = {
  projection: Omit<BrainProjection, "degradedReason">;
  layout: BrainLayout;
  mode: BrainDisplayMode;
  externalWrite: false;
};

function pick<T, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  return Object.fromEntries(keys.map(key => [key, source[key]])) as Pick<T, K>;
}

/** Presentation only. Authorization and RLS remain the server provider's job. */
export function toBrainClientView({ projection: p, layout, runtime }: BrainProjectionView): BrainClientView {
  const demo = p.synthetic && runtime.mode === "synthetic_only" && !runtime.realData && runtime.stage === "B";
  const canonical = !p.synthetic && runtime.mode === "canonical_read_only" && runtime.realData && runtime.stage === "C";
  const mode: BrainDisplayMode = runtime.externalWrite === false && (demo || canonical)
    ? demo ? "demo" : "read-only" : "unavailable";
  if (mode === "unavailable") return {
    mode, externalWrite: false, layout: {},
    projection: {
      contractVersion: "1.0.0", generatedAt: "", mode: "workspace", synthetic: false,
      context: { mode: "organization", scopeRef: "unavailable", isolationMode: "private" },
      nodes: [], edges: [], sources: [], recentEvents: [], partial: true,
    },
  };
  return {
    mode, externalWrite: false,
    layout: Object.fromEntries(p.nodes.flatMap(({ id }) => {
      const point = layout[id];
      return point && Number.isFinite(point.x) && Number.isFinite(point.y)
        ? [[id, { x: point.x, y: point.y }]] : [];
    })),
    projection: {
      ...pick(p, ["contractVersion", "generatedAt", "mode", "synthetic", "partial"]),
      context: pick(p.context, ["mode", "scopeRef", "organizationRef", "workspaceRef", "isolationMode"]),
      nodes: p.nodes.map(node => ({
        ...pick(node, ["id", "kind", "label", "scopeRef", "status", "risk", "verification", "freshness",
          "sourceSystem", "authoritySystem", "activity", "health", "summary"]),
        capabilities: pick(node.capabilities, ["canOpen", "canInspectEvidence", "canPrepareAction", "canExecute",
          "canApprove", "actionCeiling", "approvalRequirement"]),
        metric: node.metric ? pick(node.metric, ["label", "value", "unit"]) : undefined,
      })),
      edges: p.edges.map(edge => pick(edge, ["id", "source", "target", "relation", "status", "risk",
        "verification", "freshness", "summary"])),
      sources: p.sources.map(source => pick(source, ["sourceSystem", "authoritySystem", "freshness",
        "verification", "observedAt", "authoritative"])),
      recentEvents: p.recentEvents?.map(event => ({
        ...pick(event, ["eventId", "occurredAt", "scopeRef", "actorKind", "actorRef", "eventType", "entityKind",
          "entityRef", "summary", "sourceSystem", "authoritySystem", "risk", "approvalState", "executionState",
          "verificationState", "redactionClass", "correlationId", "parentEventId", "workflowRunRef", "actionRef"]),
        evidenceRefs: [...event.evidenceRefs],
      })),
    },
  };
}

export function sourceObservation(source: BrainSourceSummary): string | null {
  const value = source.observedAt;
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const time = Date.parse(value);
  if (!Number.isFinite(time) || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  return new Date(time).toISOString();
}

export function allAttentionNodes(projection: BrainProjection): BrainNode[] {
  const rank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return projection.nodes.filter(node => node.risk === "Critical" || node.risk === "High" ||
    node.status === "Blocked" || node.status === "Review" ||
    node.verification === "unverified" || node.verification === "conflicted")
    .sort((a, b) => rank[a.risk] - rank[b.risk] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Four highlights are a summary, never the universe of searchable attention. */
export function attentionNodes(projection: BrainProjection): BrainNode[] {
  return allAttentionNodes(projection).slice(0, 4);
}
