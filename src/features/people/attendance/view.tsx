import type { MyAttendanceState } from "./types";

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMinutes(value: number) {
  const safe = Math.max(0, Math.trunc(value));
  return `${Math.floor(safe / 60)}h ${String(safe % 60).padStart(2, "0")}m`;
}

function attendanceLabel(value: string) {
  if (value === "complete") return "Completa";
  if (value === "incomplete") return "Incompleta";
  if (value === "pending_identity") return "Identidad pendiente";
  if (value === "unknown_identity") return "Sin identificar";
  return value || "Pendiente";
}

function approvalLabel(value: string) {
  if (value === "approved") return "Aprobada";
  if (value === "rejected") return "Rechazada";
  if (value === "pending") return "Pendiente";
  return value || "Pendiente";
}

export function MyAttendanceView({ state }: { state: MyAttendanceState }) {
  if (state.status === "not_available") {
    return (
      <section
        role="status"
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-neutral-950">
          Mi asistencia no está disponible
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          TORO necesita un vínculo laboral propio y un contexto de empresa
          autorizado para mostrar estas jornadas.
        </p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-neutral-950">
          No pudimos cargar tu asistencia
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          TORO no mostrará información parcial como si estuviera actualizada.
        </p>
      </section>
    );
  }

  const days = state.data.days;
  const totalActual = days.reduce(
    (total, day) => total + day.actualWorkedMinutes,
    0,
  );
  const totalOfficial = days.reduce(
    (total, day) => total + day.officialWorkedMinutes,
    0,
  );
  const pending = days.filter(
    (day) =>
      day.approvalStatus === "pending" ||
      day.attendanceStatus !== "complete",
  ).length;
  const adjusted = days.filter(
    (day) => day.actualWorkedMinutes !== day.officialWorkedMinutes,
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO People · Asistencia propia
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          Mi asistencia
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
          Jornadas propias registradas en TORO. Esta vista no expone marcas
          crudas del reloj ni permite modificar horas oficiales.
        </p>
      </header>

      <section
        aria-label="Resumen de asistencia"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Jornadas cargadas
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {days.length}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Tiempo real
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {formatMinutes(totalActual)}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Tiempo oficial
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {formatMinutes(totalOfficial)}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Por revisar
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {pending}
          </p>
          {adjusted ? (
            <p className="mt-1 text-xs text-neutral-500">
              {adjusted} jornada{adjusted === 1 ? "" : "s"} con diferencia real/oficial
            </p>
          ) : null}
        </div>
      </section>

      <section
        aria-labelledby="attendance-history-heading"
        className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <div>
          <h2 id="attendance-history-heading" className="text-xl font-semibold">
            Jornadas recientes
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Hasta 45 jornadas propias, de la más reciente a la más antigua.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-2 py-3 font-medium">Fecha</th>
                <th className="px-2 py-3 font-medium">Entrada</th>
                <th className="px-2 py-3 font-medium">Salida</th>
                <th className="px-2 py-3 font-medium">Real</th>
                <th className="px-2 py-3 font-medium">Oficial</th>
                <th className="px-2 py-3 font-medium">Asistencia</th>
                <th className="px-2 py-3 font-medium">Revisión</th>
                <th className="px-2 py-3 font-medium">Planilla</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.id} className="border-b border-neutral-100">
                  <td className="px-2 py-3 font-medium">
                    {formatDate(day.workDate)}
                  </td>
                  <td className="px-2 py-3">{formatTime(day.firstEntry)}</td>
                  <td className="px-2 py-3">{formatTime(day.lastExit)}</td>
                  <td className="px-2 py-3">
                    {formatMinutes(day.actualWorkedMinutes)}
                  </td>
                  <td className="px-2 py-3">
                    {formatMinutes(day.officialWorkedMinutes)}
                  </td>
                  <td className="px-2 py-3">
                    {attendanceLabel(day.attendanceStatus)}
                  </td>
                  <td className="px-2 py-3">
                    {approvalLabel(day.approvalStatus)}
                  </td>
                  <td className="px-2 py-3">
                    {day.payrollEligible ? "Incluida" : "No incluida"}
                  </td>
                </tr>
              ))}
              {!days.length ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-2 py-8 text-center text-neutral-600"
                  >
                    No hay jornadas disponibles.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="px-1 text-xs leading-5 text-neutral-500">
        Las marcas crudas, los bloques técnicos y las correcciones de pago
        pertenecen al flujo restringido de RR. HH./Administración y no aparecen
        en esta vista.
      </p>
    </div>
  );
}
