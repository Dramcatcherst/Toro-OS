"use client";

import { useId, useReducer, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, ClipboardCopy, Search } from "lucide-react";
import { formatAttentionCut, formatAttentionDate } from "@/features/attention/owner-attention-presentation";
import { HOTEL_MANUAL_CONTINGENCY_URL, type HotelOperationsView } from "./hotel-operations";
import { buildHotelTaskSummary, copyHotelTaskSummary, hotelTaskFiltersReducer, initialHotelTaskFilters,
  recordedTaskPriority, recordedTaskStatus, selectHotelTasks, type HotelTaskFilterAction, type HotelTaskSort } from "./hotel-task-explorer";
import hotel from "./hotel-operations.module.css";

/** A bounded review of recorded work. No control changes a hotel record. */
export function HotelOperationsPanel({ view }: { view: HotelOperationsView }) {
  const id = useId();
  const [filters, dispatch] = useReducer(hotelTaskFiltersReducer, initialHotelTaskFilters);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "manual">("idle");
  const copyVersion = useRef(0);
  const selection = selectHotelTasks(view.tasks.items, filters);
  const summary = buildHotelTaskSummary(selection, filters, view.tasks.state === "ready"
    ? { rowsRead: view.tasks.rowsRead, limitReached: view.tasks.limitReached, readAt: view.readAt }
    : { rowsRead: null, limitReached: false, readAt: view.readAt });
  function change(action: HotelTaskFilterAction) { dispatch(action); copyVersion.current += 1; setCopyState("idle"); }
  async function copy() {
    const version = ++copyVersion.current; setCopyState("copying");
    const writer = typeof navigator !== "undefined" && navigator.clipboard?.writeText
      ? navigator.clipboard.writeText.bind(navigator.clipboard) : undefined;
    const result = await copyHotelTaskSummary(summary, writer);
    if (version === copyVersion.current) setCopyState(result);
  }
  if (view.state === "denied") return null;
  return <section className={hotel.panel} aria-labelledby={`${id}-heading`}>
    <div className={hotel.heading}><h2 id={`${id}-heading`}>Trabajo registrado</h2><span className={hotel.readOnly}>Solo lectura</span></div>
    <p className={hotel.note}>Kross: <strong>Sin dato actual verificado</strong>. Los registros no certifican ejecución física.</p>
    {view.state === "disabled" ? <p role="status" className={hotel.notice}>La lectura canónica no está habilitada en este entorno.</p> : null}
    {view.tasks.state === "ready" ? <>
      <div className={hotel.filters}>
        <label className={hotel.search}><Search size={18} aria-hidden="true" /><input type="search" maxLength={200}
          aria-label="Buscar tareas registradas" placeholder="Buscar tarea, área, responsable o referencia" value={filters.query}
          onChange={event => change({ type: "criteria", change: { query: event.target.value } })} /></label>
        <div className={hotel.toggles}>
          <button type="button" aria-pressed={filters.unassignedOnly} onClick={() => change({ type: "criteria", change: { unassignedOnly: !filters.unassignedOnly } })}>Sin responsable</button>
          <button type="button" aria-pressed={filters.revalidationOnly} onClick={() => change({ type: "criteria", change: { revalidationOnly: !filters.revalidationOnly } })}>Por revalidar</button>
        </div>
        <label className={hotel.field}>Área<select value={filters.area} onChange={event => change({ type: "criteria", change: { area: event.target.value } })}>
          <option value="">Todas las áreas</option>{selection.areas.map(area => <option key={area} value={area}>{area}</option>)}</select></label>
        <label className={hotel.field}>Ordenar<select value={filters.sort} onChange={event => change({ type: "criteria", change: { sort: event.target.value as HotelTaskSort } })}>
          <option value="priority">Prioridad registrada</option><option value="due">Vencimiento registrado</option><option value="recent">Última modificación</option></select></label>
        <button type="button" className={hotel.reset} onClick={() => change({ type: "reset" })}>Restablecer</button>
      </div>
      <p className={hotel.coverageLine} role="status">{view.tasks.rowsRead} filas consultadas · {selection.eligibleCount} tareas elegibles · {selection.totalMatches} coincidencias.
        {view.tasks.limitReached ? " Límite de lectura alcanzado." : ""} Cobertura acotada; total del hotel desconocido.</p>
      <div className={hotel.listHeader} aria-hidden="true"><span>Tarea / área</span><span>Estado registrado</span><span>Responsable</span><span>Último cambio</span></div>
      <ol className={hotel.tasks} aria-label="Tareas registradas de esta página">{selection.items.map(task => <li key={task.canonicalRef}>
        <details><summary>
          <span className={hotel.taskCopy}><strong>{task.title}</strong><small>{task.area} · Prioridad registrada: {recordedTaskPriority(task.priority)}</small></span>
          <span className={hotel.status}>{recordedTaskStatus(task.status)}{task.needsRevalidation ? <small>Requiere revalidación</small> : null}</span>
          <span className={hotel.owner}>{task.owner ?? "Sin responsable"}</span>
          <span className={hotel.changed}>{formatAttentionCut(task.updatedAt)}<ChevronRight size={16} aria-hidden="true" /></span>
        </summary><div className={hotel.detail}>
          <p>Estado registrado: {task.status} · Prioridad registrada: {task.priority}.</p>
          <p>Responsable registrado: {task.owner ?? "Sin responsable"} · Área: {task.area}.</p>
          <p>Vencimiento registrado: {task.dueDate ? formatAttentionDate(task.dueDate) : "Sin fecha"}.</p>
          <p>Fuente: {task.sourceSystem} · Último cambio: {formatAttentionCut(task.updatedAt)}.</p>
          <p>{task.needsRevalidation ? "Requiere revalidación antes de usarlo como estado actual." : "La consulta no acredita ejecución física ni vigencia actual."}</p>
          <p className={hotel.reference}>Referencia canónica: {task.canonicalRef}</p>
        </div></details>
      </li>)}</ol>
      {!selection.items.length ? <div role="status" className={hotel.empty}><strong>{selection.eligibleCount ? "Sin coincidencias con estos filtros" : "Sin tareas elegibles en este lote"}</strong>
        <p>No confirma que el hotel esté libre de pendientes. {selection.eligibleCount ? "Restablece los filtros para revisar el conjunto consultado." : "La consulta conserva cobertura parcial."}</p></div> : null}
      <div className={hotel.pagination}><p>Mostrando {selection.start}–{selection.end} de {selection.totalMatches} · Página {selection.page}/{selection.pageCount}</p>
        <div><button type="button" aria-label="Página anterior de tareas" disabled={selection.page <= 1} onClick={() => change({ type: "page", page: selection.page - 1 })}><ChevronLeft size={17} aria-hidden="true" />Anterior</button>
          <button type="button" aria-label="Página siguiente de tareas" disabled={selection.page >= selection.pageCount} onClick={() => change({ type: "page", page: selection.page + 1 })}>Siguiente<ChevronRight size={17} aria-hidden="true" /></button></div></div>
      <div className={hotel.copyActions}><button type="button" className={hotel.copy} disabled={copyState === "copying"} onClick={copy}><ClipboardCopy size={17} aria-hidden="true" />{copyState === "copying" ? "Copiando…" : "Copiar resumen"}</button>
        <p role="status">{copyState === "copied" ? "Resumen copiado. Es un borrador; no se envió." : copyState === "manual" ? "No se pudo copiar. Puedes seleccionar el resumen de abajo. No se envió." : "Resumen del filtro y la página, sin títulos ni nombres personales. No se envía."}</p></div>
      <details className={hotel.coverage} open={copyState === "manual"}><summary>Ver resumen para copiar manualmente</summary>
        <textarea aria-label="Resumen de tareas para copiar manualmente" rows={8} readOnly value={summary} onFocus={event => event.currentTarget.select()} /></details>
    </> : <p role="status" className={hotel.notice}>{view.tasks.state === "transport_unavailable" ? "El transporte actual aún no entrega tareas de esta propiedad. No se sustituyen por datos manuales." : "No se pudieron comprobar las tareas. La ausencia de lectura no significa cero pendientes."}</p>}
    <details className={hotel.coverage}><summary>Detalles de la fuente y cobertura Kross</summary>
      <p>Consulta: {view.readAt ? formatAttentionCut(view.readAt) : "hora no disponible"}. Cada tarea conserva la fecha de su último cambio. La consulta no renueva su vigencia.</p>
      <p>Se excluyen estados terminales del lote leído; las tareas elegibles no representan el censo del hotel.</p>
      {view.kross.state === "ready" ? <><ul>{view.kross.items.map((item, index) => <li key={`${item.sourceName}:${index}`}>
        <strong>{item.sourceName}</strong> · {item.freshness === "stale" ? "Corte caducado" : item.freshness === "fresh" ? "Corte informativo dentro de 60 min" : "Vigencia por verificar"}
        <p>Corte de datos: {item.sourceAsOf ? formatAttentionCut(item.sourceAsOf) : "desconocido"}. {item.sourceAgeMinutes === null ? "Edad no verificable." : `Edad: ${item.sourceAgeMinutes} min.`}</p>
        <p>Tipo: {item.snapshotKind}. Registro de observación: {item.observedAt ? formatAttentionCut(item.observedAt) : "desconocido"}.</p>
      </li>)}</ul>{view.kross.limitReached ? <p>Límite de fuentes alcanzado; cobertura parcial.</p> : null}</> : <p>No se pudo comprobar la cobertura Kross. No significa ocupación cero.</p>}
    </details>
    <details className={hotel.coverage}><summary>Continuidad manual</summary><p>El acceso privado es independiente. Las capturas manuales requieren reconciliación con su fuente canónica.</p>
      <a href={HOTEL_MANUAL_CONTINGENCY_URL} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={hotel.manualLink}>Abrir captura manual<ArrowUpRight size={16} aria-hidden="true" /></a></details>
  </section>;
}
