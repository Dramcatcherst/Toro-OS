"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { DataState } from "@/components/toro/data-state";

import { resolveDecision, type DecisionAction } from "./actions";
import type { DecisionCard } from "./types";

type DecisionListProps = {
  decisions: DecisionCard[];
};

const actionLabels: Record<DecisionAction, string> = {
  approve: "Aprobar",
  modify: "Modificar",
  delegate: "Delegar",
  postpone: "Posponer",
  reject: "Rechazar",
};

function DecisionActions({ decision }: { decision: DecisionCard }) {
  const [note, setNote] = useState("");
  const [delegateTo, setDelegateTo] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function execute(action: DecisionAction) {
    if (
      (action === "approve" || action === "reject") &&
      !window.confirm(`¿Confirmas ${actionLabels[action].toLowerCase()} esta decisión?`)
    ) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await resolveDecision({
          decisionId: decision.id,
          action,
          note,
          delegateTo,
        });
        setMessage(`Acción registrada: ${result.status}.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No se pudo registrar la acción.");
      }
    });
  }

  return (
    <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
      <label className="block text-sm font-medium text-neutral-700">
        Nota / instrucción
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Contexto para modificar, posponer o rechazar"
        />
      </label>

      <label className="block text-sm font-medium text-neutral-700">
        Delegar a
        <input
          value={delegateTo}
          onChange={(event) => setDelegateTo(event.target.value)}
          className="mt-1 min-h-11 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Persona o rol"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(actionLabels) as DecisionAction[]).map((action) => (
          <button
            key={action}
            type="button"
            disabled={isPending}
            onClick={() => execute(action)}
            className="min-h-11 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
          >
            {actionLabels[action]}
          </button>
        ))}
        <Link
          href={`/toro?decision=${encodeURIComponent(decision.id)}`}
          className="flex min-h-11 items-center rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900"
        >
          Explícame mejor
        </Link>
      </div>

      {isPending ? <p role="status" className="text-sm text-neutral-500">Registrando acción…</p> : null}
      {message ? (
        <p role="status" className="text-sm text-neutral-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function DecisionList({ decisions }: DecisionListProps) {
  if (decisions.length === 0) {
    return <DataState variant="empty" detail="No hay decisiones pendientes en la cola gobernada." />;
  }

  return (
    <div className="grid gap-4">
      {decisions.map((decision) => (
        <article key={decision.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {decision.urgency} · {decision.domain}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-neutral-950">{decision.title}</h2>
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
          {decision.rationale ? <p className="mt-1 text-sm leading-6 text-neutral-600">{decision.rationale}</p> : null}
          <p className="mt-3 text-xs text-neutral-500">
            Aprobación requerida: {decision.approvalLevel === "founder_approval" ? "Mauricio / Founder" : "Gerencia"}
          </p>
          <DecisionActions decision={decision} />
        </article>
      ))}
    </div>
  );
}
