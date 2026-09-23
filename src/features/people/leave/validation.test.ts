import { describe, expect, it } from "vitest";

import { parsePeopleLeaveRequest } from "./validation";

describe("parsePeopleLeaveRequest", () => {
  it("accepts a valid self-service request without employee identity input", () => {
    expect(
      parsePeopleLeaveRequest({
        leaveType: "vacation",
        startsOn: "2026-10-01",
        endsOn: "2026-10-03",
        reason: "Descanso familiar",
        employeeId: "must-be-ignored",
      }),
    ).toEqual({
      ok: true,
      data: {
        leaveType: "vacation",
        startsOn: "2026-10-01",
        endsOn: "2026-10-03",
        reason: "Descanso familiar",
      },
    });
  });

  it("rejects impossible dates", () => {
    expect(
      parsePeopleLeaveRequest({
        leaveType: "vacation",
        startsOn: "2026-02-31",
        endsOn: "2026-03-02",
        reason: "Descanso",
      }),
    ).toMatchObject({ ok: false });
  });

  it("rejects reversed and overlong ranges", () => {
    expect(
      parsePeopleLeaveRequest({
        leaveType: "personal",
        startsOn: "2026-10-10",
        endsOn: "2026-10-01",
        reason: "Asunto personal",
      }),
    ).toMatchObject({ ok: false });

    expect(
      parsePeopleLeaveRequest({
        leaveType: "personal",
        startsOn: "2026-01-01",
        endsOn: "2027-01-03",
        reason: "Asunto personal",
      }),
    ).toMatchObject({ ok: false });
  });

  it("rejects unknown leave types and short reasons", () => {
    expect(
      parsePeopleLeaveRequest({
        leaveType: "magic",
        startsOn: "2026-10-01",
        endsOn: "2026-10-02",
        reason: "Motivo válido",
      }),
    ).toMatchObject({ ok: false });

    expect(
      parsePeopleLeaveRequest({
        leaveType: "sick",
        startsOn: "2026-10-01",
        endsOn: "2026-10-02",
        reason: "x",
      }),
    ).toMatchObject({ ok: false });
  });
});
