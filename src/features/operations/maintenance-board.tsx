"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { DataState } from "@/components/toro/data-state";

import {
  confirmMaintenanceCheck,
  submitMaintenanceCheck,
  type SubmitMaintenanceResult,
} from "./maintenance-actions";
import {
  formatApprovedCost,
  formatCostSignal,
  sortMaintenanceChecks,
  type MaintenanceCheck,
  type MaintenanceFieldRound,
} from "./maintenance";

type MaintenanceBoardProps = {
  data: MaintenanceFieldRound;
  defaultResponsible: string;
  canConfirmP0: boolean;
};

function statusLabel(status: MaintenanceCheck["resultStatus"]) {
  const labels = {
    pending: "Pendiente",
    pass: "PASS",
    fail: "FAIL",
    not_reviewed: "No revisado",
  };

  return labels[status];
}

function MaintenanceCheckCard({
  check,
  defaultResponsible,
  canConfirmP0,
}: {
  check: MaintenanceCheck;
  defaultResponsible: string;
  canConfirmP0: boolean;
}) {
  const router = useRouter();
  const [evidenceRef, setEvidenceRef] = useState(check.evidenceRef ?? "");
  const [evidenceNote, setEvidenceNote] = useState(check.evidenceNote ?? "");
  const [responsibleName, setResponsibleName] = useState(
    check.responsibleName ?? defaultResponsible,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const costSignal = formatCostSignal(check);

  const area =
    check.roomNumber !== null
      ? `${check.areaLabel ?? "Área"} · Habitación ${check.roomNumber}`
      : check.areaLabel ?? "Área general";

  function submit(result: SubmitMaintenanceResult) {
    setMessage(null);
    startTransition(async () => {
      try {
        await submitMaintenanceCheck({
          checkId: check.checkId,
          result,
          evidenceRef,
          evidenceNote,
          responsibleName,
        });
        setMessage("Resultado registrado.");
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "No se pudo registrar el resultado.",
        );
      }
    });
  }

  function confirmP0() {
    setMessage(null);
    startTransition(async () => {
      try {
        await confirmMaintenanceCheck({
          checkId: check.checkId,
          supervisorName: defaultResponsible,
        });
        setMessage("Cierre P0 confirmado por supervisor.");
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "No se pudo confirmar el P0.",
        );
      }
    });
  }

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {check.blockLabel}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-950">{area}</h2>
        </div>
        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
          {statusLabel(check.resultStatus)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-700">{check.checkText}</p>
      <p className="mt-2 rounded-xl bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
        <span className="font-semibold text-neutral-800">Criterio de cierre:</span>{" "}
        {check.passCriteria}
      </p>

      {check.supplierOrTechnician ? (
        <p className="mt-3 text-sm text-neutral-600">
          <span className="font-medium text-neutral-800">Proveedor / técnico:</span>{" "}
          {check.supplierOrTechnician}
        </p>
      ) : null}

      <div className="mt-3 grid gap-2 rounded-xl border border-neutral-200 p-3 text-sm">
        <p className="text-neutral-700">
          <span className="font-medium text-neutral-900">
            {costSignal?.label ?? "Señal de costo"}:
          </span>{" "}
          {costSignal?.value ?? "No disponible"}
        </p>
        <p className="text-neutral-700">
          <span className="font-medium text-neutral-900">Costo aprobado:</span>{" "}
          {formatApprovedCost(check)}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="text-sm font-medium text-neutral-700">
          Foto / evidencia
          <input
            value={evidenceRef}
            onChange={(event) => setEvidenceRef(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
            placeholder="URL o referencia verificable"
          />
        </label>

        <label className="text-sm font-medium text-neutral-700">
          Nota
          <textarea
            value={evidenceNote}
            onChange={(event) => setEvidenceNote(event.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
            placeholder="Qué se probó, qué cambió o por qué falló"
          />
        </label>

        <label className="text-sm font-medium text-neutral-700">
          Responsable
          <input
            value={responsibleName}
            onChange={(event) => setResponsibleName(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit("pass")}
          className="min-h-11 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-50"
        >
          PASS
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit("fail")}
          className="min-h-11 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 disabled:opacity-50"
        >
          FAIL
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit("not_reviewed")}
          className="min-h-11 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 disabled:opacity-50"
        >
          No revisado
        </button>
      </div>

      {check.requiresSupervisorReview &&
      check.resultStatus === "pass" &&
      !check.supervisorConfirmed ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-950">
            Pendiente confirmación Gerencia
          </p>
          {canConfirmP0 ? (
            <button
              type="button"
              disabled={isPending}
              onClick={confirmP0}
              className="mt-2 min-h-11 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-950 disabled:opacity-50"
            >
              Confirmar cierre P0
            </button>
          ) : null}
        </div>
      ) : null}

      {check.closureReady ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">Cierre verificable listo.</p>
      ) : null}

      {message ? (
        <p role="status" className="mt-3 text-sm text-neutral-600">
          {message}
        </p>
      ) : null}
    </article>
  );
}

export function MaintenanceBoard({
  data,
  defaultResponsible,
  canConfirmP0,
}: MaintenanceBoardProps) {
  if (!data.round) {
    return (
      <DataState
        variant="empty"
        detail="No hay una ronda diaria de mantenimiento preparada."
      />
    );
  }

  const checks = sortMaintenanceChecks(data.checks);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {data.round.priority} · {data.round.roundStatus}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-neutral-950">
          {data.round.roundName}
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {data.round.objective}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">PASS</p>
            <p className="text-lg font-semibold text-neutral-950">
              {data.round.passChecks}
            </p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">FAIL</p>
            <p className="text-lg font-semibold text-neutral-950">
              {data.round.failChecks}
            </p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Pendientes</p>
            <p className="text-lg font-semibold text-neutral-950">
              {data.round.pendingChecks}
            </p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-xs text-neutral-500">Min. estimados</p>
            <p className="text-lg font-semibold text-neutral-950">
              {data.round.estimatedMinutes ?? "—"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {checks.map((check) => (
          <MaintenanceCheckCard
            key={check.checkId}
            check={check}
            defaultResponsible={defaultResponsible}
            canConfirmP0={canConfirmP0}
          />
        ))}
      </div>
    </div>
  );
}
