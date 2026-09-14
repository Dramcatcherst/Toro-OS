import { ArrowLeft, Search } from "lucide-react";
import { ToroSearch } from "@/components/toro-search";

export default function ToroSearchPage() {
  return (
    <main className="command-grid min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_80%_8%,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,rgba(8,15,32,0.94),rgba(3,7,18,1)),#030712]">
      <header className="border-b border-cyan-400/10 bg-slate-950/88 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-cyan-300/35 bg-cyan-300/10 text-cyan-200">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white md:text-2xl">Buscar en TORO OS</h1>
              <p className="text-xs text-slate-400">Una búsqueda, múltiples fuentes gobernadas.</p>
            </div>
          </div>
          <a href="/" className="inline-flex h-10 items-center gap-2 border border-slate-700 bg-black/20 px-3 text-xs text-slate-300 hover:border-cyan-400/30 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Inicio
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <ToroSearch />
      </div>
    </main>
  );
}
