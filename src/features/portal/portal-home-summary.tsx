import type { HotelOperationsView } from "./hotel-operations";
import { buildHotelHomeSummary } from "./hotel-home-summary";
import { formatAttentionCut, formatAttentionDate } from "@/features/attention/owner-attention-presentation";
import styles from "./portal.module.css";

const count = (value: number | null) => value === null ? "Por verificar" : value;

/** A server-rendered projection of the same read; no provider request, action or extra client payload. */
export function PortalHomeSummary({ tasks, readAt }: { tasks: HotelOperationsView["tasks"]; readAt: string | null }) {
  const summary = buildHotelHomeSummary(tasks, readAt);
  if (summary.state !== "ready") return <p role="status" className={styles.emptyNote}>
    No se pudieron comprobar los pendientes. La ausencia de lectura no significa cero tareas.
    {summary.queryAt ? <span className={styles.homeAttempt}>Intento de consulta: {formatAttentionCut(summary.queryAt)}.</span> : null}
  </p>;
  const metrics: Array<[string, number | null]> = [
    ["Prioridad crítica", summary.critical], ["Con fecha vencida", summary.pastDue],
    ["Para hoy", summary.dueToday], ["Sin responsable", summary.unassigned],
  ];
  return <div className={styles.homeDaily}>
    <p className={styles.homeDay}>{summary.day
      ? <><time dateTime={summary.day}>{formatAttentionDate(summary.day)}</time> · Costa Rica</>
      : "Fecha de consulta por verificar"}</p>
    <p className={styles.homeMetric}><strong>{summary.count}</strong> <span>Pendientes de revisión en este lote</span></p>
    <dl aria-label="Prioridades del trabajo registrado" className={styles.homeDailyStats}>{metrics.map(([label, value]) =>
      <div key={label}><dt>{label}</dt><dd>{count(value)}</dd></div>)}</dl>
    <p className={styles.panelNote}>Fechas y prioridades registradas; comprobar vigencia antes de actuar.</p>
    {summary.next.length ? <div className={styles.homeNext}>
      <h3>Para revisar primero</h3><ol aria-label="Primeras tareas registradas por revisar">{summary.next.map(task =>
        <li key={task.canonicalRef}><strong>{task.title}</strong>
          <small>{task.area} · {task.owner?.trim() || "Sin responsable"} · {task.dueDate ? formatAttentionDate(task.dueDate) : "Sin fecha"}</small>
          {task.needsRevalidation ? <small className={styles.homeRevalidation}>Revalidar antes de actuar</small> : null}
        </li>)}</ol>
    </div> : <p role="status" className={styles.emptyNote}>Sin tareas elegibles en este lote. No confirma ausencia de pendientes en el hotel.</p>}
    <details className={styles.subtleDisclosure}><summary>Calidad del registro · Por revalidar: {summary.revalidation}</summary>
      <p>Sin fecha de vencimiento: {summary.withoutDate}. No se asignan fechas o responsables por deducción.</p>
      {summary.futureUpdates ? <p>Fechas de modificación futuras: {summary.futureUpdates}. Comprobar reloj y fuente.</p> : null}
    </details>
    <details className={styles.subtleDisclosure}><summary>Fuente y alcance de estos pendientes</summary>
      <p>{summary.rowsRead === null ? "Cantidad de filas no comprobada" : `${summary.rowsRead} filas consultadas`}; cobertura acotada, total del hotel desconocido.
        {summary.limitReached ? " Límite de lectura alcanzado." : ""}</p>
      <p>Último cambio registrado: {summary.latestUpdatedAt ? formatAttentionCut(summary.latestUpdatedAt) : "sin fecha comprobada"}.
        Consulta: {summary.queryAt ? formatAttentionCut(summary.queryAt) : "hora no disponible"}. Consultar no renueva la fuente ni certifica ejecución física.</p>
    </details>
  </div>;
}
