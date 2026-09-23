import { describe, expect, it } from "vitest";

import { mapMySchedule } from "./mappers";

describe("mapMySchedule", () => {
  it("projects only safe published/confirmed self-schedule fields", () => {
    expect(
      mapMySchedule([
        {
          id: "shift-1",
          shift_date: "2026-09-24",
          starts_at: "08:00:00",
          ends_at: "16:00:00",
          break_minutes: 30,
          assignment_status: "published",
          published_at: "2026-09-22T10:00:00Z",
          confirmed_at: null,
          shift_template_id: "DO_NOT_PROJECT",
          data: {
            note: "DO_NOT_PROJECT",
            salary_forecast: "DO_NOT_PROJECT",
          },
          created_by: "DO_NOT_PROJECT",
        },
        {
          id: "shift-2",
          shift_date: "2026-09-25",
          starts_at: "09:00:00",
          ends_at: "17:00:00",
          break_minutes: 60,
          assignment_status: "confirmed",
          published_at: "2026-09-22T10:00:00Z",
          confirmed_at: "2026-09-23T08:00:00Z",
        },
      ]),
    ).toEqual([
      {
        id: "shift-1",
        shiftDate: "2026-09-24",
        startsAt: "08:00:00",
        endsAt: "16:00:00",
        breakMinutes: 30,
        assignmentStatus: "published",
        publishedAt: "2026-09-22T10:00:00Z",
        confirmedAt: null,
      },
      {
        id: "shift-2",
        shiftDate: "2026-09-25",
        startsAt: "09:00:00",
        endsAt: "17:00:00",
        breakMinutes: 60,
        assignmentStatus: "confirmed",
        publishedAt: "2026-09-22T10:00:00Z",
        confirmedAt: "2026-09-23T08:00:00Z",
      },
    ]);
  });

  it("drops draft, cancelled and malformed assignments", () => {
    expect(
      mapMySchedule([
        {
          id: "draft-1",
          shift_date: "2026-09-24",
          assignment_status: "draft",
        },
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
