import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";
import { canReadHotelDirectory } from "@/features/tools/directory";
import { loadHotelDirectory } from "@/features/tools/server";
import { PortalToolLinks } from "@/features/tools/portal-tool-links";
import { hasPortalOrganizationContext, resolvePortalModules } from "@/features/portal/model";
import { PortalModuleCard } from "@/features/portal/module-card";
import { PortalConnectionNote, PortalHeader } from "@/features/portal/portal-header";
import styles from "@/features/portal/portal.module.css";
import { isPublicDemo } from "@/lib/server/public-demo";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  if (isPublicDemo()) redirect("/brain");
  const view = await resolveCurrentToroReadOnlyMenu();
  if (!view || view.state !== "resolved" || !hasPortalOrganizationContext(view.context)) {
    return <main id="portal-content" className={styles.page}><div className={styles.content}>
      <p className={styles.eyebrow}>Portal TORO</p><h1 className="mt-3 text-3xl font-semibold">Tu espacio de trabajo</h1>
      <p className={styles.contextNote}>{view ? "Revisa tu contexto autorizado en Mi espacio para abrir el Portal." : "Inicia sesión con tu cuenta de trabajo para acceder al Portal."}</p>
      <Link className={styles.personalLink + " mt-6"} href={view ? "/my-toro" : "/login?next=/portal"} prefetch={false}>
        {view ? "Ir a Mi espacio" : "Iniciar sesión"}<ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div></main>;
  }
  const modules = resolvePortalModules(view);
  const hotelAllowed = canReadHotelDirectory(view.context);
  const scopeLabel = hotelAllowed ? "Dreamcatcher" : "Organización activa";
  const directory = hotelAllowed ? await loadHotelDirectory() : null;
  const links = directory?.state === "ready" ? directory.links : [];
  const availableCount = modules.filter(module => module.href).length;
  return <>
    <PortalHeader current="overview" scopeLabel={scopeLabel} />
    <main id="portal-content" className={styles.page} tabIndex={-1}><div className={styles.content}>
      <div className={styles.hero}>
        <div><p className={styles.eyebrow}>Un Portal · Tu espacio de trabajo</p>
          <h1>Portal TORO</h1><p>Tus prioridades, consultas, equipo y herramientas en un solo lugar.
            Mi TORO es tu espacio personal dentro de este mismo Portal.</p>
        </div>
        <Link href="/my-toro" prefetch={false} className={styles.personalLink}><Search size={18} aria-hidden="true" />Buscar en Mi espacio<ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <nav className={styles.sectionNav} aria-label="Secciones del Portal">
        <a href="#portal-modules-heading">Módulos <span>{modules.length}</span></a>
        {hotelAllowed ? <a href="#portal-tools-heading">Herramientas <span>{links.length}</span></a> : null}
        <a href="#portal-scope">Mi contexto</a>
      </nav>
      <p id="portal-scope" className={styles.contextNote}><strong>{scopeLabel}.</strong> Accesos según tu cuenta.
        <span> {availableCount} módulos con destino disponible; {modules.length - availableCount} en preparación.</span>
        <small>Un destino disponible puede ser una consulta o una guía. Cada vista informa su cobertura.</small>
      </p>
      <div className={styles.portalLayout}>
        <section aria-labelledby="portal-modules-heading" className={styles.moduleSection}>
          <div className={styles.sectionHeading}><h2 id="portal-modules-heading" tabIndex={-1}>Cerebro y módulos</h2><span>Plan General · 00–11</span></div>
          <p className={styles.sectionNote}>Abre una tarjeta completa para entrar. Los módulos en preparación conservan su lugar en el Plan.</p>
          <div className={styles.grid}>{modules.map(module => <PortalModuleCard key={module.ordinal} module={module} />)}</div>
        </section>
        {hotelAllowed ? <section className={styles.toolsPanel} aria-labelledby="portal-tools-heading">
          <div className={styles.sectionHeading}><h2 id="portal-tools-heading" tabIndex={-1}>Tu trabajo diario</h2><span>{links.length} accesos</span></div>
          <p className={styles.sectionNote}>Herramientas del hotel incorporadas al Portal.</p>
          {links.length ? <PortalToolLinks links={links} wide /> : <p role="status" className={styles.contextNote}>La lista no está disponible ahora. Puedes consultar la guía del turno.</p>}
          <div className={styles.toolsFooter}><p className={styles.note}>Cada herramienta conserva su sesión y permisos.</p>
            <Link className={styles.guideLink} href="/my-toro/herramientas" prefetch={false}>Guía de mi turno<ArrowRight size={18} aria-hidden="true" /></Link></div>
        </section> : null}
      </div>
      <PortalConnectionNote />
    </div></main>
  </>;
}
