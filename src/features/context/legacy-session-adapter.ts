import { resolveToroRole, type ToroRole } from "@/features/auth/roles";

import type { ToroResolvedContext } from "./types";

export type ToroLegacyRoleInput = {
  context: ToroResolvedContext;
  explicitToroRole?: string | null;
};

/**
 * Transitional adapter for the current Portal navigation/session role.
 *
 * Critical rules:
 * - organization authorization comes only from the active scoped membership;
 * - roles from another organization must never elevate this context;
 * - app_metadata.role_codes is intentionally ignored because it is not
 *   organization-scoped;
 * - app_metadata.toro_role may select a functional experience (for example
 *   RECEPCION) only while an active organization membership exists.
 */
export function resolveLegacySessionRole({
  context,
  explicitToroRole,
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
    systemRoleCodes: membershipRoleCodes,
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
