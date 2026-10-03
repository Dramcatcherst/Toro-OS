import Link from "next/link";

import { loadLos50sEventOps } from "@/features/event-ops/los50s-server";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function routeLabel(value: string | null) {
  if (value === "direct") return "Directo";
  if (value === "manuel-antonio") return "Manuel Antonio";
  return "Por definir";
}

function ageLabel(value: string | null) {
  if (value === "adult") return "Adulto";
  if (value === "teen") return "13–18";
  if (value === "kid") return "5–12";
  if (value === "toddler") return "2–4";
  if (value === "baby") return "<2";
  return "—";
}

export default async function Los50sEventOpsPage() {
  const view = await loadLos50sEventOps();

  if (view.state === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#030712] p-6 text-slate-100">
        <div className="mx-auto max-w-3xl border border-amber-300/20 bg-slate-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-300">TORO Event Ops</p>
          <h1 className="mt-3 text-3xl font-black text-white">Authentication required</h1>
          <p className="mt-3 text-sm text-slate-400">This operational surface is private and requires an authenticated organization context.</p>
          <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-cyan-300">Ir a login</Link>
        </div>
      </main>
    );
  }

  if (view.state === "forbidden") {
    return (
      <main className="min-h-screen bg-[#030712] p-6 text-slate-100">
        <div className="mx-auto max-w-3xl border border-red-300/20 bg-slate-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-red-300">Access blocked</p>
          <h1 className="mt-3 text-3xl font-black text-white">Event Ops is restricted</h1>
          <p className="mt-3 text-sm text-slate-400">Current access is limited to ADMIN or GERENCIA organization roles.</p>
          <p className="mt-3 text-xs text-slate-600">Actor: {view.actor}</p>
        </div>
      </main>
    );
  }

  if (view.state === "unavailable") {
    return (
      <main className="min-h-screen bg-[#030712] p-6 text-slate-100">
        <div className="mx-auto max-w-3xl border border-amber-300/20 bg-slate-950/80 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-300">Fail closed</p>
          <h1 className="mt-3 text-3xl font-black text-white">Event Ops data unavailable</h1>
          <p className="mt-3 text-sm text-slate-400">{view.error}</p>
        </div>
      </main>
    );
  }

  const s = view.summary;
  const outstanding = Math.max(0, s.chargesUsd - s.creditsUsd);

  return (
    <main className="min-h-screen bg-[#030712] p-4 text-slate-100 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/modules" className="text-xs uppercase tracking-[0.18em] text-cyan-300">TORO / Event Ops</Link>
            <h1 className="mt-3 text-4xl font-black text-white">Los 50s de Caro</h1>
            <p className="mt-2 text-sm text-slate-400">Internal operations pilot · private data · Dreamcatcher scoped</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Actor: {view.actor}</div>
            <div>Event: los50s-caro-2026</div>
          </div>
        </div>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Inscripciones", s.registrations],
            ["Participantes", s.activeParticipants + s.provisionalParticipants],
            ["Líderes", s.leaders],
            ["Por definir", s.undecidedCount],
            ["Directo", s.directCount],
            ["Manuel Antonio", s.manuelAntonioCount],
            ["Habitaciones pendientes", s.roomAssignmentsPending],
            ["Tramos transporte", s.transportLegsPlanned],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-cyan-400/12 bg-slate-950/80 p-4">
              <div className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-black text-white">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            ["Cargos", money(s.chargesUsd)],
            ["Créditos / pagos", money(s.creditsUsd)],
            ["Saldo pendiente", money(outstanding)],
            ["Fondo común neto", money(s.groupFundInUsd - s.groupFundSpentUsd)],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-emerald-400/12 bg-emerald-950/20 p-4">
              <div className="text-xs uppercase tracking-[0.08em] text-emerald-300/70">{label}</div>
              <div className="mt-2 text-2xl font-black text-white">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-7 border border-cyan-400/12 bg-slate-950/80">
          <div className="border-b border-slate-800 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Participantes operativos</h2>
                <p className="mt-1 text-xs text-slate-500">Private ADMIN/GERENCIA view. Food, phone and accommodation data must not be copied to public surfaces.</p>
              </div>
              <span className="rounded-sm border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] uppercase text-cyan-100">Read only</span>
            </div>
          </div>

          <div className="divide-y divide-slate-900">
            {view.participants.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No operational participants yet.</div>
            ) : view.participants.map((person) => (
              <article key={person.ref} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_.8fr_1fr_1fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{person.name}</h3>
                    {person.leader && <span className="rounded-sm bg-amber-300/10 px-2 py-1 text-[10px] uppercase text-amber-200">Líder</span>}
                    {person.status === "provisional" && <span className="rounded-sm bg-fuchsia-300/10 px-2 py-1 text-[10px] uppercase text-fuchsia-200">Provisional</span>}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{person.role ?? "Participante"} · {ageLabel(person.ageBand)}</div>
                  <div className="mt-2 text-xs text-slate-400">{person.phone ?? "Sin teléfono propio"}</div>
                </div>

                <div className="text-xs">
                  <div className="text-slate-500">Ruta</div>
                  <div className="mt-1 font-semibold text-slate-200">{routeLabel(person.route)}</div>
                  <div className="mt-2 text-slate-500">Equipaje</div>
                  <div className="mt-1 text-slate-300">{person.luggageCount} pieza(s){person.specialLuggage ? ` · ${person.specialLuggage}` : ""}</div>
                </div>

                <div className="text-xs">
                  <div className="text-slate-500">Acomodación</div>
                  <div className="mt-1 text-slate-300">{person.usesBed ? (person.bedPreference ?? "Cama sin preferencia") : "Sin cama propia"}</div>
                  <div className="mt-1 text-slate-500">{person.accommodationPreference ?? "Sin preferencia adicional"}</div>
                </div>

                <div className="text-xs">
                  <div className="text-slate-500">Alimentación</div>
                  <div className="mt-1 text-slate-300">{person.foodPreference ?? "Sin preferencia"}</div>
                  {person.foodDislikes && <div className="mt-1 text-amber-200">No le gusta: {person.foodDislikes}</div>}
                  {person.allergies && <div className="mt-1 font-semibold text-red-300">Alerta: {person.allergies}</div>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="border border-slate-800 bg-black/25 p-4">
            <div className="text-xs uppercase text-slate-500">Habitaciones</div>
            <div className="mt-2 text-sm text-slate-200">{s.roomsConfirmed} confirmadas · {s.roomAssignmentsPending} pendientes</div>
          </div>
          <div className="border border-slate-800 bg-black/25 p-4">
            <div className="text-xs uppercase text-slate-500">Transporte</div>
            <div className="mt-2 text-sm text-slate-200">{s.transportLegsConfirmed} confirmados · {s.transportLegsPlanned} planificados</div>
          </div>
          <div className="border border-slate-800 bg-black/25 p-4">
            <div className="text-xs uppercase text-slate-500">Siguiente acción</div>
            <div className="mt-2 text-sm text-slate-200">Cerrar cotización 45/50 pax y luego asignar vehículos/habitaciones.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
