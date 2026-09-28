"use client";

import { useState } from "react";
import { Activity, Bot, Brain, Building2, Database, FileCheck2, FolderKanban, Gauge, LockKeyhole } from "lucide-react";
import type { BrainEdge, BrainNode, BrainProjection } from "@/lib/brain-contracts";
import type { BrainLayout } from "@/lib/server/brain-projection";
import styles from "./brain.module.css";

const icons: Partial<Record<BrainNode["kind"], typeof Brain>> = {
  organization: Building2, agent: Bot, connector: Database, kpi: Gauge,
  evidence: FileCheck2, project: FolderKanban, approval: LockKeyhole, decision: Brain,
};
const riskClass = { Low: styles.riskLow, Medium: styles.riskMedium, High: styles.riskHigh, Critical: styles.riskCritical };

// Reveal only supplied, permission-filtered nodes. A relationship is not a parent-child claim.
export function initialBrainNodes(projection: BrainProjection, layout: BrainLayout): string[] {
  const known = new Set(projection.nodes.filter((node) => layout[node.id]).map((node) => node.id));
  const validEdges = projection.edges.filter((edge) => known.has(edge.source) && known.has(edge.target));
  const incoming = new Set(validEdges.map((edge) => edge.target));
  const neighbors = new Map([...known].map((id) => [id, [] as string[]]));
  validEdges.forEach((edge) => {
    neighbors.get(edge.source)?.push(edge.target);
    neighbors.get(edge.target)?.push(edge.source);
  });
  const visited = new Set<string>();
  const seeds: string[] = [];
  for (const id of known) {
    if (visited.has(id)) continue;
    const component: string[] = [];
    const pending = [id];
    visited.add(id);
    while (pending.length) {
      const current = pending.pop()!;
      component.push(current);
      for (const neighbor of neighbors.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          pending.push(neighbor);
        }
      }
    }
    const roots = component.filter((nodeId) => !incoming.has(nodeId));
    seeds.push(...(roots.length ? roots : component.slice(0, 1)));
  }
  const visible = new Set(seeds);
  let frontier = [...visible];
  for (let depth = 0; depth < 2; depth += 1) {
    const next = projection.edges.filter((edge) => frontier.includes(edge.source) && known.has(edge.target)).map((edge) => edge.target);
    next.forEach((id) => visible.add(id));
    frontier = next;
  }
  return [...visible];
}

export function unrevealedNeighbors(id: string, projection: BrainProjection, visible: ReadonlySet<string>, layout: BrainLayout): string[] {
  const known = new Set(projection.nodes.filter((node) => layout[node.id]).map((node) => node.id));
  return [...new Set(projection.edges.flatMap((edge) => {
    if (edge.source === id && known.has(edge.target) && !visible.has(edge.target)) return [edge.target];
    if (edge.target === id && known.has(edge.source) && !visible.has(edge.source)) return [edge.source];
    return [];
  }))];
}

function connectionTooltip(edge: BrainEdge, labels: Map<string, string>, synthetic: boolean) {
  const source = labels.get(edge.source) ?? "Unknown source";
  const target = labels.get(edge.target) ?? "Unknown target";
  const verification = edge.verification?.replaceAll("_", " ") ?? "verification not reported";
  return `${synthetic ? "Example" : "Read-only"} link: ${source} ${edge.relation.replaceAll("_", " ")} ${target}. ${verification} · ${edge.freshness ?? "freshness not reported"}.`;
}

function NodeCard({ node, layout, hiddenCount, expand }: { node: BrainNode; layout: BrainLayout; hiddenCount: number; expand: () => void }) {
  const Icon = icons[node.kind] ?? Activity;
  const point = layout[node.id];
  if (!point) return null;
  return <article
    className={[styles.node, riskClass[node.risk], node.activity && ["reading", "analyzing", "executing", "verifying"].includes(node.activity) ? styles.nodeActive : ""].join(" ")}
    style={{ left: `${point.x}%`, top: `${point.y}%` }}
    aria-label={`${node.label}. ${node.status}. Risk ${node.risk}. ${node.verification.replaceAll("_", " ")} verification.`}
    data-brain-visible-node={node.id}
  >
    <div className={styles.nodeHead}><span className={styles.nodeIcon}><Icon aria-hidden="true" /></span><span className={styles.nodeKind}>{node.kind}</span></div>
    <h3>{node.label}</h3>
    {node.metric ? <div className={styles.metric}><strong>{node.metric.value}{node.metric.unit}</strong><span>{node.metric.label}</span></div> : null}
    <p>{node.summary}</p>
    <div className={styles.nodeMeta}><span>{node.status}</span><span>{node.freshness}</span><span>{node.verification.replaceAll("_", " ")}</span></div>
    {hiddenCount > 0 ? <button type="button" className={styles.nodeExpand} data-brain-expand={node.id} onClick={expand} aria-label={`Reveal ${hiddenCount} connected ${hiddenCount === 1 ? "neuron" : "neurons"} from ${node.label}`} title="Reveal connected neurons in this map">+{hiddenCount} connections</button> : null}
  </article>;
}

export function BrainMap({ projection, layout }: { projection: BrainProjection; layout: BrainLayout }) {
  const [visibleIds, setVisibleIds] = useState(() => initialBrainNodes(projection, layout));
  const visible = new Set(visibleIds);
  const nodes = projection.nodes.filter((node) => visible.has(node.id) && layout[node.id]);
  const edges = projection.edges.filter((edge) => visible.has(edge.source) && visible.has(edge.target) && layout[edge.source] && layout[edge.target]);
  const labels = new Map(projection.nodes.map((node) => [node.id, node.label]));
  const layerCounts = new Map<number, number>();
  nodes.forEach((node) => layerCounts.set(layout[node.id].y, (layerCounts.get(layout[node.id].y) ?? 0) + 1));
  const nodeSize = Math.max(22, Math.min(38, Math.floor(220 / Math.max(1, ...layerCounts.values()))));
  const expand = (id: string) => {
    const next = unrevealedNeighbors(id, projection, visible, layout);
    if (next.length) setVisibleIds((current) => [...new Set([...current, ...next])]);
  };

  return <>
    <nav className={styles.mobileMap} data-brain-mini-map="true" aria-label={projection.synthetic ? "Synthetic visual Brain overview" : "Read-only visual Brain overview"}>
      <div className={styles.mobileMapHeading}><strong>{projection.synthetic ? "Example network" : "Connected records"}</strong><span>{nodes.length} / {projection.nodes.length} nodes · {edges.length} visible links</span></div>
      <div className={styles.mobileMapCanvas}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map((edge) => {
            const from = layout[edge.source], to = layout[edge.target];
            return <g key={edge.id}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={edge.freshness === "current" && edge.verification === "verified" ? styles.mobileMapEdge : styles.mobileMapEdgeReview} data-brain-relation={edge.relation} /><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={styles.mobileMapEdgeHit} data-brain-edge-tooltip="true"><title>{connectionTooltip(edge, labels, projection.synthetic)}</title></line></g>;
          })}
        </svg>
        {nodes.map((node) => {
          const point = layout[node.id], Icon = icons[node.kind] ?? Activity;
          const hiddenCount = unrevealedNeighbors(node.id, projection, visible, layout).length;
          return <details key={node.id} className={styles.mobileMapNode} data-kind={node.kind} data-side={point.x < 35 ? "left" : point.x > 65 ? "right" : "center"} data-vertical={point.y > 50 ? "above" : "below"} name="brain-map-node" style={{ left: `${point.x}%`, top: `${point.y}%`, width: 44, height: 44 }}>
            <summary aria-label={`${node.label}. ${node.status}. Show details.`} title={node.label}><span className={styles.mobileMapVisual} style={{ width: nodeSize, height: nodeSize }}><Icon aria-hidden="true" /></span></summary>
            <div className={styles.mobileMapPopover}>
              <strong>{node.label}</strong><span>Status: {node.status} · Verification: {node.verification.replaceAll("_", " ")}</span><span>Signal freshness: {node.freshness}</span>
              {hiddenCount > 0 ? <button type="button" className={styles.mobileExpand} data-brain-expand={node.id} onClick={() => expand(node.id)}>Reveal {hiddenCount} connected {hiddenCount === 1 ? "neuron" : "neurons"} here</button> : null}
              <a href={`#brain-node-${node.id}`}>View all documented connections →</a>
            </div>
          </details>;
        })}
      </div>
      <p className={styles.mobileMapHint}>Tap a neuron to reveal its documented links in this map. A link is not necessarily a child.</p>
    </nav>

    <div className={styles.graphFrame}>
      <div className={styles.graphHeader}><div><span className={styles.eyebrow}>{projection.synthetic ? "Business anatomy · synthetic scenario" : "Business anatomy · scoped canonical read"}</span><h2>{projection.synthetic ? "TORO sees the operation as connected evidence, not separate apps." : "A focused view of records this organization can read."}</h2></div><div className={styles.graphLegend}><span><i className={styles.legendLink} /> hover a link for its relation</span><span>Click +connections to reveal the next linked level here</span>{projection.synthetic ? <span><i className={styles.legendActive} /> example activity</span> : null}<span><i className={styles.legendRisk} /> {projection.synthetic ? "needs attention" : "evidence needs review"}</span>{projection.synthetic ? <span><i className={styles.legendGate} /> example approval gate</span> : null}</div></div>
      <div className={styles.graphCanvas} data-brain-graph="true" aria-label={`${projection.synthetic ? "Synthetic" : "Read-only"} graph with ${nodes.length} of ${projection.nodes.length} nodes revealed and ${edges.length} visible links. Click a neuron to reveal linked nodes in this map.`}>
        <svg className={styles.edges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs><marker id="arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" className={styles.arrowHead} /></marker><marker id="arrowAttention" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" className={styles.arrowHeadAttention} /></marker></defs>
          {edges.map((edge) => {
            const source = layout[edge.source], target = layout[edge.target];
            const attention = edge.freshness !== "current" || edge.verification !== "verified";
            return <g key={edge.id}><line x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={attention ? styles.edgeAttention : styles.edge} data-evidence-state={attention ? "needs-review" : "current"} data-brain-relation={edge.relation} markerEnd={attention ? "url(#arrowAttention)" : "url(#arrow)"} /><line x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={styles.edgeHit} data-brain-edge-tooltip="true"><title>{connectionTooltip(edge, labels, projection.synthetic)}</title></line></g>;
          })}
        </svg>
        {nodes.map((node) => <NodeCard key={node.id} node={node} layout={layout} hiddenCount={unrevealedNeighbors(node.id, projection, visible, layout).length} expand={() => expand(node.id)} />)}
      </div>
      <p className={styles.graphHint}>{nodes.length} of {projection.nodes.length} authorized nodes shown · Relationships retain their original direction and verification. Hierarchy is only claimed for “part of” links.</p>
    </div>
  </>;
}
