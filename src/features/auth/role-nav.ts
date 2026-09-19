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
  { label: "Hotel", availability: "coming-soon" },
  { label: "Huéspedes", availability: "coming-soon" },
  { label: "Dinero", availability: "coming-soon" },
  { label: "Proyectos", availability: "coming-soon" },
  { label: "Equipo", availability: "coming-soon" },
  { label: "Conocimiento", availability: "coming-soon" },
  { label: "Sistemas", availability: "coming-soon" },
];

const navigationByRole: Record<ToroRole, NavItem[]> = {
  FOUNDER: founderNavigation,
  GERENCIA: founderNavigation.filter((item) => item.label !== "Sistemas"),
  RECEPCION: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Huéspedes", availability: "coming-soon" },
    { label: "Hotel", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
  ],
  OPERACIONES: [
    { label: "Inicio", availability: "available", href: "/toro" },
    maintenanceNavigationItem,
    { label: "Hotel", availability: "coming-soon" },
    { label: "Equipo", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
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
    { label: "Sistemas", availability: "coming-soon" },
    { label: "Proyectos", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
  ],
};

export function getRoleNavigation(role: ToroRole): NavItem[] {
  return navigationByRole[role];
}
