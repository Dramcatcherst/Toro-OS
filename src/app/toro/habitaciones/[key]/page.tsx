import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  Building2,
  ExternalLink,
  Film,
  ImageIcon,
  ListChecks,
  Users,
} from "lucide-react";
import { loadRoom360FromAirtable } from "@/lib/server/room-360";

type Room360Media = {
  key: string;
  name: string;
  publicUrl: string;
  approved: boolean;
  identityScope: "exact" | "shared";
  sharedWith: string[];
};

type Room360View = {
  summary: {
    key: string;
    number: string;
    name: string;
    status: string;
    property: string;
    capacity: number | null;
    beds: string;
    kitchen: string;
    projector: boolean;
    floor: string;
    amenityCount: number;
  };
  sale: Array<{ key: string; name: string; type: string; status: string }>;
  kross: { authority: string; referenceKey: string; directBookingUrl: string; syncStatus: string };
  media: {
    hero: Room360Media[];
    web: Room360Media[];
    kross: Room360Media[];
    pending: Room360Media[];
  };
  operation: {
    tasks: Array<{ key: string; title: string; status: string; priority: string }>;
    validations: Array<{ key: string; title: string; status: string; severity: string }>;
  };
  knowledge: Array<{ key: string; title: string; status: string }>;
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-cyan-400/12 bg-slate-950/72">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-slate-800 bg-black/25 p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function MediaCard({ asset, roomNumber }: { asset: Room360Media; roomNumber: string }) {
  const sharedLabel = asset.sharedWith.map((key) => key.replace("DC-ROOM-", "#")).join(" / ");
  return (
    <article className="overflow-hidden border border-slate-800 bg-black/25">
      {asset.publicUrl ? (
        <div
          className="aspect-[4/3] bg-slate-900 bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(asset.publicUrl)})` }}
          role="img"
          aria-label={asset.name}
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-slate-900 text-slate-600">
          <ImageIcon className="h-7 w-7" />
        </div>
      )}
      <div className="p-3">
        <div className="line-clamp-2 text-xs font-semibold text-white">{asset.name || asset.key}</div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-cyan-200">
          {asset.identityScope === "shared" ? `Compartida #${roomNumber} / ${sharedLabel}` : `Específica #${roomNumber}`}
        </div>
      </div>
    </article>
  );
}

export default async function Room360Page({ params }: { params: Promise<{ key: string }> }) {
  const { key: encodedKey } = await params;
  const roomKey = decodeURIComponent(encodedKey).slice(0, 80);
  const view = (await loadRoom360FromAirtable(roomKey)) as Room360View;

  if (!view.summary.key) {
    return (
      <main className="command-grid min-h-screen px-4 py-8 md:px-6">
        <div className="mx-auto max-w-3xl border border-amber-300/25 bg-slate-950/80 p-6">
          <AlertTriangle className="h-6 w-6 text-amber-200" />
          <h1 className="mt-4 text-2xl font-black text-white">Habitación no encontrada</h1>
          <p className="mt-2 text-sm text-slate-400">TORO no encontró una habitación gobernada con la clave solicitada.</p>
          <Link href="/toro/buscar" className="mt-5 inline-flex h-10 items-center gap-2 border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100">
            <ArrowLeft className="h-4 w-4" /> Volver a buscar
          </Link>
        </div>
      </main>
    );
  }

  const media = [...view.media.hero, ...view.media.web, ...view.media.kross, ...view.media.pending].slice(0, 12);

  return (
    <main className="command-grid min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_80%_8%,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,rgba(8,15,32,0.94),rgba(3,7,18,1)),#030712]">
      <header className="border-b border-cyan-400/10 bg-slate-950/88 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300">Ficha 360 · {view.summary.key}</div>
            <h1 className="mt-1 text-xl font-black text-white md:text-3xl">{view.summary.name}</h1>
            <p className="mt-1 text-xs text-slate-400">{view.summary.property} · estado {view.summary.status || "sin clasificar"}</p>
          </div>
          <Link href="/toro/buscar" className="inline-flex h-10 shrink-0 items-center gap-2 border border-slate-700 bg-black/20 px-3 text-xs text-slate-300 hover:border-cyan-400/30 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Buscar
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <Panel title="Resumen">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Fact label="Capacidad" value={<span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-cyan-300" />{view.summary.capacity ?? "—"}</span>} />
            <Fact label="Camas" value={<span className="inline-flex items-start gap-2"><BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />{view.summary.beds || "—"}</span>} />
            <Fact label="Cocina" value={view.summary.kitchen || "—"} />
            <Fact label="Proyector" value={<span className="inline-flex items-center gap-2"><Film className="h-4 w-4 text-cyan-300" />{view.summary.projector ? "Sí" : "No"}</span>} />
            <Fact label="Amenidades" value={view.summary.amenityCount} />
            <Fact label="Estado" value={view.summary.status || "—"} />
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Venta">
            <div className="space-y-2">
              {view.sale.map((unit) => (
                <div key={unit.key} className="flex items-center justify-between gap-3 border border-slate-800 bg-black/25 p-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{unit.name}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{unit.type}</div>
                  </div>
                  <span className="font-mono text-[10px] uppercase text-cyan-200">{unit.status}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Kross — autoridad transaccional">
            <div className="flex gap-3 text-sm text-slate-300">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
              <div>
                <p>TORO muestra la referencia y el acceso. Precio, disponibilidad, reserva y pago permanecen en Kross.</p>
                {view.kross.directBookingUrl ? (
                  <a href={view.kross.directBookingUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-10 items-center gap-2 border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/15">
                    Abrir Kross <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <div className="mt-3 text-xs text-amber-200">Sin enlace Kross gobernado disponible.</div>
                )}
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Media gobernada">
          {media.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {media.map((asset) => <MediaCard key={asset.key} asset={asset} roomNumber={view.summary.number} />)}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No hay media segura disponible en esta lectura.</p>
          )}
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Operación">
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300"><ListChecks className="h-4 w-4 text-cyan-300" />Tareas enlazadas</div>
                {view.operation.tasks.length ? view.operation.tasks.map((task) => (
                  <div key={task.key} className="mb-2 border border-slate-800 bg-black/25 p-3 text-sm text-white">{task.title}<div className="mt-1 text-[11px] text-slate-500">{task.status} · {task.priority}</div></div>
                )) : <p className="text-xs text-slate-500">Sin tareas estructuralmente enlazadas.</p>}
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold text-slate-300">Validaciones</div>
                {view.operation.validations.length ? view.operation.validations.map((validation) => (
                  <div key={validation.key} className="mb-2 border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-50">{validation.title}<div className="mt-1 text-[11px] text-amber-200/70">{validation.status} · {validation.severity}</div></div>
                )) : <p className="text-xs text-slate-500">Sin validaciones estructuralmente enlazadas.</p>}
              </div>
            </div>
          </Panel>

          <Panel title="Conocimiento">
            {view.knowledge.length ? (
              <div className="space-y-2">{view.knowledge.map((item) => <div key={item.key} className="border border-slate-800 bg-black/25 p-3 text-sm text-white">{item.title}</div>)}</div>
            ) : (
              <p className="text-sm leading-6 text-slate-400">Todavía no hay un SOP enlazado estructuralmente a esta habitación. TORO no inventa una relación por coincidencia de texto.</p>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
