import { createHmac } from "node:crypto";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const CHANNEL = /^[a-z][a-z0-9_]{1,31}$/;
const CONNECTION = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;

export type ToroChannelActor = {
  orgId: string;
  userId: string;
  employeeId: string | null;
  identityId: string;
};

export type ToroChannelSession = ToroChannelActor & {
  id: string;
  bindingId: string;
  conversationHash: string;
  status: "active" | "closed" | "revoked";
  activeScope: "work_org";
  humanLayerVersion: string;
  humanLayerHash: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type ToroChannelSessionDraft = ToroChannelActor & {
  bindingId: string;
  conversationHash: string;
  activeScope: "work_org";
  humanLayerVersion: string;
  humanLayerHash: string;
  expiresAt: string;
};

export type ToroChannelSessionValidation =
  | { ok: true; value: ToroChannelSessionDraft }
  | { ok: false; error: string };

export type ToroChannelReceiptDraft = {
  sessionId: string;
  bindingId: string;
  orgId: string;
  direction: "inbound" | "outbound";
  eventKind:
    | "message"
    | "ack"
    | "action"
    | "result"
    | "error"
    | "reminder";
  idempotencyHash: string;
  canonicalObjectType: string | null;
  canonicalObjectKey: string | null;
};

function validIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !value.includes("T")) return false;
  return Number.isFinite(Date.parse(value));
}

function validActor(actor: ToroChannelActor) {
  return (
    UUID.test(actor.orgId) &&
    UUID.test(actor.userId) &&
    UUID.test(actor.identityId) &&
    (actor.employeeId === null || UUID.test(actor.employeeId))
  );
}

export function deriveChannelLocatorHash(input: {
  channel: string;
  connectionKey: string;
  locator: string;
  secret: string;
}) {
  const channel = input.channel.trim().toLowerCase();
  const connectionKey = input.connectionKey.trim();
  const locator = input.locator.trim();

  if (
    !CHANNEL.test(channel) ||
    !CONNECTION.test(connectionKey) ||
    !locator ||
    locator.length > 512 ||
    input.secret.length < 32
  ) {
    throw new Error("Invalid channel locator input.");
  }

  return createHmac("sha256", input.secret)
    .update(`${channel}\0${connectionKey}\0${locator}`, "utf8")
    .digest("hex");
}

export function validateChannelSessionDraft(
  input: unknown,
): ToroChannelSessionValidation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Session must be an object." };
  }

  const value = input as Partial<ToroChannelSessionDraft>;
  if (
    typeof value.orgId !== "string" ||
    typeof value.userId !== "string" ||
    typeof value.identityId !== "string" ||
    (value.employeeId !== null && typeof value.employeeId !== "string") ||
    !validActor({
      orgId: value.orgId,
      userId: value.userId,
      identityId: value.identityId,
      employeeId: value.employeeId,
    })
  ) {
    return { ok: false, error: "Canonical actor identifiers are invalid." };
  }

  if (
    typeof value.bindingId !== "string" ||
    !UUID.test(value.bindingId) ||
    typeof value.conversationHash !== "string" ||
    !SHA256.test(value.conversationHash)
  ) {
    return { ok: false, error: "Channel binding or conversation hash is invalid." };
  }

  if (value.activeScope !== "work_org") {
    return { ok: false, error: "Initial channel sessions require work_org scope." };
  }

  if (
    typeof value.humanLayerVersion !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{2,63}$/.test(value.humanLayerVersion) ||
    typeof value.humanLayerHash !== "string" ||
    !SHA256.test(value.humanLayerHash)
  ) {
    return { ok: false, error: "Human Layer provenance is invalid." };
  }

  if (!validIsoTimestamp(value.expiresAt)) {
    return { ok: false, error: "Session expiry is invalid." };
  }

  // Project only validated contract fields. Do not retain the input object or
  // transport payloads that may contain private content or credentials.
  return {
    ok: true,
    value: {
      orgId: value.orgId,
      userId: value.userId,
      employeeId: value.employeeId,
      identityId: value.identityId,
      bindingId: value.bindingId,
      conversationHash: value.conversationHash,
      activeScope: value.activeScope,
      humanLayerVersion: value.humanLayerVersion,
      humanLayerHash: value.humanLayerHash,
      expiresAt: value.expiresAt,
    },
  };
}

export function canResumeChannelSession(
  session: ToroChannelSession,
  actor: ToroChannelActor,
  nowIso: string,
) {
  if (
    !validActor(actor) ||
    session.status !== "active" ||
    session.revokedAt !== null ||
    session.activeScope !== "work_org" ||
    !validIsoTimestamp(session.expiresAt) ||
    !validIsoTimestamp(nowIso) ||
    Date.parse(session.expiresAt) <= Date.parse(nowIso)
  ) {
    return false;
  }

  return (
    session.orgId === actor.orgId &&
    session.userId === actor.userId &&
    session.employeeId === actor.employeeId &&
    session.identityId === actor.identityId
  );
}

export function buildChannelReceiptDraft(input: {
  sessionId: string;
  bindingId: string;
  orgId: string;
  direction: ToroChannelReceiptDraft["direction"];
  eventKind: ToroChannelReceiptDraft["eventKind"];
  externalMessageId: string;
  secret: string;
  canonicalObjectType?: string | null;
  canonicalObjectKey?: string | null;
}): ToroChannelReceiptDraft {
  if (
    !UUID.test(input.sessionId) ||
    !UUID.test(input.bindingId) ||
    !UUID.test(input.orgId)
  ) {
    throw new Error("Canonical receipt identifiers are invalid.");
  }

  // TypeScript types do not validate data received at runtime.
  if (
    (input.direction !== "inbound" && input.direction !== "outbound") ||
    !["message", "ack", "action", "result", "error", "reminder"].includes(
      input.eventKind,
    )
  ) {
    throw new Error("Receipt direction or event kind is invalid.");
  }

  const type = input.canonicalObjectType?.trim() || null;
  const key = input.canonicalObjectKey?.trim() || null;
  if ((type === null) !== (key === null)) {
    throw new Error("Canonical object type and key must be supplied together.");
  }
  if (
    (type && !/^[a-z][a-z0-9_.:-]{2,127}$/.test(type)) ||
    (key && key.length > 256)
  ) {
    throw new Error("Canonical object reference is invalid.");
  }

  return {
    sessionId: input.sessionId,
    bindingId: input.bindingId,
    orgId: input.orgId,
    direction: input.direction,
    eventKind: input.eventKind,
    idempotencyHash: deriveChannelLocatorHash({
      channel: "receipt",
      connectionKey: input.bindingId,
      locator: input.externalMessageId,
      secret: input.secret,
    }),
    canonicalObjectType: type,
    canonicalObjectKey: key,
  };
}

/** Minimal pointers only. Commercial truth must be reread from its authority. */
export type ToroExperienceContinuationState = {
  schemaVersion: 1;
  workflow: "experience_request";
  requestId: string;
  requestVersion: string;
  quoteId: string | null;
  quoteVersion: string | null;
};

const EXPERIENCE_CONTINUATION_KEYS = [
  "schemaVersion", "workflow", "requestId", "requestVersion", "quoteId", "quoteVersion",
] as const;

export function validateExperienceContinuationState(input: unknown):
  | { ok: true; value: ToroExperienceContinuationState }
  | { ok: false; error: string } {
  const invalid = { ok: false as const, error: "Invalid experience continuation." };
  if (!input || typeof input !== "object" || Array.isArray(input)) return invalid;
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return invalid;
  const descriptors = Object.getOwnPropertyDescriptors(input);
  if (Reflect.ownKeys(input).length !== EXPERIENCE_CONTINUATION_KEYS.length) return invalid;
  if (!EXPERIENCE_CONTINUATION_KEYS.every((key) => {
    const descriptor = descriptors[key];
    return descriptor && "value" in descriptor && descriptor.enumerable;
  })) return invalid;

  // Read only data descriptors: never execute an accessor supplied by a caller.
  const row = Object.fromEntries(EXPERIENCE_CONTINUATION_KEYS.map((key) => [key, descriptors[key].value]));
  if (row.schemaVersion !== 1 || row.workflow !== "experience_request" ||
      typeof row.requestId !== "string" || !UUID.test(row.requestId) ||
      typeof row.requestVersion !== "string" || !SHA256.test(row.requestVersion)) return invalid;
  if ((row.quoteId === null) !== (row.quoteVersion === null)) return invalid;
  if (row.quoteId !== null && (typeof row.quoteId !== "string" || !UUID.test(row.quoteId) ||
      typeof row.quoteVersion !== "string" || !SHA256.test(row.quoteVersion))) return invalid;

  return { ok: true, value: {
    schemaVersion: 1,
    workflow: "experience_request",
    requestId: row.requestId,
    requestVersion: row.requestVersion,
    quoteId: row.quoteId,
    quoteVersion: row.quoteVersion,
  } };
}

/** Normalized authorized read, not a declaration of the database's column names. */
export type ToroExperienceRequestRead = {
  id: string;
  orgId: string;
  version: string;
  status: "open" | "closed" | "cancelled";
  quote: { id: string; version: string; expiresAt: string } | null;
};

export type ToroExperienceContinuationResume =
  | { status: "DENIED" | "UNAVAILABLE" | "STALE" | "INVALID_CONTINUATION" |
      "CLOSED" | "REFRESH_REQUIRED" | "REQUOTE_REQUIRED" }
  | {
      status: "READY_TO_RESUME";
      continuation: ToroExperienceContinuationState;
      bookingAuthorized: false;
      paymentAuthorized: false;
      requiresCommercialRevalidation: true;
    };

function validZonedTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  if (!Number.isFinite(Date.parse(value))) return false;
  // Date.parse normalizes some impossible calendar dates; reject that normalization.
  const calendarDay = Date.parse(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(calendarDay) && new Date(calendarDay).toISOString().slice(0, 10) === value.slice(0, 10);
}

/**
 * Owner/staff direct-message read preflight. No writes, messages, booking or payment.
 * trustedAccess MUST come from the reviewed server identity/policy/transport boundary,
 * never from a chat, model output or request body. This helper cannot authenticate it.
 * request MUST be a fresh, scoped canonical read with a deterministic version digest.
 * A consumer still needs a governed compare-and-swap writer and commercial revalidation.
 */
export function prepareExperienceContinuationResume(input: {
  session: ToroChannelSession;
  actor: ToroChannelActor;
  nowIso: string;
  trustedAccess: {
    channelKind: "direct" | "group";
    identityVerified: boolean;
    membershipActive: boolean;
    canReadRequest: boolean;
    bindingId: string;
    conversationHash: string;
  };
  sourceHealthy: boolean;
  sourceFresh: boolean;
  request: ToroExperienceRequestRead | null;
  continuation: unknown;
}): ToroExperienceContinuationResume {
  if (!input || !input.session || !input.actor || !input.trustedAccess) return { status: "DENIED" };
  const access = input.trustedAccess;
  if (access.channelKind !== "direct" || access.identityVerified !== true ||
      access.membershipActive !== true || access.canReadRequest !== true ||
      !validZonedTimestamp(input.nowIso) || !validZonedTimestamp(input.session.expiresAt) ||
      typeof input.session.id !== "string" || !UUID.test(input.session.id) ||
      typeof access.bindingId !== "string" || !UUID.test(access.bindingId) ||
      typeof access.conversationHash !== "string" || !SHA256.test(access.conversationHash) ||
      input.session.bindingId !== access.bindingId || input.session.conversationHash !== access.conversationHash ||
      !canResumeChannelSession(input.session, input.actor, input.nowIso)) return { status: "DENIED" };

  if (input.sourceHealthy !== true) return { status: "UNAVAILABLE" };
  if (input.sourceFresh !== true) return { status: "STALE" };
  const parsed = validateExperienceContinuationState(input.continuation);
  if (!parsed.ok) return { status: "INVALID_CONTINUATION" };
  const state = parsed.value;
  const request = input.request;
  if (!request || request.orgId !== input.actor.orgId || request.id !== state.requestId) return { status: "DENIED" };
  if (typeof request.version !== "string" || !SHA256.test(request.version) ||
      !["open", "closed", "cancelled"].includes(request.status)) return { status: "UNAVAILABLE" };
  if (request.status !== "open") return { status: "CLOSED" };
  if (request.version !== state.requestVersion) return { status: "REFRESH_REQUIRED" };

  const quote = request.quote;
  if (quote !== null && (!quote || typeof quote.id !== "string" || !UUID.test(quote.id) ||
      typeof quote.version !== "string" || !SHA256.test(quote.version) || !validZonedTimestamp(quote.expiresAt))) return { status: "UNAVAILABLE" };
  if ((quote?.id ?? null) !== state.quoteId || (quote?.version ?? null) !== state.quoteVersion ||
      (quote !== null && Date.parse(quote.expiresAt) <= Date.parse(input.nowIso))) return { status: "REQUOTE_REQUIRED" };

  return {
    status: "READY_TO_RESUME",
    continuation: state,
    bookingAuthorized: false,
    paymentAuthorized: false,
    requiresCommercialRevalidation: true,
  };
}
