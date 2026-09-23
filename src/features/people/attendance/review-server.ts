import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { resolveAttendanceReviewScope } from "./review-context";
import {
  mapAttendanceImports,
  mapAttendanceReviewDays,
  mapAttendanceReviewExceptions,
} from "./review-mappers";
import type { AttendanceReviewState } from "./review-types";

export async function loadAttendanceReview(
  context: ToroResolvedContext,
): Promise<AttendanceReviewState> {
  const scope = resolveAttendanceReviewScope(context);
  if (!scope.allowed) {
    return { status: "not_available", reason: scope.reason };
  }

  const supabase = await createServerSupabaseClient();

  const [daysResult, exceptionsResult, importsResult] = await Promise.all([
    supabase
      .from("attendance_days")
      .select(
        "id,employee_id,work_date,actual_worked_minutes,worked_minutes,attendance_status,approval_status,payroll_eligible,employees(preferred_name,work_area)",
      )
      .eq("org_id", scope.orgId)
      .is("deleted_at", null)
      .order("work_date", { ascending: false })
      .limit(100),
    supabase
      .from("attendance_exceptions")
      .select(
        "id,attendance_day_id,exception_type,severity,description,resolution_status,created_at",
      )
      .eq("org_id", scope.orgId)
      .eq("resolution_status", "open")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("time_imports")
      .select(
        "id,period_from,period_to,raw_row_count,accepted_punch_count,duplicate_count,imported_at,status",
      )
      .eq("org_id", scope.orgId)
      .is("deleted_at", null)
      .order("imported_at", { ascending: false })
      .limit(10),
  ]);

  const failedSources = [
    daysResult.error ? "attendance_days" : null,
    exceptionsResult.error ? "attendance_exceptions" : null,
    importsResult.error ? "time_imports" : null,
  ].filter((value): value is string => Boolean(value));

  if (failedSources.length) {
    return {
      status: "error",
      reason: "data_unavailable",
      failedSources,
    };
  }

  return {
    status: "ready",
    data: {
      roles: context.membership?.roles ?? [],
      days: mapAttendanceReviewDays(daysResult.data),
      openExceptions: mapAttendanceReviewExceptions(exceptionsResult.data),
      recentImports: mapAttendanceImports(importsResult.data),
      source: "supabase_canonical",
      loadedAt: new Date().toISOString(),
    },
  };
}
