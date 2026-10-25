import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { activatePortalDestination, PortalWorkspace } from "./portal-workspace";

function render(hotelAllowed = true) {
  return renderToStaticMarkup(<PortalWorkspace modules={[]} links={[]} catalogueItems={[]}
    catalogueMode="reviewed" hotelAllowed={hotelAllowed} attention={null} />);
}

function controlTarget(html: string, label: string) {
  const button = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
    .find(match => match[2].replace(/<[^>]+>/g, "").includes(label));
  return button?.[1].match(/aria-controls="([^"]+)"/)?.[1];
}

function panelMarkup(html: string, tab: string) {
  return [...html.matchAll(/<div role="tabpanel"[\s\S]*?(?=<div role="tabpanel"|$)/g)]
    .find(match => match[0].split(">", 1)[0].includes(`-panel-${tab}"`))?.[0] ?? "";
}

describe("Portal quick destinations", () => {
  it("points cash and messages at distinct named sections in their existing tabs", () => {
    const html = render();
    const cash = controlTarget(html, "Caja CRC + USD");
    const messages = controlTarget(html, "Mensajes y utilidades");

    expect(cash).toMatch(/-quick-cash$/);
    expect(messages).toMatch(/-quick-messages$/);
    expect(cash).not.toBe(messages);
    expect(panelMarkup(html, "money")).toContain(`id="${cash}" tabindex="-1"`);
    expect(panelMarkup(html, "tools")).toContain(`id="${messages}" tabindex="-1"`);
    expect(panelMarkup(html, "money")).toContain('aria-label="Conteo manual CRC y USD"');
    expect(panelMarkup(html, "tools")).toContain('aria-label="Mensajes y utilidades"');
  });

  it("keeps the actual cash and message forms mounted inside inactive panels", () => {
    const html = render();
    const money = panelMarkup(html, "money");
    const tools = panelMarkup(html, "tools");

    expect(money).toMatch(/^<div[^>]*\bhidden=""/);
    expect(tools).toMatch(/^<div[^>]*\bhidden=""/);
    expect(money).toContain('aria-label="Monto esperado CRC"');
    expect(money).toContain('aria-label="Monto esperado USD"');
    expect(tools).toContain('id="tools-draft"');
    expect(html.match(/id="tools-draft"/g)).toHaveLength(1);
  });

  it("keeps restricted contexts on the existing unavailable-tools panel", () => {
    const html = render(false);

    expect(html).not.toContain('id="tools-draft"');
    expect(html).not.toContain('-quick-messages"');
    expect(controlTarget(html, "Mensajes y utilidades")).toMatch(/-panel-tools$/);
    expect(panelMarkup(html, "tools")).toContain("Los accesos del hotel no corresponden al contexto de esta cuenta");
  });

  it("defers focus until activation and scrolls without animation", () => {
    const calls: unknown[] = [];
    const pending: Array<() => void> = [];
    const target = {
      focus: (options: FocusOptions) => calls.push(["focus", options]),
      scrollIntoView: (options: ScrollIntoViewOptions) => calls.push(["scroll", options]),
    };

    activatePortalDestination(target, callback => { pending.push(callback); });
    expect(calls).toEqual([]);
    expect(pending).toHaveLength(1);
    pending[0]();
    expect(calls).toEqual([
      ["focus", { preventScroll: true }],
      ["scroll", { block: "start", behavior: "instant" }],
    ]);
  });

  it("does not schedule a destination that is absent from this context", () => {
    const pending: Array<() => void> = [];
    activatePortalDestination(null, callback => { pending.push(callback); });
    expect(pending).toEqual([]);
  });
});
