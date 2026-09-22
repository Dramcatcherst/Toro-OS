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

const currentKey = "toro_human_layer_runtime_config_current";
const snapshotKey = "toro_human_layer_runtime_config_v1_2_20260922";
const configHash =
  "sha256:5bfe3b0d56db9f66f6737dde086d365a56b0d580dfb4c38c05105fc77a475c77";

describe("loadHumanLayerRuntimeConfig", () => {
  beforeEach(() => {
    createServerSupabaseClient.mockReset();
  });

  it("resolves the stable current pointer and verifies the versioned snapshot", async () => {
    const pointerQuery = query({
      data: {
        knowledge_key: currentKey,
        verified_status: "verified",
        active: true,
        structured_content: {
          current_snapshot_key: snapshotKey,
          config_version: "TORO-HUMAN-LAYER-v1.2",
          config_hash: configHash,
          onboarding_step_count: 10,
          state_persistence: "NOT_IMPLEMENTED",
        },
        updated_at: "2026-09-22T20:45:00.000Z",
      },
      error: null,
    });
    const snapshotQuery = query({
      data: {
        knowledge_key: snapshotKey,
        verified_status: "verified",
        active: true,
        structured_content: {
          config_version: "TORO-HUMAN-LAYER-v1.2",
          config_hash: configHash,
          onboarding_step_count: 10,
        },
        updated_at: "2026-09-22T20:44:00.000Z",
      },
      error: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(pointerQuery)
      .mockReturnValueOnce(snapshotQuery);

    createServerSupabaseClient.mockResolvedValue({
      schema: (name: string) => {
        expect(name).toBe("operations");
        return {
          from: (table: string) => {
            expect(table).toBe("knowledge_items");
            return from(table);
          },
        };
      },
    });

    await expect(loadHumanLayerRuntimeConfig()).resolves.toEqual({
      state: "verified",
      knowledgeKey: currentKey,
      snapshotKey,
      configVersion: "TORO-HUMAN-LAYER-v1.2",
      configHash,
      onboardingStepCount: 10,
      statePersistence: "not_implemented",
      sourceUpdatedAt: "2026-09-22T20:45:00.000Z",
      reason: null,
    });
    expect(pointerQuery.eq).toHaveBeenCalledWith("knowledge_key", currentKey);
    expect(snapshotQuery.eq).toHaveBeenCalledWith("knowledge_key", snapshotKey);
  });

  it("uses the PII-free public projection when machine auth has no Supabase user session", async () => {
    const deniedQuery = query({
      data: null,
      error: { message: "permission denied for table knowledge_items" },
    });
    const rpc = vi.fn(async (name: string, args: { p_org_slug: string }) => {
      expect(name).toBe("get_toro_human_layer_config_identity");
      expect(args).toEqual({ p_org_slug: "dreamcatcher" });
      return {
        data: [
          {
            knowledge_key: currentKey,
            snapshot_key: snapshotKey,
            config_version: "TORO-HUMAN-LAYER-v1.2",
            config_hash: configHash,
            onboarding_step_count: 10,
            state_persistence: "NOT_IMPLEMENTED",
            source_updated_at: "2026-09-22T20:45:00.000Z",
          },
        ],
        error: null,
      };
    });

    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from: () => deniedQuery }),
      rpc,
    });

    await expect(loadHumanLayerRuntimeConfig()).resolves.toEqual({
      state: "verified",
      knowledgeKey: currentKey,
      snapshotKey,
      configVersion: "TORO-HUMAN-LAYER-v1.2",
      configHash,
      onboardingStepCount: 10,
      statePersistence: "not_implemented",
      sourceUpdatedAt: "2026-09-22T20:45:00.000Z",
      reason: null,
    });
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("fails closed when the current pointer is missing or unavailable", async () => {
    const missingQuery = query({ data: null, error: null });
    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from: () => missingQuery }),
    });

    await expect(loadHumanLayerRuntimeConfig()).resolves.toEqual({
      state: "unverified",
      knowledgeKey: currentKey,
      snapshotKey: null,
      configVersion: null,
      configHash: null,
      onboardingStepCount: null,
      statePersistence: "unverified",
      sourceUpdatedAt: null,
      reason: "pointer_missing",
    });

    const failedQuery = query({
      data: null,
      error: { message: "permission denied" },
    });
    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from: () => failedQuery }),
    });

    await expect(loadHumanLayerRuntimeConfig()).resolves.toEqual({
      state: "unverified",
      knowledgeKey: currentKey,
      snapshotKey: null,
      configVersion: null,
      configHash: null,
      onboardingStepCount: null,
      statePersistence: "unverified",
      sourceUpdatedAt: null,
      reason: "pointer_unavailable",
    });
  });

  it("rejects pointer/snapshot drift without leaking canonical payload", async () => {
    const pointerQuery = query({
      data: {
        knowledge_key: currentKey,
        verified_status: "verified",
        active: true,
        structured_content: {
          current_snapshot_key: snapshotKey,
          config_version: "TORO-HUMAN-LAYER-v1.2",
          config_hash: configHash,
          onboarding_step_count: 10,
          state_persistence: "NOT_IMPLEMENTED",
        },
        updated_at: "2026-09-22T20:45:00.000Z",
      },
      error: null,
    });
    const snapshotQuery = query({
      data: {
        knowledge_key: snapshotKey,
        verified_status: "verified",
        active: true,
        structured_content: {
          config_version: "TORO-HUMAN-LAYER-v1.2",
          config_hash:
            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          onboarding_step_count: 10,
          canonical_payload: { private_fact: "must-not-leak" },
        },
        updated_at: "2026-09-22T20:44:00.000Z",
      },
      error: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(pointerQuery)
      .mockReturnValueOnce(snapshotQuery);
    createServerSupabaseClient.mockResolvedValue({
      schema: () => ({ from }),
    });

    const result = await loadHumanLayerRuntimeConfig();
    expect(result).toEqual({
      state: "unverified",
      knowledgeKey: currentKey,
      snapshotKey,
      configVersion: null,
      configHash: null,
      onboardingStepCount: null,
      statePersistence: "unverified",
      sourceUpdatedAt: null,
      reason: "snapshot_mismatch",
    });
    expect(JSON.stringify(result)).not.toContain("must-not-leak");
  });
});
