import type { ConnectorHealthRecord } from "@/lib/toro-types";

import type { SystemsHealthData } from "./types";

const labels: Record<ConnectorHealthRecord["health"], string> = {
  reachable: "Conectado ahora",
  configured_unverified: "Configurado · sin prueba runtime",
  degraded: "Degradado",
  unconfigured: "No configurado",
  blocked: "Bloqueado",
};

export function SystemsHealthView({ data }: { data: SystemsHealthData }) {
  const { connectorHealth, krossFabric } = data;

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO OS · Salud de fuentes
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Sistemas</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
          Estado runtime observado. “Configurado” no significa “conectado”: TORO solo marca conectado cuando una prueba activa respondió.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Resumen de conectores">
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Conectados ahora</p><p className="mt-1 text-2xl font-semibold">{connectorHealth.summary.live}</p></div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Configurados</p><p className="mt-1 text-2xl font-semibold">{connectorHealth.summary.configured}</p></div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Degradados</p><p className="mt-1 text-2xl font-semibold">{connectorHealth.summary.degraded}</p></div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Bloqueados</p><p className="mt-1 text-2xl font-semibold">{connectorHealth.summary.blocked}</p></div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm" aria-labelledby="kross-fabric-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Feed operacional
            </p>
            <h2 id="kross-fabric-heading" className="mt-1 text-lg font-semibold text-neutral-950">
              Kross Data Fabric
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">
              {krossFabric.detail}
            </p>
          </div>
          <span className="w-fit rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
            {krossFabric.status === "verified" ? "Feed verificable" : "Feed no verificado"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Fuentes registradas</p>
            <p className="mt-1 text-xl font-semibold">{krossFabric.registeredSources}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Live requerido</p>
            <p className="mt-1 text-sm font-semibold">{krossFabric.liveRequiredSources} requieren live</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Fecha de fuente</p>
            <p className="mt-1 text-sm font-semibold">{krossFabric.sourcesWithSourceAsOf} con source_as_of</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Safe current</p>
            <p className="mt-1 text-sm font-semibold">{krossFabric.safeForCurrentState} marcadas seguras</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Current reservations</p>
            <p className="mt-1 text-sm font-semibold">{krossFabric.currentReservationRows} filas seguras visibles</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          Última observación del registro: {krossFabric.latestObservedAt ?? "sin evidencia"}
        </p>

        <div className="mt-4 grid gap-2">
          {krossFabric.sources.map((source) => (
            <div key={`${source.name}:${source.kind}`} className="rounded-xl border border-neutral-200 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{source.name}</p>
                  <p className="text-xs text-neutral-500">{source.kind}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                  {source.safeForCurrentState ? "Segura para estado actual" : "No segura para estado actual"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                <span>Filas: {source.rowCount}</span>
                <span>Frescura: {source.freshness}</span>
                <span>Live requerido: {source.liveRequired ? "sí" : "no"}</span>
                <span>source_as_of: {source.sourceAsOf ?? "sin fecha"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {connectorHealth.records.map((record) => (
          <article key={record.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-neutral-950">{record.name}</h2>
                <p className="mt-1 text-xs text-neutral-500">{record.mode}</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                {labels[record.health]}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-700">{record.detail}</p>
            <dl className="mt-3 grid gap-1 text-xs text-neutral-500">
              <div className="flex gap-1"><dt className="font-medium">Configurado:</dt><dd>{record.configured ? "sí" : "no"}</dd></div>
              <div className="flex gap-1"><dt className="font-medium">Live:</dt><dd>{record.live ? "sí" : "no"}</dd></div>
              <div className="flex gap-1"><dt className="font-medium">Última prueba:</dt><dd>{record.checkedAt ?? "sin prueba runtime"}</dd></div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
