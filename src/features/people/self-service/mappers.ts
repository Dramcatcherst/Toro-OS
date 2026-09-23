import type {
  PeopleAttendanceDay,
  PeopleLeaveBalance,
  PeopleLeaveRequest,
  PeopleSelfServiceProfile,
  PeopleShift,
} from "./types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mapSelfProfile(value: unknown): PeopleSelfServiceProfile | null {
  const row = record(value);
  const employeeId = text(row.employeeId);
  if (!employeeId) return null;

  return {
    employeeId,
    preferredName: text(row.preferredName),
    phone: text(row.phone),
    personalEmail: text(row.personalEmail),
    address: text(row.address),
    emergencyName: text(row.emergencyName),
    emergencyRelationship: text(row.emergencyRelationship),
    emergencyPhone: text(row.emergencyPhone),
  };
}

export function mapShifts(value: unknown): PeopleShift[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    if (!id) return [];
    return [{
      id,
      shiftDate: nullableText(row.shift_date),
      startsAt: nullableText(row.starts_at),
      endsAt: nullableText(row.ends_at),
      breakMinutes: numberValue(row.break_minutes),
      assignmentStatus: text(row.assignment_status),
      publishedAt: nullableText(row.published_at),
      confirmedAt: nullableText(row.confirmed_at),
    }];
  });
}

export function mapLeaveRequests(value: unknown): PeopleLeaveRequest[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    const startsOn = text(row.starts_on);
    const endsOn = text(row.ends_on);
    if (!id || !startsOn || !endsOn) return [];
    return [{
      id,
      leaveType: text(row.leave_type),
      startsOn,
      endsOn,
      requestStatus: text(row.request_status),
      reason: nullableText(row.reason),
    }];
  });
}

export function mapLeaveBalances(value: unknown): PeopleLeaveBalance[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = record(item);
    const asOfDate = text(row.as_of_date);
    if (!asOfDate) return [];
    return [{
      leaveType: nullableText(row.leave_type),
      availableDays: numberValue(row.available_days),
      asOfDate,
    }];
  });
}

export function mapAttendance(value: unknown): PeopleAttendanceDay[] {
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
      workedMinutes: numberValue(row.worked_minutes),
      attendanceStatus: text(row.attendance_status),
      approvalStatus: text(row.approval_status),
    }];
  });
}
