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

it("exposes the same reviewed catalogue beyond the shift shortcuts", async () => {
  load.mockResolvedValue({state:"ready",links:[
    {id:"PORTAL-ALEGRA",label:"Alegra",url:"https://app.alegra.com/"},
    {id:"PORTAL-GMAIL",label:"Gmail",url:"https://mail.google.com/"},
  ]});
  const markup=renderToStaticMarkup(await ToolsPage());
  expect(markup).toContain("Todos tus accesos");
  expect(markup).toContain('href="https://app.alegra.com/"');
  expect(markup).toContain('href="https://mail.google.com/"');
  expect(load).toHaveBeenCalledExactlyOnceWith({includeApprovedNavigation:true});
});
it("does not turn an account label into authorization when the reader denies access", async () => {
  load.mockResolvedValue({state:"denied",account:"person@example.test",links:[
    {id:"PORTAL-ALEGRA",label:"Alegra",url:"https://app.alegra.com/"},
  ]});
  const markup=renderToStaticMarkup(await ToolsPage());
  expect(markup).not.toContain('href="https://app.alegra.com/"');
  expect(markup).not.toContain("Todos tus accesos");
});

it("keeps reviewed access available for an authorized account without email during an outage", async () => {
  load.mockResolvedValue({state:"unavailable",navigationAuthorized:true,links:[
    {id:"PORTAL-ALEGRA",label:"Alegra",url:"https://app.alegra.com/"},
  ]});
  const markup=renderToStaticMarkup(await ToolsPage());
  expect(markup.includes('href="https://app.alegra.com/"')).toBe(true);
  expect(markup.includes("Cobertura parcial")).toBe(true);
});
