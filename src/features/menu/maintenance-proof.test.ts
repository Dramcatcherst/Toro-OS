import { describe, expect, it } from "vitest";

import { formatMaintenanceProofItems } from "./maintenance-proof";

describe("formatMaintenanceProofItems", () => {
  it("labels reported-resolved work as ready to verify and shows physical pass criteria", () => {
    const items = formatMaintenanceProofItems(
      [
        {
          id: "event-1",
          title: "Fuga de inodoro habitación 2",
          room_unit: "2",
          priority: "high",
          closure_action: "verify_resolution",
          closure_instruction: "Verify actual correction.",
        },
      ],
      [
        {
          target_event_id: "event-1",
          pass_criteria:
            "PASS = 3 ciclos completos; sin fuga; revisar 10–15 min; foto general + mecanismo.",
          requires_supervisor_review: false,
          result_status: "pending",
        },
      ],
    );

    expect(items).toEqual([
      {
        title: "Fuga de inodoro habitación 2",
        meta: "Listo para verificar · high · Unidad 2",
        detail:
          "PASS = 3 ciclos completos; sin fuga; revisar 10–15 min; foto general + mecanismo.",
      },
    ]);
  });

  it("does not describe an open issue as ready to verify", () => {
    const items = formatMaintenanceProofItems(
      [
        {
          id: "event-2",
          title: "Salida de agua habitación 22",
          room_unit: "22",
          priority: "critical",
          closure_action: "recent_open_review",
          recommended_action: "Identificar causa, reparar y probar antes de liberar.",
        },
      ],
      [],
    );

    expect(items[0]).toMatchObject({
      meta: "Pendiente de revisar · critical · Unidad 22",
      detail: "Identificar causa, reparar y probar antes de liberar.",
    });
    expect(items[0]?.meta).not.toContain("Listo para verificar");
  });

  it("surfaces supervisor review when required", () => {
    const items = formatMaintenanceProofItems(
      [
        {
          id: "event-3",
          title: "Gotera crítica",
          room_unit: "24",
          priority: "critical",
          closure_action: "verify_resolution",
        },
      ],
      [
        {
          target_event_id: "event-3",
          pass_criteria: "PASS = prueba sin gotera y evidencia posterior.",
          requires_supervisor_review: true,
        },
      ],
    );

    expect(items[0]?.meta).toContain("Requiere supervisor");
  });
});
