import type { ComponentProps, ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ToroResolvedMenu } from "./types";

const harness = vi.hoisted(() => ({
  states: [] as unknown[],
  cursor: 0,
  push: vi.fn(),
}));

// The existing Vitest environment is Node. Retain hook state between renders
// so sequences exercise the component's real handlers and intent resolver.
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState: (initial: unknown) => {
    const index = harness.cursor++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [harness.states[index], (next: unknown) => {
      harness.states[index] = typeof next === "function"
        ? next(harness.states[index]) : next;
    }];
  },
  useMemo: (compute: () => unknown) => compute(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: harness.push }) }));

import { MyToroCommandBar } from "./my-toro-command-bar";

function menu(keys: string[]): ToroResolvedMenu {
  return {
    profileId: "synthetic", selectionReason: "test", hiddenCapabilityCount: 0,
    items: keys.map((key, index) => ({
      index: index + 1, key, label: key, emoji: "", aliases: [],
      capability: key, state: "READ_ONLY",
    })),
  };
}

function fixture(): ComponentProps<typeof MyToroCommandBar> {
  return {
    menu: menu(["consulta alfa", "consulta beta", "proyectos", "decisiones", "grupo", "pendiente"]),
    focusableCapabilities: ["proyectos", "decisiones"],
    availableSubmenus: { grupo: menu(["consulta alfa", "proyectos"]) },
    capabilityAlternatives: {
      "consulta alfa": { href: "https://alpha.example.invalid/", label: "Alternativa A", note: "Nota A", external: true },
      "consulta beta": { href: "https://beta.example.invalid/", label: "Alternativa B", note: "Nota B", external: true },
    },
  };
}

type Element = ReactElement<Record<string, unknown>>;
function elements(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children as ReactNode)];
}

function mount(props = fixture()) {
  function render() {
    harness.cursor = 0;
    return MyToroCommandBar(props);
  }
  let tree = render();
  function find(type: string, match: (element: Element) => boolean = () => true) {
    const element = elements(tree).find(element => element.type === type && match(element));
    if (!element) throw new Error(`Missing ${type}`);
    return element;
  }
  return {
    html: () => renderToStaticMarkup(tree),
    submit(value: string) {
      const input = find("input");
      (input.props.onChange as (event: unknown) => void)({ target: { value } });
      tree = render();
      (find("form").props.onSubmit as (event: unknown) => void)({ preventDefault: vi.fn() });
      tree = render();
    },
    click(label: string) {
      const button = find("button", element => renderToStaticMarkup(element).includes(label));
      (button.props.onClick as () => void)();
      tree = render();
    },
  };
}

function expectAlternativeA(view: ReturnType<typeof mount>) {
  expect(view.html()).toContain('href="https://alpha.example.invalid/" target="_blank" rel="noreferrer"');
  expect(view.html()).toContain("Alternativa A");
  expect(view.html()).toContain("Nota A");
  expect(harness.push).not.toHaveBeenCalled();
}

function expectNoAlternative(view: ReturnType<typeof mount>) {
  expect(view.html()).not.toContain("<a ");
  expect(view.html()).not.toContain("Nota A");
  expect(view.html()).not.toContain("Nota B");
}

beforeEach(() => {
  harness.states = [];
  harness.cursor = 0;
  harness.push.mockReset();
});

describe("MyToroCommandBar alternative sequences", () => {
  it.each([
    ["desconocida", "No quiero adivinar mal."],
    ["consulta alfa y consulta beta", "No quiero adivinar mal."],
    ["ayuda", "Puedes responder con un número"],
    ["más", "Te mostraré opciones secundarias"],
  ])("clears A after %s and can show B next", (query, feedback) => {
    const view = mount();
    expectNoAlternative(view);
    view.submit("consulta alfa");
    expectAlternativeA(view);
    view.submit(query);
    expect(view.html()).toContain(feedback);
    expectNoAlternative(view);
    view.submit("consulta beta");
    expect(view.html()).toContain('href="https://beta.example.invalid/"');
    expect(view.html()).toContain("Alternativa B");
    expect(view.html()).not.toContain("Nota A");
    expect(harness.push).not.toHaveBeenCalled();
  });

  it("replaces A with B on consecutive alternative requests", () => {
    const view = mount();
    view.submit("consulta alfa");
    expectAlternativeA(view);
    view.submit("consulta beta");
    expect(view.html()).toContain('href="https://beta.example.invalid/"');
    expect(view.html()).toContain("Nota B");
    expect(view.html()).not.toContain("Alternativa A");
    expect(view.html()).not.toContain("Nota A");
  });

  it.each(["inicio", "atrás", "proyectos"])("clears A on %s navigation and later feedback", query => {
    const view = mount();
    view.submit("consulta alfa");
    expectAlternativeA(view);
    view.submit(query);
    expect(harness.push).toHaveBeenCalledExactlyOnceWith(
      query === "proyectos" ? "/my-toro?focus=proyectos" : "/my-toro",
    );
    expectNoAlternative(view);
    view.submit("ayuda");
    expectNoAlternative(view);
  });

  it("clears A when entering and returning from a submenu", () => {
    const view = mount();
    view.submit("consulta alfa");
    expectAlternativeA(view);
    view.submit("grupo");
    expectNoAlternative(view);
    view.submit("1");
    expectAlternativeA(view);
    view.click("Atrás");
    expectNoAlternative(view);
    view.submit("ayuda");
    expectNoAlternative(view);
    expect(harness.push).not.toHaveBeenCalled();
  });

  it.each([true, false])("clears A when continuing with another focus available: %s", hasNext => {
    const props = fixture();
    props.currentFocus = "proyectos";
    if (!hasNext) props.focusableCapabilities = ["proyectos"];
    const view = mount(props);
    view.click("consulta alfa");
    expectAlternativeA(view);
    view.submit("continuar");
    expectNoAlternative(view);
    if (hasNext) expect(harness.push).toHaveBeenCalledExactlyOnceWith("/my-toro?focus=decisiones");
    else {
      expect(view.html()).toContain("No hay otra lectura disponible ahora.");
      expect(harness.push).not.toHaveBeenCalled();
    }
    view.submit("ayuda");
    expectNoAlternative(view);
  });

  it("clears A for an unavailable option and preserves it for an empty submission", () => {
    const view = mount();
    view.submit("consulta alfa");
    expectAlternativeA(view);
    view.submit("   ");
    expectAlternativeA(view);
    view.submit("pendiente");
    expect(view.html()).toContain("todavía no está disponible.");
    expectNoAlternative(view);
  });
});
