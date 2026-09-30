import type { BrainProjection } from "@/lib/brain-contracts";
import { allAttentionNodes } from "./presentation";
export type BrainView = "map" | "list";
export type BrainFocus = "all" | "attention" | "projects" | "portfolio";
export type BrainLocale = "es" | "en";
export type BrainExplorerState = { scopeKey: string; view: BrainView; focus: BrainFocus; query: string; selectedId: string | null; zoom: number; pan: { x: number; y: number } };
export type BrainExplorerAction = { type: "view"; value: BrainView } | { type: "focus"; value: BrainFocus } | { type: "query"; value: string } | { type: "select"; id: string | null } | { type: "replace-scope"; scopeKey: string } | { type: "prune"; visibleIds: string[] } | { type: "zoom"; delta: number } | { type: "pan"; x: number; y: number } | { type: "reset-map" };
export function initialBrainState(scopeKey: string, view: BrainView): BrainExplorerState { return { scopeKey, view, focus: "all", query: "", selectedId: null, zoom: 1, pan: { x: 0, y: 0 } }; }
export function brainExplorerReducer(state: BrainExplorerState, action: BrainExplorerAction): BrainExplorerState {
  switch (action.type) {
    case "view": return { ...state, view: action.value };
    case "focus": return { ...state, focus: action.value };
    case "query": return { ...state, query: action.value };
    case "select": return { ...state, selectedId: action.id };
    case "replace-scope": return action.scopeKey === state.scopeKey ? state : initialBrainState(action.scopeKey, "list");
    case "prune": return !state.selectedId || action.visibleIds.includes(state.selectedId) ? state : { ...state, selectedId: null };
    case "zoom": return Number.isFinite(action.delta) ? { ...state, zoom: Math.min(2, Math.max(0.5, state.zoom + action.delta)) } : state;
    case "pan": return Number.isFinite(action.x) && Number.isFinite(action.y) ? { ...state, pan: { x: action.x, y: action.y } } : state;
    case "reset-map": return { ...state, zoom: 1, pan: { x: 0, y: 0 } };
  }
}

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function visibleBrainObjects(projection: BrainProjection, state: BrainExplorerState) {
  const query = normalize(state.query.trim());
  const candidates = state.focus === "attention" ? allAttentionNodes(projection) : [...projection.nodes].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const nodes = candidates.filter(node => {
    if (state.focus === "projects" && node.kind !== "project") return false;
    if (state.focus === "portfolio" && !["portfolio", "organization", "business", "property", "project"].includes(node.kind)) return false;
    return !query || normalize([node.label, node.id, node.summary, node.kind, node.sourceSystem].filter(Boolean).join(" ")).includes(query);
  });
  const ids = new Set(nodes.map(node => node.id));
  return { nodes, edges: projection.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)) };
}
