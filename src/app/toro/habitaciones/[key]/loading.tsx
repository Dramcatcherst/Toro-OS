import { Loader2 } from "lucide-react";

export default function Room360Loading() {
  return (
    <main className="command-grid min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_34%),linear-gradient(180deg,rgba(8,15,32,0.94),rgba(3,7,18,1)),#030712] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center gap-3 border border-cyan-400/15 bg-slate-950/80 p-4 text-cyan-100">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <div className="text-sm font-semibold text-white">Cargando ficha 360</div>
            <div className="mt-1 text-xs text-slate-400">Consultando únicamente fuentes gobernadas de TORO OS.</div>
          </div>
        </div>

        <div className="grid animate-pulse gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-24 border border-slate-800 bg-slate-950/60" />
          ))}
        </div>
      </div>
    </main>
  );
}
