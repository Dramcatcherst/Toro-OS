import { formatAttentionCut } from "@/features/attention/owner-attention-presentation";
import type { FinanceReviewView } from "./finance-review";
import styles from "./portal.module.css";

const label = (value: string) => value.replaceAll("_", " ");
export function PortalFinanceReview({ view }: { view: FinanceReviewView }) {
  return <section className={styles.cashCurrency} aria-labelledby="portal-finance-review-heading">
    <div className={styles.panelHeading}><h3 id="portal-finance-review-heading">Revisión financiera</h3><span className={styles.readOnlyBadge}>Solo lectura</span></div>
    {view.state === "ready" ? <>
      <p className={styles.homeMetric}>{view.rowsRead === 0 ? "Sin registros autorizados visibles en esta sesión" : `${view.reviewCount} de ${view.rowsRead} registros requieren revisión`}</p>
      <p className={styles.utilityNote}>Empresa Atrapasueños · Propiedad Dreamcatcher · {view.currencies.join(" + ") || "moneda no disponible"}</p>
      {view.items.length ? <ol>{view.items.map(item => <li key={item.id}><strong>{item.id}</strong> · {item.currency} · {item.periodMonth ?? "periodo sin fecha"} · {label(item.status)} · confianza {label(item.confidence)}</li>)}</ol> : null}
      <details className={styles.subtleDisclosure}><summary>Fuente, corte y alcance</summary>
        <p>Fuente: finance.reconciliations, propiedad exacta. Consulta {view.readAt ? formatAttentionCut(view.readAt) : "sin hora"}; último cambio visible {view.latestUpdatedAt ? formatAttentionCut(view.latestUpdatedAt) : "sin fecha"}. {view.limitReached ? "Cobertura limitada a 100 filas; total desconocido." : "Lote visible completo; universo total no certificado."}</p>
      </details>
    </> : <p className={styles.emptyNote}>{view.state === "denied" ? "Tu perfil no tiene permiso financiero para esta propiedad." : view.state === "disabled" ? "La lectura financiera está desactivada." : "La revisión financiera no está disponible en esta consulta."}</p>}
    <p className={styles.panelNote}>No confirma saldo, banco, pago ni cierre contable; no permite escribir ni conciliar.</p>
  </section>;
}
