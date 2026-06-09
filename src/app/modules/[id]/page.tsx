import Link from "next/link";
import { notFound } from "next/navigation";
import { connectorEndpoints, connectors, modules, queuedActions } from "@/lib/toro-data";

export function generateStaticParams() {
  return modules.map((module) => ({ id: module.id }));
}

export default async function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const operatingModule = modules.find((item) => item.id === id);

  if (!operatingModule) {
    notFound();
  }

  const relatedActions = queuedActions.filter((action) => action.module === operatingModule.name || action.module.includes(operatingModule.name.split(" ")[0]));
  const relatedConnectors = connectors.filter((connector) => operatingModule.primaryObjects.some((object) => connector.name.toLowerCase().includes(object.toLowerCase().split(" ")[0])));

  return (
    <main className="min-h-screen bg-[#030712] p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/modules" className="text-xs uppercase tracking-[0.18em] text-cyan-300">TORO OS / Modules</Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">Back to Command Home</Link>
        </div>

        <section className="mt-6 border border-cyan-400/12 bg-slate-950/80 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white">{operatingModule.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{operatingModule.purpose}</p>
            </div>
            <span className="rounded-sm border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs uppercase text-amber-100">{operatingModule.actionLevel}</span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ["Source", operatingModule.source],
              ["Status", operatingModule.status],
              ["Risk", operatingModule.risk],
              ["Confidence", `${operatingModule.confidence}%`],
              ["Approval", operatingModule.approval],
              ["Next Action", operatingModule.nextAction],
            ].map(([label, value]) => (
              <div key={label} className="border border-slate-800 bg-black/25 p-4">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-1 text-sm text-slate-100">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="border border-cyan-400/12 bg-slate-950/80 p-5">
            <h2 className="font-semibold text-white">Primary Objects</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {operatingModule.primaryObjects.map((object) => <span key={object} className="rounded-sm border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">{object}</span>)}
            </div>
          </div>

          <div className="border border-cyan-400/12 bg-slate-950/80 p-5">
            <h2 className="font-semibold text-white">Queued Actions</h2>
            <div className="mt-3 space-y-2">
              {(relatedActions.length ? relatedActions : queuedActions.slice(0, 2)).map((action) => (
                <div key={action.id} className="border border-slate-800 bg-black/25 p-3 text-xs text-slate-300">
                  <div className="font-semibold text-white">{action.title}</div>
                  <div className="mt-1 text-slate-500">{action.approval} / {action.risk}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-cyan-400/12 bg-slate-950/80 p-5">
            <h2 className="font-semibold text-white">Connector Surface</h2>
            <div className="mt-3 space-y-2">
              {(relatedConnectors.length ? relatedConnectors : connectors.slice(0, 2)).map((connector) => (
                <div key={connector.id} className="border border-slate-800 bg-black/25 p-3 text-xs text-slate-300">
                  <div className="font-semibold text-white">{connector.name}</div>
                  <div className="mt-1 text-slate-500">{connector.mode} / {connector.status}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 border border-cyan-400/12 bg-slate-950/80 p-5">
          <h2 className="font-semibold text-white">Available Safe API Scaffolds</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {connectorEndpoints.map((endpoint) => (
              <div key={endpoint.id} className="border border-slate-800 bg-black/25 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{endpoint.name}</span>
                  <span className="text-cyan-200">{endpoint.mode}</span>
                </div>
                <div className="mt-1 font-mono text-slate-500">{endpoint.method} {endpoint.route}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
