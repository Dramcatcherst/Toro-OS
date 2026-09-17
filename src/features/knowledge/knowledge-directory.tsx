import { DataState } from "@/components/toro/data-state";

import type { KnowledgeDirectoryItem } from "./types";

type KnowledgeDirectoryProps = {
  items: KnowledgeDirectoryItem[];
  selectedItemId: string | null;
};

function latestFreshness(items: KnowledgeDirectoryItem[]) {
  if (!items.length) return null;
  return items.reduce((latest, item) =>
    Date.parse(item.freshness) > Date.parse(latest) ? item.freshness : latest,
  items[0].freshness);
}

export function KnowledgeDirectory({ items, selectedItemId }: KnowledgeDirectoryProps) {
  const latest = latestFreshness(items);

  return (
    <div className="space-y-4 pb-24 md:space-y-6 md:pb-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO OS · Memoria gobernada
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Conocimiento</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
              Directorio read-only de metadata autorizada. El contenido privado y estructurado no se expone aquí.
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            {latest ? `Última actualización: ${latest}` : "Sin actualización disponible"}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <DataState variant="empty" detail="No hay conocimiento gobernado disponible para esta sesión." />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2" aria-label="Directorio de conocimiento">
          {items.map((item) => {
            const selected = item.id === selectedItemId;
            return (
              <article
                key={item.id}
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
                      {item.knowledgeClass} · {item.riskLevel}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-neutral-950">{item.title}</h2>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                    {item.verifiedStatus}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span>Visibilidad: {item.visibility}</span>
                  {item.sourceSystem ? <span>Fuente: {item.sourceSystem}</span> : null}
                  {item.lastVerified ? <span>Verificado: {item.lastVerified}</span> : null}
                  {item.nextReview ? <span>Próxima revisión: {item.nextReview}</span> : null}
                  {item.requiresHumanVerification ? (
                    <span className="font-medium text-neutral-800">Requiere verificación humana</span>
                  ) : null}
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
