import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { visualBrainDemo, visualBrainDemoLayout } from "@/lib/brain-fixtures";
import { toBrainClientView } from "@/features/brain/presentation";
import { BrainExplorer } from "./brain-explorer";

function fixture() {
  return toBrainClientView({ projection: structuredClone(visualBrainDemo), layout: visualBrainDemoLayout,
    runtime: { mode: "synthetic_only", realData: false, externalWrite: false, stage: "B", reason: "private-runtime-sentinel" } });
}
describe("BrainExplorer server markup", () => {
  it("does_not_claim_finance_from_generic_projection", () => {
    const view = fixture();
    view.projection.nodes = [{ ...view.projection.nodes[0], id: "project:a", kind: "project", label: "Proyecto sintético" }];
    view.projection.edges = [];
    view.projection.recentEvents = [];
    view.projection.sources = [];
    const html = renderToStaticMarkup(<BrainExplorer view={view} />);
    expect(html).toContain("Proyecto sintético");
    for (const text of ["Cash coverage", "CAPEX change", "demo:cash-gap:1", "1 aprobación", "private-runtime-sentinel"])
      expect(html.includes(text)).toBe(false);
  });
  it("demo_is_persistent", () => {
    const html = renderToStaticMarkup(<BrainExplorer view={fixture()} />);
    expect(html).toContain("Demostración · datos de ejemplo");
    expect(html).toContain("@maufertoro");
    expect(html).toContain('lang="es"');
  });
  it("unavailable_is_not_zero", () => {
    const view = fixture();
    view.mode = "unavailable";
    view.projection.nodes = [];
    view.projection.sources = [];
    const html = renderToStaticMarkup(<BrainExplorer view={view} />);
    expect(html).toContain("No pudimos verificar estos datos");
    expect(html).not.toContain("0 objetos");
  });
  it("no_unavailable_evidence_link", () => {
    const view = fixture();
    const html = renderToStaticMarkup(<BrainExplorer view={view} />);
    expect(html).not.toMatch(/href="(?:node:|event:|demo:|https?:)/);
    expect(html).not.toContain("private-runtime-sentinel");
  });
  it("no_external_action", () => {
    const html = renderToStaticMarkup(<BrainExplorer view={fixture()} />);
    expect(html).not.toContain("<form");
    expect(html).not.toMatch(/type="submit"|formaction=|>Pagar<|>Enviar<|>Aprobar</);
    expect(html).toContain("Sin acciones externas");
  });
});
