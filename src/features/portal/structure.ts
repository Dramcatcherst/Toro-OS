import type { PortalModule } from "./model";

export type PortalFamilyKey = "clients" | "operations" | "team" | "money" | "growth" | "projects";

export type PortalFamily = {
  key: PortalFamilyKey;
  label: string;
  modules: readonly PortalModule[];
};

export type PortalStructure = {
  today: readonly PortalModule[];
  families: readonly PortalFamily[];
  map: readonly PortalModule[];
  system: readonly PortalModule[];
  unmapped: readonly PortalModule[];
};

const familyDefinitions: readonly { key: PortalFamilyKey; label: string; ordinals: readonly number[] }[] = [
  { key: "clients", label: "Clientes y ventas", ordinals: [4] },
  { key: "operations", label: "Operación y recursos", ordinals: [5, 9] },
  { key: "team", label: "Equipo", ordinals: [6] },
  { key: "money", label: "Dinero y cumplimiento", ordinals: [2, 8] },
  { key: "growth", label: "Contenido y crecimiento", ordinals: [3, 7] },
  { key: "projects", label: "Proyectos", ordinals: [10] },
];

const familyByOrdinal = new Map<number, PortalFamilyKey>(
  familyDefinitions.flatMap(family => family.ordinals.map(ordinal => [ordinal, family.key] as const)),
);

/**
 * Builds presentation groups from already-authorized modules.
 * It preserves object identity and never invents routes, states or capabilities.
 */
export function resolvePortalStructure(modules: readonly PortalModule[]): PortalStructure {
  const today: PortalModule[] = [];
  const map: PortalModule[] = [];
  const system: PortalModule[] = [];
  const unmapped: PortalModule[] = [];
  const familyModules = new Map<PortalFamilyKey, PortalModule[]>();

  for (const portalModule of modules) {
    if (portalModule.ordinal === 0) {
      map.push(portalModule);
      continue;
    }
    if (portalModule.ordinal === 1) {
      today.push(portalModule);
      continue;
    }
    if (portalModule.ordinal === 11) {
      system.push(portalModule);
      continue;
    }
    const familyKey = familyByOrdinal.get(portalModule.ordinal);
    if (!familyKey) {
      unmapped.push(portalModule);
      continue;
    }
    const bucket = familyModules.get(familyKey) ?? [];
    bucket.push(portalModule);
    familyModules.set(familyKey, bucket);
  }

  const families = familyDefinitions.flatMap(({ key, label }) => {
    const grouped = familyModules.get(key);
    return grouped?.length ? [{ key, label, modules: grouped }] : [];
  });

  return { today, families, map, system, unmapped };
}
