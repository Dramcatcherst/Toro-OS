import { beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const load = vi.hoisted(() => vi.fn());
vi.mock("@/features/tools/server", () => ({ loadHotelDirectory: load }));
import ToolsPage from "./page";
beforeEach(() => vi.resetAllMocks());
it("renders only the authorized projection with safe new-tab links", async () => {
  load.mockResolvedValue({state:"ready",links:[{id:"LINK-002",label:"Cotizar estancia",url:"https://dreamcatcherhotel.kross.travel/"}]});
  const markup=renderToStaticMarkup(await ToolsPage());
  expect(markup).toContain("Cotizar estancia");
  expect(markup).toContain('rel="noopener noreferrer"');
  expect(markup).not.toContain("localStorage");
});
it.each(["denied","unavailable"])("never renders supplied links in %s state", async state => {
  load.mockResolvedValue({state,links:[{id:"private",label:"private",url:"https://private.example/"}]});
  const markup=renderToStaticMarkup(await ToolsPage());
  expect(markup).not.toContain("private.example");
  expect(markup).toContain(state === "denied" ? "/login?next=/my-toro/herramientas" : "/my-toro");
});
it("recognizes a signed-in account without sending it back to login on a connection failure", async () => {
  load.mockResolvedValue({state:"unavailable",links:[],account:"admin@example.test",reason:"connection_pending"});
  const markup=renderToStaticMarkup(await ToolsPage());
  expect(markup).toContain("admin@example.test");
  expect(markup).toContain("Tu acceso está bien");
  expect(markup).not.toContain('href="/login');
});
