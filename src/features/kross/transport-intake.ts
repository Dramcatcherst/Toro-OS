export type KrossTransportKind =
  | "api"
  | "webhook"
  | "scheduled_export"
  | "browser_artifact"
  | "other";

export function isKrossTransportKind(value: unknown): value is KrossTransportKind {
  return typeof value === "string" &&
    ["api", "webhook", "scheduled_export", "browser_artifact", "other"].includes(value);
}

export type KrossTransportIntake = {
  providerName: string;
  ticketReference: string;
  transportKind: KrossTransportKind;
  readOnlyConfirmed: boolean;
  authorizedByProvider: boolean;
  billableActivationRequired: boolean | null;
  setupFee: string | null;
  recurringFee: string | null;
  otherFees: string | null;
  documentationReference: string | null;
  credentialScopeSummary: string | null;
  reservationsSupported: boolean;
  currentStaysSupported: boolean;
  arrivalsDeparturesSupported: boolean;
  liveRatesSupported: boolean;
  liveAvailabilitySupported: boolean;
  webhookEvents?: string[];
  exportFrequencyMinutes?: number | null;
  sourceTimestampAvailable: boolean;
  externalReservationIdentityAvailable: boolean;
  fieldMapReady: boolean;
  approvedForFirstRead: boolean;
};

export type KrossTransportIntakeIssue = {
  key: string;
  message: string;
};

export type KrossTransportIntakeResult = {
  validForReservationReadPreparation: boolean;
  validForRateAvailabilityPreparation: boolean;
  readyForFirstAuthorizedRead: boolean;
  issues: KrossTransportIntakeIssue[];
};

function nonEmpty(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function evaluateKrossTransportIntake(
  input: KrossTransportIntake,
): KrossTransportIntakeResult {
  const issues: KrossTransportIntakeIssue[] = [];

  for (const key of [
    "readOnlyConfirmed", "authorizedByProvider", "reservationsSupported",
    "currentStaysSupported", "arrivalsDeparturesSupported", "liveRatesSupported",
    "liveAvailabilitySupported", "sourceTimestampAvailable",
    "externalReservationIdentityAvailable", "fieldMapReady", "approvedForFirstRead",
  ] as const) {
    if (typeof input[key] !== "boolean") {
      issues.push({ key: "invalid_boolean", message: `${key} must be explicitly boolean.` });
    }
  }
  const validTransportKind = isKrossTransportKind(input.transportKind);
  if (!validTransportKind) issues.push({ key: "transport_kind", message: "A supported transport kind is required." });

  if (!nonEmpty(input.providerName)) {
    issues.push({ key: "provider", message: "Provider name is required." });
  }
  if (!nonEmpty(input.ticketReference)) {
    issues.push({ key: "ticket", message: "Ticket/reference is required." });
  }
  if (input.readOnlyConfirmed !== true) {
    issues.push({
      key: "read_only",
      message: "Read-only behavior must be explicitly confirmed.",
    });
  }
  if (input.authorizedByProvider !== true) {
    issues.push({
      key: "provider_authorization",
      message: "Provider authorization for the transport is required.",
    });
  }
  if (input.sourceTimestampAvailable !== true) {
    issues.push({
      key: "source_timestamp",
      message: "The transport must expose a source timestamp or equivalent freshness evidence.",
    });
  }
  if (input.externalReservationIdentityAvailable !== true) {
    issues.push({
      key: "reservation_identity",
      message: "A stable external reservation identity is required.",
    });
  }

  const knownBilling = typeof input.billableActivationRequired === "boolean";
  if (!knownBilling) {
    issues.push({
      key: "billing_unknown",
      message: "Billing/activation cost status must be known before activation.",
    });
  }
  if (
    input.billableActivationRequired === true &&
    !nonEmpty(input.setupFee) &&
    !nonEmpty(input.recurringFee) &&
    !nonEmpty(input.otherFees)
  ) {
    issues.push({
      key: "billing_detail",
      message: "Billable activation requires documented fee details.",
    });
  }

  if (
    input.transportKind === "scheduled_export" &&
    (typeof input.exportFrequencyMinutes !== "number" || !Number.isFinite(input.exportFrequencyMinutes) || input.exportFrequencyMinutes <= 0)
  ) {
    issues.push({
      key: "export_frequency",
      message: "Scheduled export frequency must be known.",
    });
  }

  const reservationTransport =
    input.reservationsSupported === true ||
    input.currentStaysSupported === true ||
    input.arrivalsDeparturesSupported === true;

  const reservationPreparation =
    validTransportKind && reservationTransport &&
    input.readOnlyConfirmed === true &&
    input.authorizedByProvider === true &&
    input.sourceTimestampAvailable === true &&
    input.externalReservationIdentityAvailable === true;

  const rateAvailabilityPreparation =
    validTransportKind && (input.liveRatesSupported === true || input.liveAvailabilitySupported === true) &&
    input.readOnlyConfirmed === true &&
    input.authorizedByProvider === true &&
    input.sourceTimestampAvailable === true;

  if (reservationTransport && input.fieldMapReady !== true) {
    issues.push({
      key: "field_map",
      message: "Official payload/documentation must be mapped before first reservation read.",
    });
  }

  const readyForFirstAuthorizedRead =
    reservationPreparation &&
    input.fieldMapReady === true &&
    input.approvedForFirstRead === true &&
    knownBilling && issues.length === 0;

  return {
    validForReservationReadPreparation: reservationPreparation,
    validForRateAvailabilityPreparation: rateAvailabilityPreparation,
    readyForFirstAuthorizedRead,
    issues,
  };
}
