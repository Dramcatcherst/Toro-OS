import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  parseMaintenanceFieldRound,
  type MaintenanceFieldRound,
} from "./maintenance";

export type MaintenanceWorkspaceLoad =
  | {
      kind: "ready";
      data: MaintenanceFieldRound;
      defaultResponsible: string;
      canConfirmP0: boolean;
    }
  | {
      kind: "forbidden";
      detail: string;
    }
  | {
      kind: "error";
      detail: string;
    };

const ALLOWED_ROLES = new Set(["FOUNDER", "GERENCIA", "OPERACIONES"]);

function uniqueOrgIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const ids = new Set<string>();
  for (const row of value) {
    if (!row || typeof row !== "object") return null;
    const orgId = (row as { org_id?: unknown }).org_id;
    if (typeof orgId !== "string" || !orgId.trim()) return null;
    ids.add(orgId);
  }

  return [...ids];
}

export async function loadMaintenanceWorkspace(): Promise<MaintenanceWorkspaceLoad> {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro/operacion/mantenimiento");
  }

  if (!ALLOWED_ROLES.has(session.role)) {
    return {
      kind: "forbidden",
      detail: "Este espacio está reservado para Operaciones y Gerencia.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("user_roles")
    .select("org_id")
    .eq("user_id", session.userId)
    .eq("status", "active")
    .is("revoked_at", null);

  if (membershipError) {
    return {
      kind: "error",
      detail: "No se pudo verificar la organización activa del usuario.",
    };
  }

  const orgIds = uniqueOrgIds(memberships);
  if (!orgIds || orgIds.length !== 1) {
    return {
      kind: "error",
      detail: "TORO no puede determinar una única organización activa para esta sesión.",
    };
  }

  const { data, error } = await supabase.rpc("get_current_maintenance_field_round", {
    p_org_id: orgIds[0],
  });

  if (error) {
    if (/not authorized/i.test(error.message ?? "")) {
      return {
        kind: "forbidden",
        detail: "Tu rol o departamento no tiene acceso a esta ronda de mantenimiento.",
      };
    }

    return {
      kind: "error",
      detail: "No se pudo verificar la ronda de mantenimiento.",
    };
  }

  try {
    return {
      kind: "ready",
      data: parseMaintenanceFieldRound(data),
      defaultResponsible: session.displayName,
      canConfirmP0: session.role === "FOUNDER" || session.role === "GERENCIA",
    };
  } catch {
    return {
      kind: "error",
      detail: "La ronda devolvió datos incompletos o inválidos y TORO la bloqueó.",
    };
  }
}
