import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { resolvePeopleSelfServiceScope } from "@/features/people/self-service/context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { parsePeopleLeaveRequest } from "./validation";

export type PeopleLeaveSubmissionResult =
  | { status: "created"; id: string }
  | {
      status: "not_available";
      reason:
        | "organization_context_required"
        | "organization_access_required"
        | "employee_link_required";
    }
  | { status: "invalid"; error: string }
  | { status: "error"; error: string };

function safeLeaveError(message: string | null | undefined) {
  const value = message?.toLowerCase() ?? "";

  if (value.includes("overlap")) {
    return "Ya existe una solicitud que se cruza con esas fechas.";
  }
  if (value.includes("not authorized")) {
    return "No tienes permiso para registrar esta solicitud.";
  }
  if (value.includes("active employee")) {
    return "Tu expediente laboral no está habilitado para esta solicitud.";
  }
  if (
    value.includes("invalid leave") ||
    value.includes("leave reason is required")
  ) {
    return "La solicitud no cumple las reglas vigentes.";
  }

  return "No fue posible registrar la solicitud.";
}

export async function submitMyLeaveRequest(
  context: ToroResolvedContext,
  value: unknown,
): Promise<PeopleLeaveSubmissionResult> {
  const scope = resolvePeopleSelfServiceScope(context);
  if (!scope.allowed) {
    return { status: "not_available", reason: scope.reason };
  }

  const parsed = parsePeopleLeaveRequest(value);
  if (!parsed.ok) {
    return { status: "invalid", error: parsed.error };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("submit_leave_request", {
    p_org_id: scope.orgId,
    p_employee_id: scope.employeeId,
    p_leave_type: parsed.data.leaveType,
    p_starts_on: parsed.data.startsOn,
    p_ends_on: parsed.data.endsOn,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return {
      status: "error",
      error: safeLeaveError(error.message),
    };
  }

  if (typeof data !== "string" || !data.trim()) {
    return {
      status: "error",
      error: "TORO no pudo confirmar la creación de la solicitud.",
    };
  }

  return { status: "created", id: data };
}
