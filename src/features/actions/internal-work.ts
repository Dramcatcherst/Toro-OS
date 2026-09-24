import type { ToroResolvedContext } from "@/features/context/types";

export const TORO_INTERNAL_WORK_ACTIONS = [
  "task.create",
  "maintenance.task",
  "builder.task",
  "project.followup",
] as const;

export type ToroInternalWorkAction =
  (typeof TORO_INTERNAL_WORK_ACTIONS)[number];

export type ToroInternalWorkPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ToroInternalWorkRequest = {
  action: ToroInternalWorkAction;
  title: string;
  description: string | null;
  priority: ToroInternalWorkPriority;
  projectKey: string | null;
  dueDate: string | null;
  idempotencyKey: string;
};

export type ToroInternalTaskDraft = {
  org_id: string;
  task_key: string;
  task_name: string;
  project_id: string | null;
  category: string;
  status: "planned";
  priority: ToroInternalWorkPriority;
  area: string;
  owner_name: string;
  created_date: string;
  due_date: string | null;
  description: string | null;
  source_label: string;
  active: true;
  source_system: "TORO";
  source_table: "brain.internal-work";
  source_record_id: string;
  canonical_module_key: string;
  module_lead: string;
};

export type ToroInternalWorkValidation =
  | { ok: true; value: ToroInternalWorkRequest }
  | { ok: false; error: string };

const ACTION_SET = new Set<string>(TORO_INTERNAL_WORK_ACTIONS);
const PRIORITY_SET = new Set<ToroInternalWorkPriority>([
  "low",
  "medium",
  "high",
  "critical",
]);

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  if (!clean || clean.length > maxLength) return null;
  return clean;
}

function optionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === "") return null;
  return cleanText(value, maxLength);
}

function validIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed);
}

export function validateToroInternalWorkRequest(
  input: unknown,
): ToroInternalWorkValidation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Request body must be an object." };
  }

  const body = input as Record<string, unknown>;
  const action = cleanText(body.action, 64);
  if (!action || !ACTION_SET.has(action)) {
    return { ok: false, error: "Unsupported internal work action." };
  }

  const title = cleanText(body.title, 180);
  if (!title || title.length < 3) {
    return { ok: false, error: "A title between 3 and 180 characters is required." };
  }

  const description = optionalText(body.description, 4000);
  if (
    body.description !== undefined &&
    body.description !== null &&
    body.description !== "" &&
    description === null
  ) {
    return { ok: false, error: "Description is too long or invalid." };
  }

  const priorityCandidate =
    optionalText(body.priority, 16)?.toLowerCase() ?? "medium";
  if (!PRIORITY_SET.has(priorityCandidate as ToroInternalWorkPriority)) {
    return { ok: false, error: "Priority must be low, medium, high, or critical." };
  }

  const projectKey = optionalText(body.projectKey, 128);
  if (
    projectKey &&
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(projectKey)
  ) {
    return { ok: false, error: "Project key format is invalid." };
  }

  if (action === "project.followup" && !projectKey) {
    return { ok: false, error: "project.followup requires projectKey." };
  }

  const dueDate = optionalText(body.dueDate, 10);
  if (dueDate && !validIsoDate(dueDate)) {
    return { ok: false, error: "dueDate must be a valid YYYY-MM-DD date." };
  }

  const idempotencyKey = cleanText(body.idempotencyKey, 128);
  if (
    !idempotencyKey ||
    !/^[A-Za-z0-9][A-Za-z0-9:_-]{7,127}$/.test(idempotencyKey)
  ) {
    return {
      ok: false,
      error:
        "idempotencyKey must be 8-128 characters using letters, numbers, :, _ or -.",
    };
  }

  return {
    ok: true,
    value: {
      action: action as ToroInternalWorkAction,
      title,
      description,
      priority: priorityCandidate as ToroInternalWorkPriority,
      projectKey,
      dueDate,
      idempotencyKey,
    },
  };
}

export function canCreateToroInternalWork(context: ToroResolvedContext) {
  if (
    context.mode !== "organization" ||
    !context.orgId ||
    !context.membership ||
    !context.canUseOrganizationData ||
    context.requiresContextChoice
  ) {
    return false;
  }

  return context.membership.roles.some(
    (role) => role === "ADMIN" || role === "GERENCIA",
  );
}

function routeMetadata(
  request: ToroInternalWorkRequest,
  context: ToroResolvedContext,
) {
  switch (request.action) {
    case "maintenance.task":
      return {
        category: "operations",
        area: "Maintenance",
        module: "toro_operations",
        lead: "RICO",
      };
    case "builder.task":
      return {
        category: "system",
        area: "Systems",
        module: "toro_builder",
        lead: "SOBRESITO/CODEX",
      };
    case "project.followup":
      return {
        category: "TORO Executive Control",
        area: "Projects",
        module: "toro_projects",
        lead: "TORO",
      };
    case "task.create":
    default:
      return {
        category: "operations",
        area: context.membership?.workArea ?? "Operations",
        module: "toro_operations",
        lead: "TORO",
      };
  }
}

export function buildToroInternalTaskDraft(input: {
  request: ToroInternalWorkRequest;
  context: ToroResolvedContext;
  projectId?: string | null;
  nowIso: string;
}): ToroInternalTaskDraft {
  if (!input.context.orgId || !input.context.membership) {
    throw new Error("Organization context is required.");
  }

  const route = routeMetadata(input.request, input.context);

  return {
    org_id: input.context.orgId,
    task_key: `toro_intake:${input.request.idempotencyKey}`,
    task_name: input.request.title,
    project_id: input.projectId ?? null,
    category: route.category,
    status: "planned",
    priority: input.request.priority,
    area: route.area,
    owner_name:
      input.context.membership.employeePreferredName ??
      input.context.displayName,
    created_date: input.nowIso,
    due_date: input.request.dueDate,
    description: input.request.description,
    source_label: "TORO conversational action",
    active: true,
    source_system: "TORO",
    source_table: "brain.internal-work",
    source_record_id: input.request.idempotencyKey,
    canonical_module_key: route.module,
    module_lead: route.lead,
  };
}
