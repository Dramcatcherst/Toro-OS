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

const founderNavigation: NavItem[] = [
  { label: "Inicio", availability: "available", href: "/toro" },
  { label: "Decisiones", availability: "available", href: "/toro/decisiones" },
  { label: "Hotel", availability: "coming-soon" },
  { label: "Huéspedes", availability: "coming-soon" },
  { label: "Dinero", availability: "coming-soon" },
  { label: "Proyectos", availability: "coming-soon" },
  { label: "Equipo", availability: "coming-soon" },
  { label: "Conocimiento", availability: "coming-soon" },
  { label: "Sistemas", availability: "coming-soon" },
];

const employeeNavigation: NavItem[] = [
  { label: "Inicio", availability: "available", href: "/toro" },
  { label: "Mi trabajo", availability: "coming-soon" },
  { label: "Horario", availability: "coming-soon" },
  { label: "Solicitudes", availability: "coming-soon" },
  { label: "Mensajes", availability: "coming-soon" },
  { label: "Mi perfil", availability: "available", href: "/toro/mi-perfil" },
];

const peopleAdminNavigation: NavItem[] = [
  { label: "Inicio", availability: "available", href: "/toro" },
  { label: "Personas", availability: "coming-soon" },
  { label: "Asistencia", availability: "coming-soon" },
  { label: "Horarios", availability: "coming-soon" },
  { label: "Solicitudes", availability: "coming-soon" },
  { label: "Planilla", availability: "coming-soon" },
  { label: "Auditoría", availability: "coming-soon" },
  { label: "Mi perfil", availability: "available", href: "/toro/mi-perfil" },
];

const departmentLeadNavigation: NavItem[] = [
  { label: "Inicio", availability: "available", href: "/toro" },
  { label: "Equipo", availability: "coming-soon" },
  { label: "Cobertura", availability: "coming-soon" },
  { label: "Asistencia", availability: "coming-soon" },
  { label: "Horarios", availability: "coming-soon" },
  { label: "Solicitudes", availability: "coming-soon" },
  { label: "Mi perfil", availability: "available", href: "/toro/mi-perfil" },
];

const auditNavigation: NavItem[] = [
  { label: "Inicio", availability: "available", href: "/toro" },
  { label: "Asistencia", availability: "coming-soon" },
  { label: "Planilla", availability: "coming-soon" },
  { label: "Aprobaciones", availability: "coming-soon" },
  { label: "Auditoría", availability: "coming-soon" },
];

const navigationByRole: Record<ToroRole, NavItem[]> = {
  FOUNDER: founderNavigation,
  ADMIN: peopleAdminNavigation,
  RRHH: peopleAdminNavigation,
  GERENCIA: founderNavigation.filter((item) => item.label !== "Sistemas"),
  JEFE_DEPARTAMENTO: departmentLeadNavigation,
  AUDITOR: auditNavigation,
  EMPLEADO: employeeNavigation,
  RECEPCION: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Huéspedes", availability: "coming-soon" },
    { label: "Hotel", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
    { label: "Mi perfil", availability: "available", href: "/toro/mi-perfil" },
  ],
  OPERACIONES: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Hotel", availability: "coming-soon" },
    { label: "Equipo", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
    { label: "Mi perfil", availability: "available", href: "/toro/mi-perfil" },
  ],
  FINANZAS: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Dinero", availability: "coming-soon" },
    { label: "Proyectos", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
    { label: "Mi perfil", availability: "available", href: "/toro/mi-perfil" },
  ],
  GROWTH: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Huéspedes", availability: "coming-soon" },
    { label: "Proyectos", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
    { label: "Mi perfil", availability: "available", href: "/toro/mi-perfil" },
  ],
  SYSTEMS: [
    { label: "Inicio", availability: "available", href: "/toro" },
    { label: "Sistemas", availability: "coming-soon" },
    { label: "Proyectos", availability: "coming-soon" },
    { label: "Conocimiento", availability: "coming-soon" },
    { label: "Mi perfil", availability: "available", href: "/toro/mi-perfil" },
  ],
};

export function getRoleNavigation(role: ToroRole): NavItem[] {
  return navigationByRole[role];
}
