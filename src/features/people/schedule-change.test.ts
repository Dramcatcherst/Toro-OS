import { describe, expect, it } from "vitest";

import { prepareScheduleChangeRequest } from "./schedule-change";

const base = {
  orgId: "11111111-1111-1111-1111-111111111111",
  employeeId: "22222222-2222-2222-2222-222222222222",
  requestedByUserId: "33333333-3333-3333-3333-333333333333",
  assignment: {
    id: "44444444-4444-4444-4444-444444444444",
    version: 3,
    shiftDate: "2026-09-25",
    startsAt: "08:00",
    endsAt: "16:00",
    breakMinutes: 30,
  },
  requested: {
    startsAt: "09:00",
    endsAt: "17:00",
  },
  reason: "Necesito mover el turno una hora por una cita.",
  requestedAt: "2026-09-24T17:00:00Z",
};

describe("prepareScheduleChangeRequest", () => {
  it("prepares a bounded request without any execution authority", () => {
    const result = prepareScheduleChangeRequest(base);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.request).toMatchObject({
      table: "public.schedule_change_requests",
      org_id: base.orgId,
      employee_id: base.employeeId,
      status: "active",
      data: {
        contract_version: "toro_schedule_change_v1",
        workflow_state: "prepared",
        request_type: "schedule_change",
        source: "toro",
        execution_mode: "prepare_only",
        approval_required: true,
        current_assignment: {
          id: base.assignment.id,
          version: 3,
          starts_at: "08:00",
          ends_at: "16:00",
        },
        requested_change: {
          shift_date: "2026-09-25",
          starts_at: "09:00",
          ends_at: "17:00",
          break_minutes: 30,
        },
      },
    });
    expect(result.request.data.request_key).toContain(base.assignment.id);
  });

  it("fails when the requested shift does not change", () => {
    const result = prepareScheduleChangeRequest({
      ...base,
      requested: {},
    });

    expect(result).toEqual({
      ok: false,
      errors: ["requested change must differ from current assignment"],
    });
  });

  it("fails closed on invalid date/time, empty reason and invalid version", () => {
    const result = prepareScheduleChangeRequest({
      ...base,
      assignment: {
        ...base.assignment,
        version: 0,
        shiftDate: "25-09-2026",
        startsAt: "8am",
      },
      requested: {
        shiftDate: "tomorrow",
        startsAt: "25:00",
        breakMinutes: -1,
      },
      reason: " ",
      requestedAt: "not-a-time",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors).toEqual(
      expect.arrayContaining([
        "assignment.version must be >= 1",
        "assignment.shiftDate must be YYYY-MM-DD",
        "assignment.startsAt must be HH:MM[:SS]",
        "reason is required",
        "requestedAt must be a valid ISO timestamp",
        "requested.shiftDate must be YYYY-MM-DD",
        "requested.startsAt must be HH:MM[:SS]",
        "requested.breakMinutes must be >= 0",
      ]),
    );
  });

  it("changes the request key when the source assignment version changes", () => {
    const first = prepareScheduleChangeRequest(base);
    const second = prepareScheduleChangeRequest({
      ...base,
      assignment: { ...base.assignment, version: 4 },
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    expect(first.request.data.request_key).not.toBe(second.request.data.request_key);
  });
});
