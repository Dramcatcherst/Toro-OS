import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { resolveTeamScheduleScope } from "./team-context";
import { mapTeamSchedule } from "./team-mappers";
import type { TeamScheduleState } from "./team-types";

function costaRicaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export async function loadTeamSchedule(
  context: ToroResolvedContext,
): Promise<TeamScheduleState> {
  const scope = resolveTeamScheduleScope(context);
  if (!scope.allowed) {
    return { status: "not_available", reason: scope.reason };
  }

  const supabase = await createServerSupabaseClient();
  const rangeFrom = costaRicaToday();
  const rangeTo = addDays(rangeFrom, 20);

  const { data, error } = await supabase
    .from("shift_assignments")
    .select(
      "id,employee_id,shift_date,starts_at,ends_at,break_minutes,assignment_status,employees(preferred_name,work_area,departments(name))",
    )
    .eq("org_id", scope.orgId)
    .is("deleted_at", null)
    .in("assignment_status", ["draft", "published", "confirmed"])
    .gte("shift_date", rangeFrom)
    .lte("shift_date", rangeTo)
    .order("shift_date", { ascending: true })
    .limit(300);

  if (error) {
    return {
      status: "error",
      reason: "data_unavailable",
      failedSources: ["shift_assignments"],
    };
  }

  return {
    status: "ready",
    data: {
      roles: context.membership?.roles ?? [],
      rangeFrom,
      rangeTo,
      shifts: mapTeamSchedule(data),
      source: "supabase_canonical",
      loadedAt: new Date().toISOString(),
    },
  };
}
