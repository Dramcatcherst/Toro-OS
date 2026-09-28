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

describe("BrainPage projection modes", () => {
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

    expect(html).toContain("reference simulation");
    expect(html).toContain("demo:cash-gap:1");
    expect(html).toContain("Synthetic scenario summary");
    expect(html).toContain("Swipe or use arrow keys to inspect three signals.");
    expect(html).toMatch(/tab[Ii]ndex="0"/);
    expect(html).toContain('data-brain-mini-map="true"');
    expect(html).toContain("Synthetic visual Brain overview");
    expect(html).toContain('href="#brain-node-node:cash"');
    expect(html).toContain('id="brain-node-node:cash"');
    expect(html).toContain(`${visualBrainDemo.nodes.length} nodes · ${visualBrainDemo.edges.length} links`);
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

  it("starts the mobile Brain as collapsed node layers while preserving desktop nodes", async () => {
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
    expect(html).toContain("Open a node to reveal its connections");
    expect(html).toContain("The same Brain without spatial navigation");
    expect(html.match(/data-brain-list-node/g)).toHaveLength(visualBrainDemo.nodes.length);
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
    expect(html.match(/data-evidence-state="current"/g)).toHaveLength(1);
    expect(html.match(/data-evidence-state="needs-review"/g)).toHaveLength(1);
    expect(html).toContain("No live activity is claimed");
    expect(html).not.toContain("Synthetic scenario summary");
    expect(html).not.toContain("Watch TORO work");
  });
});
