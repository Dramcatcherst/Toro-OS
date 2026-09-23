import type { ToroCanonicalRole } from "@/features/context/types";

export type TeamScheduleRole =
  | "ADMIN"
  | "RRHH"
  | "GERENCIA"
  | "JEFE_DEPARTAMENTO"
  | "AUDITOR";

export type TeamScheduleShift = {
  id: string;
  employeeId: string | null;
  employeeName: string;
  workArea: string | null;
  department: string | null;
  shiftDate: string;
  startsAt: string | null;
  endsAt: string | null;
  breakMinutes: number;
  assignmentStatus: "draft" | "published" | "confirmed";
};

export type TeamScheduleData = {
  roles: ToroCanonicalRole[];
  rangeFrom: string;
  rangeTo: string;
  shifts: TeamScheduleShift[];
  source: "supabase_canonical";
  loadedAt: string;
};

export type TeamScheduleState =
  | { status: "ready"; data: TeamScheduleData }
  | {
      status: "not_available";
      reason:
        | "organization_context_required"
        | "organization_access_required"
        | "team_schedule_role_required";
    }
  | {
      status: "error";
      reason: "data_unavailable";
      failedSources: string[];
    };
