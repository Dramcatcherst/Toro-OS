import type { TeamScheduleState } from "./team-types";

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

function statusLabel(value: "draft" | "published" | "confirmed") {
  if (value === "draft") return "Borrador";
  if (value === "confirmed") return "Confirmado";
  return "Publicado";
}

export function TeamScheduleView({ state }: { state: TeamScheduleState }) {
  if (state.status === "not_available") {
    return (
      <section
        role="status"
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-neutral-950">
          Horarios de equipo no disponibles
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Esta vista requiere un rol organizacional autorizado. La jefatura
          departamental queda limitada automáticamente por las reglas de datos.
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
          No pudimos cargar los horarios
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          TORO no mostrará un horario parcial como si fuera la planificación
          vigente.
        </p>
      </section>
    );
  }

  const { shifts, rangeFrom, rangeTo } = state.data;
  const counts = {
    draft: shifts.filter((shift) => shift.assignmentStatus === "draft").length,
    published: shifts.filter(
      (shift) => shift.assignmentStatus === "published",
    ).length,
    confirmed: shifts.filter(
      (shift) => shift.assignmentStatus === "confirmed",
    ).length,
  };

  const byDate = new Map<string, typeof shifts>();
  for (const shift of shifts) {
    const list = byDate.get(shift.shiftDate) ?? [];
    list.push(shift);
    byDate.set(shift.shiftDate, list);
  }

  const dates = [...byDate.keys()].sort();

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO People · Horarios de equipo
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          Horarios
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
          Vista de planificación de solo lectura para {formatDate(rangeFrom)} a{" "}
          {formatDate(rangeTo)}. El alcance de personas depende de tu rol y de
          la RLS de la organización.
        </p>
      </header>

      <section
        aria-label="Resumen de horarios"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Turnos visibles
          </p>
          <p className="mt-2 text-lg font-semibold">{shifts.length}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Borradores
          </p>
          <p className="mt-2 text-lg font-semibold">{counts.draft}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Publicados
          </p>
          <p className="mt-2 text-lg font-semibold">{counts.published}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Confirmados
          </p>
          <p className="mt-2 text-lg font-semibold">{counts.confirmed}</p>
        </div>
      </section>

      <section
        aria-labelledby="team-schedule-heading"
        className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <h2 id="team-schedule-heading" className="text-xl font-semibold">
          Próximos 21 días
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Esta vista no modifica turnos. Borrador significa que todavía no es
          un horario publicado para el colaborador.
        </p>

        <div className="mt-5 space-y-5">
          {dates.map((date) => (
            <section key={date} aria-labelledby={`schedule-${date}`}>
              <h3
                id={`schedule-${date}`}
                className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
              >
                {formatDate(date)}
              </h3>
              <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {(byDate.get(date) ?? []).map((shift) => (
                  <article
                    key={shift.id}
                    className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-950">
                          {shift.employeeName}
                        </p>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {[shift.department, shift.workArea]
                            .filter(Boolean)
                            .join(" · ") || "Área no informada"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-neutral-600">
                        {statusLabel(shift.assignmentStatus)}
                      </span>
                    </div>

                    <p className="mt-3 text-lg font-semibold tracking-tight text-neutral-900">
                      {formatTime(shift.startsAt)} – {formatTime(shift.endsAt)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {shift.breakMinutes
                        ? `Descanso: ${shift.breakMinutes} min`
                        : "Sin descanso separado"}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {!dates.length ? (
            <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
              No hay turnos visibles en el período.
            </p>
          ) : null}
        </div>
      </section>

      <p className="px-1 text-xs leading-5 text-neutral-500">
        Esta wave no muestra salarios, forecast de planilla, notas internas,
        plantillas administrativas ni comparaciones de asistencia. Tampoco
        permite crear, editar, cancelar o publicar turnos.
      </p>
    </div>
  );
}
