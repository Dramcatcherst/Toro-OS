import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { ProjectDirectoryItem } from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProjectRow = {
  id: string;
  project_name: string;
  status: string;
  priority: string | null;
  owner_name: string | null;
  next_action: string | null;
  category: string | null;
  business_area: string | null;
  updated_at: string;
};

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseProjectRow(value: unknown): ProjectRow {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid project directory payload received from the server.");
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !uuidPattern.test(row.id) ||
    typeof row.project_name !== "string" ||
    typeof row.status !== "string" ||
    !isNullableString(row.priority) ||
    !isNullableString(row.owner_name) ||
    !isNullableString(row.next_action) ||
    !isNullableString(row.category) ||
    !isNullableString(row.business_area) ||
    !isIsoDate(row.updated_at)
  ) {
    throw new Error("Invalid project directory payload received from the server.");
  }

  return row as ProjectRow;
}

export async function loadProjectDirectory(): Promise<ProjectDirectoryItem[]> {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro/proyectos");
  }
  if (session.role !== "FOUNDER" && session.role !== "GERENCIA") {
    redirect("/toro");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema("operations")
    .from("projects")
    .select("id,project_name,status,priority,owner_name,next_action,category,business_area,updated_at")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message || "Unable to load TORO projects.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Invalid project directory payload received from the server.");
  }

  return data.map((raw) => {
    const row = parseProjectRow(raw);
    return {
      id: row.id,
      title: row.project_name,
      status: row.status,
      priority: row.priority,
      owner: row.owner_name,
      nextAction: row.next_action,
      category: row.category,
      businessArea: row.business_area,
      freshness: row.updated_at,
    } satisfies ProjectDirectoryItem;
  });
}
