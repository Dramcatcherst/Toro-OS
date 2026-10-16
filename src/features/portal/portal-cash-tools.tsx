"use client";

import { useId, useReducer, useRef, useState } from "react";
import {
  CASH_DENOMINATIONS, buildCashSummary, calculateCashExpression, cashDraftReducer,
  copyCashSummary, createCashDraft, formatCashMoney, getCashCount, parseQuantity,
  type CalculatorOperation, type CashCurrency,
} from "./cash-calculation";
import styles from "./portal.module.css";

const resultFormat = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 8 });

export function PortalCashTools() {
  const id = useId();
  const [draft, dispatch] = useReducer(cashDraftReducer, undefined, createCashDraft);
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [operation, setOperation] = useState<CalculatorOperation>("+");
  const [submitted, setSubmitted] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "manual">("idle");
  const copyVersion = useRef(0);
  const summary = buildCashSummary(draft);
  const calculation = calculateCashExpression(left, operation, right);

  function clearCopyFeedback() {
    copyVersion.current += 1;
    setCopyState("idle");
  }

  function reset() {
    dispatch({ type: "reset" });
    setLeft(""); setRight(""); setOperation("+"); setSubmitted(false);
    clearCopyFeedback();
  }

  async function copy() {
    if (!summary) return;
    const version = ++copyVersion.current;
    setCopyState("copying");
    try {
      const writer = typeof navigator !== "undefined" && navigator.clipboard?.writeText
        ? navigator.clipboard.writeText.bind(navigator.clipboard) : undefined;
      const result = await copyCashSummary(summary, writer);
      if (version === copyVersion.current) setCopyState(result);
    } catch {
      if (version === copyVersion.current) setCopyState("manual");
    }
  }

  function denominationInputs(currency: CashCurrency, kind: "bill" | "coin") {
    return CASH_DENOMINATIONS[currency].filter(item => item.kind === kind).map(item => {
      const raw = draft.quantities[item.id] ?? "";
      const label = formatCashMoney(item.minor, currency);
      return <label key={item.id} className={styles.utilityField}>
        <span>{label}</span>
        <input type="number" inputMode="numeric" min={0} max={9999} step={1}
          aria-label={`Cantidad de ${kind === "bill" ? "billetes" : "monedas"} ${currency} de ${label}`}
          aria-invalid={parseQuantity(raw) === null}
          aria-describedby={`${id}-${currency}-error`} value={raw} placeholder="0"
          onChange={event => { dispatch({ type: "quantity", id: item.id, value: event.target.value }); clearCopyFeedback(); }} />
      </label>;
    });
  }

  return <div>
    <p className={styles.utilityNote}>Conteo local: colones y dólares separados. No guarda datos ni registra un pago o cierre.</p>
    <div className={styles.cashGrid}>
      {(["CRC", "USD"] as const).map(currency => {
        const count = getCashCount(currency, draft);
        return <section className={styles.cashCurrency} key={currency} aria-labelledby={`${id}-${currency}-heading`}>
          <h3 id={`${id}-${currency}-heading`}>{currency === "CRC" ? "CRC · Colones" : "USD · Dólares"}</h3>
          <p className={styles.utilityNote}>Billetes · cantidad por denominación</p>
          <div className={styles.cashDenominations}>{denominationInputs(currency, "bill")}</div>
          <details>
            <summary>Monedas</summary>
            <div className={styles.cashDenominations}>{denominationInputs(currency, "coin")}</div>
          </details>
          <div className={styles.cashTotal}>
            <span>Contado</span><output aria-label={`Total contado ${currency}`}>{count.totalMinor === null ? "Revisar cantidades" : formatCashMoney(count.totalMinor, currency)}</output>
          </div>
          <label className={styles.utilityField} htmlFor={`${id}-${currency}-expected`}>
            <span>Esperado · opcional</span>
            <input id={`${id}-${currency}-expected`} type="text" inputMode="decimal" maxLength={12}
              aria-label={`Monto esperado ${currency}`} aria-invalid={Boolean(count.error && count.totalMinor !== null)}
              aria-describedby={`${id}-${currency}-error ${id}-amount-format`}
              value={draft.expected[currency]} placeholder="Sin indicar"
              onChange={event => { dispatch({ type: "expected", currency, value: event.target.value }); clearCopyFeedback(); }} />
          </label>
          <div className={styles.cashTotal}>
            <span>Diferencia</span><output aria-label={`Diferencia ${currency}`}>{count.differenceMinor === null ? "—" : `${count.differenceMinor > 0 ? "+" : ""}${formatCashMoney(count.differenceMinor, currency)}`}</output>
          </div>
          <p id={`${id}-${currency}-error`} className={styles.utilityNote} role="status">{count.error ?? ""}</p>
        </section>;
      })}
    </div>
    <p className={styles.utilityNote} id={`${id}-amount-format`}>Montos sin separadores de miles; punto o coma para decimales. Diferencia = contado − esperado. Sin conversión.</p>
    <p className={styles.utilityNote}>CRC: cuenta únicamente billetes y monedas vigentes. <a href="https://www.bccr.fi.cr/cr/es/billetes-y-monedas.html" target="_blank" rel="noopener noreferrer">Consultar BCCR</a></p>
    <div className={styles.utilityActions}>
      <button type="button" className={styles.utilityButton} disabled={!summary || copyState === "copying"} onClick={copy}>{copyState === "copying" ? "Copiando…" : "Copiar resumen"}</button>
      <button type="button" className={styles.utilityButton} onClick={reset}>Reiniciar</button>
    </div>
    <p className={styles.utilityNote} role="status" aria-live="polite">
      {copyState === "copied" ? "Resumen copiado al portapapeles." : copyState === "manual" ? "No se pudo copiar automáticamente. Selecciona el resumen y usa Copiar en tu dispositivo." : "Reiniciar borra únicamente este conteo y la calculadora de la pantalla."}
    </p>
    <details open={copyState === "manual"}>
      <summary>Ver resumen y copiar manualmente</summary>
      <label className={styles.utilityField}><span>Resumen</span>
        <textarea aria-label="Resumen de efectivo para copiar manualmente" readOnly rows={5}
          value={summary ?? "Corrige los campos señalados para preparar el resumen."} onFocus={event => event.currentTarget.select()} />
      </label>
    </details>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(true); }}>
      <h3>Calculadora</h3>
      <div className={styles.calcGrid}>
        <label className={styles.utilityField}><span>Primer número</span><input type="text" inputMode="decimal" maxLength={17} value={left} placeholder="0" onChange={event => { setLeft(event.target.value); setSubmitted(false); }} /></label>
        <label className={styles.utilityField}><span>Operación</span><select value={operation} onChange={event => { setOperation(event.target.value as CalculatorOperation); setSubmitted(false); }}><option value="+">+ Sumar</option><option value="-">− Restar</option><option value="*">× Multiplicar</option><option value="/">÷ Dividir</option></select></label>
        <label className={styles.utilityField}><span>Segundo número</span><input type="text" inputMode="decimal" maxLength={17} value={right} placeholder="0" onChange={event => { setRight(event.target.value); setSubmitted(false); }} /></label>
        <button className={styles.utilityButton} type="submit">Calcular</button>
      </div>
      <p className={styles.utilityNote}>Hasta 9 dígitos y 6 decimales por número; resultado redondeado a 8 decimales.</p>
      <div className={styles.cashTotal}><span>Resultado</span><output aria-label="Resultado de la calculadora" aria-live="polite">{submitted ? calculation.error ?? resultFormat.format(calculation.value!) : "—"}</output></div>
    </form>
  </div>;
}
