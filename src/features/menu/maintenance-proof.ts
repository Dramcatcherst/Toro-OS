export type MaintenanceProofQueueRow = {
  id?: string | null;
  title?: string | null;
  property_area?: string | null;
  room_unit?: string | null;
  priority?: string | null;
  closure_action?: string | null;
  closure_instruction?: string | null;
  recommended_action?: string | null;
};

export type MaintenanceProofCheckRow = {
  target_event_id?: string | null;
  check_text?: string | null;
  pass_criteria?: string | null;
  requires_supervisor_review?: boolean | null;
  result_status?: string | null;
};

export type MaintenanceProofItem = {
  title: string;
  meta?: string;
  detail?: string;
};

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function formatMaintenanceProofItems(
  queueRows: MaintenanceProofQueueRow[],
  checkRows: MaintenanceProofCheckRow[],
): MaintenanceProofItem[] {
  const checkByEvent = new Map<string, MaintenanceProofCheckRow>();

  for (const check of checkRows) {
    const eventId = clean(check.target_event_id);
    if (!eventId || checkByEvent.has(eventId)) continue;
    checkByEvent.set(eventId, check);
  }

  return queueRows.map((row) => {
    const eventId = clean(row.id);
    const check = eventId ? checkByEvent.get(eventId) : undefined;
    const closureAction = clean(row.closure_action);
    const readyToVerify = closureAction === "verify_resolution";

    const meta = [
      readyToVerify ? "Listo para verificar" : "Pendiente de revisar",
      clean(row.priority),
      clean(row.room_unit)
        ? `Unidad ${clean(row.room_unit)}`
        : clean(row.property_area),
      check?.requires_supervisor_review === true ? "Requiere supervisor" : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const detail = readyToVerify
      ? clean(check?.pass_criteria) ??
        clean(row.closure_instruction) ??
        clean(row.recommended_action)
      : clean(row.recommended_action) ??
        clean(row.closure_instruction);

    return {
      title: clean(row.title) ?? "Incidencia de mantenimiento",
      meta: meta || undefined,
      detail: detail ?? undefined,
    };
  });
}
