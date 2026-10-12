import Image from "next/image";
import { ArrowUpRight, CalendarDays, FolderOpen, MessagesSquare, Users, BedDouble } from "lucide-react";
import type { ToolLink } from "./directory";
import styles from "@/features/portal/portal.module.css";

const brands = {
  "LINK-048": { name: "Kross", title: "Ver reservas", detail: "Llegadas, salidas y reservas", Icon: BedDouble, logo: "/brand/tools/kross.png" },
  "LINK-002": { name: "Motor Kross", title: "Cotizar estancia", detail: "Fechas, precios y condiciones", Icon: BedDouble, logo: "/brand/tools/kross.png" },
  "LINK-178": { name: "WeSpeak", title: "Atender huéspedes", detail: "Conversaciones y solicitudes", Icon: MessagesSquare, logo: "/brand/tools/wespeak.ico" },
  "LINK-086": { name: "DreamTeam · TORO People", title: "Ver equipo", detail: "Equipo · sesión propia", Icon: Users, logo: "/brand/tools/dreamteam.svg" },
  "LINK-056": { name: "Google Calendar", title: "Ver agenda", detail: "Agenda del hotel", Icon: CalendarDays, logo: "/brand/tools/google.svg" },
  "LINK-131": { name: "Dropbox", title: "Buscar documentos", detail: "Archivos del hotel", Icon: FolderOpen, logo: "/brand/tools/dropbox.svg" },
} as const;

/** Presentation only: destinations must already be filtered by the approved directory reader. */
export function PortalToolLinks({ links, compact = false, wide = false }: { links: ToolLink[]; compact?: boolean; wide?: boolean }) {
  return <nav aria-label="Herramientas del hotel" className={wide ? styles.toolsWide : compact ? styles.toolsCompact : styles.toolsGrid}>
    {links.map(link => {
      const brand = brands[link.id as keyof typeof brands];
      if (!brand) return null;
      const Icon = brand.Icon;
      return <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
        className={styles.toolCard} data-tool={link.id} aria-labelledby={`tool-${link.id}`} aria-describedby={`tool-note-${link.id}`}>
        <span className={styles.toolVisual + (brand.logo ? " " + styles.lightLogo : "")} aria-hidden="true">
          {brand.logo ? <Image src={brand.logo} alt="" width={72} height={64} unoptimized /> : <Icon size={38} strokeWidth={1.6} />}
        </span>
        <span className={styles.toolCopy}><strong id={`tool-${link.id}`}>{brand.title}</strong>
          <span className={styles.toolBrand}>{brand.name}</span>
          <small id={`tool-note-${link.id}`}>{brand.detail} · abre otra pestaña</small>
        </span>
        <ArrowUpRight className={styles.toolArrow} size={18} aria-hidden="true" />
      </a>;
    })}
  </nav>;
}
