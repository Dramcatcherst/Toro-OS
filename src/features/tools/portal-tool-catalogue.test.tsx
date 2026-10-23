import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  catalogueItemsFromLinks,
  projectCompleteCatalogueRows,
  type DirectoryCatalogueItem,
  type ToolCatalogueItem,
  type ToolLink,
} from "./directory";
import { authorizedContext, completeCatalogueRows } from "./fixtures.test-utils";
import { getToolPresentation } from "./portal-tool-links";
import {
  initialToolCatalogueFilters,
  PortalToolCatalogue,
  selectToolCatalogue,
  TOOL_CATALOGUE_BATCH_SIZE,
  toolCatalogueReducer,
  type ToolCatalogueFilters,
} from "./portal-tool-catalogue";

const links: ToolLink[] = [
  { id: "LINK-048", label: "Recepción Ágil", url: "https://example.com/reservations" },
  { id: "PORTAL-POS", label: "Caja de prueba", url: "https://example.com/point-of-sale" },
  { id: "LINK-086", label: "Equipo de prueba", url: "https://example.com/team" },
  { id: "LINK-178", label: "Mensajes de prueba", url: "https://example.com/messages" },
  { id: "TEST-SUPPLIER", label: "  🧰 Proveedor Ágil  ", url: "https://example.com/supplier" },
  { id: "TEST-SUPPORT", label: "Soporte de prueba", url: "https://example.com/support" },
];
const reviewed = catalogueItemsFromLinks(links);
const filters = (patch: Partial<ToolCatalogueFilters> = {}): ToolCatalogueFilters => ({
  ...initialToolCatalogueFilters,
  ...patch,
});
const ids = (items: ToolCatalogueItem[]) => items.map(item => item.id);
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function completeCatalogue() {
  const rows = completeCatalogueRows();
  rows[0] = {
    ...rows[0],
    name: "Métricas Laguna",
    url: "https://catalogue.example.test/private-url-fragment",
    purpose: "Comparar conversión directa",
    project: "Dreamcatcher Marketing",
    category: "Analítica",
    provider: "Google Analytics",
    state: "activo",
    lifecycle: "operativo",
    priority: "P1 crítico",
    link_type: "panel",
    scope: "Hotel",
  };
  rows[242] = { ...rows[242], url: "" };
  const items = projectCompleteCatalogueRows(authorizedContext(), rows);
  expect(items).toHaveLength(244);
  return items;
}

describe("authorized tool presentation", () => {
  it("places and finds the reviewed Google Hotels profile in Mercadeo", () => {
    const profile: ToolLink = { id: "LINK-244", label: "🏨 Ver Google Hotels", url: "https://www.google.co.cr/travel/hotels/entity/CgsIpKWViNeV4ufCARAB" };
    const [item] = catalogueItemsFromLinks([profile]);
    expect(getToolPresentation(item)).toMatchObject({
      name: "Google Hotels", title: "Ver perfil del hotel", category: "Mercadeo",
    });
    const selection = selectToolCatalogue([item], filters({ query: "mercadeo" }));
    expect(ids(selection.filteredLinks)).toEqual(["LINK-244"]);
    expect(selection.groups).toEqual([{ project: "Accesos revisados", links: [item] }]);
    const html = renderToStaticMarkup(<PortalToolCatalogue items={[item]} idPrefix="google-hotels" />);
    expect(html).toContain('href="https://www.google.co.cr/travel/hotels/entity/CgsIpKWViNeV4ufCARAB"');
    expect(html).toContain("Ficha pública, reseñas y opciones de reserva");
  });

  it("renders a readable fallback for an authorized link without a registered brand", () => {
    const presentation = getToolPresentation(reviewed[4]);
    expect(presentation).toMatchObject({
      name: "Proveedor Ágil", title: "Proveedor Ágil", category: "Otros", detail: "Acceso externo", logo: null,
    });
    expect(presentation.Icon).toBeTruthy();
    const html = renderToStaticMarkup(<PortalToolCatalogue items={[reviewed[4]]} idPrefix="fallback" />);
    expect(html).toContain("Proveedor Ágil");
    expect(html).toContain("Acceso externo");
    expect(html).toContain('href="https://example.com/supplier"');
  });

  it("does not confuse an inherited object property with a registered brand", () => {
    const [inheritedId] = catalogueItemsFromLinks([{ id: "constructor", label: "Acceso técnico", url: "https://example.com/technical" }]);
    expect(getToolPresentation(inheritedId)).toMatchObject({
      name: "Acceso técnico", title: "Acceso técnico", category: "Otros", detail: "Acceso externo", logo: null,
    });
  });
});

describe("tool catalogue selection", () => {
  it("preserves distinct destinations of the same provider without mutating the input", () => {
    const original = reviewed.map(link => ({ ...link }));
    const selection = selectToolCatalogue(reviewed, filters());
    expect(selection.filteredLinks.filter(link => ["LINK-048", "PORTAL-POS"].includes(link.id)).map(link => link.id).sort())
      .toEqual(["LINK-048", "PORTAL-POS"]);
    expect(reviewed).toEqual(original);
  });

  it.each([
    ["recepcion agil", ["LINK-048"]],
    ["PROVEEDOR AGIL", ["TEST-SUPPLIER"]],
    ["consumos", ["PORTAL-POS"]],
    ["otros", ["TEST-SUPPLIER", "TEST-SUPPORT"]],
  ])("searches reviewed names, purpose and categories without case or accent barriers: %s", (query, expected) => {
    expect(ids(selectToolCatalogue(reviewed, filters({ query })).filteredLinks)).toEqual(expected);
  });

  it("searches the complete catalogue by safe metadata and combines project, category and state", () => {
    const complete = completeCatalogue();
    for (const query of ["metricas laguna", "conversion directa", "google analytics", "operativo", "p1 critico", "panel", "hotel"]) {
      expect(ids(selectToolCatalogue(complete, filters({ query })).filteredLinks)).toContain("LINK-001");
    }
    const selection = selectToolCatalogue(complete, filters({
      project: "Dreamcatcher Marketing", category: "Analítica", state: "activo",
    }));
    expect(ids(selection.filteredLinks)).toEqual(["LINK-001"]);
    expect(selection.groups).toEqual([{ project: "Dreamcatcher Marketing", links: [complete[0]] }]);
  });

  it("does not expose URL text as searchable catalogue metadata", () => {
    const complete = completeCatalogue();
    expect(selectToolCatalogue(complete, filters({ query: "private-url-fragment" })).filteredLinks).toEqual([]);
    expect(selectToolCatalogue(reviewed, filters({ query: "/point-of-sale" })).filteredLinks).toEqual([]);
  });

  it("returns batches of 48, grows one batch at a time and resets the batch on a filter", () => {
    const complete = completeCatalogue();
    const first = selectToolCatalogue(complete, filters());
    expect(first.visibleLinks).toHaveLength(TOOL_CATALOGUE_BATCH_SIZE);
    expect(first.filteredTotal).toBe(244);
    expect(first.hasMore).toBe(true);
    const more = toolCatalogueReducer(initialToolCatalogueFilters, { type: "more" });
    expect(selectToolCatalogue(complete, more).visibleLinks).toHaveLength(96);
    const narrowed = toolCatalogueReducer(more, { type: "project", value: "Dreamcatcher Marketing" });
    expect(narrowed.visibleCount).toBe(TOOL_CATALOGUE_BATCH_SIZE);
    let nearEnd = initialToolCatalogueFilters;
    for (let batch = 0; batch < 4; batch += 1) nearEnd = toolCatalogueReducer(nearEnd, { type: "more" });
    const finalFour = selectToolCatalogue(complete, nearEnd);
    expect(finalFour.visibleLinks).toHaveLength(240);
    expect(finalFour.filteredTotal - finalFour.visibleLinks.length).toBe(4);
    const completeState = toolCatalogueReducer(nearEnd, { type: "more" });
    expect(selectToolCatalogue(complete, completeState)).toMatchObject({ visibleLinks: expect.any(Array), hasMore: false });
    expect(selectToolCatalogue(complete, completeState).visibleLinks).toHaveLength(244);
    const html = renderToStaticMarkup(<PortalToolCatalogue items={complete} idPrefix="complete" mode="complete" />);
    expect(html.match(/\sdata-tool=/g)).toHaveLength(TOOL_CATALOGUE_BATCH_SIZE);
    expect(html).toContain("Mostrar 48 más");
  });

  it("recovers the catalogue after an empty result through reset", () => {
    const categoryState = toolCatalogueReducer(initialToolCatalogueFilters, { type: "category", value: "Otros" });
    const queryState = toolCatalogueReducer(categoryState, { type: "query", value: "unmatched synthetic term" });
    expect(selectToolCatalogue(reviewed, queryState).filteredLinks).toEqual([]);
    const reset = toolCatalogueReducer(queryState, { type: "reset" });
    expect(reset).toEqual(initialToolCatalogueFilters);
    expect(selectToolCatalogue(reviewed, reset).filteredLinks).toHaveLength(reviewed.length);
  });
});

describe("tool catalogue markup", () => {
  it("shows lifecycle so an archived reference cannot look current from its state alone", () => {
    const archived = completeCatalogue().find(item => item.id === "LINK-008");
    expect(archived).toMatchObject({ state: "registrado", lifecycle: "archivo/referencia" });
    const html = renderToStaticMarkup(<PortalToolCatalogue items={archived ? [archived] : []} idPrefix="archived" mode="complete" />);
    expect(html).toContain("archivo/referencia");
    expect(html).toContain("registrado");
  });

  it("renders empty destinations as pending cards instead of clickable controls", () => {
    const pending = completeCatalogue().find(item => item.id === "LINK-243");
    expect(pending?.url).toBeNull();
    const html = renderToStaticMarkup(<PortalToolCatalogue items={pending ? [pending] : []} idPrefix="pending" mode="complete" />);
    expect(html).toContain("Destino pendiente");
    expect(html).toContain('data-tool="LINK-243"');
    expect(html).not.toMatch(/<a\b/);
  });

  it("keeps unique accessible references and opens only HTTPS in a new tab", () => {
    const directoryBase: Omit<DirectoryCatalogueItem, "id" | "label" | "name" | "url"> = {
      kind: "directory", purpose: "Acceso autorizado", project: "Dreamcatcher", category: "Operación",
      provider: "Proveedor", state: "registrado", lifecycle: "activo", priority: "P2", linkType: "acceso", scope: "Hotel", homeEligible: false,
    };
    const items: ToolCatalogueItem[] = [
      { ...directoryBase, id: "LINK-901", label: "Web", name: "Web", url: "https://example.com/" },
      { ...directoryBase, id: "LINK-902", label: "Correo", name: "Correo", url: "mailto:hotel@example.test" },
      { ...directoryBase, id: "LINK-903", label: "Teléfono", name: "Teléfono", url: "tel:+50626401234" },
      { ...directoryBase, id: "LINK-904", label: "Pendiente", name: "Pendiente", url: null },
    ];
    const html = renderToStaticMarkup(<><PortalToolCatalogue items={items} idPrefix="primary" />
      <PortalToolCatalogue items={items} idPrefix="secondary" /></>);
    const renderedIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(renderedIds).size).toBe(renderedIds.length);
    const webAnchors = [...html.matchAll(/<a\b[^>]*href="https:\/\/example\.com\/"[^>]*>/g)].map(match => match[0]);
    expect(webAnchors).toHaveLength(2);
    for (const anchor of webAnchors) {
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
    for (const destination of ["mailto:hotel@example.test", "tel:+50626401234"]) {
      const anchors = [...html.matchAll(new RegExp(`<a\\b[^>]*href="${destination.replace("+", "\\+")}"[^>]*>`, "g"))];
      expect(anchors).toHaveLength(2);
      expect(anchors.every(match => !match[0].includes("target="))).toBe(true);
    }
    expect(html.match(/data-tool="LINK-904"/g)).toHaveLength(2);
  });

  it.each([
    ["complete", "Catálogo interno completo para tu rol."],
    ["reviewed", "Accesos revisados para tu rol."],
    ["fallback", "Cobertura parcial"],
  ] as const)("describes %s coverage without claiming an integration", (mode, message) => {
    const html = renderToStaticMarkup(<PortalToolCatalogue items={reviewed} idPrefix={mode} mode={mode} />);
    const text = normalize(html);
    expect(text).toContain(normalize(message));
    expect(text).toContain("sesion");
    expect(text).not.toMatch(/integracion activa|sincronizado|conexion verificada/);
  });
});

// I50-01: P0 priority remains first in the actual rendered project sequence.
it("orders critical work before routine and unknown priorities across project groups", () => {
  const base = completeCatalogue()[0];
  const items = [
    {...base, id:"LINK-901", name:"Critical", project:"Z project", priority:"P0 crítico"},
    {...base, id:"LINK-902", name:"Routine", project:"A project", priority:"P1 diario"},
    {...base, id:"LINK-903", name:"Unknown", project:"B project", priority:"P10 unknown"},
    {...base, id:"LINK-904", name:"Rare", project:"C project", priority:"P3 ocasional"},
  ];
  const selection = selectToolCatalogue(items, filters());
  expect(selection.filteredLinks.map(item => item.id)).toEqual(["LINK-901","LINK-902","LINK-904","LINK-903"]);
  expect(selection.groups.map(group => group.links[0].id)).toEqual(["LINK-901","LINK-902","LINK-904","LINK-903"]);
});

it("never moves routine work above another project's critical work when a project spans priority bands",()=>{
  const base=completeCatalogue()[0];
  const items=[
    {...base,id:"LINK-901",name:"Critical A",project:"A",priority:"P0 critical"},
    {...base,id:"LINK-902",name:"Critical B",project:"B",priority:"P0 critical"},
    {...base,id:"LINK-903",name:"Routine A",project:"A",priority:"P3 routine"},
  ];
  const selected=selectToolCatalogue(items,filters());
  expect(selected.groups.flatMap(group=>group.links.map(item=>item.id))).toEqual(["LINK-901","LINK-902","LINK-903"]);
  const html=renderToStaticMarkup(<PortalToolCatalogue items={items} idPrefix="mixed-priority"/>);
  expect(html.indexOf('data-tool="LINK-902"')).toBeLessThan(html.indexOf('data-tool="LINK-903"'));
});
