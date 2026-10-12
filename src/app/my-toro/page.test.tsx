import { beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
import type { ToroRealMenuView } from "@/features/menu/server";

const mocks = vi.hoisted(() => ({ menu: vi.fn(), directory: vi.fn() }));
vi.mock("@/features/menu/server", () => ({ resolveCurrentToroReadOnlyMenu: mocks.menu }));
vi.mock("@/features/tools/server", () => ({ loadHotelDirectory: mocks.directory }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import MyToroPage from "./page";

function view(): ToroRealMenuView {
  return { context: authorizedContext(), preferredDisplayName: "QA", menu: null,
    sourceReadiness: null, profileSummary: [], capabilityNotes: {}, capabilityAlternatives: {},
    focusableCapabilities: [], availableSubmenus: {}, focus: null, state: "resolved" };
}
const render = async () => renderToStaticMarkup(await MyToroPage({ searchParams: Promise.resolve({}) }));
beforeEach(() => vi.resetAllMocks());

it("renders permitted evidence with partial coverage and a local menu return, without original-document links", async () => {
  const data = view();
  data.focus = { capability: "projects.status", label: "Proyectos", coverage: "Cobertura parcial; total desconocido",
    items: [{ title: "Synthetic", evidence: { source: "operations.projects", reportedSource: "No informada",
      observedAt: "2026-08-01T00:00:00Z", readAt: "2026-10-12T02:00:00Z" } }] };
  mocks.menu.mockResolvedValue(data); mocks.directory.mockResolvedValue({ state: "unavailable", links: [] });
  const html = await render();
  expect(html).toContain("Evidencia permitida"); expect(html).toContain("total desconocido");
  expect(html).toContain('href="/my-toro#available-heading"');
  expect(html).toContain("no certifica su vigencia ni abre documentos originales");
});

it("does not query or expose the hotel directory without a session", async () => {
  mocks.menu.mockResolvedValue(null);
  const html = await render();
  expect(mocks.directory).not.toHaveBeenCalled();
  expect(html).toContain("/login?next=/my-toro");
  expect(html).not.toContain("Herramientas del hotel");
});

it.each(["other_org", "inactive", "context_choice"])("does not load hotel links for %s", async reason => {
  const data = view();
  if (reason === "other_org") data.context.orgId = "another-org";
  if (reason === "inactive") data.context.membership!.status = "suspended";
  if (reason === "context_choice") data.state = "context_choice_required";
  mocks.menu.mockResolvedValue(data);
  expect(await render()).not.toContain("Equipo y herramientas");
  expect(mocks.directory).not.toHaveBeenCalled();
});

it.each(["denied", "unavailable"])("does not render supplied links when the directory is %s", async state => {
  mocks.menu.mockResolvedValue(view());
  mocks.directory.mockResolvedValue({ state, links: [{ id: "LINK-002", label: "Quote", url: "https://private.example/" }] });
  const html = await render();
  expect(html).not.toContain("private.example");
  expect(html).toContain('role="status"');
  expect(html).not.toContain('href="/login');
});

it("exposes a reviewed destination directly and groups unavailable actions without fake buttons", async () => {
  const data = view();
  data.menu = { profileId: "manager", selectionReason: "test", hiddenCapabilityCount: 0,
    items: [{ index: 1, key: "payment", label: "Cobrar QA", emoji: "", aliases: [], capability: "payment", state: "BLOCKED" }] };
  mocks.menu.mockResolvedValue(data);
  mocks.directory.mockResolvedValue({ state: "ready", links: [{ id: "LINK-002", label: "Cotizar estancia", url: "https://dreamcatcherhotel.kross.travel/" }] });
  const html = await render();
  expect(html).toContain('href="https://dreamcatcherhotel.kross.travel/" target="_blank" rel="noopener noreferrer"');
  expect(html).toContain("Cobrar QA · pendiente");
  expect(html).not.toContain("focus=payment");
  expect(html).not.toContain('href="#available-heading"');
  expect(html).not.toContain("Pregúntale a TORO");
});

it("keeps available consultations and safe alternatives as separate anchors", async () => {
  const data = view();
  data.menu = { profileId: "manager", selectionReason: "test", hiddenCapabilityCount: 0,
    items: [{ index: 1, key: "projects", label: "Proyectos", emoji: "", aliases: [], capability: "projects", state: "READ_ONLY" }] };
  data.focusableCapabilities = ["projects"];
  data.capabilityAlternatives = { projects: { href: "/safe-alternative", label: "Alternative", note: "test", external: false } };
  mocks.menu.mockResolvedValue(data);
  mocks.directory.mockResolvedValue({ state: "ready", links: [] });
  const html = await render();
  expect(html).toContain('href="/my-toro?focus=projects"');
  expect(html).not.toMatch(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/);
  expect(html).toContain('aria-label="Buscar una opción de TORO"');
});

it("keeps DreamTeam as reviewed navigation inside the compact Portal without claiming shared login", async () => {
  mocks.menu.mockResolvedValue(view());
  mocks.directory.mockResolvedValue({state:"ready",links:[{id:"LINK-086",label:"Ver equipo",url:"https://dream-team-public.vercel.app/dreamteam/ingresar"}]});
  const html=await render();expect(html).toContain("DreamTeam · TORO People");
  expect(html).toContain("Equipo · sesión propia");expect(html).toContain("Cada una puede pedir su propia sesión");
  expect(html).toContain('aria-label="Accesos y cuenta"');expect(html).toContain('href="#owner-attention-heading"');
});

it("keeps a usable submenu reachable even when its parent has no direct consultation", async () => {
  const data = view();
  data.menu = { profileId: "manager", selectionReason: "test", hiddenCapabilityCount: 0,
    items: [{ index: 1, key: "money", label: "Dinero QA", emoji: "", aliases: [], capability: "finance", state: "BLOCKED" }] };
  data.availableSubmenus = { money: { profileId: "finance", selectionReason: "test", hiddenCapabilityCount: 0,
    items: [{ index: 1, key: "report", label: "Informe QA", emoji: "", aliases: [], capability: "finance.report", state: "READ_ONLY" }] } };
  mocks.menu.mockResolvedValue(data);
  mocks.directory.mockResolvedValue({ state: "unavailable", links: [] });
  const html = await render();
  expect(html).toContain('aria-label="Buscar una opción de TORO"');
  expect(html).toContain("Dinero QA</span>");
  expect(html).not.toContain("Dinero QA · pendiente");
});
