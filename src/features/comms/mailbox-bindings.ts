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
  // Resolved by the authoritative scope graph, not inferred from the address.
  // The draft binding table has no business_id yet, so live reads fail closed.
  businessId: string | null;
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

export const TORO_MAIL_METADATA_READ_CAPABILITY = "comms.mail.metadata.read";

/** Server-issued, scoped decision. Never construct this from request parameters. */
export type ToroMailboxMetadataReadGrant = {
  capability: typeof TORO_MAIL_METADATA_READ_CAPABILITY;
  actorId: string;
  orgId: string;
  businessId: string;
  propertyId: string | null;
  bindingId: string;
  provider: string;
  status: "active" | "revoked";
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

export function mailboxBindingHealth(
  binding: ToroMailboxBinding,
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
    binding.authStatus !== "connected" ||
    binding.verificationStatus === "unverified"
  ) {
    return "unverified";
  }

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
  grant?: ToroMailboxMetadataReadGrant | null,
) {
  return Boolean(
    context.mode === "organization" &&
      typeof context.userId === "string" &&
      context.userId.length > 0 &&
      context.orgId &&
      context.orgId === binding.orgId &&
      context.membership?.status === "active" &&
      context.membership.orgId === binding.orgId &&
      context.canUseOrganizationData &&
      !context.requiresContextChoice &&
      binding.businessId &&
      grant?.capability === TORO_MAIL_METADATA_READ_CAPABILITY &&
      grant.status === "active" &&
      grant.actorId === context.userId &&
      grant.orgId === binding.orgId &&
      grant.businessId === binding.businessId &&
      grant.propertyId === binding.propertyId &&
      grant.bindingId === binding.id &&
      grant.provider === binding.provider &&
      binding.verificationStatus === "verified" &&
      isMailboxBindingReadable(binding),
  );
}

export function projectMailboxBindingStatus(
  binding: ToroMailboxBinding,
): ToroMailboxStatusProjection {
  return {
    id: binding.id,
    endpoint: binding.normalizedEndpoint,
    provider: binding.provider,
    endpointKind: binding.endpointKind,
    businessRole: binding.businessRole,
    readable: isMailboxBindingReadable(binding),
    health: mailboxBindingHealth(binding),
    verificationStatus: binding.verificationStatus,
    lastSyncAt: binding.lastSyncAt,
    lastEventAt: binding.lastEventAt,
    errorCode: binding.lastErrorCode,
  };
}
