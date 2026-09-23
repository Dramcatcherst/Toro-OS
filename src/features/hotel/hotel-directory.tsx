import Link from "next/link";

import { DataState } from "@/components/toro/data-state";

import type { HotelDirectoryData } from "./types";

type HotelDirectoryProps = {
  data: HotelDirectoryData;
};

export function HotelDirectory({ data }: HotelDirectoryProps) {
  const operational = data.operational;

  return (
    <div className="space-y-4 pb-24 md:space-y-6 md:pb-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO OS · Operación hotelera
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Hotel</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
              Directorio read-only de habitaciones activas y su estado de verificación.
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            {data.source.latestAt
              ? `Fuente actualizada: ${data.source.latestAt}`
              : "Sin actualización disponible"}
          </p>
        </div>
      </header>

      <section aria-labelledby="kross-operational-heading" className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="kross-operational-heading" className="font-semibold text-neutral-950">Estado operativo Kross</h2>
            <p className="mt-1 text-sm text-neutral-700">{operational.label}</p>
          </div>
          {operational.sourceAsOf ? (
            <p className="text-xs text-neutral-500">Fuente: {operational.sourceAsOf}</p>
          ) : null}
        </div>

        {operational.metrics ? (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><p className="text-xs text-neutral-500">Ocupación</p><p className="font-semibold">{operational.metrics.occupancyPct}%</p></div>
            <div><p className="text-xs text-neutral-500">Llegadas</p><p className="font-semibold">{operational.metrics.arrivals}</p></div>
            <div><p className="text-xs text-neutral-500">Salidas</p><p className="font-semibold">{operational.metrics.departures}</p></div>
            <div><p className="text-xs text-neutral-500">En casa</p><p className="font-semibold">{operational.metrics.inHouse}</p></div>
            <div><p className="text-xs text-neutral-500">Disponibles</p><p className="font-semibold">{operational.metrics.availableRooms}</p></div>
            <div><p className="text-xs text-neutral-500">Ocupadas</p><p className="font-semibold">{operational.metrics.occupiedRooms}</p></div>
            <div><p className="text-xs text-neutral-500">Bloqueadas</p><p className="font-semibold">{operational.metrics.blockedRooms}</p></div>
            <div><p className="text-xs text-neutral-500">Reservas</p><p className="font-semibold">{operational.metrics.reservations}</p></div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Ocupación, llegadas, salidas y huéspedes en casa no se presentan como actuales hasta disponer de Kross autenticado o un snapshot reciente verificable con fecha de fuente.
          </p>
        )}

        {!operational.canClaimCurrent && operational.metrics ? (
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            Estos valores son referencia fechada; TORO no los etiqueta como estado actual.
          </p>
        ) : null}
      </section>

      {data.source.status === "stale" ? (
        <DataState
          variant="stale"
          source="Supabase · core.rooms"
          freshness={data.source.latestAt ?? "No disponible"}
          detail="La ficha operativa puede haber cambiado desde esta actualización. Confirma Room 360 antes de prometer detalles al huésped."
        />
      ) : null}

      {data.rooms.length === 0 ? (
        <DataState variant="empty" detail="No hay habitaciones activas disponibles para esta sesión." />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Habitaciones activas">
          {data.rooms.map((room) => (
            <article key={room.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Habitación {room.roomNumber}{room.roomType ? ` · ${room.roomType}` : ""}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-neutral-950">{room.title}</h2>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                  {room.verifiedStatus}
                </span>
              </div>

              <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Gate operativo</p>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-neutral-700">
                    {room.operationalGate.status}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-600">{room.operationalGate.reason}</p>
                {room.operationalGate.openTaskSummary ? (
                  <p className="mt-2 text-xs font-medium text-neutral-800">{room.operationalGate.openTaskSummary}</p>
                ) : null}
                <p className="mt-2 text-[11px] leading-4 text-neutral-500">
                  P0: {room.operationalGate.p0BlockerCount} · P1: {room.operationalGate.p1AttentionCount} · evidencia reciente: {room.operationalGate.recentUnresolvedEvidenceCount}
                </p>
              </div>

              <div className="mt-3 grid gap-1 text-sm text-neutral-600">
                {room.maxCapacity !== null ? <p>Capacidad: {room.maxCapacity}</p> : null}
                {room.kitchenType ? <p>Cocina: {room.kitchenType}</p> : null}
                {room.lastReviewed ? <p className="text-xs text-neutral-500">Revisada: {room.lastReviewed}</p> : null}
              </div>

              <Link
                href={`/toro/habitaciones/${room.room360Key}`}
                className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                Revisar ficha 360 · liberación humana
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
