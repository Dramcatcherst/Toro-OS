import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * TORO-internal invitation primitives for the Los 50s pilot.
 * They DO NOT authenticate the recipient, send WhatsApp messages,
 * persist a claim or grant membership. A verified TORO actor and
 * a transactional, audited persistence layer are required.
 */
export const LOS50S_EVENT_KEY = "los50s-caro-2026";
const INVITE_CONTEXT = "TORO:los50s:invitation:v1";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const MIN_SECRET_LENGTH = 32;
const MAX_TTL_SECONDS = 7 * 24 * 3600;
const MIN_TTL_SECONDS = 10 * 60;

export type Los50sInviteState =
  | "issued"
  | "claimed_pending_verification"
  | "verified"
  | "revoked"
  | "expired";

export type Los50sInvitationRecord = {
  orgId: string;
  eventKey: string;
  participantRef: string;
  tokenHash: string;
  state: Los50sInviteState;
  expiresAt: string;
};

export function hashLos50sInviteToken(
  token: string,
  pepper: string,
  eventKey: string = LOS50S_EVENT_KEY,
): string {
  if (!TOKEN_PATTERN.test(token)) {
    throw new Error("invalid_invite_token_format");
  }
  if (pepper.length < MIN_SECRET_LENGTH) {
    throw new Error("missing_or_weak_invite_pepper");
  }
  if (!eventKey || eventKey.length > 128) {
    throw new Error("invalid_event_key");
  }
  return createHmac("sha256", pepper)
    .update(INVITE_CONTEXT)
    .update("\0")
    .update(eventKey)
    .update("\0")
    .update(token)
    .digest("hex");
}

/**
 * Only invoke inside an admin-approved server workflow.
 * Do not log or persist the raw token. Store only tokenHash with
 * an audited invitation row; send the token to the intended person
 * only after TORO Identity/Comms validation and owner approval.
 */
export function prepareLos50sInvitation(input: {
  orgId: string;
  participantRef: string;
  pepper: string;
  now?: Date;
  ttlSeconds?: number;
}) {
  const { orgId, participantRef, pepper } = input;
  if (!orgId?.trim() || !participantRef?.trim()) {
    throw new Error("missing_invitation_scope");
  }
  const ttlSeconds = input.ttlSeconds ?? 86400;
  if (
    !Number.isInteger(ttlSeconds) ||
    ttlSeconds < MIN_TTL_SECONDS ||
    ttlSeconds > MAX_TTL_SECONDS
  ) {
    throw new Error("invalid_invitation_ttl");
  }
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) {
    throw new Error("invalid_invitation_time");
  }
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashLos50sInviteToken(token, pepper);
  const record: Los50sInvitationRecord = {
    orgId,
    eventKey: LOS50S_EVENT_KEY,
    participantRef,
    tokenHash,
    state: "issued",
    expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
  };
  return { token, record };
}

/**
 * Token possession is NOT proof of the human's identity. This check
 * only authorizes continuing a controlled verification process.
 * A database transaction must atomically consume the issued state.
 */
export function evaluateLos50sInvitation(
  token: string,
  record: Los50sInvitationRecord | null,
  pepper: string,
  expectedOrgId: string,
  now: Date = new Date(),
): { canRequestVerification: boolean; reason: string } {
  if (!record || record.state !== "issued") {
    return { canRequestVerification: false, reason: "not_issued" };
  }
  if (
    record.eventKey !== LOS50S_EVENT_KEY ||
    record.orgId !== expectedOrgId ||
    !record.participantRef ||
    !Number.isFinite(now.getTime()) ||
    !Number.isFinite(Date.parse(record.expiresAt)) ||
    now.getTime() >= Date.parse(record.expiresAt)
  ) {
    return { canRequestVerification: false, reason: "scope_or_expiry" };
  }
  if (!TOKEN_PATTERN.test(token) || !DIGEST_PATTERN.test(record.tokenHash)) {
    return { canRequestVerification: false, reason: "invalid_token" };
  }
  const supplied = Buffer.from(hashLos50sInviteToken(token, pepper), "hex");
  const expected = Buffer.from(record.tokenHash, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return { canRequestVerification: false, reason: "invalid_token" };
  }
  return { canRequestVerification: true, reason: "verification_required" };
}

/**
 * A claim is always pending, never automatically verified from a link.
 * Persist this transition atomically; do not use localStorage or client
 * supplied names/participant IDs to authorize writes.
 */
export function nextLos50sInviteState(
  state: Los50sInviteState,
  event:
    | { type: "token_claimed" }
    | { type: "identity_verified"; verifiedToroPersonId: string; receiptId: string }
    | { type: "revoked" }
    | { type: "expired" },
): Los50sInviteState {
  if (event.type === "revoked") return "revoked";
  if (event.type === "expired") return state === "issued" ? "expired" : state;
  if (event.type === "token_claimed") {
    if (state !== "issued") throw new Error("invalid_invitation_transition");
    return "claimed_pending_verification";
  }
  if (
    state !== "claimed_pending_verification" ||
    !event.verifiedToroPersonId.trim() ||
    !event.receiptId.trim()
  ) {
    throw new Error("missing_verified_identity_or_receipt");
  }
  return "verified";
}
