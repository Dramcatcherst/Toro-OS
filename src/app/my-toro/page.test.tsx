import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
import type { ToroRealMenuView } from "@/features/menu/server";

const mocks = vi.hoisted(() => ({
  menu: vi.fn(),
  directory: vi.fn(),
  organizationChoices: vi.fn(),
}));
vi.mock("@/features/menu/server", () => ({ resolveCurrentToroReadOnlyMenu: mocks.menu }));
vi.mock("@/features/tools/server", () => ({ loadHotelDirectory: mocks.directory }));
vi.mock("@/features/context/organization-selection", () => ({
  loadToroOrganizationChoices: mocks.organizationChoices,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import MyToroPage from "./page";

function view(): ToroRealMenuView {
  return { context: authorizedContext(), preferredDisplayName: "QA", menu: null,
    sourceReadiness: null, profileSummary: [], capabilityNotes: {}, capabilityAlternatives: {},
    focusableCapabilities: [], availableSubmenus: {}, focus: null, state: "resolved" };
}
const render = async (searchParams: { focus?: string; context?: string } = {}) =>
  renderToStaticMarkup(await MyToroPage({ searchParams: Promise.resolve(searchParams) }));
beforeEach(() => {
  vi.resetAllMocks();
  mocks.organizationChoices.mockResolvedValue({ state: "unavailable", choices: [] });
});
afterEach(() => vi.unstubAllEnvs());

it("keeps the account read surface without linking to blocked onboarding in hosted mode", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  try {
    mocks.menu.mockResolvedValue(view());
    const html = await render();
    expect(html).toContain('id="mi-cuenta"');
    expect(html).not.toContain('href="/onboarding"');
    expect(html).toContain("Mi cuenta y ayuda para entrar");
  } finally { vi.unstubAllEnvs(); }
});

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

it("offers retry and local logout when an identity lookup throws", async () => {
  mocks.menu.mockRejectedValue(new Error("PRIVATE_AUTH_DIAGNOSTIC"));
  const html = await render();
  expect(html).toContain("No pudimos verificar tu acceso ahora");
  expect(html).toContain('href="/my-toro"');
  expect(html).toContain('action="/api/auth/logout"');
  expect(html).not.toContain("PRIVATE_AUTH_DIAGNOSTIC");
  expect(mocks.directory).not.toHaveBeenCalled();
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

it("renders every authorized organization as an explicit accessible choice", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  const data = view();
  data.state = "context_choice_required";
  data.context.orgId = null;
  data.context.membership = null;
  data.context.requiresContextChoice = true;
  data.context.canUseOrganizationData = false;
  data.context.availableOrgIds = [
    "00000000-0000-4000-8000-0000000000aa",
    "00000000-0000-4000-8000-0000000000bb",
  ];
  mocks.menu.mockResolvedValue(data);
  mocks.organizationChoices.mockResolvedValue({
    state: "ready",
    choices: [
      { id: data.context.availableOrgIds[0], name: "Dreamcatcher Hotel & Villas" },
      { id: data.context.availableOrgIds[1], name: "Mauricio Fernández Toro — Personal" },
    ],
  });

  const html = await render();

  expect(html).toContain("Dreamcatcher Hotel &amp; Villas");
  expect(html).toContain("Mauricio Fernández Toro — Personal");
  expect(html).toContain('role="group" aria-label="Organizaciones disponibles"');
  expect(html).toContain("en qué contexto quieres entrar");
  expect(html.match(/action="\/api\/brain\/context\/selection"/g)).toHaveLength(2);
  expect(html.match(/method="post"/g)).toHaveLength(3);
  expect(html.match(/name="intent" value="select"/g)).toHaveLength(2);
  expect(html.match(/name="organizationId"/g)).toHaveLength(2);
  expect(html.match(/type="submit"/g)).toHaveLength(3);
  expect(html).toContain("volverá a validar tu membresía");
  expect(mocks.directory).not.toHaveBeenCalled();
});

it("shows a safe retry instead of a partial organization selector", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  const data = view();
  data.state = "context_choice_required";
  data.context.requiresContextChoice = true;
  data.context.availableOrgIds = ["org-1", "org-2"];
  mocks.menu.mockResolvedValue(data);

  const html = await render({ context: "invalid" });

  expect(html).toContain("No pude abrir ese contexto");
  expect(html).toContain("2 organizaciones autorizadas");
  expect(html).not.toContain('name="organizationId"');
  expect(html).toContain('action="/api/auth/logout"');
});

it("keeps context switching available after resolving a multi-organization account", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  const data = view();
  data.context.availableOrgIds = ["org-1", "org-2"];
  mocks.menu.mockResolvedValue(data);
  mocks.directory.mockResolvedValue({ state: "unavailable", links: [] });

  const html = await render();

  expect(html).toContain("Cambiar de contexto");
  expect(html).toContain('action="/api/brain/context/selection"');
  expect(html).toContain('name="intent" value="clear"');
});

it("does not expose the Portal selector to internal-runtime writers", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  const data = view();
  data.state = "context_choice_required";
  data.context.requiresContextChoice = true;
  data.context.availableOrgIds = ["org-1", "org-2"];
  mocks.menu.mockResolvedValue(data);

  const html = await render();

  expect(html).toContain("Organizaciones disponibles: <strong>2</strong>");
  expect(html).not.toContain("/api/brain/context/selection");
  expect(mocks.organizationChoices).not.toHaveBeenCalled();
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
  expect(html).toContain("Equipo · sesión propia");expect(html).toContain("cada servicio conserva su sesión");
  expect(html).toContain('href="/my-toro/herramientas#guide-catalogue-heading"');
  expect(mocks.directory).toHaveBeenCalledExactlyOnceWith({includeApprovedNavigation:true,expectedContext:expect.objectContaining({userId:expect.any(String),orgId:expect.any(String)})});
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

it("offers the complete reviewed catalogue without treating email as an access grant", async () => {
  mocks.menu.mockResolvedValue(view());
  mocks.directory.mockResolvedValue({state:"unavailable",navigationAuthorized:true,links:[
    {id:"PORTAL-ALEGRA",label:"Alegra",url:"https://app.alegra.com/"},
  ]});
  const html=await render();
  expect(html.includes('href="https://app.alegra.com/"')).toBe(true);
  expect(html.includes("Directorio parcial")).toBe(true);
  expect(html.includes('href="/my-toro/herramientas#guide-catalogue-heading"')).toBe(true);
});
