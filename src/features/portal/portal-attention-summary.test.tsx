import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PortalAttentionSummary } from "./portal-attention-summary";
import type { OwnerAttentionProjection } from "@/features/attention/owner-attention";

const projection: OwnerAttentionProjection = {
  contractVersion: "owner-attention-v1", generatedAt: "2026-10-12T18:00:00Z", total: 3, critical: 1, high: 1, normal: 1,
  items: ["Revisar relevo", "Revisar mantenimiento", "Tercer detalle privado"].map((title, index) => ({
    key: `qa-${index}`, dedupeRef: `qa-${index}`, kind: "communication", title,
    priority: index === 0 ? "critical" : "normal", state: "Por revisar", dueDate: "2026-10-12",
    amount: null, currency: null, ownerAgent: null, humanOwner: null, sourceSystem: "operations.communication_followups",
    sourceUrl: index === 0 ? "https://example.com/?token=secret" : "https://example.com/report", mailbox: null,
  })),
};

it("keeps a two-item summary with critical signal, cutoff and explicit partial coverage", () => {
  const html = renderToStaticMarkup(<PortalAttentionSummary state="ready" projection={projection} />);
  expect(html).toContain("Revisar relevo");
  expect(html).toContain("Revisar mantenimiento");
  expect(html).not.toContain("Tercer detalle privado");
  expect(html).toContain("1 señales críticas de la consulta");
  expect(html).toContain("2 de 3 disponibles");
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
