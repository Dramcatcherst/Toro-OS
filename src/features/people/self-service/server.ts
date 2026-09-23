import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { resolvePeopleSelfServiceScope } from "./context";
import {
  mapAttendance,
  mapEmploymentSummary,
  mapLeaveBalances,
  mapLeaveRequests,
  mapSelfProfile,
  mapShifts,
} from "./mappers";
import type { PeopleSelfServiceState } from "./types";

function costaRicaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export async function loadMyPeopleSelfService(
  context: ToroResolvedContext,
): Promise<PeopleSelfServiceState> {
  const scope = resolvePeopleSelfServiceScope(context);
  if (!scope.allowed) {
    return { status: "not_available", reason: scope.reason };
  }

  const supabase = await createServerSupabaseClient();
  const today = costaRicaToday();

  const [
    identityResult,
    profileResult,
    shiftsResult,
    leaveRequestsResult,
    leaveBalancesResult,
    attendanceResult,
  ] = await Promise.all([
    supabase
      .from("employees")
      .select("id,preferred_name,employment_status,hire_date,work_area")
      .eq("id", scope.employeeId)
      .eq("org_id", scope.orgId)
      .eq("user_id", context.userId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase.rpc("employee_self_profile", {
      p_org_id: scope.orgId,
    }),
    supabase
      .from("shift_assignments")
      .select(
        "id,shift_date,starts_at,ends_at,break_minutes,assignment_status,published_at,confirmed_at",
      )
      .eq("org_id", scope.orgId)
      .eq("employee_id", scope.employeeId)
      .is("deleted_at", null)
      .gte("shift_date", today)
      .order("shift_date", { ascending: true })
      .limit(14),
    supabase
      .from("leave_requests")
      .select("id,leave_type,starts_on,ends_on,request_status,reason,created_at")
      .eq("org_id", scope.orgId)
      .eq("employee_id", scope.employeeId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("leave_balances")
      .select("leave_type,available_days,as_of_date")
      .eq("org_id", scope.orgId)
      .eq("employee_id", scope.employeeId)
      .is("deleted_at", null)
      .order("as_of_date", { ascending: false })
      .limit(20),
    supabase
      .from("attendance_days")
      .select(
        "id,work_date,first_entry,last_exit,worked_minutes,attendance_status,approval_status",
      )
      .eq("org_id", scope.orgId)
      .eq("employee_id", scope.employeeId)
      .is("deleted_at", null)
      .order("work_date", { ascending: false })
      .limit(14),
  ]);

  const failedSources = [
    identityResult.error ? "employee_identity" : null,
    profileResult.error ? "profile" : null,
    shiftsResult.error ? "shifts" : null,
    leaveRequestsResult.error ? "leave_requests" : null,
    leaveBalancesResult.error ? "leave_balances" : null,
    attendanceResult.error ? "attendance" : null,
  ].filter((value): value is string => Boolean(value));

  if (failedSources.length) {
    return {
      status: "error",
      reason: "data_unavailable",
      failedSources,
    };
  }

  const employment = mapEmploymentSummary(identityResult.data);
  const profile = mapSelfProfile(profileResult.data);

  if (
    !employment ||
    employment.employeeId !== scope.employeeId ||
    (profile && profile.employeeId !== scope.employeeId)
  ) {
    return {
      status: "not_available",
      reason: "employee_identity_mismatch",
    };
  }

  return {
    status: "ready",
    data: {
      employment,
      profile,
      upcomingShifts: mapShifts(shiftsResult.data),
      leaveRequests: mapLeaveRequests(leaveRequestsResult.data),
      leaveBalances: mapLeaveBalances(leaveBalancesResult.data),
      recentAttendance: mapAttendance(attendanceResult.data),
      source: "supabase_canonical",
      loadedAt: new Date().toISOString(),
    },
  };
}
