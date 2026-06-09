import Link from "next/link";
import { modules } from "@/lib/toro-data";

export default function ModulesPage() {
  return (
    <main className="min-h-screen bg-[#030712] p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-xs uppercase tracking-[0.18em] text-cyan-300">TORO OS / Command Home</Link>
        <h1 className="mt-3 text-4xl font-black text-white">Operational Modules</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Dedicated module registry. Every module keeps source, status, risk, confidence, approval and next action visible before any business action can move forward.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.id} href={`/modules/${module.id}`} className="border border-cyan-400/12 bg-slate-950/80 p-5 hover:border-cyan-300/40">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-white">{module.name}</h2>
                <span className="rounded-sm border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[10px] uppercase text-cyan-100">{module.status}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{module.purpose}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div><span className="text-slate-500">Source</span><br />{module.source}</div>
                <div><span className="text-slate-500">Risk</span><br />{module.risk}</div>
                <div><span className="text-slate-500">Confidence</span><br />{module.confidence}%</div>
                <div><span className="text-slate-500">Approval</span><br />{module.approval}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
