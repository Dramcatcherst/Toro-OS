import Link from "next/link";
import { loadHotelDirectory } from "@/features/tools/server";

export const dynamic = "force-dynamic";

const shiftSteps = [
  { title: "🌅 Empezar el turno", text: "Lee el relevo. Revisa llegadas, salidas, solicitudes y agenda.", ids: ["LINK-048", "LINK-056"] },
  { title: "🛎️ Atender a los huéspedes", text: "Consulta la reserva y responde las solicitudes en su canal.", ids: ["LINK-178"] },
  { title: "🧹 Preparar habitaciones", text: "Confirma con el equipo el aseo, las averías y las habitaciones listas.", ids: ["LINK-086"] },
  { title: "💬 Cotizar una estancia", text: "Consulta fechas y condiciones en el motor de reservas.", ids: ["LINK-002"] },
  { title: "💰 Revisar cobros", text: "Distingue saldo pendiente, comprobante, pago confirmado y factura.", ids: [] },
  { title: "🌙 Cerrar y preparar mañana", text: "Deja cada pendiente con responsable y siguiente paso en el relevo existente.", ids: ["LINK-131"] },
];

export default async function ToolsPage() {
  const view = await loadHotelDirectory();
  const links = view.state === "ready" ? view.links : [];
  return <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
    <div className="mx-auto max-w-5xl">
      <Link href="/my-toro" className="text-cyan-200 underline">← Mi TORO</Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-cyan-200">Dreamcatcher · Operación del hotel</p>
      <h1 className="mt-2 text-3xl font-bold">Tu turno, paso a paso</h1>
      <p className="mt-3 max-w-2xl text-slate-300">Empieza por lo que necesitas hacer. Aquí abres las herramientas; confirma los datos y termina cada tarea en su sistema.</p>
      {view.account ? <p className="mt-4 break-all rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-100">✓ Ya entraste con {view.account}</p> : null}
      {view.state !== "ready" ? <section className="mt-6 rounded-2xl border border-slate-700 p-5">
        <h2 className="font-semibold">{view.state === "denied" ? "Entra con tu cuenta de trabajo" : view.reason === "connection_pending" ? "Tu acceso está bien. Falta conectar la lista." : "No pudimos cargar las herramientas"}</h2>
        <p className="mt-2 text-slate-300">{view.state === "denied" ? "Tus permisos actuales determinan qué puedes ver." : view.account ? "Tu sesión está reconocida. No necesitas cambiar de usuario ni de contraseña. La lista no está disponible ahora." : "No podemos comprobar el acceso ahora. Vuelve a intentarlo más tarde."}</p>
        <Link className="mt-4 inline-block text-cyan-200 underline" href={view.state === "denied" ? "/login?next=/my-toro/herramientas" : "/my-toro"}>{view.state === "denied" ? "Entrar y volver aquí" : "Volver a Mi TORO"}</Link>
      </section> : null}
      {view.state === "ready" || view.account ? <>
        <nav aria-label="Tareas del turno" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shiftSteps.map(step => <section key={step.title} className="flex flex-col rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-bold">{step.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-300">{step.text}</p>
            <div className="mt-4 flex flex-col gap-3">{links.filter(link => step.ids.includes(link.id)).map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
              className="rounded-xl border border-cyan-700 bg-cyan-950 px-3 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">
              {link.label}<span className="ml-2" aria-label="abre otra pestaña">↗</span>
            </a>)}</div>
            {!step.ids.length ? <p className="mt-3 text-xs text-amber-200">Accesos de caja y facturación pendientes de validar.</p> : null}
            {step.ids.length > 0 && !links.some(link => step.ids.includes(link.id)) ? <p className="mt-3 text-xs text-amber-200">Acceso pendiente de conexión.</p> : null}
          </section>)}
        </nav>
        <details className="mt-6 rounded-2xl border border-slate-700 p-4"><summary className="cursor-pointer">Qué hace esta pantalla</summary>
          <p className="mt-3 text-sm leading-6 text-slate-300">Es una guía de accesos. No muestra ocupación, cobros, habitaciones listas ni tareas terminadas en tiempo real. Kross, los canales, DreamTeam y los sistemas de cobro conservan sus datos y permisos.</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">La secuencia es una ayuda para el turno: confirma con tu equipo quién hace cada paso. El resto del directorio se incorporará cuando sus permisos estén revisados.</p>
        </details>
      </> : null}
    </div>
  </main>;
}
