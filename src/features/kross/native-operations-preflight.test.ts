import { describe, expect, it } from "vitest";
import { preflightKrossNativeAction } from "./native-operations-preflight";

const NOW = "2026-10-24T20:02:00Z";
const context = {
  surface: "authenticated_app" as const,
  roleVerified: true,
  authorizedForRead: true,
  authorizedForAction: true,
  scopeVerified: true,
  roomMappingVerified: true,
  nativeObjectReference: "synthetic-kross-reservation",
  sourceAsOf: "2026-10-24T20:01:00Z",
  observedAt: "2026-10-24T20:01:05Z",
};

const cleaning = {
  type: "housekeeping_observation" as const,
  context,
  markedClean: true,
  markedByAuthenticatedStaff: true,
  markedAt: "2026-10-24T20:00:00Z",
  lastKnownDirtyAt: "2026-10-24T19:00:00Z",
};
const payment = {
  type: "payment_registration" as const,
  context,
  nativeFolioReference: "synthetic-folio",
  amount: 100.5,
  currency: "USD",
  method: "CARD" as const,
  evidenceLevel: "processor_authorized" as const,
  evidenceReference: "synthetic-provider-authorization",
  duplicateCheckPerformed: true,
  matchingPaymentAlreadyExists: false,
};
const note = {
  type: "reservation_note" as const,
  context,
  nativeVersionReference: "synthetic-native-version",
  audience: "internal_only" as const,
  contentReviewedByAuthorizedRole: true,
  guestNotificationDisabledVerified: true,
};

describe("Kross native operations preflight", () => {
  it("uses a current employee Kross clean mark without asking housekeeping again", () => {
    const result = preflightKrossNativeAction(cleaning, NOW);
    expect(result.status).toBe("cleaning_confirmed");
    expect(result.skipDuplicateCleaningConfirmation).toBe(true);
    expect(result.next).toBe("consume_native_cleaning_fact");
    expect(result.canDeclareReady).toBe(false);
    expect(result.pmsWriteAuthorizedByThisPreflight).toBe(false);
  });
  it("rejects stale and out-of-order cleaning evidence", () => {
    const r = preflightKrossNativeAction({ ...cleaning, lastKnownDirtyAt: "2026-10-24T20:01:00Z" }, NOW);
    expect(r.blockers).toContain("newer_dirty_or_unknown_reclean_required");
    expect(r.skipDuplicateCleaningConfirmation).toBe(false);
  });
  it("trusts a native read-only housekeeping mark without granting payment or note edits", () => {
    const observed = preflightKrossNativeAction({ ...cleaning, context: { ...context, authorizedForAction: false } }, NOW);
    const financial = preflightKrossNativeAction({ ...payment, context: { ...context, authorizedForAction: false } }, NOW);
    expect(observed.status).toBe("cleaning_confirmed");
    expect(observed.skipDuplicateCleaningConfirmation).toBe(true);
    expect(financial.status).toBe("blocked");
    expect(financial.blockers).toContain("native_action_capability_unverified");
  });
  it("never substitutes email, Android push, or historical mirrors for authenticated Kross", () => {
    for (const surface of ["email", "push", "historical_mirror"] as const) {
      const result = preflightKrossNativeAction({ ...cleaning, context: { ...context, surface } }, NOW);
      expect(result.status).toBe("blocked");
      expect(result.blockers).toContain("not_authenticated_native_kross");
    }
  });
  it("stops a mark attributed to an unverified operator or unmapped room", () => {
    const result = preflightKrossNativeAction({ ...cleaning, context: { ...context, roomMappingVerified: false }, markedByAuthenticatedStaff: false }, NOW);
    expect(result.blockers).toEqual(expect.arrayContaining(["clean_mark_not_confirmed", "physical_room_mapping_not_verified"]));
  });
  it("rejects invalid calendar days rather than normalizing them", () => {
    const result = preflightKrossNativeAction({
      ...cleaning,
      context: { ...context, sourceAsOf: "2026-02-30T20:01:00Z" },
    }, NOW);
    expect(result.status).toBe("blocked");
    expect(result.blockers).toContain("native_state_not_current");
  });
  it("blocks native data older than the acceptance window", () => {
    const result = preflightKrossNativeAction({ ...cleaning, context: { ...context, sourceAsOf: "2026-10-23T20:01:00Z" } }, NOW);
    expect(result.blockers).toContain("native_state_not_current");
  });
  it("prepares a traceable card receipt for a pilot but never posts it", () => {
    const result = preflightKrossNativeAction(payment, NOW);
    expect(result.status).toBe("pilot_prepared");
    expect(result.next).toBe("prepare_governed_writer_pilot");
    expect(result.pmsWriteAuthorizedByThisPreflight).toBe(false);
    expect(result.bankReconciled).toBe(false);
    expect(result.alegraPosted).toBe(false);
  });
  it("requires distinct evidence for cash, transfer and Wink", () => {
    expect(preflightKrossNativeAction({ ...payment, method: "CASH", evidenceLevel: "processor_authorized" }, NOW).blockers)
      .toContain("payment_method_evidence_not_adequate");
    expect(preflightKrossNativeAction({ ...payment, method: "CASH", evidenceLevel: "cash_count_ack" }, NOW).status)
      .toBe("pilot_prepared");
    expect(preflightKrossNativeAction({ ...payment, method: "WINK", evidenceLevel: "reported" }, NOW).status)
      .toBe("blocked");
    expect(preflightKrossNativeAction({ ...payment, method: "WINK", evidenceLevel: "bank_posted" }, NOW).status)
      .toBe("pilot_prepared");
  });
  it("does not post uncertain, duplicated or amountless receipts", () => {
    const r = preflightKrossNativeAction({ ...payment, matchingPaymentAlreadyExists: true, amount: 0 }, NOW);
    expect(r.status).toBe("blocked");
    expect(r.blockers).toEqual(expect.arrayContaining(["invalid_native_amount", "duplicate_or_uncertain_native_payment"]));
  });
  it("prepares an internal note only with native version, privacy review and no guest notification", () => {
    const result = preflightKrossNativeAction(note, NOW);
    expect(result.status).toBe("pilot_prepared");
    expect(result.pmsWriteAuthorizedByThisPreflight).toBe(false);
    expect(result.bankReconciled).toBe(false);
  });
  it("blocks public, unreviewed and side-effect-unknown notes", () => {
    const result = preflightKrossNativeAction({ ...note, audience: "guest_visible", contentReviewedByAuthorizedRole: false, guestNotificationDisabledVerified: false }, NOW);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "note_audience_not_verified_internal",
      "note_privacy_review_missing",
      "guest_notification_side_effect_unknown",
    ]));
  });
  it("does not treat a user name or phone as sufficient capability", () => {
    const result = preflightKrossNativeAction({ ...payment, context: { ...context, roleVerified: false } }, NOW);
    expect(result.status).toBe("blocked");
    expect(result.blockers).toContain("native_actor_or_read_capability_unverified");
  });
  it("never returns payment data or reservation identifiers in result or logs", () => {
    const result = preflightKrossNativeAction({ ...note, context: { ...context, nativeObjectReference: "synthetic-kross-sensitive" } }, NOW);
    expect(JSON.stringify(result)).not.toContain("synthetic-kross-sensitive");
  });
});
