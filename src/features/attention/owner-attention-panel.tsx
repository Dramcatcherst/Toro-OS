import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { TORO_TIME_ZONE } from "@/lib/reporting-policy";
import { canViewOwnerAttention, type OwnerAttentionProjection } from "./owner-attention";
import { loadOwnerAttentionProjection, ownerAttentionReadEnabled } from "./owner-attention-server";
import {
  formatAttentionAmount,
  formatAttentionCut,
  formatAttentionDate,
  safeEvidenceHref,
} from "./owner-attention-presentation";

const priorityLabels = { critical: "Crítica", high: "Alta", normal: "Normal" } as const;
const priorityClasses = {
  critical: "border-rose-300/30 text-rose-100",
  high: "border-amber-300/30 text-amber-100",
  normal: "border-slate-600 text-slate-200",
} as const;
const sourceLabels = {
  "operations.communication_followups": "Comunicaciones",
  "operations.obligations": "Obligaciones",
  "finance.invoices": "Facturas",
} as const;

function Unavailable({ message }: { message: string }) {
  return (
    <section aria-labelledby="owner-attention-heading" className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <h2 id="owner-attention-heading" className="text-lg font-bold">Hoy</h2>
      <p role="status" className="mt-2 text-sm text-slate-300">{message}</p>
    </section>
  );
}

/** Same source, actor and capability as the owner-attention API. No client cache. */
export async function OwnerAttentionPanel({ context }: { context: ToroResolvedContext }) {
  if (!canViewOwnerAttention(context)) return null;
  if (!ownerAttentionReadEnabled()) {
    return <Unavailable message="Prioridades no habilitadas. Fuente pendiente." />;
  }

  let projection: OwnerAttentionProjection;
  try {
    projection = await loadOwnerAttentionProjection(context);
  } catch {
    // Do not leak connector diagnostics or replace a source failure with zero items.
    return <Unavailable message="No disponible. No se pudieron comprobar las fuentes." />;
  }

  const report = projection.reportContext;
  const selection = projection.selection;
  const coverage = projection.coverage;
  if (!report || !selection || !coverage || coverage.scope.orgId !== context.orgId ||
    report.timeZone !== TORO_TIME_ZONE || report.asOf !== projection.generatedAt ||
    selection.displayedCount !== projection.items.length) {
    return <Unavailable message="No disponible. No se pudo comprobar el ámbito de esta consulta." />;
  }

  return (
    <section aria-labelledby="owner-attention-heading" className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="owner-attention-heading" className="text-lg font-bold">Hoy</h2>
          <p className="mt-1 text-xs text-slate-300">
            Organización activa · {formatAttentionCut(projection.reportContext?.asOf)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Fecha de referencia: {formatAttentionDate(projection.reportContext?.reportingDate ?? null)}
            {projection.reportContext?.dateBasis === "legacy_explicit_date" ? " · fecha interna indicada" : ""}
          </p>
        </div>
        <p className="text-xs text-amber-100">Cobertura parcial · No verificado</p>
      </header>

      <p className="mt-3 text-sm text-slate-200">
        {projection.items.length} mostrados
        {projection.selection?.truncated ? ` · ${projection.selection.matchedInReadBatch} seleccionados del lote leído` : ""}
      </p>
      <p className="mt-1 text-xs text-slate-400">Total de la organización: no verificado.</p>

      {projection.items.length ? (
        <div className="mt-3 divide-y divide-slate-700">
          {projection.items.map((item) => {
            const evidenceHref = safeEvidenceHref(item.sourceUrl);
            return (
              <details key={item.dedupeRef} className="py-1">
                <summary className="min-h-11 cursor-pointer py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
                  <span className={`mr-2 inline-block rounded border px-2 py-0.5 text-xs ${priorityClasses[item.priority]}`}>
                    {priorityLabels[item.priority]}
                  </span>
                  <span className="break-words font-semibold">{item.title}</span>
                  <span className="ml-2 inline-block text-xs text-slate-300">{formatAttentionDate(item.dueDate)}</span>
                </summary>
                <div className="space-y-2 pb-3 text-sm text-slate-300">
                  {item.kind !== "communication" || item.amount !== null ? (
                    <p>{formatAttentionAmount(item.amount, item.currency)}</p>
                  ) : null}
                  <p className="break-words">Estado de origen: {item.state} · Fuente: {item.sourceSystem}</p>
                  <p className="break-words">Responsable registrado: {item.humanOwner ?? item.ownerAgent ?? "Sin asignación verificada"}</p>
                  {evidenceHref ? (
                    <a href={evidenceHref} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
                      className="inline-flex min-h-11 items-center rounded-lg border border-slate-600 px-3 text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
                      Abrir origen ↗
                    </a>
                  ) : <p className="text-xs text-slate-400">Enlace de origen no disponible o no apto para apertura directa.</p>}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <p role="status" className="mt-3 text-sm text-slate-300">
          Sin coincidencias en esta consulta. La cobertura parcial no confirma ausencia de pendientes.
        </p>
      )}

      <details className="mt-3 border-t border-slate-700 pt-2">
        <summary className="min-h-11 cursor-pointer content-center text-sm text-slate-300 focus-visible:outline-2 focus-visible:outline-cyan-200">
          Fuentes y alcance
        </summary>
        <ul className="space-y-1 pb-2 text-xs text-slate-400">
          {coverage.sources.map((source) => (
            <li key={source.source}>
              {sourceLabels[source.source]}: {source.rowsRead} leídos · límite {source.limit}
              {source.limitReached ? " · límite alcanzado" : ""}
            </li>
          ))}
        </ul>
        <p className="text-xs leading-5 text-slate-400">
          Lecturas acotadas, no un censo ni una instantánea simultánea. Los estados conservan lo informado por cada fuente.
          Abrir un origen puede requerir su propia sesión. Esta vista no modifica datos.
        </p>
      </details>
    </section>
  );
}
