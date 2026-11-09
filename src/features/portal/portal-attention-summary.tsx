import Link from "next/link";
import { ArrowRight, CircleAlert, ExternalLink } from "lucide-react";
import type { OwnerAttentionProjection } from "@/features/attention/owner-attention";
import { formatAttentionAmountWithBasis, formatAttentionCut, formatAttentionDate, safeEvidenceHref } from "@/features/attention/owner-attention-presentation";
import styles from "./portal.module.css";
import { PortalAttentionFilter } from "./portal-attention-filter-control";
import { attentionCurrency, attentionMonth } from "./portal-attention-filter";

export type PortalAttentionState = "disabled" | "unavailable" | "ready";
const priorities = { critical: "Crítica", high: "Alta", normal: "Normal" } as const;

/** Historical recorded priorities require review; their read time is not current urgency. */
export function PortalAttentionSummary({ state, projection }: { state: PortalAttentionState; projection: OwnerAttentionProjection | null }) {
  const ready = state === "ready" && projection !== null;
  return <section className={styles.panel + " " + styles.pendingPanel} aria-labelledby="portal-pending-heading">
    <div className={styles.panelHeading}><h2 id="portal-pending-heading"><CircleAlert size={20} aria-hidden="true" />Registros por verificar</h2>
      <Link href="/my-toro#owner-attention-heading" prefetch={false} className={styles.textLink}>Ver todas<ArrowRight size={15} aria-hidden="true" /></Link>
    </div>
    {ready ? <>
      <p className={styles.panelNote}>Registros seleccionados para revisar. La fecha de consulta no acredita urgencia ni saldo exigible actual.</p>
      <PortalAttentionFilter entries={projection.items.slice(0, 3).map(item => {
        const href = safeEvidenceHref(item.sourceUrl);
        return { currency: attentionCurrency(item.currency), month: attentionMonth(item.dueDate), content: <details key={item.dedupeRef} className={styles.pendingItem}>
          <summary><span className={styles.priority}>Revisar</span>
            <span className={styles.pendingCopy}><strong>{item.title}</strong><small>{item.kind === "invoice" || item.kind === "obligation" ? "Vencimiento registrado" : "Seguimiento registrado"}: {formatAttentionDate(item.dueDate)} · {item.state === "unknown" ? "Estado por verificar" : item.state}</small></span>
            <ArrowRight size={16} aria-hidden="true" />
          </summary>
          <div className={styles.pendingDetail}>
            <p>{item.title}</p>
            <p>Fuente: {item.sourceSystem}</p>
            <p>Prioridad calculada para esta revisión: {priorities[item.priority]}. No confirma urgencia actual.</p>
            <p>Responsable: {item.humanOwner ?? item.ownerAgent ?? "Sin asignación verificada"}</p>
            {item.kind !== "communication" || item.amount !== null ? <p>{formatAttentionAmountWithBasis(item.kind, item.amount, item.currency)}</p> : null}
            {href ? <a href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={styles.textLink}>Abrir origen<ExternalLink size={15} aria-hidden="true" /></a> : null}
          </div>
        </details> };
      })} />
      {!projection.items.length ? <p role="status" className={styles.emptyNote}>Sin coincidencias en esta consulta. La cobertura parcial no confirma ausencia de pendientes.</p> : null}
      <details className={styles.subtleDisclosure}><summary>{Math.min(projection.items.length, 3)} de {projection.items.length} disponibles · cobertura parcial</summary>
        {projection.selection?.truncated ? <p>{projection.selection.matchedInReadBatch} coincidencias en el lote leído; la vista completa también está limitada.</p> : null}
        <p>Consulta: {formatAttentionCut(projection.generatedAt)}. Total de la organización no verificado.</p>
      </details>
    </> : <p role="status" className={styles.emptyNote}>{state === "disabled" ? "Fuente pendiente. Las prioridades no están habilitadas en este entorno." : "No disponible. No se pudieron comprobar las prioridades."}</p>}
  </section>;
}
