import type { ToroResolvedContext } from "@/features/context/types";

export type PeopleSelfServiceScope =
  | {
      allowed: true;
      orgId: string;
      employeeId: string;
    }
  | {
      allowed: false;
      reason:
        | "organization_context_required"
        | "organization_access_required"
        | "employee_link_required";
    };

export function resolvePeopleSelfServiceScope(
  context: ToroResolvedContext,
): PeopleSelfServiceScope {
  if (context.mode !== "organization" || !context.orgId) {
    return { allowed: false, reason: "organization_context_required" };
  }

  if (
    !context.canUseOrganizationData ||
    context.membership?.status !== "active" ||
    context.membership.orgId !== context.orgId
  ) {
    return { allowed: false, reason: "organization_access_required" };
  }

  if (!context.membership.employeeId) {
    return { allowed: false, reason: "employee_link_required" };
  }

  return {
    allowed: true,
    orgId: context.orgId,
    employeeId: context.membership.employeeId,
  };
}
