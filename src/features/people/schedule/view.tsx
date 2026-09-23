import type { MyScheduleState } from "./types";

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00-06:00`);
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatTime(value: string | null) {
  return value ? value.slice(0, 5) : "—";
}

function clockMinutes(value: string | null) {
  if (!value) return null;
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function scheduledMinutes(
  startsAt: string | null,
  endsAt: string | null,
  breakMinutes: number,
) {
  const start = clockMinutes(startsAt);
  const end = clockMinutes(endsAt);
  if (start === null || end === null || end <= start) return null;
  return Math.max(0, end - start - Math.max(0, breakMinutes));
}

function formatMinutes(value: number | null) {
  if (value === null) return "—";
  return `${Math.floor(value / 60)}h ${String(value % 60).padStart(2, "0")}m`;
}

function statusLabel(value: "published" | "confirmed") {
  return value === "confirmed" ? "Confirmado" : "Publicado";
}

export function MyScheduleView({ state }: { state: MyScheduleState }) {
  if (state.status === "not_available") {
    return (
      <section
        role="status"
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-neutral-950">
          Mi horario no está disponible
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          TORO necesita un vínculo laboral propio y un contexto de empresa
          autorizado para mostrar tus turnos.
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
          No pudimos cargar tu horario
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          TORO no mostrará turnos parciales como si fueran el horario vigente.
        </p>
      </section>
    );
  }

  const { shifts, preferredName } = state.data;
  const nextShift = shifts[0] ?? null;
  const confirmedCount = shifts.filter(
    (shift) => shift.assignmentStatus === "confirmed",
  ).length;
  const scheduledTotal = shifts.reduce((total, shift) => {
    const minutes = scheduledMinutes(
      shift.startsAt,
      shift.endsAt,
      shift.breakMinutes,
    );
    return total + (minutes ?? 0);
  }, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO People · Horario propio
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          Mi horario
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {preferredName}, aquí aparecen únicamente tus turnos publicados o
          confirmados. Los borradores internos no forman parte de esta vista.
        </p>
      </header>

      <section
        aria-label="Resumen de horario"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Próximo turno
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {nextShift ? formatDate(nextShift.shiftDate) : "—"}
          </p>
          {nextShift ? (
            <p className="mt-1 text-sm text-neutral-600">
              {formatTime(nextShift.startsAt)} – {formatTime(nextShift.endsAt)}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Turnos futuros
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {shifts.length}
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Confirmados
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {confirmedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Horas programadas visibles
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            {formatMinutes(scheduledTotal)}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="schedule-list-heading"
        className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <h2 id="schedule-list-heading" className="text-xl font-semibold">
          Próximos turnos
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Ordenados desde el más próximo.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {shifts.map((shift) => {
            const minutes = scheduledMinutes(
              shift.startsAt,
              shift.endsAt,
              shift.breakMinutes,
            );

            return (
              <article
                key={shift.id}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-950">
                      {formatDate(shift.shiftDate)}
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">
                      {formatTime(shift.startsAt)} – {formatTime(shift.endsAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-neutral-600">
                    {statusLabel(shift.assignmentStatus)}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                  <div>
                    <dt>Descanso</dt>
                    <dd className="mt-0.5 font-semibold text-neutral-900">
                      {shift.breakMinutes
                        ? `${shift.breakMinutes} min`
                        : "Sin descanso separado"}
                    </dd>
                  </div>
                  <div>
                    <dt>Tiempo programado</dt>
                    <dd className="mt-0.5 font-semibold text-neutral-900">
                      {formatMinutes(minutes)}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}

          {!shifts.length ? (
            <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600 sm:col-span-2">
              No tienes turnos publicados o confirmados próximos.
            </p>
          ) : null}
        </div>
      </section>

      <p className="px-1 text-xs leading-5 text-neutral-500">
        Esta vista no permite editar, cancelar o publicar turnos. Tampoco muestra
        notas internas, plantillas administrativas ni proyecciones de planilla.
      </p>
    </div>
  );
}
