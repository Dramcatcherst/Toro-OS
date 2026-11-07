/** Informational PMS reads. This policy never authorizes a commercial write. */
export const KROSS_INFORMATIONAL_MAX_AGE_MS = 60 * 60 * 1000;
export const KROSS_INFORMATIONAL_ROW_LIMIT = 200;

export type KrossOperationalSnapshotInput = {
  orgId: string;
  propertyId: string;
  asOf: string;
  reportingDate: string;
  truncated?: boolean;
};

function dateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ms = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value;
}

function instant(value: unknown): number {
  if (typeof value !== "string") return Number.NaN;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !dateOnly(match[1]) || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59) return Number.NaN;
  return Date.parse(value);
}

function text(value: unknown, limit = 256): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= limit && value === value.trim();
}

function status(value: string) {
  const key = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  if (["cancelada", "cancelled", "canceled"].includes(key)) return "cancelled";
  // Source labels observed in the existing Kross reservation projection.
  // Unrecognized codes remain unknown; WAIT is not inferred to be confirmed.
  if (["confirmada (lista para check in)", "conf", "check-in", "check-out", "pendiente de pago", "paga al check-in", "extras pendientes"].includes(key)) return "scheduled";
  return "unknown";
}

export function projectKrossOperationalSnapshot(rows: unknown, input: KrossOperationalSnapshotInput) {
  const base = {
    mode: "informational_snapshot" as const,
    externalWrite: false as const,
    source: "Kross / operations.reservations",
    maxAgeMinutes: 60,
    reportingDate: input.reportingDate,
    asOf: input.asOf,
  };
  const unavailable = (reason: string) => ({
    ...base, state: "unavailable" as const, reason, sourceAsOf: null,
    counts: null, coverage: null,
  });
  const now = instant(input.asOf);
  if (!Number.isFinite(now) || !dateOnly(input.reportingDate) || !text(input.orgId) || !text(input.propertyId)) return unavailable("invalid_scope_or_time");
  if (!Array.isArray(rows) || rows.length === 0) return unavailable("no_snapshot_rows");
  const coverage = {
    completeness: "unverified" as const,
    totalArrivalsInProperty: null,
    rowsRead: Math.min(rows.length, KROSS_INFORMATIONAL_ROW_LIMIT),
    truncated: input.truncated === true || rows.length > KROSS_INFORMATIONAL_ROW_LIMIT,
    excludedRows: 0, staleRows: 0, reviewRows: 0, cancelledRows: 0, unknownStatusRows: 0,
  };
  const counts = { observedScheduledArrivals: 0, observedScheduledDepartures: 0, observedScheduledStays: 0 };
  const seen = new Set<string>();
  let oldestUsed = Number.POSITIVE_INFINITY;
  let newestStale = Number.NEGATIVE_INFINITY;

  for (const raw of rows.slice(0, KROSS_INFORMATIONAL_ROW_LIMIT)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) { coverage.excludedRows++; continue; }
    const row = raw as Record<string, unknown>;
    if (row.org_id !== input.orgId || row.property_id !== input.propertyId) return unavailable("scope_mismatch");
    if (!text(row.external_reservation_id)) { coverage.excludedRows++; continue; }
    if (seen.has(row.external_reservation_id)) return unavailable("duplicate_identity");
    seen.add(row.external_reservation_id);
    const sourceTime = instant(row.snapshot_as_of);
    const syncedTime = instant(row.last_synced_at);
    if (row.source_system !== "Kross" || row.transactional_authority !== "Kross" || row.read_only_mirror !== true ||
      !["review", "verified"].includes(String(row.data_quality_status)) || !text(row.source_hash) ||
      !dateOnly(row.check_in) || !dateOnly(row.check_out) || row.check_out < row.check_in || !text(row.status) ||
      !Number.isFinite(sourceTime) || !Number.isFinite(syncedTime) || sourceTime > now || syncedTime > now || syncedTime < sourceTime) {
      coverage.excludedRows++; continue;
    }
    if (now - sourceTime > KROSS_INFORMATIONAL_MAX_AGE_MS) {
      coverage.staleRows++;
      newestStale = Math.max(newestStale, sourceTime);
      continue;
    }
    oldestUsed = Math.min(oldestUsed, sourceTime);
    if (row.data_quality_status === "review") coverage.reviewRows++;
    const disposition = status(row.status);
    if (disposition === "cancelled") { coverage.cancelledRows++; continue; }
    if (disposition === "unknown") { coverage.unknownStatusRows++; continue; }
    if (row.check_in === input.reportingDate) counts.observedScheduledArrivals++;
    if (row.check_out === input.reportingDate) counts.observedScheduledDepartures++;
    if (row.check_in <= input.reportingDate && row.check_out > input.reportingDate) counts.observedScheduledStays++;
  }

  if (!Number.isFinite(oldestUsed)) {
    if (coverage.staleRows > 0 && coverage.excludedRows === 0) return {
      ...base, state: "stale" as const, reason: "source_older_than_one_hour",
      sourceAsOf: new Date(newestStale).toISOString(), counts: null, coverage,
    };
    return unavailable("no_admissible_snapshot_rows");
  }
  return {
    ...base, state: "snapshot" as const, sourceAsOf: new Date(oldestUsed).toISOString(),
    counts, coverage,
    notice: "Copia informativa de hasta una hora. Conteos observados en la lectura; cobertura total no acreditada. No confirma presencia física, disponibilidad, tarifa ni derecho de desayuno.",
  };
}
