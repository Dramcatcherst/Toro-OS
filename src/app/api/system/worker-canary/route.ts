import { publicDemoResponse } from "@/lib/server/public-demo";
import { randomUUID } from "node:crypto";

import {
  claimToroExecutionRunById,
  completeToroExecutionRun,
  resolveFailedToroExecutionRun,
  transitionToroExecutionRun,
} from "@/features/control-plane/worker-runtime";
import {
  getToroWorkerCanaryConfig,
  isToroWorkerCanaryAuthorized,
  isToroWorkerCanaryEnabled,
} from "@/features/runtime/canary";
import { createWorkerSupabaseClient } from "@/lib/supabase/worker";

function noStoreHeaders() {
  return { "cache-control": "no-store, max-age=0" };
}

async function failRunSafely(input: {
  supabase: ReturnType<typeof createWorkerSupabaseClient>;
  runId: string;
  workerId: string;
  fencingToken: number;
  expectedStatus: "claimed" | "running" | "verifying";
}) {
  try {
    const failed = await transitionToroExecutionRun(input.supabase, {
      runId: input.runId,
      workerId: input.workerId,
      fencingToken: input.fencingToken,
      expectedStatus: input.expectedStatus,
      nextStatus: "failed",
      verificationStatus: "failed",
      errorClass: "canary_probe_failed",
      errorRedacted: "TORO worker canary failed safely.",
    });

    if (failed) {
      await resolveFailedToroExecutionRun(input.supabase, {
        runId: input.runId,
        fencingToken: input.fencingToken,
      });
    }
  } catch {
    // Best-effort cleanup only. Never expose the private failure.
  }
}

export async function POST(request: Request) {
  const demo = publicDemoResponse();
  if (demo) return demo;
  if (!isToroWorkerCanaryEnabled(process.env)) {
    return new Response(null, { status: 404, headers: noStoreHeaders() });
  }

  if (
    !isToroWorkerCanaryAuthorized(
      request.headers.get("authorization"),
      process.env,
    )
  ) {
    return Response.json(
      { state: "unauthorized" },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const config = getToroWorkerCanaryConfig(process.env);
  if (
    !config.authConfigured ||
    !config.orgId ||
    !config.taskId ||
    !config.gitCommitSha
  ) {
    return Response.json(
      { state: "unconfigured" },
      { status: 503, headers: noStoreHeaders() },
    );
  }

  const commit = config.gitCommitSha;
  const idempotencyKey = `toro_worker_canary:${commit}`;
  const runKey = idempotencyKey;
  const correlationId = randomUUID();
  const workerId = `toro-worker-canary:${commit.slice(0, 12)}`;
  const supabase = createWorkerSupabaseClient();

  const existing = await supabase
    .from("toro_execution_runs")
    .select("id,status,verification_status")
    .eq("org_id", config.orgId)
    .eq("idempotency_key", idempotencyKey)
    .limit(1);

  if (existing.error) {
    return Response.json(
      { state: "degraded" },
      { status: 503, headers: noStoreHeaders() },
    );
  }

  const previous = Array.isArray(existing.data) ? existing.data[0] : null;
  if (previous) {
    if (
      previous.status === "succeeded" &&
      previous.verification_status === "passed"
    ) {
      return Response.json(
        { state: "replayed", runId: previous.id, gitCommitSha: commit },
        { status: 200, headers: noStoreHeaders() },
      );
    }

    return Response.json(
      { state: "existing_run_not_replayable", runId: previous.id },
      { status: 409, headers: noStoreHeaders() },
    );
  }

  const inserted = await supabase
    .from("toro_execution_runs")
    .insert({
      org_id: config.orgId,
      task_id: config.taskId,
      run_key: runKey,
      idempotency_key: idempotencyKey,
      correlation_id: correlationId,
      actor_kind: "system",
      actor_ref: "TORO Worker Canary",
      agent_ref: "SOBRESITO",
      action_key: "runtime.control_plane_read_canary",
      target_system: "Supabase/TORO Control Plane",
      execution_authority_level: "L1",
      business_risk: "Low",
      status: "queued",
      verification_status: "pending",
      priority_rank: 0,
      max_attempts: 1,
      safe_metadata: {
        canary: true,
        gitCommitSha: commit,
        externalActions: 0,
      },
    })
    .select("id")
    .single();

  if (inserted.error || !inserted.data?.id) {
    return Response.json(
      { state: "degraded" },
      { status: 503, headers: noStoreHeaders() },
    );
  }

  const runId = inserted.data.id;
  let fencingToken = 0;
  let currentStatus: "claimed" | "running" | "verifying" = "claimed";

  try {
    const claimed = await claimToroExecutionRunById(supabase, {
      orgId: config.orgId,
      runId,
      workerId,
      leaseSeconds: 120,
    });

    if (!claimed || claimed.id !== runId) {
      return Response.json(
        { state: "claim_failed", runId },
        { status: 409, headers: noStoreHeaders() },
      );
    }

    fencingToken = claimed.fencingToken;

    const running = await transitionToroExecutionRun(supabase, {
      runId,
      workerId,
      fencingToken,
      expectedStatus: "claimed",
      nextStatus: "running",
    });
    if (!running) throw new Error("running_transition_failed");
    currentStatus = "running";

    const [runsProbe, receiptsProbe] = await Promise.all([
      supabase
        .from("toro_execution_runs")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("toro_execution_receipts")
        .select("id", { count: "exact", head: true }),
    ]);

    if (runsProbe.error || receiptsProbe.error) {
      throw new Error("control_plane_probe_failed");
    }

    const verifying = await transitionToroExecutionRun(supabase, {
      runId,
      workerId,
      fencingToken,
      expectedStatus: "running",
      nextStatus: "verifying",
      verificationStatus: "pending",
    });
    if (!verifying) throw new Error("verifying_transition_failed");
    currentStatus = "verifying";

    const receiptId = await completeToroExecutionRun(supabase, {
      runId,
      workerId,
      fencingToken,
      receipt: {
        desired_state: {
          workerRuntime: "read_only_canary",
          externalActions: 0,
        },
        observed_before: {
          runClaimed: true,
          fencingToken,
        },
        executed_state: {
          readOnlyProbes: 2,
          externalActions: 0,
        },
        observed_after: {
          controlPlaneReadable: true,
          runsReadable: true,
          receiptsReadable: true,
          runCountBeforeCompletion: runsProbe.count ?? null,
          receiptCountBeforeCompletion: receiptsProbe.count ?? null,
        },
        verification_method:
          "targeted claim + read-only Control Plane probes + atomic verified completion",
        evidence_refs: [
          `vercel_git_commit:${commit}`,
          "public.toro_execution_runs",
          "public.toro_execution_receipts",
        ],
      },
    });

    if (!receiptId) throw new Error("atomic_completion_failed");

    return Response.json(
      {
        state: "verified",
        runId,
        receiptId,
        gitCommitSha: commit,
        externalActions: 0,
      },
      { status: 200, headers: noStoreHeaders() },
    );
  } catch {
    if (fencingToken > 0) {
      await failRunSafely({
        supabase,
        runId,
        workerId,
        fencingToken,
        expectedStatus: currentStatus,
      });
    }

    return Response.json(
      { state: "failed", runId },
      { status: 503, headers: noStoreHeaders() },
    );
  }
}
