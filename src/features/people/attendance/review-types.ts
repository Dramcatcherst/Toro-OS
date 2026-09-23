import type { ToroCanonicalRole } from "@/features/context/types";

export type AttendanceReviewRole =
  | "ADMIN"
  | "RRHH"
  | "GERENCIA"
  | "AUDITOR"
  | "CONTABILIDAD";

export type AttendanceReviewDay = {
  id: string;
  employeeId: string | null;
  employeeName: string;
  workArea: string | null;
  workDate: string;
  actualWorkedMinutes: number;
  officialWorkedMinutes: number;
  attendanceStatus: string;
  approvalStatus: string;
  payrollEligible: boolean;
};

export type AttendanceReviewException = {
  id: string;
  attendanceDayId: string | null;
  exceptionType: string;
  severity: string;
  description: string;
  resolutionStatus: string;
  createdAt: string;
};

export type AttendanceImportSummary = {
  id: string;
  periodFrom: string;
  periodTo: string;
  rawRowCount: number;
  acceptedPunchCount: number;
  duplicateCount: number;
  importedAt: string;
  status: string;
};

export type AttendanceReviewData = {
  roles: ToroCanonicalRole[];
  days: AttendanceReviewDay[];
  openExceptions: AttendanceReviewException[];
  recentImports: AttendanceImportSummary[];
  source: "supabase_canonical";
  loadedAt: string;
};

export type AttendanceReviewState =
  | { status: "ready"; data: AttendanceReviewData }
  | {
      status: "not_available";
      reason:
        | "organization_context_required"
        | "organization_access_required"
        | "attendance_review_role_required";
    }
  | {
      status: "error";
      reason: "data_unavailable";
      failedSources: string[];
    };
