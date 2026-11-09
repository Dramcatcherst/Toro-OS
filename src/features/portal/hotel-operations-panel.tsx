import { ArrowUpRight, ClipboardList } from "lucide-react";
import { formatAttentionCut, formatAttentionDate } from "@/features/attention/owner-attention-presentation";
import { HOTEL_MANUAL_CONTINGENCY_URL, HOTEL_TASK_DISPLAY_LIMIT, type HotelOperationsView } from "./hotel-operations";
import styles from "./portal.module.css";
import hotel from "./hotel-operations.module.css";

const labels: Record<string, string> = {
  blocked: "Bloqueada", in_progress: "En curso", planned: "Planificada", pending: "Pendiente",
  unknown: "Por verificar", todo: "Pendiente", critical: "Crítica", high: "Alta", normal: "Normal", medium: "Media", urgent: "Urgente", low: "Baja", P0: "Crítica", P1: "Alta",
};
const label = (value: string) => labels[value] ?? value;

/** Native read-only view over TORO's existing records; it does not complete hotel work. */
export function HotelOperationsPanel({ view }: { view: HotelOperationsView }) {
  const allowed = view.state !== "denied";
  if (!allowed) return null;
  const visibleTasks = view.tasks.items.slice(0, HOTEL_TASK_DISPLAY_LIMIT);
  return <section className={hotel.panel} aria-labelledby="hotel-operations-heading">
    <div className={styles.sectionHeading}><h2 id="hotel-operations-heading"><ClipboardList size={18} aria-hidden="true" />Operación · Dreamcatcher</h2>
      <span>Consulta de TORO · sin escrituras</span></div>
    <div className={hotel.sourceGrid}>
      <div className={hotel.source}><strong>Trabajo registrado</strong><span>{view.tasks.state === "ready" ? `${visibleTasks.length} tareas visibles · muestra parcial` : "No disponible"}</span></div>
      <div className={hotel.source}><strong>Ocupación Kross</strong><span>Sin dato actual verificado</span></div>
    </div>
    {view.readAt ? <p className={hotel.cut}>Consulta: {formatAttentionCut(view.readAt)}. Cada tarea conserva la fecha de su último cambio.</p> : null}
    {view.state === "disabled" ? <p role="status" className={hotel.note}>La lectura canónica no está habilitada en este entorno.</p> : null}
    {view.tasks.state === "ready" ? <>
      <ol className={hotel.tasks}>{visibleTasks.map(task => <li key={task.canonicalRef}>
        <details><summary><span className={hotel.priority} data-priority={task.priority.toLowerCase()}>{label(task.priority)}</span>
          <span className={hotel.taskCopy}><strong>{task.title}</strong><small>{label(task.status)} · {task.area} · {task.owner ?? "Responsable por verificar"}</small></span></summary>
          <div className={hotel.detail}><p>{task.title}</p><p>Fecha registrada: {formatAttentionDate(task.dueDate)}. Fuente: {task.sourceSystem}.</p>
            <p>Último cambio: {formatAttentionCut(task.updatedAt)}.</p>
            <p>{task.needsRevalidation ? "Requiere revalidación. El estado registrado no confirma la situación física actual." : "Estado registrado en TORO. La consulta no certifica ejecución o inspección física."}</p>
            <p className={hotel.reference}>Referencia canónica: {task.canonicalRef}</p></div>
        </details>
      </li>)}</ol>
      {!view.tasks.items.length ? <p role="status" className={hotel.note}>Sin coincidencias en esta consulta parcial. No confirma que el hotel esté libre de pendientes.</p> : null}
      <p className={hotel.note}>{view.tasks.rowsRead} filas leídas{view.tasks.limitReached ? " · límite alcanzado" : ""}. Se prioriza dentro del lote; total del hotel no verificado.</p>
    </> : <p role="status" className={hotel.note}>{view.tasks.state === "transport_unavailable" ? "El transporte actual aún no entrega tareas de esta propiedad. No se sustituyen por datos manuales." : "No se pudieron comprobar las tareas. La ausencia de lectura no significa cero pendientes."}</p>}
    <details className={hotel.coverage}><summary>Fuentes y cobertura Kross</summary>
      <p>Esta vista no calcula ocupación, disponibilidad o tarifas desde copias históricas. Consulta Kross antes de comprometer una reserva.</p>
      {view.kross.state === "ready" ? <>
        <ul>{view.kross.items.map((item, index) => <li key={`${item.sourceName}:${index}`}>
          <strong>{item.sourceName}</strong> · {item.freshness === "stale" ? "Corte caducado" : item.freshness === "fresh" ? "Corte informativo dentro de 60 min" : "Vigencia por verificar"}
          <p>Corte de datos: {item.sourceAsOf ? formatAttentionCut(item.sourceAsOf) : "desconocido"}. {item.sourceAgeMinutes === null ? "Edad no verificable." : `Edad: ${item.sourceAgeMinutes} min.`}</p>
        </li>)}</ul>
        {!view.kross.items.length ? <p>No hay fuentes de esta propiedad en la consulta; conexión operativa desconocida.</p> : null}
        {view.kross.limitReached ? <p>Lectura de fuentes limitada; cobertura parcial.</p> : null}
      </> : <p>No se pudo verificar la cobertura Kross de esta propiedad.</p>}
    </details>
    <details className={hotel.coverage}><summary>Continuidad manual</summary>
      <p>El panel auxiliar conserva captura manual e historial. Su acceso privado es independiente; sus registros requieren conciliación con TORO y Kross.</p>
      <a href={HOTEL_MANUAL_CONTINGENCY_URL} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={hotel.manualLink}>Abrir captura manual<ArrowUpRight size={16} aria-hidden="true" /></a>
    </details>
  </section>;
}
