import { describe, expect, it } from "vitest";

import { preparePostStayOpportunity } from "./post-stay";

const base = {
  sourceEventKey: "stay:completed_0001",
  stayCompletedAt: "2026-09-20T11:00:00Z",
  consent: "allowed" as const,
  serviceRecoveryOpen: false,
  reviewAlreadyRequested: false,
  returnInvitationEligible: true,
  language: "es" as const,
};

describe("preparePostStayOpportunity", () => {
  it("prepares review and return drafts without sending or claiming revenue", () => {
    const result = preparePostStayOpportunity(base);

    expect(result.ok).toBe(true);
    if (!result.ok || result.state !== "prepared") return;

    expect(result.externalSend).toBe(false);
    expect(result.actions.map((action) => action.kind)).toEqual([
      "review_request",
      "return_invitation",
    ]);
    expect(
      result.actions.every((action) => action.sendState === "draft_only"),
    ).toBe(true);
    expect(result.measurement).toMatchObject({
      opportunityKey: "poststay:stay:completed_0001",
      baselineRequired: true,
      outcomeRequired: true,
      directRevenueClaimAllowed: false,
    });
  });

  it("suppresses growth messaging while service recovery is open", () => {
    const result = preparePostStayOpportunity({
      ...base,
      serviceRecoveryOpen: true,
    });

    expect(result).toEqual({
      ok: true,
      state: "no_action",
      externalSend: false,
      reason: "service_recovery_open",
      actions: [],
    });
  });

  it("fails closed when channel consent is not allowed", () => {
    for (const consent of ["unknown", "denied"] as const) {
      const result = preparePostStayOpportunity({ ...base, consent });
      expect(result).toEqual({
        ok: true,
        state: "no_action",
        externalSend: false,
        reason: "consent_not_allowed",
        actions: [],
      });
    }
  });

  it("does not duplicate a review request", () => {
    const result = preparePostStayOpportunity({
      ...base,
      reviewAlreadyRequested: true,
      returnInvitationEligible: false,
    });

    expect(result).toEqual({
      ok: true,
      state: "no_action",
      externalSend: false,
      reason: "review_already_requested_and_no_other_action",
      actions: [],
    });
  });

  it("can prepare only the return invitation after a prior review request", () => {
    const result = preparePostStayOpportunity({
      ...base,
      reviewAlreadyRequested: true,
      returnInvitationEligible: true,
      language: "en",
    });

    expect(result.ok).toBe(true);
    if (!result.ok || result.state !== "prepared") return;

    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].kind).toBe("return_invitation");
    expect(result.actions[0].text).toContain("welcome you back");
  });

  it("rejects malformed source or completion evidence", () => {
    const result = preparePostStayOpportunity({
      ...base,
      sourceEventKey: "x",
      stayCompletedAt: "not-a-time",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors).toEqual(
      expect.arrayContaining([
        "sourceEventKey must be 8-122 characters using letters, numbers, :, _ or -.",
        "stayCompletedAt must be a valid ISO timestamp.",
      ]),
    );
  });
});
