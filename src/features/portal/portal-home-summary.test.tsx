import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PortalHomeSummary } from "./portal-home-summary";
import type { HotelOperationsView, HotelTask } from "./hotel-operations";
const task=(n:number, change:Partial<HotelTask>={}):HotelTask=>({canonicalRef:"00000000-0000-4000-8000-"+String(n).padStart(12,"0"),title:"Work "+n,status:"planned",priority:"normal",area:"Operación",owner:"Owner",dueDate:"2026-11-08",sourceSystem:"TORO",updatedAt:"2026-11-07T12:00:00Z",needsRevalidation:false,...change});
const view=(items:HotelTask[], change:Partial<HotelOperationsView["tasks"]>={}):HotelOperationsView["tasks"]=>({state:"ready",items,rowsRead:items.length,limitReached:false,total:null,...change});
const at="2026-11-09T05:30:00Z";
it("renders actionable recorded counts with named metrics and Costa Rica date",()=>{
 const html=renderToStaticMarkup(<PortalHomeSummary tasks={view([task(1,{priority:"critical",owner:null,dueDate:"2026-11-07",needsRevalidation:true})])} readAt={at}/>);
 expect(html).toContain("Pendientes de revisión");expect(html).toContain("Prioridad crítica");expect(html).toContain("Con fecha vencida");expect(html).toContain("Para hoy");expect(html).toContain("Sin responsable");expect(html).toContain("Por revalidar");expect(html).toContain("08/11/2026");expect(html).toContain("<dl");
});
it("shows three source-backed next items with owner/date/revalidation and no fourth payload",()=>{
 const html=renderToStaticMarkup(<PortalHomeSummary tasks={view([task(1,{owner:null,needsRevalidation:true}),task(2,{dueDate:null,priority:"critical"}),task(3),task(4)])} readAt={at}/>);
 expect(html).toContain("Work 1");expect(html).toContain("Work 2");expect(html).toContain("Work 3");expect(html).not.toContain("Work 4");
 expect(html.indexOf("Work 2")).toBeLessThan(html.indexOf("Work 1"));expect(html.indexOf("Work 1")).toBeLessThan(html.indexOf("Work 3"));
 expect(html).toContain("Sin responsable");expect(html).toContain("Sin fecha");expect(html).toContain("Revalidar antes de actuar");
});
it("keeps unavailable different from an empty batch",()=>{
 const failed=renderToStaticMarkup(<PortalHomeSummary tasks={view([],{state:"unavailable",rowsRead:null})} readAt={at}/>);
 const empty=renderToStaticMarkup(<PortalHomeSummary tasks={view([])} readAt={at}/>);
 expect(failed).toContain("No se pudieron comprobar");expect(failed).not.toContain("Sin tareas elegibles");expect(empty).toContain("Sin tareas elegibles");expect(empty).not.toContain("No se pudieron comprobar");
});
it("keeps capped coverage and old modification visible without inventing a hotel census",()=>{
 const html=renderToStaticMarkup(<PortalHomeSummary tasks={view([task(1)],{rowsRead:200,limitReached:true})} readAt={at}/>);
 expect(html).toContain("Límite de lectura alcanzado");expect(html).toContain("total del hotel");expect(html).toContain("Último cambio registrado");expect(html).toContain("07/11/2026");expect(html).toContain("<details");
});
it("unknown query day shows date-dependent metrics as unknown",()=>{
 const html=renderToStaticMarkup(<PortalHomeSummary tasks={view([task(1)])} readAt={null}/>);
 expect(html).toContain("Fecha de consulta por verificar");expect(html).toContain("Por verificar");
});
it("flags future source clocks without adopting them as fresh work",()=>{
 const html=renderToStaticMarkup(<PortalHomeSummary tasks={view([task(1,{updatedAt:"2026-11-10T12:00:00Z"})])} readAt={at}/>);
 expect(html).toContain("Fechas de modificación futuras");expect(html).toContain("sin fecha comprobada");
});

it("preserves valid failed-attempt time without zero metrics or source modification",()=>{
 const failed=renderToStaticMarkup(<PortalHomeSummary tasks={view([],{state:"unavailable",rowsRead:null})} readAt={at}/>);
 const invalid=renderToStaticMarkup(<PortalHomeSummary tasks={view([],{state:"unavailable",rowsRead:null})} readAt="invalid"/>);
 expect(failed).toContain("Intento de consulta");expect(failed).toContain("08/11/2026");expect(failed).not.toContain("Último cambio registrado");expect(failed).not.toContain("<dl");
 expect(invalid).not.toContain("Intento de consulta");
});
it("an unknown query clock never certifies a far-future source modification",()=>{
 const html=renderToStaticMarkup(<PortalHomeSummary tasks={view([task(1,{updatedAt:"2099-11-10T12:00:00Z"})])} readAt={null}/>);
 expect(html).toContain("sin fecha comprobada");expect(html).not.toContain("2099");
});
