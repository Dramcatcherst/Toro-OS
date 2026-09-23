"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SubmitMaintenanceResult = "pass" | "fail" | "not_reviewed";

export type SubmitMaintenanceCheckInput = {
  checkId: string;
  result: SubmitMaintenanceResult;
  evidenceRef?: string;
  evidenceNote?: string;
  responsibleName: string;
};

export type ConfirmMaintenanceCheckInput = {
  checkId: string;
  supervisorName: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clean(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function assertUuid(value: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new Error("Invalid maintenance check id.");
  }
}

export async function submitMaintenanceCheck(input: SubmitMaintenanceCheckInput) {
  assertUuid(input.checkId);

  if (!["pass", "fail", "not_reviewed"].includes(input.result)) {
    throw new Error("Invalid maintenance result.");
  }

  const responsibleName = clean(input.responsibleName);
  const evidenceRef = clean(input.evidenceRef);
  const evidenceNote = clean(input.evidenceNote);

  if (!responsibleName) {
    throw new Error("Responsible name is required.");
  }

  if ((input.result === "pass" || input.result === "fail") && !evidenceRef) {
    throw new Error("Evidence is required for PASS/FAIL.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("submit_maintenance_inspection_check", {
    p_check_id: input.checkId,
    p_result: input.result,
    p_evidence_ref: evidenceRef,
    p_evidence_note: evidenceNote,
    p_responsible_name: responsibleName,
  });

  if (error) {
    throw new Error(error.message || "Unable to submit maintenance check.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid maintenance action result received from the server.");
  }

  revalidatePath("/toro/operacion/mantenimiento");
  revalidatePath("/toro");

  return data;
}

export async function confirmMaintenanceCheck(input: ConfirmMaintenanceCheckInput) {
  assertUuid(input.checkId);

  const supervisorName = clean(input.supervisorName);
  if (!supervisorName) {
    throw new Error("Supervisor name is required.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("confirm_maintenance_inspection_check", {
    p_check_id: input.checkId,
    p_supervisor_name: supervisorName,
  });

  if (error) {
    throw new Error(error.message || "Unable to confirm maintenance check.");
  }

  revalidatePath("/toro/operacion/mantenimiento");
  revalidatePath("/toro");
}
