import type { DelegatedAction, ExecutiveException } from "./types";

const RESULT_STATUSES = new Set(["pending", "pass", "fail", "not_reviewed"]);

export type MaintenanceRoundProgress = {
  roundKey: string;
  roundName: string;
  roundStatus: string;
  totalChecks: number;
  requiredChecks: number;
  passChecks: number;
  failChecks: number;
  notReviewedChecks: number;
  pendingChecks: number;
  closureReadyPasses: number;
  lastCheckUpdatedAt: string | null;
};

export type MaintenanceRoundCheck = {
  checkId: string;
  checkOrder: number;
  blockLabel: string;
  areaLabel: string | null;
  resultStatus: "pending" | "pass" | "fail" | "not_reviewed";
  requiresSupervisorReview: boolean;
  supervisorConfirmed: boolean;
  capturedAt: string | null;
};

export type MaintenanceRoundPayload = {
  round: MaintenanceRoundProgress | null;
  checks: MaintenanceRoundCheck[];
};

export type MaintenanceExecutiveSignals = {
  exceptions: ExecutiveException[];
  delegatedActions: DelegatedAction[];
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid maintenance round payload.");
  }
  return value as Record<string, unknown>;
}

function stringValue(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Invalid maintenance round payload.");
  }
  return value;
}

function nullableString(row: Record<string, unknown>, key: string): string | null {
  const value = row[key];
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new Error("Invalid maintenance round payload.");
  }
  return value;
}

function nonNegativeInteger(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    !Number.isInteger(value)
  ) {
    throw new Error("Invalid maintenance round payload.");
  }
  return value;
}

function booleanValue(row: Record<string, unknown>, key: string): boolean {
  const value = row[key];
  if (typeof value !== "boolean") {
    throw new Error("Invalid maintenance round payload.");
  }
  return value;
}

function parseRound(value: unknown): MaintenanceRoundProgress | null {
  if (value === null) return null;
  const row = record(value);

  return {
    roundKey: stringValue(row, "round_key"),
    roundName: stringValue(row, "round_name"),
    roundStatus: stringValue(row, "round_status"),
    totalChecks: nonNegativeInteger(row, "total_checks"),
    requiredChecks: nonNegativeInteger(row, "required_checks"),
    passChecks: nonNegativeInteger(row, "pass_checks"),
    failChecks: nonNegativeInteger(row, "fail_checks"),
    notReviewedChecks: nonNegativeInteger(row, "not_reviewed_checks"),
    pendingChecks: nonNegativeInteger(row, "pending_checks"),
    closureReadyPasses: nonNegativeInteger(row, "closure_ready_passes"),
    lastCheckUpdatedAt: nullableString(row, "last_check_updated_at"),
  };
}

function parseCheck(value: unknown): MaintenanceRoundCheck {
  const row = record(value);
  const resultStatus = stringValue(row, "result_status");

  if (!RESULT_STATUSES.has(resultStatus)) {
    throw new Error("Invalid maintenance round payload.");
  }

  return {
    checkId: stringValue(row, "check_id"),
    checkOrder: nonNegativeInteger(row, "check_order"),
    blockLabel: stringValue(row, "block_label"),
    areaLabel: nullableString(row, "area_label"),
    resultStatus: resultStatus as MaintenanceRoundCheck["resultStatus"],
    requiresSupervisorReview: booleanValue(row, "requires_supervisor_review"),
    supervisorConfirmed: booleanValue(row, "supervisor_confirmed"),
    capturedAt: nullableString(row, "captured_at"),
  };
}

export function parseMaintenanceRoundPayload(value: unknown): MaintenanceRoundPayload {
  const payload = record(value);
  const checks = payload.checks;

  if (!Array.isArray(checks)) {
    throw new Error("Invalid maintenance round payload.");
  }

  return {
    round: parseRound(payload.round),
    checks: checks.map(parseCheck),
  };
}

export function buildMaintenanceExecutiveSignals(
  payload: MaintenanceRoundPayload,
): MaintenanceExecutiveSignals {
  if (!payload.round) {
    return {
      exceptions: [{
        id: "maintenance-round-missing",
        title: "No hay ronda diaria de mantenimiento preparada",
        domain: "Operación hotelera",
        source: "TORO · mantenimiento",
        freshness: null,
      }],
      delegatedActions: [],
    };
  }

  const round = payload.round;
  const exceptions: ExecutiveException[] = [];
  const pendingP0 = payload.checks.filter(
    (check) =>
      check.blockLabel.startsWith("P0") &&
      (check.resultStatus === "pending" || check.resultStatus === "not_reviewed"),
  ).length;
  const supervisorPending = payload.checks.filter(
    (check) =>
      check.resultStatus === "pass" &&
      check.requiresSupervisorReview &&
      !check.supervisorConfirmed,
  ).length;
  const reviewed = round.passChecks + round.failChecks;
  const remaining = round.pendingChecks + round.notReviewedChecks;

  if (round.failChecks > 0) {
    exceptions.push({
      id: `maintenance-fail:${round.roundKey}`,
      title: `${round.failChecks} chequeo(s) FAIL en mantenimiento`,
      domain: "Operación hotelera",
      source: "TORO · ronda P0/P1",
      freshness: round.lastCheckUpdatedAt,
    });
  }

  if (pendingP0 > 0) {
    exceptions.push({
      id: `maintenance-p0:${round.roundKey}`,
      title: `${pendingP0} P0 de mantenimiento pendientes de verificación`,
      domain: "Operación hotelera",
      source: "TORO · ronda P0/P1",
      freshness: round.lastCheckUpdatedAt,
    });
  }

  if (supervisorPending > 0) {
    exceptions.push({
      id: `maintenance-supervisor:${round.roundKey}`,
      title: `${supervisorPending} P0 PASS esperando confirmación de Gerencia`,
      domain: "Operación hotelera",
      source: "TORO · cierre verificable",
      freshness: round.lastCheckUpdatedAt,
    });
  }

  return {
    exceptions,
    delegatedActions: [{
      id: `maintenance-round:${round.roundKey}`,
      title: "Ronda P0/P1 de mantenimiento",
      owner: "RICO · Mantenimiento + Housekeeping QA",
      nextStep: `${reviewed}/${round.requiredChecks} revisados · ${round.failChecks} FAIL · ${remaining} pendientes`,
      evidence: round.roundKey,
    }],
  };
}
