import type {
  AttendanceImportSummary,
  AttendanceReviewDay,
  AttendanceReviewException,
} from "./review-types";

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

function employeeRelation(value: unknown) {
  if (Array.isArray(value)) return record(value[0]);
  return record(value);
}

export function mapAttendanceReviewDays(value: unknown): AttendanceReviewDay[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    const workDate = text(row.work_date);
    if (!id || !workDate) return [];

    const employee = employeeRelation(row.employees);

    return [{
      id,
      employeeId: nullableText(row.employee_id),
      employeeName: text(employee.preferred_name) || "Sin identificar",
      workArea: nullableText(employee.work_area),
      workDate,
      actualWorkedMinutes: numberValue(row.actual_worked_minutes),
      officialWorkedMinutes: numberValue(row.worked_minutes),
      attendanceStatus: text(row.attendance_status),
      approvalStatus: text(row.approval_status),
      payrollEligible: row.payroll_eligible === true,
    }];
  });
}

export function mapAttendanceReviewExceptions(
  value: unknown,
): AttendanceReviewException[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    const createdAt = text(row.created_at);
    if (!id || !createdAt) return [];

    return [{
      id,
      attendanceDayId: nullableText(row.attendance_day_id),
      exceptionType: text(row.exception_type),
      severity: text(row.severity),
      description: text(row.description),
      resolutionStatus: text(row.resolution_status),
      createdAt,
    }];
  });
}

export function mapAttendanceImports(value: unknown): AttendanceImportSummary[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    const periodFrom = text(row.period_from);
    const periodTo = text(row.period_to);
    const importedAt = text(row.imported_at);
    if (!id || !periodFrom || !periodTo || !importedAt) return [];

    return [{
      id,
      periodFrom,
      periodTo,
      rawRowCount: numberValue(row.raw_row_count),
      acceptedPunchCount: numberValue(row.accepted_punch_count),
      duplicateCount: numberValue(row.duplicate_count),
      importedAt,
      status: text(row.status),
    }];
  });
}
