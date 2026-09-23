"use client";

import { useState } from "react";

export function SearchDialog() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="toro-global-search"
        className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800"
      >
        Buscar
      </button>
      {open ? (
        <div
          id="toro-global-search"
          className="absolute right-0 top-12 z-50 w-[min(90vw,24rem)] rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg"
        >
          <form action="/toro/buscar" method="get" className="flex gap-2">
            <label htmlFor="toro-search-query" className="sr-only">
              Buscar en TORO
            </label>
            <input
              id="toro-search-query"
              name="q"
              type="search"
              autoFocus
              placeholder="Habitación, proyecto, conocimiento…"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
            >
              Ir
            </button>
          </form>
          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Busca solo información gobernada a la que tu cuenta tiene acceso.
          </p>
        </div>
      ) : null}
    </div>
  );
}
