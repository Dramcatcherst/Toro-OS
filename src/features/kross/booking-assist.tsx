"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { parseBookingAssistPrefill } from "./booking-assist-prefill";
import { buildOfficialKrossSearchUrl } from "./public-search-link";

export function KrossBookingAssist() {
  const searchParams = useSearchParams();
  const initial = useMemo(
    () => parseBookingAssistPrefill(searchParams),
    [searchParams],
  );
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
    <main className="min-h-screen bg-[#030712] px-4 py-6 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/my-toro"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Mi TORO
        </Link>

        <section className="mt-5 rounded-[2rem] border border-cyan-300/15 bg-slate-950/80 p-5 shadow-2xl md:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
              <CalendarDays className="h-4 w-4" /> Buscar en Kross
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
              <ShieldCheck className="h-4 w-4" /> handoff oficial · sin writes
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
            Lleva la búsqueda lista al motor oficial.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            TORO prepara el enlace con fechas y ocupación. Kross sigue confirmando disponibilidad,
            tarifas, condiciones y la reserva final.
          </p>

          {(initial.from || initial.to) ? (
            <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3 text-sm leading-6 text-cyan-100/80">
              Llegaste con datos preparados desde TORO. Revisa lo necesario y abre la búsqueda oficial.
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-200">Llegada</span>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                required
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-200">Salida</span>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                required
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-200">Adultos</span>
              <input
                type="number"
                min={1}
                max={12}
                value={adults}
                onChange={(event) => setAdults(Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-700 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-200">Niños</span>
              <input
                type="number"
                min={0}
                max={6}
                value={children}
                onChange={(event) => setChildren(Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-700 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
              />
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold text-slate-200">Moneda</span>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as "USD" | "CRC")}
                className="w-full rounded-2xl border border-slate-700 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
              >
                <option value="USD">USD</option>
                <option value="CRC">CRC</option>
              </select>
            </label>

            {submitted && result.issues.length ? (
              <div className="md:col-span-2 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100/80">
                {result.issues.map((issue) => (
                  <div key={issue}>• {issue}</div>
                ))}
              </div>
            ) : null}

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200"
              >
                Abrir búsqueda oficial <ArrowUpRight className="h-4 w-4" />
              </button>
              <span className="text-xs leading-5 text-slate-500">
                Una habitación por búsqueda en esta primera versión. Para varias habitaciones, abre Kross y configura la distribución allí.
              </span>
            </div>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-black/25 p-4 text-xs leading-5 text-slate-500">
            Esta herramienta usa únicamente un patrón de URL público observado. No es una API ni un contrato del proveedor, no consulta ni interpreta resultados de Kross y no activa disponibilidad live ni reserva desde TORO.
          </div>
        </section>
      </div>
    </main>
  );
}
