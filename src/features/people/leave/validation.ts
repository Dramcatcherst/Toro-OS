export const PEOPLE_LEAVE_TYPES = [
  "vacation",
  "sick",
  "personal",
  "unpaid",
  "maternity",
  "paternity",
  "other",
] as const;

export type PeopleLeaveType = (typeof PEOPLE_LEAVE_TYPES)[number];

export type PeopleLeaveRequestInput = {
  leaveType: PeopleLeaveType;
  startsOn: string;
  endsOn: string;
  reason: string;
};

export type PeopleLeaveValidationResult =
  | { ok: true; data: PeopleLeaveRequestInput }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function dayNumber(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function parsePeopleLeaveRequest(
  value: unknown,
): PeopleLeaveValidationResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Revise la solicitud." };
  }

  const leaveType =
    typeof value.leaveType === "string" ? value.leaveType.trim().toLowerCase() : "";
  const startsOn =
    typeof value.startsOn === "string" ? value.startsOn.trim() : "";
  const endsOn = typeof value.endsOn === "string" ? value.endsOn.trim() : "";
  const reason = typeof value.reason === "string" ? value.reason.trim() : "";

  if (!PEOPLE_LEAVE_TYPES.includes(leaveType as PeopleLeaveType)) {
    return { ok: false, error: "Seleccione un tipo de permiso válido." };
  }

  if (!isValidIsoDate(startsOn) || !isValidIsoDate(endsOn)) {
    return { ok: false, error: "Use fechas válidas." };
  }

  const duration = dayNumber(endsOn) - dayNumber(startsOn);
  if (duration < 0) {
    return {
      ok: false,
      error: "La fecha final debe ser posterior a la inicial.",
    };
  }
  if (duration > 365) {
    return {
      ok: false,
      error: "La solicitud no puede abarcar más de 366 días.",
    };
  }

  if (reason.length < 5 || reason.length > 1000) {
    return {
      ok: false,
      error: "Explique el motivo con entre 5 y 1000 caracteres.",
    };
  }

  return {
    ok: true,
    data: {
      leaveType: leaveType as PeopleLeaveType,
      startsOn,
      endsOn,
      reason,
    },
  };
}
