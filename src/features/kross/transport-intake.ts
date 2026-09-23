export type KrossTransportKind =
  | "api"
  | "webhook"
  | "scheduled_export"
  | "browser_artifact"
  | "other";

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

  if (!nonEmpty(input.providerName)) {
    issues.push({ key: "provider", message: "Provider name is required." });
  }
  if (!nonEmpty(input.ticketReference)) {
    issues.push({ key: "ticket", message: "Ticket/reference is required." });
  }
  if (!input.readOnlyConfirmed) {
    issues.push({
      key: "read_only",
      message: "Read-only behavior must be explicitly confirmed.",
    });
  }
  if (!input.authorizedByProvider) {
    issues.push({
      key: "provider_authorization",
      message: "Provider authorization for the transport is required.",
    });
  }
  if (!input.sourceTimestampAvailable) {
    issues.push({
      key: "source_timestamp",
      message: "The transport must expose a source timestamp or equivalent freshness evidence.",
    });
  }
  if (!input.externalReservationIdentityAvailable) {
    issues.push({
      key: "reservation_identity",
      message: "A stable external reservation identity is required.",
    });
  }

  if (input.billableActivationRequired === null) {
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
    (!input.exportFrequencyMinutes || input.exportFrequencyMinutes <= 0)
  ) {
    issues.push({
      key: "export_frequency",
      message: "Scheduled export frequency must be known.",
    });
  }

  const reservationTransport =
    input.reservationsSupported ||
    input.currentStaysSupported ||
    input.arrivalsDeparturesSupported;

  const reservationPreparation =
    reservationTransport &&
    input.readOnlyConfirmed &&
    input.authorizedByProvider &&
    input.sourceTimestampAvailable &&
    input.externalReservationIdentityAvailable;

  const rateAvailabilityPreparation =
    (input.liveRatesSupported || input.liveAvailabilitySupported) &&
    input.readOnlyConfirmed &&
    input.authorizedByProvider &&
    input.sourceTimestampAvailable;

  if (reservationTransport && !input.fieldMapReady) {
    issues.push({
      key: "field_map",
      message: "Official payload/documentation must be mapped before first reservation read.",
    });
  }

  const noUnknownBilling = input.billableActivationRequired !== null;
  const readyForFirstAuthorizedRead =
    reservationPreparation &&
    input.fieldMapReady &&
    input.approvedForFirstRead &&
    noUnknownBilling &&
    issues.every(
      (issue) =>
        ![
          "provider",
          "ticket",
          "read_only",
          "provider_authorization",
          "source_timestamp",
          "reservation_identity",
          "billing_unknown",
          "billing_detail",
          "export_frequency",
          "field_map",
        ].includes(issue.key),
    );

  return {
    validForReservationReadPreparation: reservationPreparation,
    validForRateAvailabilityPreparation: rateAvailabilityPreparation,
    readyForFirstAuthorizedRead,
    issues,
  };
}
