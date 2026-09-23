import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  LockKeyhole,
  LogIn,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { MyToroCommandBar } from "@/features/menu/my-toro-command-bar";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";

const profileLabels: Record<string, string> = {
  owner_executive: "Owner / Ejecutivo",
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

function statusLabel(state: string) {
  if (state === "READ_ONLY") return "Solo lectura";
  if (state === "BLOCKED") return "Por activar";
  return state;
}

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
            <LockKeyhole className="h-4 w-4" /> Contexto no resuelto
          </div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-white">
            Entra a TORO para ver tu experiencia.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Esta vista usa tu identidad y permisos reales. No muestra un menú genérico si no puede resolver tu sesión.
          </p>
          <Link
            href="/login"
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
  const roleLabel = menu ? profileLabels[menu.profileId] ?? menu.profileId : "Contexto general";

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <header className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/80 p-5 shadow-2xl md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                  <Brain className="h-4 w-4" /> Mi TORO
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
                  <ShieldCheck className="h-4 w-4" /> contexto real · solo lectura
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
                {view.preferredDisplayName}, esto es lo más útil para tu contexto.
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-400 md:text-base">
                TORO resolvió tu experiencia desde tu sesión, roles y puesto. Esta vista demuestra personalización real; las capacidades todavía no se consideran operativas hasta probar su fuente y permiso.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-black/25 px-4 py-3 text-sm">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Experiencia</div>
              <div className="mt-1 font-semibold text-white">{roleLabel}</div>
              <div className="mt-1 text-xs text-slate-500">
                {membership?.positionName ?? membership?.positionCode ?? "Puesto no vinculado"}
              </div>
              <Link
                href="/onboarding"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Rehacer onboarding
              </Link>
            </div>
          </div>
        </header>

        {menu?.items.length ? (
          <MyToroCommandBar
            menu={menu}
            focusableCapabilities={view.focusableCapabilities}
            currentFocus={view.focus?.capability ?? null}
            availableSubmenus={view.availableSubmenus}
            capabilityAlternatives={view.capabilityAlternatives}
          />
        ) : null}

        {view.profileSummary.length ? (
          <section className="mt-5 grid gap-3 md:grid-cols-3" aria-label="Resumen del contexto actual">
            {view.profileSummary.map((item) => (
              <article
                key={item.label}
                className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </div>
                <div className="mt-2 font-mono text-3xl font-bold text-white">{item.value}</div>
                {item.detail ? (
                  <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}

        {view.focus ? (
          <section className="mt-5 rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                  Focus · solo lectura
                </div>
                <h2 className="mt-1 text-2xl font-black text-white">{view.focus.label}</h2>
              </div>
              <Link
                href="/my-toro"
                className="inline-flex items-center gap-2 self-start rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-300/30 hover:text-white"
              >
                Volver a Mi TORO
              </Link>
            </div>

            {view.focus.items.length ? (
              <div className="mt-5 grid gap-3">
                {view.focus.items.map((item, index) => (
                  <article
                    key={`${item.title}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-black/25 p-4"
                  >
                    <div className="font-semibold text-white">{item.title}</div>
                    {item.meta ? (
                      <div className="mt-1 text-xs font-medium text-cyan-200/80">{item.meta}</div>
                    ) : null}
                    {item.detail ? (
                      <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                No hay elementos visibles en este contexto autorizado.
              </p>
            )}
          </section>
        ) : null}

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tu menú</div>
                <h2 className="mt-1 text-2xl font-black text-white">Lo que probablemente necesitas más</h2>
              </div>
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>

            {menu?.items.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {menu.items.map((item) => {
                  const focusable =
                    item.state === "READ_ONLY" &&
                    view.focusableCapabilities.includes(item.capability);
                  const card = (
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white">{item.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">
                          {view.capabilityNotes[item.capability] ??
                            (focusable
                              ? "Toca para consultar"
                              : "Todavía no disponible")}
                        </div>
                      </div>
                      <span
                        className={[
                          "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
                          item.state === "READ_ONLY"
                            ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                            : "border-slate-600 bg-slate-800/70 text-slate-300",
                        ].join(" ")}
                      >
                        {statusLabel(item.state)}
                      </span>
                    </div>
                  );

                  return focusable ? (
                    <Link
                      key={item.key}
                      href={`/my-toro?focus=${encodeURIComponent(item.capability)}`}
                      className="rounded-2xl border border-slate-800 bg-black/25 p-4 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.05]"
                    >
                      {card}
                    </Link>
                  ) : (
                    <article
                      key={item.key}
                      className="rounded-2xl border border-slate-800 bg-black/25 p-4"
                    >
                      {card}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-sm text-amber-100/80">
                TORO resolvió tu contexto, pero todavía no hay un perfil de menú seguro para esta combinación de rol/puesto.
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm leading-6 text-slate-300">
              <strong className="text-white">Siguiente etapa:</strong> conectar estas opciones a sus lecturas reales una por una. Una opción no pasa a “lista” por estar visible; necesita fuente, permiso y evidencia runtime.
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contexto resuelto</div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3 border-b border-slate-800 pb-3">
                  <span className="text-slate-500">Puesto</span>
                  <strong className="text-right text-white">{membership?.positionName ?? "No vinculado"}</strong>
                </div>
                <div className="flex justify-between gap-3 border-b border-slate-800 pb-3">
                  <span className="text-slate-500">Código</span>
                  <strong className="text-right font-mono text-cyan-200">{membership?.positionCode ?? "—"}</strong>
                </div>
                <div className="flex justify-between gap-3 border-b border-slate-800 pb-3">
                  <span className="text-slate-500">Roles</span>
                  <strong className="text-right text-white">{membership?.roles.join(", ") || "—"}</strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Perfil menú</span>
                  <strong className="text-right text-white">{roleLabel}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Qué puede leer TORO ahora</div>
              {view.sourceReadiness?.readyReads.length ? (
                <div className="mt-4 space-y-2">
                  {view.sourceReadiness.readyReads.slice(0, 5).map((label) => (
                    <div key={label} className="flex items-center gap-2 text-sm text-emerald-100">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                      {label}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Todavía no hay una lectura de este menú promovida por evidencia de fuente.
                </p>
              )}

              {view.sourceReadiness?.blockedReads.length ? (
                <div className="mt-5 border-t border-slate-800 pt-4">
                  <div className="text-xs font-semibold text-slate-500">Todavía falta una fuente actual</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {view.sourceReadiness.blockedReads.slice(0, 5).map((label) => (
                      <span key={label} className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/[0.06] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <CheckCircle2 className="h-4 w-4" /> Probar conversación
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                El Experience Lab usa el mismo resolver para números, palabras y frases naturales, pero con respuestas sintéticas.
              </p>
              <Link
                href="/experience-lab"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-white"
              >
                Abrir Experience Lab <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
