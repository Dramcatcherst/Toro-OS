import { describe, expect, it, vi } from "vitest";

import {
  claimToroExecutionRunById,
  completeToroExecutionRun,
  normalizeToroWorkerRun,
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
});

describe("TORO targeted worker primitives", () => {
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
