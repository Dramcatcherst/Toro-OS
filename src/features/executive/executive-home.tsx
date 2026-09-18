import Link from "next/link";

import { DataState } from "@/components/toro/data-state";

import type { ExecutiveHomeData } from "./types";

type ExecutiveHomeProps = {
  data: ExecutiveHomeData;
};

const sectionClass =
  "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5";

export function ExecutiveHome({ data }: ExecutiveHomeProps) {
  const visibleDecisions = data.decisions.slice(0, 5);

  return (
    <div className="space-y-4 pb-24 md:space-y-6 md:pb-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO OS · Executive Home
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Inicio</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
              Decisiones, excepciones y avances que realmente requieren tu atención.
            </p>
          </div>
          <p className="text-xs text-neutral-500" aria-label="Estado de sistemas">
            {data.systemHealth.label}
          </p>
        </div>
      </header>

      {data.systemHealth.status === "degraded" ? (
        <DataState
          variant="stale"
          source="Integraciones TORO"
          freshness={data.systemHealth.checkedAt ?? "Sin verificación reciente"}
          detail="Parte de la información puede estar atrasada. TORO la marca antes de que tomes decisiones con ella."
        />
      ) : null}

      <section className={sectionClass} aria-labelledby="decisions-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="decisions-heading" className="text-lg font-semibold text-neutral-950">
            Necesita mi decisión
          </h2>
          <Link
            href="/toro/decisiones"
            className="min-h-11 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            Ver todas las decisiones
          </Link>
        </div>

        {visibleDecisions.length === 0 ? (
          <DataState variant="empty" detail="No hay decisiones pendientes en este momento." />
        ) : (
          <div className="grid gap-3">
            {visibleDecisions.map((decision) => (
              <article
                key={decision.id}
                data-testid="executive-decision-card"
                className="rounded-xl border border-neutral-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {decision.urgency} · {decision.domain}
                    </p>
                    <h3 className="mt-1 font-semibold text-neutral-950">{decision.title}</h3>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                    {decision.status}
                  </span>
                </div>
                {decision.recommendation ? (
                  <p className="mt-3 text-sm leading-6 text-neutral-700">
                    <span className="font-medium">Recomendación:</span> {decision.recommendation}
                  </p>
                ) : null}
                {decision.rationale ? (
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{decision.rationale}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  {decision.owner ? <span>Responsable: {decision.owner}</span> : null}
                  {decision.deadline ? <span>Fecha límite: {decision.deadline}</span> : null}
                  {decision.evidence ? <span>Evidencia disponible</span> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={sectionClass} aria-labelledby="exceptions-heading">
        <h2 id="exceptions-heading" className="mb-4 text-lg font-semibold text-neutral-950">
          Qué está mal hoy
        </h2>
        {data.exceptions.length === 0 ? (
          <DataState variant="empty" detail="No hay excepciones conectadas para mostrar todavía." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.exceptions.map((item) => (
              <article key={item.id} className="rounded-xl border border-neutral-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{item.domain}</p>
                <h3 className="mt-1 font-medium text-neutral-950">{item.title}</h3>
                <p className="mt-2 text-xs text-neutral-500">
                  Fuente: {item.source}{item.freshness ? ` · ${item.freshness}` : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={sectionClass} aria-labelledby="delegated-heading">
        <h2 id="delegated-heading" className="mb-4 text-lg font-semibold text-neutral-950">
          Qué avanza sin mí
        </h2>
        {data.delegatedActions.length === 0 ? (
          <DataState variant="empty" detail="Las acciones delegadas aparecerán aquí cuando estén conectadas." />
        ) : (
          <div className="grid gap-3">
            {data.delegatedActions.slice(0, 7).map((action) => (
              <article key={action.id} className="rounded-xl border border-neutral-200 p-4">
                <h3 className="font-medium text-neutral-950">{action.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{action.owner} · {action.nextStep}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={sectionClass} aria-labelledby="projects-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="projects-heading" className="text-lg font-semibold text-neutral-950">Mis proyectos</h2>
          <Link
            href="/toro/proyectos"
            className="min-h-11 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            Ver todos los proyectos
          </Link>
        </div>
        {data.projects.length === 0 ? (
          <DataState variant="empty" detail="No hay proyectos activos disponibles para esta sesión." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.projects.map((project) => (
              <article key={project.id} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-neutral-950">{project.title}</h3>
                  <span className="text-xs text-neutral-500">{project.status}</span>
                </div>
                {project.milestone ? <p className="mt-2 text-sm text-neutral-600">Hito: {project.milestone}</p> : null}
                {project.blocker ? <p className="mt-1 text-sm text-neutral-600">Bloqueo: {project.blocker}</p> : null}
                {project.nextAction ? <p className="mt-1 text-sm text-neutral-600">Siguiente: {project.nextAction}</p> : null}
                <Link
                  href={`/toro/proyectos?project=${project.id}`}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-neutral-800 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  Abrir proyecto {project.title}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={sectionClass} aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-4 text-lg font-semibold text-neutral-950">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Link href="/toro/decisiones" className="flex min-h-14 items-center justify-center rounded-xl border border-neutral-300 px-3 py-3 text-center text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900">
            Decisiones
          </Link>
          <Link href="/toro/proyectos" className="flex min-h-14 items-center justify-center rounded-xl border border-neutral-300 px-3 py-3 text-center text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900">
            Proyectos
          </Link>
          <Link href="/toro" className="flex min-h-14 items-center justify-center rounded-xl border border-neutral-300 px-3 py-3 text-center text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900">
            Preguntar a TORO
          </Link>
        </div>
      </section>
    </div>
  );
}
