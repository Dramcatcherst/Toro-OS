import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const HUMAN_LAYER_RUNTIME_CONFIG_KEY =
  "toro_human_layer_runtime_config_current";

const VERSION_RE = /^TORO-HUMAN-LAYER-v\d+(?:\.\d+)?$/;
const HASH_RE = /^sha256:[0-9a-f]{64}$/;
const SNAPSHOT_KEY_RE =
  /^toro_human_layer_runtime_config_v\d+_\d+_\d{8}$/;

type UnverifiedReason =
  | "pointer_missing"
  | "pointer_unavailable"
  | "pointer_invalid"
  | "snapshot_missing"
  | "snapshot_unavailable"
  | "snapshot_mismatch";

export type HumanLayerRuntimeConfig = {
  state: "verified" | "unverified";
  knowledgeKey: typeof HUMAN_LAYER_RUNTIME_CONFIG_KEY;
  snapshotKey: string | null;
  configVersion: string | null;
  configHash: string | null;
  onboardingStepCount: number | null;
  statePersistence: "implemented" | "not_implemented" | "unverified";
  sourceUpdatedAt: string | null;
  reason: null | UnverifiedReason;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function unverified(
  reason: UnverifiedReason,
  snapshotKey: string | null = null,
): HumanLayerRuntimeConfig {
  return {
    state: "unverified",
    knowledgeKey: HUMAN_LAYER_RUNTIME_CONFIG_KEY,
    snapshotKey,
    configVersion: null,
    configHash: null,
    onboardingStepCount: null,
    statePersistence: "unverified",
    sourceUpdatedAt: null,
    reason,
  };
}

export async function loadHumanLayerRuntimeConfig(): Promise<HumanLayerRuntimeConfig> {
  try {
    const supabase = await createServerSupabaseClient();
    const operations = supabase.schema("operations");

    const { data: pointer, error: pointerError } = await operations
      .from("knowledge_items")
      .select(
        "knowledge_key,verified_status,active,structured_content,updated_at",
      )
      .eq("knowledge_key", HUMAN_LAYER_RUNTIME_CONFIG_KEY)
      .eq("active", true)
      .maybeSingle();

    if (pointerError) return unverified("pointer_unavailable");
    if (!pointer) return unverified("pointer_missing");

    const pointerRow = asRecord(pointer);
    const pointerStructured = asRecord(pointerRow?.structured_content);
    const snapshotKey = pointerStructured?.current_snapshot_key;
    const configVersion = pointerStructured?.config_version;
    const configHash = pointerStructured?.config_hash;
    const onboardingStepCount = pointerStructured?.onboarding_step_count;
    const rawStatePersistence = pointerStructured?.state_persistence;
    const sourceUpdatedAt = pointerRow?.updated_at;

    if (
      pointerRow?.knowledge_key !== HUMAN_LAYER_RUNTIME_CONFIG_KEY ||
      pointerRow?.verified_status !== "verified" ||
      pointerRow?.active !== true ||
      typeof snapshotKey !== "string" ||
      !SNAPSHOT_KEY_RE.test(snapshotKey) ||
      typeof configVersion !== "string" ||
      !VERSION_RE.test(configVersion) ||
      typeof configHash !== "string" ||
      !HASH_RE.test(configHash) ||
      !Number.isInteger(onboardingStepCount) ||
      onboardingStepCount !== 10 ||
      (rawStatePersistence !== "IMPLEMENTED" &&
        rawStatePersistence !== "NOT_IMPLEMENTED") ||
      typeof sourceUpdatedAt !== "string" ||
      Number.isNaN(Date.parse(sourceUpdatedAt))
    ) {
      return unverified("pointer_invalid");
    }

    const { data: snapshot, error: snapshotError } = await operations
      .from("knowledge_items")
      .select(
        "knowledge_key,verified_status,active,structured_content,updated_at",
      )
      .eq("knowledge_key", snapshotKey)
      .eq("active", true)
      .maybeSingle();

    if (snapshotError) {
      return unverified("snapshot_unavailable", snapshotKey);
    }
    if (!snapshot) return unverified("snapshot_missing", snapshotKey);

    const snapshotRow = asRecord(snapshot);
    const snapshotStructured = asRecord(snapshotRow?.structured_content);
    const snapshotVersion = snapshotStructured?.config_version;
    const snapshotHash = snapshotStructured?.config_hash;
    const snapshotStepCount = snapshotStructured?.onboarding_step_count;

    if (
      snapshotRow?.knowledge_key !== snapshotKey ||
      snapshotRow?.verified_status !== "verified" ||
      snapshotRow?.active !== true ||
      snapshotVersion !== configVersion ||
      snapshotHash !== configHash ||
      snapshotStepCount !== onboardingStepCount
    ) {
      return unverified("snapshot_mismatch", snapshotKey);
    }

    return {
      state: "verified",
      knowledgeKey: HUMAN_LAYER_RUNTIME_CONFIG_KEY,
      snapshotKey,
      configVersion,
      configHash,
      onboardingStepCount,
      statePersistence:
        rawStatePersistence === "IMPLEMENTED"
          ? "implemented"
          : "not_implemented",
      sourceUpdatedAt,
      reason: null,
    };
  } catch {
    return unverified("pointer_unavailable");
  }
}
