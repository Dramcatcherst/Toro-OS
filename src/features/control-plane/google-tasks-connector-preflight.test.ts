import { describe, expect, it, vi } from "vitest";

import type { ToroBoundedRunContext } from "./bounded-worker";
import {
  createGoogleTasksConnectorPreflightHandler,
  GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION,
  type GoogleTasksConnectorPreflightSnapshot,
} from "./google-tasks-connector-preflight";

const NOW = Date.parse("2026-10-28T18:00:00.000Z");

function context(): ToroBoundedRunContext {
  return {
    run: {
      id: "run-1",
      orgId: "org-1",
      taskId: "task-1",
      decisionId: null,
      runKey: "run-key-1",
      idempotencyKey: "idem-1",
      correlationId: "correlation-1",
      traceId: null,
      actorKind: "system",
      actorRef: "bounded-worker",
      dotRef: null,
      agentRef: null,
      actionKey: GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION,
      targetSystem: "Google Tasks / TORO",
      executionAuthorityLevel: "L0",
      businessRisk: "Low",
      status: "claimed",
      verificationStatus: "pending",
      attemptCount: 1,
      maxAttempts: 1,
      leaseOwner: "worker-1",
      fencingToken: 7,
      leaseExpiresAt: "2026-10-28T18:02:00.000Z",
    },
    admission: {
      orgId: "org-1",
      taskId: "task-1",
      runId: "run-1",
      actionKey: GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION,
      workerId: "worker-1",
      fencingToken: 7,
      executionAuthorityLevel: "L0",
      admissionRef: "admission-1",
      validUntil: "2026-10-28T18:02:00.000Z",
    },
    signal: new AbortController().signal,
  };
}

function snapshot(
  overrides: Partial<GoogleTasksConnectorPreflightSnapshot> = {},
): GoogleTasksConnectorPreflightSnapshot {
  return {
    orgId: "org-1",
    taskId: "task-1",
    runId: "run-1",
    actionKey: GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION,
    accountRef: "dreamcatcher-admin",
    status: "READ_ONLY",
    readMode: "read_only",
    externalWritesAllowed: false,
    tenantIsolationVerified: true,
    observedAt: "2026-10-28T17:59:30.000Z",
    permissions: ["tasks.read"],
    sourceRefs: ["capability-registry:google-tasks"],
    ...overrides,
  };
}

describe("Google Tasks connector preflight handler", () => {
  it("is allowlist-safe and verifies a fresh tenant-scoped readback", async () => {
    const readSnapshot = vi.fn().mockResolvedValue(snapshot());
    const handler = createGoogleTasksConnectorPreflightHandler({
      expectedAccountRef: "dreamcatcher-admin",
      readSnapshot,
      now: () => NOW,
    });
    const ctx = context();

    expect(handler).toMatchObject({
      authority: "L0",
      effectMode: "read_only",
      externalActions: 0,
    });

    const result = await handler.execute(ctx);
    await expect(handler.verify(result, ctx)).resolves.toMatchObject({
      verified: true,
      executedState: { externalActions: 0, externalWrites: 0 },
      observedAfter: {
        status: "READ_ONLY",
        tenantIsolationVerified: true,
      },
      verificationMethod: "google_tasks_connector_capability_readback",
    });
    expect(readSnapshot).toHaveBeenCalledWith({
      orgId: "org-1",
      taskId: "task-1",
      runId: "run-1",
      actionKey: GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION,
      signal: ctx.signal,
    });
  });

  it.each([
    ["wrong tenant", { orgId: "other-org" }],
    ["wrong run", { runId: "other-run" }],
    ["wrong account", { accountRef: "other-account" }],
    ["stale source", { observedAt: "2026-10-28T17:50:00.000Z" }],
  ])("rejects %s", async (_label, override) => {
    const handler = createGoogleTasksConnectorPreflightHandler({
      expectedAccountRef: "dreamcatcher-admin",
      readSnapshot: vi.fn(),
      now: () => NOW,
    });

    await expect(handler.verify(snapshot(override), context())).resolves.toBeNull();
  });

  it("records AUTH_REQUIRED as a verified connector observation, not a connection", async () => {
    const handler = createGoogleTasksConnectorPreflightHandler({
      expectedAccountRef: "dreamcatcher-admin",
      readSnapshot: vi.fn(),
      now: () => NOW,
    });

    await expect(
      handler.verify(
        snapshot({ status: "AUTH_REQUIRED", permissions: [] }),
        context(),
      ),
    ).resolves.toMatchObject({
      verified: true,
      observedAfter: { status: "AUTH_REQUIRED" },
    });
  });
});
