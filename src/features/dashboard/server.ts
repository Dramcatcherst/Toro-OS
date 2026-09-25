import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  buildDashboardMvpData,
  type DashboardKnowledgeInput,
  type DashboardMvpData,
} from "./data";

type KnowledgeRow = {
  knowledge_key: string;
  structured_content: unknown;
  updated_at: string | null;
};

const EMPTY = buildDashboardMvpData({ payflow: null, studio: null });

function inputFromRow(row: KnowledgeRow | undefined): DashboardKnowledgeInput {
  return row
    ? {
        updatedAt: row.updated_at,
        structuredContent: row.structured_content,
      }
    : null;
}

export async function loadDashboardMvpData(
  orgId: string,
): Promise<DashboardMvpData> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .schema("operations")
      .from("knowledge_items")
      .select("knowledge_key,structured_content,updated_at")
      .eq("org_id", orgId)
      .eq("active", true)
      .in("knowledge_key", [
        "toro_google_calendar_business_architecture_v1",
        "toro_studio_v1",
      ]);

    if (error || !Array.isArray(data)) return EMPTY;

    const rows = data as KnowledgeRow[];
    return buildDashboardMvpData({
      payflow: inputFromRow(
        rows.find(
          (row) =>
            row.knowledge_key ===
            "toro_google_calendar_business_architecture_v1",
        ),
      ),
      studio: inputFromRow(
        rows.find((row) => row.knowledge_key === "toro_studio_v1"),
      ),
    });
  } catch {
    return EMPTY;
  }
}
