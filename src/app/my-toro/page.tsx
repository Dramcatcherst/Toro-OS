import Link from "next/link";
import { Suspense } from "react";

import { canViewOwnerAttention } from "@/features/attention/owner-attention";
import { OwnerAttentionPanel } from "@/features/attention/owner-attention-panel";
import {
  ArrowRight,
  LockKeyhole,
  LogIn,
  UserRound,
} from "lucide-react";

import { MyToroCommandBar } from "@/features/menu/my-toro-command-bar";
import { PortalHeader } from "@/features/portal/portal-header";
import { hasPortalOrganizationContext } from "@/features/portal/model";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";
import { canReadHotelDirectory } from "@/features/tools/directory";
import { loadHotelDirectory } from "@/features/tools/server";
import styles from "./my-toro.module.css";

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
    "LINK-086": { system: "DreamTeam · TORO People", detail: "Equipo · sesión propia" },
    "LINK-056": { system: "Google Calendar", detail: "Consultar la agenda" },
    "LINK-131": { system: "Dropbox", detail: "Archivos del hotel" },
  };
  const actionClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200";

  return (
    <>
    {hasPortalOrganizationContext(view.context) ? <PortalHeader current="my-toro" scopeLabel={hotelAllowed ? "Dreamcatcher" : "Organización activa"} /> : null}
    <main className="min-h-screen bg-[#0d1728] text-slate-100">
      <div className={styles.content}>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Portal TORO · Espacio personal</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Mi TORO</h1>
            <p className="mt-2 text-sm text-slate-300">Tu trabajo, tus prioridades y tus accesos en el mismo Portal.</p>
          </div>
          <a href="#mi-cuenta" className={actionClass + " border border-slate-700 text-slate-200"}>Mi cuenta ↓</a>
        </header>

        <nav aria-label="Accesos de Mi TORO" className={styles.jump}>
          {menu ? <a href="#available-heading">Buscar y proyectos</a> : null}
          {canViewOwnerAttention(view.context) ? <a href="#owner-attention-heading">Hoy y Finance</a> : null}
          {hotelAllowed ? <a href="#hotel-heading">Equipo y herramientas</a> : null}
        </nav>
        <div className={styles.layout}>
          <div className={styles.primary}>
        {available.length || alternatives.length || submenuParents.length ? <section aria-labelledby="available-heading" className={styles.panel}>
          <h2 id="available-heading" tabIndex={-1} className="text-lg font-bold">Buscar y consultas</h2>
          <div className={styles.menu}>
            {available.map(item => <Link key={item.key} href={`/my-toro?focus=${encodeURIComponent(item.capability)}`}
              className="rounded-2xl border border-slate-700 p-4 hover:border-cyan-300/50 focus-visible:outline-2 focus-visible:outline-cyan-200">
              <span className="font-semibold">{item.label} →</span>
              <p className="mt-1 text-xs leading-5 text-slate-300">Consultar información disponible para tu cuenta.</p>
            </Link>)}
            {alternatives.map(item => {
              const alternative = view.capabilityAlternatives[item.capability];
              return <a key={item.key} href={alternative.href} target={alternative.external ? "_blank" : undefined} rel={alternative.external ? "noopener noreferrer" : undefined}
                className="rounded-2xl border border-slate-700 p-4 hover:border-cyan-300/50 focus-visible:outline-2 focus-visible:outline-cyan-200">
                <span className="font-semibold">{alternative.label} →</span>
                <p className="mt-1 text-xs leading-5 text-slate-300">{alternative.note}</p>
              </a>;
            })}
          </div>
          {menu ? <MyToroCommandBar menu={menu} focusableCapabilities={view.focusableCapabilities}
            currentFocus={view.focus?.capability ?? null} availableSubmenus={view.availableSubmenus}
            capabilityAlternatives={view.capabilityAlternatives} /> : null}
        </section> : null}

        {view.focus ? <section aria-labelledby="focus-heading" className={styles.panel}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs text-cyan-200">Consulta</p><h2 id="focus-heading" tabIndex={-1} className="mt-1 text-xl font-bold">{view.focus.label}</h2></div>
            <Link href="/my-toro#available-heading" prefetch={false} className={actionClass + " border border-slate-700"}>Volver al menú</Link>
          </div>
          {view.focus.coverage ? <p role="status" className="mt-3 text-sm text-slate-300">{view.focus.coverage}</p> : null}
          {view.focus.items.length ? <div className={styles.projectGrid}>
            {view.focus.items.map((item, index) => <article key={index} className={styles.project}>
              <h3 className="font-semibold">{item.title}</h3>
              {item.meta ? <p className="mt-1 text-xs text-cyan-200">{item.meta}</p> : null}
              {item.detail ? <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p> : null}
              {item.evidence ? <details className={styles.evidence}>
                <summary className="min-h-11 cursor-pointer content-center font-semibold focus-visible:outline-2 focus-visible:outline-cyan-200">Evidencia permitida · {item.title}</summary>
                <dl className={styles.fields}>
                  <div><dt>Fuente autorizada</dt><dd>{item.evidence.source}</dd></div>
                  <div><dt>Origen declarado por el registro</dt><dd>{item.evidence.reportedSource}</dd></div>
                  <div><dt>Actualización del registro</dt><dd>{item.evidence.observedAt}</dd></div>
                  <div><dt>Lectura del lote</dt><dd>{item.evidence.readAt}</dd></div>
                </dl>
                <p className="mt-3 text-xs leading-5 text-slate-400">Esta evidencia describe el registro autorizado. La fecha de lectura no certifica su vigencia ni abre documentos originales.</p>
              </details> : null}
            </article>)}
          </div> : <p className="mt-4 text-sm text-slate-300">No hay elementos visibles para tu cuenta en esta consulta.</p>}
        </section> : null}

        {canViewOwnerAttention(view.context) ? (
          <Suspense fallback={<p role="status" className="mt-5 text-sm text-slate-300">Cargando prioridades…</p>}>
            <OwnerAttentionPanel context={view.context} />
          </Suspense>
        ) : null}
          </div>
          <aside className={styles.sidebar} aria-label="Accesos y cuenta">

        {hotelAllowed ? <section aria-labelledby="hotel-heading" className={styles.panel}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="hotel-heading" className="text-xl font-semibold">Equipo y herramientas</h2>
              <p className="mt-1 text-sm text-slate-300">Accesos revisados para tu contexto.</p>
            </div>
            <Link href="/my-toro/herramientas" className={actionClass + " border border-[#5d7fa9] bg-[#25486f] text-slate-100 hover:bg-[#305784]"}>Guía de mi turno <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {hotelLinks.length ? <>
            <nav aria-label="Herramientas del hotel" className={styles.links}>
              {hotelLinks.map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className={styles.tool}>
                <div className="flex items-start justify-between gap-2">
                  <strong>{link.label}</strong><span aria-label="abre otra pestaña" className="text-cyan-300">↗</span>
                </div>
                <small>{quickInfo[link.id]?.detail}</small>
                <small>{quickInfo[link.id]?.system}</small>
              </a>)}
            </nav>
            <p className={styles.note}>Estos botones abren tus herramientas. Cada una puede pedir su propia sesión.</p>
          </> : <div role="status" className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
            <p className="font-semibold text-amber-100">{directory?.state === "denied" ? "Los accesos no están habilitados para esta sesión." : "La lista de accesos no está disponible ahora."}</p>
            <p className="mt-1 text-sm text-slate-300">Puedes abrir la guía del turno y volver a intentar cargar los accesos.</p>
          </div>}
        </section> : null}

        <section className="space-y-3" aria-label="Ayuda y opciones pendientes">
          <details className={styles.panel}>
            <summary className="min-h-11 cursor-pointer content-center font-semibold">Qué falta por conectar{pending.length ? ` · ${pending.length} opciones` : ""}</summary>
            <p className="mt-2 text-sm leading-6 text-slate-300">{hotelAllowed ? "Cobros y facturación siguen pendientes de validar. Para ocupación, pagos y habitaciones listas, consulta el sistema y confirma con el equipo." : "Aquí aparecerán las opciones cuando estén disponibles para tu cuenta."}</p>
            {pending.length ? <ul className="mt-3 flex flex-wrap gap-2">{pending.map(item => <li key={item.key} className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300">{item.label} · pendiente</li>)}</ul> : null}
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
          </aside>
        </div>
      </div>
    </main>
    </>
  );
}
