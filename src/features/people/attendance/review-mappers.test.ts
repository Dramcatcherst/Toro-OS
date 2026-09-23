import { describe, expect, it } from "vitest";

import {
  mapAttendanceImports,
  mapAttendanceReviewDays,
  mapAttendanceReviewExceptions,
} from "./review-mappers";

describe("attendance review mappers", () => {
  it("projects safe day fields and minimal employee identity", () => {
    expect(
      mapAttendanceReviewDays([
        {
          id: "day-1",
          employee_id: "employee-1",
          work_date: "2026-09-22",
          actual_worked_minutes: 480,
          worked_minutes: 475,
          attendance_status: "complete",
          approval_status: "approved",
          payroll_eligible: true,
          clock_employee_id: "DO_NOT_PROJECT",
          employees: {
            preferred_name: "Persona",
            work_area: "Recepción",
            legal_name: "DO_NOT_PROJECT",
          },
        },
      ]),
    ).toEqual([
      {
        id: "day-1",
        employeeId: "employee-1",
        employeeName: "Persona",
        workArea: "Recepción",
        workDate: "2026-09-22",
        actualWorkedMinutes: 480,
        officialWorkedMinutes: 475,
        attendanceStatus: "complete",
        approvalStatus: "approved",
        payrollEligible: true,
      },
    ]);
  });

  it("does not project exception resolution payloads", () => {
    expect(
      mapAttendanceReviewExceptions([
        {
          id: "exception-1",
          attendance_day_id: "day-1",
          exception_type: "missing_punch",
          severity: "medium",
          description: "Missing exit",
          resolution_status: "open",
          created_at: "2026-09-22T20:00:00Z",
          resolution_payload: { secret: "DO_NOT_PROJECT" },
        },
      ]),
    ).toEqual([
      {
        id: "exception-1",
        attendanceDayId: "day-1",
        exceptionType: "missing_punch",
        severity: "medium",
        description: "Missing exit",
        resolutionStatus: "open",
        createdAt: "2026-09-22T20:00:00Z",
      },
    ]);
  });

  it("does not project file name, hash or raw import payload", () => {
    expect(
      mapAttendanceImports([
        {
          id: "import-1",
          period_from: "2026-09-01",
          period_to: "2026-09-15",
          raw_row_count: 120,
          accepted_punch_count: 118,
          duplicate_count: 2,
          imported_at: "2026-09-16T10:00:00Z",
          status: "committed",
          file_name: "DO_NOT_PROJECT.xlsx",
          file_sha256: "DO_NOT_PROJECT",
        },
      ]),
    ).toEqual([
      {
        id: "import-1",
        periodFrom: "2026-09-01",
        periodTo: "2026-09-15",
        rawRowCount: 120,
        acceptedPunchCount: 118,
        duplicateCount: 2,
        importedAt: "2026-09-16T10:00:00Z",
        status: "committed",
      },
    ]);
  });
});
