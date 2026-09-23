import Link from "next/link";

import { searchToro } from "@/features/search/server";

export default async function ToroSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await searchToro(q);

  return (
    <section className="space-y-5 pb-24 md:pb-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">TORO OS</p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Buscar</h1>
        <form action="/toro/buscar" method="get" className="flex max-w-2xl gap-2">
          <label htmlFor="search-page-query" className="sr-only">Buscar en TORO</label>
          <input
            id="search-page-query"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Habitación, proyecto, conocimiento…"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
          <button type="submit" className="min-h-11 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white">
            Buscar
          </button>
        </form>
      </header>

      {!q.trim() ? (
        <p className="text-sm text-neutral-600">Escribe algo para buscar en las fuentes canónicas de TORO.</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-neutral-600">No encontramos resultados gobernados para “{q.trim()}”.</p>
      ) : (
        <div className="grid gap-3">
          {results.map((result) => {
            const content = (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{result.entityType}</p>
                <h2 className="mt-1 font-semibold text-neutral-950">{result.title}</h2>
                {result.subtitle ? <p className="mt-1 text-sm text-neutral-600">{result.subtitle}</p> : null}
                {result.freshness ? <p className="mt-2 text-xs text-neutral-500">Actualizado: {result.freshness}</p> : null}
                {!result.href ? (
                  <p className="mt-3 text-xs font-medium text-neutral-500">Detalle en preparación · resultado no accionable</p>
                ) : null}
              </>
            );

            return result.href ? (
              <Link
                key={`${result.entityType}:${result.id}`}
                href={result.href}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {content}
              </Link>
            ) : (
              <article
                key={`${result.entityType}:${result.id}`}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                {content}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
