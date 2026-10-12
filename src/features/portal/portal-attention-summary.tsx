import Link from "next/link";
import { ArrowRight, CircleAlert, ExternalLink } from "lucide-react";
import type { OwnerAttentionProjection } from "@/features/attention/owner-attention";
import { formatAttentionAmount, formatAttentionCut, formatAttentionDate, safeEvidenceHref } from "@/features/attention/owner-attention-presentation";
import styles from "./portal.module.css";

export type PortalAttentionState = "disabled" | "unavailable" | "ready";
const priorities = { critical: "Crítica", high: "Alta", normal: "Normal" } as const;

/** A two-item window over the existing bounded projection. It never marks work complete. */
export function PortalAttentionSummary({ state, projection }: { state: PortalAttentionState; projection: OwnerAttentionProjection | null }) {
  const ready = state === "ready" && projection !== null;
  return <section className={styles.panel + " " + styles.pendingPanel} aria-labelledby="portal-pending-heading">
    <div className={styles.panelHeading}><h2 id="portal-pending-heading"><CircleAlert size={20} aria-hidden="true" />Pendiente</h2>
      <Link href="/my-toro#owner-attention-heading" prefetch={false} className={styles.textLink}>Ver todas<ArrowRight size={15} aria-hidden="true" /></Link>
    </div>
    {ready ? <>
      {projection.critical > 0 ? <p className={styles.criticalNote}>{projection.critical} con prioridad crítica en esta consulta</p> : null}
      <div className={styles.pendingList}>{projection.items.slice(0, 2).map(item => {
        const href = safeEvidenceHref(item.sourceUrl);
        return <details key={item.dedupeRef} className={styles.pendingItem}>
          <summary><span className={styles.priority} data-priority={item.priority}>{priorities[item.priority]}</span>
            <span className={styles.pendingCopy}><strong>{item.title}</strong><small>{formatAttentionDate(item.dueDate)} · {item.state}</small></span>
            <ArrowRight size={16} aria-hidden="true" />
          </summary>
          <div className={styles.pendingDetail}>
            <p>Fuente: {item.sourceSystem}</p>
            <p>Responsable: {item.humanOwner ?? item.ownerAgent ?? "Sin asignación verificada"}</p>
            {item.kind !== "communication" || item.amount !== null ? <p>{formatAttentionAmount(item.amount, item.currency)}</p> : null}
            {href ? <a href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={styles.textLink}>Abrir origen<ExternalLink size={15} aria-hidden="true" /></a> : null}
          </div>
        </details>;
      })}</div>
      {!projection.items.length ? <p role="status" className={styles.emptyNote}>Sin coincidencias en esta consulta. La cobertura parcial no confirma ausencia de pendientes.</p> : null}
      <p className={styles.panelNote}>{Math.min(projection.items.length, 2)} de {projection.items.length} disponibles · cobertura parcial</p>
      {projection.selection?.truncated ? <p className={styles.panelNote}>{projection.selection.matchedInReadBatch} coincidencias en el lote leído; la vista completa también está limitada.</p> : null}
      <p className={styles.panelNote}>{formatAttentionCut(projection.generatedAt)}. Total de la organización no verificado.</p>
    </> : <p role="status" className={styles.emptyNote}>{state === "disabled" ? "Fuente pendiente. Las prioridades no están habilitadas en este entorno." : "No disponible. No se pudieron comprobar las prioridades."}</p>}
  </section>;
}
