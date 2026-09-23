import type { ToroResolvedContext } from "@/features/context/types";

import type { AttendanceReviewRole } from "./review-types";

const REVIEW_ROLES = new Set<AttendanceReviewRole>([
  "ADMIN",
  "RRHH",
  "GERENCIA",
  "AUDITOR",
  "CONTABILIDAD",
]);

export type AttendanceReviewScope =
  | { allowed: true; orgId: string }
  | {
      allowed: false;
      reason:
        | "organization_context_required"
        | "organization_access_required"
        | "attendance_review_role_required";
    };

export function resolveAttendanceReviewScope(
  context: ToroResolvedContext,
): AttendanceReviewScope {
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
      REVIEW_ROLES.has(role as AttendanceReviewRole),
    )
  ) {
    return { allowed: false, reason: "attendance_review_role_required" };
  }

  return { allowed: true, orgId: context.orgId };
}
