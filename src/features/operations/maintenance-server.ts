import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { resolveToroContext } from "@/features/context/resolver";
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

const ALLOWED_ROLES = new Set(["FOUNDER", "GERENCIA", "OPERACIONES", "CAMPO"]);

export async function loadMaintenanceWorkspace(): Promise<MaintenanceWorkspaceLoad> {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro/operacion/mantenimiento");
  }

  if (!ALLOWED_ROLES.has(session.role)) {
    return {
      kind: "forbidden",
      detail: "Este espacio está reservado para Operaciones, personal de campo autorizado y Gerencia.",
    };
  }

  const context = await resolveToroContext({ mode: "organization" });
  if (
    !context ||
    context.requiresContextChoice ||
    !context.orgId ||
    !context.canUseOrganizationData
  ) {
    return {
      kind: "error",
      detail: "TORO no puede determinar una única organización activa para esta sesión.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_current_maintenance_field_round", {
    p_org_id: context.orgId,
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
