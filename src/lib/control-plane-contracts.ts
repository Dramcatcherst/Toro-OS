import type { ActionLevel, RiskLevel } from "./toro-types";

export const TORO_EXECUTION_AUTHORITY_LEVELS = [
  "L0",
  "L1",
  "L2",
  "L3",
  "L4",
] as const;

export type ToroExecutionAuthorityLevel =
  (typeof TORO_EXECUTION_AUTHORITY_LEVELS)[number];

export const TORO_EXECUTION_RUN_STATUSES = [
  "queued",
  "claimed",
  "running",
  "verifying",
  "succeeded",
  "blocked",
  "failed",
  "retry_wait",
  "dead_letter",
  "cancelled",
  "superseded",
] as const;

export type ToroExecutionRunStatus =
  (typeof TORO_EXECUTION_RUN_STATUSES)[number];

export const TORO_RECEIPT_TYPES = [
  "observation",
  "analysis",
  "execution",
  "verification",
  "failure",
  "approval",
] as const;

export type ToroReceiptType = (typeof TORO_RECEIPT_TYPES)[number];

export const TORO_VERIFICATION_STATUSES = [
  "not_required",
  "pending",
  "passed",
  "failed",
  "partial",
] as const;

export type ToroVerificationStatus =
  (typeof TORO_VERIFICATION_STATUSES)[number];

const TERMINAL_RUN_STATUSES = new Set<ToroExecutionRunStatus>([
  "succeeded",
  "blocked",
  "dead_letter",
  "cancelled",
  "superseded",
]);

const ALLOWED_TRANSITIONS: Record<
  ToroExecutionRunStatus,
  readonly ToroExecutionRunStatus[]
> = {
  queued: ["claimed", "blocked", "cancelled", "superseded"],
  claimed: ["running", "blocked", "failed", "cancelled"],
  running: ["verifying", "blocked", "failed", "cancelled"],
  verifying: ["succeeded", "blocked", "failed", "cancelled"],
  succeeded: [],
  blocked: [],
  failed: ["retry_wait", "dead_letter", "cancelled", "superseded"],
  retry_wait: ["claimed", "dead_letter", "cancelled", "superseded"],
  dead_letter: [],
  cancelled: [],
  superseded: [],
};

export function isTerminalExecutionRunStatus(
  status: ToroExecutionRunStatus,
): boolean {
  return TERMINAL_RUN_STATUSES.has(status);
}

export function canTransitionExecutionRun(
  from: ToroExecutionRunStatus,
  to: ToroExecutionRunStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Execution authority (L0-L4) is not the same thing as business RiskLevel.
 * This compatibility resolver preserves existing TORO types while projecting
 * the verified master execution contract's authority ceiling.
 */
export function resolveToroExecutionAuthorityLevel(input: {
  actionLevel: ActionLevel;
  risk: RiskLevel;
  externalImpact: boolean;
  specificallyBlocked?: boolean;
}): ToroExecutionAuthorityLevel {
  if (input.specificallyBlocked || input.actionLevel === "blocked") {
    return "L4";
  }

  if (
    input.externalImpact ||
    input.risk === "Critical" ||
    input.risk === "High" ||
    input.actionLevel === "execute_with_approval"
  ) {
    return "L3";
  }

  if (input.actionLevel === "observe") {
    return "L0";
  }

  if (input.actionLevel === "analyze") {
    return "L1";
  }

  return "L2";
}

export function executionAuthorityRequiresHumanGate(
  level: ToroExecutionAuthorityLevel,
): boolean {
  return level === "L3";
}

export function isExecutionAuthorityProhibited(
  level: ToroExecutionAuthorityLevel,
): boolean {
  return level === "L4";
}
