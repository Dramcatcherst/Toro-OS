import Link from "next/link";
import { ArrowUpRight, LayoutGrid, Network, UserRound } from "lucide-react";
import styles from "./portal.module.css";

export function PortalHeader({ current, scopeLabel = "Organización activa" }: {
  current: "overview" | "my-toro" | "brain" | "tools";
  scopeLabel?: string;
}) {
  const links = [
    { key: "overview", href: "/portal", label: "Portal", Icon: LayoutGrid },
    { key: "brain", href: "/brain", label: "Cerebro", Icon: Network },
    { key: "my-toro", href: "/my-toro", label: "Mi espacio", Icon: UserRound },
  ];
  return <header className={styles.header}>
    <a className={styles.skipLink} href="#portal-content">Saltar al contenido</a>
    <div className={styles.headerInner}>
      <Link href="/portal" prefetch={false} className={styles.brand} aria-label="TORO · Portal empresarial">
        <strong>TORO</strong><span>Tu Portal</span>
      </Link>
      <p className={styles.scope}><span aria-hidden="true" className={styles.scopeDot} />{scopeLabel}</p>
      <nav aria-label="Portal TORO" className={styles.navigation}>
        {links.map(({ key, href, label, Icon }) => <Link key={key} href={href} prefetch={false}
          aria-current={current === key || (current === "tools" && key === "my-toro") ? "page" : undefined}>
          <Icon size={17} aria-hidden="true" />{label}
        </Link>)}
      </nav>
    </div>
  </header>;
}

export function PortalConnectionNote() {
  return <p className={styles.connectionNote}><ArrowUpRight size={16} aria-hidden="true" />
    Las herramientas externas conservan sus sesiones y permisos. Sus enlaces no acreditan una integración completa.
  </p>;
}
