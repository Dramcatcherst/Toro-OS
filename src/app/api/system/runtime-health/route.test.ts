import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createWorkerClient } = vi.hoisted(() => ({
  createWorkerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/worker", () => ({
  createWorkerSupabaseClient: createWorkerClient,
}));

import {
  buildToroRuntimeHealthConfig,
  isToroRuntimeHealthAuthorized,
} from "@/features/runtime/health";
import { GET } from "./route";

function readyEnv() {
  return {
    TORO_RUNTIME_HEALTH_ENABLED: "true",
    TORO_RUNTIME_HEALTH_TOKEN: "synthetic-health-token",
    NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
    SUPABASE_SECRET_KEY: "sb_secret_synthetic",
    TORO_MCP_ENABLED: "false",
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_SHA: "synthetic-sha",
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  for (const [key, value] of Object.entries(readyEnv())) {
    vi.stubEnv(key, value);
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("TORO runtime health configuration", () => {
  it("reports safe configuration metadata without secret values", () => {
    const config = buildToroRuntimeHealthConfig(readyEnv());

    expect(config).toMatchObject({
      enabled: true,
      authConfigured: true,
      supabasePublicConfigured: true,
      workerSecretConfigured: true,
      workerSecretSource: "SUPABASE_SECRET_KEY",
      workerSecretLegacy: false,
      mcpEnabled: false,
      deployment: {
        environment: "preview",
        gitCommitSha: "synthetic-sha",
      },
    });
    expect(JSON.stringify(config)).not.toContain("sb_secret_synthetic");
    expect(JSON.stringify(config)).not.toContain("synthetic-health-token");
  });

  it("uses exact bearer-token authorization", () => {
    const env = readyEnv();
    expect(
      isToroRuntimeHealthAuthorized(
        "Bearer synthetic-health-token",
        env,
      ),
    ).toBe(true);
    expect(
      isToroRuntimeHealthAuthorized(
        "Bearer synthetic-health-token-wrong",
        env,
      ),
    ).toBe(false);
    expect(isToroRuntimeHealthAuthorized(null, env)).toBe(false);
  });
});

describe("TORO runtime health route", () => {
  it("fails closed before touching Supabase when disabled", async () => {
    vi.stubEnv("TORO_RUNTIME_HEALTH_ENABLED", "false");
    const response = await GET(
      new Request("https://example.invalid/api/system/runtime-health", {
        headers: {
          authorization: "Bearer synthetic-health-token",
        },
      }),
    );

    expect(response.status).toBe(404);
    expect(createWorkerClient).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated health reads before touching Supabase", async () => {
    const response = await GET(
      new Request("https://example.invalid/api/system/runtime-health"),
    );

    expect(response.status).toBe(401);
    expect(createWorkerClient).not.toHaveBeenCalled();
  });

  it("returns a verified read-only Control Plane probe", async () => {
    const from = vi.fn((table: string) => ({
      select: vi.fn(async () => ({
        data: null,
        error: null,
        count: table === "toro_execution_runs" ? 2 : 3,
      })),
    }));
    createWorkerClient.mockReturnValue({ from });

    const response = await GET(
      new Request("https://example.invalid/api/system/runtime-health", {
        headers: {
          authorization: "Bearer synthetic-health-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      state: "ready",
      config: {
        workerSecretConfigured: true,
        mcpEnabled: false,
      },
      controlPlane: {
        reachable: true,
        runsReadable: true,
        receiptsReadable: true,
        runCount: 2,
        receiptCount: 3,
      },
    });
    expect(from.mock.calls.map(([table]) => table)).toEqual([
      "toro_execution_runs",
      "toro_execution_receipts",
    ]);
  });

  it("redacts database failures and returns degraded", async () => {
    createWorkerClient.mockReturnValue({
      from: () => ({
        select: async () => ({
          data: null,
          error: { message: "synthetic-private-error" },
          count: null,
        }),
      }),
    });

    const response = await GET(
      new Request("https://example.invalid/api/system/runtime-health", {
        headers: {
          authorization: "Bearer synthetic-health-token",
        },
      }),
    );

    expect(response.status).toBe(503);
    const body = await response.text();
    expect(body).toContain('"state":"degraded"');
    expect(body).not.toContain("synthetic-private-error");
  });
});
