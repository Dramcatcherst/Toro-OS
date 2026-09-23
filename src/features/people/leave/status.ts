const PENDING_LEAVE_STATUSES = new Set([
  "pending",
  "pending_manager",
  "pending_hr",
]);

export function isPendingLeaveStatus(value: string | null | undefined) {
  return Boolean(value && PENDING_LEAVE_STATUSES.has(value.trim().toLowerCase()));
}

export function leaveStatusLabel(value: string | null | undefined) {
  switch (value?.trim().toLowerCase()) {
    case "pending":
    case "pending_manager":
      return "Pendiente de jefatura";
    case "pending_hr":
      return "Pendiente de RR. HH.";
    case "approved":
      return "Aprobada";
    case "rejected":
      return "Rechazada";
    case "cancelled":
      return "Cancelada";
    default:
      return value?.trim() || "Sin estado";
  }
}
