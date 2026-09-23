import type { ToroResolvedContext } from "@/features/context/types";

export type ToroCommsScope =
  | {
      allowed: true;
      orgId: string;
      userId: string;
      employeeId: string | null;
    }
  | {
      allowed: false;
      reason:
        | "organization_context_required"
        | "organization_access_required";
    };

export function resolveToroCommsScope(
  context: ToroResolvedContext,
): ToroCommsScope {
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

  return {
    allowed: true,
    orgId: context.orgId,
    userId: context.userId,
    employeeId: context.membership.employeeId,
  };
}
