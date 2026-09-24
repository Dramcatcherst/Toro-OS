import {
  evaluateKrossTransportIntake,
  type KrossTransportIntake,
  type KrossTransportIntakeResult,
  type KrossTransportKind,
} from "./transport-intake";

export type KrossEvidenceClaim<T> = {
  value: T;
  evidenceReference: string | null;
};

export type KrossProviderEvidencePacket = {
  observedAt: string;
  providerName: KrossEvidenceClaim<string>;
  ticketReference: KrossEvidenceClaim<string>;
  transportKind: KrossEvidenceClaim<KrossTransportKind>;
  readOnlyConfirmed: KrossEvidenceClaim<boolean>;
  authorizedByProvider: KrossEvidenceClaim<boolean>;
  billableActivationRequired: KrossEvidenceClaim<boolean | null>;
  setupFee: KrossEvidenceClaim<string | null>;
  recurringFee: KrossEvidenceClaim<string | null>;
  otherFees: KrossEvidenceClaim<string | null>;
  documentationReference: KrossEvidenceClaim<string | null>;
  credentialScopeSummary: KrossEvidenceClaim<string | null>;
  reservationsSupported: KrossEvidenceClaim<boolean>;
  currentStaysSupported: KrossEvidenceClaim<boolean>;
  arrivalsDeparturesSupported: KrossEvidenceClaim<boolean>;
  liveRatesSupported: KrossEvidenceClaim<boolean>;
  liveAvailabilitySupported: KrossEvidenceClaim<boolean>;
  sourceTimestampAvailable: KrossEvidenceClaim<boolean>;
  externalReservationIdentityAvailable: KrossEvidenceClaim<boolean>;
  fieldMapReady: KrossEvidenceClaim<boolean>;
  approvedForFirstRead: KrossEvidenceClaim<boolean>;
};

export type KrossProviderEvidenceIssue = {
  key: string;
  message: string;
};

export type KrossProviderEvidenceResult = {
  intake: KrossTransportIntake;
  intakeEvaluation: KrossTransportIntakeResult;
  evidenceIssues: KrossProviderEvidenceIssue[];
  explicitEvidenceCoverage: number;
  readyForFirstAuthorizedRead: boolean;
};

function nonEmpty(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasEvidence<T>(claim: KrossEvidenceClaim<T>) {
  return nonEmpty(claim.evidenceReference);
}

function guardedBoolean(
  key: string,
  claim: KrossEvidenceClaim<boolean>,
  issues: KrossProviderEvidenceIssue[],
) {
  if (claim.value === true && !hasEvidence(claim)) {
    issues.push({
      key,
      message: `${key}=true requires an explicit evidence reference.`,
    });
    return false;
  }
  return claim.value;
}

function guardedNullableBoolean(
  key: string,
  claim: KrossEvidenceClaim<boolean | null>,
  issues: KrossProviderEvidenceIssue[],
) {
  if (claim.value !== null && !hasEvidence(claim)) {
    issues.push({
      key,
      message: `${key} requires an explicit evidence reference when known.`,
    });
    return null;
  }
  return claim.value;
}

function guardedText(
  key: string,
  claim: KrossEvidenceClaim<string | null>,
  issues: KrossProviderEvidenceIssue[],
) {
  if (nonEmpty(claim.value) && !hasEvidence(claim)) {
    issues.push({
      key,
      message: `${key} requires an explicit evidence reference when populated.`,
    });
    return null;
  }
  return claim.value && claim.value.trim() ? claim.value.trim() : null;
}

function guardedRequiredText(
  key: string,
  claim: KrossEvidenceClaim<string>,
  issues: KrossProviderEvidenceIssue[],
) {
  const value = claim.value.trim();
  if (!value) {
    issues.push({ key, message: `${key} is required.` });
    return "";
  }
  if (!hasEvidence(claim)) {
    issues.push({
      key,
      message: `${key} requires an explicit evidence reference.`,
    });
    return "";
  }
  return value;
}

function guardedTransportKind(
  claim: KrossEvidenceClaim<KrossTransportKind>,
  issues: KrossProviderEvidenceIssue[],
) {
  if (!hasEvidence(claim)) {
    issues.push({
      key: "transport_kind",
      message: "transportKind requires an explicit evidence reference.",
    });
    return "other" as const;
  }
  return claim.value;
}

export function buildKrossTransportIntakeFromProviderEvidence(
  packet: KrossProviderEvidencePacket,
): KrossProviderEvidenceResult {
  const evidenceIssues: KrossProviderEvidenceIssue[] = [];

  const intake: KrossTransportIntake = {
    providerName: guardedRequiredText(
      "provider_name",
      packet.providerName,
      evidenceIssues,
    ),
    ticketReference: guardedRequiredText(
      "ticket_reference",
      packet.ticketReference,
      evidenceIssues,
    ),
    transportKind: guardedTransportKind(
      packet.transportKind,
      evidenceIssues,
    ),
    readOnlyConfirmed: guardedBoolean(
      "read_only",
      packet.readOnlyConfirmed,
      evidenceIssues,
    ),
    authorizedByProvider: guardedBoolean(
      "provider_authorization",
      packet.authorizedByProvider,
      evidenceIssues,
    ),
    billableActivationRequired: guardedNullableBoolean(
      "billing_status",
      packet.billableActivationRequired,
      evidenceIssues,
    ),
    setupFee: guardedText("setup_fee", packet.setupFee, evidenceIssues),
    recurringFee: guardedText(
      "recurring_fee",
      packet.recurringFee,
      evidenceIssues,
    ),
    otherFees: guardedText("other_fees", packet.otherFees, evidenceIssues),
    documentationReference: guardedText(
      "documentation_reference",
      packet.documentationReference,
      evidenceIssues,
    ),
    credentialScopeSummary: guardedText(
      "credential_scope",
      packet.credentialScopeSummary,
      evidenceIssues,
    ),
    reservationsSupported: guardedBoolean(
      "reservations_supported",
      packet.reservationsSupported,
      evidenceIssues,
    ),
    currentStaysSupported: guardedBoolean(
      "current_stays_supported",
      packet.currentStaysSupported,
      evidenceIssues,
    ),
    arrivalsDeparturesSupported: guardedBoolean(
      "arrivals_departures_supported",
      packet.arrivalsDeparturesSupported,
      evidenceIssues,
    ),
    liveRatesSupported: guardedBoolean(
      "live_rates_supported",
      packet.liveRatesSupported,
      evidenceIssues,
    ),
    liveAvailabilitySupported: guardedBoolean(
      "live_availability_supported",
      packet.liveAvailabilitySupported,
      evidenceIssues,
    ),
    sourceTimestampAvailable: guardedBoolean(
      "source_timestamp",
      packet.sourceTimestampAvailable,
      evidenceIssues,
    ),
    externalReservationIdentityAvailable: guardedBoolean(
      "reservation_identity",
      packet.externalReservationIdentityAvailable,
      evidenceIssues,
    ),
    fieldMapReady: guardedBoolean(
      "field_map",
      packet.fieldMapReady,
      evidenceIssues,
    ),
    approvedForFirstRead: guardedBoolean(
      "first_read_approval",
      packet.approvedForFirstRead,
      evidenceIssues,
    ),
    webhookEvents: [],
    exportFrequencyMinutes: null,
  };

  const intakeEvaluation = evaluateKrossTransportIntake(intake);

  const evidenceClaims = Object.values(packet).filter(
    (value): value is KrossEvidenceClaim<unknown> =>
      Boolean(value) &&
      typeof value === "object" &&
      "evidenceReference" in value,
  );

  const explicitEvidenceCoverage =
    evidenceClaims.length === 0
      ? 0
      : evidenceClaims.filter((claim) => hasEvidence(claim)).length /
        evidenceClaims.length;

  return {
    intake,
    intakeEvaluation,
    evidenceIssues,
    explicitEvidenceCoverage,
    readyForFirstAuthorizedRead:
      evidenceIssues.length === 0 &&
      intakeEvaluation.readyForFirstAuthorizedRead,
  };
}
