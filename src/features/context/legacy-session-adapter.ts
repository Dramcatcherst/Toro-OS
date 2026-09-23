import { resolveToroRole, type ToroRole } from "@/features/auth/roles";

import type { ToroResolvedContext } from "./types";

export type ToroLegacyRoleInput = {
  context: ToroResolvedContext;
  explicitToroRole?: string | null;
  metadataRoleCodes?: string[] | null;
};

/**
 * Transitional adapter for the current Phase 1 navigation/session role.
 *
 * Critical rule: role resolution is scoped to the active organization context.
 * Roles from another organization must never elevate this context.
 */
export function resolveLegacySessionRole({
  context,
  explicitToroRole,
  metadataRoleCodes = [],
}: ToroLegacyRoleInput): ToroRole | null {
  if (
    context.mode !== "organization" ||
    !context.orgId ||
    !context.membership ||
    context.membership.status !== "active" ||
    context.membership.orgId !== context.orgId
  ) {
    return null;
  }

  const membershipRoleCodes = context.membership.roles;
  const role = resolveToroRole({
    explicitToroRole,
    systemRoleCodes: [...metadataRoleCodes, ...membershipRoleCodes],
  });

  if (!role) return null;

  if (
    role === "FOUNDER" &&
    !membershipRoleCodes.some((code) =>
      ["ADMIN", "GERENCIA"].includes(code),
    )
  ) {
    return null;
  }

  return role;
}
