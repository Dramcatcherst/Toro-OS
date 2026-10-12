import { beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";

const mocks = vi.hoisted(() => ({ projection: vi.fn(), context: vi.fn(), publicDemo: vi.fn() }));
vi.mock("@/lib/server/brain-projection", () => ({ loadBrainProjectionView: mocks.projection }));
vi.mock("@/features/brain/presentation", () => ({ toBrainClientView: () => ({ mode: "demo" }) }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: mocks.context }));
vi.mock("@/lib/server/public-demo", () => ({ isPublicDemo: mocks.publicDemo }));
vi.mock("./brain-explorer", () => ({ BrainExplorer: () => <main>Demostración · Sin acciones externas</main> }));
import BrainPage from "./page";

beforeEach(() => vi.resetAllMocks());
it("never resolves private Portal navigation in a public demonstration", async () => {
  mocks.publicDemo.mockReturnValue(true);
  const html = renderToStaticMarkup(await BrainPage());
  expect(mocks.context).not.toHaveBeenCalled();
  expect(html).not.toContain('aria-label="Portal TORO"');
});
it.each(["anonymous", "revoked", "choice", "transport_failure"])("does not expose private navigation for %s", async reason => {
  const context = authorizedContext();
  if (reason === "revoked") context.membership!.status = "suspended";
  if (reason === "choice") context.requiresContextChoice = true;
  if (reason === "transport_failure") mocks.context.mockRejectedValue(new Error("private sentinel"));
  else mocks.context.mockResolvedValue(reason === "anonymous" ? null : context);
  const html = renderToStaticMarkup(await BrainPage());
  expect(html).not.toContain('aria-label="Portal TORO"');
  expect(html).not.toContain("private sentinel");
});
it("keeps Mi TORO reachable from the authenticated Brain even when sources fall back to demo", async () => {
  mocks.context.mockResolvedValue(authorizedContext());
  const html = renderToStaticMarkup(await BrainPage());
  expect(html).toContain('aria-label="Portal TORO"');
  expect(html).toContain('href="/my-toro"');
  expect(html).toContain("Demostración");
});
