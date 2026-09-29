export function executiveDecisionDisplay(status: string | null): {
  statusLabel: string | null;
  requiresReconciliation: boolean;
} {
  if (status?.trim().toLowerCase() === "processed") {
    return {
      statusLabel: "Requiere conciliación",
      requiresReconciliation: true,
    };
  }

  return {
    statusLabel: status,
    requiresReconciliation: false,
  };
}
