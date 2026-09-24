import { describe, expect, it } from "vitest";

import { prepareGuestServiceRecovery } from "./service-recovery";

describe("prepareGuestServiceRecovery", () => {
  it("prepares a maintenance handoff to RICO without write or external send", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "wespeak:case_0001",
      category: "maintenance",
      summary: "A/C no enfría correctamente",
      locationLabel: "Habitación 26",
      detail: "El huésped reporta que el A/C enciende pero no enfría.",
      urgency: "high",
      guestLanguage: "es",
      dueDate: "2026-09-24",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toMatchObject({
      workflowState: "prepared",
      externalSend: false,
      internalWriteExecuted: false,
      internalWork: {
        action: "maintenance.task",
        priority: "high",
        dueDate: "2026-09-24",
        idempotencyKey: "guest:wespeak:case_0001",
      },
      guestReplyDraft: {
        language: "es",
        sendState: "draft_only",
      },
      handoff: {
        owner: "RICO",
        canonicalModule: "toro_operations",
        evidenceRequired: true,
        completionRequiresOperationalProof: true,
      },
    });
    expect(result.value.guestReplyDraft.text).toContain("priorizar");
  });

  it("uses canonical task intake for non-maintenance service recovery", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "web:case_000002",
      category: "housekeeping",
      summary: "Solicita limpieza adicional",
      locationLabel: "Habitación 21",
      urgency: "normal",
      guestLanguage: "en",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.internalWork.action).toBe("task.create");
    expect(result.value.handoff.owner).toBe("TORO");
    expect(result.value.guestReplyDraft.text).toContain("organizing");
  });

  it("is deterministic for the same source event so later writes can dedupe", () => {
    const input = {
      sourceEventKey: "whatsapp:msg_12345",
      category: "maintenance" as const,
      summary: "Revisar ducha",
      locationLabel: "Habitación 25",
      urgency: "normal" as const,
      guestLanguage: "es" as const,
    };

    const first = prepareGuestServiceRecovery(input);
    const second = prepareGuestServiceRecovery(input);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    expect(first.value.internalWork.idempotencyKey).toBe(
      second.value.internalWork.idempotencyKey,
    );
  });

  it("fails closed on malformed source keys or unusable summaries", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "x",
      category: "general",
      summary: " ",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors).toEqual(
      expect.arrayContaining([
        "sourceEventKey must be 8-122 characters using letters, numbers, :, _ or -.",
        "summary must be between 3 and 180 characters.",
      ]),
    );
  });
});
