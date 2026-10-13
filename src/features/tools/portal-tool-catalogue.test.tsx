import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ToolLink } from "./directory";
import { getToolPresentation } from "./portal-tool-links";
import { PortalToolCatalogue, selectToolCatalogue, toolCatalogueReducer } from "./portal-tool-catalogue";

const links: ToolLink[] = [
  { id: "LINK-048", label: "Recepción Ágil", url: "https://example.com/reservations" },
  { id: "PORTAL-POS", label: "Caja de prueba", url: "https://example.com/point-of-sale" },
  { id: "LINK-086", label: "Equipo de prueba", url: "https://example.com/team" },
  { id: "LINK-178", label: "Mensajes de prueba", url: "https://example.com/messages" },
  { id: "TEST-SUPPLIER", label: "  🧰 Proveedor Ágil  ", url: "https://example.com/supplier" },
  { id: "TEST-SUPPORT", label: "Soporte de prueba", url: "https://example.com/support" },
];
const initialState = { query: "", category: "Todas" };
const ids = (items: ToolLink[]) => items.map(item => item.id);
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

describe("authorized tool presentation", () => {
  it("renders a readable fallback for an authorized link without a registered brand", () => {
    const presentation = getToolPresentation(links[4]);
    expect(presentation).toMatchObject({
      name: "Proveedor Ágil", title: "Proveedor Ágil", category: "Otros", detail: "Acceso externo", logo: null,
    });
    expect(presentation.Icon).toBeTruthy();
    const html = renderToStaticMarkup(<PortalToolCatalogue links={[links[4]]} idPrefix="fallback" />);
    expect(html).toContain("Proveedor Ágil");
    expect(html).toContain("Acceso externo");
    expect(html).toContain('href="https://example.com/supplier"');
  });

  it("does not confuse an inherited object property with a registered brand", () => {
    const inheritedId = { id: "constructor", label: "Acceso técnico", url: "https://example.com/technical" };
    expect(getToolPresentation(inheritedId)).toMatchObject({
      name: "Acceso técnico", title: "Acceso técnico", category: "Otros", detail: "Acceso externo", logo: null,
    });
  });
});

describe("tool catalogue selection", () => {
  it("preserves distinct destinations of the same provider without mutating the input", () => {
    const original = links.map(link => ({ ...link }));
    const selection = selectToolCatalogue(links, initialState);
    expect(selection.filteredLinks).toEqual(original);
    expect(selection.filteredLinks.filter(link => ["LINK-048", "PORTAL-POS"].includes(link.id)))
      .toEqual([original[0], original[1]]);
    expect(links).toEqual(original);
  });

  it.each([
    ["recepcion agil", ["LINK-048"]],
    ["PROVEEDOR AGIL", ["TEST-SUPPLIER"]],
    ["consumos", ["PORTAL-POS"]],
    ["otros", ["TEST-SUPPLIER", "TEST-SUPPORT"]],
  ])("searches labels, purpose and categories without case or accent barriers: %s", (query, expected) => {
    expect(ids(selectToolCatalogue(links, { ...initialState, query }).filteredLinks)).toEqual(expected);
  });

  it("does not expose URL text as searchable catalogue metadata", () => {
    expect(selectToolCatalogue(links, { ...initialState, query: "https://example.com" }).filteredLinks).toEqual([]);
    expect(selectToolCatalogue(links, { ...initialState, query: "/point-of-sale" }).filteredLinks).toEqual([]);
  });

  it("groups every authorized destination once and reports the original total", () => {
    const selection = selectToolCatalogue(links, initialState);
    expect(selection.total).toBe(links.length);
    const grouped = selection.groups.flatMap(group => group.links);
    expect(ids(grouped).sort()).toEqual(ids(links).sort());
    expect(new Set(selection.categories).size).toBe(selection.categories.length);
    expect(selection.categories).toContain("Otros");
    for (const group of selection.groups) {
      expect(selection.categories).toContain(group.category);
      expect(group.links.length).toBeGreaterThan(0);
      expect(group.links.every(link => getToolPresentation(link).category === group.category)).toBe(true);
    }
    expect(selection.groups.find(group => group.category === "Otros")?.links).toHaveLength(2);
  });

  it("combines category and query filters while keeping the full catalogue count", () => {
    const selection = selectToolCatalogue(links, { category: "Otros", query: "agil" });
    expect(ids(selection.filteredLinks)).toEqual(["TEST-SUPPLIER"]);
    expect(selection.groups).toEqual([{ category: "Otros", links: [links[4]] }]);
    expect(selection.total).toBe(links.length);
  });

  it("treats whitespace as an empty query and handles an empty authorized directory", () => {
    expect(selectToolCatalogue(links, { ...initialState, query: "   " }).filteredLinks).toEqual(links);
    const empty = selectToolCatalogue([], initialState);
    expect(empty.filteredLinks).toEqual([]);
    expect(empty.groups).toEqual([]);
    expect(empty.total).toBe(0);
  });

  it("recovers all links after an empty search result through the reset action", () => {
    const categoryState = toolCatalogueReducer(initialState, { type: "category", value: "Otros" });
    const queryState = toolCatalogueReducer(categoryState, { type: "query", value: "unmatched synthetic term" });
    expect(queryState).toEqual({ category: "Otros", query: "unmatched synthetic term" });
    expect(selectToolCatalogue(links, queryState).filteredLinks).toEqual([]);
    const reset = toolCatalogueReducer(queryState, { type: "reset" });
    expect(reset).toEqual(initialState);
    expect(selectToolCatalogue(links, reset).filteredLinks).toEqual(links);
    expect(initialState).toEqual({ query: "", category: "Todas" });
    expect(queryState).toEqual({ category: "Otros", query: "unmatched synthetic term" });
  });
});

describe("tool catalogue markup", () => {
  it("keeps every destination external and resolves accessible names and descriptions to unique IDs", () => {
    const html = renderToStaticMarkup(<><PortalToolCatalogue links={links} idPrefix="primary" />
      <PortalToolCatalogue links={links} idPrefix="secondary" /></>);
    const renderedIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(renderedIds).size).toBe(renderedIds.length);
    const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map(match => match[0]);
    expect(anchors).toHaveLength(links.length * 2);
    for (const link of links) {
      expect(anchors.filter(anchor => anchor.includes(`href="${link.url}"`))).toHaveLength(2);
    }
    for (const anchor of anchors) {
      expect(anchor).toContain('target="_blank"');
      const rel = anchor.match(/\brel="([^"]+)"/)?.[1].split(/\s+/);
      expect(rel).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
      for (const attribute of ["aria-labelledby", "aria-describedby"]) {
        const references = anchor.match(new RegExp(`${attribute}="([^"]+)"`))?.[1].split(/\s+/);
        expect(references?.length).toBeGreaterThan(0);
        for (const reference of references ?? []) expect(renderedIds).toContain(reference);
      }
    }
  });

  it("states partial coverage and a separate provider session without claiming integration", () => {
    const html = renderToStaticMarkup(<PortalToolCatalogue links={links} idPrefix="partial" directoryAvailable={false} />);
    const text = normalize(html);
    expect(text).toMatch(/parcial/);
    expect(text).toContain("sesion propia");
    expect(text).not.toMatch(/integracion activa|sincronizado|conexion verificada/);
    for (const link of links) expect(html).toContain(`href="${link.url}"`);
  });
});
