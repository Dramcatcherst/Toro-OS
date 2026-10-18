import { describe, expect, it } from "vitest";

import {
  prepareGuestFeedbackBatch,
  prepareGuestServiceRecovery,
} from "./service-recovery";

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
      context: {
        sourceChannel: "unknown",
        bookingContextVerified: false,
        contactConsent: false,
        roomEntryConsent: false,
        breakfast: null,
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
        immediateHumanAttention: false,
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

  it("preserves an omitted legacy source as unknown instead of inventing staff", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "web:case_000010",
      category: "general",
      summary: "Origen legado sin mapa verificado",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.context.sourceChannel).toBe("unknown");
    expect(result.value.internalWork.description).toContain(
      "Source channel: unknown",
    );
  });

  it("rejects a null root payload with a controlled error", () => {
    const result = prepareGuestServiceRecovery(null as never);

    expect(result).toEqual({
      ok: false,
      errors: ["feedback input must be an object."],
    });
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

  it("rejects unresolved or insecure template links before any send path can use them", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0003",
      sourceChannel: "survey",
      category: "general",
      summary: "Comentario privado",
      privateFeedbackLink: "[PRIVATE_FEEDBACK_LINK]",
      guestPortalLink: "http://example.com/portal",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors).toEqual(
      expect.arrayContaining([
        "privateFeedbackLink contains an unresolved template placeholder.",
        "guestPortalLink must use https.",
      ]),
    );
  });

  it("rejects URL-encoded unresolved template placeholders", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0008",
      sourceChannel: "survey",
      category: "general",
      summary: "Comentario privado",
      privateFeedbackLink:
        "https://example.com/%5BPRIVATE_FEEDBACK_LINK%5D",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain(
      "privateFeedbackLink contains an unresolved template placeholder.",
    );
  });

  it("rejects non-string optional links instead of silently dropping them", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0010",
      sourceChannel: "survey",
      category: "general",
      summary: "Enlace con tipo inválido",
      privateFeedbackLink: 42 as never,
      guestPortalLink: { href: "https://example.com" } as never,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "privateFeedbackLink must be a string URL.",
        "guestPortalLink must be a string URL.",
      ]),
    );
  });

  it("rejects unsupported runtime enum values", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0009",
      category: "pool" as never,
      summary: "Valor no reconocido",
      urgency: "urgent" as never,
      breakfastConcern: "price" as never,
      breakfastEntitlement: "free" as never,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "category is not supported.",
        "urgency must be normal, high, or critical.",
        "breakfastConcern is not supported.",
        "breakfastEntitlement is not supported.",
      ]),
    );
  });

  it("keeps contact consent, room-entry consent and booking verification independent", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "portal:case_0004",
      sourceChannel: "portal",
      category: "housekeeping",
      summary: "Revisar limpieza",
      contactConsent: true,
      roomEntryConsent: false,
      bookingContextVerified: true,
      privateFeedbackLink: "https://example.com/feedback/opaque-token",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.context).toMatchObject({
      sourceChannel: "portal",
      bookingContextVerified: true,
      contactConsent: true,
      roomEntryConsent: false,
    });
    expect(result.value.externalSend).toBe(false);
  });

  it("forces safety and electrical concerns into immediate critical human attention", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0005",
      sourceChannel: "survey",
      category: "electricity",
      summary: "Olor eléctrico cerca de un tomacorriente",
      urgency: "normal",
      guestLanguage: "es",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.internalWork).toMatchObject({
      action: "maintenance.task",
      priority: "critical",
    });
    expect(result.value.handoff).toMatchObject({
      owner: "RICO",
      immediateHumanAttention: true,
    });
  });

  it("separates breakfast service concern from reservation entitlement", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0006",
      sourceChannel: "survey",
      category: "breakfast",
      summary: "Demora en el desayuno",
      breakfastConcern: "wait",
      breakfastEntitlement: "unknown",
      bookingContextVerified: false,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.context.breakfast).toEqual({
      concern: "wait",
      entitlement: "unknown",
    });
    expect(result.value.internalWork.description).toContain(
      "Breakfast concern: wait; entitlement: unknown",
    );
  });

  it("keeps unverified breakfast entitlement unknown", () => {
    const unverified = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0011",
      sourceChannel: "survey",
      category: "breakfast",
      summary: "Consulta de desayuno",
      breakfastConcern: "entitlement_or_charge",
      breakfastEntitlement: "included",
      bookingContextVerified: false,
    });
    const verified = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0012",
      sourceChannel: "survey",
      category: "breakfast",
      summary: "Consulta de desayuno verificada",
      breakfastConcern: "entitlement_or_charge",
      breakfastEntitlement: "included",
      bookingContextVerified: true,
    });

    expect(unverified.ok).toBe(true);
    expect(verified.ok).toBe(true);
    if (!unverified.ok || !verified.ok) return;
    expect(unverified.value.context.breakfast?.entitlement).toBe("unknown");
    expect(unverified.value.internalWork.description).toContain(
      "entitlement: unknown",
    );
    expect(verified.value.context.breakfast?.entitlement).toBe("included");
  });

  it("does not accept breakfast-specific fields for unrelated issues", () => {
    const result = prepareGuestServiceRecovery({
      sourceEventKey: "survey:case_0007",
      category: "noise",
      summary: "Ruido exterior",
      breakfastConcern: "quality",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors).toContain(
      "breakfastConcern is only valid for breakfast feedback.",
    );
  });
});

describe("prepareGuestFeedbackBatch", () => {
  it("rejects a null batch payload with a controlled error", () => {
    const result = prepareGuestFeedbackBatch(null as never);

    expect(result).toEqual({
      ok: false,
      errors: ["feedback batch input must be an object."],
    });
  });

  it("prepares several concerns from one synthetic submission without writes", () => {
    const result = prepareGuestFeedbackBatch({
      submissionId: "synthetic_0001",
      sourceChannel: "survey",
      projectKey: "dreamcatcher_hotel_reinvestment_2026",
      guestLanguage: "es",
      contactConsent: true,
      roomEntryConsent: false,
      bookingContextVerified: true,
      privateFeedbackLink: "https://example.com/feedback/opaque-token",
      issues: [
        {
          category: "housekeeping",
          summary: "Polvo en una repisa",
          locationLabel: "Habitación 27",
        },
        {
          category: "breakfast",
          summary: "Demora en el desayuno",
          breakfastConcern: "wait",
          breakfastEntitlement: "unknown",
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toMatchObject({
      workflowState: "prepared",
      externalSend: false,
      internalWriteExecuted: false,
      issueCount: 2,
      duplicateIssueCount: 0,
      immediateHumanAttention: false,
    });
    expect(
      result.value.issues.map((issue) => issue.internalWork.projectKey),
    ).toEqual([
      "dreamcatcher_hotel_reinvestment_2026",
      "dreamcatcher_hotel_reinvestment_2026",
    ]);
    expect(
      result.value.issues.map((issue) => issue.internalWork.idempotencyKey),
    ).toEqual([
      "guest:survey:synthetic_0001:01",
      "guest:survey:synthetic_0001:02",
    ]);
  });

  it("collapses exact duplicates and reports the avoided duplicate", () => {
    const issue = {
      category: "maintenance" as const,
      summary: "A/C no enfría",
      locationLabel: "Habitación 10",
    };
    const result = prepareGuestFeedbackBatch({
      submissionId: "synthetic_0002",
      sourceChannel: "portal",
      issues: [issue, { ...issue }],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.issueCount).toBe(1);
    expect(result.value.duplicateIssueCount).toBe(1);
  });

  it("merges duplicate urgency and due date without losing escalation", () => {
    const result = prepareGuestFeedbackBatch({
      submissionId: "synthetic_0006",
      sourceChannel: "survey",
      issues: [
        {
          category: "maintenance",
          summary: "A/C no enfría",
          locationLabel: "Habitación 10",
          urgency: "normal",
          dueDate: "2026-10-20",
        },
        {
          category: "maintenance",
          summary: "A/C no enfría",
          locationLabel: "Habitación 10",
          urgency: "critical",
          dueDate: "2026-10-18",
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      issueCount: 1,
      duplicateIssueCount: 1,
      immediateHumanAttention: true,
    });
    expect(result.value.issues[0].internalWork).toMatchObject({
      priority: "critical",
      dueDate: "2026-10-18",
    });
  });

  it("keeps delimiter-like issue content collision-safe", () => {
    const result = prepareGuestFeedbackBatch({
      submissionId: "synthetic_0007",
      sourceChannel: "survey",
      issues: [
        {
          category: "general",
          summary: "Noise | outside",
          locationLabel: "Pool",
        },
        {
          category: "general",
          summary: "Noise",
          locationLabel: "outside | Pool",
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.issueCount).toBe(2);
    expect(result.value.duplicateIssueCount).toBe(0);
  });

  it("rejects null issues with a controlled error", () => {
    const result = prepareGuestFeedbackBatch({
      submissionId: "synthetic_0008",
      sourceChannel: "survey",
      issues: [null] as never,
    });

    expect(result).toEqual({
      ok: false,
      errors: ["Issue 1: feedback issue must be an object."],
    });
  });

  it("selects the urgent acknowledgement when any concern needs immediate attention", () => {
    const result = prepareGuestFeedbackBatch({
      submissionId: "synthetic_0003",
      sourceChannel: "survey",
      guestLanguage: "en",
      issues: [
        { category: "noise", summary: "Noise outside" },
        {
          category: "electricity",
          summary: "Electrical smell near an outlet",
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.immediateHumanAttention).toBe(true);
    expect(result.value.guestReplyDraft.text).toContain("prioritizing");
    expect(result.value.issues[1].internalWork.priority).toBe("critical");
  });

  it("fails closed when a submission would fan out into too many tasks", () => {
    const result = prepareGuestFeedbackBatch({
      submissionId: "synthetic_0004",
      sourceChannel: "survey",
      issues: [
        { category: "noise", summary: "Issue one" },
        { category: "amenity", summary: "Issue two" },
        { category: "water", summary: "Issue three" },
        { category: "general", summary: "Issue four" },
      ],
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        "A feedback submission may create at most 3 unique operational issues.",
      ],
    });
  });

  it("produces the same task keys when an identical submission is replayed", () => {
    const input = {
      submissionId: "synthetic_0005",
      sourceChannel: "survey" as const,
      issues: [
        { category: "housekeeping" as const, summary: "Revisar limpieza" },
        { category: "water" as const, summary: "Revisar presión" },
      ],
    };
    const first = prepareGuestFeedbackBatch(input);
    const second = prepareGuestFeedbackBatch(input);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    expect(first.value.issues.map((issue) => issue.internalWork.idempotencyKey)).toEqual(
      second.value.issues.map((issue) => issue.internalWork.idempotencyKey),
    );
  });
});
