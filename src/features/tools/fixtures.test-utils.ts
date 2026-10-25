import type { ToroResolvedContext, ToroToolPermission } from "@/features/context/types";
import { DIRECTORY_SCOPE, REVIEWED_HOTEL_LINKS } from "./directory";

export const readKross: ToroToolPermission = {
  provider: "kross", owner: "organization", orgId: DIRECTORY_SCOPE.orgId, actions: ["read"],
};

// Synthetic session and source data; no production identities or accounts.
export function authorizedContext(): ToroResolvedContext {
  return {
    userId: "00000000-0000-4000-8000-000000000001", email: null,
    displayName: "Synthetic QA", mode: "organization", orgId: DIRECTORY_SCOPE.orgId,
    requiresContextChoice: false, canUseOrganizationData: true, canUsePersonalVault: false,
    availableOrgIds: [DIRECTORY_SCOPE.orgId], allowedDataScopes: ["work_org"],
    allowedTools: [],
    membership: { orgId: DIRECTORY_SCOPE.orgId, membershipId: null,
      membershipType: "employee", status: "active", roles: ["GERENCIA"], employeeId: null,
      source: "legacy_user_roles" },
  };
}

export const quoteEntry = {
  id: "LINK-002", url: "https://dreamcatcherhotel.kross.travel/", email: "private@example.invalid",
};
export const sourceRow = {
  org_id: DIRECTORY_SCOPE.orgId, property_id: DIRECTORY_SCOPE.propertyId,
  knowledge_key: DIRECTORY_SCOPE.key, visibility: "internal",
  structured_content: { link_directory: { entries: [quoteEntry],
    accounts: [{ email: "private@example.invalid" }], evidence: "private evidence" } },
};

export type CompleteCatalogueRowFixture = {
  id: string;
  name: string;
  url: string;
  purpose: string;
  project: string;
  category: string;
  provider: string;
  state: string;
  lifecycle: string;
  priority: string;
  link_type: string;
  scope: string;
  home_eligible: boolean;
};

export function completeCatalogueRows(count = 244): CompleteCatalogueRowFixture[] {
  const reviewed = new Map<string, string>(REVIEWED_HOTEL_LINKS.map(([id, , url]) => [id, url]));
  return Array.from({ length: count }, (_, index) => {
    const id = `LINK-${String(index + 1).padStart(3, "0")}`;
    return {
      id,
      name: `Herramienta ${index + 1}`,
      url: reviewed.get(id) ?? `https://catalogue.example.test/${id.toLowerCase()}`,
      purpose: `Propósito operativo ${index + 1}`,
      project: index < 120 ? "01 Dreamcatcher - operación y administración" : "02 Dreamcatcher - web, marketing y contenidos",
      category: index % 2 ? "Marketing y medición" : "Reservas y canales",
      provider: "catalogue.example.test",
      state: index % 3 ? "registrado" : "Historial",
      lifecycle: index % 7 ? "activo" : "archivo/referencia",
      priority: index < 61 ? "P1 diario candidato" : "P2 por tarea",
      link_type: "acceso por confirmar",
      scope: "Dreamcatcher / TORO",
      home_eligible: index < 61,
    };
  });
}
