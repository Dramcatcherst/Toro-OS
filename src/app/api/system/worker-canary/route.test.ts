import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createWorkerClient,
  claimById,
  transition,
  complete,
  resolveFailure,
} = vi.hoisted(() => ({
  createWorkerClient: vi.fn(),
  claimById: vi.fn(),
  transition: vi.fn(),
  complete: vi.fn(),
  resolveFailure: vi.fn(),
}));

vi.mock("@/lib/supabase/worker", () => ({
  createWorkerSupabaseClient: createWorkerClient,
}));

vi.mock("@/features/control-plane/worker-runtime", () => ({
  claimToroExecutionRunById: claimById,
  transitionToroExecutionRun: transition,
  completeToroExecutionRun: complete,
  resolveFailedToroExecutionRun: resolveFailure,
}));

import { POST } from "./route";

function baseEnv() {
  return {
    TORO_WORKER_CANARY_ENABLED: "true",
    TORO_WORKER_CANARY_TOKEN: "synthetic-canary-token",
    TORO_WORKER_CANARY_ORG_ID: "org-1",
    TORO_WORKER_CANARY_TASK_ID: "task-1",
    VERCEL_GIT_COMMIT_SHA: "abcdef1234567890",
  };
}

function chain(data: unknown, error: unknown = null) {
  const c: Record<string, unknown> = {};
  c.select = vi.fn(() => c);
  c.eq = vi.fn(() => c);
  c.limit = vi.fn(async () => ({ data, error }));
  c.insert = vi.fn(() => c);
  c.single = vi.fn(async () => ({ data, error }));
  return c;
}

beforeEach(() => {
  vi.resetAllMocks();
  for (const [key, value] of Object.entries(baseEnv())) vi.stubEnv(key, value);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("TORO worker canary", () => {
  it("fails closed when disabled", async () => {
    vi.stubEnv("TORO_WORKER_CANARY_ENABLED", "false");
    const response = await POST(
      new Request("https://example.invalid/api/system/worker-canary", {
        method: "POST",
        headers: { authorization: "Bearer synthetic-canary-token" },
      }),
    );

    expect(response.status).toBe(404);
    expect(createWorkerClient).not.toHaveBeenCalled();
  });

  it("rejects a missing token before worker access", async () => {
    const response = await POST(
      new Request("https://example.invalid/api/system/worker-canary", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(createWorkerClient).not.toHaveBeenCalled();
  });

  it("executes only the inserted run and completes with a receipt", async () => {
    const existing = chain([]);
    const inserted = chain({ id: "run-1" });
    const probeRuns = {
      select: vi.fn(async () => ({ error: null, count: 4 })),
    };
    const probeReceipts = {
      select: vi.fn(async () => ({ error: null, count: 3 })),
    };

    let runCalls = 0;
    createWorkerClient.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "toro_execution_runs") {
          runCalls += 1;
          if (runCalls === 1) return existing;
          if (runCalls === 2) return inserted;
          return probeRuns;
        }
        if (table === "toro_execution_receipts") return probeReceipts;
        throw new Error("unexpected table");
      }),
    });

    claimById.mockResolvedValue({
      id: "run-1",
      fencingToken: 1,
    });
    transition.mockResolvedValue(true);
    complete.mockResolvedValue("receipt-1");

    const response = await POST(
      new Request("https://example.invalid/api/system/worker-canary", {
        method: "POST",
        headers: { authorization: "Bearer synthetic-canary-token" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      state: "verified",
      runId: "run-1",
      receiptId: "receipt-1",
      gitCommitSha: "abcdef1234567890",
      externalActions: 0,
    });
    expect(claimById).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ runId: "run-1", orgId: "org-1" }),
    );
    expect(transition).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      expect.objectContaining({
        runId: "run-1",
        expectedStatus: "claimed",
        nextStatus: "running",
      }),
    );
    expect(transition).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({
        runId: "run-1",
        expectedStatus: "running",
        nextStatus: "verifying",
      }),
    );
    expect(complete).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        runId: "run-1",
        fencingToken: 1,
      }),
    );
  });

  it("replays a verified canary for the same commit without new work", async () => {
    const existing = chain([
      {
        id: "run-existing",
        status: "succeeded",
        verification_status: "passed",
      },
    ]);
    createWorkerClient.mockReturnValue({
      from: vi.fn(() => existing),
    });

    const response = await POST(
      new Request("https://example.invalid/api/system/worker-canary", {
        method: "POST",
        headers: { authorization: "Bearer synthetic-canary-token" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      state: "replayed",
      runId: "run-existing",
    });
    expect(claimById).not.toHaveBeenCalled();
  });
});
