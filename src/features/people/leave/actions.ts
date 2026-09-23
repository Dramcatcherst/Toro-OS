"use server";

import { revalidatePath } from "next/cache";

import { resolveToroContext } from "@/features/context/resolver";

import { submitMyLeaveRequest } from "./server";

export type LeaveRequestActionState = {
  status: "idle" | "success" | "error";
  message: string;
  requestId?: string;
};

export const initialLeaveRequestActionState: LeaveRequestActionState = {
  status: "idle",
  message: "",
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitLeaveRequestAction(
  _previousState: LeaveRequestActionState,
  formData: FormData,
): Promise<LeaveRequestActionState> {
  const context = await resolveToroContext({ mode: "organization" });

  if (!context || context.requiresContextChoice) {
    return {
      status: "error",
      message: "Selecciona una empresa activa antes de enviar la solicitud.",
    };
  }

  const result = await submitMyLeaveRequest(context, {
    leaveType: formValue(formData, "leaveType"),
    startsOn: formValue(formData, "startsOn"),
    endsOn: formValue(formData, "endsOn"),
    reason: formValue(formData, "reason"),
  });

  if (result.status === "created") {
    revalidatePath("/toro/solicitudes");
    revalidatePath("/toro/mi-perfil");

    return {
      status: "success",
      message: "Solicitud enviada. Quedó pendiente de revisión.",
      requestId: result.id,
    };
  }

  if (result.status === "invalid" || result.status === "error") {
    return { status: "error", message: result.error };
  }

  return {
    status: "error",
    message:
      result.reason === "employee_link_required"
        ? "Tu cuenta todavía no está vinculada a un expediente laboral."
        : "No tienes acceso a este flujo en el contexto actual.",
  };
}
