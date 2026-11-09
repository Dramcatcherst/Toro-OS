import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("next/navigation",()=>({useRouter:()=>({refresh:vi.fn()})}));
import { PortalReadRefresh } from "./portal-read-refresh-control";
it("labels read attempts separately from source freshness and offers explicit refresh",()=>{
  const html=renderToStaticMarkup(<PortalReadRefresh queriedAt="2026-11-09T08:00:00Z" />);
  expect(html).toContain("Actualizar ahora");expect(html).toContain("cada 2 min");
  expect(html).toContain("no renueva datos antiguos");expect(html).toContain('type="button"');
});
