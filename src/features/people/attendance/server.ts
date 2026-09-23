import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { resolvePeopleSelfServiceScope } from "@/features/people/self-service/context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { mapMyAttendance } from "./mappers";
import type { MyAttendanceState } from "./types";

export async function loadMyAttendance(
  context: ToroResolvedContext,
): Promise<MyAttendanceState> {
  const scope = resolvePeopleSelfServiceScope(context);
  if (!scope.allowed) {
    return { status: "not_available", reason: scope.reason };
  }

  const supabase = await createServerSupabaseClient();

  const [identityResult, attendanceResult] = await Promise.all([
    supabase
      .from("employees")
      .select("id,preferred_name")
      .eq("id", scope.employeeId)
      .eq("org_id", scope.orgId)
      .eq("user_id", context.userId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("attendance_days")
      .select(
        "id,work_date,first_entry,last_exit,actual_worked_minutes,worked_minutes,attendance_status,approval_status,payroll_eligible",
      )
      .eq("org_id", scope.orgId)
      .eq("employee_id", scope.employeeId)
      .is("deleted_at", null)
      .order("work_date", { ascending: false })
      .limit(45),
  ]);

  const failedSources = [
    identityResult.error ? "employee_identity" : null,
    attendanceResult.error ? "attendance" : null,
  ].filter((value): value is string => Boolean(value));

  if (failedSources.length) {
    return {
      status: "error",
      reason: "data_unavailable",
      failedSources,
    };
  }

  const identity =
    identityResult.data &&
    typeof identityResult.data === "object" &&
    typeof identityResult.data.id === "string" &&
    typeof identityResult.data.preferred_name === "string"
      ? identityResult.data
      : null;

  if (!identity || identity.id !== scope.employeeId) {
    return {
      status: "not_available",
      reason: "employee_identity_mismatch",
    };
  }

  return {
    status: "ready",
    data: {
      employeeId: identity.id,
      preferredName: identity.preferred_name,
      days: mapMyAttendance(attendanceResult.data),
      source: "supabase_canonical",
      loadedAt: new Date().toISOString(),
    },
  };
}
