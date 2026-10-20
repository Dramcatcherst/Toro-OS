import { describe, expect, it } from "vitest";

import {
  authorizeLos50sMember,
  canBindLos50sInviteToUser,
  type Los50sMemberContext,
} from "./los50s-member-authorization";

const base: Los50sMemberContext = {
  userId: "user-a",
  orgId: "org-dreamcatcher",
  eventKey: "los50s-caro-2026",
  inviteState: "verified",
  member: {
    orgId: "org-dreamcatcher",
    eventKey: "los50s-caro-2026",
    participantRef: "participant-a",
    userId: "user-a",
    role: "participant",
    status: "active",
    guardianUserId: null,
    verifiedAt: "2026-10-07T18:00:00.000Z",
    verificationReceiptId: "receipt-a",
  },
};

describe("Los 50s event member authorization", () => {
  it("allows a verified participant to use community capabilities", () => {
    expect(authorizeLos50sMember(base, "community.read")).toBe(true);
    expect(authorizeLos50sMember(base, "community.post")).toBe(true);
    expect(authorizeLos50sMember(base, "community.react")).toBe(true);
  });

  it("denies unverified invite, revoked member and identity mismatch", () => {
    expect(authorizeLos50sMember({ ...base, inviteState: "claimed_pending_verification" }, "community.read")).toBe(false);
    expect(authorizeLos50sMember({ ...base, member: { ...base.member!, status: "revoked" } }, "community.read")).toBe(false);
    expect(authorizeLos50sMember({ ...base, userId: "attacker" }, "community.read")).toBe(false);
  });

  it("prevents cross-event and cross-organization access", () => {
    expect(authorizeLos50sMember(base, "community.read", {
      orgId: "other-org", eventKey: base.eventKey,
    })).toBe(false);
    expect(authorizeLos50sMember(base, "community.read", {
      orgId: base.orgId, eventKey: "other-event",
    })).toBe(false);
  });

  it("allows self profile and room access only to the same user", () => {
    expect(authorizeLos50sMember(base, "profile.self.write", {
      orgId: base.orgId, eventKey: base.eventKey, ownerUserId: "user-a",
    })).toBe(true);
    expect(authorizeLos50sMember(base, "profile.self.write", {
      orgId: base.orgId, eventKey: base.eventKey, ownerUserId: "user-b",
    })).toBe(false);
    expect(authorizeLos50sMember(base, "rooms.self.read", {
      orgId: base.orgId, eventKey: base.eventKey, ownerUserId: "user-b",
    })).toBe(false);
  });

  it("does not grant admin to ordinary participant", () => {
    expect(authorizeLos50sMember(base, "event.admin")).toBe(false);
  });

  it("limits minor management to the verified family leader who is the guardian", () => {
    const leader: Los50sMemberContext = {
      ...base,
      member: { ...base.member!, role: "family_leader" },
    };
    expect(authorizeLos50sMember(leader, "minor.manage", {
      orgId: base.orgId, eventKey: base.eventKey, guardianUserId: "user-a",
    })).toBe(true);
    expect(authorizeLos50sMember(leader, "minor.manage", {
      orgId: base.orgId, eventKey: base.eventKey, guardianUserId: "user-b",
    })).toBe(false);
  });

  it("requires auth user, participant, verified TORO person and receipt to bind", () => {
    expect(canBindLos50sInviteToUser({
      inviteState: "claimed_pending_verification",
      authenticatedUserId: "auth-user",
      participantRef: "participant",
      verifiedToroPersonRef: "toro-person",
      verificationReceiptId: "receipt",
    })).toBe(true);
    expect(canBindLos50sInviteToUser({
      inviteState: "claimed_pending_verification",
      authenticatedUserId: "auth-user",
      participantRef: "participant",
      verifiedToroPersonRef: null,
      verificationReceiptId: "receipt",
    })).toBe(false);
    expect(canBindLos50sInviteToUser({
      inviteState: "issued",
      authenticatedUserId: "auth-user",
      participantRef: "participant",
      verifiedToroPersonRef: "toro-person",
      verificationReceiptId: "receipt",
    })).toBe(false);
  });
});
