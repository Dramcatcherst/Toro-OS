import { describe, expect, it } from "vitest";

import { mapMyAttendance } from "./mappers";

describe("mapMyAttendance", () => {
  it("projects only self-attendance summary fields", () => {
    expect(
      mapMyAttendance([
        {
          id: "day-1",
          work_date: "2026-09-22",
          first_entry: "2026-09-22T14:00:00Z",
          last_exit: "2026-09-22T22:00:00Z",
          actual_worked_minutes: 480,
          worked_minutes: 475,
          attendance_status: "complete",
          approval_status: "approved",
          payroll_eligible: true,
          clock_employee_id: "DO_NOT_PROJECT",
          source_import_id: "DO_NOT_PROJECT",
          approved_by: "DO_NOT_PROJECT",
        },
      ]),
    ).toEqual([
      {
        id: "day-1",
        workDate: "2026-09-22",
        firstEntry: "2026-09-22T14:00:00Z",
        lastExit: "2026-09-22T22:00:00Z",
        actualWorkedMinutes: 480,
        officialWorkedMinutes: 475,
        attendanceStatus: "complete",
        approvalStatus: "approved",
        payrollEligible: true,
      },
    ]);
  });

  it("drops malformed rows", () => {
    expect(mapMyAttendance([{ worked_minutes: 480 }])).toEqual([]);
  });
});
