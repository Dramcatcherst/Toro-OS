import type { PeopleSelfServiceState } from "./types";

function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatMinutes(minutes: number) {
  const safe = Math.max(0, Math.trunc(minutes));
  return `${Math.floor(safe / 60)}h ${String(safe % 60).padStart(2, "0")}m`;
}

function formatTime(value: string | null) {
  if (!value) return "—";
  return value.slice(0, 5);
}

function StatePanel({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <section
      role="status"
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-neutral-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
        {detail}
      </p>
    </section>
  );
}

export function PeopleSelfServiceView({
  state,
}: {
  state: PeopleSelfServiceState;
}) {
  if (state.status === "not_available") {
    const detail =
      state.reason === "employee_link_required"
        ? "Tu cuenta todavía no está vinculada a un expediente laboral."
        : state.reason === "employee_identity_mismatch"
          ? "TORO detectó una diferencia de identidad y bloqueó el acceso hasta verificarla."
          : "Esta vista requiere un contexto de empresa activo y autorizado.";

    return (
      <StatePanel
        title="Mi perfil no está disponible todavía"
        detail={detail}
      />
    );
  }

  if (state.status === "error") {
    return (
      <StatePanel
        title="No pudimos cargar tu información"
        detail="TORO no mostrará un perfil parcial como si estuviera actualizado. Intenta nuevamente cuando las fuentes estén disponibles."
      />
    );
  }

  const {
    employment,
    profile,
    upcomingShifts,
    leaveRequests,
    leaveBalances,
    recentAttendance,
  } = state.data;

  const pendingLeave = leaveRequests.filter(
    (request) => request.requestStatus === "pending",
  );
  const vacationBalance =
    leaveBalances.find((balance) => balance.leaveType === "vacation") ??
    leaveBalances[0] ??
    null;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO People · Información propia
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              {employment.preferredName}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Estado: {employment.employmentStatus || "No informado"}
              {employment.workArea ? ` · ${employment.workArea}` : ""}
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            Fuente: Supabase canónico · {new Date(state.data.loadedAt).toLocaleDateString("es-CR")}
          </p>
        </div>
      </header>

      <section
        aria-labelledby="employment-heading"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="employment-heading" className="sr-only">
          Resumen laboral
        </h2>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Ingreso
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {formatDate(employment.hireDate)}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Próximos turnos
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {upcomingShifts.length}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Solicitudes pendientes
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {pendingLeave.length}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Vacaciones disponibles
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {vacationBalance
              ? `${vacationBalance.availableDays.toFixed(2)} días`
              : "—"}
          </p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section
          aria-labelledby="shifts-heading"
          className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
        >
          <h2 id="shifts-heading" className="text-xl font-semibold">
            Próximos turnos
          </h2>
          <div className="mt-4 space-y-2">
            {upcomingShifts.slice(0, 5).map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-neutral-950">
                    {formatDate(shift.shiftDate)}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {formatTime(shift.startsAt)} – {formatTime(shift.endsAt)}
                  </p>
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {shift.assignmentStatus || "Asignado"}
                </span>
              </div>
            ))}
            {!upcomingShifts.length ? (
              <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
                No hay turnos próximos publicados.
              </p>
            ) : null}
          </div>
        </section>

        <section
          aria-labelledby="requests-heading"
          className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
        >
          <h2 id="requests-heading" className="text-xl font-semibold">
            Solicitudes recientes
          </h2>
          <div className="mt-4 space-y-2">
            {leaveRequests.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="rounded-2xl bg-neutral-50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-neutral-950">
                    {request.leaveType || "Permiso"}
                  </p>
                  <span className="text-xs font-medium text-neutral-500">
                    {request.requestStatus}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatDate(request.startsOn)} – {formatDate(request.endsOn)}
                </p>
              </div>
            ))}
            {!leaveRequests.length ? (
              <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
                No hay solicitudes recientes.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <section
        aria-labelledby="attendance-heading"
        className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="attendance-heading" className="text-xl font-semibold">
              Asistencia reciente
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Solo tus jornadas autorizadas.
            </p>
          </div>
          {profile?.personalEmail ? (
            <p className="text-xs text-neutral-500">
              Contacto registrado:{" "}
              <a
                href={`mailto:${profile.personalEmail}`}
                className="font-medium text-neutral-700 underline underline-offset-2"
              >
                {profile.personalEmail}
              </a>
            </p>
          ) : null}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-2 py-3 font-medium">Fecha</th>
                <th className="px-2 py-3 font-medium">Entrada</th>
                <th className="px-2 py-3 font-medium">Salida</th>
                <th className="px-2 py-3 font-medium">Horas</th>
                <th className="px-2 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.slice(0, 7).map((day) => (
                <tr key={day.id} className="border-b border-neutral-100">
                  <td className="px-2 py-3 font-medium">
                    {formatDate(day.workDate)}
                  </td>
                  <td className="px-2 py-3">{day.firstEntry ? new Date(day.firstEntry).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Costa_Rica" }) : "—"}</td>
                  <td className="px-2 py-3">{day.lastExit ? new Date(day.lastExit).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Costa_Rica" }) : "—"}</td>
                  <td className="px-2 py-3">
                    {formatMinutes(day.workedMinutes)}
                  </td>
                  <td className="px-2 py-3">{day.attendanceStatus || "—"}</td>
                </tr>
              ))}
              {!recentAttendance.length ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-neutral-600">
                    No hay jornadas recientes disponibles.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="px-1 text-xs leading-5 text-neutral-500">
        Esta primera versión es de solo lectura. Datos sensibles de planilla,
        cuentas bancarias y expedientes de otras personas no forman parte de esta
        vista.
      </p>
    </div>
  );
}
