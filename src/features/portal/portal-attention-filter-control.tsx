"use client";
import { useId, useState, type ReactNode } from "react";
import { ALL_ATTENTION, UNKNOWN_ATTENTION, filterAttentionEntries, type AttentionFilterMeta } from "./portal-attention-filter";
import styles from "./portal.module.css";
type Entry = AttentionFilterMeta & { content: ReactNode };
export function PortalAttentionFilter({ entries }: { entries: Entry[] }) {
  const id = useId();
  const [currency, setCurrency] = useState(ALL_ATTENTION);
  const [month, setMonth] = useState(ALL_ATTENTION);
  const currencies = [...new Set(entries.flatMap(entry => entry.currency ? [entry.currency] : []))].sort();
  const months = [...new Set(entries.flatMap(entry => entry.month ? [entry.month] : []))].sort().reverse();
  // Retain an explicit selection when a refresh removes its last visible match.
  if (currency !== ALL_ATTENTION && currency !== UNKNOWN_ATTENTION && !currencies.includes(currency)) currencies.push(currency);
  if (month !== ALL_ATTENTION && month !== UNKNOWN_ATTENTION && !months.includes(month)) months.push(month);
  const selected = filterAttentionEntries(entries, currency, month);
  return <>
    <div className={styles.utilityActions} role="group" aria-label="Filtrar esta vista financiera">
      <label className={styles.utilityField} htmlFor={id+"-currency"}><span>Moneda registrada</span>
        <select id={id+"-currency"} value={currency} onChange={event=>setCurrency(event.target.value)}>
          <option value={ALL_ATTENTION}>Todas · sin sumar</option>
          {currencies.map(value=><option key={value} value={value}>{value}</option>)}
          <option value={UNKNOWN_ATTENTION}>Sin moneda comprobada</option>
        </select>
      </label>
      <label className={styles.utilityField} htmlFor={id+"-month"}><span>Mes de la fecha registrada</span>
        <select id={id+"-month"} value={month} onChange={event=>setMonth(event.target.value)}>
          <option value={ALL_ATTENTION}>Todos los meses</option>
          {months.map(value=><option key={value} value={value}>{value}</option>)}
          <option value={UNKNOWN_ATTENTION}>Sin fecha comprobada</option>
        </select>
      </label>
      <button type="button" className={styles.utilityButton} disabled={currency===ALL_ATTENTION && month===ALL_ATTENTION}
        onClick={()=>{setCurrency(ALL_ATTENTION);setMonth(ALL_ATTENTION);}}>Limpiar filtros</button>
    </div>
    <p className={styles.utilityNote}>Filtro sobre {entries.length} registros de esta vista. Mes de vencimiento o seguimiento; no es período contable.</p>
    <p role="status" className={styles.utilityNote}>{selected.length} coincidencias en esta vista; no confirma ausencia de otros pendientes.</p>
    <div className={styles.pendingList}>{selected.map((entry,index)=><div key={index}>{entry.content}</div>)}</div>
  </>;
}
