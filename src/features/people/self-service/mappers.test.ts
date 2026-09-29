import { describe, expect, it } from "vitest";

import {
  mapAttendance,
  mapEmploymentSummary,
  mapLeaveBalances,
  mapLeaveRequests,
  mapPayrollReceipts,
  mapSelfProfile,
  mapShifts,
} from "./mappers";

describe("TORO People self-service mappers", () => {
  it("exposes only minimal safe employment identity fields", () => {
    expect(
      mapEmploymentSummary({
        id: "employee-1",
        preferred_name: "Persona",
        employment_status: "active",
        hire_date: "2026-01-10",
        work_area: "Recepción",
        legal_name: "SHOULD_NOT_PROJECT",
        salary: 999999,
        bank_account: "SHOULD_NOT_PROJECT",
      }),
    ).toEqual({
      employeeId: "employee-1",
      preferredName: "Persona",
      employmentStatus: "active",
      hireDate: "2026-01-10",
      workArea: "Recepción",
    });
  });

  it("exposes only the approved self-profile fields", () => {
    expect(
      mapSelfProfile({
        employeeId: "employee-1",
        preferredName: "Persona",
        phone: "0000",
        personalEmail: "person@example.invalid",
        address: "Private",
        emergencyName: "Contact",
        emergencyRelationship: "Family",
        emergencyPhone: "1111",
        salary: 999999,
        bank_account: "SHOULD_NOT_LEAK",
      }),
    ).toEqual({
      employeeId: "employee-1",
      preferredName: "Persona",
      phone: "0000",
      personalEmail: "person@example.invalid",
      address: "Private",
      emergencyName: "Contact",
      emergencyRelationship: "Family",
      emergencyPhone: "1111",
    });
  });

  it("maps upcoming shift fields without arbitrary JSON payload", () => {
    expect(
      mapShifts([
        {
          id: "shift-1",
          shift_date: "2026-09-24",
          starts_at: "08:00:00",
          ends_at: "16:00:00",
          break_minutes: 30,
          assignment_status: "published",
          published_at: "2026-09-22T10:00:00Z",
          confirmed_at: null,
          data: { secret: "not projected" },
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
    ]);
  });

  it("maps only the employee-safe payroll receipt projection", () => {
    expect(
      mapPayrollReceipts([
        {
          id: "line-1",
          payroll_period_id: "period-1",
          regular_minutes: 4800,
          overtime_minutes: 120,
          gross_amount: "250000.50",
          deduction_amount: "25000.25",
          net_amount: "225000.25",
          line_status: "paid",
          calculation_snapshot: {
            period_from: "2026-09-01",
            period_to: "2026-09-15",
            hourly_rate: 999999,
            adjustment_note: "SHOULD_NOT_PROJECT",
          },
          bank_account: "SHOULD_NOT_PROJECT",
        },
      ]),
    ).toEqual([
      {
        id: "line-1",
        payrollPeriodId: "period-1",
        periodFrom: "2026-09-01",
        periodTo: "2026-09-15",
        regularMinutes: 4800,
        overtimeMinutes: 120,
        grossAmount: 250000.5,
        deductionAmount: 25000.25,
        netAmount: 225000.25,
        lineStatus: "paid",
      },
    ]);
  });

  it("drops malformed rows instead of inventing identifiers/dates", () => {
    expect(mapLeaveRequests([{ leave_type: "vacation" }])).toEqual([]);
    expect(mapAttendance([{ worked_minutes: 480 }])).toEqual([]);
    expect(mapLeaveBalances([{ available_days: 3 }])).toEqual([]);
    expect(mapPayrollReceipts([{ net_amount: 1 }])).toEqual([]);
  });
});
