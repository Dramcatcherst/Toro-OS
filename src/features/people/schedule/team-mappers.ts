import type { TeamScheduleShift } from "./team-types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function relation(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) return record(value[0]);
  return record(value);
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

export function mapTeamSchedule(value: unknown): TeamScheduleShift[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    const shiftDate = text(row.shift_date);
    const status = text(row.assignment_status);

    if (
      !id ||
      !shiftDate ||
      !["draft", "published", "confirmed"].includes(status)
    ) {
      return [];
    }

    const employee = relation(row.employees);
    const department = relation(employee.departments);

    return [{
      id,
      employeeId: nullableText(row.employee_id),
      employeeName: text(employee.preferred_name) || "Sin identificar",
      workArea: nullableText(employee.work_area),
      department: nullableText(department.name),
      shiftDate,
      startsAt: nullableText(row.starts_at),
      endsAt: nullableText(row.ends_at),
      breakMinutes: Math.max(0, numberValue(row.break_minutes)),
      assignmentStatus: status as "draft" | "published" | "confirmed",
    }];
  });
}
