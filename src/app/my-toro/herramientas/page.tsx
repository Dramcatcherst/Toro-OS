import Link from "next/link";
import { loadHotelDirectory } from "@/features/tools/server";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const view = await loadHotelDirectory();
  return <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
    <div className="mx-auto max-w-4xl">
      <Link href="/my-toro" className="text-cyan-200 underline">← Mi TORO</Link>
      <h1 className="mt-6 text-3xl font-bold">¿Qué necesitas hacer?</h1>
      {view.state !== "ready" ? <section className="mt-6 rounded-2xl border border-slate-700 p-5">
        <h2 className="font-semibold">{view.state === "denied" ? "Necesitas un contexto autorizado del hotel" : "No pudimos cargar las herramientas"}</h2>
        <p className="mt-2">{view.state === "denied" ? "Entra con tu cuenta de TORO. Tus permisos actuales determinan qué puedes ver." : "Vuelve a intentarlo más tarde. No mostramos una lista guardada de otra sesión."}</p>
        <Link className="mt-4 inline-block text-cyan-200 underline" href="/login">Ir al acceso</Link>
      </section> : <>
        <p className="mt-3 text-slate-300">Elige una tarea. Comprueba la cuenta y el hotel al entrar.</p>
        <nav aria-label="Herramientas del hotel" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {view.links.map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
            className="rounded-2xl border border-slate-600 p-5 font-semibold hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">
            {link.label}<span className="ml-2" aria-label="abre otra pestaña">↗</span>
          </a>)}
        </nav>
        <details className="mt-6 rounded-2xl border border-slate-700 p-4"><summary className="cursor-pointer">ⓘ Sobre estos accesos</summary>
          <p className="mt-3 text-slate-300">Abrir una herramienta no confirma disponibilidad, precio ni permisos dentro de ella. Cada servicio conserva su acceso.</p>
          <p className="mt-3 text-slate-300">Esta primera vista contiene los accesos diarios del hotel. El resto del directorio necesita clasificación de permisos antes de mostrarse aquí. Los favoritos de la maqueta no se guardan en tu cuenta.</p>
        </details>
      </>}
    </div>
  </main>;
}
