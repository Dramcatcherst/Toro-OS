import type { ToroResolvedContext } from "@/features/context/types";
import type { ToroRealMenuView } from "@/features/menu/server";
import { canViewOwnerAttention } from "@/features/attention/owner-attention";
import { canReadHotelDirectory } from "@/features/tools/directory";

/** Presentation of the approved navigation; these ordinals are not database IDs. */
export const portalDomains = [
  { ordinal: 0, label: "Cerebro", description: "La red de tu organización, sus relaciones y evidencia.", capabilities: [] },
  { ordinal: 1, label: "Hoy y Atención", description: "Prioridades, decisiones y próximos pasos.", capabilities: ["executive.", "operations.hotel_today"] },
  { ordinal: 2, label: "Dinero", description: "Finanzas, obligaciones y control de pagos.", capabilities: ["finance."] },
  { ordinal: 3, label: "Studio", description: "Trabajo creativo, contenido y revisión.", capabilities: ["studio."] },
  { ordinal: 4, label: "Clientes", description: "Reservas, huéspedes y relaciones comerciales.", capabilities: ["reservations.", "guest.", "customers."] },
  { ordinal: 5, label: "Operaciones", description: "El trabajo diario, procedimientos y herramientas.", capabilities: ["operations."] },
  { ordinal: 6, label: "Personas", description: "Equipo, turnos y experiencia de DreamTeam en TORO.", capabilities: ["people."] },
  { ordinal: 7, label: "Crecimiento", description: "Ventas, marketing, web y reputación.", capabilities: ["growth.", "marketing."] },
  { ordinal: 8, label: "Legal y Riesgo", description: "Documentos, compromisos y controles.", capabilities: ["legal.", "risk."] },
  { ordinal: 9, label: "Activos y Espacios", description: "Propiedades, inventario y mantenimiento.", capabilities: ["assets.", "facilities.", "catalog."] },
  { ordinal: 10, label: "Proyectos", description: "Resultados, dependencias y avance comprobado.", capabilities: ["projects."] },
  { ordinal: 11, label: "Sistemas", description: "Conexiones, capacidades y salud del sistema.", capabilities: ["systems."] },
] as const;

export function hasPortalOrganizationContext(context: ToroResolvedContext | null): context is ToroResolvedContext {
  return Boolean(context && context.mode === "organization" && context.orgId &&
    !context.requiresContextChoice && context.canUseOrganizationData &&
    context.membership?.status === "active" && context.membership.orgId === context.orgId);
}

export type PortalModule = { ordinal: number; label: string; description: string;
  status: string; note: string; href: string | null; action: string | null };

export function resolvePortalModules(view: ToroRealMenuView): PortalModule[] {
  if (view.state !== "resolved" || !hasPortalOrganizationContext(view.context)) return [];
  return portalDomains.map(domain => {
    const item: PortalModule = { ...domain, status: "En preparación",
      note: "La consulta integrada aún no está disponible para tu cuenta.", href: null, action: null };
    if (domain.ordinal === 0) return { ...item, status: "Explorador",
      href: "/brain", action: "Explorar Cerebro",
      note: "El Cerebro indica si muestra una demostración o fuentes reales." };
    if (domain.ordinal === 1 && canViewOwnerAttention(view.context)) return { ...item,
      status: "Fuente por verificar", href: "/my-toro#owner-attention-heading", action: "Ver mi atención",
      note: "La vista Hoy informa si puede comprobar tus prioridades." };
    if (domain.ordinal === 5 && canReadHotelDirectory(view.context)) return { ...item,
      status: "Guía y accesos", href: "/my-toro/herramientas", action: "Abrir guía del turno",
      note: "Los accesos revisados abren cada herramienta con sus propios permisos." };
    const consultation = view.menu?.items.find(candidate => candidate.state === "READ_ONLY" &&
      view.focusableCapabilities.includes(candidate.capability) &&
      domain.capabilities.some(prefix => candidate.capability.startsWith(prefix)));
    if (!consultation) return item;
    return { ...item, status: "Consulta disponible", href: `/my-toro?focus=${encodeURIComponent(consultation.capability)}`,
      action: "Consultar en Mi TORO", note: "Lectura disponible para tu perfil en el contexto activo." };
  });
}
