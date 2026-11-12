import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
import { createToroReportingContext } from "@/lib/reporting-policy";
import type { OwnerAttentionProjection } from "./owner-attention";
const mocks = vi.hoisted(() => ({ load: vi.fn(), enabled: vi.fn() }));
vi.mock("./owner-attention-server", () => ({ loadOwnerAttentionProjection: mocks.load, ownerAttentionReadEnabled: mocks.enabled }));
import { OwnerAttentionPanel } from "./owner-attention-panel";
function projection(): OwnerAttentionProjection {
  const generatedAt = "2026-10-12T02:00:00.000Z";
  return { contractVersion: "owner-attention-v1", generatedAt, total: 10, critical: 10, high: 0, normal: 0,
    items: Array.from({length:10}, (_,i) => ({ key:`invoice:${i}`,dedupeRef:`invoice:${i}`,kind:"invoice",title:`Synthetic item ${i}`,
      priority:"critical",state:"unverified",dueDate:null,amount:null,currency:null,ownerAgent:null,humanOwner:null,
      sourceSystem:"Supabase",sourceUrl:i===9 ? "https://private.example/pay/invoice" : null,mailbox:null })),
    reportContext:createToroReportingContext(new Date(generatedAt)),
    selection:{displayedCount:10,matchedInReadBatch:20,truncated:true},
    coverage:{contractVersion:"owner-attention-coverage-v1",scope:{kind:"organization",orgId:authorizedContext().orgId!},
      totalInOrganization:null,partial:true,snapshot:"non_transactional",sources:[
        {source:"operations.communication_followups",rowsRead:10,limit:100,limitReached:false,completeness:"unverified"},
        {source:"operations.obligations",rowsRead:20,limit:150,limitReached:false,completeness:"unverified"},
        {source:"finance.invoices",rowsRead:200,limit:200,limitReached:true,completeness:"unverified"}]}
  };
}
const render = async () => renderToStaticMarkup(await OwnerAttentionPanel({context:authorizedContext()}));
beforeEach(() => {vi.resetAllMocks();mocks.enabled.mockReturnValue(true);mocks.load.mockResolvedValue(projection());});
afterEach(() => vi.unstubAllEnvs());
it("keeps every selected record reachable while distinguishing availability from visible summary", async () => {
  const html=await render();
  expect(html).toContain("10 disponibles en esta vista");expect(html).toContain("20 seleccionados del lote leído");
  expect(html).toContain("Ver 4 más de esta vista");
  for(let i=0;i<10;i++)expect(html).toContain(`Synthetic item ${i}`);
  expect(html).not.toContain("10 mostrados");expect(html).not.toMatch(/<details[^>]*open/);
});
it("retains source caps, partial coverage and unknown amounts in the compact view", async () => {
  const html=await render();expect(html).toContain("Cobertura parcial");expect(html).toContain("Total de la organización: no verificado");
  expect(html).toContain("Importe no informado");expect(html).toContain("200 / 200");expect(html).toContain("Límite alcanzado");
  expect(html).toContain('scope="col"');expect(html).not.toContain("CRC 0");
});
it("does not expose unsafe payment URLs through the compact card", async () => {
  const html=await render();expect(html).not.toContain("private.example");expect(html).toContain("Enlace de origen no disponible");
});
it("rejects mismatched display counts instead of rendering an inconsistent summary", async () => {
  const data=projection();data.selection!.displayedCount=9;mocks.load.mockResolvedValue(data);
  const html=await render();expect(html).toContain("No se pudo comprobar el ámbito");expect(html).not.toContain("Synthetic item");
});
it("keeps a source failure unknown rather than zero", async () => {
  mocks.load.mockRejectedValue(new Error("private diagnostic"));const html=await render();
  expect(html).toContain("No se pudieron comprobar las fuentes");expect(html).not.toContain("0 disponibles");expect(html).not.toContain("private diagnostic");
});
it("does not read or render Finance for an unauthorized role", async () => {
  const context=authorizedContext();context.membership!.roles=["EMPLEADO"];
  expect(await OwnerAttentionPanel({context})).toBeNull();expect(mocks.load).not.toHaveBeenCalled();
});

it("labels an invoice total as a document total, never a confirmed amount due", async () => {
  const data=projection();data.items[0]={...data.items[0], amount:180, currency:"USD", kind:"invoice"};
  mocks.load.mockResolvedValue(data);
  const html=await render();
  expect(html).toContain("Total de factura (no es saldo pendiente confirmado): USD");
  expect(html).not.toContain("Saldo pendiente: USD");
});
