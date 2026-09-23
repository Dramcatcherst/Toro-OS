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
  FileImage,
  FolderKanban,
  Gauge,
  GitBranch,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { loadAuthorizedBrainProjection } from "@/features/brain/server";
import type { BrainNode, BrainProjection } from "@/lib/brain-contracts";
import { visualBrainDemo, visualBrainDemoLayout } from "@/lib/brain-fixtures";

import styles from "./brain.module.css";

const nodeIcons: Partial<Record<BrainNode["kind"], typeof Brain>> = {
  organization: Building2,
  agent: Bot,
  connector: Database,
  kpi: Gauge,
  evidence: FileCheck2,
  media: FileImage,
  project: FolderKanban,
  approval: LockKeyhole,
  decision: Brain,
  knowledge: Brain,
  asset: Building2,
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

type Point = { x: number; y: number };

function focusNodes(nodes: BrainNode[]) {
  const priority: Partial<Record<BrainNode["kind"], number>> = {
    knowledge: 0,
    media: 1,
    asset: 2,
    incident: 3,
    task: 4,
    evidence: 5,
  };

  return [...nodes]
    .sort((a, b) => {
      const left = priority[a.kind] ?? 10;
      const right = priority[b.kind] ?? 10;
      return left - right || a.id.localeCompare(b.id);
    })
    .slice(0, 12);
}

function createProjectionLayout(nodes: BrainNode[]): Record<string, Point> {
  const columns = 4;
  const xPositions = [14, 38, 62, 86];
  const rows = Math.max(1, Math.ceil(nodes.length / columns));
  const yStep = rows === 1 ? 0 : 70 / (rows - 1);

  return Object.fromEntries(
    nodes.map((node, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      return [
        node.id,
        {
          x: xPositions[column],
          y: rows === 1 ? 50 : 15 + row * yStep,
        },
      ];
    }),
  );
}

function NodeCard({ node, point }: { node: BrainNode; point: Point | undefined }) {
  const Icon = nodeIcons[node.kind] ?? Activity;

  if (!point) return null;

  return (
    <article
      className={[
        styles.node,
        riskClass[node.risk],
        node.activity &&
        ["reading", "analyzing", "executing", "verifying"].includes(node.activity)
          ? styles.nodeActive
          : "",
      ].join(" ")}
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
      aria-label={`${node.label}. ${node.status}. Risk ${node.risk}. ${verificationLabel[node.verification]} verification. Freshness ${freshnessLabel[node.freshness]}.`}
    >
      <div className={styles.nodeHead}>
        <span className={styles.nodeIcon}>
          <Icon aria-hidden="true" />
        </span>
        <span className={styles.nodeKind}>{node.kind}</span>
      </div>
      <h3>{node.label}</h3>
      {node.metric ? (
        <div className={styles.metric}>
          <strong>
            {node.metric.value}
            {node.metric.unit}
          </strong>
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

function Graph({ projection }: { projection: BrainProjection }) {
  const graphNodes = focusNodes(projection.nodes);
  const visibleNodeIds = new Set(graphNodes.map((node) => node.id));
  const graphEdges = projection.edges.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
  );
  const points = projection.synthetic
    ? visualBrainDemoLayout
    : createProjectionLayout(graphNodes);

  return (
    <div className={styles.graphFrame}>
      <div className={styles.graphHeader}>
        <div>
          <span className={styles.eyebrow}>
            {projection.synthetic
              ? "Business anatomy · synthetic scenario"
              : "Business anatomy · real read-only"}
          </span>
          <h2>
            {projection.synthetic
              ? "TORO sees the operation as connected evidence, not separate apps."
              : "TORO shows only the authorized business neighborhood resolved for this context."}
          </h2>
        </div>
        <div className={styles.graphLegend}>
          <span>
            <i className={styles.legendActive} /> active
          </span>
          <span>
            <i className={styles.legendRisk} /> needs attention
          </span>
          <span>
            <i className={styles.legendGate} /> verification / approval gate
          </span>
        </div>
      </div>

      <div
        className={styles.graphCanvas}
        role="img"
        aria-label={
          projection.synthetic
            ? "Synthetic Dreamcatcher business graph."
            : "Authorized real read-only Dreamcatcher business graph."
        }
      >
        <svg
          className={styles.edges}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="5"
              markerHeight="5"
              refX="4.5"
              refY="2.5"
              orient="auto"
            >
              <path d="M0,0 L5,2.5 L0,5 Z" className={styles.arrowHead} />
            </marker>
          </defs>
          {graphEdges.map((edge) => {
            const source = points[edge.source];
            const target = points[edge.target];
            if (!source || !target) return null;
            const isAttention =
              edge.freshness === "aging" ||
              edge.freshness === "stale" ||
              edge.verification === "partially_verified";

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

        {graphNodes.map((node) => (
          <NodeCard key={node.id} node={node} point={points[node.id]} />
        ))}
      </div>
    </div>
  );
}

function ProjectionSummary({ projection }: { projection: BrainProjection }) {
  if (projection.synthetic) {
    const pendingApproval = projection.nodes.find((node) => node.kind === "approval");
    const cashNode = projection.nodes.find((node) => node.id === "node:cash");
    const revenueNode = projection.nodes.find((node) => node.id === "node:revenue");

    return (
      <section className={styles.signalStrip} aria-label="Synthetic scenario summary">
        <div>
          <CircleDollarSign aria-hidden="true" />
          <span>Reservations</span>
          <strong>
            {revenueNode?.metric?.value}
            {revenueNode?.metric?.unit}
          </strong>
          <small>booked value trend</small>
        </div>
        <div className={styles.signalRisk}>
          <AlertTriangle aria-hidden="true" />
          <span>Cash coverage</span>
          <strong>
            {cashNode?.metric?.value}
            {cashNode?.metric?.unit}
          </strong>
          <small>timing gap detected</small>
        </div>
        <div>
          <LockKeyhole aria-hidden="true" />
          <span>Decision</span>
          <strong>{pendingApproval?.status}</strong>
          <small>owner approval required</small>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.signalStrip} aria-label="Real projection summary">
      <div>
        <Brain aria-hidden="true" />
        <span>Visible nodes</span>
        <strong>{projection.nodes.length}</strong>
        <small>authorized read-only state</small>
      </div>
      <div>
        <GitBranch aria-hidden="true" />
        <span>Verified links</span>
        <strong>{projection.edges.length}</strong>
        <small>candidate links omitted</small>
      </div>
      <div className={projection.partial ? styles.signalRisk : undefined}>
        <AlertTriangle aria-hidden="true" />
        <span>Coverage</span>
        <strong>{projection.partial ? "Partial" : "Current"}</strong>
        <small>{projection.degradedReason ?? "No degraded source reported."}</small>
      </div>
    </section>
  );
}

function ActivityPanel({ projection }: { projection: BrainProjection }) {
  if (projection.synthetic) {
    return (
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
                  <time>
                    {new Date(event.occurredAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "America/Costa_Rica",
                    })}
                  </time>
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
    );
  }

  return (
    <aside className={styles.activityPanel}>
      <div className={styles.panelHead}>
        <div>
          <span className={styles.eyebrow}>Observed activity</span>
          <h2>Real events only. No simulated thinking.</h2>
        </div>
      </div>
      {projection.recentEvents?.length ? (
        <ol className={styles.timeline}>
          {projection.recentEvents.map((event, index) => (
            <li key={event.eventId}>
              <div className={styles.timelineRail}>
                <span>{index + 1}</span>
              </div>
              <div>
                <div className={styles.timelineTop}>
                  <strong>{event.eventType}</strong>
                  <time>{event.occurredAt}</time>
                </div>
                <p>{event.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className={styles.gate}>
          <ShieldCheck aria-hidden="true" />
          <div>
            <span>Read-only Stage C</span>
            <strong>No live activity events in this projection.</strong>
            <p>Event Spine activity will appear only when backed by observed events.</p>
          </div>
        </div>
      )}
    </aside>
  );
}

export function BrainView({ projection }: { projection: BrainProjection }) {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroTopline}>
          <Link href="/" className={styles.brand}>
            <Brain aria-hidden="true" /> TORO Brain
          </Link>
          <div className={styles.badges}>
            {projection.synthetic ? (
              <span className={styles.synthetic}>
                <Sparkles aria-hidden="true" /> synthetic
              </span>
            ) : (
              <span>
                <ShieldCheck aria-hidden="true" /> real · read only
              </span>
            )}
            <span>
              <ShieldCheck aria-hidden="true" /> read only
            </span>
            <span>contract {projection.contractVersion}</span>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>
              {projection.synthetic
                ? "Dreamcatcher Hotel · reference simulation"
                : "Dreamcatcher Hotel · authorized internal projection"}
            </p>
            <h1>
              {projection.synthetic
                ? "See what the business is doing, what TORO sees, and where a human decision is required."
                : "See the business neighborhood TORO can actually read in this authorized context."}
            </h1>
            <p className={styles.lead}>
              {projection.synthetic
                ? "This is a contract-driven prototype. No live guest, employee, payment or production data is used here."
                : "This is a real read-only projection. Unverified, stale or unavailable relationships remain explicit instead of being filled with synthetic data."}
            </p>
          </div>
          <div className={styles.heroStats}>
            <div>
              <span>Visible nodes</span>
              <strong>{projection.nodes.length}</strong>
              <small>authorized context</small>
            </div>
            <div>
              <span>Visible links</span>
              <strong>{projection.edges.length}</strong>
              <small>verified projection</small>
            </div>
            <div>
              <span>Projection</span>
              <strong>{projection.partial ? "Partial" : "Current"}</strong>
              <small>{projection.synthetic ? "simulation" : "real state"}</small>
            </div>
          </div>
        </div>
      </header>

      <ProjectionSummary projection={projection} />

      <section className={styles.mainGrid}>
        <Graph projection={projection} />
        <ActivityPanel projection={projection} />
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
              <div key={`${source.sourceSystem}:${source.authoritySystem}`}>
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
              <span className={styles.eyebrow}>
                {projection.synthetic ? "Decision evidence" : "Projection status"}
              </span>
              <h2>
                {projection.synthetic
                  ? "Why TORO stopped here"
                  : "What remains incomplete"}
              </h2>
            </div>
            {projection.synthetic ? (
              <GitBranch aria-hidden="true" />
            ) : (
              <ShieldCheck aria-hidden="true" />
            )}
          </div>
          {projection.synthetic ? (
            <div className={styles.decisionFlow}>
              <div>
                <CheckCircle2 aria-hidden="true" />
                <span>Kross signal</span>
                <strong>current</strong>
              </div>
              <div>
                <Clock3 aria-hidden="true" />
                <span>Alegra evidence</span>
                <strong>aging</strong>
              </div>
              <div>
                <AlertTriangle aria-hidden="true" />
                <span>Cash gap</span>
                <strong>high attention</strong>
              </div>
              <div>
                <LockKeyhole aria-hidden="true" />
                <span>CAPEX change</span>
                <strong>approval required</strong>
              </div>
            </div>
          ) : (
            <div className={styles.gate}>
              <AlertTriangle aria-hidden="true" />
              <div>
                <span>{projection.partial ? "Partial projection" : "Current projection"}</span>
                <strong>
                  {projection.degradedReason ??
                    "No degraded source reported for this slice."}
                </strong>
                <p>Candidate and unauthorized relationships are not rendered as canonical links.</p>
              </div>
            </div>
          )}
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
          <span>
            {projection.synthetic
              ? "Simulation only · no external writes · no private operational data"
              : "Real read-only projection · no external writes"}
          </span>
        </div>
        <div>
          {projection.nodes.length} nodes · {projection.edges.length} edges ·{" "}
          {projection.recentEvents?.length ?? 0} events
        </div>
      </footer>
    </main>
  );
}

export default async function BrainPage() {
  const realProjection = await loadAuthorizedBrainProjection();
  return <BrainView projection={realProjection ?? visualBrainDemo} />;
}
