import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, CircleDollarSign, FolderKanban, LayoutGrid,
  Megaphone, Network, Palette, ServerCog, ShieldCheck, Users, Workflow } from "lucide-react";
import { resolveCurrentToroReadOnlyMenu } from "@/features/menu/server";
import { canReadHotelDirectory } from "@/features/tools/directory";
import { hasPortalOrganizationContext, resolvePortalModules } from "@/features/portal/model";
import { PortalConnectionNote, PortalHeader } from "@/features/portal/portal-header";
import styles from "@/features/portal/portal.module.css";
import { isPublicDemo } from "@/lib/server/public-demo";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
const icons = [Network, CalendarDays, CircleDollarSign, Palette, Users, Workflow,
  Users, Megaphone, ShieldCheck, Building2, FolderKanban, ServerCog];

export default async function PortalPage() {
  if (isPublicDemo()) redirect("/brain");
  const view = await resolveCurrentToroReadOnlyMenu();
  if (!view || view.state !== "resolved" || !hasPortalOrganizationContext(view.context)) {
    return <main className={styles.page}><div className={styles.content}>
      <p className={styles.eyebrow}>Portal TORO</p><h1 className="mt-3 text-3xl font-semibold">Tu espacio de trabajo</h1>
      <p className={styles.contextNote}>{view ? "Selecciona o revisa tu contexto autorizado en Mi TORO para abrir el Portal." : "Inicia sesión con tu cuenta de trabajo para acceder al Portal."}</p>
      <Link className={styles.personalLink + " mt-6"} href={view ? "/my-toro" : "/login?next=/portal"} prefetch={false}>
        {view ? "Ir a Mi TORO" : "Iniciar sesión"}<ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div></main>;
  }
  const modules = resolvePortalModules(view);
  const scopeLabel = canReadHotelDirectory(view.context) ? "Dreamcatcher" : "Organización activa";
  return <>
    <PortalHeader current="overview" scopeLabel={scopeLabel} />
    <main className={styles.page}><div className={styles.content}>
      <div className={styles.hero}>
        <div><p className={styles.eyebrow}>Una plataforma · Tu contexto autorizado</p>
          <h1>Portal TORO</h1><p>La visión completa de tu trabajo, tus herramientas y los módulos de TORO.
            Mi TORO es tu espacio personal dentro de este mismo Portal.</p>
        </div>
        <Link href="/my-toro" prefetch={false} className={styles.personalLink}>Abrir Mi TORO <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <p className={styles.contextNote}><strong>{scopeLabel}.</strong> Ves las consultas permitidas para tu cuenta.
        Los negocios y proyectos se reúnen por su contexto autorizado. Los módulos en preparación se muestran como referencia del producto.</p>
      <section aria-labelledby="portal-modules-heading">
        <h2 id="portal-modules-heading" className={styles.sectionTitle}>Cerebro y módulos del Portal</h2>
        <p className={styles.sectionNote}>La estructura del Plan General. Cada módulo muestra su acceso actual; su presencia no significa que esté completamente integrado.</p>
        <div className={styles.grid}>{modules.map(module => {
          const Icon = icons[module.ordinal] ?? LayoutGrid;
          return <article key={module.ordinal} className={styles.card}>
            <div className={styles.cardTop}><span className={styles.icon}><Icon size={21} aria-hidden="true" /></span>
              <span className={styles.number}>MÓDULO {String(module.ordinal).padStart(2, "0")}</span></div>
            <h3>{module.label}</h3><p className={styles.description}>{module.description}</p>
            <p className={styles.status}>{module.status}</p><p className={styles.note}>{module.note}</p>
            {module.href ? <Link className={styles.cardLink} href={module.href} prefetch={false}>{module.action}<ArrowRight size={16} aria-hidden="true" /></Link> : null}
          </article>;
        })}</div>
      </section>
      <PortalConnectionNote />
    </div></main>
  </>;
}
