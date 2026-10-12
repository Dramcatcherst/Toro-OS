// Deliberately no external fetch, browser geolocation or personal calendar fallback.
// Only authorized hotel sessions mount this block. Verified adapters are pending.
export function DailyEnvironmentCard() {
  return (
    <section aria-labelledby="environment-heading" className="mt-5 rounded-3xl border border-slate-700 bg-slate-900/60 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="environment-heading" className="text-xl font-bold">Hoy en Santa Teresa</h2>
          <p className="mt-1 text-sm text-slate-300">Clima, mareas, luna y fechas especiales para preparar el día.</p>
        </div>
        <p role="status" className="rounded-full border border-amber-300/20 px-3 py-2 text-xs text-amber-100">Sin reporte diario verificado</p>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          ["Clima", "Pronóstico y avisos pendientes de conectar."],
          ["Mareas", "Horas de alta y baja pendientes de validar para esta playa."],
          ["Luna", "Fase y próximos cambios pendientes de conectar."],
          ["Fechas especiales", "Consulta la agenda para visitas, citas y celebraciones."],
        ].map(([label, detail]) => <div key={label} className="rounded-2xl border border-slate-700 p-4">
          <dt className="font-semibold">{label}</dt>
          <dd className="mt-1 text-sm leading-6 text-slate-300">{detail}</dd>
        </div>)}
      </dl>
      <details className="mt-4 border-t border-slate-700 pt-3">
        <summary className="min-h-11 cursor-pointer content-center font-semibold">Consultar fuentes y agenda</summary>
        <nav aria-label="Fuentes del reporte diario" className="mt-3 flex flex-wrap gap-3">
          {[
            ["Instituto Meteorológico Nacional", "https://www.imn.ac.cr/"],
            ["Mareas · MIO-CIMAR", "https://miocimar.ucr.ac.cr/mareas"],
            ["Agenda", "https://calendar.google.com/"],
          ].map(([label, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-700 px-4 py-3 text-sm text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">{label} ↗</a>)}
        </nav>
        <p className="mt-3 text-xs leading-5 text-slate-400">Hora local: Costa Rica. Las fuentes se abren aparte; no prueban actualización automática. Las mareas de otra estación no se muestran como locales. El operador confirma las condiciones antes de una actividad en el mar.</p>
      </details>
    </section>
  );
}
