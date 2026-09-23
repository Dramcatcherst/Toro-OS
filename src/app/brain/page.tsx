import Link from "next/link";
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

  return (
    <div className={styles.graphFrame}>
      <div className={styles.graphHeader}>
        <div>
          <span className={styles.eyebrow}>Business anatomy · synthetic scenario</span>
          <h2>TORO sees the operation as connected evidence, not separate apps.</h2>
        </div>
        <div className={styles.graphLegend}>
          <span><i className={styles.legendActive} /> active</span>
          <span><i className={styles.legendRisk} /> needs attention</span>
          <span><i className={styles.legendGate} /> approval gate</span>
        </div>
      </div>

      <div className={styles.graphCanvas} role="img" aria-label="Synthetic Dreamcatcher business graph showing TORO Finance reading Kross, Alegra and bank evidence, detecting a cash coverage issue and preparing an approval-gated decision.">
        <svg className={styles.edges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" className={styles.arrowHead} />
            </marker>
          </defs>
          {projection.edges.map((edge) => {
            const source = points[edge.source];
            const target = points[edge.target];
            if (!source || !target) return null;
            const isAttention = edge.freshness === "aging" || edge.verification === "partially_verified";
            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={isAttention ? styles.edgeAttention : styles.edge}
                markerEnd="url(#arrow)"
              />
            );
          })}
        </svg>

        {projection.nodes.map((node) => <NodeCard key={node.id} node={node} layout={layout} />)}
      </div>
    </div>
  );
}

export default async function BrainPage() {
  const { projection, layout, runtime } = await loadBrainProjectionView();
  const pendingApproval = projection.nodes.find((node) => node.kind === "approval");
  const cashNode = projection.nodes.find((node) => node.id === "node:cash");
  const revenueNode = projection.nodes.find((node) => node.id === "node:revenue");

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroTopline}>
          <Link href="/" className={styles.brand}><Brain aria-hidden="true" /> TORO Brain</Link>
          <div className={styles.badges}>
            <span className={styles.synthetic}><Sparkles aria-hidden="true" /> {projection.synthetic ? "synthetic" : "canonical"}</span>
            <span><ShieldCheck aria-hidden="true" /> read only</span>
            <span>{runtime.mode.replaceAll("_", " ")}</span>
            <span>contract {projection.contractVersion}</span>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>Dreamcatcher Hotel · reference simulation</p>
            <h1>See what the business is doing, what TORO sees, and where a human decision is required.</h1>
            <p className={styles.lead}>
              This is a contract-driven prototype. Every node, edge and activity state represents a defined TORO concept. No live guest, employee, payment or production data is used here. The UI now consumes a single server-side projection seam so Stage C can replace the source without creating a second interface architecture.
            </p>
          </div>
          <div className={styles.heroStats}>
            <div><span>Visible nodes</span><strong>{projection.nodes.length}</strong><small>bounded focus view</small></div>
            <div><span>Recent events</span><strong>{projection.recentEvents?.length ?? 0}</strong><small>one correlation chain</small></div>
            <div><span>Approval gates</span><strong>1</strong><small>external change blocked</small></div>
          </div>
        </div>
      </header>

      <section className={styles.signalStrip} aria-label="Synthetic scenario summary">
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
      </section>

      <section className={styles.mainGrid}>
        <Graph projection={projection} layout={layout} />

        <aside className={styles.activityPanel}>
          <div className={styles.panelHead}>
            <div>
              <span className={styles.eyebrow}>Watch TORO work</span>
              <h2>One trace, from source to approval.</h2>
            </div>
            <span className={styles.correlation}>demo:cash-gap:1</span>
          </div>

          <ol className={styles.timeline}>
            {projection.recentEvents?.map((event, index) => (
              <li key={event.eventId}>
                <div className={styles.timelineRail}>
                  <span>{index + 1}</span>
                </div>
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
        </aside>
      </section>

      <section className={styles.lowerGrid}>
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

        <div className={styles.panel}>
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
        </div>
      </section>

      <section className={styles.listFallback}>
        <div className={styles.panelHead}>
          <div>
            <span className={styles.eyebrow}>Accessible list view</span>
            <h2>The same Brain without spatial navigation</h2>
          </div>
          <Activity aria-hidden="true" />
        </div>
        <div className={styles.nodeList}>
          {projection.nodes.map((node) => {
            const Icon = nodeIcons[node.kind] ?? Activity;
            return (
              <article key={node.id}>
                <Icon aria-hidden="true" />
                <div>
                  <span>{node.kind}</span>
                  <strong>{node.label}</strong>
                  <p>{node.summary}</p>
                </div>
                <div className={styles.listState}>
                  <span>{node.status}</span>
                  <span>{node.verification}</span>
                  <span>{node.freshness}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

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
