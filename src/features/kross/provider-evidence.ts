import {
  evaluateKrossTransportIntake,
  type KrossTransportIntake,
  type KrossTransportIntakeResult,
  type KrossTransportKind,
  isKrossTransportKind,
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
  exportFrequencyMinutes?: KrossEvidenceClaim<number | null>;
};

export type KrossProviderEvidenceIssue = {
  key: string;
  message: string;
};

export type KrossProviderEvidenceResult = {
  observedAt: string | null;
  intake: KrossTransportIntake;
  intakeEvaluation: KrossTransportIntakeResult;
  evidenceIssues: KrossProviderEvidenceIssue[];
  explicitEvidenceCoverage: number;
  readyForFirstAuthorizedRead: boolean;
};

function nonEmpty(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasEvidence(claim: unknown) {
  return record(claim) && Object.hasOwn(claim, "evidenceReference") &&
    typeof claim.evidenceReference === "string" && nonEmpty(claim.evidenceReference);
}

function readClaim(key: string, claim: unknown, issues: KrossProviderEvidenceIssue[]) {
  if (!record(claim) || !Object.hasOwn(claim, "value") || !Object.hasOwn(claim, "evidenceReference") ||
    (claim.evidenceReference !== null && typeof claim.evidenceReference !== "string")) {
    issues.push({ key, message: `${key} requires a valid claim and evidence reference field.` });
    return null;
  }
  return claim;
}

function evidenceTime(value: unknown) {
  if (typeof value !== "string") return Number.NaN;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59) return Number.NaN;
  const calendar = Date.parse(`${match[1]}T00:00:00Z`);
  if (!Number.isFinite(calendar) || new Date(calendar).toISOString().slice(0, 10) !== match[1]) return Number.NaN;
  return Date.parse(value);
}

function guardedBoolean(
  key: string,
  rawClaim: unknown,
  issues: KrossProviderEvidenceIssue[],
) {
  const claim = readClaim(key, rawClaim, issues);
  if (!claim) return false;
  if (typeof claim.value !== "boolean") {
    issues.push({ key, message: `${key} must be a boolean.` });
    return false;
  }
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
  rawClaim: unknown,
  issues: KrossProviderEvidenceIssue[],
) {
  const claim = readClaim(key, rawClaim, issues);
  if (!claim) return null;
  if (claim.value !== null && typeof claim.value !== "boolean") {
    issues.push({ key, message: `${key} must be a boolean or unknown.` });
    return null;
  }
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
  rawClaim: unknown,
  issues: KrossProviderEvidenceIssue[],
) {
  const claim = readClaim(key, rawClaim, issues);
  if (!claim) return null;
  if (claim.value !== null && typeof claim.value !== "string") {
    issues.push({ key, message: `${key} must be text or unknown.` });
    return null;
  }
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
  claim: unknown,
  issues: KrossProviderEvidenceIssue[],
) {
  const value = guardedText(key, claim, issues);
  if (!value) {
    issues.push({ key, message: `${key} is required.` });
    return "";
  }
  return value;
}

function guardedTransportKind(
  rawClaim: unknown,
  issues: KrossProviderEvidenceIssue[],
) {
  const claim = readClaim("transport_kind", rawClaim, issues);
  if (!claim) return "other" as const;
  if (!isKrossTransportKind(claim.value)) {
    issues.push({ key: "transport_kind", message: "transportKind must identify a supported transport kind." });
    return "other" as const;
  }
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
  rawPacket: unknown,
  nowIso: string,
): KrossProviderEvidenceResult {
  const evidenceIssues: KrossProviderEvidenceIssue[] = [];
  const packet = record(rawPacket) ? rawPacket : {};
  const nowMs = evidenceTime(nowIso);
  const observedMs = evidenceTime(packet.observedAt);
  if (!Number.isFinite(nowMs)) {
    evidenceIssues.push({ key: "evaluation_time", message: "A valid explicit evaluation timestamp is required." });
  }
  if (!Number.isFinite(observedMs) || (Number.isFinite(nowMs) && observedMs > nowMs)) {
    evidenceIssues.push({ key: "observed_at", message: "Provider observation must have a valid timestamp and cannot be future." });
  }

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

  if (intake.transportKind === "scheduled_export" || packet.exportFrequencyMinutes !== undefined) {
    const frequency = readClaim("export_frequency", packet.exportFrequencyMinutes, evidenceIssues);
    if (frequency && typeof frequency.value === "number" && Number.isFinite(frequency.value) && frequency.value > 0 && hasEvidence(frequency)) {
      intake.exportFrequencyMinutes = frequency.value;
    } else if (frequency && (frequency.value !== null || intake.transportKind === "scheduled_export")) {
      evidenceIssues.push({ key: "export_frequency", message: "Export frequency requires an evidenced finite positive number." });
    }
  }

  const intakeEvaluation = evaluateKrossTransportIntake(intake);

  const evidenceClaims: unknown[] = [
    packet.providerName,
    packet.ticketReference,
    packet.transportKind,
    packet.readOnlyConfirmed,
    packet.authorizedByProvider,
    packet.billableActivationRequired,
    packet.setupFee,
    packet.recurringFee,
    packet.otherFees,
    packet.documentationReference,
    packet.credentialScopeSummary,
    packet.reservationsSupported,
    packet.currentStaysSupported,
    packet.arrivalsDeparturesSupported,
    packet.liveRatesSupported,
    packet.liveAvailabilitySupported,
    packet.sourceTimestampAvailable,
    packet.externalReservationIdentityAvailable,
    packet.fieldMapReady,
    packet.approvedForFirstRead,
  ];
  if (packet.exportFrequencyMinutes !== undefined) evidenceClaims.push(packet.exportFrequencyMinutes);

  const explicitEvidenceCoverage =
    evidenceClaims.length === 0
      ? 0
      : evidenceClaims.filter((claim) => hasEvidence(claim)).length /
        evidenceClaims.length;

  return {
    observedAt: Number.isFinite(observedMs) ? packet.observedAt as string : null,
    intake,
    intakeEvaluation,
    evidenceIssues,
    explicitEvidenceCoverage,
    readyForFirstAuthorizedRead:
      evidenceIssues.length === 0 &&
      intakeEvaluation.readyForFirstAuthorizedRead,
  };
}
