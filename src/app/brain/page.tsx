import Link from "next/link";
import { connection } from "next/server";
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  FileCheck2,
  FolderKanban,
  Gauge,
  GitBranch,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { BrainNode, BrainProjection } from "@/lib/brain-contracts";
import type { BrainLayout } from "@/lib/server/brain-projection";
import { loadBrainProjectionView } from "@/lib/server/brain-projection";
import styles from "./brain.module.css";

const nodeIcons: Partial<Record<BrainNode["kind"], typeof Brain>> = {
  organization: Building2,
  agent: Bot,
  connector: Database,
  kpi: Gauge,
  evidence: FileCheck2,
  project: FolderKanban,
  approval: LockKeyhole,
  decision: Brain,
};

const riskClass = {
  Low: styles.riskLow,
  Medium: styles.riskMedium,
  High: styles.riskHigh,
  Critical: styles.riskCritical,
};

const freshnessLabel = {
  current: "current",
  aging: "aging",
  stale: "stale",
  unknown: "unknown",
};

const verificationLabel = {
  verified: "verified",
  partially_verified: "partial",
  unverified: "unverified",
  conflicted: "conflict",
  not_applicable: "n/a",
};

function NodeCard({ node, layout }: { node: BrainNode; layout: BrainLayout }) {
  const Icon = nodeIcons[node.kind] ?? Activity;
  const point = layout[node.id];

  if (!point) return null;

  return (
    <article
      className={[
        styles.node,
        riskClass[node.risk],
        node.activity && ["reading", "analyzing", "executing", "verifying"].includes(node.activity) ? styles.nodeActive : "",
      ].join(" ")}
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
      aria-label={`${node.label}. ${node.status}. Risk ${node.risk}. ${verificationLabel[node.verification]} verification.`}
    >
      <div className={styles.nodeHead}>
        <span className={styles.nodeIcon}><Icon aria-hidden="true" /></span>
        <span className={styles.nodeKind}>{node.kind}</span>
      </div>
      <h3>{node.label}</h3>
      {node.metric ? (
        <div className={styles.metric}>
          <strong>{node.metric.value}{node.metric.unit}</strong>
          <span>{node.metric.label}</span>
        </div>
      ) : null}
      <p>{node.summary}</p>
      <div className={styles.nodeMeta}>
        <span>{node.status}</span>
        <span>{freshnessLabel[node.freshness]}</span>
        <span>{verificationLabel[node.verification]}</span>
      </div>
    </article>
  );
}

function Graph({ projection, layout }: { projection: BrainProjection; layout: BrainLayout }) {
  const points = layout;
  const synthetic = projection.synthetic;

  return (
    <div className={styles.graphFrame}>
      <div className={styles.graphHeader}>
        <div>
          <span className={styles.eyebrow}>{synthetic ? "Business anatomy · synthetic scenario" : "Business anatomy · scoped canonical read"}</span>
          <h2>{synthetic ? "TORO sees the operation as connected evidence, not separate apps." : "A focused view of records this organization can read."}</h2>
        </div>
        <div className={styles.graphLegend}>
          {synthetic ? <span><i className={styles.legendActive} /> example activity</span> : null}
          <span><i className={styles.legendRisk} /> {synthetic ? "needs attention" : "evidence needs review"}</span>
          {synthetic ? <span><i className={styles.legendGate} /> example approval gate</span> : null}
        </div>
      </div>

      <div className={styles.graphCanvas} role="img" aria-label={synthetic ? "Synthetic Dreamcatcher business graph showing an example cash coverage issue and approval-gated decision." : `Read-only organization graph with ${projection.nodes.length} visible nodes and ${projection.edges.length} displayed links. No live activity is claimed.`}>
        <svg className={styles.edges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" className={styles.arrowHead} />
            </marker>
            <marker id="arrowAttention" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" className={styles.arrowHeadAttention} />
            </marker>
          </defs>
          {projection.edges.map((edge) => {
            const source = points[edge.source];
            const target = points[edge.target];
            if (!source || !target) return null;
            const isAttention = edge.freshness !== "current" || edge.verification !== "verified";
            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={isAttention ? styles.edgeAttention : styles.edge}
                data-evidence-state={isAttention ? "needs-review" : "current"}
                markerEnd={isAttention ? "url(#arrowAttention)" : "url(#arrow)"}
              />
            );
          })}
        </svg>

        {projection.nodes.map((node) => <NodeCard key={node.id} node={node} layout={layout} />)}
      </div>
    </div>
  );
}

function MobileBrainMap({ projection, layout }: { projection: BrainProjection; layout: BrainLayout }) {
  const layerCounts = new Map<number, number>();
  for (const node of projection.nodes) {
    const point = layout[node.id];
    if (point) layerCounts.set(point.y, (layerCounts.get(point.y) ?? 0) + 1);
  }
  const widestLayer = Math.max(1, ...layerCounts.values());
  const nodeSize = Math.max(22, Math.min(38, Math.floor(220 / widestLayer)));

  return (
    <nav className={styles.mobileMap} data-brain-mini-map="true" aria-label={projection.synthetic ? "Synthetic visual Brain overview" : "Read-only visual Brain overview"}>
      <div className={styles.mobileMapHeading}>
        <strong>{projection.synthetic ? "Example network" : "Connected records"}</strong>
        <span>{projection.nodes.length} nodes · {projection.edges.length} links</span>
      </div>
      <div className={styles.mobileMapCanvas}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {projection.edges.map((edge) => {
            const from = layout[edge.source];
            const to = layout[edge.target];
            if (!from || !to) return null;
            return <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={edge.freshness === "current" && edge.verification === "verified" ? styles.mobileMapEdge : styles.mobileMapEdgeReview} />;
          })}
        </svg>
        {projection.nodes.map((node) => {
          const point = layout[node.id];
          if (!point) return null;
          const Icon = nodeIcons[node.kind] ?? Activity;
          return (
            <details
              key={node.id}
              className={styles.mobileMapNode}
              data-kind={node.kind}
              data-side={point.x < 35 ? "left" : point.x > 65 ? "right" : "center"}
              data-vertical={point.y > 50 ? "above" : "below"}
              name="brain-map-node"
              style={{ left: `${point.x}%`, top: `${point.y}%`, width: nodeSize, height: nodeSize }}
            >
              <summary aria-label={`${node.label}. ${node.status}. Show details.`} title={node.label}>
                <Icon aria-hidden="true" />
              </summary>
              <div className={styles.mobileMapPopover}>
                <strong>{node.label}</strong>
                <span>{node.status} · {node.verification}</span>
                <a href={`#brain-node-${node.id}`}>View connections →</a>
              </div>
            </details>
          );
        })}
      </div>
      <p className={styles.mobileMapHint}>Tap a neuron for its status, then open its connections.</p>
    </nav>
  );
}

function AccessibleNodeList({ projection, compact = false }: { projection: BrainProjection; compact?: boolean }) {
  const visibleNodes = new Map(projection.nodes.map((node) => [node.id, node]));

  return (
    <section className={styles.listFallback}>
      <div className={styles.panelHead}>
        <div>
          <span className={styles.eyebrow}>{compact ? "Explore by layer" : "Accessible list view"}</span>
          <h2>{compact ? "Swipe nodes · open for connections" : "The same Brain without spatial navigation"}</h2>
        </div>
        <Activity aria-hidden="true" />
      </div>
      <div className={styles.nodeList} aria-label={compact ? "Swipeable Brain node layers" : undefined} tabIndex={compact ? 0 : undefined}>
        {projection.nodes.map((node) => {
          const Icon = nodeIcons[node.kind] ?? Activity;
          const connections = projection.edges.flatMap((edge) => {
            if (edge.source === node.id && visibleNodes.has(edge.target)) {
              return [{ edge, other: visibleNodes.get(edge.target)!, outgoing: true }];
            }
            if (edge.target === node.id && visibleNodes.has(edge.source)) {
              return [{ edge, other: visibleNodes.get(edge.source)!, outgoing: false }];
            }
            return [];
          });
          const connectionDetails = connections.length > 0 ? (
            <details className={styles.nodeConnections}>
              <summary>{connections.length} {connections.length === 1 ? "connection" : "connections"}</summary>
              <ul>
                {connections.map(({ edge, other, outgoing }) => (
                  <li key={edge.id}>
                    {outgoing ? `${edge.relation.replaceAll("_", " ")} → ${other.label}` : `${other.label} → ${edge.relation.replaceAll("_", " ")}`}
                    <small>{edge.verification ? verificationLabel[edge.verification] : "verification not reported"} · {edge.freshness ?? "freshness not reported"}</small>
                  </li>
                ))}
              </ul>
            </details>
          ) : null;
          const state = (
            <div className={styles.listState}>
              <span>{node.status}</span>
              <span>{node.verification}</span>
              <span>{node.freshness}</span>
            </div>
          );

          if (compact) {
            return (
              <details className={styles.mobileNode} data-brain-layer="node" id={`brain-node-${node.id}`} key={node.id}>
                <summary>
                  <Icon aria-hidden="true" />
                  <span className={styles.mobileNodeName}><small>{node.kind}</small><strong>{node.label}</strong></span>
                  <span className={styles.mobileNodeCount}>{connections.length} {connections.length === 1 ? "link" : "links"}</span>
                </summary>
                <div className={styles.mobileNodeBody}>
                  <p>{node.summary}</p>
                  {state}
                  {connectionDetails}
                </div>
              </details>
            );
          }

          return (
            <article data-brain-list-node key={node.id}>
              <Icon aria-hidden="true" />
              <div>
                <span>{node.kind}</span>
                <strong>{node.label}</strong>
                <p>{node.summary}</p>
                {connectionDetails}
              </div>
              {state}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActivityTraceBody({ projection }: { projection: BrainProjection }) {
  return <>
    <ol className={styles.timeline}>
      {projection.recentEvents?.map((event, index) => (
        <li key={event.eventId}>
          <div className={styles.timelineRail}><span>{index + 1}</span></div>
          <div>
            <div className={styles.timelineTop}>
              <strong>{event.eventType}</strong>
              <time>{new Date(event.occurredAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Costa_Rica" })}</time>
            </div>
            <p>{event.summary}</p>
            <div className={styles.eventMeta}>
              <span>{event.executionState}</span>
              <span>{event.verificationState}</span>
              <span>risk {event.risk.toLowerCase()}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
    <div className={styles.gate}>
      <LockKeyhole aria-hidden="true" />
      <div>
        <span>Human authority preserved</span>
        <strong>No external action executed.</strong>
        <p>TORO prepared a decision and stopped at the approval boundary.</p>
      </div>
    </div>
  </>;
}

export default async function BrainPage() {
  // The feature flag and authorized scope must be evaluated per request, never at build time.
  await connection();
  const { projection, layout, runtime } = await loadBrainProjectionView();
  const synthetic = projection.synthetic;
  const pendingApproval = projection.nodes.find((node) => node.kind === "approval");
  const cashNode = projection.nodes.find((node) => node.id === "node:cash");
  const revenueNode = projection.nodes.find((node) => node.id === "node:revenue");

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroTopline}>
          <div className="flex items-center gap-3">
            <Link href="/" className={styles.brand}><Brain aria-hidden="true" /> TORO Brain</Link>
            <Link href="/experience-lab" className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100 hover:border-cyan-300/40">
              Experience Lab
            </Link>
          </div>
          <div className={styles.badges}>
            <span className={styles.synthetic}><Sparkles aria-hidden="true" /> {projection.synthetic ? "synthetic" : "canonical"}</span>
            <span><ShieldCheck aria-hidden="true" /> read only</span>
            <span>{runtime.mode.replaceAll("_", " ")}</span>
            <span>contract {projection.contractVersion}</span>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>{synthetic ? "Dreamcatcher Hotel · reference simulation" : "Organization · permission-scoped read"}</p>
            <h1>{synthetic ? "See how TORO could connect evidence and a human decision." : "Explore the organization records available to this authorized context."}</h1>
            <p className={styles.lead}>
              {synthetic
                ? "This is a contract-driven example, not live activity. No private operational data or external action is represented."
                : "This is a focused, read-only projection of authorized organization data. It does not show live agent activity, guest or employee records, payment data, or completed external actions."}
            </p>
          </div>
          <div className={styles.heroStats}>
            <div><span>Visible nodes</span><strong>{projection.nodes.length}</strong><small>bounded focus view</small></div>
            {synthetic ? (
              <>
                <div><span>Example events</span><strong>{projection.recentEvents?.length ?? 0}</strong><small>simulated correlation chain</small></div>
                <div><span>Example approval gates</span><strong>{projection.nodes.filter((node) => node.kind === "approval").length}</strong><small>no external action</small></div>
              </>
            ) : (
              <>
                <div><span>Displayed links</span><strong>{projection.edges.length}</strong><small>focused projection</small></div>
                <div><span>Source summaries</span><strong>{projection.sources.length}</strong><small>read-only coverage</small></div>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileBrainMap projection={projection} layout={layout} />
      <div className={styles.mobileBrain}><AccessibleNodeList projection={projection} compact /></div>

      {synthetic ? <section className={styles.signalStrip} aria-label="Synthetic scenario summary. Swipe or use arrow keys to inspect three signals." tabIndex={0}>
        <div>
          <CircleDollarSign aria-hidden="true" />
          <span>Reservations</span>
          <strong>{revenueNode?.metric?.value}{revenueNode?.metric?.unit}</strong>
          <small>booked value trend</small>
        </div>
        <div className={styles.signalRisk}>
          <AlertTriangle aria-hidden="true" />
          <span>Cash coverage</span>
          <strong>{cashNode?.metric?.value}{cashNode?.metric?.unit}</strong>
          <small>timing gap detected</small>
        </div>
        <div>
          <LockKeyhole aria-hidden="true" />
          <span>Decision</span>
          <strong>{pendingApproval?.status}</strong>
          <small>owner approval required</small>
        </div>
      </section> : null}

      <section className={`${styles.mainGrid} ${synthetic ? "" : styles.mainGridCanonical}`}>
        <Graph projection={projection} layout={layout} />

        {synthetic ? <aside className={`${styles.activityPanel} ${styles.desktopTrace}`}>
          <div className={styles.panelHead}>
            <div>
              <span className={styles.eyebrow}>Watch TORO work</span>
              <h2>One trace, from source to approval.</h2>
            </div>
            <span className={styles.correlation}>demo:cash-gap:1</span>
          </div>

          <ActivityTraceBody projection={projection} />
        </aside> : null}

        {synthetic ? <details className={`${styles.activityPanel} ${styles.mobileTrace}`} data-brain-trace="mobile">
          <summary>
            <span className={styles.eyebrow}>Example event trace · {projection.recentEvents?.length ?? 0} steps</span>
            <strong>From source to approval</strong>
            <small>No external action executed. Open to inspect the example.</small>
          </summary>
          <ActivityTraceBody projection={projection} />
        </details> : null}
      </section>

      <section className={`${styles.lowerGrid} ${synthetic ? "" : styles.lowerGridCanonical}`}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <span className={styles.eyebrow}>Source authority</span>
              <h2>What supports this view</h2>
            </div>
            <Landmark aria-hidden="true" />
          </div>
          <div className={styles.sourceList}>
            {projection.sources.map((source) => (
              <div key={source.sourceSystem}>
                <div>
                  <strong>{source.sourceSystem}</strong>
                  <span>authority: {source.authoritySystem}</span>
                </div>
                <div className={styles.sourceState}>
                  <span>{source.freshness}</span>
                  <span>{source.verification}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {synthetic ? <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <span className={styles.eyebrow}>Decision evidence</span>
              <h2>Why TORO stopped here</h2>
            </div>
            <GitBranch aria-hidden="true" />
          </div>
          <div className={styles.decisionFlow}>
            <div><CheckCircle2 aria-hidden="true" /><span>Kross signal</span><strong>current</strong></div>
            <div><Clock3 aria-hidden="true" /><span>Alegra evidence</span><strong>aging</strong></div>
            <div><AlertTriangle aria-hidden="true" /><span>Cash gap</span><strong>high attention</strong></div>
            <div><LockKeyhole aria-hidden="true" /><span>CAPEX change</span><strong>approval required</strong></div>
          </div>
        </div> : null}
      </section>

      <div className={styles.desktopBrain}><AccessibleNodeList projection={projection} /></div>

      <footer className={styles.footer}>
        <div>
          <ShieldCheck aria-hidden="true" />
          <span>{runtime.realData ? "Canonical read-only projection" : "Simulation only"} · no external writes · {runtime.realData ? "permission-filtered data" : "no private operational data"}</span>
        </div>
        <div>
          {projection.nodes.length} nodes · {projection.edges.length} edges · {projection.recentEvents?.length ?? 0} events
        </div>
      </footer>
    </main>
  );
}
