"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { BookingAssistPrefill } from "./booking-assist-prefill";
import { buildOfficialKrossSearchUrl } from "./public-search-link";
import styles from "./booking-assist.module.css";

export function KrossBookingAssist({
  initial,
}: {
  initial: BookingAssistPrefill;
}) {
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [adults, setAdults] = useState(initial.adults);
  const [children, setChildren] = useState(initial.children);
  const [currency, setCurrency] = useState<"USD" | "CRC">(initial.currency);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () =>
      buildOfficialKrossSearchUrl({
        from,
        to,
        adults,
        children,
        currency,
        lang: "es",
      }),
    [from, to, adults, children, currency],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!result.url) return;
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className={styles.shell}>
      <div className={styles.container}>
        <Link
          href="/my-toro"
          className={styles.backLink}
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Mi TORO
        </Link>

        <section className={styles.panel}>
          <div className={styles.badges}>
            <span className={styles.badge}>
              <CalendarDays className="h-4 w-4" /> Buscar en Kross
            </span>
            <span className={styles.officialBadge}>
              <ShieldCheck className="h-4 w-4" /> En el motor oficial
            </span>
          </div>

          <h1 className={styles.heading}>
            Buscar una estancia
          </h1>
          <p className={styles.intro}>
            Prepara fechas y huéspedes. Kross confirma disponibilidad, tarifas y reserva.
          </p>

          {(initial.from || initial.to) ? (
            <div className={styles.prefill}>
              Llegaste con datos preparados desde TORO. Revisa lo necesario y abre la búsqueda oficial.
            </div>
          ) : null}

          <form onSubmit={submit} className={styles.form}>
            <label className={styles.label}>
              <span className={styles.labelCaption}>Llegada</span>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className={styles.field}
                required
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelCaption}>Salida</span>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className={styles.field}
                required
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelCaption}>Adultos</span>
              <input
                type="number"
                min={1}
                max={12}
                value={adults}
                onChange={(event) => setAdults(Number(event.target.value))}
                className={styles.field}
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelCaption}>Niños</span>
              <input
                type="number"
                min={0}
                max={6}
                value={children}
                onChange={(event) => setChildren(Number(event.target.value))}
                className={styles.field}
              />
            </label>

            <label className={styles.label + " " + styles.fullRow}>
              <span className={styles.labelCaption}>Moneda</span>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as "USD" | "CRC")}
                className={styles.field}
              >
                <option value="USD">USD</option>
                <option value="CRC">CRC</option>
              </select>
            </label>

            {submitted && result.issues.length ? (
              <div className={styles.issues}>
                {result.issues.map((issue) => (
                  <div key={issue}>• {issue}</div>
                ))}
              </div>
            ) : null}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.primaryAction}
              >
                Abrir búsqueda oficial <ArrowUpRight className="h-4 w-4" />
              </button>
              <span className={styles.actionNote}>
                Una habitación por búsqueda en esta primera versión. Para varias habitaciones, abre Kross y configura la distribución allí.
              </span>
            </div>
            {result.url ? (
              <div className={styles.fallback}>
                <span>Si no se abre una pestaña, usa este enlace.</span>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >Abrir búsqueda mediante enlace</a>
              </div>
            ) : null}
          </form>

          <details className={styles.limits}><summary>Cómo funciona</summary><p>
            Esta herramienta usa únicamente un patrón de URL público observado. No es una API ni un contrato del proveedor, no consulta ni interpreta resultados de Kross y no activa disponibilidad live ni reserva desde TORO.
          </p></details>
        </section>
      </div>
    </main>
  );
}
