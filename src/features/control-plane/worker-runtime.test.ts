import { describe, expect, it, vi } from "vitest";

import {
  admitApprovedAlegraExecutionRun,
  claimToroExecutionRunById,
  completeToroExecutionRun,
  finalizeAlegraExecutionRun,
  heartbeatAlegraExecutionRun,
  normalizeToroExecutionReceiptReadback,
  normalizeToroWorkerRun,
  recoverExpiredAlegraExecutionRun,
  revokeAlegraExecutionApproval,
} from "./worker-runtime";

describe("TORO worker runtime normalization", () => {
  it("normalizes a claimed run", () => {
    const run = normalizeToroWorkerRun({
      id: "run-1",
      org_id: "org-1",
      task_id: "task-1",
      decision_id: null,
      run_key: "run:key",
      idempotency_key: "idem:key",
      correlation_id: "corr-1",
      trace_id: null,
      actor_kind: "agent",
      actor_ref: "worker",
      dot_ref: "PUMBA",
      agent_ref: "SOBRESITO",
      action_key: "control_plane.noop",
      target_system: "TORO",
      execution_authority_level: "L1",
      business_risk: "Low",
      status: "claimed",
      verification_status: "pending",
      attempt_count: 1,
      max_attempts: 3,
      lease_owner: "worker-1",
      fencing_token: 2,
      lease_expires_at: "2026-10-01T12:00:00Z",
    });

    expect(run).toMatchObject({
      id: "run-1",
      orgId: "org-1",
      taskId: "task-1",
      executionAuthorityLevel: "L1",
      status: "claimed",
      attemptCount: 1,
      fencingToken: 2,
    });
  });

  it("rejects incomplete rows instead of inventing runtime state", () => {
    expect(
      normalizeToroWorkerRun({
        id: "run-1",
        org_id: "org-1",
      }),
    ).toBeNull();
  });

  it("normalizes a verified bounded-worker receipt readback", () => {
    expect(
      normalizeToroExecutionReceiptReadback({
        id: "receipt-1",
        org_id: "org-1",
        task_id: "task-1",
        run_id: "run-1",
        action_key: "google_tasks.connector_preflight",
        target_system: "google_tasks",
        execution_authority_level: "L0",
        source_receipt_ref: "admission-1",
        status: "verified",
        verification_status: "passed",
      }),
    ).toEqual({
      id: "receipt-1",
      orgId: "org-1",
      taskId: "task-1",
      runId: "run-1",
      actionKey: "google_tasks.connector_preflight",
      targetSystem: "google_tasks",
      executionAuthorityLevel: "L0",
      sourceReceiptRef: "admission-1",
      status: "verified",
      verificationStatus: "passed",
    });
  });

  it.each([
    ["wrong authority", { execution_authority_level: "L2" }],
    ["non-terminal status", { status: "executed" }],
    ["unverified result", { verification_status: "pending" }],
    ["missing admission reference", { source_receipt_ref: "" }],
  ])("rejects receipt readback with %s", (_case, patch) => {
    expect(
      normalizeToroExecutionReceiptReadback({
        id: "receipt-1",
        org_id: "org-1",
        task_id: "task-1",
        run_id: "run-1",
        action_key: "google_tasks.connector_preflight",
        target_system: "google_tasks",
        execution_authority_level: "L0",
        source_receipt_ref: "admission-1",
        status: "verified",
        verification_status: "passed",
        ...patch,
      }),
    ).toBeNull();
  });
});

describe("TORO targeted worker primitives", () => {
  it.each(["revoked", "already_revoked", "dispatch_already_admitted"] as const)("returns the bounded Alegra revocation result %s", async (state) => {
    const rpc = vi.fn(async () => ({ data: state, error: null }));
    await expect(revokeAlegraExecutionApproval(
      { rpc } as never,
      { orgId: "org-1", runId: "run-1", approvalReceiptId: "approval-receipt-1" },
    )).resolves.toBe(state);
    expect(rpc).toHaveBeenCalledWith(
      "toro_revoke_alegra_execution_authority_v1",
      {
        p_org_id: "org-1",
        p_run_id: "run-1",
        p_approval_receipt_id: "approval-receipt-1",
      },
    );
    expect((rpc.mock.calls as unknown[][])[0]?.[1]).not.toHaveProperty("p_revoked_by_actor_id");
  });

  it("uses the dedicated atomic Alegra L3 admission RPC", async () => {
    const rpc = vi.fn(async () => ({
      data: {
        runId: "run-1",
        fencingToken: 4,
        leaseExpiresAt: "2026-10-16T12:02:00Z",
        preparedReceiptId: "receipt-prepared-1",
      },
      error: null,
    }));

    const result = await admitApprovedAlegraExecutionRun(
      { rpc } as never,
      {
        orgId: "org-1",
        runId: "run-1",
        workerId: "worker-1",
        expectedFencingToken: 3,
        approval: {
          approvalReceiptId: "approval-receipt-1",
          approvalId: "approval-1",
          approvalActorId: "owner-1",
          approvalApprovedAt: "2026-10-16T12:00:00Z",
          approvalExpiresAt: "2026-10-16T12:15:00Z",
          payloadHash: "sha256:fixture",
          decisionRevision: "2026-10-16T12:00:00Z",
        },
      },
    );

    expect(result).toEqual({
      runId: "run-1",
      fencingToken: 4,
      leaseExpiresAt: "2026-10-16T12:02:00Z",
      preparedReceiptId: "receipt-prepared-1",
    });
    expect(rpc).toHaveBeenCalledWith(
      "toro_admit_approved_alegra_execution_v1",
      expect.objectContaining({
        p_run_id: "run-1",
        p_expected_fencing_token: 3,
        p_approval_receipt_id: "approval-receipt-1",
        p_approval_approved_at: "2026-10-16T12:00:00Z",
        p_approval_expires_at: "2026-10-16T12:15:00Z",
        p_payload_hash: "sha256:fixture",
      }),
    );
  });

  it.each([
    ["stale", 3],
    ["skipped", 5],
  ])("fails closed on %s Alegra L3 admission fence", async (_case, returnedFence) => {
    const rpc = vi.fn(async () => ({
      data: {
        runId: "run-1",
        fencingToken: returnedFence,
        leaseExpiresAt: "2026-10-16T12:02:00Z",
        preparedReceiptId: "receipt-prepared-1",
      },
      error: null,
    }));

    await expect(admitApprovedAlegraExecutionRun(
      { rpc } as never,
      {
        orgId: "org-1",
        runId: "run-1",
        workerId: "worker-1",
        expectedFencingToken: 3,
        approval: {
          approvalReceiptId: "approval-receipt-1",
          approvalId: "approval-1",
          approvalActorId: "owner-1",
          approvalApprovedAt: "2026-10-16T12:00:00Z",
          approvalExpiresAt: "2026-10-16T12:15:00Z",
          payloadHash: "sha256:fixture",
          decisionRevision: "2026-10-16T12:00:00Z",
        },
      },
    )).resolves.toBeNull();
  });

  it.each([
    ["verified", "succeeded", "passed"],
    ["reconciliation_required", "blocked", "partial"],
  ] as const)("uses the atomic Alegra %s finalization RPC", async (outcome, runStatus, verificationStatus) => {
    const rpc = vi.fn(async () => ({
      data: {
        runId: "run-1",
        finalReceiptId: "receipt-final-1",
        runStatus,
        verificationStatus,
        replayed: false,
      },
      error: null,
    }));

    await expect(finalizeAlegraExecutionRun(
      { rpc } as never,
      {
        orgId: "org-1",
        runId: "run-1",
        workerId: "worker-1",
        fencingToken: 4,
        preparedReceiptId: "receipt-prepared-1",
        outcome,
        receipt: {
          external_reference: "bill-1",
          observed_after: { verified: outcome === "verified" },
          evidence_refs: ["fixture:original"],
          integrity_hash: "sha256:fixture",
        },
      },
    )).resolves.toEqual({
      runId: "run-1",
      finalReceiptId: "receipt-final-1",
      runStatus,
      verificationStatus,
      replayed: false,
    });
    expect(rpc).toHaveBeenCalledWith(
      "toro_finalize_alegra_execution_v1",
      expect.objectContaining({
        p_org_id: "org-1",
        p_run_id: "run-1",
        p_fencing_token: 4,
        p_prepared_receipt_id: "receipt-prepared-1",
        p_outcome: outcome,
      }),
    );
  });

  it("fails closed when Alegra finalization reports the wrong terminal state", async () => {
    const rpc = vi.fn(async () => ({
      data: {
        runId: "run-1",
        finalReceiptId: "receipt-final-1",
        runStatus: "blocked",
        verificationStatus: "partial",
        replayed: false,
      },
      error: null,
    }));

    await expect(finalizeAlegraExecutionRun(
      { rpc } as never,
      {
        orgId: "org-1",
        runId: "run-1",
        workerId: "worker-1",
        fencingToken: 4,
        preparedReceiptId: "receipt-prepared-1",
        outcome: "verified",
        receipt: {
          observed_after: { verified: true },
          integrity_hash: "sha256:fixture",
        },
      },
    )).resolves.toBeNull();
  });

  it("uses the specialized same-fence Alegra heartbeat with a narrow default TTL", async () => {
    const rpc = vi.fn(async () => ({
      data: {
        runId: "run-1",
        fencingToken: 4,
        leaseExpiresAt: "2026-10-16T12:03:00Z",
        preparedReceiptId: "receipt-prepared-1",
      },
      error: null,
    }));

    await expect(
      heartbeatAlegraExecutionRun(
        { rpc } as never,
        {
          orgId: "org-1",
          runId: "run-1",
          workerId: "worker-1",
          fencingToken: 4,
          preparedReceiptId: "receipt-prepared-1",
        },
      ),
    ).resolves.toEqual({
      runId: "run-1",
      fencingToken: 4,
      leaseExpiresAt: "2026-10-16T12:03:00Z",
      preparedReceiptId: "receipt-prepared-1",
    });
    expect(rpc).toHaveBeenCalledWith(
      "toro_heartbeat_alegra_execution_v1",
      {
        p_org_id: "org-1",
        p_run_id: "run-1",
        p_worker_id: "worker-1",
        p_fencing_token: 4,
        p_prepared_receipt_id: "receipt-prepared-1",
        p_lease_seconds: 60,
      },
    );
  });

  it("fails closed when the Alegra heartbeat changes the fence or returns null", async () => {
    const wrongFenceRpc = vi.fn(async () => ({
      data: {
        runId: "run-1",
        fencingToken: 5,
        leaseExpiresAt: "2026-10-16T12:03:00Z",
        preparedReceiptId: "receipt-prepared-1",
      },
      error: null,
    }));
    const nullRpc = vi.fn(async () => ({ data: null, error: null }));
    const input = {
      orgId: "org-1",
      runId: "run-1",
      workerId: "worker-1",
      fencingToken: 4,
      preparedReceiptId: "receipt-prepared-1",
    };

    await expect(
      heartbeatAlegraExecutionRun({ rpc: wrongFenceRpc } as never, input),
    ).resolves.toBeNull();
    await expect(
      heartbeatAlegraExecutionRun({ rpc: nullRpc } as never, input),
    ).resolves.toBeNull();
  });

  it.each([false, true])(
    "uses the idempotent expired-lease recovery RPC (replayed=%s)",
    async (replayed) => {
      const rpc = vi.fn(async () => ({
        data: {
          runId: "run-1",
          finalReceiptId: "receipt-recovery-1",
          fencingToken: 5,
          runStatus: "blocked",
          verificationStatus: "partial",
          providerState: "PROVIDER_STATE_UNKNOWN",
          replayed,
        },
        error: null,
      }));

      await expect(
        recoverExpiredAlegraExecutionRun(
          { rpc } as never,
          {
            orgId: "org-1",
            runId: "run-1",
            recoveryWorkerId: "recovery-worker-1",
            expectedFencingToken: 4,
            preparedReceiptId: "receipt-prepared-1",
          },
        ),
      ).resolves.toEqual({
        runId: "run-1",
        finalReceiptId: "receipt-recovery-1",
        fencingToken: 5,
        runStatus: "blocked",
        verificationStatus: "partial",
        providerState: "PROVIDER_STATE_UNKNOWN",
        replayed,
      });
      expect(rpc).toHaveBeenCalledWith(
        "toro_recover_expired_alegra_execution_v1",
        {
          p_org_id: "org-1",
          p_run_id: "run-1",
          p_recovery_worker_id: "recovery-worker-1",
          p_expected_fencing_token: 4,
          p_prepared_receipt_id: "receipt-prepared-1",
        },
      );
    },
  );

  it("fails closed on null or non-incremented expired-lease recovery output", async () => {
    const nullRpc = vi.fn(async () => ({ data: null, error: null }));
    const staleFenceRpc = vi.fn(async () => ({
      data: {
        runId: "run-1",
        finalReceiptId: "receipt-recovery-1",
        fencingToken: 4,
        runStatus: "blocked",
        verificationStatus: "partial",
        providerState: "PROVIDER_STATE_UNKNOWN",
        replayed: false,
      },
      error: null,
    }));
    const input = {
      orgId: "org-1",
      runId: "run-1",
      recoveryWorkerId: "recovery-worker-1",
      expectedFencingToken: 4,
      preparedReceiptId: "receipt-prepared-1",
    };

    await expect(
      recoverExpiredAlegraExecutionRun({ rpc: nullRpc } as never, input),
    ).resolves.toBeNull();
    await expect(
      recoverExpiredAlegraExecutionRun({ rpc: staleFenceRpc } as never, input),
    ).resolves.toBeNull();
  });

  it("claims only the requested run id", async () => {
    const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => ({
      data:
        name === "toro_claim_execution_run_by_id_v1"
          ? [
              {
                id: args.p_run_id,
                org_id: args.p_org_id,
                task_id: "task-1",
                decision_id: null,
                run_key: "run:key",
                idempotency_key: "idem:key",
                correlation_id: "corr-1",
                trace_id: null,
                actor_kind: "system",
                actor_ref: "canary",
                dot_ref: null,
                agent_ref: "SOBRESITO",
                action_key: "runtime.control_plane_read_canary",
                target_system: "TORO",
                execution_authority_level: "L1",
                business_risk: "Low",
                status: "claimed",
                verification_status: "pending",
                attempt_count: 1,
                max_attempts: 1,
                lease_owner: args.p_worker_id,
                fencing_token: 1,
                lease_expires_at: "2026-10-01T12:00:00Z",
              },
            ]
          : null,
      error: null,
    }));

    const run = await claimToroExecutionRunById(
      { rpc } as never,
      {
        orgId: "org-1",
        runId: "run-1",
        workerId: "worker-1",
      },
    );

    expect(run?.id).toBe("run-1");
    expect(rpc).toHaveBeenCalledWith(
      "toro_claim_execution_run_by_id_v1",
      expect.objectContaining({ p_run_id: "run-1", p_org_id: "org-1" }),
    );
  });

  it("uses the atomic completion RPC and returns the receipt id", async () => {
    const rpc = vi.fn(async () => ({
      data: "receipt-1",
      error: null,
    }));

    const receiptId = await completeToroExecutionRun(
      { rpc } as never,
      {
        runId: "run-1",
        workerId: "worker-1",
        fencingToken: 3,
        receipt: {
          verification_method: "synthetic",
          evidence_refs: ["synthetic:test"],
        },
      },
    );

    expect(receiptId).toBe("receipt-1");
    expect(rpc).toHaveBeenCalledWith(
      "toro_complete_execution_run_v1",
      expect.objectContaining({
        p_run_id: "run-1",
        p_worker_id: "worker-1",
        p_fencing_token: 3,
      }),
    );
  });
});

// Keep this file free of live Supabase calls. Integration proof belongs in
// governed runtime/sandbox tests, not unit tests.
vi.mock("@/lib/supabase/worker", () => ({}));
