import type { FinancialReconciliationCard, FinancialStageKey, FinancialStageState } from "@/features/finance/reconciliation-card";
import styles from "./portal.module.css";

const stageLabels: Record<FinancialStageKey, string> = {
  service: "Reserva / servicio", collection: "Cobro", document: "Documento", settlement: "Liquidación", bank: "Banco",
};
const stateLabels: Record<FinancialStageState, string> = {
  verified: "Verificado", reported: "Reportado", missing: "Sin evidencia", unknown: "Desconocido", conflict: "Revisar conflicto",
};

export function PortalFinancialReconciliationCard({ card }: { card: FinancialReconciliationCard }) {
  return <section className={styles.cashCurrency} aria-label={`Conciliación financiera ${card.caseId}`}>
    <h3>Seguimiento financiero</h3>
    <p className={styles.utilityNote}>Empresa {card.companyId} · {card.currency} · solo lectura</p>
    <ol>
      {card.stages.map(stage => <li key={stage.key}>
        <strong>{stageLabels[stage.key]}</strong>: {stateLabels[stage.state]}
        {stage.recordIds.length ? ` · ${stage.recordIds.length} evidencia${stage.recordIds.length === 1 ? "" : "s"}` : ""}
      </li>)}
    </ol>
    <p className={styles.utilityNote}>Estado: {card.closeState === "reconciled" ? "conciliado" : card.closeState === "reopened" ? "reabierto" : "pendiente"}. Un monto reportado no confirma banco ni saldo.</p>
  </section>;
}
