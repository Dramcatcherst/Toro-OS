import "server-only";
import { assertInternalRuntime } from "@/lib/server/public-demo";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlegraWriterRpcClient } from "@/lib/supabase/alegra-writer-rpc";

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
  assertInternalRuntime();
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
  assertInternalRuntime();
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

export type ToroApprovedL3Dispatch = {
  approvalReceiptId: string;
  approvalId: string;
  approvalActorId: string;
  approvalApprovedAt: string;
  approvalExpiresAt: string;
  payloadHash: string;
  decisionRevision: string;
};

export type ToroL3DispatchAdmission = {
  runId: string;
  fencingToken: number;
  leaseExpiresAt: string;
  preparedReceiptId: string;
};

export type ToroAlegraExecutionFinalization = {
  runId: string;
  finalReceiptId: string;
  runStatus: "succeeded" | "blocked";
  verificationStatus: "passed" | "partial";
  replayed: boolean;
};

export type ToroAlegraLeaseHeartbeat = {
  runId: string;
  fencingToken: number;
  leaseExpiresAt: string;
  preparedReceiptId: string;
};

export type ToroAlegraExpiredLeaseRecovery = {
  runId: string;
  finalReceiptId: string;
  fencingToken: number;
  runStatus: "blocked";
  verificationStatus: "partial";
  providerState: "PROVIDER_STATE_UNKNOWN";
  replayed: boolean;
};

/**
 * Atomically admits one explicitly approved Alegra L3 run at the provider
 * dispatch boundary. The generic queue/targeted claim RPCs intentionally stay
 * limited to L0-L2. This RPC must remain fail-closed and callable only by a
 * dedicated runtime role without direct table DML; broad service_role is not
 * the Writer role for this boundary.
 */
export async function admitApprovedAlegraExecutionRun(
  supabase: AlegraWriterRpcClient,
  input: {
    orgId: string;
    runId: string;
    workerId: string;
    expectedFencingToken: number;
    approval: ToroApprovedL3Dispatch;
    leaseSeconds?: number;
  },
): Promise<ToroL3DispatchAdmission | null> {
  assertInternalRuntime();
  const { data, error } = await supabase.rpc(
    "toro_admit_approved_alegra_execution_v1",
    {
      p_org_id: input.orgId,
      p_run_id: input.runId,
      p_worker_id: input.workerId,
      p_expected_fencing_token: input.expectedFencingToken,
      p_approval_receipt_id: input.approval.approvalReceiptId,
      p_approval_id: input.approval.approvalId,
      p_approval_actor_id: input.approval.approvalActorId,
      p_approval_approved_at: input.approval.approvalApprovedAt,
      p_approval_expires_at: input.approval.approvalExpiresAt,
      p_payload_hash: input.approval.payloadHash,
      p_decision_revision: input.approval.decisionRevision,
      p_lease_seconds: input.leaseSeconds ?? 120,
    },
  );

  if (error) {
    throw new Error("TORO approved Alegra dispatch admission failed safely.");
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;

  const candidate = row as Record<string, unknown>;
  const runId = stringOrNull(candidate.runId ?? candidate.run_id);
  const leaseExpiresAt = stringOrNull(
    candidate.leaseExpiresAt ?? candidate.lease_expires_at,
  );
  const preparedReceiptId = stringOrNull(
    candidate.preparedReceiptId ?? candidate.prepared_receipt_id,
  );
  const rawFencingToken =
    candidate.fencingToken ?? candidate.fencing_token;
  const fencingToken =
    typeof rawFencingToken === "number"
      ? rawFencingToken
      : typeof rawFencingToken === "string"
        ? Number(rawFencingToken)
        : Number.NaN;

  if (
    runId !== input.runId ||
    !leaseExpiresAt ||
    !preparedReceiptId ||
    !Number.isSafeInteger(fencingToken) ||
    fencingToken !== input.expectedFencingToken + 1
  ) {
    return null;
  }

  return { runId, fencingToken, leaseExpiresAt, preparedReceiptId };
}

/**
 * Atomically persists or recovers the one final Alegra receipt and moves the
 * exact fenced run to its matching terminal state. The prepared admission
 * receipt remains part of the authority/evidence chain.
 */
export async function finalizeAlegraExecutionRun(
  supabase: AlegraWriterRpcClient,
  input: {
    orgId: string;
    runId: string;
    workerId: string;
    fencingToken: number;
    preparedReceiptId: string;
    outcome: "verified" | "reconciliation_required";
    receipt: {
      external_reference?: string | null;
      observed_after: unknown;
      evidence_refs?: string[];
      integrity_hash: string;
    };
  },
): Promise<ToroAlegraExecutionFinalization | null> {
  assertInternalRuntime();
  const { data, error } = await supabase.rpc(
    "toro_finalize_alegra_execution_v1",
    {
      p_org_id: input.orgId,
      p_run_id: input.runId,
      p_worker_id: input.workerId,
      p_fencing_token: input.fencingToken,
      p_prepared_receipt_id: input.preparedReceiptId,
      p_outcome: input.outcome,
      p_receipt: input.receipt,
    },
  );

  if (error) {
    throw new Error("TORO Alegra finalization failed safely.");
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;

  const candidate = row as Record<string, unknown>;
  const runId = stringOrNull(candidate.runId ?? candidate.run_id);
  const finalReceiptId = stringOrNull(
    candidate.finalReceiptId ?? candidate.final_receipt_id,
  );
  const runStatus = stringOrNull(candidate.runStatus ?? candidate.run_status);
  const verificationStatus = stringOrNull(
    candidate.verificationStatus ?? candidate.verification_status,
  );
  const replayed = candidate.replayed;
  const expectedRunStatus =
    input.outcome === "verified" ? "succeeded" : "blocked";
  const expectedVerificationStatus =
    input.outcome === "verified" ? "passed" : "partial";

  if (
    runId !== input.runId ||
    !finalReceiptId ||
    runStatus !== expectedRunStatus ||
    verificationStatus !== expectedVerificationStatus ||
    typeof replayed !== "boolean"
  ) {
    return null;
  }

  return {
    runId,
    finalReceiptId,
    runStatus,
    verificationStatus,
    replayed,
  };
}

/**
 * Extends only the same live Alegra L3 worker/fence and exact prepared marker.
 * The SQL boundary rejects wait-through-expiry and caps both the requested TTL
 * and the total admission horizon; this is not the generic worker renewal RPC.
 */
export async function heartbeatAlegraExecutionRun(
  supabase: AlegraWriterRpcClient,
  input: {
    orgId: string;
    runId: string;
    workerId: string;
    fencingToken: number;
    preparedReceiptId: string;
    leaseSeconds?: number;
  },
): Promise<ToroAlegraLeaseHeartbeat | null> {
  assertInternalRuntime();
  const { data, error } = await supabase.rpc(
    "toro_heartbeat_alegra_execution_v1",
    {
      p_org_id: input.orgId,
      p_run_id: input.runId,
      p_worker_id: input.workerId,
      p_fencing_token: input.fencingToken,
      p_prepared_receipt_id: input.preparedReceiptId,
      p_lease_seconds: input.leaseSeconds ?? 60,
    },
  );

  if (error) {
    throw new Error("TORO Alegra lease heartbeat failed safely.");
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;

  const candidate = row as Record<string, unknown>;
  const runId = stringOrNull(candidate.runId ?? candidate.run_id);
  const leaseExpiresAt = stringOrNull(
    candidate.leaseExpiresAt ?? candidate.lease_expires_at,
  );
  const preparedReceiptId = stringOrNull(
    candidate.preparedReceiptId ?? candidate.prepared_receipt_id,
  );
  const rawFencingToken =
    candidate.fencingToken ?? candidate.fencing_token;
  const fencingToken =
    typeof rawFencingToken === "number"
      ? rawFencingToken
      : typeof rawFencingToken === "string"
        ? Number(rawFencingToken)
        : Number.NaN;

  if (
    runId !== input.runId ||
    preparedReceiptId !== input.preparedReceiptId ||
    !leaseExpiresAt ||
    !Number.isSafeInteger(fencingToken) ||
    fencingToken !== input.fencingToken
  ) {
    return null;
  }

  return { runId, fencingToken, leaseExpiresAt, preparedReceiptId };
}

/**
 * Recovers an expired admitted lease without invoking Alegra or retrying the
 * create operation. SQL fences the stale worker, writes one reconciliation
 * receipt with unknown provider state, and blocks the run atomically.
 */
export async function recoverExpiredAlegraExecutionRun(
  supabase: AlegraWriterRpcClient,
  input: {
    orgId: string;
    runId: string;
    recoveryWorkerId: string;
    expectedFencingToken: number;
    preparedReceiptId: string;
  },
): Promise<ToroAlegraExpiredLeaseRecovery | null> {
  assertInternalRuntime();
  const { data, error } = await supabase.rpc(
    "toro_recover_expired_alegra_execution_v1",
    {
      p_org_id: input.orgId,
      p_run_id: input.runId,
      p_recovery_worker_id: input.recoveryWorkerId,
      p_expected_fencing_token: input.expectedFencingToken,
      p_prepared_receipt_id: input.preparedReceiptId,
    },
  );

  if (error) {
    throw new Error("TORO Alegra expired lease recovery failed safely.");
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;

  const candidate = row as Record<string, unknown>;
  const runId = stringOrNull(candidate.runId ?? candidate.run_id);
  const finalReceiptId = stringOrNull(
    candidate.finalReceiptId ?? candidate.final_receipt_id,
  );
  const runStatus = stringOrNull(candidate.runStatus ?? candidate.run_status);
  const verificationStatus = stringOrNull(
    candidate.verificationStatus ?? candidate.verification_status,
  );
  const providerState = stringOrNull(
    candidate.providerState ?? candidate.provider_state,
  );
  const rawFencingToken =
    candidate.fencingToken ?? candidate.fencing_token;
  const fencingToken =
    typeof rawFencingToken === "number"
      ? rawFencingToken
      : typeof rawFencingToken === "string"
        ? Number(rawFencingToken)
        : Number.NaN;
  const replayed = candidate.replayed;

  if (
    runId !== input.runId ||
    !finalReceiptId ||
    !Number.isSafeInteger(fencingToken) ||
    fencingToken !== input.expectedFencingToken + 1 ||
    runStatus !== "blocked" ||
    verificationStatus !== "partial" ||
    providerState !== "PROVIDER_STATE_UNKNOWN" ||
    typeof replayed !== "boolean"
  ) {
    return null;
  }

  return {
    runId,
    finalReceiptId,
    fencingToken,
    runStatus,
    verificationStatus,
    providerState,
    replayed,
  };
}

export async function revokeAlegraExecutionApproval(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    runId: string;
    approvalReceiptId: string;
  },
): Promise<"revoked" | "already_revoked" | "dispatch_already_admitted" | null> {
  // This helper must receive an authenticated owner-session client. The RPC
  // derives the signer from auth.uid(); neither a worker nor the caller may
  // assert an actor identifier.
  assertInternalRuntime();
  const { data, error } = await supabase.rpc(
    "toro_revoke_alegra_execution_authority_v1",
    {
      p_org_id: input.orgId,
      p_run_id: input.runId,
      p_approval_receipt_id: input.approvalReceiptId,
    },
  );

  if (error) {
    throw new Error("TORO Alegra approval revocation failed safely.");
  }

  return data === "revoked" ||
    data === "already_revoked" ||
    data === "dispatch_already_admitted"
    ? data
    : null;
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
  assertInternalRuntime();
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
  assertInternalRuntime();
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
  assertInternalRuntime();
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
  assertInternalRuntime();
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

export type ToroExecutionReceiptReadback = {
  id: string;
  orgId: string;
  taskId: string;
  runId: string;
  actionKey: string;
  targetSystem: string | null;
  executionAuthorityLevel: "L0" | "L1";
  sourceReceiptRef: string;
  status: "verified";
  verificationStatus: "passed";
};

type ToroExecutionReceiptReadbackRow = {
  id?: unknown;
  org_id?: unknown;
  task_id?: unknown;
  run_id?: unknown;
  action_key?: unknown;
  target_system?: unknown;
  execution_authority_level?: unknown;
  source_receipt_ref?: unknown;
  status?: unknown;
  verification_status?: unknown;
};

export function normalizeToroExecutionReceiptReadback(
  row: ToroExecutionReceiptReadbackRow,
): ToroExecutionReceiptReadback | null {
  const id = stringOrNull(row.id);
  const orgId = stringOrNull(row.org_id);
  const taskId = stringOrNull(row.task_id);
  const runId = stringOrNull(row.run_id);
  const actionKey = stringOrNull(row.action_key);
  const authority = stringOrNull(row.execution_authority_level);
  const sourceReceiptRef = stringOrNull(row.source_receipt_ref);
  const status = stringOrNull(row.status);
  const verificationStatus = stringOrNull(row.verification_status);

  if (
    !id ||
    !orgId ||
    !taskId ||
    !runId ||
    !actionKey ||
    (authority !== "L0" && authority !== "L1") ||
    !sourceReceiptRef ||
    status !== "verified" ||
    verificationStatus !== "passed"
  ) {
    return null;
  }

  return {
    id,
    orgId,
    taskId,
    runId,
    actionKey,
    targetSystem: stringOrNull(row.target_system),
    executionAuthorityLevel: authority,
    sourceReceiptRef,
    status,
    verificationStatus,
  };
}

export async function readToroExecutionReceiptById(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    taskId: string;
    runId: string;
    receiptId: string;
  },
): Promise<ToroExecutionReceiptReadback | null> {
  assertInternalRuntime();
  const { data, error } = await supabase
    .from("toro_execution_receipts")
    .select(
      "id,org_id,task_id,run_id,action_key,target_system,execution_authority_level,source_receipt_ref,status,verification_status",
    )
    .eq("id", input.receiptId)
    .eq("org_id", input.orgId)
    .eq("task_id", input.taskId)
    .eq("run_id", input.runId)
    .maybeSingle();

  if (error) {
    throw new Error("TORO receipt readback failed safely.");
  }
  if (!data || typeof data !== "object") return null;

  return normalizeToroExecutionReceiptReadback(
    data as ToroExecutionReceiptReadbackRow,
  );
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
  assertInternalRuntime();
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
