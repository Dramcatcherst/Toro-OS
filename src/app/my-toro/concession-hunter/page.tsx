import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Map, SearchCheck, ShieldAlert } from "lucide-react";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";
import { hasPortalOrganizationContext } from "@/features/portal/model";

export const dynamic = "force-dynamic";

const publicSources = [
  { label: "SIRI · concesiones y expedientes", url: "https://siri.snitcr.go.cr/siri/mapa", note: "La ausencia de un resultado no certifica disponibilidad." },
  { label: "Municipalidad de Cóbano · ZMT", url: "https://www.municobano.go.cr/index.php/es/gestion-municipal/servicios-tributarios/zona-maritimo-terrestre/departamento-zmt", note: "Planes reguladores, expedientes y trámites oficiales." },
  { label: "SNIT · cartografía y catastro", url: "https://www.snitcr.go.cr/Visor/exploradorcapas", note: "Cruzar polígonos y coordenadas de fuentes oficiales." },
  { label: "SINAC · Patrimonio Natural del Estado", url: "https://sinacpatrimonio.addax.cr/", note: "Una zona ambiental protegida requiere análisis distinto." },
] as const;

const regions = [
  { name: "Cabuya–Montezuma", evidence: "Plan costero integral publicado en 2016", next: "Cruzar expedientes nuevos, zonificación MIX/TAP y PNE." },
  { name: "Tambor–Tango Mar", evidence: "Plan sectorial de Playa Tambor publicado", next: "Obtener cartografía vigente y solicitudes de cada mojón." },
  { name: "Paquera–San Miguel de Coyote", evidence: "Varios municipios y planes diferentes", next: "Solicitar inventarios municipales por polígono y verificar Registro." },
] as const;

function canViewPrivatePortfolio(context: NonNullable<Awaited<ReturnType<typeof resolveCurrentToroReadOnlyMenu>>>["context"]): boolean {
  return Boolean(
    hasPortalOrganizationContext(context) &&
      context.membership?.membershipType === "owner" &&
      context.membership.roles.includes("ADMIN") &&
      context.canUsePersonalVault &&
      context.allowedDataScopes.includes("personal"),
  );
}

/** Read-only research surface. No private portfolio data is embedded or fetched here. */
export default async function ConcessionHunterPage() {
  const view = await resolveCurrentToroReadOnlyMenu();
  if (!view) redirect("/login?next=/my-toro/concession-hunter");
  if (view.state !== "resolved" || !canViewPrivatePortfolio(view.context)) redirect("/my-toro");

  return <main className="min-h-screen bg-[#091826] text-slate-100">
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <nav aria-label="Navegación del propietario" className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/my-toro" className="inline-flex min-h-11 items-center text-sm font-bold text-cyan-200 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-cyan-300">← Mi espacio TORO</Link>
        <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100">Propietario · consulta privada</span>
      </nav>

      <header className="rounded-3xl border-2 border-cyan-500/35 bg-[#16334c] p-5 shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">TORO · Activos y Espacios / Legal y Riesgo</p>
        <div className="mt-3 flex items-start gap-3">
          <Map aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-cyan-300" />
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Concession Hunter</h1>
            <p className="mt-2 text-sm leading-6 text-slate-200">Investigación costera y verificación jurídica, subordinada al único Plan General de TORO.</p>
          </div>
        </div>
        <p role="status" className="mt-4 rounded-xl border border-amber-400/45 bg-amber-300/10 px-3 py-3 text-sm text-amber-100">
          <strong>Estado: catálogo público de referencia.</strong> Todavía no existe sincronización automática del expediente patrimonial privado en esta pantalla. No se certifican terrenos disponibles ni se hacen gestiones.
        </p>
      </header>

      <section aria-labelledby="ch-regiones">
        <h2 id="ch-regiones" className="mb-3 text-xl font-bold">Corredores a investigar</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {regions.map(region => <article key={region.name} className="rounded-2xl border-2 border-sky-400/25 bg-[#18324a] p-4">
            <h3 className="text-lg font-bold text-white">{region.name}</h3>
            <p className="mt-2 text-sm text-slate-200">{region.evidence}</p>
            <p className="mt-3 text-sm text-cyan-200"><strong>Siguiente verificación:</strong> {region.next}</p>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="ch-flujo" className="rounded-2xl border-2 border-amber-400/25 bg-[#12283d] p-4">
        <h2 id="ch-flujo" className="flex items-center gap-2 text-xl font-bold"><SearchCheck aria-hidden="true" className="h-5 w-5 text-amber-300" /> Filtro de disponibilidad legal</h2>
        <ol className="mt-3 grid list-decimal gap-x-7 gap-y-2 pl-5 text-sm leading-6 text-slate-200 md:grid-cols-2">
          <li>Identificar mojón, plano y polígono con fuente y fecha.</li>
          <li>Consultar solicitudes, expedientes, oposiciones y ocupación municipal.</li>
          <li>Comprobar título de concesión o inexistencia en Registro/SIRI.</li>
          <li>Validar zonificación, acceso, PNE, aptitud turística y restricciones.</li>
          <li>Analizar concentración por persona, cónyuge, hijos menores y control societario.</li>
          <li>Solo con certificaciones, preparar una posible solicitud para aprobación humana.</li>
        </ol>
        <div className="mt-4 flex gap-2 rounded-xl border border-rose-300/30 bg-rose-500/10 p-3 text-sm text-rose-100">
          <ShieldAlert aria-hidden="true" className="mt-1 h-5 w-5 shrink-0"/>
          <p><strong>Regla jurídica:</strong> una solicitud archivada o la falta de resultados en Internet no constituye terreno libre. Una autorización de empresa tampoco concede automáticamente una segunda concesión personal.</p>
        </div>
      </section>

      <section aria-labelledby="ch-fuentes">
        <h2 id="ch-fuentes" className="mb-3 text-xl font-bold">Fuentes oficiales</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {publicSources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="flex min-h-20 items-start gap-3 rounded-2xl border-2 border-slate-600 bg-[#233e54] p-4 hover:border-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
            <ExternalLink aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan-200"/>
            <span><strong className="block text-sm">{source.label}</strong><span className="mt-1 block text-xs leading-5 text-slate-200">{source.note}</span></span>
          </a>)}
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-300">Las fichas de propietarios, sociedades, patrimonio, expedientes privados y autorizaciones de acceso se mantienen fuera de GitHub público y se habilitarán únicamente mediante lectura de Supabase con control de identidad y permisos. Este portal no sustituye certificaciones oficiales ni habilita compras o presentaciones.</p>
    </div>
  </main>;
}
