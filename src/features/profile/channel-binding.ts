import "server-only";

import { timingSafeEqual } from "node:crypto";

import type { Subject } from "./effective-profile";

export type ChannelBindingRecord = {
  bindingKey: string;
  subject: Subject;
  transport: "whatsapp" | "portal";
  runtime: "openclaw" | "portal";
  channelAccountKey: string;
  senderKeyDigest: string;
  status: "verified" | "unverified" | "revoked";
  organizationId: string | null;
  propertyIds: string[];
  verifiedAt: string;
  expiresAt: string;
};

export type ChannelBindingRequest = {
  transport: ChannelBindingRecord["transport"];
  runtime: ChannelBindingRecord["runtime"];
  channelAccountKey: string;
  senderKeyDigest: string;
  now: string;
};

export type ChannelBindingFailure =
  | "invalid_request"
  | "binding_not_found"
  | "binding_ambiguous"
  | "binding_not_verified"
  | "binding_expired";

export type ChannelBindingResult =
  | { ok: true; binding: Omit<ChannelBindingRecord, "senderKeyDigest"> }
  | { ok: false; reason: ChannelBindingFailure };

const DIGEST = /^[a-f0-9]{64}$/;

function parseTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sameDigest(left: string, right: string) {
  if (!DIGEST.test(left) || !DIGEST.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

/**
 * Resolves an already HMAC-pseudonymized channel sender to exactly one
 * canonical TORO subject. The HMAC key remains in the runtime secret boundary;
 * raw phone numbers, emails and device identifiers must never enter records.
 */
export function resolveCanonicalChannelBinding(
  records: readonly ChannelBindingRecord[],
  request: ChannelBindingRequest,
): ChannelBindingResult {
  const now = parseTimestamp(request.now);
  if (
    now === null ||
    !request.channelAccountKey ||
    !DIGEST.test(request.senderKeyDigest)
  ) {
    return { ok: false, reason: "invalid_request" };
  }

  const matches = records.filter((record) =>
    record.transport === request.transport &&
    record.runtime === request.runtime &&
    record.channelAccountKey === request.channelAccountKey &&
    sameDigest(record.senderKeyDigest, request.senderKeyDigest),
  );
  if (matches.length === 0) return { ok: false, reason: "binding_not_found" };
  if (matches.length !== 1) return { ok: false, reason: "binding_ambiguous" };

  const [record] = matches;
  if (record.status !== "verified") return { ok: false, reason: "binding_not_verified" };
  const verifiedAt = parseTimestamp(record.verifiedAt);
  const expiresAt = parseTimestamp(record.expiresAt);
  if (verifiedAt === null || expiresAt === null || verifiedAt > now || expiresAt <= now) {
    return { ok: false, reason: "binding_expired" };
  }

  return {
    ok: true,
    binding: {
      bindingKey: record.bindingKey,
      subject: record.subject,
      transport: record.transport,
      runtime: record.runtime,
      channelAccountKey: record.channelAccountKey,
      status: record.status,
      organizationId: record.organizationId,
      propertyIds: [...new Set(record.propertyIds)].sort(),
      verifiedAt: record.verifiedAt,
      expiresAt: record.expiresAt,
    },
  };
}
