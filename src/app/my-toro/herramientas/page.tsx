import Link from "next/link";
import { loadHotelDirectory } from "@/features/tools/server";
import { PortalHeader } from "@/features/portal/portal-header";
import styles from "../my-toro.module.css";

export const dynamic = "force-dynamic";

const shiftSteps = [
  { title: "Empezar el turno", text: "Lee el relevo. Revisa llegadas, salidas, solicitudes y agenda.", ids: ["LINK-048", "LINK-056"] },
  { title: "Atender a los huéspedes", text: "Consulta la reserva y responde las solicitudes en su canal.", ids: ["LINK-178"] },
  { title: "Preparar habitaciones", text: "Confirma con el equipo el aseo, las averías y las habitaciones listas.", ids: ["LINK-086"] },
  { title: "Cotizar una estancia", text: "Consulta fechas y condiciones en el motor de reservas.", ids: ["LINK-002"] },
  { title: "Revisar cobros", text: "Distingue saldo pendiente, comprobante, pago confirmado y factura.", ids: [] },
  { title: "Cerrar y preparar mañana", text: "Deja cada pendiente con responsable y siguiente paso en el relevo existente.", ids: ["LINK-131"] },
];

export default async function ToolsPage() {
  const view = await loadHotelDirectory();
  const links = view.state === "ready" ? view.links : [];
  return <>{view.account || view.state === "ready" ? <PortalHeader current="tools" scopeLabel="Dreamcatcher" /> : null}
    <main id="portal-content" tabIndex={-1} className={styles.screen}>
    <div className={styles.content}>
      <Link href="/my-toro" className={styles.backLink}>← Mi espacio</Link>
      <header className={styles.pageHeader}><div>
        <p className={styles.eyebrow}>Dreamcatcher · Operación</p>
        <h1>Tu turno, paso a paso</h1>
        <p className={styles.pageLead}>Abre la herramienta y completa cada tarea en su sistema.</p>
      </div></header>
      {view.account ? <p className={styles.guideNotice}>✓ Ya entraste con {view.account}</p> : null}
      {view.state !== "ready" ? <section className={styles.panel + " " + styles.paperPanel + " mt-3"}>
        <h2 className="font-semibold">{view.state === "denied" ? "Entra con tu cuenta de trabajo" : view.reason === "connection_pending" ? "Tu acceso está bien. Falta conectar la lista." : "No pudimos cargar las herramientas"}</h2>
        <p className="mt-2 text-slate-300">{view.state === "denied" ? "Tus permisos actuales determinan qué puedes ver." : view.account ? "Tu sesión está reconocida. No necesitas cambiar de usuario ni de contraseña. La lista no está disponible ahora." : "No podemos comprobar el acceso ahora. Vuelve a intentarlo más tarde."}</p>
        <Link className={styles.guideAction + " mt-3"} href={view.state === "denied" ? "/login?next=/my-toro/herramientas" : "/my-toro"}>{view.state === "denied" ? "Entrar y volver aquí" : "Volver a Mi espacio"}</Link>
      </section> : null}
      {view.state === "ready" || view.account ? <>
        <nav aria-label="Tareas del turno" className={styles.guideGrid}>
          {shiftSteps.map(step => <section key={step.title} id={step.ids.includes("LINK-086") ? "equipo" : undefined} className={styles.panel + " " + styles.paperPanel + " " + styles.guideStep}>
            <h2 className="text-lg font-bold">{step.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-300">{step.text}</p>
            <div className={styles.guideActions}>{links.filter(link => step.ids.includes(link.id)).map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
              className={styles.guideAction}>
              {link.label}<span className="ml-2" aria-label="abre otra pestaña">↗</span>
            </a>)}</div>
            {!step.ids.length ? <p className="mt-3 text-xs text-amber-200">Accesos de caja y facturación pendientes de validar.</p> : null}
            {step.ids.length > 0 && !links.some(link => step.ids.includes(link.id)) ? <p className="mt-3 text-xs text-amber-200">Acceso pendiente de conexión.</p> : null}
          </section>)}
        </nav>
        <details className={styles.guideDisclosure}><summary>Qué hace esta pantalla</summary>
          <p className="mt-3 text-sm leading-6 text-slate-300">Es una guía de accesos. No muestra ocupación, cobros, habitaciones listas ni tareas terminadas en tiempo real. Kross, los canales, DreamTeam y los sistemas de cobro conservan sus datos y permisos.</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">La secuencia es una ayuda para el turno: confirma con tu equipo quién hace cada paso. El resto del directorio se incorporará cuando sus permisos estén revisados.</p>
        </details>
      </> : null}
    </div>
  </main></>;
}
