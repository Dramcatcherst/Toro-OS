import type { SupabaseClient } from "@supabase/supabase-js";

export const KROSS_CURRENT_STATE_MAX_AGE_HOURS = 6;
export const KROSS_CURRENT_STATE_MAX_ROWS = 25;
export const KROSS_CURRENT_STATE_SNAPSHOT_KIND = "reservation_mirror";

export type KrossCurrentStateMovement =
  | "arrivals"
  | "departures"
  | "daily_movements";

export type KrossCurrentStateQuery = {
  orgId: string;
  propertyId?: string;
  date: string;
  movement: KrossCurrentStateMovement;
  limit: number;
};

export type KrossCurrentStateHealthRow = {
  property_id: string | null;
  source_system: string | null;
  source_name: string;
  snapshot_kind: string;
  row_count: number | null;
  source_as_of: string | null;
  observed_at: string | null;
  live_required: boolean;
  use_as_current_state: boolean;
  freshness_status: string | null;
  safe_for_current_state: boolean;
};

export type KrossCurrentStateReservationRow = {
  /** Internal-only dedupe key. It is deliberately removed from the output. */
  id: string;
  property_id: string;
  room_code_raw: string | null;
  check_in: string;
  check_out: string;
  status: string | null;
  guests_count: number | null;
  adults: number | null;
  children: number | null;
  channel: string | null;
  breakfast_included: boolean | null;
  snapshot_as_of: string;
  last_synced_at: string;
  movement: readonly ("arrival" | "departure")[];
  transactional_authority: string;
  read_only_mirror: boolean;
  source_is_live: boolean;
  source_system: string;
  data_quality_status: string;
};

export type KrossCurrentStateItem = {
  roomCode: string | null;
  checkIn: string;
  checkOut: string;
  status: string;
  guestsCount: number | null;
  adults: number | null;
  children: number | null;
  channel: string | null;
  breakfastIncluded: boolean | null;
  movement: ("arrival" | "departure")[];
};

export type KrossCurrentStateReason =
  | "current_source"
  | "source_missing"
  | "source_not_promoted"
  | "source_stale"
  | "property_choice_required"
  | "reservation_rows_stale"
  | "invalid_mirror_row"
  | "mirror_read_failed";

export type KrossCurrentStateResult = {
  state: "READY" | "STALE" | "UNAVAILABLE";
  reason: KrossCurrentStateReason;
  query: Omit<KrossCurrentStateQuery, "orgId">;
  propertyId: string | null;
  authoritySystem: "Kross";
  mirrorSystem: "Supabase";
  sourceAsOf: string | null;
  observedAt: string | null;
  maxAgeHours: typeof KROSS_CURRENT_STATE_MAX_AGE_HOURS;
  coverage: {
    matchedCount: number;
    returnedCount: number;
    truncated: boolean;
  };
  counts: {
    arrivals: number;
    departures: number;
  };
  items: KrossCurrentStateItem[];
  rateAvailability: "SEPARATE_LIVE_AUTHORITY_REQUIRED";
  message: string;
};

type EvaluateKrossCurrentStateInput = {
  nowIso: string;
  query: KrossCurrentStateQuery;
  healthRows: readonly KrossCurrentStateHealthRow[];
  reservationRows: readonly KrossCurrentStateReservationRow[];
};

const HEALTH_SELECT = [
  "property_id",
  "source_system",
  "source_name",
  "snapshot_kind",
  "row_count",
  "source_as_of",
  "observed_at",
  "live_required",
  "use_as_current_state",
  "freshness_status",
  "safe_for_current_state",
].join(",");

const RESERVATION_SELECT = [
  "id",
  "property_id",
  "room_code_raw",
  "check_in",
  "check_out",
  "status",
  "guests_count",
  "adults",
  "children",
  "channel",
  "breakfast_included",
  "snapshot_as_of",
  "last_synced_at",
  "transactional_authority",
  "read_only_mirror",
  "source_is_live",
  "source_system",
  "data_quality_status",
].join(",");

function clean(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function validDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function timestampAgeMs(value: string | null, nowMs: number) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || timestamp > nowMs) return null;
  return nowMs - timestamp;
}

function timestampIsCurrent(value: string | null, nowMs: number) {
  const age = timestampAgeMs(value, nowMs);
  return (
    age !== null &&
    age <= KROSS_CURRENT_STATE_MAX_AGE_HOURS * 60 * 60 * 1000
  );
}

function latestTimestamp(values: Array<string | null>) {
  return values
    .filter((value): value is string => Boolean(value && Number.isFinite(Date.parse(value))))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

function costaRicaTimestamp(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "sin corte verificable";
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function queryLabel(query: KrossCurrentStateQuery) {
  if (query.movement === "arrivals") return "llegadas";
  if (query.movement === "departures") return "salidas";
  return "movimientos";
}

function unavailableResult(
  query: KrossCurrentStateQuery,
  reason: KrossCurrentStateReason,
  sourceAsOf: string | null,
  state: "STALE" | "UNAVAILABLE",
): KrossCurrentStateResult {
  const staleMessage = `Tengo un último corte de ${costaRicaTimestamp(sourceAsOf)}, pero ya no es válido como estado actual. No voy a presentar datos vencidos como Kross en vivo.`;
  const unavailableMessage =
    reason === "property_choice_required"
      ? "Necesito escoger una propiedad autorizada antes de consultar Kross. No mezclaré datos entre propiedades."
      : "No puedo confirmar Kross ahora; no voy a inventar reservas, ocupación, disponibilidad ni precios.";

  return {
    state,
    reason,
    query: {
      propertyId: query.propertyId,
      date: query.date,
      movement: query.movement,
      limit: query.limit,
    },
    propertyId: query.propertyId ?? null,
    authoritySystem: "Kross",
    mirrorSystem: "Supabase",
    sourceAsOf,
    observedAt: null,
    maxAgeHours: KROSS_CURRENT_STATE_MAX_AGE_HOURS,
    coverage: { matchedCount: 0, returnedCount: 0, truncated: false },
    counts: { arrivals: 0, departures: 0 },
    items: [],
    rateAvailability: "SEPARATE_LIVE_AUTHORITY_REQUIRED",
    message: state === "STALE" ? staleMessage : unavailableMessage,
  };
}

function normalizedLimit(value: number) {
  if (!Number.isInteger(value)) return 10;
  return Math.min(KROSS_CURRENT_STATE_MAX_ROWS, Math.max(1, value));
}

function rowIsSafe(
  row: KrossCurrentStateReservationRow,
  propertyId: string,
  query: KrossCurrentStateQuery,
  nowMs: number,
) {
  const authorityChecks =
    row.transactional_authority === "Kross" &&
    row.read_only_mirror === true &&
    row.source_is_live === true &&
    row.source_system === "Kross" &&
    row.data_quality_status === "verified";

  return Boolean(
    clean(row.id) &&
      row.property_id === propertyId &&
      validDateOnly(row.check_in) &&
      validDateOnly(row.check_out) &&
      row.check_out >= row.check_in &&
      clean(row.status) &&
      timestampIsCurrent(row.snapshot_as_of, nowMs) &&
      timestampIsCurrent(row.last_synced_at, nowMs) &&
      authorityChecks &&
      row.movement.length > 0 &&
      row.movement.every((movement) =>
        movement === "arrival"
          ? row.check_in === query.date
          : row.check_out === query.date,
      ),
  );
}

function itemFromRow(row: KrossCurrentStateReservationRow): KrossCurrentStateItem {
  return {
    roomCode: clean(row.room_code_raw),
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: clean(row.status) ?? "unknown",
    guestsCount:
      Number.isInteger(row.guests_count) && Number(row.guests_count) >= 0
        ? Number(row.guests_count)
        : null,
    adults:
      Number.isInteger(row.adults) && Number(row.adults) >= 0
        ? Number(row.adults)
        : null,
    children:
      Number.isInteger(row.children) && Number(row.children) >= 0
        ? Number(row.children)
        : null,
    channel: clean(row.channel),
    breakfastIncluded:
      typeof row.breakfast_included === "boolean"
        ? row.breakfast_included
        : null,
    movement: [...new Set(row.movement)].sort((left, right) =>
      left === right ? 0 : left === "arrival" ? -1 : 1,
    ),
  };
}

function readyMessage(
  query: KrossCurrentStateQuery,
  items: readonly KrossCurrentStateItem[],
  sourceAsOf: string,
  truncated: boolean,
) {
  const label = queryLabel(query);
  const header = items.length
    ? `Kross muestra ${items.length} ${label} para ${query.date}.`
    : `No aparecen ${label} para ${query.date} en el corte vigente consultado.`;
  const lines = items.map((item) => {
    const movement = item.movement
      .map((value) => (value === "arrival" ? "entrada" : "salida"))
      .join(" + ");
    const guests = item.guestsCount === null
      ? "huéspedes sin conteo"
      : `${item.guestsCount} huésped${item.guestsCount === 1 ? "" : "es"}`;
    return `• ${item.roomCode ? `Unidad ${item.roomCode}` : "Unidad sin mapear"} · ${movement} · ${guests} · ${item.status}`;
  });
  const truncation = truncated
    ? "\nResultado limitado; solicita una vista más específica para ver el resto."
    : "";
  return `${header}${lines.length ? `\n${lines.join("\n")}` : ""}\nFuente: Kross · corte ${costaRicaTimestamp(sourceAsOf)} Costa Rica · espejo de lectura: Supabase.${truncation}`;
}

export function currentCostaRicaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function evaluateKrossCurrentState(
  input: EvaluateKrossCurrentStateInput,
): KrossCurrentStateResult {
  const query = {
    ...input.query,
    orgId: input.query.orgId.trim(),
    propertyId: clean(input.query.propertyId) ?? undefined,
    limit: normalizedLimit(input.query.limit),
  };
  const nowMs = Date.parse(input.nowIso);

  if (!clean(query.orgId) || !validDateOnly(query.date) || !Number.isFinite(nowMs)) {
    return unavailableResult(query, "invalid_mirror_row", null, "UNAVAILABLE");
  }

  const krossRows = input.healthRows.filter(
    (row) =>
      clean(row.source_system)?.toLowerCase() === "kross" &&
      row.snapshot_kind === KROSS_CURRENT_STATE_SNAPSHOT_KIND &&
      row.live_required === true,
  );
  if (!krossRows.length) {
    return unavailableResult(query, "source_missing", null, "UNAVAILABLE");
  }

  const relevantRows = query.propertyId
    ? krossRows.filter((row) => row.property_id === query.propertyId)
    : krossRows;
  const promotedRows = relevantRows.filter(
    (row) => row.use_as_current_state === true,
  );
  const latestKnown = latestTimestamp(
    (relevantRows.length ? relevantRows : krossRows).map(
      (row) => row.source_as_of,
    ),
  );

  if (!promotedRows.length) {
    return unavailableResult(
      query,
      "source_not_promoted",
      latestKnown,
      "STALE",
    );
  }

  const currentRows = promotedRows.filter(
    (row) =>
      row.safe_for_current_state === true &&
      row.freshness_status === "fresh" &&
      Number.isInteger(row.row_count) &&
      Number(row.row_count) >= 0 &&
      timestampIsCurrent(row.source_as_of, nowMs) &&
      timestampIsCurrent(row.observed_at, nowMs),
  );
  if (!currentRows.length) {
    return unavailableResult(query, "source_stale", latestKnown, "STALE");
  }

  const currentPropertyIds = [
    ...new Set(
      currentRows
        .map((row) => clean(row.property_id))
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  if (!query.propertyId && currentPropertyIds.length !== 1) {
    return unavailableResult(
      query,
      "property_choice_required",
      latestKnown,
      "UNAVAILABLE",
    );
  }

  const propertyId = query.propertyId ?? currentPropertyIds[0];
  if (!propertyId) {
    return unavailableResult(
      query,
      "property_choice_required",
      latestKnown,
      "UNAVAILABLE",
    );
  }
  const selectedHealth = currentRows
    .filter((row) => row.property_id === propertyId)
    .sort(
      (left, right) =>
        Date.parse(right.source_as_of ?? "") -
        Date.parse(left.source_as_of ?? ""),
    )[0];
  if (!selectedHealth?.source_as_of) {
    return unavailableResult(query, "source_stale", latestKnown, "STALE");
  }

  const scopedRows = input.reservationRows.filter((row) => {
    if (row.property_id !== propertyId) return false;
    if (query.movement === "arrivals") return row.movement.includes("arrival");
    if (query.movement === "departures") return row.movement.includes("departure");
    return true;
  });
  if (scopedRows.some((row) => !rowIsSafe(row, propertyId, query, nowMs))) {
    return unavailableResult(
      { ...query, propertyId },
      "reservation_rows_stale",
      selectedHealth.source_as_of,
      "STALE",
    );
  }

  const deduped = new Map<string, KrossCurrentStateReservationRow>();
  for (const row of scopedRows) {
    const existing = deduped.get(row.id);
    if (!existing) {
      deduped.set(row.id, { ...row, movement: [...new Set(row.movement)] });
      continue;
    }
    deduped.set(row.id, {
      ...existing,
      movement: [...new Set([...existing.movement, ...row.movement])],
    });
  }

  const allItems = [...deduped.values()]
    .map(itemFromRow)
    .sort((left, right) =>
      `${left.roomCode ?? ""}:${left.checkIn}:${left.checkOut}`.localeCompare(
        `${right.roomCode ?? ""}:${right.checkIn}:${right.checkOut}`,
      ),
    );
  const items = allItems.slice(0, query.limit);
  const counts = allItems.reduce(
    (summary, item) => ({
      arrivals: summary.arrivals + (item.movement.includes("arrival") ? 1 : 0),
      departures:
        summary.departures + (item.movement.includes("departure") ? 1 : 0),
    }),
    { arrivals: 0, departures: 0 },
  );
  const truncated = allItems.length > items.length;

  return {
    state: "READY",
    reason: "current_source",
    query: {
      propertyId,
      date: query.date,
      movement: query.movement,
      limit: query.limit,
    },
    propertyId,
    authoritySystem: "Kross",
    mirrorSystem: "Supabase",
    sourceAsOf: selectedHealth.source_as_of,
    observedAt: selectedHealth.observed_at,
    maxAgeHours: KROSS_CURRENT_STATE_MAX_AGE_HOURS,
    coverage: {
      matchedCount: allItems.length,
      returnedCount: items.length,
      truncated,
    },
    counts,
    items,
    rateAvailability: "SEPARATE_LIVE_AUTHORITY_REQUIRED",
    message: readyMessage(query, items, selectedHealth.source_as_of, truncated),
  };
}

type QueryError = { message?: string } | null;

function failedMirrorRead(
  query: KrossCurrentStateQuery,
): KrossCurrentStateResult {
  return unavailableResult(query, "mirror_read_failed", null, "UNAVAILABLE");
}

async function readMovementRows(
  supabase: SupabaseClient,
  query: KrossCurrentStateQuery,
  propertyId: string,
  movement: "arrival" | "departure",
) {
  let builder = supabase
    .schema("operations")
    .from("current_reservations_safe")
    .select(RESERVATION_SELECT)
    .eq("org_id", query.orgId)
    .eq("property_id", propertyId);

  builder = movement === "arrival"
    ? builder.eq("check_in", query.date)
    : builder.eq("check_out", query.date);

  const { data, error } = await builder
    .order("room_code_raw", { ascending: true })
    .limit(normalizedLimit(query.limit) + 1);

  return {
    rows: Array.isArray(data)
      ? (data as unknown as Omit<KrossCurrentStateReservationRow, "movement">[])
          .map((row) => ({ ...row, movement: [movement] }))
      : [],
    error: error as QueryError,
  };
}

export async function loadKrossCurrentStateWithClient(
  supabase: SupabaseClient,
  rawQuery: KrossCurrentStateQuery,
  now = new Date(),
): Promise<KrossCurrentStateResult> {
  const query: KrossCurrentStateQuery = {
    ...rawQuery,
    orgId: rawQuery.orgId.trim(),
    propertyId: clean(rawQuery.propertyId) ?? undefined,
    limit: normalizedLimit(rawQuery.limit),
  };
  if (!query.orgId || !validDateOnly(query.date)) {
    return failedMirrorRead(query);
  }

  try {
    let healthBuilder = supabase
      .schema("integrations")
      .from("kross_snapshot_health")
      .select(HEALTH_SELECT)
      .eq("org_id", query.orgId)
      .ilike("source_system", "kross")
      .eq("snapshot_kind", KROSS_CURRENT_STATE_SNAPSHOT_KIND)
      .eq("live_required", true);
    if (query.propertyId) {
      healthBuilder = healthBuilder.eq("property_id", query.propertyId);
    }
    const { data: healthData, error: healthError } = await healthBuilder
      .order("source_as_of", { ascending: false })
      .limit(50);
    if (healthError) return failedMirrorRead(query);

    const healthRows = Array.isArray(healthData)
      ? (healthData as unknown as KrossCurrentStateHealthRow[])
      : [];
    const healthOnly = evaluateKrossCurrentState({
      nowIso: now.toISOString(),
      query,
      healthRows,
      reservationRows: [],
    });
    if (healthOnly.state !== "READY" || !healthOnly.propertyId) return healthOnly;

    const movements = query.movement === "daily_movements"
      ? (["arrival", "departure"] as const)
      : ([query.movement === "arrivals" ? "arrival" : "departure"] as const);
    const reads = await Promise.all(
      movements.map((movement) =>
        readMovementRows(supabase, query, healthOnly.propertyId!, movement),
      ),
    );
    if (reads.some((read) => read.error)) return failedMirrorRead(query);

    return evaluateKrossCurrentState({
      nowIso: now.toISOString(),
      query: { ...query, propertyId: healthOnly.propertyId },
      healthRows,
      reservationRows: reads.flatMap((read) => read.rows),
    });
  } catch {
    return failedMirrorRead(query);
  }
}
