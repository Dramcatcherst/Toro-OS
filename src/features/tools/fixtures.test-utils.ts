import type { ToroResolvedContext, ToroToolPermission } from "@/features/context/types";
import { DIRECTORY_SCOPE } from "./directory";

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
