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
    expect(html).toContain("Simulation only");
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
    expect(html).toContain("Source authority");
    expect(html).not.toContain("reference simulation");
    expect(html).not.toContain("demo:cash-gap:1");
    expect(html).not.toContain("Synthetic scenario summary");
    expect(html).not.toContain("Watch TORO work");
    expect(html).not.toContain("Cash coverage");
    expect(html).not.toContain("CAPEX change");
    expect(connectionMock).toHaveBeenCalled();
  });
});

