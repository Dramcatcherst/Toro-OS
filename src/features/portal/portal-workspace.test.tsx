import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PortalWorkspace } from "./portal-workspace";

const props = { modules: [], links: [], catalogueItems: [], catalogueMode: "fallback" as const, hotelAllowed: true,
  attention: <p>Historical attention fixture</p>, hotelOperations: <p>Native hotel fixture</p>,
  hotelOverview: { ready: true, rowsRead: 141, eligibleCount: 130, readAt: "2026-11-07T12:00:00Z", latestUpdatedAt: "2026-10-22T18:00:00Z" } };
it("offers four primary destinations and explicit secondary paths while keeping utilities mounted", () => {
  const html = renderToStaticMarkup(<PortalWorkspace {...props} />);
  const labels = [...html.matchAll(/role="tab"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/g)].map(x => x[1]);
  expect(labels).toEqual(["Hoy", "Operación", "Dinero", "Más"]);
  expect(html).toContain("Personas"); expect(html).toContain("Mercadeo"); expect(html).toContain("Herramientas"); expect(html).toContain("Reportes");
  expect(html).toContain("Total contado CRC"); expect(html).toContain("Respuestas rápidas");
  expect(html).not.toContain("Pide o busca"); expect(html).not.toContain("Sin señal");
});
it("puts registered hotel work ahead of collapsed historical attention without refreshing old source dates", () => {
  const html = renderToStaticMarkup(<PortalWorkspace {...props} />);
  expect(html.indexOf("141 filas consultadas")).toBeLessThan(html.indexOf("Historical attention fixture"));
  expect(html).toContain("130 tareas elegibles"); expect(html).toContain("Último cambio registrado");
  expect(html).toContain("Sin dato actual verificado");
  expect(html).toContain("Registros financieros y seguimiento");
});
it.each(["operations", "money", "people", "growth", "tools", "reports", "modules"] as const)("opens %s without dropping other mounted panels", initialTab => {
  const html = renderToStaticMarkup(<PortalWorkspace {...props} initialTab={initialTab} />);
  expect(html).toContain(`data-destination="${initialTab}"`);
  expect(html).toContain("Native hotel fixture"); expect(html).toContain("Total contado CRC");
});
it("uses organization-specific wording and no hotel payload outside hotel context", () => {
  const html = renderToStaticMarkup(<PortalWorkspace {...props} hotelAllowed={false} />);
  expect(html).not.toContain("Tu hotel"); expect(html).not.toContain("DreamTeam conserva");
  expect(html).not.toContain("Native hotel fixture"); expect(html).not.toContain("141 filas consultadas");
  expect(html).toContain("Tu organización");
});

it("uses the daily server summary before historical attention and keeps its coverage together", () => {
  const html = renderToStaticMarkup(<PortalWorkspace {...props} hotelDailySummary={<p>Daily triage fixture</p>} />);
  expect(html).toContain("Daily triage fixture"); expect(html).toContain("Historical attention fixture");
  expect(html.indexOf("Daily triage fixture")).toBeLessThan(html.indexOf("Historical attention fixture"));
  expect(html).not.toContain("141 filas consultadas");
  expect(html).toContain("Revisar Operación");
});
it("never renders daily hotel work outside the hotel context", () => {
  const html = renderToStaticMarkup(<PortalWorkspace {...props} hotelAllowed={false} hotelDailySummary={<p>Daily protected fixture</p>} />);
  expect(html).not.toContain("Daily protected fixture");
});

it("mounts the authorized finance review in Dinero before the manual cash tool", () => {
  const html = renderToStaticMarkup(<PortalWorkspace {...props} initialTab="money" financeReview={<p>Finance review fixture</p>} />);
  expect(html).toContain("Finance review fixture");
  expect(html.indexOf("Finance review fixture")).toBeLessThan(html.indexOf("Conteo de caja"));
});
it("does not invent a finance review when no authorized projection is supplied", () => {
  const html = renderToStaticMarkup(<PortalWorkspace {...props} initialTab="money" />);
  expect(html).not.toContain("Finance review fixture");
  expect(html).toContain("Conteo de caja");
});

