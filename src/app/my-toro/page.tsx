import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
  LogIn,
  UserRound,
} from "lucide-react";

import { MyToroCommandBar } from "@/features/menu/my-toro-command-bar";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";
import { canReadHotelDirectory } from "@/features/tools/directory";
import { loadHotelDirectory } from "@/features/tools/server";

const profileLabels: Record<string, string> = {
  owner_executive: "Dirección",
  manager: "Gerencia",
  reception: "Recepción",
  housekeeping: "Aseo",
  maintenance: "Mantenimiento",
  department_lead: "Líder de departamento",
  finance: "Finanzas",
  hr_people: "RRHH / People",
  growth: "Growth / Marketing",
  systems: "Sistemas",
  auditor: "Auditor",
  employee_general: "Empleado",
};

export default async function MyToroPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedFocus =
    typeof params.focus === "string" ? params.focus : null;
  const view = await resolveCurrentToroReadOnlyMenu(requestedFocus);

  if (!view) {
    return (
      <main className="min-h-screen bg-[#030712] px-5 py-10 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-800 bg-slate-950/80 p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">
            <LockKeyhole className="h-4 w-4" /> Acceso a tu cuenta
          </div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-white">
            Entra a TORO para ver tu experiencia.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Usa tu correo de trabajo. Al entrar verás las opciones que ya permite tu cuenta.
          </p>
          <Link
            href="/login?next=/my-toro"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950"
          >
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
            <UserRound className="h-4 w-4" /> Contexto
          </div>
          <h1 className="text-3xl font-black text-white">
            {view.preferredDisplayName}, necesito saber en qué negocio quieres entrar.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Tu cuenta tiene más de un contexto autorizado. TORO no elegirá uno automáticamente porque eso podría mezclar permisos o información.
          </p>
          <div className="mt-5 rounded-2xl border border-slate-800 bg-black/25 p-4 text-sm text-slate-300">
            Organizaciones disponibles: <strong>{view.context.availableOrgIds.length}</strong>
          </div>
        </div>
      </main>
    );
  }

  const membership = view.context.membership;
  const menu = view.menu;
  const roleLabel = menu ? profileLabels[menu.profileId] ?? "Mi equipo" : "Mi cuenta";
  const hotelAllowed = canReadHotelDirectory(view.context);
  const directory = hotelAllowed ? await loadHotelDirectory() : null;
  const hotelLinks = directory?.state === "ready" ? directory.links : [];
  const available = menu?.items.filter(item =>
    item.state === "READ_ONLY" && view.focusableCapabilities.includes(item.capability),
  ) ?? [];
  const alternatives = menu?.items.filter(item =>
    !available.includes(item) && view.capabilityAlternatives[item.capability],
  ) ?? [];
  const submenuParents = menu?.items.filter(item => view.availableSubmenus[item.key]?.items.length) ?? [];
  const pending = menu?.items.filter(item =>
    !available.includes(item) && !alternatives.includes(item) && !submenuParents.includes(item),
  ) ?? [];
  const quickInfo: Record<string, { system: string; detail: string }> = {
    "LINK-048": { system: "Kross", detail: "Llegadas, salidas y reservas" },
    "LINK-002": { system: "Motor de reservas", detail: "Fechas, precios y condiciones" },
    "LINK-178": { system: "WeSpeak", detail: "Conversaciones con huéspedes" },
    "LINK-086": { system: "DreamTeam", detail: "Entrar al portal del equipo" },
    "LINK-056": { system: "Google Calendar", detail: "Consultar la agenda" },
    "LINK-131": { system: "Dropbox", detail: "Archivos del hotel" },
  };
  const actionClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200";

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-5 md:px-8 md:py-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-cyan-200">Mi TORO{hotelAllowed ? " · Dreamcatcher" : ""}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">¿Qué necesitas hacer?</h1>
          </div>
          <a href="#mi-cuenta" className={actionClass + " border border-slate-700 text-slate-200"}>Mi cuenta ↓</a>
        </header>

        {hotelAllowed ? <section aria-labelledby="hotel-heading" className="mt-5 rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="hotel-heading" className="text-xl font-bold">🏨 Tu hotel, a mano</h2>
              <p className="mt-1 text-sm text-slate-300">Abre el sistema y sigue trabajando allí.</p>
            </div>
            <Link href="/my-toro/herramientas" className={actionClass + " bg-cyan-300 text-slate-950 hover:bg-cyan-200"}>Guía de mi turno <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {hotelLinks.length ? <>
            <nav aria-label="Herramientas del hotel" className="mt-4 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-3">
              {hotelLinks.map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className="group min-w-0 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 transition hover:border-cyan-300/60 hover:bg-cyan-950/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-white">{link.label}</span><span aria-label="abre otra pestaña" className="text-cyan-300">↗</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-300">{quickInfo[link.id]?.detail}</p>
                <p className="mt-2 text-xs text-cyan-200">{quickInfo[link.id]?.system}</p>
              </a>)}
            </nav>
            <p className="mt-3 text-xs leading-5 text-slate-400">Estos botones abren tus herramientas. Cada una puede pedir su propia sesión.</p>
          </> : <div role="status" className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
            <p className="font-semibold text-amber-100">{directory?.state === "denied" ? "Los accesos no están habilitados para esta sesión." : "La lista de accesos no está disponible ahora."}</p>
            <p className="mt-1 text-sm text-slate-300">Puedes abrir la guía del turno y volver a intentar cargar los accesos.</p>
          </div>}
        </section> : null}

        {view.focus ? <section aria-labelledby="focus-heading" className="mt-5 rounded-3xl border border-cyan-300/20 bg-slate-900/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs text-cyan-200">Consulta</p><h2 id="focus-heading" className="mt-1 text-xl font-bold">{view.focus.label}</h2></div>
            <Link href="/my-toro" className={actionClass + " border border-slate-700"}>Cerrar consulta</Link>
          </div>
          {view.focus.items.length ? <div className="mt-4 grid gap-3">
            {view.focus.items.map((item, index) => <article key={index} className="rounded-2xl border border-slate-700 p-4">
              <h3 className="font-semibold">{item.title}</h3>
              {item.meta ? <p className="mt-1 text-xs text-cyan-200">{item.meta}</p> : null}
              {item.detail ? <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p> : null}
            </article>)}
          </div> : <p className="mt-4 text-sm text-slate-300">No hay elementos visibles para tu cuenta en esta consulta.</p>}
        </section> : null}

        {available.length || alternatives.length || submenuParents.length ? <section aria-labelledby="available-heading" className="mt-6">
          <h2 id="available-heading" className="text-lg font-bold">También puedes abrir</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {available.map(item => <Link key={item.key} href={`/my-toro?focus=${encodeURIComponent(item.capability)}`}
              className="rounded-2xl border border-slate-700 p-4 hover:border-cyan-300/50 focus-visible:outline-2 focus-visible:outline-cyan-200">
              <span className="font-semibold">{item.emoji} {item.label} →</span>
              <p className="mt-1 text-xs leading-5 text-slate-300">Consultar información disponible para tu cuenta.</p>
            </Link>)}
            {alternatives.map(item => {
              const alternative = view.capabilityAlternatives[item.capability];
              return <a key={item.key} href={alternative.href} target={alternative.external ? "_blank" : undefined} rel={alternative.external ? "noopener noreferrer" : undefined}
                className="rounded-2xl border border-slate-700 p-4 hover:border-cyan-300/50 focus-visible:outline-2 focus-visible:outline-cyan-200">
                <span className="font-semibold">{item.emoji} {alternative.label} →</span>
                <p className="mt-1 text-xs leading-5 text-slate-300">{alternative.note}</p>
              </a>;
            })}
          </div>
          {menu ? <MyToroCommandBar menu={menu} focusableCapabilities={view.focusableCapabilities}
            currentFocus={view.focus?.capability ?? null} availableSubmenus={view.availableSubmenus}
            capabilityAlternatives={view.capabilityAlternatives} /> : null}
        </section> : null}

        <section className="mt-5 space-y-3" aria-label="Ayuda y opciones pendientes">
          <details className="rounded-2xl border border-slate-700 bg-slate-900/30 p-4">
            <summary className="min-h-11 cursor-pointer content-center font-semibold">Qué falta por conectar{pending.length ? ` · ${pending.length} opciones` : ""}</summary>
            <p className="mt-2 text-sm leading-6 text-slate-300">{hotelAllowed ? "Cobros y facturación siguen pendientes de validar. Para ocupación, pagos y habitaciones listas, consulta el sistema y confirma con el equipo." : "Aquí aparecerán las opciones cuando estén disponibles para tu cuenta."}</p>
            {pending.length ? <ul className="mt-3 flex flex-wrap gap-2">{pending.map(item => <li key={item.key} className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300">{item.emoji} {item.label} · pendiente</li>)}</ul> : null}
            {!menu ? <p className="mt-3 text-sm text-amber-100">Todavía no hay opciones asignadas a tu perfil de trabajo.</p> : null}
          </details>
          <details id="mi-cuenta" className="scroll-mt-4 rounded-2xl border border-slate-700 bg-slate-900/30 p-4">
            <summary className="min-h-11 cursor-pointer content-center font-semibold">Mi cuenta y ayuda para entrar</summary>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-400">Entraste con</dt><dd className="mt-1 break-all text-white">{view.context.email ?? view.preferredDisplayName}</dd></div>
              <div><dt className="text-slate-400">Tu perfil</dt><dd className="mt-1">{roleLabel}</dd></div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-slate-300">Ya tienes sesión en TORO. Si otra herramienta pide acceso, usa tu cuenta de ese servicio. Entrar aquí no inicia sesión automáticamente en las demás.</p>
            <Link href="/onboarding" className={actionClass + " mt-3 border border-slate-700 text-cyan-200"}>Revisar mi perfil</Link>
            {view.profileSummary.length ? <details className="mt-4 border-t border-slate-700 pt-3">
              <summary className="min-h-11 cursor-pointer content-center text-sm text-slate-300">Información de mi perfil</summary>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">{view.profileSummary.map(item => <div key={item.label}><dt className="text-xs text-slate-400">{item.label}</dt><dd className="mt-1 font-semibold">{item.value}</dd>{item.detail ? <dd className="mt-1 text-xs text-slate-400">{item.detail}</dd> : null}</div>)}</dl>
            </details> : null}
            <details className="mt-4 border-t border-slate-700 pt-3"><summary className="min-h-11 cursor-pointer content-center text-sm text-slate-300">Detalles de acceso</summary>
              <p className="mt-2 break-words text-sm text-slate-300">Puesto: {membership?.positionName ?? "Sin puesto vinculado"} · Roles: {membership?.roles.join(", ") || "Sin roles"}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Las opciones dependen de tu cuenta y del negocio. Esta pantalla no cambia permisos ni registra tareas como terminadas.</p>
            </details>
          </details>
        </section>
      </div>
    </main>
  );
}
