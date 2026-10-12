import Image from "next/image";
import { ArrowUpRight, CalendarDays, FolderOpen, MessagesSquare, Users, BedDouble } from "lucide-react";
import type { ToolLink } from "./directory";
import styles from "@/features/portal/portal.module.css";

export const portalToolBrands = {
  "LINK-048": { name: "Kross", title: "Ver reservas", detail: "Llegadas, salidas y reservas", Icon: BedDouble, logo: "/brand/tools/kross.png" },
  "LINK-002": { name: "Motor Kross", title: "Cotizar estancia", detail: "Fechas, precios y condiciones", Icon: BedDouble, logo: "/brand/tools/kross.png" },
  "LINK-178": { name: "WeSpeak", title: "Atender huéspedes", detail: "Conversaciones y solicitudes", Icon: MessagesSquare, logo: "/brand/tools/wespeak.ico" },
  "LINK-086": { name: "DreamTeam · TORO People", title: "Ver equipo", detail: "Equipo · sesión propia", Icon: Users, logo: "/brand/tools/dreamteam.svg" },
  "LINK-056": { name: "Google Calendar", title: "Ver agenda", detail: "Agenda del hotel", Icon: CalendarDays, logo: "/brand/tools/google.svg" },
  "LINK-131": { name: "Dropbox", title: "Buscar documentos", detail: "Archivos del hotel", Icon: FolderOpen, logo: "/brand/tools/dropbox.svg" },
} as const;

/** Presentation only: destinations must already be filtered by the approved directory reader. */
export function PortalToolLinks({ links, compact = false, wide = false, favorites = false, idPrefix = "tool" }: {
  links: ToolLink[]; compact?: boolean; wide?: boolean; favorites?: boolean; idPrefix?: string;
}) {
  return <nav aria-label={favorites ? "Favoritos del hotel" : "Herramientas del hotel"} className={favorites ? styles.favoritesGrid : wide ? styles.toolsWide : compact ? styles.toolsCompact : styles.toolsGrid}>
    {links.map(link => {
      const brand = portalToolBrands[link.id as keyof typeof portalToolBrands];
      if (!brand) return null;
      const Icon = brand.Icon;
      return <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
        className={styles.toolCard + (favorites ? " " + styles.favoriteCard : "")} data-tool={link.id} aria-labelledby={`${idPrefix}-${link.id}`} aria-describedby={`${idPrefix}-note-${link.id}`}>
        <span className={styles.toolVisual + (brand.logo ? " " + styles.lightLogo : "")} aria-hidden="true">
          {brand.logo ? <Image src={brand.logo} alt="" width={72} height={64} unoptimized /> : <Icon size={38} strokeWidth={1.6} />}
        </span>
        <span className={styles.toolCopy}><strong id={`${idPrefix}-${link.id}`}>{favorites ? brand.name : brand.title}</strong>
          {!favorites ? <span className={styles.toolBrand}>{brand.name}</span> : null}
          <small id={`${idPrefix}-note-${link.id}`}>{favorites ? `${brand.title} · otra pestaña` : `${brand.detail} · abre otra pestaña`}</small>
        </span>
        <ArrowUpRight className={styles.toolArrow} size={18} aria-hidden="true" />
      </a>;
    })}
  </nav>;
}
