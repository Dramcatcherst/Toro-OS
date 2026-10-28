import type {
  ToroExecutionRunStatus,
  ToroVerificationStatus,
} from "@/lib/control-plane-contracts";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  claimToroExecutionRunById,
  completeToroExecutionRun,
  transitionToroExecutionRun,
  type ToroWorkerRun,
} from "./worker-runtime";

export type ToroBoundedAuthority = "L0" | "L1";

export type ToroAdmittedRunSnapshot = {
  runId: string;
  orgId: string;
  taskId: string;
  actionKey: string;
  status: "queued" | "retry_wait";
  executionAuthorityLevel: ToroBoundedAuthority;
  admitted: true;
  admissionRef: string;
};

export type ToroBoundedVerifiedResult = {
  verified: true;
  observedAfter: unknown;
  verificationMethod: string;
  evidenceRefs: string[];
  desiredState?: unknown;
  observedBefore?: unknown;
  executedState?: unknown;
  externalReference?: string | null;
  integrityHash?: string | null;
};

export type ToroBoundedRunContext = {
  run: ToroWorkerRun;
  admission: ToroFencedAdmissionProof;
  signal: AbortSignal;
};

export type ToroBoundedRunHandler = {
  authority: ToroBoundedAuthority;
  effectMode: "read_only";
  externalActions: 0;
  execute(context: ToroBoundedRunContext): Promise<unknown>;
  verify(
    result: unknown,
    context: ToroBoundedRunContext,
  ): Promise<ToroBoundedVerifiedResult | null>;
};

export type ToroFencedAdmissionProof = {
  orgId: string;
  taskId: string;
  runId: string;
  actionKey: string;
  workerId: string;
  fencingToken: number;
  executionAuthorityLevel: ToroBoundedAuthority;
  admissionRef: string;
  validUntil: string;
};

type TransitionInput = {
  runId: string;
  workerId: string;
  fencingToken: number;
  expectedStatus: ToroExecutionRunStatus;
  nextStatus: ToroExecutionRunStatus;
  verificationStatus?: ToroVerificationStatus | null;
  errorClass?: string | null;
  errorRedacted?: string | null;
};

type CompletionInput = {
  runId: string;
  workerId: string;
  fencingToken: number;
  receipt: {
    external_reference?: string | null;
    desired_state?: unknown;
    observed_before?: unknown;
    executed_state?: unknown;
    observed_after: unknown;
    verification_method: string;
    evidence_refs: string[];
    source_receipt_system: "toro_control_plane";
    source_receipt_kind: "admission";
    source_receipt_ref: string;
    integrity_hash?: string | null;
  };
};

export type ToroBoundedWorkerDependencies = {
  inspectAdmittedRun(input: {
    orgId: string;
    runId: string;
  }): Promise<ToroAdmittedRunSnapshot | null>;
  claimById(input: {
    orgId: string;
    runId: string;
    workerId: string;
    leaseSeconds: number;
  }): Promise<ToroWorkerRun | null>;
  confirmFencedAdmission(input: {
    orgId: string;
    taskId: string;
    runId: string;
    actionKey: string;
    workerId: string;
    fencingToken: number;
    admissionRef: string;
  }): Promise<ToroFencedAdmissionProof | null>;
  transition(input: TransitionInput): Promise<boolean>;
  complete(input: CompletionInput): Promise<string | null>;
  readReceipt(input: {
    orgId: string;
    taskId: string;
    runId: string;
    receiptId: string;
  }): Promise<{
    id: string;
    taskId: string;
    runId: string;
    status: "verified";
    verificationStatus: "passed";
  } | null>;
  handlers: Readonly<Record<string, ToroBoundedRunHandler | undefined>>;
  now?: () => number;
};

export function createToroBoundedWorkerDependencies(input: {
  supabase: SupabaseClient;
  inspectAdmittedRun: ToroBoundedWorkerDependencies["inspectAdmittedRun"];
  confirmFencedAdmission: ToroBoundedWorkerDependencies["confirmFencedAdmission"];
  readReceipt: ToroBoundedWorkerDependencies["readReceipt"];
  handlers: ToroBoundedWorkerDependencies["handlers"];
  now?: () => number;
}): ToroBoundedWorkerDependencies {
  return {
    inspectAdmittedRun: input.inspectAdmittedRun,
    confirmFencedAdmission: input.confirmFencedAdmission,
    readReceipt: input.readReceipt,
    handlers: input.handlers,
    now: input.now,
    claimById: (claim) =>
      claimToroExecutionRunById(input.supabase, claim),
    transition: (transition) =>
      transitionToroExecutionRun(input.supabase, transition),
    complete: (completion) =>
      completeToroExecutionRun(input.supabase, completion),
  };
}

export type ToroBoundedWorkerInput = {
  orgId: string;
  taskId: string;
  runId: string;
  actionKey: string;
  workerId: string;
  leaseSeconds?: number;
  timeoutMs?: number;
};

export class ToroBoundedWorkerError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "ToroBoundedWorkerError";
  }
}

const DEFAULT_LEASE_SECONDS = 120;
const DEFAULT_TIMEOUT_MS = 30_000;

function fail(code: string): never {
  throw new ToroBoundedWorkerError(code);
}

function isAcceptedPreclaimStatus(
  status: string,
): status is ToroAdmittedRunSnapshot["status"] {
  return status === "queued" || status === "retry_wait";
}

function assertAdmission(
  admission: ToroAdmittedRunSnapshot | null,
  input: ToroBoundedWorkerInput,
  handler: ToroBoundedRunHandler,
): asserts admission is ToroAdmittedRunSnapshot {
  if (
    !admission ||
    admission.admitted !== true ||
    !admission.admissionRef.trim() ||
    admission.runId !== input.runId ||
    admission.orgId !== input.orgId ||
    admission.taskId !== input.taskId ||
    admission.actionKey !== input.actionKey ||
    !isAcceptedPreclaimStatus(admission.status) ||
    (admission.executionAuthorityLevel !== "L0" &&
      admission.executionAuthorityLevel !== "L1") ||
    handler.authority !== admission.executionAuthorityLevel ||
    handler.effectMode !== "read_only" ||
    handler.externalActions !== 0
  ) {
    fail("admission_mismatch");
  }
}

function assertFencedAdmission(
  proof: ToroFencedAdmissionProof | null,
  admission: ToroAdmittedRunSnapshot,
  input: ToroBoundedWorkerInput,
  run: ToroWorkerRun,
  now: number,
): asserts proof is ToroFencedAdmissionProof {
  const proofValidUntil = Date.parse(proof?.validUntil ?? "");
  const leaseExpiresAt = Date.parse(run.leaseExpiresAt ?? "");
  if (
    !proof ||
    proof.orgId !== input.orgId ||
    proof.taskId !== input.taskId ||
    proof.runId !== input.runId ||
    proof.actionKey !== input.actionKey ||
    proof.workerId !== input.workerId ||
    proof.fencingToken !== run.fencingToken ||
    proof.executionAuthorityLevel !== admission.executionAuthorityLevel ||
    proof.admissionRef !== admission.admissionRef ||
    !Number.isFinite(proofValidUntil) ||
    !Number.isFinite(leaseExpiresAt) ||
    leaseExpiresAt <= now ||
    proofValidUntil <= now ||
    proofValidUntil < leaseExpiresAt
  ) {
    fail("fenced_admission_mismatch");
  }
}

function assertClaim(
  run: ToroWorkerRun | null,
  input: ToroBoundedWorkerInput,
  admission: ToroAdmittedRunSnapshot,
  now: number,
): asserts run is ToroWorkerRun {
  if (!run) fail("claim_unavailable");

  const leaseExpiresAt = Date.parse(run.leaseExpiresAt ?? "");
  if (
    run.id !== input.runId ||
    run.orgId !== input.orgId ||
    run.taskId !== input.taskId ||
    run.actionKey !== input.actionKey ||
    run.executionAuthorityLevel !== admission.executionAuthorityLevel ||
    run.status !== "claimed" ||
    run.leaseOwner !== input.workerId ||
    !Number.isSafeInteger(run.fencingToken) ||
    run.fencingToken <= 0 ||
    !Number.isFinite(leaseExpiresAt) ||
    leaseExpiresAt <= now
  ) {
    fail("claimed_run_mismatch");
  }
}

function assertRemainingLeaseBudget(
  run: ToroWorkerRun,
  timeoutMs: number,
  now: number,
) {
  const leaseExpiresAt = Date.parse(run.leaseExpiresAt ?? "");
  if (
    !Number.isFinite(leaseExpiresAt) ||
    leaseExpiresAt - now <= timeoutMs
  ) {
    fail("insufficient_lease_budget");
  }
}

function assertVerifiedResult(
  value: ToroBoundedVerifiedResult | null,
): asserts value is ToroBoundedVerifiedResult {
  if (
    !value ||
    value.verified !== true ||
    value.observedAfter === undefined ||
    !value.verificationMethod.trim() ||
    !Array.isArray(value.evidenceRefs) ||
    value.evidenceRefs.length === 0 ||
    value.evidenceRefs.some(
      (reference) => typeof reference !== "string" || !reference.trim(),
    )
  ) {
    fail("verification_failed");
  }
}

async function runWithTimeout<T>(
  timeoutMs: number,
  execute: (signal: AbortSignal) => Promise<T>,
) {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new ToroBoundedWorkerError("execution_timeout"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([execute(controller.signal), expired]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function executeBoundedToroRun(
  input: ToroBoundedWorkerInput,
  dependencies: ToroBoundedWorkerDependencies,
) {
  const leaseSeconds = input.leaseSeconds ?? DEFAULT_LEASE_SECONDS;
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (
    !Number.isInteger(leaseSeconds) ||
    leaseSeconds < 1 ||
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs >= leaseSeconds * 1_000
  ) {
    fail("invalid_execution_bounds");
  }

  const handler = dependencies.handlers[input.actionKey];
  if (!handler) fail("handler_not_allowed");

  const admission = await dependencies.inspectAdmittedRun({
    orgId: input.orgId,
    runId: input.runId,
  });
  assertAdmission(admission, input, handler);

  const run = await dependencies.claimById({
    orgId: input.orgId,
    runId: input.runId,
    workerId: input.workerId,
    leaseSeconds,
  });

  let ownedStatus: "claimed" | "running" | "verifying" | null = run
    ? "claimed"
    : null;
  let completionStarted = false;

  try {
    assertClaim(run, input, admission, (dependencies.now ?? Date.now)());

    const fencedAdmission = await dependencies.confirmFencedAdmission({
      orgId: input.orgId,
      taskId: input.taskId,
      runId: input.runId,
      actionKey: input.actionKey,
      workerId: input.workerId,
      fencingToken: run.fencingToken,
      admissionRef: admission.admissionRef,
    });
    assertFencedAdmission(
      fencedAdmission,
      admission,
      input,
      run,
      (dependencies.now ?? Date.now)(),
    );
    assertRemainingLeaseBudget(
      run,
      timeoutMs,
      (dependencies.now ?? Date.now)(),
    );

    const started = await dependencies.transition({
      runId: run.id,
      workerId: input.workerId,
      fencingToken: run.fencingToken,
      expectedStatus: "claimed",
      nextStatus: "running",
      verificationStatus: "pending",
    });
    if (!started) fail("run_transition_rejected");
    ownedStatus = "running";

    const verified = await runWithTimeout(timeoutMs, async (signal) => {
      const context = {
        run,
        admission: fencedAdmission,
        signal,
      } satisfies ToroBoundedRunContext;
      const result = await handler.execute(context);
      if (signal.aborted) fail("execution_timeout");
      const verification = await handler.verify(result, context);
      if (signal.aborted) fail("execution_timeout");
      return verification;
    });
    assertVerifiedResult(verified);

    const verifying = await dependencies.transition({
      runId: run.id,
      workerId: input.workerId,
      fencingToken: run.fencingToken,
      expectedStatus: "running",
      nextStatus: "verifying",
      verificationStatus: "pending",
    });
    if (!verifying) fail("verification_transition_rejected");
    ownedStatus = "verifying";

    completionStarted = true;
    const receiptId = await dependencies.complete({
      runId: run.id,
      workerId: input.workerId,
      fencingToken: run.fencingToken,
      receipt: {
        external_reference: verified.externalReference ?? null,
        desired_state: verified.desiredState,
        observed_before: verified.observedBefore,
        executed_state: verified.executedState,
        observed_after: verified.observedAfter,
        verification_method: verified.verificationMethod,
        evidence_refs: [...new Set(verified.evidenceRefs)],
        source_receipt_system: "toro_control_plane",
        source_receipt_kind: "admission",
        source_receipt_ref: admission.admissionRef,
        integrity_hash: verified.integrityHash ?? null,
      },
    });
    if (!receiptId) fail("completion_unknown");

    const receipt = await dependencies.readReceipt({
      orgId: input.orgId,
      taskId: input.taskId,
      runId: input.runId,
      receiptId,
    });
    if (
      !receipt ||
      receipt.id !== receiptId ||
      receipt.runId !== input.runId ||
      receipt.taskId !== input.taskId ||
      receipt.status !== "verified" ||
      receipt.verificationStatus !== "passed"
    ) {
      fail("completion_unknown");
    }

    return {
      runId: run.id,
      receiptId,
      fencingToken: run.fencingToken,
    };
  } catch (error) {
    if (completionStarted) {
      throw new ToroBoundedWorkerError("completion_unknown");
    }

    if (run && ownedStatus) {
      try {
        await dependencies.transition({
          runId: run.id,
          workerId: input.workerId,
          fencingToken: run.fencingToken,
          expectedStatus: ownedStatus,
          nextStatus: "failed",
          verificationStatus: "failed",
          errorClass: "bounded_worker_failure",
          errorRedacted: "Bounded worker stopped safely.",
        });
      } catch {
        // The original failure remains authoritative; reconciliation owns any
        // ambiguous transition rather than replaying the handler.
      }
    }

    if (error instanceof ToroBoundedWorkerError) throw error;
    throw new ToroBoundedWorkerError("execution_failed");
  }
}
