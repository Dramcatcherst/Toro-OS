import { adaptKrossReservationPayload } from "./transport-adapter";
import type { KrossReservationCandidate } from "./normalize-reservation";

export type ArchiveScope = { orgId: string; propertyId: string };
export type ArchiveIdentityCrosswalk = ArchiveScope & {
  reservationNumber: string;
  externalReservationId: string;
  evidenceReference: string;
};
type FieldState = "absent" | "blank" | "redacted" | "value" | "ambiguous";
type SourceValue = string | number | boolean;
type Extraction = {
  payload: Record<string, SourceValue> | null;
  fieldStates: Record<string, FieldState>;
  money: Record<string, string>;
  issues: string[];
  mayWrite: false;
  mayClaimLive: false;
};
const aliases: Record<string, string[]> = {
  reservationNumber: ["Number", "Número"],
  channelReference: ["Code", "Código"],
  checkIn: ["Arrival", "Llegada"],
  checkOut: ["Departure", "Salida"],
  status: ["Status", "Estado"],
  roomCodeRaw: ["Rooms", "Habitaciones"],
  guestsCount: ["Guests", "Huéspedes"],
  channel: ["Channel", "Portal"],
  lastOperationLiteral: ["Last operation", "Ultima operación"],
  cancellationLiteral: ["Cancelation date", "Fecha de cancelación"],
  totalAmount: ["Total"],
};
function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function validDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

// This extracts a draft only. Provenance consistency does not authenticate an export.
export function extractKrossArchiveReservation(input: unknown, scope: ArchiveScope): Extraction {
  const result: Extraction = {
    payload: null, fieldStates: {}, money: {}, issues: [], mayWrite: false, mayClaimLive: false,
  };
  const row = object(input), payload = object(row?.source_payload);
  const provenance = object(payload?.provenance);
  if (!scope.orgId?.trim() || !scope.propertyId?.trim() ||
      row?.org_id !== scope.orgId || row?.property_id !== scope.propertyId) {
    result.issues.push("archive_scope_mismatch"); return result;
  }
  if (row.source_system !== "kross" || payload?.schema_version !== "kross_source_archive_staging_v1" ||
      provenance?.source_kind !== "reservations" || !Array.isArray(payload?.columns)) {
    result.issues.push("archive_schema_mismatch"); return result;
  }
  const hash = provenance.file_sha256;
  if (typeof hash !== "string" || !/^[a-f0-9]{64}$/.test(hash) ||
      row.source_base_id !== `sha256:${hash}` ||
      typeof row.source_record_id !== "string" || !/^sha256:[a-f0-9]{64}$/.test(row.source_record_id)) {
    result.issues.push("archive_provenance_mismatch"); return result;
  }
  const columns = payload.columns.map(object);
  const ordinals = new Set<number>();
  for (const column of columns) {
    const ordinal = column?.ordinal;
    if (!column || typeof column.header !== "string" || typeof ordinal !== "number" ||
        !Number.isSafeInteger(ordinal) || ordinal < 1 || ordinals.has(ordinal)) {
      result.issues.push("invalid_column_ordinal"); return result;
    }
    ordinals.add(ordinal);
  }
  const extracted: Record<string, SourceValue> = {};
  for (const [field, names] of Object.entries(aliases)) {
    const matches = columns.filter(column => column && names.includes(column.header as string));
    if (matches.length > 1) {
      result.fieldStates[field] = "ambiguous"; result.issues.push(`ambiguous_${field}`); continue;
    }
    const column = matches[0];
    if (!column) { result.fieldStates[field] = "absent"; continue; }
    if (column.redacted === true || column.formula_present === true) {
      result.fieldStates[field] = "redacted"; continue;
    }
    const value = column.value;
    if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
      result.fieldStates[field] = "blank"; continue;
    }
    if (!["string", "number", "boolean"].includes(typeof value)) {
      result.issues.push(`invalid_${field}_value`); continue;
    }
    result.fieldStates[field] = "value";
    if (field === "totalAmount") {
      // Source XML decimals must remain strings; already-rounded JS numbers are refused.
      if (typeof value === "string" && /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)) {
        result.money.totalAmount = value;
      } else result.issues.push("invalid_decimal_literal");
    } else extracted[field] = value as SourceValue;
  }
  for (const required of ["reservationNumber", "checkIn", "checkOut", "status"]) {
    if (result.fieldStates[required] !== "value") result.issues.push(`missing_${required}`);
  }
  if (!validDate(extracted.checkIn) || !validDate(extracted.checkOut) ||
      String(extracted.checkOut) < String(extracted.checkIn)) result.issues.push("invalid_stay_dates");
  if (typeof extracted.reservationNumber !== "string" || typeof extracted.status !== "string") {
    result.issues.push("invalid_reservation_identity_or_status");
  }
  if (result.issues.length === 0) result.payload = extracted;
  return result;
}

// A scoped crosswalk reference is a prerequisite, not verified runtime authority.
export function draftKrossArchiveReservation(
  row: unknown, scope: ArchiveScope, crosswalk?: ArchiveIdentityCrosswalk,
): { candidate: KrossReservationCandidate | null; issues: string[];
  normalizationReady: false; mayWrite: false; mayClaimLive: false } {
  const extracted = extractKrossArchiveReservation(row, scope);
  const result = { candidate: null as KrossReservationCandidate | null, issues: [...extracted.issues],
    normalizationReady: false as const, mayWrite: false as const, mayClaimLive: false as const };
  if (!extracted.payload) return result;
  if (!crosswalk) { result.issues.push("identity_crosswalk_required"); return result; }
  if (crosswalk.orgId !== scope.orgId || crosswalk.propertyId !== scope.propertyId ||
      crosswalk.reservationNumber !== extracted.payload.reservationNumber ||
      typeof crosswalk.externalReservationId !== "string" || !crosswalk.externalReservationId.trim() ||
      typeof crosswalk.evidenceReference !== "string" || !crosswalk.evidenceReference.trim()) {
    result.issues.push("identity_crosswalk_mismatch"); return result;
  }
  const adapted = adaptKrossReservationPayload(
    { ...extracted.payload, externalReservationId: crosswalk.externalReservationId },
    { ...scope, fieldMap: { externalReservationId: "externalReservationId", reservationKey: "reservationNumber",
      checkIn: "checkIn", checkOut: "checkOut", status: "status", roomCodeRaw: "roomCodeRaw",
      guestsCount: "guestsCount", channel: "channel" } },
  );
  result.issues.push(...adapted.issues.map(issue => `adapter_${issue.code}`));
  if (adapted.issues.length === 0) result.candidate = adapted.candidate;
  return result;
}
