import { DataState } from "@/components/toro/data-state";

import type { RevenueDirectoryData, RevenueRateItem } from "./server";

function money(value: number | null, currency: string) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function RateRow({ row }: { row: RevenueRateItem }) {
  return (
    <tr className="border-t border-neutral-200 align-top">
      <td className="px-3 py-3 font-medium text-neutral-950">{row.agencyName}</td>
      <td className="px-3 py-3 text-neutral-700">#{row.roomNumber} · {row.roomName}</td>
      <td className="px-3 py-3 text-neutral-700">{row.seasonCode}</td>
      <td className="whitespace-nowrap px-3 py-3 text-neutral-600">{row.startsOn} → {row.endsOn}</td>
      <td className="px-3 py-3 text-neutral-700">{money(row.rackRate, row.currency)}</td>
      <td className="px-3 py-3 text-neutral-700">{percent(row.commissionRate)}</td>
      <td className="px-3 py-3 font-medium text-neutral-950">{money(row.hotelNetRate, row.currency)}</td>
      <td className="max-w-xs px-3 py-3 text-xs leading-5 text-neutral-600">
        {row.overrideActive ? <strong className="block text-amber-700">Override: {row.overrideReason ?? "Activo"}</strong> : null}
        {row.commercialConditions ?? "Sin condición adicional registrada."}
      </td>
    </tr>
  );
}

export function RevenueDirectory({ data }: { data: RevenueDirectoryData }) {
  if (data.kind === "forbidden") {
    return <DataState variant="forbidden" detail={data.detail} />;
  }
  if (data.kind === "error") {
    return <DataState variant="error" detail={data.detail} />;
  }

  return (
    <section className="space-y-5 pb-24 md:pb-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO Revenue · privado
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Revenue / Agencias
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-neutral-600">
          Consulta read-only de tarifas privadas desde Supabase. Kross conserva la autoridad transaccional;
          esta superficie no cambia precios, disponibilidad ni reservas.
        </p>
      </header>

      <form method="get" action="/toro/revenue" className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm text-neutral-700">
          Agencia
          <input name="agency" defaultValue={data.filters.agencyKey ?? ""} className="mt-1 min-h-11 w-full rounded-xl border border-neutral-300 px-3" placeholder="best_of_costa_rica" />
        </label>
        <label className="text-sm text-neutral-700">
          Habitación
          <input name="room" defaultValue={data.filters.roomNumber ?? ""} inputMode="numeric" className="mt-1 min-h-11 w-full rounded-xl border border-neutral-300 px-3" placeholder="25" />
        </label>
        <label className="text-sm text-neutral-700">
          Fecha
          <input name="date" defaultValue={data.filters.stayDate ?? ""} type="date" className="mt-1 min-h-11 w-full rounded-xl border border-neutral-300 px-3" />
        </label>
        <label className="text-sm text-neutral-700">
          Temporada
          <input name="season" defaultValue={data.filters.seasonCode ?? ""} className="mt-1 min-h-11 w-full rounded-xl border border-neutral-300 px-3" placeholder="GREEN" />
        </label>
        <div className="flex gap-2 md:col-span-4">
          <button type="submit" className="min-h-11 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white">
            Consultar
          </button>
          <a href="/toro/revenue" className="inline-flex min-h-11 items-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800">
            Limpiar
          </a>
        </div>
      </form>

      {!data.queried ? (
        <DataState variant="empty" detail="Usa al menos un filtro para consultar tarifas privadas." />
      ) : data.rows.length === 0 ? (
        <DataState variant="empty" detail="No hay una tarifa verificada que coincida con esos filtros." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3 text-sm text-neutral-600">
            {data.rows.length} resultado(s) · Fuente: {data.source}
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-3">Agencia</th>
                <th className="px-3 py-3">Habitación</th>
                <th className="px-3 py-3">Temporada</th>
                <th className="px-3 py-3">Vigencia</th>
                <th className="px-3 py-3">Rack</th>
                <th className="px-3 py-3">Comisión</th>
                <th className="px-3 py-3">Neto hotel</th>
                <th className="px-3 py-3">Condiciones</th>
              </tr>
            </thead>
            <tbody>{data.rows.map((row, index) => <RateRow key={`${row.agencyKey}-${row.roomNumber}-${row.seasonCode}-${row.startsOn}-${index}`} row={row} />)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
