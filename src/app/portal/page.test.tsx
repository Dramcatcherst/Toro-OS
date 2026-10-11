import { beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
import type { ToroRealMenuView } from "@/features/menu/server";

const mocks = vi.hoisted(() => ({ menu: vi.fn(), publicDemo: vi.fn(), redirect: vi.fn() }));
vi.mock("@/features/menu/server", () => ({ resolveCurrentToroReadOnlyMenu: mocks.menu }));
vi.mock("@/lib/server/public-demo", () => ({ isPublicDemo: mocks.publicDemo }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import PortalPage from "./page";

function view(): ToroRealMenuView {
  return { context: authorizedContext(), preferredDisplayName: "QA", menu: null,
    sourceReadiness: null, profileSummary: [], capabilityNotes: {}, capabilityAlternatives: {},
    focusableCapabilities: [], availableSubmenus: {}, focus: null, state: "resolved" };
}
beforeEach(() => vi.resetAllMocks());
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
});
it.each(["choice", "inactive"])("hides modules for %s context", async reason => {
  const data = view();
  if (reason === "choice") data.state = "context_choice_required";
  else data.context.membership!.status = "offboarded";
  mocks.menu.mockResolvedValue(data);
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).not.toContain("MÓDULO 00");
  expect(html).not.toContain('aria-label="Portal TORO"');
});
it("presents the canonical structure without rendering fabricated links for pending modules", async () => {
  mocks.menu.mockResolvedValue(view());
  const html = renderToStaticMarkup(await PortalPage());
  expect(html).toContain("Mi TORO es tu espacio personal dentro de este mismo Portal");
  expect(html).toContain('aria-current="page"');
  expect(html.match(/MÓDULO \d\d/g)).toHaveLength(12);
  expect(html).toContain("MÓDULO 11");
  expect(html).not.toContain("focus=finance");
  expect(html).not.toContain("<button");
  expect(html).not.toContain("Santa Toro");
});
