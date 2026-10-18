import "server-only";
import { internalCapabilityEnabled } from "@/lib/server/public-demo";

import { resolveToroContext } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  buildToroInternalTaskDraft,
  canCreateToroInternalWork,
  isExactToroInternalTaskReplay,
  validateToroInternalWorkRequest,
  type ToroInternalTaskDraft,
  type ToroInternalTaskReplayComparable,
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
  | { state: "invalid" | "conflict"; error: string }
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
  category?: unknown;
  due_date?: unknown;
  description?: unknown;
  canonical_module_key?: unknown;
};

const TASK_SELECT =
  "id, task_key, task_name, status, priority, area, project_id, category, due_date, description, canonical_module_key";

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

function normalizeReplayComparable(
  row: SupabaseTaskRow,
): ToroInternalTaskReplayComparable | null {
  if (
    typeof row.task_name !== "string" ||
    typeof row.priority !== "string" ||
    typeof row.category !== "string" ||
    typeof row.area !== "string" ||
    typeof row.canonical_module_key !== "string"
  ) {
    return null;
  }

  const nullableString = (value: unknown) =>
    value === null || typeof value === "string" ? value : null;

  const projectId = nullableString(row.project_id);
  const dueDate = nullableString(row.due_date);
  const description = nullableString(row.description);
  if (
    projectId !== row.project_id ||
    dueDate !== row.due_date ||
    description !== row.description
  ) {
    return null;
  }

  return {
    task_name: row.task_name,
    project_id: projectId,
    category: row.category,
    priority: row.priority as ToroInternalTaskDraft["priority"],
    area: row.area,
    due_date: dueDate,
    description,
    canonical_module_key: row.canonical_module_key,
  };
}

function replayResult(row: SupabaseTaskRow, candidate: ToroInternalTaskDraft) {
  const task = normalizeTask(row);
  const comparable = normalizeReplayComparable(row);
  if (!task || !comparable) {
    return {
      state: "unavailable" as const,
      error: "Existing task could not be normalized safely.",
    };
  }
  if (!isExactToroInternalTaskReplay(comparable, candidate)) {
    return {
      state: "conflict" as const,
      error:
        "Idempotency key already exists with different task content; manual reconciliation is required.",
    };
  }
  return { state: "replayed" as const, task };
}

export async function createToroInternalWork(
  input: unknown,
): Promise<ToroInternalWorkResult> {
  if (!internalCapabilityEnabled("TORO_INTERNAL_WORK_WRITE_ENABLED")) {
    return { state: "unavailable", error: "Internal work writes are disabled." };
  }
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
  const draft = buildToroInternalTaskDraft({
    request: parsed.value,
    context,
    projectId,
    nowIso: new Date().toISOString(),
  });
  const existingResult = await supabase
    .schema("operations")
    .from("tasks")
    .select(TASK_SELECT)
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
    ? (existingResult.data[0] as SupabaseTaskRow | undefined)
    : undefined;

  if (existing) return replayResult(existing, draft);

  const inserted = await supabase
    .schema("operations")
    .from("tasks")
    .insert(draft)
    .select(TASK_SELECT)
    .single();

  if (inserted.error) {
    // A concurrent retry may win the unique (org_id, task_key) race.
    if (inserted.error.code === "23505") {
      const replay = await supabase
        .schema("operations")
        .from("tasks")
        .select(TASK_SELECT)
        .eq("org_id", context.orgId!)
        .eq("task_key", taskKey)
        .limit(1);

      const row = Array.isArray(replay.data)
        ? (replay.data[0] as SupabaseTaskRow | undefined)
        : undefined;

      if (!replay.error && row) return replayResult(row, draft);
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
