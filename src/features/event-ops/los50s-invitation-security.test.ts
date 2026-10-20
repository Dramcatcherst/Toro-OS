import { describe, expect, it } from "vitest";

import {
  evaluateLos50sInvitation,
  hashLos50sInviteToken,
  nextLos50sInviteState,
  prepareLos50sInvitation,
  LOS50S_EVENT_KEY,
} from "./los50s-invitation-security";

const pepper = "this-is-a-test-only-nonproduction-secret-with-more-than-32-characters";
const now = new Date("2026-10-07T18:00:00.000Z");
const orgId = "test-dreamcatcher-organization";

function invite() {
  return prepareLos50sInvitation({
    orgId,
    participantRef: "fictional-person-ref",
    pepper,
    now,
    ttlSeconds: 3600,
  });
}

describe("Los 50s invitation and identity security contract", () => {
  it("issues opaque 256-bit invite tokens and stores only HMAC", () => {
    const first = invite();
    const second = invite();
    expect(first.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second.token).not.toBe(first.token);
    expect(first.record.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(first.record.tokenHash).not.toBe(first.token);
    expect(first.record.state).toBe("issued");
    expect(first.record.eventKey).toBe(LOS50S_EVENT_KEY);
  });

  it("lets token holder request additional identity verification but not gain membership", () => {
    const { token, record } = invite();
    const result = evaluateLos50sInvitation(token, record, pepper, orgId, now);
    expect(result).toEqual({
      canRequestVerification: true,
      reason: "verification_required",
    });
    expect(nextLos50sInviteState("issued", { type: "token_claimed" }))
      .toBe("claimed_pending_verification");
  });

  it("rejects tampered tokens, wrong organization and other event scope", () => {
    const { token, record } = invite();
    expect(evaluateLos50sInvitation(token.slice(0, -1) + ".", record, pepper, orgId, now)
      .canRequestVerification).toBe(false);
    expect(evaluateLos50sInvitation(token, record, pepper, "other-org", now)
      .canRequestVerification).toBe(false);
    expect(evaluateLos50sInvitation(token, { ...record, eventKey: "different-event" }, pepper, orgId, now)
      .canRequestVerification).toBe(false);
  });

  it("rejects expired, already claimed, revoked or missing invitation rows", () => {
    const { token, record } = invite();
    expect(evaluateLos50sInvitation(token, record, pepper, orgId,
      new Date("2026-10-07T19:00:00.000Z")).canRequestVerification).toBe(false);
    for (const state of ["claimed_pending_verification", "verified", "revoked", "expired"] as const) {
      expect(evaluateLos50sInvitation(token, { ...record, state }, pepper, orgId, now)
        .canRequestVerification).toBe(false);
    }
    expect(evaluateLos50sInvitation(token, null, pepper, orgId, now)
      .canRequestVerification).toBe(false);
  });

  it("enforces strong secret, valid TTL and scope", () => {
    expect(() => hashLos50sInviteToken(invite().token, "weak")).toThrow();
    expect(() => prepareLos50sInvitation({ orgId, participantRef: "x", pepper, ttlSeconds: 30 })).toThrow();
    expect(() => prepareLos50sInvitation({ orgId: "", participantRef: "x", pepper })).toThrow();
  });

  it("requires a TORO verified person and receipt before identity can become verified", () => {
    expect(() => nextLos50sInviteState("issued", {
      type: "identity_verified", verifiedToroPersonId: "user", receiptId: "receipt",
    })).toThrow();
    expect(() => nextLos50sInviteState("claimed_pending_verification", {
      type: "identity_verified", verifiedToroPersonId: "", receiptId: "receipt",
    })).toThrow();
    expect(() => nextLos50sInviteState("claimed_pending_verification", {
      type: "identity_verified", verifiedToroPersonId: "user", receiptId: "",
    })).toThrow();
    expect(nextLos50sInviteState("claimed_pending_verification", {
      type: "identity_verified", verifiedToroPersonId: "verified-toro-person", receiptId: "receipt-123",
    })).toBe("verified");
  });

  it("can revoke an issued, claimed, or verified invite but cannot reactivate it by claiming", () => {
    for (const state of ["issued","claimed_pending_verification","verified"] as const) {
      expect(nextLos50sInviteState(state, { type: "revoked" })).toBe("revoked");
    }
    expect(() => nextLos50sInviteState("revoked", { type: "token_claimed" })).toThrow();
  });

  it("fails closed on replay or token state corruption", () => {
    expect(() => nextLos50sInviteState("claimed_pending_verification", {
      type: "token_claimed",
    })).toThrow("invalid_invitation_transition");
    expect(() => nextLos50sInviteState("verified", {
      type: "token_claimed",
    })).toThrow("invalid_invitation_transition");
  });
});
