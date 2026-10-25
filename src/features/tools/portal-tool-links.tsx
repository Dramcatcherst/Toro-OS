import Image from "next/image";
import { ArrowUpRight, CalendarDays, FolderOpen, MessagesSquare, Users, BedDouble, CreditCard, Wallet, Mail, House, Link as LinkIcon } from "lucide-react";
import type { ToolCatalogueItem, ToolLink } from "./directory";
import styles from "@/features/portal/portal.module.css";

export type PortalToolCategory = "Operación" | "Comunicación" | "Equipo" | "Dinero" | "Mercadeo" | "Google" | "Documentos" | "Otros";
export type PortalToolPresentation = {
  name: string; title: string; detail: string; Icon: typeof BedDouble; logo: string | null;
  category: PortalToolCategory; keywords: readonly string[];
};

// Display metadata only. Destinations and access still come from the governed reader.
export const portalToolBrands: Record<string, PortalToolPresentation> = {
  "PORTAL-KROSS-DASHBOARD": { name: "Kross", title: "Abrir dashboard Kross", detail: "Reservas y operación · sesión propia", Icon: BedDouble, logo: "/brand/tools/kross.png", category: "Operación", keywords: ["dashboard", "reservas", "ocupación", "operación"] },
  "LINK-048": { name: "Kross", title: "Ver reservas", detail: "Llegadas, salidas y reservas", Icon: BedDouble, logo: "/brand/tools/kross.png", category: "Operación", keywords: ["reservas", "entradas", "salidas", "habitaciones"] },
  "LINK-002": { name: "Motor Kross", title: "Cotizar estancia", detail: "Fechas, precios y condiciones", Icon: BedDouble, logo: "/brand/tools/kross.png", category: "Operación", keywords: ["cotización", "fechas", "huéspedes", "estancia"] },
  "LINK-178": { name: "WeSpeak", title: "Atender huéspedes", detail: "Conversaciones y solicitudes", Icon: MessagesSquare, logo: "/brand/tools/wespeak.ico", category: "Comunicación", keywords: ["huéspedes", "mensajes", "atención", "solicitudes"] },
  "LINK-086": { name: "DreamTeam · TORO People", title: "Ver equipo", detail: "Equipo · sesión propia", Icon: Users, logo: "/brand/tools/dreamteam.svg", category: "Equipo", keywords: ["personas", "horarios", "asistencia", "planilla"] },
  "LINK-056": { name: "Google Calendar", title: "Ver agenda", detail: "Agenda del hotel", Icon: CalendarDays, logo: "/brand/tools/google-calendar-official.svg", category: "Google", keywords: ["agenda", "eventos", "calendario"] },
  "LINK-131": { name: "Dropbox", title: "Buscar documentos", detail: "Archivos del hotel", Icon: FolderOpen, logo: "/brand/tools/dropbox.svg", category: "Documentos", keywords: ["documentos", "archivos", "comprobantes"] },
  "LINK-244": { name: "Google Hotels", title: "Ver perfil del hotel", detail: "Ficha pública, reseñas y opciones de reserva", Icon: BedDouble, logo: "/brand/tools/google.svg", category: "Mercadeo", keywords: ["hotel", "perfil", "reseñas", "precios", "reservas"] },
  "PORTAL-POS": { name: "Kross POS", title: "Abrir punto de venta", detail: "Consumos y cobros en Kross", Icon: CreditCard, logo: "/brand/tools/kross.png", category: "Operación", keywords: ["punto de venta", "cobros", "consumos", "caja"] },
  "PORTAL-WHATSAPP": { name: "WhatsApp", title: "Abrir WhatsApp", detail: "Mensajes · envío manual", Icon: MessagesSquare, logo: "/brand/tools/whatsapp-official.svg", category: "Comunicación", keywords: ["mensajes", "chat", "comunicación"] },
  "PORTAL-ALEGRA": { name: "Alegra", title: "Abrir finanzas", detail: "Bancos, ingresos y gastos en Alegra", Icon: Wallet, logo: "/brand/tools/alegra-official.svg", category: "Dinero", keywords: ["finanzas", "bancos", "ingresos", "gastos", "facturas"] },
  "PORTAL-GMAIL": { name: "Gmail", title: "Abrir correo", detail: "Notificaciones y reservas", Icon: Mail, logo: "/brand/tools/google.svg", category: "Google", keywords: ["correo", "notificaciones", "reservas"] },
  "PORTAL-DRIVE": { name: "Google Drive", title: "Abrir Drive", detail: "Documentos y hojas de cálculo", Icon: FolderOpen, logo: "/brand/tools/google.svg", category: "Google", keywords: ["documentos", "archivos", "hojas de cálculo"] },
  "PORTAL-HOME": { name: "Google Home", title: "Abrir Google Home", detail: "Dispositivos · funciones según tu cuenta", Icon: House, logo: "/brand/tools/google.svg", category: "Google", keywords: ["dispositivos", "casa", "Google Home"] },
} as const;

type PresentableTool = ToolLink | ToolCatalogueItem;

export function getToolPresentation(link: PresentableTool): PortalToolPresentation {
  const known = Object.hasOwn(portalToolBrands, link.id) ? portalToolBrands[link.id] : null;
  if ("kind" in link && link.kind === "directory") {
    return { ...(known ?? { Icon: LinkIcon, logo: null, category: "Otros" as const, keywords: [] }),
      name: link.name, title: link.name, detail: link.purpose };
  }
  if (known) return known;
  const label = link.label.replace(/^[\s\p{Extended_Pictographic}\uFE0F\u200D]+/u, "").replace(/\s+/g, " ").trim() || "Recurso externo";
  return { name: label, title: label, detail: "Acceso externo", Icon: LinkIcon, logo: null, category: "Otros", keywords: [] };
}

/** Presentation only: destinations must already be filtered by the approved directory reader. */
export function PortalToolLinks({ links, compact = false, wide = false, favorites = false, idPrefix = "tool", ariaLabel }: {
  links: PresentableTool[]; compact?: boolean; wide?: boolean; favorites?: boolean; idPrefix?: string; ariaLabel?: string;
}) {
  return <nav aria-label={ariaLabel ?? (favorites ? "Favoritos del hotel" : "Herramientas del hotel")} className={favorites ? styles.favoritesGrid : wide ? styles.toolsWide : compact ? styles.toolsCompact : styles.toolsGrid}>
    {links.map(link => {
      const brand = getToolPresentation(link);
      const Icon = brand.Icon;
      const directory = "kind" in link && link.kind === "directory" ? link : null;
      const content = <>
        <span className={styles.toolVisual + (brand.logo ? " " + styles.lightLogo : "")} aria-hidden="true">
          {brand.logo ? <Image src={brand.logo} alt="" width={72} height={64} unoptimized /> : <Icon size={38} strokeWidth={1.6} />}
        </span>
        <span className={styles.toolCopy}><strong id={idPrefix + "-" + link.id}>{favorites ? (Object.hasOwn(portalToolBrands, link.id) ? brand.name.split(" ·")[0] : brand.name) : brand.title}</strong>
          {!favorites ? <span className={styles.toolBrand}>{brand.name}</span> : null}
          <small id={idPrefix + "-note-" + link.id}>{favorites ? brand.title : brand.detail}
            {link.url?.startsWith("https://") ? <span className={styles.srOnly}> · abre otra pestaña</span> : null}</small>
          {wide && directory ? <span className={styles.toolMetadata}>
            <span>{directory.category}</span><span>{directory.state}</span><span>{directory.lifecycle}</span><span>{directory.scope}</span>
          </span> : null}
        </span>
        {link.url ? <ArrowUpRight className={styles.toolArrow} size={18} aria-hidden="true" />
          : <span className={styles.toolPending}>Destino pendiente</span>}
      </>;
      const className = styles.toolCard + (favorites ? " " + styles.favoriteCard : "") + (!link.url ? " " + styles.toolCardPending : "");
      if (!link.url) return <article key={link.id} className={className} data-tool={link.id}
        aria-labelledby={idPrefix + "-" + link.id} aria-describedby={idPrefix + "-note-" + link.id}>{content}</article>;
      const external = link.url.startsWith("https://");
      return <a key={link.id} href={link.url} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
        className={className} data-tool={link.id} aria-labelledby={idPrefix + "-" + link.id} aria-describedby={idPrefix + "-note-" + link.id}>{content}</a>;
    })}
  </nav>;
}
