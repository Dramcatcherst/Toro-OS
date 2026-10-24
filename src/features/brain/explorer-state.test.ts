import { describe, expect, it } from "vitest";
import type { BrainProjection } from "@/lib/brain-contracts";
import { visualBrainDemo } from "@/lib/brain-fixtures";
import { brainExplorerReducer as reduce, initialBrainState, visibleBrainObjects } from "./explorer-state";
import { brainMessages } from "./messages";

function fixture(): BrainProjection {
  const node = visualBrainDemo.nodes[0];
  return { ...structuredClone(visualBrainDemo), nodes: [
    { ...node, id: "hotel", kind: "business", label: "Dreamcatcher", summary: "Dreamfull: full hotel private buyout" },
    { ...node, id: "dc", kind: "property", label: "Dreamcatcher Villa" },
    { ...node, id: "mk", kind: "property", label: "Makaiza" },
    { ...node, id: "to", kind: "property", label: "Villa Toro" },
    { ...node, id: "outside", kind: "project", label: "Vílla Tóro", status: "Blocked" },
  ], edges: ["dc", "mk", "to"].map(id => ({ id: `edge:${id}`, source: id, target: "hotel", relation: "part_of" })) };
}

describe("brain explorer state", () => {
  it("searches_all_attention_records_beyond_the_four_highlights", () => {
    const p = fixture();
    const base = p.nodes[0];
    p.nodes = ["a", "b", "c", "d", "e"].map(id => ({ ...base, id, label: `Alerta ${id}`, risk: "Critical" }));
    const state = { ...initialBrainState("a", "list"), focus: "attention" as const };
    expect(visibleBrainObjects(p, { ...state, query: "Alerta e" }).nodes.map(node => node.id)).toEqual(["e"]);
    expect(visibleBrainObjects(p, state).nodes.map(node => node.id)).toEqual(["a", "b", "c", "d", "e"]);
  });
  it("preserves_selection_between_views", () => {
    const state = reduce(initialBrainState("a", "list"), { type: "select", id: "to" });
    expect(reduce(state, { type: "view", value: "map" })).toMatchObject({ view: "map", selectedId: "to" });
  });
  it("resets_scope_state", () => {
    const state = { ...initialBrainState("a", "map"), selectedId: "to", query: "villa", focus: "projects" as const, zoom: 2, pan: { x: 40, y: 70 } };
    expect(reduce(state, { type: "replace-scope", scopeKey: "b" })).toEqual({ scopeKey: "b", view: "list", focus: "all", query: "", selectedId: null, zoom: 1, pan: { x: 0, y: 0 } });
    expect(reduce(state, { type: "replace-scope", scopeKey: "a" })).toBe(state);
  });
  it("drops_removed_selection", () => {
    const state = { ...initialBrainState("a", "list"), selectedId: "to" };
    expect(reduce(state, { type: "prune", visibleIds: ["to"] }).selectedId).toBe("to");
    expect(reduce(state, { type: "prune", visibleIds: ["mk"] }).selectedId).toBeNull();
  });
  it("matches_accents_without_merging_ids", () => {
    const p = fixture();
    const before = JSON.stringify(p);
    const state = reduce(initialBrainState("a", "list"), { type: "query", value: "VILLA TORO" });
    expect(visibleBrainObjects(p, state).nodes.map(n => n.id)).toEqual(["outside", "to"]);
    expect(JSON.stringify(p)).toBe(before);
  });
  it("filters_edges_with_missing_endpoint", () => {
    const p = fixture();
    p.edges.push({ id: "dangling", source: "hotel", target: "absent", relation: "connected_to" });
    const state = initialBrainState("a", "list");
    expect(visibleBrainObjects(p, state).edges.map(e => e.id)).toEqual(["edge:dc", "edge:mk", "edge:to"]);
    expect(visibleBrainObjects(p, { ...state, query: "Villa Toro" }).edges).toEqual([]);
  });
  it("keeps_equivalent_ids", () => {
    const p = fixture();
    const before = JSON.stringify(p);
    for (const view of ["list", "map"] as const) {
      expect(visibleBrainObjects(p, initialBrainState("a", view)).nodes.map(n => n.id))
        .toEqual(["dc", "hotel", "mk", "outside", "to"]);
    }
    expect(JSON.stringify(p)).toBe(before);
  });
  it("bounds_zoom_and_resets_pan", () => {
    const state = initialBrainState("a", "map");
    expect(reduce(state, { type: "zoom", delta: 100 }).zoom).toBe(2);
    expect(reduce(state, { type: "zoom", delta: -100 }).zoom).toBe(0.5);
    expect(reduce(state, { type: "zoom", delta: NaN }).zoom).toBe(1);
    const moved = reduce(state, { type: "pan", x: 40, y: -80 });
    expect(moved.pan).toEqual({ x: 40, y: -80 });
    expect(reduce(moved, { type: "reset-map" })).toMatchObject({ zoom: 1, pan: { x: 0, y: 0 } });
  });
  it("filters_projects_and_attention_without_moving_hotel_entities", () => {
    const p = fixture();
    const state = initialBrainState("a", "list");
    for (const focus of ["projects", "attention"] as const) {
      expect(visibleBrainObjects(p, reduce(state, { type: "focus", value: focus })).nodes.map(n => n.id)).toEqual(["outside"]);
    }
    const result = visibleBrainObjects(p, { ...state, focus: "portfolio" });
    expect(result.nodes.filter(n => n.kind === "property").map(n => n.id)).toEqual(["dc", "mk", "to"]);
    expect(result.edges.filter(e => e.target === "hotel").map(e => e.source)).toEqual(["dc", "mk", "to"]);
    expect(result.nodes.find(n => n.id === "hotel")?.summary).toContain("Dreamfull");
  });
  it("has_equivalent_translation_keys", () => {
    expect(Object.keys(brainMessages.es).sort()).toEqual(Object.keys(brainMessages.en).sort());
    expect(Object.keys(brainMessages.es.status).sort()).toEqual(Object.keys(brainMessages.en.status).sort());
  });
});
