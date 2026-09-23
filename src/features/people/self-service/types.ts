export type PeopleSelfServiceProfile = {
  employeeId: string;
  preferredName: string;
  phone: string;
  personalEmail: string;
  address: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
};

export type PeopleShift = {
  id: string;
  shiftDate: string | null;
  startsAt: string | null;
  endsAt: string | null;
  breakMinutes: number;
  assignmentStatus: string;
  publishedAt: string | null;
  confirmedAt: string | null;
};

export type PeopleLeaveRequest = {
  id: string;
  leaveType: string;
  startsOn: string;
  endsOn: string;
  requestStatus: string;
  reason: string | null;
};

export type PeopleLeaveBalance = {
  leaveType: string | null;
  availableDays: number;
  asOfDate: string;
};

export type PeopleAttendanceDay = {
  id: string;
  workDate: string;
  firstEntry: string | null;
  lastExit: string | null;
  workedMinutes: number;
  attendanceStatus: string;
  approvalStatus: string;
};

export type PeopleSelfServiceData = {
  profile: PeopleSelfServiceProfile | null;
  upcomingShifts: PeopleShift[];
  leaveRequests: PeopleLeaveRequest[];
  leaveBalances: PeopleLeaveBalance[];
  recentAttendance: PeopleAttendanceDay[];
  source: "supabase_canonical";
  loadedAt: string;
};

export type PeopleSelfServiceState =
  | {
      status: "ready";
      data: PeopleSelfServiceData;
    }
  | {
      status: "not_available";
      reason:
        | "organization_context_required"
        | "organization_access_required"
        | "employee_link_required";
    }
  | {
      status: "error";
      reason: "data_unavailable";
      failedSources: string[];
    };
