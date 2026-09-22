import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClient } = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));

import { loadHumanLayerRuntimeConfig } from "./human-layer-config";

function query(result: { data: unknown; error: { message?: string } | null }) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => result),
  };
  return chain;
}

describe("loadHumanLayerRuntimeConfig", () => {
  beforeEach(() => {
    createServerSupabaseClient.mockReset();
  });

  it("returns the verified version/hash from the canonical knowledge snapshot", async () => {
    const humanLayerQuery = query({
      data: {
        knowledge_key: "toro_human_layer_runtime_config_v1_1_20260922",
        verified_status: "verified",
        active: true,
        structured_content: {
          config_version: "TORO-HUMAN-LAYER-v1.1",
          config_hash: "sha256:913eb1581bdc59ae9311875cfbc5b07c4030de2f46436d6172d5599a67e83e4e",
        },
        updated_at: "2026-09-22T20:31:21.822Z",
      },
      error: null,
    });
    createServerSupabaseClient.mockResolvedValue({
      schema: (name: string) => {
        expect(name).toBe("operations");
        return {
          from: (table: string) => {
            expect(table).toBe("knowledge_items");
            return humanLayerQuery;
          },
        };
      },
    });

    await expect(loadHumanLayerRuntimeConfig()).resolves.toEqual({
      state: "verified",
      knowledgeKey: "toro_human_layer_runtime_config_v1_1_20260922",
      configVersion: "TORO-HUMAN-LAYER-v1.1",
      configHash: "sha256:913eb1581bdc59ae9311875cfbc5b07c4030de2f46436d6172d5599a67e83e4e",
      sourceUpdatedAt: "2026-09-22T20:31:21.822Z",
      reason: null,
    });
    expect(humanLayerQuery.select).toHaveBeenCalledWith(
      "knowledge_key,verified_status,active,structured_content,updated_at",
    );
    expect(humanLayerQuery.eq).toHaveBeenCalledWith(
      "knowledge_key",
      "toro_human_layer_runtime_config_v1_1_20260922",
    );
    expect(humanLayerQuery.eq).toHaveBeenCalledWith("active", true);
  });

  it("fails closed when the canonical snapshot is missing or the source errors", async () => {
    const missingQuery = query({ data: null, error: null });
    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from: () => missingQuery }),
    });

    await expect(loadHumanLayerRuntimeConfig()).resolves.toEqual({
      state: "unverified",
      knowledgeKey: "toro_human_layer_runtime_config_v1_1_20260922",
      configVersion: null,
      configHash: null,
      sourceUpdatedAt: null,
      reason: "snapshot_missing",
    });

    const failedQuery = query({ data: null, error: { message: "permission denied" } });
    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from: () => failedQuery }),
    });

    await expect(loadHumanLayerRuntimeConfig()).resolves.toEqual({
      state: "unverified",
      knowledgeKey: "toro_human_layer_runtime_config_v1_1_20260922",
      configVersion: null,
      configHash: null,
      sourceUpdatedAt: null,
      reason: "snapshot_unavailable",
    });
  });

  it("rejects unverified or malformed snapshots without leaking payload content", async () => {
    const invalidQuery = query({
      data: {
        knowledge_key: "toro_human_layer_runtime_config_v1_1_20260922",
        verified_status: "needs_verification",
        active: true,
        structured_content: {
          config_version: "TORO-HUMAN-LAYER-v1.1",
          config_hash: "bad-hash",
          canonical_payload: { private_fact: "must-not-leak" },
        },
        updated_at: "bad-date",
      },
      error: null,
    });
    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from: () => invalidQuery }),
    });

    const result = await loadHumanLayerRuntimeConfig();
    expect(result).toEqual({
      state: "unverified",
      knowledgeKey: "toro_human_layer_runtime_config_v1_1_20260922",
      configVersion: null,
      configHash: null,
      sourceUpdatedAt: null,
      reason: "snapshot_invalid",
    });
    expect(JSON.stringify(result)).not.toContain("must-not-leak");
  });
});
