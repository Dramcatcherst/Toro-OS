import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { resolvePeopleSelfServiceScope } from "@/features/people/self-service/context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { mapMySchedule } from "./mappers";
import type { MyScheduleState } from "./types";

function costaRicaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export async function loadMySchedule(
  context: ToroResolvedContext,
): Promise<MyScheduleState> {
  const scope = resolvePeopleSelfServiceScope(context);
  if (!scope.allowed) {
    return { status: "not_available", reason: scope.reason };
  }

  const supabase = await createServerSupabaseClient();
  const today = costaRicaToday();

  const [identityResult, shiftsResult] = await Promise.all([
    supabase
      .from("employees")
      .select("id,preferred_name")
      .eq("id", scope.employeeId)
      .eq("org_id", scope.orgId)
      .eq("user_id", context.userId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("shift_assignments")
      .select(
        "id,shift_date,starts_at,ends_at,break_minutes,assignment_status,published_at,confirmed_at",
      )
      .eq("org_id", scope.orgId)
      .eq("employee_id", scope.employeeId)
      .is("deleted_at", null)
      .in("assignment_status", ["published", "confirmed"])
      .gte("shift_date", today)
      .order("shift_date", { ascending: true })
      .limit(60),
  ]);

  const failedSources = [
    identityResult.error ? "employee_identity" : null,
    shiftsResult.error ? "shift_assignments" : null,
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
      shifts: mapMySchedule(shiftsResult.data),
      source: "supabase_canonical",
      loadedAt: new Date().toISOString(),
    },
  };
}
