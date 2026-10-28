import { describe, expect, it, vi } from "vitest";

import type { ToroWorkerRun } from "./worker-runtime";
import {
  executeBoundedToroRun,
  ToroBoundedWorkerError,
  type ToroAdmittedRunSnapshot,
  type ToroBoundedRunHandler,
  type ToroBoundedWorkerDependencies,
} from "./bounded-worker";

const input = {
  orgId: "org-1",
  taskId: "task-1",
  runId: "run-1",
  actionKey: "knowledge.refresh_verified_source",
  workerId: "worker-1",
  leaseSeconds: 30,
  timeoutMs: 100,
};

function admitted(
  overrides: Partial<ToroAdmittedRunSnapshot> = {},
): ToroAdmittedRunSnapshot {
  return {
    runId: input.runId,
    orgId: input.orgId,
    taskId: input.taskId,
    actionKey: input.actionKey,
    status: "queued",
    executionAuthorityLevel: "L1",
    admitted: true,
    admissionRef: "receipt-admission-1",
    ...overrides,
  };
}

function claimed(overrides: Partial<ToroWorkerRun> = {}): ToroWorkerRun {
  return {
    id: input.runId,
    orgId: input.orgId,
    taskId: input.taskId,
    decisionId: null,
    runKey: "run-key-1",
    idempotencyKey: "idem-1",
    correlationId: "correlation-1",
    traceId: null,
    actorKind: "system",
    actorRef: "bounded-worker",
    dotRef: null,
    agentRef: null,
    actionKey: input.actionKey,
    targetSystem: "toro_knowledge",
    executionAuthorityLevel: "L1",
    businessRisk: "Low",
    status: "claimed",
    verificationStatus: "pending",
    attemptCount: 1,
    maxAttempts: 1,
    leaseOwner: input.workerId,
    fencingToken: 7,
    leaseExpiresAt: "2026-10-28T01:01:00.000Z",
    ...overrides,
  };
}

function allowedHandler(
  overrides: Partial<ToroBoundedRunHandler> = {},
): ToroBoundedRunHandler {
  return {
    authority: "L1",
    externalActions: 0,
    execute: vi.fn().mockResolvedValue({ refreshed: true }),
    verify: vi.fn().mockResolvedValue({
      verified: true,
      observedAfter: { freshness: "current" },
      verificationMethod: "canonical_readback",
      evidenceRefs: ["source:v1", "source:v1"],
    }),
    ...overrides,
  };
}

function dependencies(options?: {
  admission?: ToroAdmittedRunSnapshot | null;
  run?: ToroWorkerRun | null;
  handler?: ToroBoundedRunHandler;
}) {
  const handler = options?.handler ?? allowedHandler();
  const deps: ToroBoundedWorkerDependencies = {
    inspectAdmittedRun: vi
      .fn()
      .mockResolvedValue(options?.admission === undefined ? admitted() : options.admission),
    claimById: vi
      .fn()
      .mockResolvedValue(options?.run === undefined ? claimed() : options.run),
    transition: vi.fn().mockResolvedValue(true),
    complete: vi.fn().mockResolvedValue("receipt-final-1"),
    readReceipt: vi.fn().mockResolvedValue({
      id: "receipt-final-1",
      taskId: input.taskId,
      runId: input.runId,
      status: "verified",
      verificationStatus: "passed",
    }),
    handlers: { [input.actionKey]: handler },
    now: () => Date.parse("2026-10-28T01:00:00.000Z"),
  };
  return { deps, handler };
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ code });
}

describe("executeBoundedToroRun", () => {
  it("executes one admitted exact run and requires a durable receipt", async () => {
    const { deps, handler } = dependencies();

    await expect(executeBoundedToroRun(input, deps)).resolves.toEqual({
      runId: input.runId,
      receiptId: "receipt-final-1",
      fencingToken: 7,
    });

    expect(handler.execute).toHaveBeenCalledTimes(1);
    expect(deps.transition).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ expectedStatus: "claimed", nextStatus: "running" }),
    );
    expect(deps.transition).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ expectedStatus: "running", nextStatus: "verifying" }),
    );
    expect(deps.complete).toHaveBeenCalledWith(
      expect.objectContaining({
        receipt: expect.objectContaining({
          evidence_refs: ["source:v1"],
          source_receipt_ref: "receipt-admission-1",
        }),
      }),
    );
    expect(deps.readReceipt).toHaveBeenCalledWith({
      orgId: input.orgId,
      taskId: input.taskId,
      runId: input.runId,
      receiptId: "receipt-final-1",
    });
  });

  it.each([
    ["organization", { orgId: "other-org" }],
    ["task", { taskId: "other-task" }],
    ["action", { actionKey: "other-action" }],
    ["admission receipt", { admissionRef: "" }],
  ])("fails closed before claim on a mismatched %s", async (_label, override) => {
    const { deps, handler } = dependencies({ admission: admitted(override) });

    await expectCode(executeBoundedToroRun(input, deps), "admission_mismatch");
    expect(deps.claimById).not.toHaveBeenCalled();
    expect(handler.execute).not.toHaveBeenCalled();
  });

  it("rejects an unregistered handler before reading or claiming", async () => {
    const { deps } = dependencies();
    deps.handlers = {};

    await expectCode(executeBoundedToroRun(input, deps), "handler_not_allowed");
    expect(deps.inspectAdmittedRun).not.toHaveBeenCalled();
    expect(deps.claimById).not.toHaveBeenCalled();
  });

  it("does not execute when another worker won the exact claim", async () => {
    const { deps, handler } = dependencies({ run: null });

    await expectCode(executeBoundedToroRun(input, deps), "claim_unavailable");
    expect(handler.execute).not.toHaveBeenCalled();
    expect(deps.complete).not.toHaveBeenCalled();
  });

  it("rejects a claimed run whose task does not match", async () => {
    const { deps, handler } = dependencies({
      run: claimed({ taskId: "other-task" }),
    });

    await expectCode(executeBoundedToroRun(input, deps), "claimed_run_mismatch");
    expect(handler.execute).not.toHaveBeenCalled();
    expect(deps.complete).not.toHaveBeenCalled();
    expect(deps.transition).toHaveBeenCalledWith(
      expect.objectContaining({ expectedStatus: "claimed", nextStatus: "failed" }),
    );
  });

  it("aborts on timeout and records only a redacted failure", async () => {
    const handler = allowedHandler({
      execute: vi.fn(({ signal }) => {
        return new Promise((_, reject) => {
          signal.addEventListener("abort", () => reject(new Error("secret detail")));
        });
      }),
    });
    const { deps } = dependencies({ handler });

    await expectCode(
      executeBoundedToroRun({ ...input, timeoutMs: 5 }, deps),
      "execution_timeout",
    );
    expect(deps.complete).not.toHaveBeenCalled();
    expect(deps.transition).toHaveBeenLastCalledWith(
      expect.objectContaining({
        nextStatus: "failed",
        errorClass: "bounded_worker_failure",
        errorRedacted: "Bounded worker stopped safely.",
      }),
    );
  });

  it("does not complete a run whose readback is unverified", async () => {
    const { deps } = dependencies({
      handler: allowedHandler({ verify: vi.fn().mockResolvedValue(null) }),
    });

    await expectCode(executeBoundedToroRun(input, deps), "verification_failed");
    expect(deps.complete).not.toHaveBeenCalled();
    expect(deps.transition).toHaveBeenLastCalledWith(
      expect.objectContaining({ expectedStatus: "running", nextStatus: "failed" }),
    );
  });

  it("leaves an ambiguous completion for reconciliation without replay", async () => {
    const { deps, handler } = dependencies();
    deps.complete = vi.fn().mockRejectedValue(new Error("connection lost"));

    await expectCode(executeBoundedToroRun(input, deps), "completion_unknown");
    expect(handler.execute).toHaveBeenCalledTimes(1);
    expect(deps.complete).toHaveBeenCalledTimes(1);
    expect(deps.transition).toHaveBeenCalledTimes(2);
  });

  it("requires readback of the exact verified receipt", async () => {
    const { deps, handler } = dependencies();
    deps.readReceipt = vi.fn().mockResolvedValue(null);

    await expectCode(executeBoundedToroRun(input, deps), "completion_unknown");
    expect(handler.execute).toHaveBeenCalledTimes(1);
    expect(deps.complete).toHaveBeenCalledTimes(1);
    expect(deps.readReceipt).toHaveBeenCalledTimes(1);
    expect(deps.transition).toHaveBeenCalledTimes(2);
  });
});
