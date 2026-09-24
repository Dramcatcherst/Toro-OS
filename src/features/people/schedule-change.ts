export type ScheduleChangePrepareInput = {
  orgId: string;
  employeeId: string;
  requestedByUserId: string;
  assignment: {
    id: string;
    version: number;
    shiftDate: string;
    startsAt: string;
    endsAt: string;
    breakMinutes: number;
  };
  requested: {
    shiftDate?: string;
    startsAt?: string;
    endsAt?: string;
    breakMinutes?: number;
  };
  reason: string;
  requestedAt: string;
};

export type PreparedScheduleChangeRequest = {
  table: "public.schedule_change_requests";
  org_id: string;
  employee_id: string;
  status: "active";
  data: {
    contract_version: "toro_schedule_change_v1";
    workflow_state: "prepared";
    request_type: "schedule_change";
    source: "toro";
    execution_mode: "prepare_only";
    approval_required: true;
    current_assignment: {
      id: string;
      version: number;
      shift_date: string;
      starts_at: string;
      ends_at: string;
      break_minutes: number;
    };
    requested_change: {
      shift_date: string;
      starts_at: string;
      ends_at: string;
      break_minutes: number;
    };
    reason: string;
    requested_by_user_id: string;
    requested_at: string;
    request_key: string;
  };
};

export type ScheduleChangePrepareResult =
  | { ok: true; request: PreparedScheduleChangeRequest }
  | { ok: false; errors: string[] };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

function clean(value: string) {
  return value.trim();
}

function validIsoTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

export function prepareScheduleChangeRequest(
  input: ScheduleChangePrepareInput,
): ScheduleChangePrepareResult {
  const errors: string[] = [];

  const orgId = clean(input.orgId);
  const employeeId = clean(input.employeeId);
  const requestedByUserId = clean(input.requestedByUserId);
  const assignmentId = clean(input.assignment.id);
  const reason = clean(input.reason);

  if (!orgId) errors.push("orgId is required");
  if (!employeeId) errors.push("employeeId is required");
  if (!requestedByUserId) errors.push("requestedByUserId is required");
  if (!assignmentId) errors.push("assignment.id is required");
  if (!Number.isInteger(input.assignment.version) || input.assignment.version < 1) {
    errors.push("assignment.version must be >= 1");
  }
  if (!DATE_RE.test(input.assignment.shiftDate)) {
    errors.push("assignment.shiftDate must be YYYY-MM-DD");
  }
  if (!TIME_RE.test(input.assignment.startsAt)) {
    errors.push("assignment.startsAt must be HH:MM[:SS]");
  }
  if (!TIME_RE.test(input.assignment.endsAt)) {
    errors.push("assignment.endsAt must be HH:MM[:SS]");
  }
  if (!Number.isInteger(input.assignment.breakMinutes) || input.assignment.breakMinutes < 0) {
    errors.push("assignment.breakMinutes must be >= 0");
  }
  if (!reason) errors.push("reason is required");
  if (reason.length > 1000) errors.push("reason must be <= 1000 characters");
  if (!validIsoTimestamp(input.requestedAt)) {
    errors.push("requestedAt must be a valid ISO timestamp");
  }

  const shiftDate = input.requested.shiftDate ?? input.assignment.shiftDate;
  const startsAt = input.requested.startsAt ?? input.assignment.startsAt;
  const endsAt = input.requested.endsAt ?? input.assignment.endsAt;
  const breakMinutes =
    input.requested.breakMinutes ?? input.assignment.breakMinutes;

  if (!DATE_RE.test(shiftDate)) {
    errors.push("requested.shiftDate must be YYYY-MM-DD");
  }
  if (!TIME_RE.test(startsAt)) {
    errors.push("requested.startsAt must be HH:MM[:SS]");
  }
  if (!TIME_RE.test(endsAt)) {
    errors.push("requested.endsAt must be HH:MM[:SS]");
  }
  if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
    errors.push("requested.breakMinutes must be >= 0");
  }

  const changed =
    shiftDate !== input.assignment.shiftDate ||
    startsAt !== input.assignment.startsAt ||
    endsAt !== input.assignment.endsAt ||
    breakMinutes !== input.assignment.breakMinutes;

  if (!changed) {
    errors.push("requested change must differ from current assignment");
  }

  if (errors.length) return { ok: false, errors };

  const requestKey = [
    "schedule-change",
    employeeId,
    assignmentId,
    String(input.assignment.version),
    shiftDate,
    startsAt,
    endsAt,
    String(breakMinutes),
  ].join(":");

  return {
    ok: true,
    request: {
      table: "public.schedule_change_requests",
      org_id: orgId,
      employee_id: employeeId,
      status: "active",
      data: {
        contract_version: "toro_schedule_change_v1",
        workflow_state: "prepared",
        request_type: "schedule_change",
        source: "toro",
        execution_mode: "prepare_only",
        approval_required: true,
        current_assignment: {
          id: assignmentId,
          version: input.assignment.version,
          shift_date: input.assignment.shiftDate,
          starts_at: input.assignment.startsAt,
          ends_at: input.assignment.endsAt,
          break_minutes: input.assignment.breakMinutes,
        },
        requested_change: {
          shift_date: shiftDate,
          starts_at: startsAt,
          ends_at: endsAt,
          break_minutes: breakMinutes,
        },
        reason,
        requested_by_user_id: requestedByUserId,
        requested_at: input.requestedAt,
        request_key: requestKey,
      },
    },
  };
}
