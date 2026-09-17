import Link from "next/link";

import type { Room360LoadResult } from "@/lib/server/room-360";

const sectionClass = "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5";

function StateCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div role="status" className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <h1 className="text-xl font-semibold text-neutral-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{detail}</p>
      <Link href="/toro/buscar" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900">
        Volver a buscar
      </Link>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

export function Room360View({ result }: { result: Room360LoadResult }) {
  if (result.state === "unconfigured") {
    return (
      <StateCard
        title="Fuente Airtable no configurada"
        detail="TORO reconoce la habitación como una función disponible, pero no puede consultar la fuente gobernada sin la credencial server-side de Airtable. No se presenta esto como una habitación inexistente."
      />
    );
  }

  if (result.state === "error") {
    return (
      <StateCard
        title="No pudimos consultar la habitación"
        detail="La fuente principal de habitaciones respondió con error. TORO no sustituye este fallo con datos inventados o históricos sin marcar."
      />
    );
  }

  if (result.state === "not_found" || !result.view.summary.key) {
    return (
      <StateCard
        title="Habitación no encontrada"
        detail="No encontramos una habitación gobernada con esa clave exacta. TORO no relaciona habitaciones por coincidencias ambiguas de texto."
      />
    );
  }

  const { view } = result;
  const media = [...view.media.hero, ...view.media.web, ...view.media.kross, ...view.media.pending].slice(0, 12);

  return (
    <div className="space-y-4 pb-24 md:space-y-6 md:pb-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Ficha 360 · {view.summary.key}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">{view.summary.name}</h1>
            <p className="mt-1 text-sm text-neutral-600">{view.summary.property} · {view.summary.status || "estado no informado"}</p>
          </div>
          <Link href="/toro/buscar" className="inline-flex min-h-11 items-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900">
            Buscar otra
          </Link>
        </div>
      </header>

      {result.state === "partial" ? (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-950">Información parcial</p>
          <p className="mt-1 text-sm text-amber-800">Fuentes con fallo: {result.failedSources.join(", ")}.</p>
        </div>
      ) : null}

      <section className={sectionClass} aria-labelledby="room-summary-heading">
        <h2 id="room-summary-heading" className="mb-4 text-lg font-semibold text-neutral-950">Resumen</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Fact label="Capacidad" value={view.summary.capacity ?? "—"} />
          <Fact label="Camas" value={view.summary.beds || "—"} />
          <Fact label="Cocina" value={view.summary.kitchen || "—"} />
          <Fact label="Proyector" value={view.summary.projector ? "Sí" : "No"} />
          <Fact label="Amenidades" value={view.summary.amenityCount} />
          <Fact label="Estado" value={view.summary.status || "—"} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={sectionClass} aria-labelledby="sale-heading">
          <h2 id="sale-heading" className="mb-4 text-lg font-semibold text-neutral-950">Cómo se vende</h2>
          <div className="space-y-2">
            {view.sale.map((unit) => (
              <div key={unit.key} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 p-3">
                <div>
                  <p className="font-medium text-neutral-950">{unit.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">{unit.type}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">{unit.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass} aria-labelledby="kross-heading">
          <h2 id="kross-heading" className="text-lg font-semibold text-neutral-950">Kross · autoridad transaccional</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            TORO muestra contexto y acceso. Precio, disponibilidad, reserva y pago permanecen en Kross.
          </p>
          {view.kross.directBookingUrl ? (
            <a
              href={view.kross.directBookingUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900"
            >
              Abrir Kross
            </a>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">Sin enlace Kross gobernado disponible.</p>
          )}
        </section>
      </div>

      <section className={sectionClass} aria-labelledby="media-heading">
        <h2 id="media-heading" className="mb-4 text-lg font-semibold text-neutral-950">Media gobernada</h2>
        {media.length === 0 ? (
          <p className="text-sm text-neutral-600">No hay media segura vinculada a esta habitación en esta lectura.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((asset) => {
              const shared = asset.sharedWith.map((key) => `#${key.replace("DC-ROOM-", "")}`).join(", ");
              return (
                <article key={asset.key} className="rounded-xl border border-neutral-200 p-3">
                  <p className="font-medium text-neutral-950">{asset.name || asset.key}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {asset.identityScope === "shared" ? `Compartida con ${shared}` : `Específica #${view.summary.number}`}
                  </p>
                  {asset.publicUrl ? (
                    <a href={asset.publicUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-medium text-neutral-700 underline underline-offset-4">
                      Ver imagen
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={sectionClass} aria-labelledby="operations-heading">
          <h2 id="operations-heading" className="mb-4 text-lg font-semibold text-neutral-950">Operación</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-800">Tareas enlazadas</h3>
              {view.operation.tasks.length ? (
                <div className="mt-2 space-y-2">
                  {view.operation.tasks.map((task) => (
                    <div key={task.key} className="rounded-xl border border-neutral-200 p-3">
                      <p className="text-sm font-medium text-neutral-950">{task.title}</p>
                      <p className="mt-1 text-xs text-neutral-500">{task.status} · {task.priority}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">Sin tareas estructuralmente enlazadas.</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-800">Validaciones</h3>
              {view.operation.validations.length ? (
                <div className="mt-2 space-y-2">
                  {view.operation.validations.map((validation) => (
                    <div key={validation.key} className="rounded-xl border border-neutral-200 p-3">
                      <p className="text-sm font-medium text-neutral-950">{validation.title}</p>
                      <p className="mt-1 text-xs text-neutral-500">{validation.status} · {validation.severity}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">Sin validaciones estructuralmente enlazadas.</p>
              )}
            </div>
          </div>
        </section>

        <section className={sectionClass} aria-labelledby="knowledge-heading">
          <h2 id="knowledge-heading" className="mb-4 text-lg font-semibold text-neutral-950">Conocimiento</h2>
          {view.knowledge.length ? (
            <div className="space-y-2">
              {view.knowledge.map((item) => (
                <div key={item.key} className="rounded-xl border border-neutral-200 p-3 text-sm font-medium text-neutral-950">{item.title}</div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-neutral-600">Todavía no hay conocimiento enlazado estructuralmente a esta habitación. TORO no inventa relaciones por coincidencia de texto.</p>
          )}
        </section>
      </div>
    </div>
  );
}
