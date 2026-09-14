"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
import { getSearchResultAction } from "@/lib/search/ui-contract.mjs";

type SearchResult = {
  entityType: string;
  key: string;
  title: string;
  subtitle: string;
  status: string;
  destination: string;
  source: string;
  matchType: string;
  score: number;
};

type SearchGroup = { label: string; results: SearchResult[] };

type SearchPayload = {
  query: string;
  state: "empty" | "ready" | "partial" | "stale" | "error";
  results: SearchResult[];
  groups: SearchGroup[];
  failedSources: string[];
  staleSources: string[];
  callCount: number;
  elapsedMs: number;
};

const EXAMPLES = ["25", "Oliver", "desayuno", "Santa Toro", "proyector"];

function stateCopy(payload: SearchPayload | null) {
  if (!payload) return null;
  if (payload.state === "partial") return `Resultado parcial: ${payload.failedSources.length} fuente(s) no respondieron.`;
  if (payload.state === "stale") return `Hay datos que requieren actualización: ${payload.staleSources.join(", ")}.`;
  if (payload.state === "error") return "No fue posible consultar las fuentes de TORO en este momento.";
  if (payload.state === "ready" && payload.results.length === 0) return "No encontré resultados gobernados para esa búsqueda.";
  return null;
}

export function ToroSearch() {
  const [query, setQuery] = useState("");
  const [payload, setPayload] = useState<SearchPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  async function runSearch(value: string) {
    const clean = value.trim();
    setQuery(clean);
    setExpandedResultId(null);
    if (!clean) {
      setPayload(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(clean)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("search failed");
      setPayload(await response.json());
    } catch {
      setPayload({
        query: clean,
        state: "error",
        results: [],
        groups: [],
        failedSources: [],
        staleSources: [],
        callCount: 0,
        elapsedMs: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query);
  }

  const notice = stateCopy(payload);

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="border border-cyan-400/15 bg-slate-950/72 p-4 md:p-5">
        <label htmlFor="toro-search" className="block text-sm font-semibold text-white">Buscar en TORO OS</label>
        <p className="mt-1 text-xs leading-5 text-slate-400">Habitaciones, villas, personas, tareas, SOPs, experiencias y sistemas.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="toro-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. 25, Oliver, desayuno..."
              autoComplete="off"
              maxLength={120}
              className="h-12 w-full border border-slate-700 bg-black/35 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 border border-cyan-300/35 bg-cyan-300/10 px-5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Buscar
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Búsquedas rápidas">
          {EXAMPLES.map((example) => (
            <button
              type="button"
              key={example}
              onClick={() => void runSearch(example)}
              className="border border-slate-700 bg-black/20 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
            >
              {example}
            </button>
          ))}
        </div>
      </form>

      {notice ? (
        <div className={`flex gap-3 border p-3 text-sm ${payload?.state === "error" ? "border-red-400/25 bg-red-400/8 text-red-100" : "border-amber-300/25 bg-amber-300/8 text-amber-100"}`}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {payload && payload.results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{payload.results.length} resultado(s) gobernados</span>
            <span className="font-mono">{payload.callCount} fuentes · {payload.elapsedMs} ms servidor</span>
          </div>

          {payload.groups.map((group) => (
            <section key={group.label} className="border border-cyan-400/12 bg-slate-950/72">
              <div className="border-b border-slate-800 px-4 py-3">
                <h2 className="text-sm font-semibold text-white">{group.label}</h2>
              </div>
              <div className="divide-y divide-slate-800">
                {group.results.map((result) => {
                  const resultId = `${result.entityType}:${result.key}`;
                  const action = getSearchResultAction(result);
                  const expanded = expandedResultId === resultId;

                  return (
                    <article key={resultId} className="p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white">{result.title}</h3>
                            {result.status ? <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-cyan-200">{result.status}</span> : null}
                          </div>
                          {result.subtitle ? <p className="mt-1 text-xs leading-5 text-slate-400">{result.subtitle}</p> : null}
                          <p className="mt-1 font-mono text-[10px] text-slate-600">{result.matchType} · {result.source}</p>
                        </div>

                        {action.kind === "room360" && action.href ? (
                          <Link
                            href={action.href}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-cyan-300/30 bg-cyan-300/8 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/14"
                          >
                            {action.label} <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() => setExpandedResultId(expanded ? null : resultId)}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-cyan-300/30 bg-cyan-300/8 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/14"
                          >
                            {action.label} {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>

                      {expanded ? (
                        <div className="mt-3 grid gap-2 border border-slate-800 bg-black/25 p-3 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                          <div><span className="text-slate-500">Tipo</span><br />{result.entityType}</div>
                          <div><span className="text-slate-500">Estado</span><br />{result.status || "Sin clasificar"}</div>
                          <div><span className="text-slate-500">Fuente</span><br />{result.source}</div>
                          <div><span className="text-slate-500">Referencia TORO</span><br /><span className="font-mono">{result.key}</span></div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
