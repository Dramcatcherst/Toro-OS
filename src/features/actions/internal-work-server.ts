import "server-only";

import { resolveToroContext } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  buildToroInternalTaskDraft,
  canCreateToroInternalWork,
  validateToroInternalWorkRequest,
} from "./internal-work";

export type ToroInternalWorkResult =
  | {
      state: "created" | "replayed";
      task: {
        id: string;
        taskKey: string;
        title: string;
        status: string | null;
        priority: string | null;
        area: string | null;
        projectId: string | null;
      };
    }
  | { state: "invalid"; error: string }
  | { state: "unauthenticated" }
  | { state: "forbidden"; error: string }
  | { state: "unavailable"; error: string };

type SupabaseTaskRow = {
  id?: unknown;
  task_key?: unknown;
  task_name?: unknown;
  status?: unknown;
  priority?: unknown;
  area?: unknown;
  project_id?: unknown;
};

function normalizeTask(row: SupabaseTaskRow) {
  if (
    typeof row.id !== "string" ||
    typeof row.task_key !== "string" ||
    typeof row.task_name !== "string"
  ) {
    return null;
  }

  const textOrNull = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : null;

  return {
    id: row.id,
    taskKey: row.task_key,
    title: row.task_name,
    status: textOrNull(row.status),
    priority: textOrNull(row.priority),
    area: textOrNull(row.area),
    projectId: textOrNull(row.project_id),
  };
}

export async function createToroInternalWork(
  input: unknown,
): Promise<ToroInternalWorkResult> {
  const parsed = validateToroInternalWorkRequest(input);
  if (!parsed.ok) return { state: "invalid", error: parsed.error };

  const context = await resolveToroContext({ mode: "organization" });
  if (!context) return { state: "unauthenticated" };

  if (!canCreateToroInternalWork(context)) {
    return {
      state: "forbidden",
      error:
        "This first controlled-write slice is limited to ADMIN or GERENCIA organization context.",
    };
  }

  const supabase = await createServerSupabaseClient();
  let projectId: string | null = null;

  if (parsed.value.projectKey) {
    const { data, error } = await supabase
      .schema("operations")
      .from("projects")
      .select("id")
      .eq("org_id", context.orgId!)
      .eq("project_key", parsed.value.projectKey)
      .eq("active", true)
      .limit(1);

    if (error) {
      return {
        state: "unavailable",
        error: "Project lookup failed safely.",
      };
    }

    const first = Array.isArray(data) ? data[0] : null;
    const id =
      first && typeof first === "object"
        ? (first as { id?: unknown }).id
        : null;

    if (typeof id !== "string" || !id) {
      return { state: "invalid", error: "Active projectKey was not found." };
    }
    projectId = id;
  }

  const taskKey = `toro_intake:${parsed.value.idempotencyKey}`;
  const existingResult = await supabase
    .schema("operations")
    .from("tasks")
    .select("id, task_key, task_name, status, priority, area, project_id")
    .eq("org_id", context.orgId!)
    .eq("task_key", taskKey)
    .limit(1);

  if (existingResult.error) {
    return {
      state: "unavailable",
      error: "Idempotency lookup failed safely.",
    };
  }

  const existing = Array.isArray(existingResult.data)
    ? normalizeTask((existingResult.data[0] ?? {}) as SupabaseTaskRow)
    : null;

  if (existing) return { state: "replayed", task: existing };

  const draft = buildToroInternalTaskDraft({
    request: parsed.value,
    context,
    projectId,
    nowIso: new Date().toISOString(),
  });

  const inserted = await supabase
    .schema("operations")
    .from("tasks")
    .insert(draft)
    .select("id, task_key, task_name, status, priority, area, project_id")
    .single();

  if (inserted.error) {
    // A concurrent retry may win the unique (org_id, task_key) race.
    if (inserted.error.code === "23505") {
      const replay = await supabase
        .schema("operations")
        .from("tasks")
        .select("id, task_key, task_name, status, priority, area, project_id")
        .eq("org_id", context.orgId!)
        .eq("task_key", taskKey)
        .limit(1);

      const row = Array.isArray(replay.data)
        ? normalizeTask((replay.data[0] ?? {}) as SupabaseTaskRow)
        : null;

      if (!replay.error && row) return { state: "replayed", task: row };
    }

    return {
      state: "unavailable",
      error: "Internal task creation failed safely.",
    };
  }

  const task = normalizeTask((inserted.data ?? {}) as SupabaseTaskRow);
  if (!task) {
    return {
      state: "unavailable",
      error: "Created task could not be normalized.",
    };
  }

  return { state: "created", task };
}
