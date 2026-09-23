export type MyAttendanceDay = {
  id: string;
  workDate: string;
  firstEntry: string | null;
  lastExit: string | null;
  actualWorkedMinutes: number;
  officialWorkedMinutes: number;
  attendanceStatus: string;
  approvalStatus: string;
  payrollEligible: boolean;
};

export type MyAttendanceData = {
  employeeId: string;
  preferredName: string;
  days: MyAttendanceDay[];
  source: "supabase_canonical";
  loadedAt: string;
};

export type MyAttendanceState =
  | { status: "ready"; data: MyAttendanceData }
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
