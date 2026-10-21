import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { portalDomains, type PortalModule } from "./model";
import { nextPortalTabIndex, PortalWorkspace } from "./portal-workspace";

function modules(): PortalModule[] {
  return portalDomains.map(domain => ({
    ordinal: domain.ordinal,
    label: domain.label,
    description: domain.description,
    status: domain.ordinal % 2 === 0 ? "Disponible" : "En preparación",
    note: `Cobertura ${domain.ordinal}`,
    href: domain.ordinal % 2 === 0 ? `/module/${domain.ordinal}` : null,
    action: domain.ordinal % 2 === 0 ? `Abrir ${domain.ordinal}` : null,
  }));
}

function render(options: { hotelAllowed?: boolean; inputModules?: PortalModule[]; linkId?: string } = {}) {
  const linkId = options.linkId ?? "LINK-048";
  return renderToStaticMarkup(<PortalWorkspace
    modules={options.inputModules ?? modules()}
    links={[{ id: linkId, label: "Acceso revisado", url: `https://example.com/${linkId}` }]}
    catalogueItems={[{ kind: "reviewed", id: linkId, label: "Acceso revisado", url: `https://example.com/${linkId}` }]}
    catalogueMode="reviewed"
    hotelAllowed={options.hotelAllowed ?? true}
    attention={<p>Atención autorizada</p>}
  />);
}

it("renders exactly the three approved workspace tabs and one active panel", () => {
  const html = render();
  const tabs = [...html.matchAll(/role="tab"[^>]*>([\s\S]*?)<\/button>/g)].map(match => match[1].replace(/<[^>]+>/g, ""));

  expect(tabs).toEqual(["Hoy", "Agenda", "Gestión"]);
  expect(html.match(/role="tabpanel"/g)).toHaveLength(3);
  expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
  expect(html).toContain("Vista Hoy");
});

it("supports the approved keyboard sequence including wrapping", () => {
  expect(nextPortalTabIndex("ArrowRight", 0, 3)).toBe(1);
  expect(nextPortalTabIndex("ArrowRight", 2, 3)).toBe(0);
  expect(nextPortalTabIndex("ArrowLeft", 0, 3)).toBe(2);
  expect(nextPortalTabIndex("Home", 2, 3)).toBe(0);
  expect(nextPortalTabIndex("End", 0, 3)).toBe(2);
  expect(nextPortalTabIndex("Escape", 1, 3)).toBeNull();
});

it("source_unavailable_is_not_zero", () => {
  const html = render();
  expect(html).toContain("Agenda integrada no disponible en este contexto");
  expect(html).not.toMatch(/0 (?:eventos|citas|pendientes)/i);
});

it("renders the six canonical families and every supplied module exactly once", () => {
  const html = render();
  for (const label of ["Clientes y ventas", "Operación y recursos", "Equipo", "Dinero y cumplimiento", "Contenido y crecimiento", "Proyectos"]) {
    expect(html).toContain(label);
  }
  for (let ordinal = 0; ordinal <= 11; ordinal += 1) {
    const token = `MÓDULO ${String(ordinal).padStart(2, "0")}`;
    expect(html.split(token)).toHaveLength(2);
  }
  expect(html).toContain("Mapa");
  expect(html).toContain("Sistemas");
});

it("preserves cash, favorites, templates, catalogue and fixture destinations", () => {
  const html = render();
  expect(html).toContain("Caja CRC + USD");
  expect(html).toContain("Favoritos");
  expect(html).toContain("Respuestas listas para adaptar");
  expect(html).toContain("Catálogo de herramientas");
  expect(html).toContain("https://example.com/LINK-048");
  expect(html).toContain("/brain");
});

it("restricted_context_hides_hotel_data", () => {
  const html = render({ hotelAllowed: false });
  expect(html).not.toContain("https://example.com/LINK-048");
  expect(html).not.toContain("Google Home");
  expect(html).toContain("Los accesos del hotel no corresponden al contexto de esta cuenta");
});

it("future_module_is_not_dropped", () => {
  const future: PortalModule = { ordinal: 99, label: "Futuro", description: "Sin inferencias", status: "En preparación", note: "Sin capacidad inventada", href: null, action: null };
  const html = render({ inputModules: [...modules(), future] });
  expect(html).toContain("MÓDULO 99");
  expect(html).toContain("Otros módulos");
  expect(html.split("MÓDULO 99")).toHaveLength(2);
});

it("context_change_clears_state while a fresh mount uses only its supplied scope", () => {
  const first = render({ linkId: "LINK-048" });
  const second = render({ linkId: "LINK-086" });
  expect(first).toContain("LINK-048");
  expect(second).not.toContain("LINK-048");
  expect(second).toContain("LINK-086");
});

it("same_scope_preserves_draft by keeping inactive form panels mounted", () => {
  const html = render();
  const managementPanel = html.match(/<div role="tabpanel"[^>]*-panel-manage[^>]*>[\s\S]*<\/div>$/)?.[0] ?? "";
  expect(managementPanel).toContain("hidden");
  expect(managementPanel).toContain('aria-label="Cantidad de billetes CRC');
  expect(managementPanel).toContain('id="management-draft"');
});
