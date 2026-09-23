import type { MyScheduleShift } from "./types";

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

export function mapMySchedule(value: unknown): MyScheduleShift[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const row = record(item);
    const id = text(row.id);
    const shiftDate = text(row.shift_date);
    const status = text(row.assignment_status);

    if (
      !id ||
      !shiftDate ||
      (status !== "published" && status !== "confirmed")
    ) {
      return [];
    }

    return [{
      id,
      shiftDate,
      startsAt: nullableText(row.starts_at),
      endsAt: nullableText(row.ends_at),
      breakMinutes: Math.max(0, numberValue(row.break_minutes)),
      assignmentStatus: status,
      publishedAt: nullableText(row.published_at),
      confirmedAt: nullableText(row.confirmed_at),
    }];
  });
}
