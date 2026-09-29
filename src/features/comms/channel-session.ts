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

  return { ok: true, value: value as ToroChannelSessionDraft };
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
