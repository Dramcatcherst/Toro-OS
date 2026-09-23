import type { MyAttendanceDay } from "./types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapMyAttendance(value: unknown): MyAttendanceDay[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    const workDate = text(row.work_date);
    if (!id || !workDate) return [];

    return [{
      id,
      workDate,
      firstEntry: nullableText(row.first_entry),
      lastExit: nullableText(row.last_exit),
      actualWorkedMinutes: numberValue(row.actual_worked_minutes),
      officialWorkedMinutes: numberValue(row.worked_minutes),
      attendanceStatus: text(row.attendance_status),
      approvalStatus: text(row.approval_status),
      payrollEligible: row.payroll_eligible === true,
    }];
  });
}
