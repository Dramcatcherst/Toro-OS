import { createHash } from "node:crypto";

import type { OwnerAttentionItem } from "@/features/attention/owner-attention";

export const TORO_INTERNAL_ROOMS = [
  "dreamteam",
  "operations",
  "reception",
  "maintenance",
  "management",
  "people",
] as const;

export type ToroInternalRoom = (typeof TORO_INTERNAL_ROOMS)[number];
export type AlertDeliveryPriority = "critical" | "high" | "normal";
export type AlertPrivacy = "internal" | "restricted";

export type AlertDeliverySignal = {
  orgId: string;
  sourceKind: "owner_attention" | "module_alert";
  sourceKey: string;
  version: string;
  room: ToroInternalRoom;
  privacy: AlertPrivacy;
  priority: AlertDeliveryPriority;
  title: string;
  summary: string;
  impact: string;
  requiredAction: string;
  owner: string;
  dueAt: string;
  sourceSystem: string;
  sourceCutoff: string;
  sourceRef: string;
};

export type WhatsAppGroupBinding = {
  orgId: string;
  scope: "organization" | "private" | "shared";
  privacy: AlertPrivacy;
  id: string;
  channel: string;
  provider: string;
  endpointKind: string;
  businessRole: string | null;
  authStatus: string;
  ingestionStatus: string;
  verificationStatus: string;
  sendEnabled: boolean;
  active: boolean;
  lastEventAt: string | null;
  /** Timestamp of a successful trusted health probe, never inferred from message traffic. */
  healthCheckedAt: string | null;
};

export type AlertDeliveryContext = {
  orgId: string;
  nowMs: number;
  /** Protected caller policy; this preparation helper does not invent a health window. */
  maxHealthAgeMs: number;
};

export type AlertDeliveryCandidate = {
  status: "ready" | "blocked";
  room: ToroInternalRoom;
  privacy: AlertPrivacy;
  destinationBindingId: string | null;
  dedupeKey: string;
  message: string;
  blockers: string[];
};

const MODULE_ROOM_POLICY: Record<
  string,
  { room: ToroInternalRoom; privacy: AlertPrivacy }
> = {
  contracts: { room: "management", privacy: "restricted" },
  distribution: { room: "management", privacy: "restricted" },
  finance_control: { room: "management", privacy: "restricted" },
  growth_reputation: { room: "management", privacy: "restricted" },
  payflow: { room: "management", privacy: "restricted" },
  people_hr: { room: "people", privacy: "restricted" },
  security_guard: { room: "management", privacy: "restricted" },
  sync_health: { room: "management", privacy: "restricted" },
  systems: { room: "management", privacy: "restricted" },
  utilities_sustainability: { room: "operations", privacy: "internal" },
};

const ROOM_LABELS: Record<ToroInternalRoom, string> = {
  dreamteam: "TORO DreamTeam",
  operations: "TORO Operación",
  reception: "TORO Recepción",
  maintenance: "TORO Mantenimiento",
  management: "TORO Gerencia",
  people: "TORO RRHH",
};

const PRIORITY_LABELS: Record<AlertDeliveryPriority, string> = {
  critical: "CRÍTICA",
  high: "ALTA",
  normal: "NORMAL",
};

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function clipWords(value: string, maxWords: number) {
  const words = clean(value).split(" ").filter(Boolean);
  return words.length <= maxWords
    ? words.join(" ")
    : `${words.slice(0, maxWords).join(" ")}…`;
}

function required(value: string, field: string) {
  if (!clean(value)) throw new Error(`Alert delivery requires ${field}.`);
  return clean(value);
}

export function roomBindingRole(room: ToroInternalRoom) {
  return `room:${room}`;
}

export function moduleAlertRoute(moduleKey: string) {
  return MODULE_ROOM_POLICY[moduleKey] ?? null;
}

export function ownerAttentionSignal(
  item: OwnerAttentionItem,
  details: {
    orgId: string;
    version: string;
    summary: string;
    impact: string;
    requiredAction: string;
    owner: string;
    dueAt: string;
    sourceCutoff: string;
  },
): AlertDeliverySignal {
  return {
    orgId: required(details.orgId, "organization"),
    sourceKind: "owner_attention",
    sourceKey: required(item.key, "source key"),
    version: required(details.version, "version"),
    room: "management",
    privacy: "restricted",
    priority: item.priority,
    title: required(item.title, "title"),
    summary: required(details.summary, "summary"),
    impact: required(details.impact, "impact"),
    requiredAction: required(details.requiredAction, "required action"),
    owner: required(details.owner, "owner"),
    dueAt: required(details.dueAt, "due time"),
    sourceSystem: required(item.sourceSystem, "source system"),
    sourceCutoff: required(details.sourceCutoff, "source cutoff"),
    sourceRef: required(item.dedupeRef, "source reference"),
  };
}

export function moduleAlertSignal(input: {
  orgId: string;
  moduleKey: string;
  alertKey: string;
  version: string;
  priority: AlertDeliveryPriority;
  title: string;
  summary: string;
  impact: string;
  requiredAction: string;
  owner: string;
  dueAt: string;
  sourceSystem: string;
  sourceCutoff: string;
  sourceRef: string;
}): AlertDeliverySignal {
  const route = moduleAlertRoute(input.moduleKey);
  if (!route) throw new Error("Module alert has no approved TORO room policy.");
  return {
    orgId: required(input.orgId, "organization"),
    sourceKind: "module_alert",
    sourceKey: required(input.alertKey, "source key"),
    version: required(input.version, "version"),
    room: route.room,
    privacy: route.privacy,
    priority: input.priority,
    title: required(input.title, "title"),
    summary: required(input.summary, "summary"),
    impact: required(input.impact, "impact"),
    requiredAction: required(input.requiredAction, "required action"),
    owner: required(input.owner, "owner"),
    dueAt: required(input.dueAt, "due time"),
    sourceSystem: required(input.sourceSystem, "source system"),
    sourceCutoff: required(input.sourceCutoff, "source cutoff"),
    sourceRef: required(input.sourceRef, "source reference"),
  };
}

export function formatAlertDelivery(signal: AlertDeliverySignal) {
  return [
    `🚨 ${PRIORITY_LABELS[signal.priority]} · ${ROOM_LABELS[signal.room]}`,
    `Asunto: ${clipWords(signal.title, 12)}`,
    `Qué pasó: ${clipWords(signal.summary, 18)}`,
    `Impacto: ${clipWords(signal.impact, 16)}`,
    `Acción: ${clipWords(signal.requiredAction, 18)}`,
    `Responsable: ${clipWords(signal.owner, 8)}`,
    `Plazo: ${clipWords(signal.dueAt, 10)}`,
    `Fuente/corte: ${clipWords(`${signal.sourceSystem} · ${signal.sourceCutoff}`, 14)}`,
    `Referencia: ${clipWords(signal.sourceRef, 8)}`,
  ].join("\n");
}

function healthTimestamp(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return Number.NaN;
  const calendar = value.slice(0, 10);
  const midnight = Date.parse(`${calendar}T00:00:00Z`);
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== calendar) return Number.NaN;
  return Date.parse(value);
}

function eligibleBinding(binding: WhatsAppGroupBinding, signal: AlertDeliverySignal, context: AlertDeliveryContext) {
  const checkedAt = healthTimestamp(binding.healthCheckedAt);
  return (
    binding.orgId === context.orgId &&
    binding.scope === "organization" &&
    (signal.privacy !== "restricted" || binding.privacy === "restricted") &&
    binding.active &&
    binding.channel === "whatsapp" &&
    binding.provider === "openclaw" &&
    binding.endpointKind === "group" &&
    binding.businessRole === roomBindingRole(signal.room) &&
    binding.authStatus === "connected" &&
    binding.ingestionStatus === "healthy" &&
    binding.verificationStatus === "verified" &&
    binding.sendEnabled &&
    Number.isFinite(checkedAt) &&
    checkedAt <= context.nowMs &&
    context.nowMs - checkedAt <= context.maxHealthAgeMs
  );
}

export function prepareAlertDelivery(
  signal: AlertDeliverySignal,
  bindings: WhatsAppGroupBinding[],
  context: AlertDeliveryContext,
): AlertDeliveryCandidate {
  const blockers: string[] = [];
  const contextValid = typeof context.orgId === "string" && context.orgId.trim().length > 0 &&
    context.orgId === context.orgId.trim() && Number.isFinite(context.nowMs) &&
    Number.isSafeInteger(context.maxHealthAgeMs) && context.maxHealthAgeMs > 0;
  if (!contextValid) blockers.push("delivery_context_invalid");
  if (!signal.orgId || signal.orgId !== context.orgId) blockers.push("alert_scope_mismatch");
  const matches = blockers.length ? [] : bindings.filter((binding) => eligibleBinding(binding, signal, context));
  if (matches.length === 0) blockers.push("verified_group_binding_missing");
  if (matches.length > 1) blockers.push("ambiguous_group_binding");
  const destination = matches.length === 1 ? matches[0] : null;
  return {
    status: blockers.length === 0 ? "ready" : "blocked",
    room: signal.room,
    privacy: signal.privacy,
    destinationBindingId: destination?.id ?? null,
    dedupeKey: "alert-delivery-v2:" + createHash("sha256").update(JSON.stringify([
      context.orgId,
      destination?.id ?? roomBindingRole(signal.room),
      signal.room,
      signal.privacy,
      signal.sourceKind,
      signal.sourceKey,
      signal.version,
    ])).digest("hex"),
    message: formatAlertDelivery(signal),
    blockers,
  };
}
