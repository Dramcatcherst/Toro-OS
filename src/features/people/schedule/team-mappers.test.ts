import { describe, expect, it } from "vitest";

import { mapTeamSchedule } from "./team-mappers";

describe("mapTeamSchedule", () => {
  it("projects safe team schedule fields only", () => {
    expect(
      mapTeamSchedule([
        {
          id: "shift-1",
          employee_id: "employee-1",
          shift_date: "2026-09-24",
          starts_at: "08:00:00",
          ends_at: "16:00:00",
          break_minutes: 30,
          assignment_status: "draft",
          shift_template_id: "DO_NOT_PROJECT",
          data: {
            note: "DO_NOT_PROJECT",
            salary: "DO_NOT_PROJECT",
          },
          employees: {
            preferred_name: "Persona",
            work_area: "Recepción",
            legal_name: "DO_NOT_PROJECT",
            departments: { name: "Recepción" },
          },
        },
      ]),
    ).toEqual([
      {
        id: "shift-1",
        employeeId: "employee-1",
        employeeName: "Persona",
        workArea: "Recepción",
        department: "Recepción",
        shiftDate: "2026-09-24",
        startsAt: "08:00:00",
        endsAt: "16:00:00",
        breakMinutes: 30,
        assignmentStatus: "draft",
      },
    ]);
  });

  it("drops cancelled and malformed assignments", () => {
    expect(
      mapTeamSchedule([
        {
          id: "cancelled-1",
          shift_date: "2026-09-24",
          assignment_status: "cancelled",
        },
        { assignment_status: "published" },
      ]),
    ).toEqual([]);
  });
});
