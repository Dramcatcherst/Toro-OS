const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MaintenanceResultStatus =
  | "pending"
  | "pass"
  | "fail"
  | "not_reviewed";

export type MaintenanceRoundSummary = {
  roundKey: string;
  roundName: string;
  roundStatus: string;
  priority: string;
  objective: string;
  estimatedMinutes: number | null;
  responsibleName: string | null;
  totalChecks: number;
  requiredChecks: number;
  passChecks: number;
  failChecks: number;
  notReviewedChecks: number;
  pendingChecks: number;
  closureReadyPasses: number;
  lastCheckUpdatedAt: string | null;
};

export type MaintenanceCheck = {
  checkId: string;
  checkOrder: number;
  blockLabel: string;
  areaLabel: string | null;
  roomNumber: number | null;
  checkText: string;
  passCriteria: string;
  resultStatus: MaintenanceResultStatus;
  evidenceRef: string | null;
  evidenceNote: string | null;
  responsibleName: string | null;
  capturedAt: string | null;
  requiresSupervisorReview: boolean;
  supervisorConfirmed: boolean;
  closureReady: boolean;
  supplierOrTechnician: string | null;
  costSignalAmount: number | null;
  costSignalCurrency: string | null;
  costSignalKind: string;
  costSignalVerification: string | null;
  approvedCostAmount: number | null;
  approvedCostCurrency: string | null;
};

export type MaintenanceFieldRound = {
  round: MaintenanceRoundSummary | null;
  checks: MaintenanceCheck[];
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid maintenance payload.");
  }

  return value as Record<string, unknown>;
}

function requiredString(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Invalid maintenance payload.");
  }

  return value;
}

function nullableString(row: Record<string, unknown>, key: string): string | null {
  const value = row[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new Error("Invalid maintenance payload.");
  }

  return value;
}

function requiredBoolean(row: Record<string, unknown>, key: string): boolean {
  const value = row[key];
  if (typeof value !== "boolean") {
    throw new Error("Invalid maintenance payload.");
  }

  return value;
}

function nullableNumber(row: Record<string, unknown>, key: string): number | null {
  const value = row[key];
  if (value === null || value === undefined) return null;

  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numberValue)) {
    throw new Error("Invalid maintenance payload.");
  }

  return numberValue;
}

function nonNegativeInteger(row: Record<string, unknown>, key: string): number {
  const value = nullableNumber(row, key);
  if (value === null || value < 0 || !Number.isInteger(value)) {
    throw new Error("Invalid maintenance payload.");
  }

  return value;
}

function parseRound(value: unknown): MaintenanceRoundSummary | null {
  if (value === null) return null;

  const row = asRecord(value);

  return {
    roundKey: requiredString(row, "round_key"),
    roundName: requiredString(row, "round_name"),
    roundStatus: requiredString(row, "round_status"),
    priority: requiredString(row, "priority"),
    objective: requiredString(row, "objective"),
    estimatedMinutes: nullableNumber(row, "estimated_minutes"),
    responsibleName: nullableString(row, "responsible_name"),
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

function parseCheck(value: unknown): MaintenanceCheck {
  const row = asRecord(value);
  const checkId = requiredString(row, "check_id");
  const resultStatus = requiredString(row, "result_status");

  if (!UUID_PATTERN.test(checkId)) {
    throw new Error("Invalid maintenance payload.");
  }

  if (!["pending", "pass", "fail", "not_reviewed"].includes(resultStatus)) {
    throw new Error("Invalid maintenance payload.");
  }

  const roomNumber = nullableNumber(row, "room_number");
  if (roomNumber !== null && (!Number.isInteger(roomNumber) || roomNumber < 0)) {
    throw new Error("Invalid maintenance payload.");
  }

  return {
    checkId,
    checkOrder: nonNegativeInteger(row, "check_order"),
    blockLabel: requiredString(row, "block_label"),
    areaLabel: nullableString(row, "area_label"),
    roomNumber,
    checkText: requiredString(row, "check_text"),
    passCriteria: requiredString(row, "pass_criteria"),
    resultStatus: resultStatus as MaintenanceResultStatus,
    evidenceRef: nullableString(row, "evidence_ref"),
    evidenceNote: nullableString(row, "evidence_note"),
    responsibleName: nullableString(row, "responsible_name"),
    capturedAt: nullableString(row, "captured_at"),
    requiresSupervisorReview: requiredBoolean(row, "requires_supervisor_review"),
    supervisorConfirmed: requiredBoolean(row, "supervisor_confirmed"),
    closureReady: requiredBoolean(row, "closure_ready"),
    supplierOrTechnician: nullableString(row, "supplier_or_technician"),
    costSignalAmount: nullableNumber(row, "cost_signal_amount"),
    costSignalCurrency: nullableString(row, "cost_signal_currency"),
    costSignalKind: requiredString(row, "cost_signal_kind"),
    costSignalVerification: nullableString(row, "cost_signal_verification"),
    approvedCostAmount: nullableNumber(row, "approved_cost_amount"),
    approvedCostCurrency: nullableString(row, "approved_cost_currency"),
  };
}

export function parseMaintenanceFieldRound(value: unknown): MaintenanceFieldRound {
  const payload = asRecord(value);
  if (!Array.isArray(payload.checks)) {
    throw new Error("Invalid maintenance payload.");
  }

  return {
    round: parseRound(payload.round),
    checks: payload.checks.map(parseCheck),
  };
}

function severityRank(check: MaintenanceCheck) {
  if (check.blockLabel.startsWith("P0")) return 0;
  if (check.blockLabel.startsWith("P1")) return 1;
  return 2;
}

export function sortMaintenanceChecks(checks: MaintenanceCheck[]) {
  return [...checks].sort(
    (left, right) =>
      severityRank(left) - severityRank(right) ||
      left.checkOrder - right.checkOrder,
  );
}

export function formatCostSignal(check: MaintenanceCheck): {
  label: string;
  value: string;
} | null {
  if (check.costSignalAmount === null || !check.costSignalCurrency) return null;

  const labels: Record<string, string> = {
    vendor_quote: "Cotización reportada",
    negotiated_quote: "Cotización negociada",
    capital_estimate: "Estimación de capital",
    actual_maintenance_cost: "Costo real registrado",
    asset_purchase: "Compra de activo registrada",
    unknown: "Monto reportado",
  };

  return {
    label: labels[check.costSignalKind] ?? "Monto reportado",
    value: `${check.costSignalCurrency} ${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(check.costSignalAmount)}`,
  };
}

export function formatApprovedCost(check: MaintenanceCheck): string {
  if (check.approvedCostAmount === null || !check.approvedCostCurrency) {
    return "No disponible";
  }

  return `${check.approvedCostCurrency} ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(check.approvedCostAmount)}`;
}
