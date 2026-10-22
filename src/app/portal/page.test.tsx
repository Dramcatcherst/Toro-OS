import { beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogueItemsFromLinks, projectCompleteCatalogueRows, type ToolLink } from "@/features/tools/directory";
import { authorizedContext, completeCatalogueRows } from "@/features/tools/fixtures.test-utils";
import type { ToroRealMenuView } from "@/features/menu/server";

const mocks = vi.hoisted(() => ({ menu: vi.fn(), directory: vi.fn(), publicDemo: vi.fn(), redirect: vi.fn(), attentionEnabled: vi.fn(), attention: vi.fn() }));
vi.mock("@/features/menu/server", () => ({ resolveCurrentToroReadOnlyMenu: mocks.menu }));
vi.mock("@/features/tools/server", () => ({ loadHotelDirectory: mocks.directory }));
vi.mock("@/features/attention/owner-attention-server", () => ({ ownerAttentionReadEnabled: mocks.attentionEnabled, loadOwnerAttentionProjection: mocks.attention }));
vi.mock("@/lib/server/public-demo", () => ({ isPublicDemo: mocks.publicDemo }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import PortalPage from "./page";

function view(): ToroRealMenuView {
  return { context: authorizedContext(), preferredDisplayName: "QA", menu: null,
    sourceReadiness: null, profileSummary: [], capabilityNotes: {}, capabilityAlternatives: {},
    focusableCapabilities: [], availableSubmenus: {}, focus: null, state: "resolved" };
}
function reviewedDirectory(links: ToolLink[]) {
  return { state: "ready", links, catalogueItems: catalogueItemsFromLinks(links), catalogueMode: "reviewed" } as const;
}
beforeEach(() => { vi.resetAllMocks(); mocks.attentionEnabled.mockReturnValue(false); });
it("keeps the public demo from resolving any private navigation", async () => {
  mocks.publicDemo.mockReturnValue(true);
  mocks.redirect.mockImplementation(() => { throw new Error("redirect:/brain"); });
  await expect(PortalPage()).rejects.toThrow("redirect:/brain");
  expect(mocks.menu).not.toHaveBeenCalled();
});
it("shows login without private navigation to anonymous visitors", async () => {
  mocks.menu.mockResolvedValue(null);
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).toContain("/login?next=/portal");
  expect(html).not.toContain('aria-label="Portal TORO"');
  expect(html).not.toContain("Dreamcatcher");
  expect(mocks.directory).not.toHaveBeenCalled();
});

it("recovers safely from a thrown identity lookup without querying private tools", async () => {
  mocks.menu.mockRejectedValue(new Error("PRIVATE_AUTH_DIAGNOSTIC"));
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).toContain("No pudimos verificar tu acceso ahora");
  expect(html).toContain('href="/portal"');
  expect(html).toContain('action="/api/auth/logout"');
  expect(html).not.toContain("PRIVATE_AUTH_DIAGNOSTIC");
  expect(mocks.directory).not.toHaveBeenCalled();
});

it.each(["denied", "unavailable"])("does not expose supplied directory rows when %s", async state => {
  mocks.menu.mockResolvedValue(view());
  const links = [{ id: "LINK-086", label: "Private", url: "https://private.example/" }];
  mocks.directory.mockResolvedValue({ state, links, catalogueItems: catalogueItemsFromLinks(links),
    catalogueMode: state === "denied" ? "reviewed" : "fallback" });
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).not.toContain("https://private.example/");
  expect(html).toContain("La lista completa no está disponible ahora");
});

it("keeps the hotel tools out of another authorized organization", async () => {
  const data = view(); data.context.orgId = "another-org"; data.context.membership!.orgId = "another-org";
  mocks.menu.mockResolvedValue(data);
  const html = renderToStaticMarkup(await PortalPage());
  expect(mocks.directory).not.toHaveBeenCalled();
  expect(html).not.toContain('aria-label="Herramientas del hotel"');
  expect(html).not.toContain("/my-toro/herramientas#equipo");
});

it("incorporates reviewed tools into the same Portal without nested controls", async () => {
  mocks.menu.mockResolvedValue(view());
  const links = [{ id: "LINK-086", label: "Team", url: "https://dream-team-public.vercel.app/dreamteam/ingresar" }];
  mocks.directory.mockResolvedValue(reviewedDirectory(links));
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).toContain('aria-label="Herramientas del hotel"');
  expect(html).toContain("Mi espacio");
  expect(html).toContain("Equipo · sesión propia");
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).not.toMatch(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a[\s>]/);
  expect(mocks.directory).toHaveBeenCalledExactlyOnceWith({includeApprovedNavigation:true,includeCompleteCatalogue:true});
});
it.each(["choice", "inactive"])("hides modules for %s context", async reason => {
  const data = view();
  if (reason === "choice") data.state = "context_choice_required";
  else data.context.membership!.status = "offboarded";
  mocks.menu.mockResolvedValue(data);
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).not.toContain("MÓDULO 00");
  expect(html).not.toContain('aria-label="Portal TORO"');
  expect(html).toContain('action="/api/auth/logout"');
});
it("presents the canonical structure without rendering fabricated links for pending modules", async () => {
  mocks.menu.mockResolvedValue(view());
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).toContain("Mi TORO es tu espacio personal dentro de este mismo Portal");
  expect(html).toContain('aria-current="page"');
  expect(new Set(html.match(/MÓDULO \d\d/g)).size).toBe(12);
  expect(html).toContain("MÓDULO 11");
  expect(html).not.toContain("focus=finance");
  expect(html).toContain('role="tablist"');
  expect(html).not.toContain("Santa Toro");
});

it("does not read priorities when disabled or expose them to an auditor", async () => {
  mocks.menu.mockResolvedValue(view());
  await PortalPage();
  expect(mocks.attention).not.toHaveBeenCalled();
  mocks.attentionEnabled.mockReturnValue(true);
  const data = view(); data.context.membership!.roles = ["AUDITOR"];
  mocks.menu.mockResolvedValue(data);
  const html = renderToStaticMarkup(await PortalPage());
  expect(mocks.attention).not.toHaveBeenCalled();
  expect(html).not.toContain('id="portal-pending-heading"');
});

it("sanitizes priority read failures instead of presenting zero pending tasks", async () => {
  mocks.menu.mockResolvedValue(view());
  mocks.attentionEnabled.mockReturnValue(true);
  mocks.attention.mockRejectedValue(new Error("private diagnostic"));
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).toContain("No se pudieron comprobar las prioridades");
  expect(html).not.toContain("private diagnostic");
  expect(html).not.toContain("0 pendientes");
});

it("names favorite and catalog references separately", async () => {
  mocks.menu.mockResolvedValue(view());
  const links = [{ id: "LINK-086", label: "Team", url: "https://dream-team-public.vercel.app/dreamteam/ingresar" }];
  mocks.directory.mockResolvedValue(reviewedDirectory(links));
  const html = renderToStaticMarkup(await PortalPage());
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  expect(new Set(ids).size).toBe(ids.length);
  expect(html).toContain('aria-labelledby="favorite-LINK-086"');
  expect(html).toMatch(/aria-labelledby="catalog-[^"]*LINK-086"/);
});

it("keeps the complete catalogue out of favorites and operational panels", async () => {
  mocks.menu.mockResolvedValue(view());
  const links = [{ id: "LINK-086", label: "Team", url: "https://dream-team-public.vercel.app/dreamteam/ingresar" }];
  const catalogueItems = projectCompleteCatalogueRows(authorizedContext(), completeCatalogueRows());
  expect(catalogueItems).toHaveLength(244);
  mocks.directory.mockResolvedValue({ state: "ready", links, catalogueItems, catalogueMode: "complete" });
  const html = renderToStaticMarkup(await PortalPage());
  const favorites = html.match(/<section[^>]*aria-labelledby="portal-favorites-heading"[\s\S]*?<\/section>/)?.[0] ?? "";
  expect(html).toContain("244 fichas visibles");
  expect(html.match(/data-tool="LINK-001"/g)).toHaveLength(1);
  expect(favorites).toContain('data-tool="LINK-086"');
  expect(favorites).not.toContain("LINK-001");
});
