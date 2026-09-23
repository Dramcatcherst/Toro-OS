"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { PEOPLE_LEAVE_TYPES, type PeopleLeaveType } from "./validation";

const leaveTypeLabels: Record<PeopleLeaveType, string> = {
  vacation: "Vacaciones",
  sick: "Incapacidad / salud",
  personal: "Permiso personal",
  unpaid: "Permiso sin goce",
  maternity: "Maternidad",
  paternity: "Paternidad",
  other: "Otro",
};

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function LeaveRequestForm() {
  const router = useRouter();
  const [state, setState] = useState<SubmissionState>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      leaveType: String(data.get("leaveType") ?? ""),
      startsOn: String(data.get("startsOn") ?? ""),
      endsOn: String(data.get("endsOn") ?? ""),
      reason: String(data.get("reason") ?? ""),
    };

    setState({ status: "submitting" });

    try {
      const response = await fetch("/api/toro/people/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.error || "No fue posible enviar la solicitud.");
      }

      form.reset();
      setState({
        status: "success",
        message: "Solicitud enviada. Quedó pendiente de revisión.",
      });
      router.refresh();
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "No fue posible enviar la solicitud.",
      });
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Nueva solicitud
        </p>
        <h2 className="mt-1 text-xl font-semibold text-neutral-950">
          Pedir vacaciones o permiso
        </h2>
        <p className="mt-1 text-sm leading-6 text-neutral-600">
          TORO la registra como pendiente. Jefatura o RR. HH. conserva la
          decisión.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
          Tipo
          <select
            name="leaveType"
            defaultValue="vacation"
            className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3"
          >
            {PEOPLE_LEAVE_TYPES.map((type) => (
              <option key={type} value={type}>
                {leaveTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <div className="hidden sm:block" aria-hidden="true" />

        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
          Desde
          <input
            required
            name="startsOn"
            type="date"
            className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
          Hasta
          <input
            required
            name="endsOn"
            type="date"
            className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-neutral-800 sm:col-span-2">
          Motivo
          <textarea
            required
            name="reason"
            minLength={5}
            maxLength={1000}
            rows={4}
            placeholder="Explique brevemente el motivo."
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
      </div>

      {state.status === "success" ? (
        <p role="status" className="mt-4 text-sm font-medium text-emerald-700">
          {state.message}
        </p>
      ) : null}

      {state.status === "error" ? (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="min-h-11 rounded-xl bg-neutral-950 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "submitting" ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}
