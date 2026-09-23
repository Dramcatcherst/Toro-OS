export type MyScheduleShift = {
  id: string;
  shiftDate: string;
  startsAt: string | null;
  endsAt: string | null;
  breakMinutes: number;
  assignmentStatus: "published" | "confirmed";
  publishedAt: string | null;
  confirmedAt: string | null;
};

export type MyScheduleData = {
  employeeId: string;
  preferredName: string;
  shifts: MyScheduleShift[];
  source: "supabase_canonical";
  loadedAt: string;
};

export type MyScheduleState =
  | { status: "ready"; data: MyScheduleData }
  | {
      status: "not_available";
      reason:
        | "organization_context_required"
        | "organization_access_required"
        | "employee_link_required"
        | "employee_identity_mismatch";
    }
  | {
      status: "error";
      reason: "data_unavailable";
      failedSources: string[];
    };
