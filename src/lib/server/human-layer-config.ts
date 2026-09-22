import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const HUMAN_LAYER_RUNTIME_CONFIG_KEY =
  "toro_human_layer_runtime_config_v1_1_20260922";

export type HumanLayerRuntimeConfig = {
  state: "verified" | "unverified";
  knowledgeKey: typeof HUMAN_LAYER_RUNTIME_CONFIG_KEY;
  configVersion: string | null;
  configHash: string | null;
  sourceUpdatedAt: string | null;
  reason:
    | null
    | "snapshot_missing"
    | "snapshot_unavailable"
    | "snapshot_invalid";
};

function unverified(
  reason: Exclude<HumanLayerRuntimeConfig["reason"], null>,
): HumanLayerRuntimeConfig {
  return {
    state: "unverified",
    knowledgeKey: HUMAN_LAYER_RUNTIME_CONFIG_KEY,
    configVersion: null,
    configHash: null,
    sourceUpdatedAt: null,
    reason,
  };
}

function parseSnapshot(value: unknown): HumanLayerRuntimeConfig {
  if (!value || typeof value !== "object") {
    return unverified("snapshot_invalid");
  }

  const row = value as Record<string, unknown>;
  const structured =
    row.structured_content && typeof row.structured_content === "object"
      ? (row.structured_content as Record<string, unknown>)
      : null;
  const configVersion = structured?.config_version;
  const configHash = structured?.config_hash;
  const sourceUpdatedAt = row.updated_at;

  if (
    row.knowledge_key !== HUMAN_LAYER_RUNTIME_CONFIG_KEY ||
    row.verified_status !== "verified" ||
    row.active !== true ||
    typeof configVersion !== "string" ||
    !/^TORO-HUMAN-LAYER-v\d+(?:\.\d+)?$/.test(configVersion) ||
    typeof configHash !== "string" ||
    !/^sha256:[0-9a-f]{64}$/.test(configHash) ||
    typeof sourceUpdatedAt !== "string" ||
    Number.isNaN(Date.parse(sourceUpdatedAt))
  ) {
    return unverified("snapshot_invalid");
  }

  return {
    state: "verified",
    knowledgeKey: HUMAN_LAYER_RUNTIME_CONFIG_KEY,
    configVersion,
    configHash,
    sourceUpdatedAt,
    reason: null,
  };
}

export async function loadHumanLayerRuntimeConfig(): Promise<HumanLayerRuntimeConfig> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("operations")
      .from("knowledge_items")
      .select(
        "knowledge_key,verified_status,active,structured_content,updated_at",
      )
      .eq("knowledge_key", HUMAN_LAYER_RUNTIME_CONFIG_KEY)
      .eq("active", true)
      .maybeSingle();

    if (error) return unverified("snapshot_unavailable");
    if (!data) return unverified("snapshot_missing");

    return parseSnapshot(data);
  } catch {
    return unverified("snapshot_unavailable");
  }
}
