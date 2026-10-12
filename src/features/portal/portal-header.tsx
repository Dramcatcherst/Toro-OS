import Link from "next/link";
import { ArrowUpRight, Building2, ChevronDown, Home, Network, UserRound, Wrench, CloudSun } from "lucide-react";
import { PortalSignOut } from "@/features/auth/portal-sign-out";
import { PortalClock } from "./portal-clock";
import styles from "./portal.module.css";

export function PortalHeader({ current, scopeLabel = "Organización activa", includeTools = current === "tools" }: {
  current: "overview" | "my-toro" | "brain" | "tools";
  scopeLabel?: string;
  includeTools?: boolean;
}) {
  const links = [
    { key: "overview", href: "/portal", label: "Inicio", Icon: Home },
    { key: "brain", href: "/brain", label: "Cerebro", Icon: Network },
    { key: "tools", href: "/my-toro/herramientas", label: "Herramientas", Icon: Wrench },
    { key: "my-toro", href: "/my-toro", label: "Mi espacio", Icon: UserRound },
  ];
  return <header className={styles.header}>
    <a className={styles.skipLink} href="#portal-content">Saltar al contenido</a>
    <div className={styles.headerInner}>
      <Link href="/portal" prefetch={false} className={styles.brand} aria-label="TORO · Portal empresarial">
        <strong>TORO</strong><span>OPERATION SYSTEM</span>
      </Link>
      <Link href="/my-toro#mi-cuenta" prefetch={false} className={styles.scope} aria-label={`Mi contexto: ${scopeLabel}`}>
        <Building2 size={16} aria-hidden="true" />{scopeLabel}
      </Link>
      <div className={styles.headerUtilities}><PortalClock />{includeTools ? <a className={styles.weatherLink} href="https://www.google.com/search?q=clima+Santa+Teresa+Costa+Rica" target="_blank" rel="noopener noreferrer" aria-label="Consultar clima de Santa Teresa"><CloudSun size={17} aria-hidden="true" />Clima ↗</a> : null}</div>
      <details className={styles.headerMenu}>
        <summary><UserRound size={17} aria-hidden="true" />Menú<ChevronDown size={14} aria-hidden="true" /></summary>
        <nav aria-label="Portal TORO">
        {links.filter(link => includeTools || link.key !== "tools").map(({ key, href, label, Icon }) => <Link key={key} href={href} prefetch={false}
          aria-current={current === key ? "page" : undefined}>
          <Icon size={17} aria-hidden="true" />{label}
        </Link>)}
          <PortalSignOut className={styles.textLink} />
        </nav>
      </details>
    </div>
    {current !== "overview" ? <PortalAgents /> : null}
  </header>;
}

export function PortalAgents() {
  return <div className={styles.agentRail} aria-label="Especialistas TORO: sin señal de actividad">
      <span className={styles.agentCaption}>Agentes</span>
      {["TORO", "TERE", "RICO", "FIONA", "SKY", "SOBRESITO"].map(name => <span key={name} className={styles.agent}><i aria-hidden="true" /><span className={styles.agentFull}>{name}</span><abbr className={styles.agentShort} title={name}>{name.slice(0, 2)}</abbr></span>)}
      <span className={styles.agentSignal}>Sin señal</span>
    </div>;
}

export function PortalConnectionNote() {
  return <p className={styles.connectionNote}><ArrowUpRight size={16} aria-hidden="true" />
    Herramientas externas · sesión y permisos propios.
  </p>;
}
