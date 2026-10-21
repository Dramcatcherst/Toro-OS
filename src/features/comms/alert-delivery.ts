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
  mail_financial_evidence: { room: "management", privacy: "restricted" },
  mail_guest_service: { room: "reception", privacy: "internal" },
  mail_security: { room: "management", privacy: "restricted" },
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

function eligibleBinding(binding: WhatsAppGroupBinding, room: ToroInternalRoom) {
  return (
    binding.active &&
    binding.channel === "whatsapp" &&
    binding.provider === "openclaw" &&
    binding.endpointKind === "group" &&
    binding.businessRole === roomBindingRole(room) &&
    binding.authStatus === "connected" &&
    binding.ingestionStatus === "healthy" &&
    binding.verificationStatus === "verified" &&
    binding.sendEnabled &&
    Boolean(binding.lastEventAt)
  );
}

export function prepareAlertDelivery(
  signal: AlertDeliverySignal,
  bindings: WhatsAppGroupBinding[],
): AlertDeliveryCandidate {
  const matches = bindings.filter((binding) => eligibleBinding(binding, signal.room));
  const blockers: string[] = [];
  if (matches.length === 0) blockers.push("verified_group_binding_missing");
  if (matches.length > 1) blockers.push("ambiguous_group_binding");
  const destination = matches.length === 1 ? matches[0] : null;
  return {
    status: blockers.length === 0 ? "ready" : "blocked",
    room: signal.room,
    privacy: signal.privacy,
    destinationBindingId: destination?.id ?? null,
    dedupeKey: [
      "alert-delivery-v1",
      destination?.id ?? roomBindingRole(signal.room),
      signal.sourceKind,
      signal.sourceKey,
      signal.version,
    ].join(":"),
    message: formatAlertDelivery(signal),
    blockers,
  };
}

export const TORO_MAIL_ALERT_CLASSES = [
  "financial_evidence",
  "guest_service",
  "security",
  "systems",
] as const;

export type ToroMailAlertClass = (typeof TORO_MAIL_ALERT_CLASSES)[number];
export type ToroMailAlertScope = "personal" | "organization";

export type ToroMailAlertInput = {
  scope: ToroMailAlertScope;
  accountId: string;
  providerMessageIdHash: string;
  privacyReviewed: boolean;
  alertClass: ToroMailAlertClass;
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
};

export type ToroMailAlertDeliveryDecision = {
  status: "ready" | "blocked";
  target: "owner_direct" | "reception_group" | "management_group";
  candidate: AlertDeliveryCandidate | null;
  blockers: string[];
};

const MAIL_ALERT_MODULE: Record<ToroMailAlertClass, string> = {
  financial_evidence: "mail_financial_evidence",
  guest_service: "mail_guest_service",
  security: "mail_security",
  systems: "systems",
};

function isSha256Reference(value: string) {
  return /^sha256:[a-f0-9]{64}$/.test(value);
}

/**
 * Converts a privacy-reviewed mail signal into the existing OpenClaw group
 * routing contract. Personal mail is intentionally never projected into hotel
 * groups; it needs a separately verified owner-direct transport.
 */
export function prepareToroMailAlertDelivery(
  input: ToroMailAlertInput,
  bindings: WhatsAppGroupBinding[],
): ToroMailAlertDeliveryDecision {
  if (input.scope === "personal") {
    return {
      status: "blocked",
      target: "owner_direct",
      candidate: null,
      blockers: ["verified_owner_direct_binding_missing"],
    };
  }

  const blockers: string[] = [];
  if (!input.privacyReviewed) blockers.push("privacy_review_required");
  if (!isSha256Reference(input.providerMessageIdHash)) {
    blockers.push("hashed_source_reference_required");
  }
  const target = input.alertClass === "guest_service"
    ? "reception_group" as const
    : "management_group" as const;
  if (blockers.length > 0) {
    return { status: "blocked", target, candidate: null, blockers };
  }

  const signal = moduleAlertSignal({
    moduleKey: MAIL_ALERT_MODULE[input.alertClass],
    alertKey: `${input.accountId}:${input.providerMessageIdHash}`,
    version: input.version,
    priority: input.priority,
    title: input.title,
    summary: input.summary,
    impact: input.impact,
    requiredAction: input.requiredAction,
    owner: input.owner,
    dueAt: input.dueAt,
    sourceSystem: input.sourceSystem,
    sourceCutoff: input.sourceCutoff,
    sourceRef: input.providerMessageIdHash,
  });
  const candidate = prepareAlertDelivery(signal, bindings);
  return {
    status: candidate.status,
    target,
    candidate,
    blockers: candidate.blockers,
  };
}

export type ToroMailAlertDeliveryReceipt = {
  receiptId: string;
  dedupeKey: string;
  destinationBindingId: string;
  providerStatus: "accepted" | "delivered" | "failed";
  attemptedAt: string;
  deliveredAt: string | null;
  readbackAt: string | null;
};

export function validateToroMailAlertDeliveryReceipt(
  decision: ToroMailAlertDeliveryDecision,
  receipt: ToroMailAlertDeliveryReceipt,
) {
  const errors: string[] = [];
  const candidate = decision.candidate;
  if (decision.status !== "ready" || !candidate?.destinationBindingId) {
    errors.push("delivery_candidate_not_ready");
  }
  if (!receipt.receiptId.trim()) errors.push("missing_receipt_id");
  if (!receipt.attemptedAt.trim()) errors.push("missing_attempt_time");
  if (candidate && receipt.dedupeKey !== candidate.dedupeKey) {
    errors.push("dedupe_key_mismatch");
  }
  if (
    candidate?.destinationBindingId &&
    receipt.destinationBindingId !== candidate.destinationBindingId
  ) {
    errors.push("destination_binding_mismatch");
  }
  if (receipt.providerStatus === "delivered") {
    if (!receipt.deliveredAt) errors.push("missing_delivery_time");
    if (!receipt.readbackAt) errors.push("missing_delivery_readback");
  }
  return {
    valid: errors.length === 0,
    deliveryVerified:
      errors.length === 0 &&
      receipt.providerStatus === "delivered" &&
      Boolean(receipt.deliveredAt) &&
      Boolean(receipt.readbackAt),
    errors,
  };
}
