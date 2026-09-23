import type { ToroRole } from "./roles";

export type NavItem =
  | {
      label: string;
      availability: "available";
      href: string;
    }
  | {
      label: string;
      availability: "coming-soon";
      href?: never;
    };

const maintenanceNavigationItem: NavItem = {
  label: "Mantenimiento",
  availability: "available",
  href: "/toro/operacion/mantenimiento",
};

const founderNavigation: NavItem[] = [
  { label: "Inicio", availability: "available", href: "/toro" },
  { label: "Decisiones", availability: "available", href: "/toro/decisiones" },
  maintenanceNavigationItem,
  { label: "Hotel", availability: "available", href: "/toro/hotel" },
  { label: "Huéspedes", availability: "coming-soon" },
  { label: "Dinero", availability: "coming-soon" },
  { label: "Proyectos", availability: "available", href: "/toro/proyectos" },
  { label: "Equipo", availability: "coming-soon" },
  { label: "Conocimiento", availability: "available", href: "/toro/conocimiento" },
  { label: "Sistemas", availability: "available", href: "/toro/sistemas" },
];

const navigationByRole: Record<ToroRole, NavItem[]> = {
  FOUNDER: founderNavigation,
  GERENCIA: founderNavigation.filter((item) => item.label !== "Sistemas"),
  RECEPCION: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Huéspedes", availability: "coming-soon" },
    { label: "Hotel", availability: "available", href: "/toro/hotel" },
    { label: "Conocimiento", availability: "coming-soon" },
  ],
  OPERACIONES: [
    { label: "Inicio", availability: "available", href: "/toro" },
    maintenanceNavigationItem,
    { label: "Hotel", availability: "available", href: "/toro/hotel" },
    { label: "Equipo", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
  ],
  CAMPO: [
    { label: "Inicio", availability: "available", href: "/toro" },
    maintenanceNavigationItem,
  ],
  FINANZAS: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Dinero", availability: "coming-soon" },
    { label: "Proyectos", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
  ],
  GROWTH: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Huéspedes", availability: "coming-soon" },
    { label: "Proyectos", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
  ],
  SYSTEMS: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Sistemas", availability: "available", href: "/toro/sistemas" },
    { label: "Proyectos", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
  ],
};

export function getRoleNavigation(role: ToroRole): NavItem[] {
  return navigationByRole[role];
}
