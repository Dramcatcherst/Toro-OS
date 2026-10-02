import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ToroExecutionAuthorityLevel,
  ToroExecutionRunStatus,
  ToroReceiptType,
  ToroVerificationStatus,
} from "@/lib/control-plane-contracts";

export type ToroWorkerRun = {
  id: string;
  orgId: string;
  taskId: string;
  decisionId: string | null;
  runKey: string;
  idempotencyKey: string;
  correlationId: string;
  traceId: string | null;
  actorKind: string;
  actorRef: string;
  dotRef: string | null;
  agentRef: string | null;
  actionKey: string;
  targetSystem: string | null;
  executionAuthorityLevel: ToroExecutionAuthorityLevel;
  businessRisk: "Low" | "Medium" | "High" | "Critical";
  status: ToroExecutionRunStatus;
  verificationStatus: ToroVerificationStatus;
  attemptCount: number;
  maxAttempts: number;
  leaseOwner: string | null;
  fencingToken: number;
  leaseExpiresAt: string | null;
};

type ToroRunRow = {
  id?: unknown;
  org_id?: unknown;
  task_id?: unknown;
  decision_id?: unknown;
  run_key?: unknown;
  idempotency_key?: unknown;
  correlation_id?: unknown;
  trace_id?: unknown;
  actor_kind?: unknown;
  actor_ref?: unknown;
  dot_ref?: unknown;
  agent_ref?: unknown;
  action_key?: unknown;
  target_system?: unknown;
  execution_authority_level?: unknown;
  business_risk?: unknown;
  status?: unknown;
  verification_status?: unknown;
  attempt_count?: unknown;
  max_attempts?: unknown;
  lease_owner?: unknown;
  fencing_token?: unknown;
  lease_expires_at?: unknown;
};

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

export function normalizeToroWorkerRun(row: ToroRunRow): ToroWorkerRun | null {
  const id = stringOrNull(row.id);
  const orgId = stringOrNull(row.org_id);
  const taskId = stringOrNull(row.task_id);
  const runKey = stringOrNull(row.run_key);
  const idempotencyKey = stringOrNull(row.idempotency_key);
  const correlationId = stringOrNull(row.correlation_id);
  const actorKind = stringOrNull(row.actor_kind);
  const actorRef = stringOrNull(row.actor_ref);
  const actionKey = stringOrNull(row.action_key);
  const authority = stringOrNull(row.execution_authority_level);
  const risk = stringOrNull(row.business_risk);
  const status = stringOrNull(row.status);
  const verification = stringOrNull(row.verification_status);

  if (
    !id ||
    !orgId ||
    !taskId ||
    !runKey ||
    !idempotencyKey ||
    !correlationId ||
    !actorKind ||
    !actorRef ||
    !actionKey ||
    !authority ||
    !risk ||
    !status ||
    !verification ||
    typeof row.attempt_count !== "number" ||
    typeof row.max_attempts !== "number" ||
    typeof row.fencing_token !== "number"
  ) {
    return null;
  }

  return {
    id,
    orgId,
    taskId,
    decisionId: stringOrNull(row.decision_id),
    runKey,
    idempotencyKey,
    correlationId,
    traceId: stringOrNull(row.trace_id),
    actorKind,
    actorRef,
    dotRef: stringOrNull(row.dot_ref),
    agentRef: stringOrNull(row.agent_ref),
    actionKey,
    targetSystem: stringOrNull(row.target_system),
    executionAuthorityLevel: authority as ToroExecutionAuthorityLevel,
    businessRisk: risk as ToroWorkerRun["businessRisk"],
    status: status as ToroExecutionRunStatus,
    verificationStatus: verification as ToroVerificationStatus,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    leaseOwner: stringOrNull(row.lease_owner),
    fencingToken: row.fencing_token,
    leaseExpiresAt: stringOrNull(row.lease_expires_at),
  };
}

export async function claimNextToroExecutionRun(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    workerId: string;
    leaseSeconds?: number;
  },
): Promise<ToroWorkerRun | null> {
  const { data, error } = await supabase.rpc("toro_claim_execution_run_v1", {
    p_org_id: input.orgId,
    p_worker_id: input.workerId,
    p_lease_seconds: input.leaseSeconds ?? 120,
  });

  if (error) {
    throw new Error("TORO worker claim failed safely.");
  }

  const first = Array.isArray(data) ? data[0] : null;
  if (!first || typeof first !== "object") return null;

  return normalizeToroWorkerRun(first as ToroRunRow);
}

export async function claimToroExecutionRunById(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    runId: string;
    workerId: string;
    leaseSeconds?: number;
  },
): Promise<ToroWorkerRun | null> {
  const { data, error } = await supabase.rpc(
    "toro_claim_execution_run_by_id_v1",
    {
      p_org_id: input.orgId,
      p_run_id: input.runId,
      p_worker_id: input.workerId,
      p_lease_seconds: input.leaseSeconds ?? 120,
    },
  );

  if (error) {
    throw new Error("TORO targeted worker claim failed safely.");
  }

  const first = Array.isArray(data) ? data[0] : null;
  if (!first || typeof first !== "object") return null;

  return normalizeToroWorkerRun(first as ToroRunRow);
}

export async function renewToroExecutionLease(
  supabase: SupabaseClient,
  input: {
    runId: string;
    workerId: string;
    fencingToken: number;
    leaseSeconds?: number;
  },
) {
  const { data, error } = await supabase.rpc("toro_renew_execution_lease_v1", {
    p_run_id: input.runId,
    p_worker_id: input.workerId,
    p_fencing_token: input.fencingToken,
    p_lease_seconds: input.leaseSeconds ?? 120,
  });

  if (error) {
    throw new Error("TORO worker lease renewal failed safely.");
  }

  return data === true;
}

export async function transitionToroExecutionRun(
  supabase: SupabaseClient,
  input: {
    runId: string;
    workerId: string;
    fencingToken: number;
    expectedStatus: ToroExecutionRunStatus;
    nextStatus: ToroExecutionRunStatus;
    verificationStatus?: ToroVerificationStatus | null;
    errorClass?: string | null;
    errorRedacted?: string | null;
  },
) {
  const { data, error } = await supabase.rpc("toro_transition_execution_run_v1", {
    p_run_id: input.runId,
    p_worker_id: input.workerId,
    p_fencing_token: input.fencingToken,
    p_expected_status: input.expectedStatus,
    p_next_status: input.nextStatus,
    p_verification_status: input.verificationStatus ?? null,
    p_error_class: input.errorClass ?? null,
    p_error_redacted: input.errorRedacted ?? null,
  });

  if (error) {
    throw new Error("TORO worker transition failed safely.");
  }

  return data === true;
}

export async function resolveFailedToroExecutionRun(
  supabase: SupabaseClient,
  input: {
    runId: string;
    fencingToken: number;
    retryAt?: string | null;
  },
) {
  const { data, error } = await supabase.rpc(
    "toro_resolve_failed_execution_run_v1",
    {
      p_run_id: input.runId,
      p_fencing_token: input.fencingToken,
      p_retry_at: input.retryAt ?? null,
    },
  );

  if (error) {
    throw new Error("TORO worker failure resolution failed safely.");
  }

  return typeof data === "string" ? data : null;
}

export async function completeToroExecutionRun(
  supabase: SupabaseClient,
  input: {
    runId: string;
    workerId: string;
    fencingToken: number;
    receipt?: {
      external_reference?: string | null;
      desired_state?: unknown;
      observed_before?: unknown;
      executed_state?: unknown;
      observed_after?: unknown;
      verification_method?: string | null;
      evidence_refs?: string[];
      source_receipt_system?: string | null;
      source_receipt_kind?: string | null;
      source_receipt_ref?: string | null;
      integrity_hash?: string | null;
    };
  },
): Promise<string | null> {
  const { data, error } = await supabase.rpc(
    "toro_complete_execution_run_v1",
    {
      p_run_id: input.runId,
      p_worker_id: input.workerId,
      p_fencing_token: input.fencingToken,
      p_receipt: input.receipt ?? {},
    },
  );

  if (error) {
    throw new Error("TORO worker atomic completion failed safely.");
  }

  return typeof data === "string" ? data : null;
}

export async function appendToroExecutionReceipt(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    runId: string;
    taskId: string;
    decisionId?: string | null;
    supersedesReceiptId?: string | null;
    receiptType: ToroReceiptType;
    status:
      | "prepared"
      | "executed"
      | "verified"
      | "failed"
      | "denied"
      | "replayed"
      | "blocked";
    actionKey: string;
    targetSystem?: string | null;
    externalReference?: string | null;
    actorKind: string;
    actorRef: string;
    dotRef?: string | null;
    agentRef?: string | null;
    executionAuthorityLevel: ToroExecutionAuthorityLevel;
    businessRisk: "Low" | "Medium" | "High" | "Critical";
    correlationId: string;
    traceId?: string | null;
    idempotencyKey: string;
    desiredState?: unknown;
    observedBefore?: unknown;
    executedState?: unknown;
    observedAfter?: unknown;
    verificationMethod?: string | null;
    verificationStatus: ToroVerificationStatus;
    evidenceRefs?: string[];
    sourceReceiptSystem?: string | null;
    sourceReceiptKind?: string | null;
    sourceReceiptRef?: string | null;
    integrityHash?: string | null;
    errorClass?: string | null;
    errorRedacted?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("toro_execution_receipts")
    .insert({
      org_id: input.orgId,
      run_id: input.runId,
      task_id: input.taskId,
      decision_id: input.decisionId ?? null,
      supersedes_receipt_id: input.supersedesReceiptId ?? null,
      receipt_type: input.receiptType,
      status: input.status,
      action_key: input.actionKey,
      target_system: input.targetSystem ?? null,
      external_reference: input.externalReference ?? null,
      actor_kind: input.actorKind,
      actor_ref: input.actorRef,
      dot_ref: input.dotRef ?? null,
      agent_ref: input.agentRef ?? null,
      execution_authority_level: input.executionAuthorityLevel,
      business_risk: input.businessRisk,
      correlation_id: input.correlationId,
      trace_id: input.traceId ?? null,
      idempotency_key: input.idempotencyKey,
      desired_state: input.desiredState ?? null,
      observed_before: input.observedBefore ?? null,
      executed_state: input.executedState ?? null,
      observed_after: input.observedAfter ?? null,
      verification_method: input.verificationMethod ?? null,
      verification_status: input.verificationStatus,
      evidence_refs: input.evidenceRefs ?? [],
      source_receipt_system: input.sourceReceiptSystem ?? null,
      source_receipt_kind: input.sourceReceiptKind ?? null,
      source_receipt_ref: input.sourceReceiptRef ?? null,
      integrity_hash: input.integrityHash ?? null,
      error_class: input.errorClass ?? null,
      error_redacted: input.errorRedacted ?? null,
    })
    .select("id, created_at")
    .single();

  if (error) {
    throw new Error("TORO receipt append failed safely.");
  }

  return data;
}
