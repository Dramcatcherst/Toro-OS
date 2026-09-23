import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { KnowledgeDirectoryItem } from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type KnowledgeRow = {
  id: string;
  title: string;
  knowledge_class: string;
  visibility: string;
  verified_status: string;
  risk_level: string;
  requires_human_verification: boolean;
  last_verified: string | null;
  next_review: string | null;
  source_system: string | null;
  updated_at: string;
};

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isNullableDate(value: unknown): value is string | null {
  return value === null || isDate(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseKnowledgeRow(value: unknown): KnowledgeRow {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid knowledge directory payload received from the server.");
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !uuidPattern.test(row.id) ||
    typeof row.title !== "string" ||
    typeof row.knowledge_class !== "string" ||
    typeof row.visibility !== "string" ||
    row.visibility === "private" ||
    typeof row.verified_status !== "string" ||
    typeof row.risk_level !== "string" ||
    typeof row.requires_human_verification !== "boolean" ||
    !isNullableDate(row.last_verified) ||
    !isNullableDate(row.next_review) ||
    !isNullableString(row.source_system) ||
    !isIsoDate(row.updated_at)
  ) {
    throw new Error("Invalid knowledge directory payload received from the server.");
  }

  return row as KnowledgeRow;
}

export async function loadKnowledgeDirectory(): Promise<KnowledgeDirectoryItem[]> {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro/conocimiento");
  }
  if (session.role !== "FOUNDER" && session.role !== "GERENCIA") {
    redirect("/toro");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema("operations")
    .from("knowledge_items")
    .select("id,title,knowledge_class,visibility,verified_status,risk_level,requires_human_verification,last_verified,next_review,source_system,updated_at")
    .eq("active", true)
    .neq("visibility", "private")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message || "Unable to load TORO knowledge.");
  }
  if (!Array.isArray(data)) {
    throw new Error("Invalid knowledge directory payload received from the server.");
  }

  return data.map((raw) => {
    const row = parseKnowledgeRow(raw);
    return {
      id: row.id,
      title: row.title,
      knowledgeClass: row.knowledge_class,
      visibility: row.visibility,
      verifiedStatus: row.verified_status,
      riskLevel: row.risk_level,
      requiresHumanVerification: row.requires_human_verification,
      lastVerified: row.last_verified,
      nextReview: row.next_review,
      sourceSystem: row.source_system,
      freshness: row.updated_at,
    } satisfies KnowledgeDirectoryItem;
  });
}
