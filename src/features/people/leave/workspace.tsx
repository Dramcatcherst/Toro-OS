import { LeaveRequestForm } from "./form";
import { isPendingLeaveStatus, leaveStatusLabel } from "./status";
import type { PeopleSelfServiceState } from "@/features/people/self-service/types";

function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function PeopleLeaveWorkspace({
  state,
}: {
  state: PeopleSelfServiceState;
}) {
  if (state.status !== "ready") {
    return (
      <section
        role="status"
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-neutral-950">
          Solicitudes no disponibles
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          TORO necesita un vínculo laboral propio y fuentes disponibles para
          abrir esta sección.
        </p>
      </section>
    );
  }

  const vacation =
    state.data.leaveBalances.find((item) => item.leaveType === "vacation") ??
    null;
  const pending = state.data.leaveRequests.filter((item) =>
    isPendingLeaveStatus(item.requestStatus),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO People · Solicitudes propias
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          Vacaciones y permisos
        </h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-700">
            Pendientes: {pending.length}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-700">
            Vacaciones disponibles:{" "}
            {vacation ? `${vacation.availableDays.toFixed(2)} días` : "—"}
          </span>
        </div>
      </header>

      <LeaveRequestForm />

      <section
        aria-labelledby="leave-history-heading"
        className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <h2 id="leave-history-heading" className="text-xl font-semibold">
          Mis solicitudes
        </h2>
        <div className="mt-4 space-y-2">
          {state.data.leaveRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-neutral-950">
                    {request.leaveType || "Permiso"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {formatDate(request.startsOn)} –{" "}
                    {formatDate(request.endsOn)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-neutral-600">
                  {leaveStatusLabel(request.requestStatus)}
                </span>
              </div>
              {request.reason ? (
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {request.reason}
                </p>
              ) : null}
            </article>
          ))}
          {!state.data.leaveRequests.length ? (
            <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
              Todavía no tienes solicitudes registradas.
            </p>
          ) : null}
        </div>
      </section>

      <p className="px-1 text-xs leading-5 text-neutral-500">
        Enviar una solicitud no la aprueba. La decisión y cualquier ajuste de
        saldo permanecen gobernados por los roles de jefatura/RR. HH. y por las
        reglas de TORO.
      </p>
    </div>
  );
}
