import type { ToroRole } from "./roles";

export type NavItem = {
  label: string;
  href: string;
};

const founderNavigation: NavItem[] = [
  { label: "Inicio", href: "/toro" },
  { label: "Decisiones", href: "/toro/decisiones" },
  { label: "Hotel", href: "/toro/hotel" },
  { label: "Huéspedes", href: "/toro/huespedes" },
  { label: "Dinero", href: "/toro/dinero" },
  { label: "Proyectos", href: "/toro/proyectos" },
  { label: "Equipo", href: "/toro/equipo" },
  { label: "Conocimiento", href: "/toro/conocimiento" },
  { label: "Sistemas", href: "/toro/sistemas" },
];

const navigationByRole: Record<ToroRole, NavItem[]> = {
  FOUNDER: founderNavigation,
  GERENCIA: founderNavigation.filter((item) => item.label !== "Sistemas"),
  RECEPCION: [
    { label: "Inicio", href: "/toro" },
    { label: "Huéspedes", href: "/toro/huespedes" },
    { label: "Hotel", href: "/toro/hotel" },
    { label: "Conocimiento", href: "/toro/conocimiento" },
  ],
  OPERACIONES: [
    { label: "Inicio", href: "/toro" },
    { label: "Hotel", href: "/toro/hotel" },
    { label: "Equipo", href: "/toro/equipo" },
    { label: "Conocimiento", href: "/toro/conocimiento" },
  ],
  FINANZAS: [
    { label: "Inicio", href: "/toro" },
    { label: "Dinero", href: "/toro/dinero" },
    { label: "Proyectos", href: "/toro/proyectos" },
    { label: "Conocimiento", href: "/toro/conocimiento" },
  ],
  GROWTH: [
    { label: "Inicio", href: "/toro" },
    { label: "Huéspedes", href: "/toro/huespedes" },
    { label: "Proyectos", href: "/toro/proyectos" },
    { label: "Conocimiento", href: "/toro/conocimiento" },
  ],
  SYSTEMS: [
    { label: "Inicio", href: "/toro" },
    { label: "Sistemas", href: "/toro/sistemas" },
    { label: "Proyectos", href: "/toro/proyectos" },
    { label: "Conocimiento", href: "/toro/conocimiento" },
  ],
};

export function getRoleNavigation(role: ToroRole): NavItem[] {
  return navigationByRole[role];
}
