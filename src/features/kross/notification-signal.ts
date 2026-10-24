import { createHash } from "node:crypto";

/**
 * Read-only Kross/WeSpeak notification guard. An alert is not PMS authority.
 * The calling trusted ingress must attest transport and resolve scope.
 */
export type NotificationSignalSource =
  | "kross_email"
  | "wespeak_email"
  | "kross_android_notification"
  | "kross_provider_webhook";

export type NotificationSignalKind =
  | "reservation_created"
  | "reservation_updated"
  | "reservation_cancelled"
  | "housekeeping_cleaned"
  | "guest_request"
  | "payment_notice";

export type NotificationSignal = {
  scope: { orgId: string; propertyId: string };
  source: NotificationSignalSource;
  kind: NotificationSignalKind;
  eventReference: string;
  receivedAt: string;
  sourceEventAt: string | null;
  sourcePackage?: string | null;
  transportVerified: boolean;
  scopeVerified: boolean;
  providerEventContractVerified?: boolean;
  reservationReference?: string | null;
  physicalRoomReference?: string | null;
};

export type NotificationSignalResult = {
  state: "signal_only" | "quarantined";
  reasons: string[];
  dedupeKey: string | null;
  freshness: "recent" | "old" | "unknown";
  requiresAuthoritativeRead: true;
  canMarkRoomClean: false;
  canMarkRoomReady: false;
  canConfirmReservation: false;
  canRecordPayment: false;
  canSendMessage: false;
};

const SOURCES = ["kross_email", "wespeak_email", "kross_android_notification", "kross_provider_webhook"] as const;
const KINDS = ["reservation_created", "reservation_updated", "reservation_cancelled", "housekeeping_cleaned", "guest_request", "payment_notice"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeKey(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 256 &&
    !/[\r\n\x00-\x1f@]/.test(value) ? value.trim() : null;
}

function timestamp(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return Number.NaN;
  }
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : Number.NaN;
}

const restricted: Omit<NotificationSignalResult, "state" | "reasons" | "dedupeKey" | "freshness"> = {
  requiresAuthoritativeRead: true,
  canMarkRoomClean: false,
  canMarkRoomReady: false,
  canConfirmReservation: false,
  canRecordPayment: false,
  canSendMessage: false,
};

export function evaluateNotificationSignal(raw: unknown, nowIso: string): NotificationSignalResult {
  const reasons: string[] = [];
  const data = isRecord(raw) ? raw : {};
  const scope = isRecord(data.scope) ? data.scope : {};
  const source = SOURCES.find(x => x === data.source);
  const kind = KINDS.find(x => x === data.kind);
  const orgId = safeKey(scope.orgId);
  const propertyId = safeKey(scope.propertyId);
  const eventReference = safeKey(data.eventReference);
  const now = timestamp(nowIso);
  const receivedAt = timestamp(data.receivedAt);
  const sourceEventAt = data.sourceEventAt == null ? Number.NaN : timestamp(data.sourceEventAt);

  if (!source) reasons.push("unsupported_source");
  if (!kind) reasons.push("unsupported_kind");
  if (!orgId || !propertyId || data.scopeVerified !== true) reasons.push("unverified_scope");
  if (!eventReference) reasons.push("missing_opaque_event_reference");
  if (data.transportVerified !== true) reasons.push("unverified_transport");
  if (!Number.isFinite(now) || !Number.isFinite(receivedAt) || receivedAt > now) reasons.push("invalid_receipt_time");
  if (data.sourceEventAt != null && (!Number.isFinite(sourceEventAt) ||
       (Number.isFinite(now) && sourceEventAt > now) ||
       (Number.isFinite(receivedAt) && sourceEventAt > receivedAt + 120000))) {
    reasons.push("invalid_source_time");
  }
  if (source === "kross_android_notification" && data.sourcePackage !== "com.krossbookingx") {
    reasons.push("android_package_not_allowlisted");
  }
  if (source === "kross_provider_webhook" && data.providerEventContractVerified !== true) {
    reasons.push("webhook_contract_unverified");
  }
  if (source === "wespeak_email" && kind && kind !== "guest_request") {
    reasons.push("source_kind_mismatch");
  }
  if (source !== "wespeak_email" && kind === "guest_request") {
    reasons.push("source_kind_mismatch");
  }

  const freshness: NotificationSignalResult["freshness"] =
    !Number.isFinite(now) || !Number.isFinite(receivedAt) || !Number.isFinite(sourceEventAt)
      ? "unknown"
      : now - sourceEventAt > 24 * 60 * 60 * 1000 ? "old" : "recent";

  return {
    ...restricted,
    state: reasons.length ? "quarantined" : "signal_only",
    reasons,
    // Never guess that email and push describe the same reservation or guest.
    dedupeKey: reasons.length || !source || !kind || !orgId || !propertyId || !eventReference
      ? null : createHash("sha256").update(JSON.stringify([orgId, propertyId, source, eventReference, kind])).digest("hex"),
    freshness,
  };
}
