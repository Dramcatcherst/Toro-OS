import Link from "next/link";
import { useId } from "react";
import { ArrowRight, Building2, CalendarDays, CircleDollarSign, FolderKanban, LayoutGrid,
  Megaphone, Network, Palette, ServerCog, ShieldCheck, Users, Workflow } from "lucide-react";
import type { PortalModule } from "./model";
import styles from "./portal.module.css";
import interactions from "./module-card-interaction.module.css";

const icons = [Network, CalendarDays, CircleDollarSign, Palette, Users, Workflow,
  Users, Megaphone, ShieldCheck, Building2, FolderKanban, ServerCog];

export function PortalModuleCard({ module }: { module: PortalModule }) {
  const Icon = icons[module.ordinal] ?? LayoutGrid;
  const id = `portal-module-${module.ordinal}-${useId()}`;
  const contents = <>
    <div className={styles.cardTop}><span className={styles.icon} aria-hidden="true"><Icon size={28} strokeWidth={1.7} /></span>
      <div className={styles.cardTitle}><span className={styles.number}>MÓDULO {String(module.ordinal).padStart(2, "0")}</span>
        <h3 id={id}>{module.label}</h3></div></div>
    {module.href ? <p id={`${id}-description`} className={styles.description}>{module.description}</p> : null}
    <div className={styles.cardBottom}><p id={`${id}-status`} className={styles.status}>{module.status}</p>
      {!module.href ? <span className={styles.pendingLabel}>Pendiente</span> : null}</div>
    {module.href ? <p id={`${id}-note`} className={styles.note}>{module.note}</p> : <details className={styles.subtleDisclosure}>
      <summary>Detalle y cobertura</summary>
      <p id={`${id}-description`} className={styles.description}>{module.description}</p>
      <p id={`${id}-note`} className={styles.note}>{module.note}</p>
    </details>}
    {module.action ? <span className={styles.cardAction}>{module.action}<ArrowRight size={18} aria-hidden="true" /></span> : null}
  </>;
  const description = `${id}-description ${id}-status ${id}-note`;
  return module.href ? <Link href={module.href} prefetch={false}
    className={styles.card + " " + styles.cardAvailable + " " + interactions.interactive} data-module={module.ordinal} aria-labelledby={id} aria-describedby={description}>
    {contents}
  </Link> : <article className={styles.card + " " + styles.cardPending} data-module={module.ordinal} aria-labelledby={id} aria-describedby={description}>
    {contents}
  </article>;
}
