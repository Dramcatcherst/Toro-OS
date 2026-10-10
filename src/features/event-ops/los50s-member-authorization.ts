import type { Los50sInviteState } from "./los50s-invitation-security";

export type Los50sMemberRole =
  | "participant"
  | "family_leader"
  | "minor"
  | "event_coordinator";

export type Los50sMemberBinding = {
  orgId: string;
  eventKey: string;
  participantRef: string;
  userId: string;
  role: Los50sMemberRole;
  status: "active" | "revoked";
  guardianUserId: string | null;
  verifiedAt: string;
  verificationReceiptId: string;
};

export type Los50sMemberContext = {
  userId: string;
  orgId: string;
  eventKey: string;
  inviteState: Los50sInviteState;
  member: Los50sMemberBinding | null;
};

export type Los50sMemberCapability =
  | "community.read"
  | "community.post"
  | "community.react"
  | "profile.self.write"
  | "group.read"
  | "group.propose"
  | "minor.manage"
  | "rooms.self.read"
  | "event.admin";

const ROLE_CAPABILITIES: Record<Los50sMemberRole, readonly Los50sMemberCapability[]> = {
  participant: [
    "community.read",
    "community.post",
    "community.react",
    "profile.self.write",
    "group.read",
    "rooms.self.read",
  ],
  family_leader: [
    "community.read",
    "community.post",
    "community.react",
    "profile.self.write",
    "group.read",
    "group.propose",
    "minor.manage",
    "rooms.self.read",
  ],
  minor: [
    "community.read",
    "community.react",
  ],
  event_coordinator: [
    "community.read",
    "community.post",
    "community.react",
    "profile.self.write",
    "group.read",
    "group.propose",
    "minor.manage",
    "rooms.self.read",
    "event.admin",
  ],
};

export function authorizeLos50sMember(
  context: Los50sMemberContext | null,
  capability: Los50sMemberCapability,
  resource?: {
    orgId: string;
    eventKey: string;
    ownerUserId?: string | null;
    guardianUserId?: string | null;
  },
) {
  if (
    !context ||
    context.inviteState !== "verified" ||
    !context.member ||
    context.member.status !== "active" ||
    context.member.userId !== context.userId ||
    context.member.orgId !== context.orgId ||
    context.member.eventKey !== context.eventKey ||
    !context.member.verificationReceiptId
  ) {
    return false;
  }

  if (
    resource &&
    (resource.orgId !== context.orgId || resource.eventKey !== context.eventKey)
  ) {
    return false;
  }

  if (!ROLE_CAPABILITIES[context.member.role].includes(capability)) {
    return false;
  }

  if (capability === "profile.self.write" || capability === "rooms.self.read") {
    return !resource?.ownerUserId || resource.ownerUserId === context.userId;
  }

  if (capability === "minor.manage") {
    return Boolean(
      resource?.guardianUserId &&
      resource.guardianUserId === context.userId &&
      context.member.role === "family_leader",
    );
  }

  return true;
}

export function canBindLos50sInviteToUser(input: {
  inviteState: Los50sInviteState;
  authenticatedUserId: string | null;
  participantRef: string | null;
  verifiedToroPersonRef: string | null;
  verificationReceiptId: string | null;
}) {
  return Boolean(
    input.inviteState === "claimed_pending_verification" &&
    input.authenticatedUserId?.trim() &&
    input.participantRef?.trim() &&
    input.verifiedToroPersonRef?.trim() &&
    input.verificationReceiptId?.trim(),
  );
}
