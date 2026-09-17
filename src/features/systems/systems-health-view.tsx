import type { ConnectorHealthRecord } from "@/lib/toro-types";

type SystemsHealthData = {
  records: ConnectorHealthRecord[];
  summary: { live: number; configured: number; blocked: number; degraded: number };
};

const labels: Record<ConnectorHealthRecord["health"], string> = {
  reachable: "Conectado ahora",
  configured_unverified: "Configurado · sin prueba runtime",
  degraded: "Degradado",
  unconfigured: "No configurado",
  blocked: "Bloqueado",
};

export function SystemsHealthView({ data }: { data: SystemsHealthData }) {
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
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Conectados ahora</p><p className="mt-1 text-2xl font-semibold">{data.summary.live}</p></div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Configurados</p><p className="mt-1 text-2xl font-semibold">{data.summary.configured}</p></div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Degradados</p><p className="mt-1 text-2xl font-semibold">{data.summary.degraded}</p></div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Bloqueados</p><p className="mt-1 text-2xl font-semibold">{data.summary.blocked}</p></div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {data.records.map((record) => (
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
