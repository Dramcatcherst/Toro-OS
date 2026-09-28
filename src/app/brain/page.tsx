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
import { loadBrainProjectionView } from "@/lib/server/brain-projection";
import { BrainMap } from "./brain-map";
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

const verificationLabel = {
  verified: "verified",
  partially_verified: "partial",
  unverified: "unverified",
  conflicted: "conflict",
  not_applicable: "n/a",
};

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
            <div><span>Available nodes</span><strong>{projection.nodes.length}</strong><small>reveal within map</small></div>
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
        <BrainMap projection={projection} layout={layout} />

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

      <div className={styles.mobileBrain}><AccessibleNodeList projection={projection} compact /></div>

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
