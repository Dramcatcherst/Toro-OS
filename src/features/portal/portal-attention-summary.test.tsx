import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PortalAttentionSummary } from "./portal-attention-summary";
import type { OwnerAttentionProjection } from "@/features/attention/owner-attention";

const projection: OwnerAttentionProjection = {
  contractVersion: "owner-attention-v1", generatedAt: "2026-10-12T18:00:00Z", total: 3, critical: 1, high: 1, normal: 1,
  items: ["Revisar relevo", "Revisar mantenimiento", "Tercer registro", "Cuarto detalle privado"].map((title, index) => ({
    key: `qa-${index}`, dedupeRef: `qa-${index}`, kind: "communication", title,
    priority: index === 0 ? "critical" : "normal", state: "Por revisar", dueDate: "2026-10-12",
    amount: null, currency: null, ownerAgent: null, humanOwner: null, sourceSystem: "operations.communication_followups",
    sourceUrl: index === 0 ? "https://example.com/?token=secret" : "https://example.com/report", mailbox: null,
  })),
};

it("shows up to three historical records neutrally with their source dates and partial coverage", () => {
  const html = renderToStaticMarkup(<PortalAttentionSummary state="ready" projection={projection} />);
  expect(html).toContain("Revisar relevo");
  expect(html).toContain("Revisar mantenimiento");
  expect(html).toContain("Tercer registro");
  expect(html).not.toContain("Cuarto detalle privado");
  expect(html).not.toContain("señales críticas");
  expect(html).toContain("Registros por verificar");
  expect(html).toContain("3 de 4 disponibles");
  expect(html).not.toContain('data-priority="critical"');
  expect(html).toContain("Prioridad calculada para esta revisión");
  expect(html).not.toContain("Prioridad registrada");
  expect(html).toContain("Seguimiento registrado");
  expect(html).toContain("Consulta:");
  expect(html).toContain("Costa Rica");
  expect(html).toContain("Total de la organización no verificado");
  expect(html).not.toContain("token=secret");
  expect(html).not.toContain("checkbox");
});

it.each(["disabled", "unavailable"] as const)("does not expose supplied rows when %s", state => {
  const html = renderToStaticMarkup(<PortalAttentionSummary state={state} projection={projection} />);
  expect(html).not.toContain("Revisar relevo");
  expect(html).not.toContain("0 pendientes");
});

it("does not interpret an empty partial read as absence of work", () => {
  const html = renderToStaticMarkup(<PortalAttentionSummary state="ready" projection={{ ...projection, items: [], critical: 0 }} />);
  expect(html).toContain("no confirma ausencia de pendientes");
});

it("preserves the signal when the full view is also truncated", () => {
  const html = renderToStaticMarkup(<PortalAttentionSummary state="ready" projection={{ ...projection,
    selection: { matchedInReadBatch: 145, displayedCount: 3, truncated: true },
  }} />);
  expect(html).toContain("145 coincidencias en el lote leído");
  expect(html).toContain("la vista completa también está limitada");
});

it("labels invoice total without pretending it is an unpaid balance", () => {
  const items=[{...projection.items[0],kind:"invoice" as const,amount:180,currency:"USD"},...projection.items.slice(1)];
  const html=renderToStaticMarkup(<PortalAttentionSummary state="ready" projection={{...projection,items}} />);
  expect(html).toContain("Total de factura (no es saldo pendiente confirmado): USD");
  expect(html).not.toContain("Saldo pendiente: USD");
});

it("keeps filter metadata limited to the same three authorized visible records",()=>{
  const items=projection.items.map((item,index)=>({...item,currency:index===3?"EUR":index===1?"CRC":"USD",dueDate:index===3?"2099-12-01":"2026-10-12",mailbox:"PRIVATE_MAILBOX"}));
  const html=renderToStaticMarkup(<PortalAttentionSummary state="ready" projection={{...projection,items}} />);
  expect(html).toContain("Moneda registrada");expect(html).toContain("Mes de la fecha registrada");
  expect(html).toContain("no es período contable");expect(html).toContain("3 registros de esta vista");
  expect(html).not.toContain("Cuarto detalle privado");expect(html).not.toContain("EUR");expect(html).not.toContain("2099");
  expect(html).not.toContain("PRIVATE_MAILBOX");
});
it("does not render filter options from denied/disabled payloads",()=>{
  const html=renderToStaticMarkup(<PortalAttentionSummary state="disabled" projection={projection} />);
  expect(html).not.toContain("Filtrar esta vista financiera");expect(html).not.toContain("Limpiar filtros");
});

it.each([
  { basis: "due" as const, label: "Vencimiento registrado" },
  { basis: "review" as const, label: "Revisión registrada" },
  { basis: "unknown" as const, label: "Fecha registrada" },
  { basis: undefined, label: "Fecha registrada" },
])("labels an obligation with $basis provenance without inventing a deadline", ({ basis, label }) => {
  const item = { ...projection.items[0], kind: "obligation" as const, dateBasis: basis };
  const html = renderToStaticMarkup(<PortalAttentionSummary state="ready" projection={{ ...projection, items: [item] }} />);
  expect(html).toContain(label);
  if (basis !== "due") expect(html).not.toContain("Vencimiento registrado");
});
