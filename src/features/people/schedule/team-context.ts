import type { ToroResolvedContext } from "@/features/context/types";

import type { TeamScheduleRole } from "./team-types";

const TEAM_SCHEDULE_ROLES = new Set<TeamScheduleRole>([
  "ADMIN",
  "RRHH",
  "GERENCIA",
  "JEFE_DEPARTAMENTO",
  "AUDITOR",
]);

export type TeamScheduleScope =
  | { allowed: true; orgId: string }
  | {
      allowed: false;
      reason:
        | "organization_context_required"
        | "organization_access_required"
        | "team_schedule_role_required";
    };

export function resolveTeamScheduleScope(
  context: ToroResolvedContext,
): TeamScheduleScope {
  if (context.mode !== "organization" || !context.orgId) {
    return { allowed: false, reason: "organization_context_required" };
  }

  if (
    !context.canUseOrganizationData ||
    !context.membership ||
    context.membership.status !== "active" ||
    context.membership.orgId !== context.orgId
  ) {
    return { allowed: false, reason: "organization_access_required" };
  }

  if (
    !context.membership.roles.some((role) =>
      TEAM_SCHEDULE_ROLES.has(role as TeamScheduleRole),
    )
  ) {
    return { allowed: false, reason: "team_schedule_role_required" };
  }

  return { allowed: true, orgId: context.orgId };
}
