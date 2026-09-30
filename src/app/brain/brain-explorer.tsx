"use client";

import React, { useEffect, useReducer, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bot, Building2, CalendarDays, CheckCheck, ChevronRight,
  CircleHelp, Compass, Database, FileCheck2, FolderKanban, Gauge, List, LockKeyhole, Moon, Network, Plus, Minus,
  RotateCcw, Search, ShieldCheck, Sun, TriangleAlert, X } from "lucide-react";
import type { BrainEdge, BrainNode } from "@/lib/brain-contracts";
import { attentionNodes, sourceObservation, type BrainClientView } from "@/features/brain/presentation";
import { brainExplorerReducer, initialBrainState, visibleBrainObjects, type BrainExplorerState, type BrainFocus, type BrainLocale } from "@/features/brain/explorer-state";
import { brainMessages } from "@/features/brain/messages";
import styles from "./brain.module.css";

type Messages = typeof brainMessages.es;
type SelectNode = (id: string, event: MouseEvent<HTMLButtonElement>) => void;
const icons: Partial<Record<BrainNode["kind"], typeof Compass>> = {
  organization: Building2, business: Building2, property: Building2, agent: Bot, connector: Database,
  kpi: Gauge, project: FolderKanban, evidence: FileCheck2, approval: LockKeyhole, decision: CheckCheck,
};
function NodeIcon({ node }: { node: BrainNode }) {
  const Icon = icons[node.kind] ?? Compass;
  return <span className={styles.nodeIcon} data-kind={node.kind}><Icon size={22} aria-hidden="true" /></span>;
}
function modeLabel(view: BrainClientView, m: Messages) {
  return view.mode === "demo" ? m.demo : view.mode === "read-only" ? m.readOnly : m.unavailable;
}
function ModeNotice({ view, m }: { view: BrainClientView; m: Messages }) {
  return <div className={styles.notice} data-mode={view.mode}>
    <ShieldCheck size={20} aria-hidden="true" />
    <div><strong>{modeLabel(view, m)}</strong><p>{view.mode === "demo" ? m.demoNote : view.mode === "read-only" ? m.readOnlyNote : m.unavailableNote}</p></div>
  </div>;
}
function BrainList({ nodes, selectedId, onSelect, m }: { nodes: BrainNode[]; selectedId: string | null; onSelect: SelectNode; m: Messages }) {
  return <ul className={styles.nodeList} aria-label={m.list}>
    {nodes.map(node => <li key={node.id}>
      <button type="button" data-node-id={node.id} className={styles.nodeRow} aria-pressed={node.id === selectedId}
        disabled={!node.capabilities.canOpen} onClick={event => onSelect(node.id, event)}>
        <NodeIcon node={node} />
        <span className={styles.nodeText}><strong>{node.label}</strong><span>{m.kind[node.kind]} · {m.status[node.status]}</span></span>
        <span className={styles.rowSignal} data-risk={node.risk}>{m.risk[node.risk]} · {m.verification[node.verification]}</span>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </li>)}
  </ul>;
}
function BrainMap({ nodes, edges, view, state, onSelect, m }: {
  nodes: BrainNode[]; edges: BrainEdge[]; view: BrainClientView; state: BrainExplorerState; onSelect: SelectNode; m: Messages;
}) {
  const points = Object.fromEntries(nodes.map((node, index) => {
    const point = view.layout[node.id] ?? {
      x: 16 + (index % 3) * 34, y: 12 + Math.floor(index / 3) * (76 / Math.max(1, Math.ceil(nodes.length / 3) - 1)),
    };
    return [node.id, { x: Math.min(90, Math.max(10, point.x)), y: Math.min(88, Math.max(12, point.y)) }];
  }));
  return <div className={styles.mapViewport} tabIndex={0} role="region" aria-label={m.map} aria-describedby="brain-map-hint">
    <div className={styles.mapCanvas} style={{ transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})` }}>
      <svg className={styles.edges} viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
        {edges.map(edge => <line key={edge.id} x1={points[edge.source].x * 10} y1={points[edge.source].y * 7}
          x2={points[edge.target].x * 10} y2={points[edge.target].y * 7} />)}
      </svg>
      {edges.map(edge => <span key={edge.id} className={styles.edgeLabel} style={{
        left: `${(points[edge.source].x + points[edge.target].x) / 2}%`, top: `${(points[edge.source].y + points[edge.target].y) / 2}%`,
      }}>{m.relation[edge.relation]}</span>)}
      {nodes.map(node => <button key={node.id} type="button" data-node-id={node.id} title={node.label} className={styles.mapNode}
        aria-pressed={state.selectedId === node.id} disabled={!node.capabilities.canOpen} onClick={event => onSelect(node.id, event)}
        style={{ left: `${points[node.id].x}%`, top: `${points[node.id].y}%` }}>
        <NodeIcon node={node} /><strong>{node.label}</strong><span>{m.kind[node.kind]}</span>
        <span className={styles.nodeStatus} data-risk={node.risk}>{m.status[node.status]} · {m.risk[node.risk]}</span>
      </button>)}
    </div>
  </div>;
}
function BrainDetail({ node, view, onClose, onSelect, m }: {
  node: BrainNode; view: BrainClientView; onClose: () => void; onSelect: SelectNode; m: Messages;
}) {
  const p = view.projection;
  const source = p.sources.find(source => source.sourceSystem === node.sourceSystem && source.authoritySystem === node.authoritySystem);
  const observed = source ? sourceObservation(source) : null;
  const nodeById = new Map(p.nodes.map(node => [node.id, node]));
  const edges = p.edges.filter(edge => (edge.source === node.id || edge.target === node.id) && nodeById.has(edge.source) && nodeById.has(edge.target));
  const references = node.capabilities.canInspectEvidence ? [...new Set((p.recentEvents ?? [])
    .filter(event => event.entityRef === node.id && event.scopeRef === node.scopeRef && event.redactionClass !== "never_client")
    .flatMap(event => event.evidenceRefs))] : [];
  const fields = [
    [m.statusLabel, m.status[node.status]], [m.riskLabel, m.risk[node.risk]],
    [m.verificationLabel, m.verification[node.verification]], [m.freshnessLabel, m.freshness[node.freshness]],
    [m.scope, node.scopeRef], [m.source, node.sourceSystem], [m.authority, node.authoritySystem],
    [m.observed, observed ?? m.noObservation], [m.owner, m.unknown], [m.due, m.unknown],
  ];
  return <>
    <div className={styles.detailHeading}><NodeIcon node={node} /><div><span>{m.kind[node.kind]}</span><h2 id="brain-detail-title">{node.label}</h2></div>
      <button type="button" onClick={onClose} aria-label={m.close}><X size={20} aria-hidden="true" /></button></div>
    <ModeNotice view={view} m={m} />
    <p className={styles.meta}>{p.partial ? m.partial : m.coverage}</p>
    {node.summary && <p className={styles.summary}>{node.summary}</p>}
    <dl className={styles.fields}>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {node.metric && <div className={styles.metric}><span>{node.metric.label}</span><strong>{node.metric.value} {node.metric.unit}</strong></div>}
    <section className={styles.detailSection}><h3>{m.relationships}</h3>
      {edges.length ? <ul className={styles.relationshipList}>{edges.map(edge => {
        const other = nodeById.get(edge.source === node.id ? edge.target : edge.source)!;
        return <li key={edge.id}><button type="button" onClick={event => onSelect(other.id, event)} disabled={!other.capabilities.canOpen}>
          <span><strong>{other.label}</strong><small>{nodeById.get(edge.source)?.label} → {m.relation[edge.relation]} → {nodeById.get(edge.target)?.label}</small></span>
          <ChevronRight size={16} aria-hidden="true" /></button></li>;
      })}</ul> : <p>{m.noRelationships}</p>}
    </section>
    <section className={styles.detailSection}><h3>{m.evidence}</h3><p>{m.noEvidence}</p>
      {references.length > 0 && <><p>{m.references}</p><ul>{references.map(ref => <li key={ref} className={styles.reference}>{ref}</li>)}</ul></>}
    </section>
    <section className={styles.detailSection}><h3>{m.next}</h3><p>{m.nextNote}</p></section>
  </>;
}

const wideQuery = "(min-width: 1100px)";
const darkQuery = "(prefers-color-scheme: dark)";
function subscribeWide(callback: () => void) { const media = window.matchMedia(wideQuery); media.addEventListener("change", callback); return () => media.removeEventListener("change", callback); }
function subscribeDark(callback: () => void) { const media = window.matchMedia(darkQuery); media.addEventListener("change", callback); return () => media.removeEventListener("change", callback); }

/** Remount on context replacement so the previous selection cannot paint in the new scope. */
export function BrainExplorer({ view }: { view: BrainClientView }) {
  const c = view.projection.context;
  const scopeKey = JSON.stringify([view.mode, c.mode, c.scopeRef, c.organizationRef, c.workspaceRef, c.isolationMode]);
  return <Explorer key={scopeKey} scopeKey={scopeKey} view={view} />;
}
function Explorer({ view, scopeKey }: { view: BrainClientView; scopeKey: string }) {
  const [state, dispatch] = useReducer(brainExplorerReducer, scopeKey, key => initialBrainState(key, "list"));
  const [locale, setLocale] = useState<BrainLocale>("es");
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(wideQuery).matches, () => false);
  const dark = useSyncExternalStore(subscribeDark, () => window.matchMedia(darkQuery).matches, () => true);
  const m = brainMessages[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const fallback = useRef<HTMLButtonElement>(null);
  const p = view.projection;
  const { nodes, edges } = visibleBrainObjects(p, state);
  const selected = nodes.find(node => node.id === state.selectedId);
  const signals = attentionNodes(p);
  useEffect(() => { if (window.matchMedia(wideQuery).matches) dispatch({ type: "view", value: "map" }); }, []);
  useEffect(() => {
    const element = dialog.current;
    if (selected && !wide && element && !element.open) element.showModal();
    if ((!selected || wide) && element?.open) element.close();
    if (state.selectedId && !selected) {
      dispatch({ type: "prune", visibleIds: [] });
      fallback.current?.focus();
    }
  }, [selected, state.selectedId, wide]);
  const onSelect: SelectNode = (id, event) => {
    if (!dialog.current?.contains(event.currentTarget)) opener.current = event.currentTarget;
    if (!nodes.some(node => node.id === id)) {
      dispatch({ type: "focus", value: "all" });
      dispatch({ type: "query", value: "" });
    }
    dispatch({ type: "select", id });
  };
  function closeDetail() {
    dispatch({ type: "select", id: null });
    dialog.current?.close();
    (opener.current?.isConnected ? opener.current : fallback.current)?.focus();
  }
  const navigation: [BrainFocus, string, typeof Compass][] = [["all", m.title, Compass], ["attention", m.today, CalendarDays], ["projects", m.plan, FolderKanban], ["portfolio", m.portfolio, Building2]];
  return <main className={styles.shell} data-theme={theme ?? (dark ? "dark" : "light")} lang={locale}>
    <header className={styles.header}>
      <strong className={styles.brand}>TORO</strong><h1>{m.title}</h1>
      <label className={styles.search}><Search size={18} aria-hidden="true" /><span className={styles.srOnly}>{m.search}</span>
        <input type="search" value={state.query} placeholder={m.search} onChange={event => dispatch({ type: "query", value: event.target.value })} />
      </label>
      <div className={styles.preferences}>
        <div role="group" aria-label={m.language}>{(["es", "en"] as const).map(language => <button key={language} type="button" lang={language} aria-pressed={locale === language} onClick={() => setLocale(language)}>{language.toUpperCase()}</button>)}</div>
        <button type="button" aria-label={`${m.theme}: ${(theme ?? (dark ? "dark" : "light")) === "dark" ? m.light : m.dark}`} onClick={() => setTheme((theme ?? (dark ? "dark" : "light")) === "dark" ? "light" : "dark")}><Sun size={19} className={styles.sun} aria-hidden="true" /><Moon size={19} className={styles.moon} aria-hidden="true" /></button>
      </div>
    </header>
    <div className={styles.frame}>
      <nav className={styles.rail} aria-label={m.navigation}>
        <div className={styles.navItems}>{navigation.map(([focus, label, Icon]) => <button key={focus} type="button" aria-pressed={state.focus === focus} onClick={() => dispatch({ type: "focus", value: focus })} title={m.localView}><Icon size={19} aria-hidden="true" />{label}</button>)}</div>
        <div className={styles.railFoot}><LockKeyhole size={16} aria-hidden="true" /> {m.readonly}<small>@maufertoro</small></div>
      </nav>
      <div className={styles.workspace}>
        <ModeNotice view={view} m={m} />
        <div className={styles.contextLine}><span><strong>{m.scope}:</strong> {p.context.scopeRef}</span><span>{p.partial ? m.partial : m.coverage}</span></div>
        {view.mode !== "unavailable" && <>
          <section className={styles.attention} aria-label={m.attention}>
            {signals.length ? signals.map(node => <button key={node.id} type="button" onClick={event => { dispatch({ type: "focus", value: "all" }); dispatch({ type: "query", value: "" }); onSelect(node.id, event); }} disabled={!node.capabilities.canOpen}>
              <TriangleAlert size={17} aria-hidden="true" /><span><strong>{node.label}</strong><small>{m.status[node.status]} · {m.risk[node.risk]}</small></span>
            </button>) : <p><CheckCheck size={18} aria-hidden="true" />{m.noAttention}</p>}
          </section>
          <div className={styles.toolbar}>
            <div className={styles.viewSwitch} role="group" aria-label={m.view}>
              <button type="button" ref={fallback} aria-pressed={state.view === "map"} onClick={() => dispatch({ type: "view", value: "map" })}><Network size={18} aria-hidden="true" />{m.map}</button>
              <button type="button" aria-pressed={state.view === "list"} onClick={() => dispatch({ type: "view", value: "list" })}><List size={18} aria-hidden="true" />{m.list}</button>
            </div>
            <span className={styles.meta} role="status">{nodes.length} {m.objects} · {edges.length} {m.relations}</span>
            {state.query && <button type="button" onClick={() => dispatch({ type: "query", value: "" })}><X size={16} aria-hidden="true" />{m.clear}</button>}
          </div>
          <div className={styles.composition} data-detail={Boolean(selected && wide)}>
            <section className={styles.explorer} aria-label={m.title}>
              {!nodes.length ? <div className={styles.empty}><CircleHelp size={28} aria-hidden="true" /><h2>{m.empty}</h2><p>{m.emptyNote}</p></div>
                : state.view === "list" ? <BrainList nodes={nodes} selectedId={selected?.id ?? null} onSelect={onSelect} m={m} />
                : <><div className={styles.mapControls} role="group" aria-label={m.map}>
                  <button type="button" aria-label={m.zoomOut} onClick={() => dispatch({ type: "zoom", delta: -0.25 })} disabled={state.zoom <= 0.5}><Minus size={18} aria-hidden="true" /></button>
                  <output>{Math.round(state.zoom * 100)}%</output>
                  <button type="button" aria-label={m.zoomIn} onClick={() => dispatch({ type: "zoom", delta: 0.25 })} disabled={state.zoom >= 2}><Plus size={18} aria-hidden="true" /></button>
                  <button type="button" aria-label={m.reset} onClick={() => dispatch({ type: "reset-map" })}><RotateCcw size={17} aria-hidden="true" /><span>{m.reset}</span></button>
                  {([[m.left, ArrowLeft, -80, 0], [m.right, ArrowRight, 80, 0], [m.up, ArrowUp, 0, -80], [m.down, ArrowDown, 0, 80]] as const).map(([label, Icon, x, y]) => <button key={label} type="button" aria-label={label} onClick={() => dispatch({ type: "pan", x: state.pan.x + x, y: state.pan.y + y })}><Icon size={17} aria-hidden="true" /></button>)}
                </div><p id="brain-map-hint" className={styles.srOnly}>{m.mapHint}</p>
                <BrainMap nodes={nodes} edges={edges} view={view} state={state} onSelect={onSelect} m={m} /></>}
            </section>
            {selected && wide && <aside className={styles.detail} aria-labelledby="brain-detail-title"><BrainDetail node={selected} view={view} m={m} onSelect={onSelect} onClose={closeDetail} /></aside>}
          </div>
          <details className={styles.sources}><summary>{m.sources} · {p.sources.length}</summary>
            {p.sources.length ? <ul>{p.sources.map((source, i) => <li key={`${source.sourceSystem}:${i}`}><strong>{source.sourceSystem}</strong><span>{m.authority}: {source.authoritySystem}</span><span>{m.freshness[source.freshness]} · {m.verification[source.verification]}</span><span>{m.observed}: {sourceObservation(source) ?? m.noObservation}</span></li>)}</ul> : <p>{m.noSources}</p>}
            <p>{m.generated}: {p.generatedAt || m.unknown} · {m.generatedNote}</p>
          </details>
        </>}
        <footer className={styles.footer}><span>{m.author}</span><span>{m.sourceText}</span></footer>
      </div>
    </div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="brain-detail-title" onCancel={event => { event.preventDefault(); closeDetail(); }}>
      {selected && !wide && <BrainDetail node={selected} view={view} m={m} onSelect={onSelect} onClose={closeDetail} />}
    </dialog>
  </main>;
}
