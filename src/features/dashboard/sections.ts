export type ToroDashboardSectionKey =
  | "today"
  | "money"
  | "studio"
  | "customers"
  | "operations"
  | "people"
  | "growth"
  | "legal_risk"
  | "assets_spaces"
  | "projects"
  | "systems";

export type ToroDashboardSection = {
  key: ToroDashboardSectionKey;
  label: string;
  description: string;
  href: string;
  profiles: string[];
};

const allProfiles = [
  "owner_executive",
  "manager",
  "reception",
  "housekeeping",
  "maintenance",
  "department_lead",
  "finance",
  "hr_people",
  "growth",
  "systems",
  "auditor",
  "employee_general",
];

export const dashboardSections: ToroDashboardSection[] = [
  {
    key: "today",
    label: "Hoy",
    description: "Alertas, aprobaciones, bloqueos y próximas acciones.",
    href: "/dashboard",
    profiles: allProfiles,
  },
  {
    key: "money",
    label: "Dinero",
    description: "PayFlow, caja, conciliación, impuestos y ahorro.",
    href: "/dashboard#money",
    profiles: ["owner_executive", "manager", "finance", "auditor"],
  },
  {
    key: "studio",
    label: "Studio",
    description: "Campañas, assets, drafts, approvals y performance.",
    href: "/dashboard#studio",
    profiles: ["owner_executive", "manager", "growth", "systems"],
  },
  {
    key: "customers",
    label: "Clientes",
    description: "TERE, leads, reservas, grupos y guest journey.",
    href: "/dashboard#customers",
    profiles: ["owner_executive", "manager", "reception", "growth"],
  },
  {
    key: "operations",
    label: "Operaciones",
    description: "Mantenimiento, housekeeping, incidentes y servicio.",
    href: "/dashboard#operations",
    profiles: ["owner_executive", "manager", "reception", "housekeeping", "maintenance", "department_lead"],
  },
  {
    key: "people",
    label: "Personas",
    description: "Turnos, vacaciones, onboarding y capacitación.",
    href: "/dashboard#people",
    profiles: ["owner_executive", "manager", "hr_people", "department_lead"],
  },
  {
    key: "growth",
    label: "Crecimiento",
    description: "Marketing, SEO, demanda, canales y experimentos.",
    href: "/dashboard#growth",
    profiles: ["owner_executive", "manager", "growth"],
  },
  {
    key: "legal_risk",
    label: "Legal & Riesgo",
    description: "Seguros, permisos, compliance y evidencia.",
    href: "/dashboard#legal-risk",
    profiles: ["owner_executive", "manager", "finance", "hr_people", "auditor"],
  },
  {
    key: "assets_spaces",
    label: "Activos & Espacios",
    description: "Habitaciones, villas, equipos, inventario y espacios.",
    href: "/dashboard#assets-spaces",
    profiles: ["owner_executive", "manager", "reception", "housekeeping", "maintenance", "systems"],
  },
  {
    key: "projects",
    label: "Proyectos",
    description: "Plan General, prioridades, decisiones y progreso.",
    href: "/dashboard#projects",
    profiles: ["owner_executive", "manager", "department_lead", "systems"],
  },
  {
    key: "systems",
    label: "Sistemas",
    description: "Conectores, datos, backups, seguridad y runtime.",
    href: "/",
    profiles: ["owner_executive", "systems"],
  },
];

export function resolveDashboardSections(profileId?: string | null) {
  if (!profileId) return dashboardSections.filter((section) => section.key === "today");
  return dashboardSections.filter((section) => section.profiles.includes(profileId));
}
