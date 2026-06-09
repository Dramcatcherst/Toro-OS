import {
  Activity, ArrowUpRight, Blocks, Bot, Brain, Building2, CheckCircle2, ChevronRight, CircleDollarSign,
  ClipboardCheck, Code2, Database, FileText, Layers3, LockKeyhole, Megaphone, Monitor, RadioTower,
  Search, Send, Settings, ShieldCheck, Sparkles, Workflow, Zap,
} from "lucide-react";
import { OperationalConsole } from "@/components/operational-console";
import { approvalSeed } from "@/lib/approval-store";
import { agentProfiles, airtableBase, airtableTables, blueprintDocuments, businessObjects, connectors, modules, queuedActions, safetyModel } from "@/lib/toro-data";
import { readAirtableRecords } from "@/lib/server/read-only-connectors";
import type { SourceMeta } from "@/lib/toro-types";

const navIcons = [Activity, Brain, Blocks, Bot, CircleDollarSign, Megaphone, FileText, Search, RadioTower, Send, Workflow, Layers3, Database, ShieldCheck, ClipboardCheck, Monitor, Code2, Settings];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function riskTone(risk: SourceMeta["risk"]) {
  return {
    Low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    Medium: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    High: "border-amber-300/35 bg-amber-300/10 text-amber-100",
    Critical: "border-red-400/35 bg-red-400/10 text-red-100",
  }[risk];
}

function statusTone(status: SourceMeta["status"]) {
  return status === "Active" || status === "Ready"
    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
    : status === "Blocked" || status === "Not connected"
      ? "border-red-400/30 bg-red-400/10 text-red-100"
      : "border-slate-500/50 bg-slate-800/70 text-slate-200";
}

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={classNames("inline-flex items-center rounded-sm border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em]", className)}>{children}</span>;
}

function MetaStrip({ item }: { item: SourceMeta }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 md:grid-cols-3">
      <div><span className="text-slate-500">Source</span><br />{item.source}</div>
      <div><span className="text-slate-500">Status</span><br /><Pill className={statusTone(item.status)}>{item.status}</Pill></div>
      <div><span className="text-slate-500">Risk</span><br /><Pill className={riskTone(item.risk)}>{item.risk}</Pill></div>
      <div><span className="text-slate-500">Confidence</span><br />{item.confidence}%</div>
      <div><span className="text-slate-500">Approval</span><br />{item.approval}</div>
      <div><span className="text-slate-500">Next</span><br />{item.nextAction}</div>
    </div>
  );
}

function Panel({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={classNames("border border-cyan-400/12 bg-slate-950/72 shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_20px_60px_rgba(0,0,0,0.35)]", className)}>{children}</section>;
}

function SectionTitle({ icon: Icon, title, action }: { icon: typeof Activity; title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-300" />
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      </div>
      {action ? <span className="font-mono text-[11px] text-amber-200">{action}</span> : null}
    </div>
  );
}

async function getBlueprintFeed() {
  const result = await readAirtableRecords({
    baseId: process.env.AIRTABLE_BASE_ID ?? airtableBase.id,
    tableId: airtableBase.blueprintTableId,
    pageSize: 6,
  });

  const liveRecords = Array.isArray((result.data as { records?: unknown[] } | null)?.records)
    ? ((result.data as { records: Array<{ id: string; fields?: Record<string, unknown> }> }).records).map((record) => ({
        id: record.id,
        name: typeof record.fields?.["Document Name"] === "string" ? record.fields["Document Name"] : record.id,
      }))
    : [];

  return {
    mode: result.configured && liveRecords.length > 0 ? "live" : "mock",
    configured: result.configured,
    error: result.error,
    records: liveRecords.length > 0
      ? liveRecords
      : blueprintDocuments.map((document) => ({ id: document.id, name: document.name })),
  };
}

export default async function Home() {
  const criticalQueue = queuedActions.filter((action) => action.risk === "Critical").length;
  const approvalCount = queuedActions.filter((action) => action.approval !== "None").length;
  const connectedCount = connectors.filter((connector) => connector.status === "Active" || connector.status === "Ready").length;
  const blueprintFeed = await getBlueprintFeed();

  return (
    <main className="command-grid min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_80%_8%,rgba(245,158,11,0.12),transparent_28%),#030712]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-cyan-400/10 bg-black/45 px-4 py-5 xl:block">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border border-cyan-300/40 bg-cyan-300/10 text-cyan-200">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black tracking-[0.18em] text-white">TORO OS</div>
              <div className="text-xs text-slate-400">Autonomous foundation v0.3</div>
            </div>
          </div>
          <nav className="space-y-1">
            {modules.map((module, index) => {
              const Icon = navIcons[index] ?? Activity;
              return (
                <a key={module.id} href={`#${module.id}`} className="group flex items-center justify-between border border-transparent px-3 py-2 text-sm text-slate-300 hover:border-cyan-400/20 hover:bg-cyan-300/5 hover:text-white">
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-slate-500 group-hover:text-cyan-300" />{module.name}</span>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-cyan-400/10 bg-slate-950/88 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">{airtableBase.name} / {airtableBase.blueprintTable}</p>
                <h1 className="mt-1 text-2xl font-black text-white md:text-4xl">TORO OS AI business operator command</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">{connectedCount} safe connectors</Pill>
                <Pill className="border-amber-300/30 bg-amber-300/10 text-amber-100">{approvalCount} approvals</Pill>
                <Pill className="border-red-400/35 bg-red-400/10 text-red-100">{criticalQueue} critical queued</Pill>
              </div>
            </div>
          </header>

          <div className="space-y-5 p-4 md:p-6">
            <section id="command" className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <Panel className="p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-cyan-200">
                      <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Main prompt: {airtableBase.mainPromptRecord}</span>
                      <Pill className={blueprintFeed.mode === "live" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-amber-300/30 bg-amber-300/10 text-amber-100"}>
                        Airtable {blueprintFeed.mode}
                      </Pill>
                    </div>
                    <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">Safe business execution starts as queued intelligence.</h2>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">TORO OS understands the business, prepares market, pricing, content, operations and builder actions, then routes every sensitive step through source authority, risk scoring, confidence, approval and logs.</p>
                  </div>
                  <div className="grid min-w-72 grid-cols-3 gap-2">
                    <div className="border border-cyan-400/15 bg-cyan-300/8 p-3"><div className="font-mono text-2xl text-white">{modules.length}</div><div className="text-xs text-slate-400">modules</div></div>
                    <div className="border border-cyan-400/15 bg-cyan-300/8 p-3"><div className="font-mono text-2xl text-white">{airtableTables.length}</div><div className="text-xs text-slate-400">tables modeled</div></div>
                    <div className="border border-cyan-400/15 bg-cyan-300/8 p-3"><div className="font-mono text-2xl text-white">0</div><div className="text-xs text-slate-400">external writes</div></div>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {["Business Knowledge", "Market + Tool Context", "Human Approval"].map((label, index) => (
                    <div key={label} className="border border-slate-800 bg-black/30 p-4">
                      <div className="mb-2 font-mono text-xs text-amber-200">0{index + 1}</div>
                      <h3 className="font-semibold text-white">{label}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{["Airtable-shaped objects, authority boundaries and source confidence.", "Connector scaffolds prepare drafts, recommendations and fields.", "Sensitive actions stay blocked or queued until reviewed."][index]}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <SectionTitle icon={LockKeyhole} title="Safety Model" action="v0.3 SAFE" />
                <div className="space-y-2 p-4">
                  {safetyModel.map((rule) => (
                    <div key={rule} className="flex gap-2 border border-slate-800 bg-black/25 p-3 text-xs leading-5 text-slate-300">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                      {rule}
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section id="approvals" className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
              <Panel>
                <SectionTitle icon={ClipboardCheck} title="Approval-Gated Action Queue" action="prepared only" />
                <div className="space-y-3 p-4">
                  {queuedActions.map((action) => (
                    <article key={action.id} className="border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">{action.title}</h3>
                          <p className="mt-1 text-xs text-slate-400">{action.module} -&gt; {action.targetTool} -&gt; {action.impact}</p>
                        </div>
                        <Pill className={riskTone(action.risk)}>{action.actionLevel}</Pill>
                      </div>
                      <div className="mt-3"><MetaStrip item={action} /></div>
                    </article>
                  ))}
                </div>
              </Panel>

              <Panel>
                <SectionTitle icon={Blocks} title="Operational Modules" action="all screens carry source/risk/approval metadata" />
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  {modules.map((module, index) => {
                    const Icon = navIcons[index] ?? Activity;
                    return (
                      <article id={module.id} key={module.id} className="border border-cyan-400/12 bg-black/28 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-cyan-300/30 bg-cyan-300/10 text-cyan-200"><Icon className="h-4 w-4" /></div>
                            <div>
                              <h3 className="font-semibold text-white">{module.name}</h3>
                              <p className="mt-1 text-xs leading-5 text-slate-400">{module.purpose}</p>
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {module.primaryObjects.slice(0, 3).map((object) => <Pill key={object} className="border-slate-700 bg-slate-900 text-slate-300">{object}</Pill>)}
                        </div>
                        <MetaStrip item={module} />
                      </article>
                    );
                  })}
                </div>
              </Panel>
            </section>

            <section id="tools" className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <Panel>
                <SectionTitle icon={RadioTower} title="Tool Hub / Connector Center" action="external writes disabled" />
                <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {connectors.map((connector) => (
                    <article key={connector.id} className="border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-white">{connector.name}</h3>
                        <Pill className={statusTone(connector.status)}>{connector.status}</Pill>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{connector.category} / {connector.mode}</p>
                      <p className="mt-3 text-xs leading-5 text-slate-300"><span className="text-slate-500">Authority:</span> {connector.authority}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{connector.currentCapability}</p>
                      <div className="mt-3"><MetaStrip item={connector} /></div>
                    </article>
                  ))}
                </div>
              </Panel>

              <Panel id="data">
                <SectionTitle icon={Database} title="Airtable Data Brain" action={`${airtableTables.length} table contracts`} />
                <div className="max-h-[690px] overflow-auto p-4">
                  <div className="space-y-2">
                    {airtableTables.map((table) => (
                      <div key={table.id} className="border border-slate-800 bg-black/25 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-white">{table.name}</h3>
                          <Pill className="border-cyan-400/25 bg-cyan-400/10 text-cyan-100">{table.module}</Pill>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{table.authorityRole}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {table.fields.map((field) => <span key={field.id} className="font-mono text-[10px] text-slate-500">{field.name}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </section>

            <section id="blueprint-feed" className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <Panel>
                <SectionTitle icon={FileText} title="Blueprint Authority Feed" action={blueprintFeed.mode === "live" ? "read-only live source" : "mock mirror active"} />
                <div className="space-y-3 p-4">
                  <div className="border border-slate-800 bg-black/25 p-4 text-xs leading-6 text-slate-300">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill className={blueprintFeed.mode === "live" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-amber-300/30 bg-amber-300/10 text-amber-100"}>
                        {blueprintFeed.mode === "live" ? "Live Airtable read" : "Repo mirror fallback"}
                      </Pill>
                      <span className="text-slate-400">{airtableBase.name} / {airtableBase.blueprintTable}</span>
                    </div>
                    <p className="mt-3">
                      TORO OS is pulling the build authority from the Airtable blueprint table when credentials are available, and falls back to the mirrored repo records when they are not.
                    </p>
                    {blueprintFeed.error ? <p className="mt-2 text-amber-200">{blueprintFeed.error}</p> : null}
                  </div>
                  <div className="grid gap-2">
                    {blueprintFeed.records.map((record) => (
                      <div key={record.id} className="flex items-center justify-between gap-3 border border-slate-800 bg-slate-950/80 p-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{record.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">{record.id}</div>
                        </div>
                        <Pill className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">source</Pill>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel>
                <SectionTitle icon={Brain} title="Blueprint Records In Use" action={`${blueprintDocuments.length} mirrored documents`} />
                <div className="space-y-3 p-4">
                  {blueprintDocuments.map((document) => (
                    <article key={document.id} className="border border-slate-800 bg-black/25 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">{document.name}</h3>
                          <p className="mt-1 text-xs text-slate-400">{document.version} / {document.role}</p>
                          <p className="mt-3 text-xs leading-5 text-slate-300">{document.summary}</p>
                        </div>
                        <Pill className="border-slate-700 bg-slate-900 text-slate-300">{document.version}</Pill>
                      </div>
                      <div className="mt-3">
                        <MetaStrip item={document} />
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
            </section>

            <section id="brain" className="grid gap-4 xl:grid-cols-3">
              <Panel className="xl:col-span-2">
                <SectionTitle icon={Building2} title="Business Brain / Real-Shaped Objects" action="Dreamcatcher first workspace, universal platform" />
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  {businessObjects.map((object) => (
                    <article key={object.id} className="border border-slate-800 bg-black/25 p-4">
                      <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold text-white">{object.name}</h3><Pill className="border-amber-300/25 bg-amber-300/10 text-amber-100">{object.type}</Pill></div>
                      <p className="text-xs leading-5 text-slate-400">{object.details}</p>
                      <div className="mt-3"><MetaStrip item={object} /></div>
                    </article>
                  ))}
                </div>
              </Panel>

              <Panel id="agents">
                <SectionTitle icon={Bot} title="Agent Command Center" action="permission ceilings" />
                <div className="space-y-3 p-4">
                  {agentProfiles.map((agent) => (
                    <article key={agent.id} className="border border-slate-800 bg-black/25 p-4">
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{agent.role}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {agent.allowedActions.map((action) => <Pill key={action} className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">{action}</Pill>)}
                      </div>
                      <div className="mt-3"><MetaStrip item={agent} /></div>
                    </article>
                  ))}
                </div>
              </Panel>
            </section>

            <section id="browser" className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <Panel>
                <SectionTitle icon={Monitor} title="Browser Control" action="guide/fill/submit with approval" />
                <div className="p-4">
                  <div className="border border-cyan-400/20 bg-cyan-400/8 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Assisted Kross content review</h3>
                        <p className="text-xs text-slate-400">Tool selector -&gt; external link -&gt; AI checklist -&gt; approval gate -&gt; action log</p>
                      </div>
                      <Pill className="border-red-400/35 bg-red-400/10 text-red-100">submit blocked</Pill>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs text-slate-300">
                      {["Observe public URL state", "Compare against Airtable/Kross Content Master", "Prepare copy/paste fields", "Request owner approval", "Log decision before any manual submit"].map((step) => (
                        <div key={step} className="flex items-center gap-2 border border-slate-800 bg-black/25 p-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" />{step}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel id="codex">
                <SectionTitle icon={Code2} title="Codex Builder Queue" action="approval creates tasks" />
                <div className="grid gap-3 p-4 md:grid-cols-2">
                  {["Create repo markdown blueprint mirror", "Build connector adapter tests", "Create Kross preview route", "Add persisted approvals store"].map((task, index) => (
                    <article key={task} className="border border-slate-800 bg-black/25 p-4">
                      <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold text-white">{task}</h3><Pill className="border-slate-700 bg-slate-900 text-slate-300">BQ-0{index + 1}</Pill></div>
                      <MetaStrip item={{ source: "31 TORO OS Build Blueprint", status: index === 0 ? "Ready" : "Queued", risk: index === 2 ? "High" : "Medium", confidence: 88 - index, approval: "Human review", nextAction: "Approve scope before implementation." }} />
                    </article>
                  ))}
                </div>
              </Panel>
            </section>

            <OperationalConsole initialApprovals={approvalSeed} />

            <footer className="border-t border-cyan-400/10 py-6 text-xs text-slate-500">
              TORO OS v0.3 SAFE foundation. Direct writes to Kross, Alegra, WhatsApp, social channels, reservations, prices, availability, invoices, payments and media deletion are not implemented.
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
