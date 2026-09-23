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
    | "invalid_date"
    | "checkout_before_checkin"
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
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
}

function nonNegativeInteger(value: number | null | undefined) {
  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : null;
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
  const nowMs = Date.parse(nowIso);
  const sourceAsOfMs = Date.parse(evidence.sourceAsOf);
  const observedAtMs = Date.parse(evidence.observedAt);

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

  if (!evidence.authorizedTransport) {
    issues.push({
      code: "transport_not_authorized",
      message: "The transport has not been explicitly authorized for Kross read use.",
    });
  }

  if (!evidence.directFromKross) {
    issues.push({
      code: "transport_not_direct",
      message: "The payload is not directly evidenced from Kross authority.",
    });
  }

  if (!evidence.readOnly) {
    issues.push({
      code: "transport_not_read_only",
      message: "The transport is not proven read-only.",
    });
  }

  const structurallyValid =
    Boolean(externalReservationId && orgId && propertyId) &&
    isDateOnly(candidate.checkIn) &&
    isDateOnly(candidate.checkOut) &&
    candidate.checkOut >= candidate.checkIn &&
    Number.isFinite(sourceAsOfMs) &&
    Number.isFinite(observedAtMs) &&
    clean(evidence.sourceHash) !== null &&
    clean(evidence.sourceReference) !== null;

  if (!structurallyValid || !externalReservationId || !orgId || !propertyId) {
    return {
      reservation: null,
      issues,
      canEnterSafeView: false,
    };
  }

  const liveEvidence =
    evidence.authorizedTransport &&
    evidence.directFromKross &&
    evidence.readOnly &&
    issues.every(
      (issue) =>
        ![
          "future_source_time",
          "future_observed_time",
          "transport_not_authorized",
          "transport_not_direct",
          "transport_not_read_only",
        ].includes(issue.code),
    );

  const reservation: NormalizedKrossReservation = {
    org_id: orgId,
    property_id: propertyId,
    external_reservation_id: externalReservationId,
    reservation_key: clean(candidate.reservationKey),
    room_id: clean(candidate.roomId),
    room_code_raw: clean(candidate.roomCodeRaw),
    check_in: candidate.checkIn,
    check_out: candidate.checkOut,
    status: clean(candidate.status) ?? "unknown",
    guests_count: nonNegativeInteger(candidate.guestsCount),
    adults: nonNegativeInteger(candidate.adults),
    children: nonNegativeInteger(candidate.children),
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
