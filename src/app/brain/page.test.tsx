import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";

const mocks = vi.hoisted(() => ({ projection: vi.fn(), context: vi.fn() }));
vi.mock("@/lib/server/brain-projection", () => ({ loadBrainProjectionView: mocks.projection }));
vi.mock("@/features/context/resolver", () => ({ resolveToroContext: mocks.context }));
vi.mock("@/features/brain/presentation", () => ({ toBrainClientView: () => ({ synthetic: true }) }));
vi.mock("./brain-explorer", () => ({ BrainExplorer: () => <main>Demostración sintética</main> }));
import BrainPage from "./page";

beforeEach(() => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "portal");
  mocks.projection.mockResolvedValue({ runtime: { realData: false } });
  mocks.context.mockResolvedValue(null);
});
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });

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

it("keeps a synthetic Brain with a route back to login after session expiry", async () => {
  const html = renderToStaticMarkup(await BrainPage());
  expect(html).toContain("Demostración sintética");
  expect(html).toContain('href="/login?next=/brain"');
  expect(html).not.toContain('aria-label="Portal TORO"');
});

it("offers explicit context selection and local logout instead of stranding a multi-org account", async () => {
  mocks.context.mockResolvedValue({ ...authorizedContext(), orgId: null, membership: null, requiresContextChoice: true });
  const html = renderToStaticMarkup(await BrainPage());
  expect(html).toContain('href="/my-toro"');
  expect(html).toContain('action="/api/auth/logout"');
  expect(html).toContain("Demostración sintética");
});

it("shows a safe recovery state when Brain context verification throws", async () => {
  mocks.context.mockRejectedValue(new Error("PRIVATE_AUTH_DIAGNOSTIC"));
  const html = renderToStaticMarkup(await BrainPage());
  expect(html).toContain("No pudimos verificar tu acceso ahora");
  expect(html).toContain('href="/brain"');
  expect(html).not.toContain("PRIVATE_AUTH_DIAGNOSTIC");
});

it("does not render an already-read private projection after losing its organization context", async () => {
  mocks.projection.mockResolvedValue({ runtime: { realData: true } });
  const html = renderToStaticMarkup(await BrainPage());
  expect(html).toContain("No pudimos verificar tu acceso ahora");
  expect(html).not.toContain("Demostración sintética");
});

it("leaves the public synthetic demo free of private identity resolution", async () => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", undefined);
  const html = renderToStaticMarkup(await BrainPage());
  expect(mocks.context).not.toHaveBeenCalled();
  expect(html).not.toContain('aria-label="Portal TORO"');
  expect(html).not.toContain("/api/auth/logout");
  expect(html).not.toContain("/login");
});
