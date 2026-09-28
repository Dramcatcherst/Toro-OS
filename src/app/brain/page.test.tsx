import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { connectionMock, loadBrainProjectionViewMock } = vi.hoisted(() => ({
  connectionMock: vi.fn().mockResolvedValue(undefined),
  loadBrainProjectionViewMock: vi.fn(),
}));

vi.mock("next/server", () => ({ connection: connectionMock }));

vi.mock("@/lib/server/brain-projection", () => ({
  loadBrainProjectionView: loadBrainProjectionViewMock,
}));

import { visualBrainDemo, visualBrainDemoLayout } from "@/lib/brain-fixtures";
import type { CanonicalBrainReadSlice } from "@/features/brain/canonical-read";
import {
  buildCanonicalBrainLayout,
  buildCanonicalBrainProjection,
} from "@/features/brain/canonical-projection";
import BrainPage from "./page";
import { initialBrainNodes, searchBrainNodes, unrevealedNeighbors } from "./brain-map";

describe("BrainPage projection modes", () => {
  it("searches only loaded authorized neurons, including ones not yet revealed", () => {
    expect(searchBrainNodes(visualBrainDemo, visualBrainDemoLayout, "reservations").map((node) => node.id)).toEqual(["node:revenue"]);
    expect(searchBrainNodes(visualBrainDemo, visualBrainDemoLayout, "KROSS").map((node) => node.id)).toContain("node:kross");
    expect(searchBrainNodes(visualBrainDemo, visualBrainDemoLayout, " ")).toEqual([]);
    const reduced = { ...visualBrainDemo, nodes: visualBrainDemo.nodes.filter((node) => node.id !== "node:revenue") };
    expect(searchBrainNodes(reduced, visualBrainDemoLayout, "reservations")).toEqual([]);
    const layoutWithoutRevenue = { ...visualBrainDemoLayout };
    delete layoutWithoutRevenue["node:revenue"];
    expect(searchBrainNodes(visualBrainDemo, layoutWithoutRevenue, "reservations")).toEqual([]);
  });

  it("reveals only supplied graph neighbors without inventing hierarchy or duplicated nodes", () => {
    const initial = initialBrainNodes(visualBrainDemo, visualBrainDemoLayout);
    const known = new Set(initial);
    expect(initial).toHaveLength(8);
    expect(unrevealedNeighbors("node:kross", visualBrainDemo, known, visualBrainDemoLayout)).toEqual(["node:revenue"]);
    expect(unrevealedNeighbors("node:decision", visualBrainDemo, known, visualBrainDemoLayout)).toEqual(["node:capex-approval"]);
    expect(unrevealedNeighbors("node:kross", visualBrainDemo, new Set([...initial, "node:revenue"]), visualBrainDemoLayout)).toEqual([]);
    const reduced = { ...visualBrainDemo, nodes: visualBrainDemo.nodes.filter((node) => node.id !== "node:revenue") };
    expect(unrevealedNeighbors("node:kross", reduced, known, visualBrainDemoLayout)).toEqual([]);
  });

  it("keeps a disconnected cycle discoverable without claiming it is a child", () => {
    const prototypeNode = visualBrainDemo.nodes[0];
    const prototypeEdge = visualBrainDemo.edges[0];
    const cycleA = "node:disconnected-a", cycleB = "node:disconnected-b";
    const projection = {
      ...visualBrainDemo,
      nodes: [...visualBrainDemo.nodes, { ...prototypeNode, id: cycleA }, { ...prototypeNode, id: cycleB }],
      edges: [
        ...visualBrainDemo.edges,
        { ...prototypeEdge, id: "edge:cycle-a-b", source: cycleA, target: cycleB },
        { ...prototypeEdge, id: "edge:cycle-b-a", source: cycleB, target: cycleA },
      ],
    };
    const point = visualBrainDemoLayout[prototypeNode.id];
    const layout = { ...visualBrainDemoLayout, [cycleA]: point, [cycleB]: point };
    const initial = initialBrainNodes(projection, layout);
    expect(initial).toContain(cycleA);
    expect(initial).toContain(cycleB);
    expect(new Set(initial).size).toBe(initial.length);
  });

  it("labels the example as synthetic and shows its example-only panels", async () => {
    loadBrainProjectionViewMock.mockResolvedValue({
      projection: visualBrainDemo,
      layout: visualBrainDemoLayout,
      runtime: {
        mode: "synthetic_only",
        realData: false,
        externalWrite: false,
        stage: "B",
        reason: "Fixture",
      },
    });

    const html = renderToStaticMarkup(await BrainPage());
    const initial = initialBrainNodes(visualBrainDemo, visualBrainDemoLayout);
    const initialSet = new Set(initial);
    const initialEdges = visualBrainDemo.edges.filter((edge) => initialSet.has(edge.source) && initialSet.has(edge.target));

    expect(html).toContain("reference simulation");
    expect(html).toContain("demo:cash-gap:1");
    expect(html).toContain("Synthetic scenario summary");
    expect(html).toContain("Swipe or use arrow keys to inspect three signals.");
    expect(html).toMatch(/tab[Ii]ndex="0"/);
    expect(html).toContain('data-brain-mini-map="true"');
    expect(html).toContain('data-brain-search="desktop"');
    expect(html).toContain('data-brain-search="mobile"');
    expect(html).toContain("Example network only");
    expect(html.match(/data-brain-edge-tooltip="true"/g)).toHaveLength(initialEdges.length * 2);
    expect(html).toContain("Example link: TORO Finance reads from Kross PMS. verified · current.");
    expect(html).toContain("hover a link for its relation");
    expect(html).toContain("Synthetic visual Brain overview");
    expect(html.match(/name="brain-map-node"/g)).toHaveLength(initial.length);
    expect(html).toContain('data-brain-mobile-node="node:kross"');
    expect(html.match(/tabindex="-1"/g)).toHaveLength(initial.length);
    expect(html).toContain('data-brain-expand="node:kross"');
    expect(html).toContain('data-brain-expand="node:decision"');
    expect(html).toContain('data-brain-graph="true"');
    expect(html).toContain("View all documented connections");
    expect(html).toContain("Status: Review · Verification: partially verified");
    expect(html).toContain("Signal freshness: aging");
    expect(html).toContain('href="#brain-node-node:cash"');
    expect(html).toContain('id="brain-node-node:cash"');
    expect(html).toContain(`${initial.length} / ${visualBrainDemo.nodes.length} nodes · ${initialEdges.length} visible links`);
    expect(html).toContain("Simulation only");
    expect(html).toContain('data-brain-trace="mobile"');
    expect(html).toContain(`Example event trace · ${visualBrainDemo.recentEvents?.length ?? 0} steps`);
    expect(html).not.toMatch(/<details[^>]*data-brain-trace="mobile"[^>]*\sopen(?:\s|>)/);
    expect(html).toContain("No external action executed. Open to inspect the example.");
    expect(connectionMock).toHaveBeenCalled();
  });

  it("never presents synthetic activity or finance panels as canonical facts", async () => {
    loadBrainProjectionViewMock.mockResolvedValue({
      projection: {
        ...visualBrainDemo,
        synthetic: false,
        nodes: visualBrainDemo.nodes.slice(0, 1),
        edges: [],
        recentEvents: undefined,
      },
      layout: visualBrainDemoLayout,
      runtime: {
        mode: "canonical_read_only",
        realData: true,
        externalWrite: false,
        stage: "C",
        reason: "Fixture",
      },
    });

    const html = renderToStaticMarkup(await BrainPage());

    expect(html).toContain("permission-scoped read");
    expect(html).toContain("Canonical read-only projection");
    expect(html).toContain("Read-only visual Brain overview");
    expect(html).toContain('data-brain-mini-map="true"');
    expect(html).toContain("Source authority");
    expect(html).not.toContain("reference simulation");
    expect(html).not.toContain("demo:cash-gap:1");
    expect(html).not.toContain("Synthetic scenario summary");
    expect(html).not.toContain("Watch TORO work");
    expect(html).not.toContain('data-brain-trace="mobile"');
    expect(html).not.toContain("Cash coverage");
    expect(html).not.toContain("CAPEX change");
    expect(connectionMock).toHaveBeenCalled();
  });

  it("marks unverified current links for review instead of drawing them as verified", async () => {
    const currentEdge = visualBrainDemo.edges[0];
    loadBrainProjectionViewMock.mockResolvedValue({
      projection: {
        ...visualBrainDemo,
        synthetic: false,
        nodes: visualBrainDemo.nodes.slice(0, 2),
        edges: [
          currentEdge,
          { ...currentEdge, id: "edge:unverified", verification: "unverified" },
        ],
        recentEvents: undefined,
      },
      layout: visualBrainDemoLayout,
      runtime: {
        mode: "canonical_read_only",
        realData: true,
        externalWrite: false,
        stage: "C",
        reason: "Fixture",
      },
    });

    const html = renderToStaticMarkup(await BrainPage());

    expect(html).toContain("evidence needs review");
    expect(html.match(/data-evidence-state="current"/g)).toHaveLength(1);
    expect(html.match(/data-evidence-state="needs-review"/g)).toHaveLength(1);
    expect(html).toContain('marker-end="url(#arrowAttention)"');
  });

  it("keeps visible connections explorable when the spatial map is hidden", async () => {
    loadBrainProjectionViewMock.mockResolvedValue({
      projection: {
        ...visualBrainDemo,
        synthetic: false,
        nodes: visualBrainDemo.nodes.slice(0, 2),
        edges: [visualBrainDemo.edges[0], visualBrainDemo.edges[1]],
        recentEvents: undefined,
      },
      layout: visualBrainDemoLayout,
      runtime: {
        mode: "canonical_read_only",
        realData: true,
        externalWrite: false,
        stage: "C",
        reason: "Fixture",
      },
    });

    const html = renderToStaticMarkup(await BrainPage());

    expect(html).toContain("1 connection</summary>");
    expect(html).toContain("connected to → TORO Finance");
    expect(html).toContain("Dreamcatcher Hotel → connected to");
    expect(html).not.toContain("reads from → Kross PMS");
  });

  it("keeps mobile layers collapsed in a swipeable rail while preserving desktop nodes", async () => {
    loadBrainProjectionViewMock.mockResolvedValue({
      projection: visualBrainDemo,
      layout: visualBrainDemoLayout,
      runtime: {
        mode: "synthetic_only",
        realData: false,
        externalWrite: false,
        stage: "B",
        reason: "Fixture",
      },
    });

    const html = renderToStaticMarkup(await BrainPage());

    expect(html.match(/<details[^>]*data-brain-layer="node"/g)).toHaveLength(visualBrainDemo.nodes.length);
    expect(html).not.toMatch(/<details[^>]*data-brain-layer="node"[^>]*\sopen(?:\s|>)/);
    expect(html).toContain("Swipe nodes · open for connections");
    expect(html).toContain('aria-label="Swipeable Brain node layers"');
    expect(html).toContain("The same Brain without spatial navigation");
    expect(html.match(/data-brain-list-node/g)).toHaveLength(visualBrainDemo.nodes.length);
  });

  it("preserves native keyboard controls from each map neuron to its matching layer", async () => {
    loadBrainProjectionViewMock.mockResolvedValue({
      projection: visualBrainDemo,
      layout: visualBrainDemoLayout,
      runtime: {
        mode: "synthetic_only",
        realData: false,
        externalWrite: false,
        stage: "B",
        reason: "Fixture",
      },
    });

    const html = renderToStaticMarkup(await BrainPage());
    const initial = initialBrainNodes(visualBrainDemo, visualBrainDemoLayout);

    expect(html.match(/<details[^>]*name="brain-map-node"[^>]*><summary aria-label="[^"]+\. Show details\."[^>]*>/g))
      .toHaveLength(initial.length);
    expect(html.match(/name="brain-map-node"[^>]*style="[^"]*width:44px;height:44px"/g))
      .toHaveLength(initial.length);
    expect(html.match(/<summary[^>]*><span class="[^"]*mobileMapVisual[^"]*" style="width:(?:22|[23]\d|3[0-8])px;height:(?:22|[23]\d|3[0-8])px"/g))
      .toHaveLength(initial.length);
    for (const node of visualBrainDemo.nodes.filter((candidate) => initial.includes(candidate.id))) {
      expect(html).toContain(`href="#brain-node-${node.id}"`);
      expect(html).toContain(`id="brain-node-${node.id}"`);
    }
  });

  it("renders the real canonical projection shape without synthetic business claims", async () => {
    const slice: CanonicalBrainReadSlice = {
      contractVersion: "stage-c-read-v1",
      generatedAt: "2026-09-23T12:00:00.000Z",
      scopeRef: "scope:test",
      organization: { ref: "organization:test", label: "Example Organization", status: "active" },
      projects: [{
        ref: "project:test",
        label: "Illustrative Project",
        status: "active",
        priority: "P2",
        businessArea: "Operations",
        moduleKey: "TORO_OPERATE",
        completionPct: null,
        needsRevalidation: false,
        sourceSystem: "Supabase",
        updatedAt: "2026-09-23T11:00:00.000Z",
      }],
      sourceAuthority: [],
      domainGovernance: [],
      krossHealth: [{
        ref: "kross-health:test",
        sourceName: "Example Kross connector",
        snapshotKind: "operational",
        sourceAsOf: "2026-09-22T12:00:00.000Z",
        observedAt: "2026-09-23T11:00:00.000Z",
        liveRequired: true,
        freshness: "stale",
        safeForCurrentState: false,
      }],
    };
    const projection = buildCanonicalBrainProjection(slice);
    loadBrainProjectionViewMock.mockResolvedValue({
      projection,
      layout: buildCanonicalBrainLayout(projection),
      runtime: {
        mode: "canonical_read_only",
        realData: true,
        externalWrite: false,
        stage: "C",
        reason: "Fixture",
      },
    });

    const html = renderToStaticMarkup(await BrainPage());

    expect(html).toContain("Example Organization");
    expect(html).toContain("Illustrative Project");
    expect(html).toContain("Example Kross connector");
    expect(html).toContain("Read-only link: Example Organization connected to Example Kross connector. unverified · stale.");
    expect(html).not.toContain("Example link:");
    expect(html.match(/data-evidence-state="current"/g)).toHaveLength(1);
    expect(html.match(/data-evidence-state="needs-review"/g)).toHaveLength(1);
    expect(html).toContain("It does not show live agent activity");
    expect(html).not.toContain("Synthetic scenario summary");
    expect(html).not.toContain("Watch TORO work");
  });
});
