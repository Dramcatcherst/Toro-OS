import { describe, expect, it, vi } from "vitest";

import { normalizeToroWorkerRun } from "./worker-runtime";

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

// Keep this file free of live Supabase calls. Integration proof belongs in
// governed runtime/sandbox tests, not unit tests.
vi.mock("@/lib/supabase/worker", () => ({}));
