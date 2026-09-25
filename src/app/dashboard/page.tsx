import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CircleDollarSign,
  LockKeyhole,
  LogIn,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { resolveDashboardSections } from "@/features/dashboard/sections";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";

function stateTone(state: string) {
  return state === "READ_ONLY"
    ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
    : state === "READY"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : "border-slate-700 bg-slate-900 text-slate-300";
}

export default async function DashboardPage() {
  const view = await resolveCurrentToroReadOnlyMenu();

  if (!view) {
    return (
      <main className="min-h-screen bg-[#030712] px-5 py-10 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-800 bg-slate-950/80 p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">
            <LockKeyhole className="h-4 w-4" /> Contexto no resuelto
          </div>
          <h1 className="text-3xl font-black text-white">Entra a TORO para ver tu Dashboard.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            El Dashboard usa tu identidad, organización y permisos reales. No muestra datos de otro negocio ni un menú genérico.
          </p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950">
            <LogIn className="h-4 w-4" /> Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  if (view.state === "context_choice_required") {
    return (
      <main className="min-h-screen bg-[#030712] px-5 py-10 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-cyan-300/15 bg-slate-950/80 p-7">
          <h1 className="text-3xl font-black text-white">
            {view.preferredDisplayName}, elige primero el negocio que quieres ver.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            TORO no mezcla organizaciones ni permisos automáticamente.
          </p>
        </div>
      </main>
    );
  }

  const profileId = view.menu?.profileId ?? null;
  const sections = resolveDashboardSections(profileId);
  const capabilityStates = new Map(
    (view.menu?.items ?? []).map((item) => [item.capability, item.state]),
  );
  const readyReads = view.sourceReadiness?.readyReads.length ?? 0;
  const blockedReads = view.sourceReadiness?.blockedReads.length ?? 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(14,165,233,0.16),transparent_30%),linear-gradient(180deg,#07101f,#030712)] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <header className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/80 p-5 shadow-2xl md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                <Brain className="h-4 w-4" /> TORO Dashboard
              </div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
                {view.preferredDisplayName}, esto requiere tu atención.
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-400 md:text-base">
                Una sola vista sobre el mismo TORO Brain. Lo urgente primero; la evidencia y el detalle aparecen al profundizar.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] px-4 py-3">
                <div className="text-slate-500">Lecturas listas</div>
                <div className="mt-1 font-mono text-2xl text-white">{readyReads}</div>
              </div>
              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3">
                <div className="text-slate-500">Por verificar</div>
                <div className="mt-1 font-mono text-2xl text-white">{blockedReads}</div>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Secciones TORO Dashboard">
            {sections.filter((section) => section.implemented).map((section) => (
              <Link key={section.key} href={section.href} className="whitespace-nowrap rounded-full border border-slate-700 bg-black/25 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-300/30 hover:text-white">
                {section.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-3" aria-label="Resumen de Hoy">
          {(view.profileSummary.length ? view.profileSummary : [
            { label: "Estado", value: "Listo", detail: "Contexto resuelto" },
            { label: "Fuentes", value: String(readyReads), detail: "lecturas disponibles" },
            { label: "Atención", value: String(blockedReads), detail: "lecturas por verificar" },
          ]).slice(0, 3).map((item) => (
            <article key={item.label} className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</div>
              <div className="mt-2 font-mono text-3xl font-bold text-white">{item.value}</div>
              {item.detail ? <div className="mt-1 text-xs text-slate-500">{item.detail}</div> : null}
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {sections.some((section) => section.key === "money") ? (
            <article id="money" className="rounded-[2rem] border border-emerald-300/15 bg-slate-950/75 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-emerald-300" />
                  <h2 className="text-2xl font-black text-white">Dinero</h2>
                </div>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-semibold uppercase text-amber-100">PayFlow</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Pagos P0, semana, forecast 90 días, comprobantes, conciliación y ahorro vivirán aquí. Google Calendar sigue siendo la proyección temporal, no la fuente de verdad.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["P0 pagos", "Esta semana", "90 días", "Caja", "Conciliación"].map((label) => (
                  <span key={label} className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">{label}</span>
                ))}
              </div>
            </article>
          ) : null}

          {sections.some((section) => section.key === "studio") ? (
            <article id="studio" className="rounded-[2rem] border border-fuchsia-300/15 bg-slate-950/75 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-fuchsia-300" />
                  <h2 className="text-2xl font-black text-white">Studio</h2>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase text-cyan-100">Pilot ready</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Campañas, drafts, assets, rights, approvals, publicación y performance. El piloto Dreamcatcher ya tiene brief y assets seguros para producción de borradores.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Campañas", "Drafts", "Assets", "QA", "Approvals", "Performance"].map((label) => (
                  <span key={label} className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">{label}</span>
                ))}
              </div>
            </article>
          ) : null}
        </section>

        <section className="mt-5 rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5 md:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-black text-white">Tus capacidades actuales</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(view.menu?.items ?? []).slice(0, 9).map((item) => (
              <article key={item.key} className="rounded-2xl border border-slate-800 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{item.emoji} {item.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{view.capabilityNotes[item.capability] ?? item.capability}</div>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase ${stateTone(capabilityStates.get(item.capability) ?? item.state)}`}>
                    {item.state}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-5 flex flex-wrap gap-3 text-xs">
          <Link href="/my-toro" className="inline-flex items-center gap-1.5 text-cyan-200 hover:text-white">
            Mi TORO <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/brain" className="inline-flex items-center gap-1.5 text-cyan-200 hover:text-white">
            Ver Brain <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {sections.some((section) => section.key === "systems") ? (
            <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> Sistemas / cockpit técnico
            </Link>
          ) : null}
        </footer>
      </div>
    </main>
  );
}
