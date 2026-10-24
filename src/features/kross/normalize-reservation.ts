export type KrossTransportEvidence = {
  authorizedTransport: boolean;
  directFromKross: boolean;
  readOnly: boolean;
  sourceAsOf: string;
  observedAt: string;
  sourceReference: string;
  sourceHash: string;
};

export type KrossReservationCandidate = {
  orgId: string;
  propertyId: string;
  externalReservationId: string;
  reservationKey?: string | null;
  roomId?: string | null;
  roomCodeRaw?: string | null;
  checkIn: string;
  checkOut: string;
  status: string;
  guestsCount?: number | null;
  adults?: number | null;
  children?: number | null;
  channel?: string | null;
  breakfastIncluded?: boolean | null;
  mappingIssues?: ReadonlyArray<{ code: string; field?: string }>;
};

export type NormalizedKrossReservation = {
  org_id: string;
  property_id: string;
  external_reservation_id: string;
  reservation_key: string | null;
  room_id: string | null;
  room_code_raw: string | null;
  check_in: string;
  check_out: string;
  status: string;
  guests_count: number | null;
  adults: number | null;
  children: number | null;
  channel: string | null;
  breakfast_included: boolean | null;
  transactional_authority: "Kross";
  read_only_mirror: true;
  source_is_live: boolean;
  source_system: "Kross";
  source_table: "reservations";
  source_record_id: string;
  snapshot_as_of: string;
  last_synced_at: string;
  source_hash: string;
  data_quality_status: "verified" | "review";
};

export type KrossNormalizationIssue = {
  code:
    | "missing_external_id"
    | "missing_scope"
    | "missing_status"
    | "invalid_date"
    | "checkout_before_checkin"
    | "invalid_now"
    | "observation_before_source"
    | "stale_source_time"
    | "stale_observed_time"
    | "source_mapping_issue"
    | "invalid_guest_count"
    | "inconsistent_guest_count"
    | "invalid_breakfast_entitlement"
    | "future_source_time"
    | "future_observed_time"
    | "missing_source_hash"
    | "missing_source_reference"
    | "transport_not_authorized"
    | "transport_not_direct"
    | "transport_not_read_only";
  message: string;
};

export type KrossNormalizationResult = {
  reservation: NormalizedKrossReservation | null;
  issues: KrossNormalizationIssue[];
  canEnterSafeView: boolean;
};

function clean(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function isDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

function evidenceTime(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !isDateOnly(match[1]) || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59) return Number.NaN;
  return Date.parse(value);
}

function nonNegativeInteger(value: number | null | undefined) {
  return Number.isSafeInteger(value) && Number(value) >= 0 ? Number(value) : null;
}

function sourceRecordId(propertyId: string, externalReservationId: string) {
  // The database also has a global source-record unique index. Namespacing the
  // external id by property keeps Kross mirror identity tenant/property-safe
  // without weakening the existing generic constraint.
  return `${propertyId.trim()}:${externalReservationId.trim()}`;
}

export function normalizeKrossReservationCandidate(
  candidate: KrossReservationCandidate,
  evidence: KrossTransportEvidence,
  nowIso: string,
): KrossNormalizationResult {
  const issues: KrossNormalizationIssue[] = [];
  const externalReservationId = clean(candidate.externalReservationId);
  const orgId = clean(candidate.orgId);
  const propertyId = clean(candidate.propertyId);
  const status = clean(candidate.status);
  const nowMs = evidenceTime(nowIso);
  const sourceAsOfMs = evidenceTime(evidence.sourceAsOf);
  const observedAtMs = evidenceTime(evidence.observedAt);

  if (!Number.isFinite(nowMs)) {
    issues.push({ code: "invalid_now", message: "A valid evaluation timestamp with timezone is required." });
  }
  if (Number.isFinite(sourceAsOfMs) && Number.isFinite(observedAtMs) && observedAtMs < sourceAsOfMs) {
    issues.push({ code: "observation_before_source", message: "Observation cannot precede the source timestamp." });
  }

  const maxAgeMs = 6 * 60 * 60 * 1000;
  if (Number.isFinite(nowMs) && nowMs - sourceAsOfMs > maxAgeMs) {
    issues.push({ code: "stale_source_time", message: "Source evidence exceeds the six-hour current-state ceiling." });
  }
  if (Number.isFinite(nowMs) && nowMs - observedAtMs > maxAgeMs) {
    issues.push({ code: "stale_observed_time", message: "Sync evidence exceeds the six-hour current-state ceiling." });
  }
  if (candidate.mappingIssues?.length) {
    issues.push({ code: "source_mapping_issue", message: "Source mapping contains unresolved validation issues." });
  }
  for (const value of [candidate.guestsCount, candidate.adults, candidate.children]) {
    if (value !== null && value !== undefined && nonNegativeInteger(value) === null) {
      issues.push({ code: "invalid_guest_count", message: "Guest counts must be non-negative safe integers when present." });
      break;
    }
  }
  const guestsCount = nonNegativeInteger(candidate.guestsCount);
  const adults = nonNegativeInteger(candidate.adults);
  const children = nonNegativeInteger(candidate.children);
  // Supplied components establish a lower bound, even if another is unknown.
  // This is a validation bound only; never fill in a missing count from it.
  const knownGuestCount = (adults ?? 0) + (children ?? 0);
  if (!Number.isSafeInteger(knownGuestCount) ||
    (guestsCount !== null && (knownGuestCount > guestsCount ||
      (adults !== null && children !== null && guestsCount !== knownGuestCount)))) {
    issues.push({ code: "inconsistent_guest_count", message: "Total guests conflicts with the supplied adult and child counts." });
  }
  if (candidate.breakfastIncluded !== null && candidate.breakfastIncluded !== undefined && typeof candidate.breakfastIncluded !== "boolean") {
    issues.push({ code: "invalid_breakfast_entitlement", message: "Breakfast entitlement must be a boolean when supplied." });
  }

  if (!externalReservationId) {
    issues.push({
      code: "missing_external_id",
      message: "Kross external reservation identity is required.",
    });
  }

  if (!orgId || !propertyId) {
    issues.push({
      code: "missing_scope",
      message: "Organization and property scope are required.",
    });
  }

  if (!isDateOnly(candidate.checkIn) || !isDateOnly(candidate.checkOut)) {
    issues.push({
      code: "invalid_date",
      message: "Check-in and check-out must be valid YYYY-MM-DD dates.",
    });
  } else if (candidate.checkOut < candidate.checkIn) {
    issues.push({
      code: "checkout_before_checkin",
      message: "Check-out cannot be before check-in.",
    });
  }

  if (!Number.isFinite(sourceAsOfMs) || (Number.isFinite(nowMs) && sourceAsOfMs > nowMs)) {
    issues.push({
      code: "future_source_time",
      message: "Source timestamp must exist and cannot be in the future.",
    });
  }

  if (!Number.isFinite(observedAtMs) || (Number.isFinite(nowMs) && observedAtMs > nowMs)) {
    issues.push({
      code: "future_observed_time",
      message: "Observed timestamp must exist and cannot be in the future.",
    });
  }

  if (!clean(evidence.sourceHash)) {
    issues.push({
      code: "missing_source_hash",
      message: "A source checksum/hash is required for idempotency evidence.",
    });
  }

  if (!clean(evidence.sourceReference)) {
    issues.push({
      code: "missing_source_reference",
      message: "A governed source reference is required.",
    });
  }

  if (!status) {
    issues.push({ code: "missing_status", message: "A supplied reservation status is required." });
  }

  if (evidence.authorizedTransport !== true) {
    issues.push({
      code: "transport_not_authorized",
      message: "The transport has not been explicitly authorized for Kross read use.",
    });
  }

  if (evidence.directFromKross !== true) {
    issues.push({
      code: "transport_not_direct",
      message: "The payload is not directly evidenced from Kross authority.",
    });
  }

  if (evidence.readOnly !== true) {
    issues.push({
      code: "transport_not_read_only",
      message: "The transport is not proven read-only.",
    });
  }

  const structurallyValid =
    Boolean(externalReservationId && orgId && propertyId && status) &&
    isDateOnly(candidate.checkIn) &&
    isDateOnly(candidate.checkOut) &&
    candidate.checkOut >= candidate.checkIn &&
    Number.isFinite(nowMs) &&
    Number.isFinite(sourceAsOfMs) &&
    Number.isFinite(observedAtMs) &&
    clean(evidence.sourceHash) !== null &&
    clean(evidence.sourceReference) !== null;

  if (!structurallyValid || !externalReservationId || !orgId || !propertyId || !status) {
    return {
      reservation: null,
      issues,
      canEnterSafeView: false,
    };
  }

  const liveEvidence =
    evidence.authorizedTransport === true &&
    evidence.directFromKross === true &&
    evidence.readOnly === true &&
    issues.length === 0;

  const reservation: NormalizedKrossReservation = {
    org_id: orgId,
    property_id: propertyId,
    external_reservation_id: externalReservationId,
    reservation_key: clean(candidate.reservationKey),
    room_id: clean(candidate.roomId),
    room_code_raw: clean(candidate.roomCodeRaw),
    check_in: candidate.checkIn,
    check_out: candidate.checkOut,
    status,
    guests_count: guestsCount,
    adults,
    children,
    channel: clean(candidate.channel),
    breakfast_included:
      typeof candidate.breakfastIncluded === "boolean"
        ? candidate.breakfastIncluded
        : null,
    transactional_authority: "Kross",
    read_only_mirror: true,
    source_is_live: liveEvidence,
    source_system: "Kross",
    source_table: "reservations",
    source_record_id: sourceRecordId(propertyId, externalReservationId),
    snapshot_as_of: evidence.sourceAsOf,
    last_synced_at: evidence.observedAt,
    source_hash: evidence.sourceHash.trim(),
    data_quality_status: liveEvidence ? "verified" : "review",
  };

  return {
    reservation,
    issues,
    canEnterSafeView: liveEvidence,
  };
}
