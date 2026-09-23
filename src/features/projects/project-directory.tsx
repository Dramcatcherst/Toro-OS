import { DataState } from "@/components/toro/data-state";

import type { ProjectDirectoryItem } from "./types";

type ProjectDirectoryProps = {
  projects: ProjectDirectoryItem[];
  selectedProjectId: string | null;
};

function latestFreshness(projects: ProjectDirectoryItem[]) {
  if (!projects.length) return null;
  return projects.reduce((latest, project) =>
    Date.parse(project.freshness) > Date.parse(latest) ? project.freshness : latest,
  projects[0].freshness);
}

export function ProjectDirectory({ projects, selectedProjectId }: ProjectDirectoryProps) {
  const latest = latestFreshness(projects);

  return (
    <div className="space-y-4 pb-24 md:space-y-6 md:pb-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO OS · Control ejecutivo
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Proyectos</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
              Vista read-only de proyectos activos autorizados por tu sesión. TORO muestra estado,
              prioridad y siguiente acción sin editar la fuente.
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            {latest ? `Última actualización: ${latest}` : "Sin actualización disponible"}
          </p>
        </div>
      </header>

      {projects.length === 0 ? (
        <DataState variant="empty" detail="No hay proyectos activos disponibles para esta sesión." />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2" aria-label="Directorio de proyectos">
          {projects.map((project) => {
            const selected = project.id === selectedProjectId;
            return (
              <article
                key={project.id}
                data-selected={selected ? "true" : "false"}
                className={`rounded-2xl border p-4 shadow-sm ${
                  selected
                    ? "border-neutral-950 bg-neutral-50 ring-2 ring-neutral-900/10"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {[project.priority, project.category, project.businessArea]
                        .filter(Boolean)
                        .join(" · ") || "Proyecto"}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-neutral-950">{project.title}</h2>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                    {project.status}
                  </span>
                </div>

                {project.nextAction ? (
                  <p className="mt-3 text-sm leading-6 text-neutral-700">
                    <span className="font-medium">Siguiente:</span> {project.nextAction}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  {project.owner ? <span>Responsable: {project.owner}</span> : null}
                  <span>Actualizado: {project.freshness}</span>
                  {selected ? <span className="font-medium text-neutral-800">Seleccionado desde TORO</span> : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
