import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { listMyDecisions } from "@/features/decisions/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type {
  ExecutiveException,
  ExecutiveHomeData,
  ExecutiveProject,
  ExecutiveSystemHealth,
} from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const operationalStaleAfterMs = 48 * 60 * 60 * 1000;

type ExecutiveTaskRow = {
  id: string;
  task_name: string;
  category: string | null;
  area: string | null;
  priority: string;
  status: string;
  updated_at: string;
};

type ExecutiveProjectRow = {
  id: string;
  project_name: string;
  status: string;
  owner_name: string | null;
  next_action: string | null;
  updated_at: string;
};

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseExecutiveTask(value: unknown): ExecutiveTaskRow {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid executive task payload received from the server.");
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !uuidPattern.test(row.id) ||
    typeof row.task_name !== "string" ||
    !isNullableString(row.category) ||
    !isNullableString(row.area) ||
    typeof row.priority !== "string" ||
    typeof row.status !== "string" ||
    !isIsoDate(row.updated_at)
  ) {
    throw new Error("Invalid executive task payload received from the server.");
  }

  return row as ExecutiveTaskRow;
}

function parseExecutiveProject(value: unknown): ExecutiveProjectRow {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid executive project payload received from the server.");
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !uuidPattern.test(row.id) ||
    typeof row.project_name !== "string" ||
    typeof row.status !== "string" ||
    !isNullableString(row.owner_name) ||
    !isNullableString(row.next_action) ||
    !isIsoDate(row.updated_at)
  ) {
    throw new Error("Invalid executive project payload received from the server.");
  }

  return row as ExecutiveProjectRow;
}

function latestTimestamp(values: string[]) {
  if (!values.length) return null;
  return values.reduce((latest, value) =>
    Date.parse(value) > Date.parse(latest) ? value : latest,
  );
}

function healthForOperationalSources({
  failedSources,
  freshness,
}: {
  failedSources: string[];
  freshness: string[];
}): ExecutiveSystemHealth {
  const checkedAt = latestTimestamp(freshness);

  if (failedSources.length) {
    return {
      status: "degraded",
      label: `Cobertura parcial · fuente sin respuesta: ${failedSources.join(", ")}`,
      checkedAt,
    };
  }

  if (checkedAt && Date.now() - Date.parse(checkedAt) > operationalStaleAfterMs) {
    return {
      status: "degraded",
      label: "Información operativa desactualizada · última señal supera 48 horas",
      checkedAt,
    };
  }

  return {
    status: "unknown",
    label: "Fuentes operativas TORO conectadas · cobertura parcial del negocio",
    checkedAt,
  };
}

export async function loadExecutiveHome(): Promise<ExecutiveHomeData> {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro");
  }

  const supabase = await createServerSupabaseClient();
  const operations = supabase.schema("operations");

  const [decisions, taskResult, projectResult] = await Promise.all([
    listMyDecisions({ limit: 5 }),
    operations
      .from("tasks")
      .select("id,task_name,category,area,priority,status,updated_at")
      .eq("active", true)
      .eq("status", "blocked")
      .in("priority", ["critical", "high"])
      .order("urgency_score", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(5),
    operations
      .from("projects")
      .select("id,project_name,status,owner_name,next_action,updated_at")
      .eq("active", true)
      .in("status", ["Blocked", "In Progress"])
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const failedSources: string[] = [];
  const freshness: string[] = [];

  let exceptions: ExecutiveException[] = [];
  if (taskResult.error) {
    failedSources.push("tareas");
  } else {
    if (!Array.isArray(taskResult.data)) {
      throw new Error("Invalid executive task payload received from the server.");
    }
    exceptions = taskResult.data.map((raw) => {
      const row = parseExecutiveTask(raw);
      freshness.push(row.updated_at);
      return {
        id: row.id,
        title: row.task_name,
        domain: row.area || row.category || "Operación",
        source: "TORO · operations.tasks",
        freshness: row.updated_at,
      } satisfies ExecutiveException;
    });
  }

  let projects: ExecutiveProject[] = [];
  if (projectResult.error) {
    failedSources.push("proyectos");
  } else {
    if (!Array.isArray(projectResult.data)) {
      throw new Error("Invalid executive project payload received from the server.");
    }
    projects = projectResult.data.map((raw) => {
      const row = parseExecutiveProject(raw);
      freshness.push(row.updated_at);
      return {
        id: row.id,
        title: row.project_name,
        milestone: null,
        blocker: null,
        nextAction: row.next_action,
        owner: row.owner_name,
        status: row.status,
      } satisfies ExecutiveProject;
    });
  }

  return {
    decisions,
    exceptions,
    delegatedActions: [],
    projects,
    systemHealth: healthForOperationalSources({ failedSources, freshness }),
  };
}
