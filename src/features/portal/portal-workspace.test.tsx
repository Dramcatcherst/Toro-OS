// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
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

it("quick actions target their promised management sections", () => {
  const html = render();
  const cashTarget = html.match(/<button[^>]*aria-controls="([^"]+)"[^>]*>(?:(?!<\/button>)[\s\S])*Caja CRC \+ USD(?:(?!<\/button>)[\s\S])*<\/button>/)?.[1];
  const toolsTarget = html.match(/<button[^>]*aria-controls="([^"]+)"[^>]*>(?:(?!<\/button>)[\s\S])*Mensajes y utilidades(?:(?!<\/button>)[\s\S])*<\/button>/)?.[1];

  expect(cashTarget).toMatch(/management-cash$/);
  expect(toolsTarget).toMatch(/management-tools$/);
  expect(html).toContain(`id="${cashTarget}" tabindex="-1"`);
  expect(html).toContain(`id="${toolsTarget}" tabindex="-1"`);
});

it("focuses and scrolls the requested management destination after activation", async () => {
  const workspace = await import("./portal-workspace");
  const activate = (workspace as Record<string, unknown>).activateManagementDestination as
    | ((target: { focus: (options: FocusOptions) => void; scrollIntoView: (options: ScrollIntoViewOptions) => void }, schedule: (callback: () => void) => void) => void)
    | undefined;
  const calls: string[] = [];
  const target = {
    focus: (options: FocusOptions) => calls.push(`focus:${String(options.preventScroll)}`),
    scrollIntoView: (options: ScrollIntoViewOptions) => calls.push(`scroll:${options.block}:${options.behavior}`),
  };

  expect(activate).toBeTypeOf("function");
  activate!(target, callback => { calls.push("scheduled"); callback(); });
  expect(calls).toEqual(["scheduled", "focus:true", "scroll:start:auto"]);
});


it("opens the promised management destination without remounting its draft", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });

  try {
    await act(async () => {
      root.render(<PortalWorkspace
        modules={modules()}
        links={[{ id: "LINK-048", label: "Acceso revisado", url: "https://example.com/LINK-048" }]}
        catalogueItems={[{ kind: "reviewed", id: "LINK-048", label: "Acceso revisado", url: "https://example.com/LINK-048" }]}
        catalogueMode="reviewed"
        hotelAllowed
        attention={<p>Atención autorizada</p>}
      />);
    });

    const cashButton = [...container.querySelectorAll("button")].find(button => button.textContent?.includes("Caja CRC + USD"));
    const cashTarget = container.querySelector<HTMLElement>('[id$="-management-cash"]');
    const managementPanel = container.querySelector<HTMLElement>('[id$="-panel-manage"]');
    const draft = cashTarget?.querySelector<HTMLInputElement>("input");

    expect(cashButton).toBeDefined();
    expect(cashTarget).not.toBeNull();
    expect(managementPanel?.hidden).toBe(true);
    expect(draft).not.toBeNull();

    draft!.value = "7";
    const scrollIntoView = vi.fn();
    cashTarget!.scrollIntoView = scrollIntoView;

    await act(async () => {
      cashButton!.click();
    });

    expect(managementPanel?.hidden).toBe(false);
    expect(document.activeElement).toBe(cashTarget);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "auto" });
    expect(cashTarget?.querySelector("input")).toBe(draft);
    expect(draft?.value).toBe("7");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

it("handles the approved tab keyboard navigation on the mounted workspace", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(<PortalWorkspace
        modules={modules()}
        links={[]}
        catalogueItems={[]}
        catalogueMode="reviewed"
        hotelAllowed={false}
        attention={<p>Atención autorizada</p>}
      />);
    });

    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    tabs[0].focus();
    await act(async () => {
      tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    });

    expect(tabs[2].getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(tabs[2]);
    expect(container.querySelector<HTMLElement>('[id$="-panel-manage"]')?.hidden).toBe(false);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
