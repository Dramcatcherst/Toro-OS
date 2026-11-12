import type { ToroResolvedContext } from "@/features/context/types";

export const TORO_MAILBOX_CHANNELS = ["email"] as const;
export type ToroMailboxChannel = (typeof TORO_MAILBOX_CHANNELS)[number];

export const TORO_MAILBOX_ENDPOINT_KINDS = [
  "user_mailbox",
  "alias",
  "group",
  "delegated_mailbox",
  "shared_mailbox",
  "routed_address",
  "unknown",
] as const;
export type ToroMailboxEndpointKind =
  (typeof TORO_MAILBOX_ENDPOINT_KINDS)[number];

export const TORO_MAILBOX_AUTH_STATUSES = [
  "unverified",
  "pending",
  "connected",
  "degraded",
  "revoked",
  "disconnected",
] as const;
export type ToroMailboxAuthStatus =
  (typeof TORO_MAILBOX_AUTH_STATUSES)[number];

export const TORO_MAILBOX_INGESTION_STATUSES = [
  "not_configured",
  "backfill_pending",
  "backfilling",
  "syncing",
  "healthy",
  "degraded",
  "paused",
] as const;
export type ToroMailboxIngestionStatus =
  (typeof TORO_MAILBOX_INGESTION_STATUSES)[number];

export const TORO_MAILBOX_VERIFICATION_STATUSES = [
  "unverified",
  "partial",
  "verified",
  "conflict",
] as const;
export type ToroMailboxVerificationStatus =
  (typeof TORO_MAILBOX_VERIFICATION_STATUSES)[number];

export type ToroMailboxBinding = {
  id: string;
  orgId: string;
  propertyId: string | null;
  channel: ToroMailboxChannel;
  provider: string;
  endpointKind: ToroMailboxEndpointKind;
  normalizedEndpoint: string;
  displayName: string | null;
  businessRole: string;
  authStatus: ToroMailboxAuthStatus;
  readEnabled: boolean;
  draftEnabled: boolean;
  sendEnabled: boolean;
  deleteEnabled: boolean;
  adminEnabled: boolean;
  ingestionStatus: ToroMailboxIngestionStatus;
  verificationStatus: ToroMailboxVerificationStatus;
  lastSyncAt: string | null;
  lastEventAt: string | null;
  lastErrorCode: string | null;
  active: boolean;
};

export type ToroMailboxHealth =
  | "healthy"
  | "degraded"
  | "unavailable"
  | "unverified";

export type ToroMailboxStatusProjection = {
  id: string;
  endpoint: string;
  provider: string;
  endpointKind: ToroMailboxEndpointKind;
  businessRole: string;
  readable: boolean;
  health: ToroMailboxHealth;
  verificationStatus: ToroMailboxVerificationStatus;
  lastSyncAt: string | null;
  lastEventAt: string | null;
  errorCode: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeMailboxEndpoint(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized) || normalized.length > 320) return null;
  return normalized;
}

/** Supplied by a trusted caller; health never substitutes for historical read authorization. */
export type ToroMailboxHealthPolicy = { nowMs: number; maxSyncAgeMs: number };

function syncTimestamp(value: string | null) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) return Number.NaN;
  const calendar = value.slice(0, 10);
  const midnight = Date.parse(`${calendar}T00:00:00Z`);
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== calendar) return Number.NaN;
  return Date.parse(value);
}

export function mailboxBindingHealth(
  binding: ToroMailboxBinding,
  policy: ToroMailboxHealthPolicy,
): ToroMailboxHealth {
  if (
    !binding.active ||
    binding.authStatus === "revoked" ||
    binding.authStatus === "disconnected"
  ) {
    return "unavailable";
  }

  if (
    binding.authStatus === "degraded" ||
    binding.ingestionStatus === "degraded" ||
    binding.ingestionStatus === "paused" ||
    binding.verificationStatus === "conflict" ||
    binding.lastErrorCode
  ) {
    return "degraded";
  }

  if (
    binding.channel !== "email" ||
    binding.authStatus !== "connected" ||
    binding.verificationStatus !== "verified" ||
    binding.ingestionStatus !== "healthy"
  ) {
    return "unverified";
  }

  const lastSyncAt = syncTimestamp(binding.lastSyncAt);
  if (!policy || !Number.isFinite(policy.nowMs) || !Number.isSafeInteger(policy.maxSyncAgeMs) ||
      policy.maxSyncAgeMs <= 0 || !Number.isFinite(lastSyncAt) || lastSyncAt > policy.nowMs ||
      policy.nowMs - lastSyncAt > policy.maxSyncAgeMs) return "degraded";
  return "healthy";
}

export function isMailboxBindingReadable(binding: ToroMailboxBinding) {
  if (!binding.active || binding.channel !== "email") return false;
  if (!binding.readEnabled || binding.authStatus !== "connected") return false;
  if (
    binding.ingestionStatus === "not_configured" ||
    binding.ingestionStatus === "paused"
  ) {
    return false;
  }
  if (
    binding.verificationStatus === "unverified" ||
    binding.verificationStatus === "conflict"
  ) {
    return false;
  }
  return true;
}

export function canUseMailboxBinding(
  context: ToroResolvedContext,
  binding: ToroMailboxBinding,
) {
  return Boolean(
    context.mode === "organization" &&
      context.userId && context.userId === context.userId.trim() &&
      context.orgId && context.orgId === context.orgId.trim() &&
      context.orgId === binding.orgId &&
      context.membership?.orgId === context.orgId &&
      context.allowedDataScopes.includes("work_org") &&
      context.membership?.status === "active" &&
      context.canUseOrganizationData &&
      !context.requiresContextChoice &&
      isMailboxBindingReadable(binding),
  );
}

export function projectMailboxBindingStatus(
  binding: ToroMailboxBinding,
  policy: ToroMailboxHealthPolicy,
): ToroMailboxStatusProjection {
  return {
    id: binding.id,
    endpoint: binding.normalizedEndpoint,
    provider: binding.provider,
    endpointKind: binding.endpointKind,
    businessRole: binding.businessRole,
    readable: isMailboxBindingReadable(binding),
    health: mailboxBindingHealth(binding, policy),
    verificationStatus: binding.verificationStatus,
    lastSyncAt: binding.lastSyncAt,
    lastEventAt: binding.lastEventAt,
    errorCode: binding.lastErrorCode,
  };
}
