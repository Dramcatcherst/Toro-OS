import type { AttendanceReviewState } from "./review-types";

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatMinutes(value: number) {
  const safe = Math.max(0, Math.trunc(value));
  return `${Math.floor(safe / 60)}h ${String(safe % 60).padStart(2, "0")}m`;
}

function exceptionLabel(value: string) {
  if (value === "missing_punch") return "Falta una marca";
  if (value === "identity_pending") return "Identidad pendiente";
  if (value === "punch_policy") return "Política de marcas";
  return value || "Incidencia";
}

export function AttendanceReviewView({
  state,
}: {
  state: AttendanceReviewState;
}) {
  if (state.status === "not_available") {
    return (
      <section
        role="status"
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-neutral-950">
          Revisión de asistencia no disponible
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Esta sección requiere un rol organizacional autorizado para revisar
          incidencias de asistencia.
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
          No pudimos cargar la revisión de asistencia
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          TORO no mostrará una revisión parcial como si estuviera completa.
        </p>
      </section>
    );
  }

  const dayById = new Map(state.data.days.map((day) => [day.id, day]));
  const needsReview = state.data.days.filter(
    (day) =>
      day.attendanceStatus !== "complete" ||
      day.approvalStatus === "pending" ||
      !day.payrollEligible,
  );
  const totalOfficial = state.data.days.reduce(
    (total, day) => total + day.officialWorkedMinutes,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO People · Revisión de asistencia
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          Asistencia
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
          Vista de revisión. Esta wave no permite corregir marcas, resolver
          incidencias, importar archivos ni decidir pago.
        </p>
      </header>

      <section
        aria-label="Resumen de revisión de asistencia"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Jornadas cargadas
          </p>
          <p className="mt-2 text-lg font-semibold">{state.data.days.length}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Incidencias abiertas
          </p>
          <p className="mt-2 text-lg font-semibold">
            {state.data.openExceptions.length}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Jornadas por revisar
          </p>
          <p className="mt-2 text-lg font-semibold">{needsReview.length}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Horas oficiales visibles
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatMinutes(totalOfficial)}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="exceptions-heading"
        className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <h2 id="exceptions-heading" className="text-xl font-semibold">
          Incidencias abiertas
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Solo lectura. Las resoluciones permanecen en el flujo restringido de
          RR. HH./Administración.
        </p>

        <div className="mt-4 space-y-2">
          {state.data.openExceptions.map((exception) => {
            const day = exception.attendanceDayId
              ? dayById.get(exception.attendanceDayId)
              : null;
            return (
              <article
                key={exception.id}
                className="rounded-2xl bg-neutral-50 px-4 py-3"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-neutral-950">
                      {exceptionLabel(exception.exceptionType)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {day?.employeeName ?? "Jornada fuera del rango cargado"}
                      {day?.workArea ? ` · ${day.workArea}` : ""}
                      {day ? ` · ${formatDate(day.workDate)}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase text-neutral-500">
                    {exception.severity || "sin severidad"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {exception.description}
                </p>
              </article>
            );
          })}
          {!state.data.openExceptions.length ? (
            <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
              No hay incidencias abiertas en las fuentes visibles.
            </p>
          ) : null}
        </div>
      </section>

      <section
        aria-labelledby="days-review-heading"
        className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <h2 id="days-review-heading" className="text-xl font-semibold">
          Jornadas por revisar
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-2 py-3 font-medium">Persona</th>
                <th className="px-2 py-3 font-medium">Área</th>
                <th className="px-2 py-3 font-medium">Fecha</th>
                <th className="px-2 py-3 font-medium">Real</th>
                <th className="px-2 py-3 font-medium">Oficial</th>
                <th className="px-2 py-3 font-medium">Asistencia</th>
                <th className="px-2 py-3 font-medium">Aprobación</th>
              </tr>
            </thead>
            <tbody>
              {needsReview.slice(0, 30).map((day) => (
                <tr key={day.id} className="border-b border-neutral-100">
                  <td className="px-2 py-3 font-medium">{day.employeeName}</td>
                  <td className="px-2 py-3">{day.workArea ?? "—"}</td>
                  <td className="px-2 py-3">{formatDate(day.workDate)}</td>
                  <td className="px-2 py-3">
                    {formatMinutes(day.actualWorkedMinutes)}
                  </td>
                  <td className="px-2 py-3">
                    {formatMinutes(day.officialWorkedMinutes)}
                  </td>
                  <td className="px-2 py-3">{day.attendanceStatus || "—"}</td>
                  <td className="px-2 py-3">{day.approvalStatus || "—"}</td>
                </tr>
              ))}
              {!needsReview.length ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-2 py-8 text-center text-neutral-600"
                  >
                    No hay jornadas pendientes en el rango visible.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-labelledby="imports-heading"
        className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <h2 id="imports-heading" className="text-xl font-semibold">
          Últimas importaciones del reloj
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Metadatos mínimos. No se muestra el archivo, hash ni payload crudo.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {state.data.recentImports.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
            >
              <p className="font-medium text-neutral-950">
                {formatDate(item.periodFrom)} – {formatDate(item.periodTo)}
              </p>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-600">
                <div>
                  <dt>Filas</dt>
                  <dd className="font-semibold text-neutral-900">
                    {item.rawRowCount}
                  </dd>
                </div>
                <div>
                  <dt>Aceptadas</dt>
                  <dd className="font-semibold text-neutral-900">
                    {item.acceptedPunchCount}
                  </dd>
                </div>
                <div>
                  <dt>Duplicadas</dt>
                  <dd className="font-semibold text-neutral-900">
                    {item.duplicateCount}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
          {!state.data.recentImports.length ? (
            <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
              No hay imports recientes visibles.
            </p>
          ) : null}
        </div>
      </section>

      <p className="px-1 text-xs leading-5 text-neutral-500">
        Corregir asistencia, resolver identidades, reemplazar imports o decidir
        inclusión en planilla son acciones separadas de mayor riesgo y no forman
        parte de esta vista.
      </p>
    </div>
  );
}
