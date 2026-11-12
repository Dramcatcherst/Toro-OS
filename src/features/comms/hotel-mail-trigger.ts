import { parseSingleMailAddress, toroMailMessageKey } from "./mail-message-identity";

export type HotelMailDepartment =
  | "reception"
  | "management"
  | "finance"
  | "systems"
  | "none";

export type HotelMailSignal =
  | "reservation_candidate"
  | "reservation_change_candidate"
  | "guest_prearrival_update"
  | "guest_attention"
  | "payment_review"
  | "security_alert"
  | "system_alert"
  | "informational"
  | "unclassified";

export type HotelMailTriggerInput = {
  /** Stable physical provider mailbox identity; aliases share this key, connector sessions do not own it. */
  physicalAccountRef: string;
  providerMessageId: string;
  from: string;
  subject: string;
  snippet?: string;
  labels?: readonly string[];
};

export type HotelMailTrigger = {
  signal: HotelMailSignal;
  department: HotelMailDepartment;
  attention: "critical" | "today" | "review" | "informational";
  visualQueue: boolean;
  gmailLabels: string[];
  reservationGate:
    | "kross_read_reconciliation_required"
    | "kross_source_observation"
    | "not_applicable";
  canMutateReservation: false;
  dedupeKey: string;
};

function normalized(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(value: string, terms: readonly string[]) {
  return terms.some((term) => value.includes(term));
}

function trigger(
  input: HotelMailTriggerInput,
  value: Omit<HotelMailTrigger, "canMutateReservation" | "dedupeKey">,
): HotelMailTrigger {
  const dedupeKey = toroMailMessageKey({ provider: "gmail", physicalAccountRef: input.physicalAccountRef, providerMessageId: input.providerMessageId });
  if (!dedupeKey) throw new Error("Hotel mail requires verified account and native message IDs.");
  return { ...value, canMutateReservation: false, dedupeKey };
}

/**
 * Converts hotel-mail metadata into a visual work queue. This classifier never
 * writes Kross: reservation-like mail is only a reconciliation candidate.
 */
export function classifyHotelMailTrigger(
  input: HotelMailTriggerInput,
): HotelMailTrigger {
  const sender = parseSingleMailAddress(input.from) ?? "";
  const senderDomain = sender.split("@")[1] ?? "";
  const content = normalized(`${input.subject} ${input.snippet ?? ""}`);
  const labels = new Set(input.labels ?? []);

  const isSecurity = includesAny(content, [
    "new sign-in",
    "new login",
    "reset your password",
    "password reset",
    "security alert",
    "inicio de sesion",
    "restablecer tu contrasena",
  ]);
  if (isSecurity) {
    return trigger(input, {
      signal: "security_alert",
      department: "management",
      attention: "critical",
      visualQueue: true,
      gmailLabels: ["30 · SEGURIDAD"],
      reservationGate: "not_applicable",
    });
  }

  if (sender === "notifications@github.com" || sender === "notifications@vercel.com") {
    const providerLabel = sender === "notifications@github.com"
      ? "40.1 · GITHUB / CI"
      : "40.2 · VERCEL / DEPLOYS";
    return trigger(input, {
      signal: "system_alert",
      department: "systems",
      attention: includesAny(content, ["failed", "failure", "error"]) ? "today" : "review",
      visualQueue: true,
      gmailLabels: ["40 · SISTEMAS", providerLabel],
      reservationGate: "not_applicable",
    });
  }

  if (includesAny(content, ["comprobante", "payment proof", "payment", "pago", "terminal", "recibo"])) {
    return trigger(input, {
      signal: "payment_review",
      department: "finance",
      attention: "today",
      visualQueue: true,
      gmailLabels: ["20 · FINANZAS", "20.2 · FACTURAS / RECIBOS"],
      reservationGate: "not_applicable",
    });
  }

  const isKross = senderDomain === "krossbooking.com";
  if (
    isKross &&
    includesAny(content, ["guest portal", "checklist completion", "online check-in"])
  ) {
    return trigger(input, {
      signal: "guest_prearrival_update",
      department: "reception",
      attention: "today",
      visualQueue: true,
      gmailLabels: ["10 · HUÉSPEDES & RESERVAS"],
      reservationGate: "kross_source_observation",
    });
  }

  // Exact mailbox/domain hints classify metadata only; they never authenticate a sender.
  const isReservationSource = ["booking.com", "airbnb.com", "expedia.com"].includes(senderDomain) ||
    sender === "notifications@wespeak.news";
  const isReservationChange = includesAny(content, [
    "cancelacion",
    "cancellation",
    "modificacion de reserva",
    "reservation modification",
    "change reservation",
  ]);
  if (isReservationSource && isReservationChange) {
    return trigger(input, {
      signal: "reservation_change_candidate",
      department: "reception",
      attention: "critical",
      visualQueue: true,
      gmailLabels: ["00 · URGENTE", "10 · HUÉSPEDES & RESERVAS"],
      reservationGate: "kross_read_reconciliation_required",
    });
  }

  const isReservationCandidate =
    isReservationSource &&
    includesAny(content, [
      "new reservation",
      "nueva reserva",
      "booking confirmation",
      "reservation confirmation",
      "realizar reserva",
      "desea reservar",
    ]);
  if (isReservationCandidate) {
    return trigger(input, {
      signal: "reservation_candidate",
      department: "reception",
      attention: "critical",
      visualQueue: true,
      gmailLabels: ["00 · URGENTE", "10 · HUÉSPEDES & RESERVAS"],
      reservationGate: "kross_read_reconciliation_required",
    });
  }

  if (sender === "notifications@wespeak.news") {
    return trigger(input, {
      signal: "guest_attention",
      department: "reception",
      attention: "today",
      visualQueue: true,
      gmailLabels: ["10 · HUÉSPEDES & RESERVAS"],
      reservationGate: "kross_read_reconciliation_required",
    });
  }

  if (labels.has("CATEGORY_PROMOTIONS")) {
    return trigger(input, {
      signal: "informational",
      department: "none",
      attention: "informational",
      visualQueue: false,
      gmailLabels: ["90 · AUTOMÁTICO / LECTURA"],
      reservationGate: "not_applicable",
    });
  }

  return trigger(input, {
    signal: "unclassified",
    department: "management",
    attention: "review",
    visualQueue: true,
    gmailLabels: ["02 · SEGUIMIENTO"],
    reservationGate: "not_applicable",
  });
}
