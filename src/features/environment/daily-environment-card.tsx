import type { DailyEnvironmentView } from "./server";

// No geolocation or personal-calendar fallback. Parent mounts only after scoped auth.
export function DailyEnvironmentCard({ view }: { view?: DailyEnvironmentView | null }) {
  const weather = view?.weather;
  const dates = view?.dates;
  const moon = view?.moon;
  const lunarTime = (at: string) => new Intl.DateTimeFormat("es-CR", { timeZone: "America/Costa_Rica", dateStyle: "short", timeStyle: "short" }).format(new Date(at));
  const partial = weather?.state === "ready" || moon?.state === "ready" || Boolean(dates?.items.length);
  return (
    <section aria-labelledby="environment-heading" className="mt-5 rounded-3xl border border-slate-700 bg-slate-900/60 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="environment-heading" className="text-xl font-bold">Hoy en Santa Teresa</h2>
          <p className="mt-1 text-sm text-slate-300">Clima, mareas, luna y fechas especiales para preparar el día.</p>
        </div>
        <p role="status" className="rounded-full border border-amber-300/20 px-3 py-2 text-xs text-amber-100">{partial ? "Reporte parcial · Costa Rica" : "Sin reporte diario verificado"}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-700 p-4">
          <h3 className="font-semibold">Clima</h3>
          {weather?.state === "ready" ? <>
            <p className="mt-1 text-xs text-cyan-200">Pronóstico · {weather.validDate} · {weather.region}</p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">{weather.periods.map(period =>
              <li key={period.label}><strong>{period.label}:</strong> {period.summary}</li>)}</ul>
            <p className="mt-2 text-xs text-slate-400">Referencia regional; no es una medición en el hotel.</p>
          </> : <p className="mt-1 text-sm text-slate-300">{weather?.state === "stale" ? "El pronóstico consultado está vencido." : "No se pudo verificar el pronóstico vigente del IMN."}</p>}
        </article>
        <article className="rounded-2xl border border-slate-700 p-4">
          <h3 className="font-semibold">Mareas</h3>
          <p className="mt-1 text-sm text-slate-300">Horas de alta y baja pendientes de validar para esta playa.</p>
        </article>
        <article className="rounded-2xl border border-slate-700 p-4">
          <h3 className="font-semibold">Luna</h3>
          {moon?.state === "ready" ? <>
            <p className="mt-1 text-sm text-slate-300">Última fase principal: {moon.previous?.label} · {moon.previous ? lunarTime(moon.previous.at) : ""}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">{moon.next.map(phase =>
              <li key={phase.at}>{phase.label} · {lunarTime(phase.at)}</li>)}</ul>
            <p className="mt-2 text-xs text-slate-400">Próximas fases · horas de Costa Rica. No calcula salida, puesta ni iluminación.</p>
          </> : <p className="mt-1 text-sm text-slate-300">No se pudieron verificar las fases lunares vigentes.</p>}
        </article>
        <article className="rounded-2xl border border-slate-700 p-4">
          <h3 className="font-semibold">Fechas especiales</h3>
          <p className="mt-1 text-xs text-cyan-200">Hoy y próximos 30 días · registros canónicos</p>
          {dates?.state === "ready" ? dates.items.length ? <>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">{dates.items.slice(0, 12).map(item =>
              <li key={item.key}><strong>{item.date}{item.endDate !== item.date ? " – " + item.endDate : ""}</strong> · {item.label}
                <span className="block text-xs text-slate-400">{item.kind === "event" ? "Evento publicado y verificado" : "Fecha del calendario interno · efectos laborales por verificar"}</span>
              </li>)}</ul>
            {dates.items.length > 12 ? <p className="mt-2 text-xs text-slate-400">Se muestran las primeras 12 de {dates.items.length} fechas.</p> : null}
          </> : <p className="mt-2 text-sm text-slate-300">Estos registros no contienen fechas vigentes verificadas para este período.</p>
            : <p className="mt-2 text-sm text-slate-300">Los registros de fechas no están disponibles ahora.</p>}
          {dates?.truncated ? <p className="mt-2 text-xs text-amber-100">Consulta parcial: hay más registros por revisar.</p> : null}
          <p className="mt-2 text-xs text-slate-400">La ausencia de registros no confirma que no haya feriados o eventos. Visitas y citas siguen en la agenda.</p>
        </article>
      </div>
      <details className="mt-4 border-t border-slate-700 pt-3">
        <summary className="min-h-11 cursor-pointer content-center font-semibold">Consultar fuentes y agenda</summary>
        <nav aria-label="Fuentes del reporte diario" className="mt-3 flex flex-wrap gap-3">
          {[
            ["Instituto Meteorológico Nacional", weather?.sourceUrl ?? "https://www.imn.ac.cr/"],
            ["Mareas · MIO-CIMAR", "https://miocimar.ucr.ac.cr/mareas"],
            ["Luna · Observatorio Naval de EE. UU.", "https://aa.usno.navy.mil/data/MoonPhases"],
            ["Agenda", "https://calendar.google.com/"],
          ].map(([label, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-700 px-4 py-3 text-sm text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">{label} ↗</a>)}
        </nav>
        <p className="mt-3 text-xs leading-5 text-slate-400">Hora local: Costa Rica. Lectura al abrir el Portal; entrega diaria y alertas continuas pendientes de verificar. Las mareas de otra estación no se muestran como locales. El operador confirma las condiciones antes de una actividad en el mar.</p>
      </details>
    </section>
  );
}
