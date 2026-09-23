import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { getConnectorHealth } from "@/lib/server/connector-health";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type {
  KrossFabricHealth,
  KrossFabricSource,
  SystemsHealthData,
} from "./types";

type RawKrossHealthRow = {
  source_name: string;
  snapshot_kind: string;
  row_count: number | null;
  source_as_of: string | null;
  observed_at: string | null;
  live_required: boolean;
  freshness_status: string;
  safe_for_current_state: boolean;
};

function isIsoOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && !Number.isNaN(Date.parse(value)));
}

function parseKrossHealthRow(value: unknown): RawKrossHealthRow {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid Kross Data Fabric health payload.");
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.source_name !== "string" ||
    typeof row.snapshot_kind !== "string" ||
    !(row.row_count === null ||
      (typeof row.row_count === "number" &&
        Number.isInteger(row.row_count) &&
        row.row_count >= 0)) ||
    !isIsoOrNull(row.source_as_of) ||
    !isIsoOrNull(row.observed_at) ||
    typeof row.live_required !== "boolean" ||
    typeof row.freshness_status !== "string" ||
    typeof row.safe_for_current_state !== "boolean"
  ) {
    throw new Error("Invalid Kross Data Fabric health payload.");
  }

  return row as RawKrossHealthRow;
}

function summarizeKrossFabric(
  rows: RawKrossHealthRow[],
  currentReservationRows: number,
): KrossFabricHealth {
  const sources: KrossFabricSource[] = rows.map((row) => ({
    name: row.source_name,
    kind: row.snapshot_kind,
    rowCount: row.row_count ?? 0,
    sourceAsOf: row.source_as_of,
    observedAt: row.observed_at,
    liveRequired: row.live_required,
    freshness: row.freshness_status,
    safeForCurrentState: row.safe_for_current_state,
  }));

  const liveRequiredSources = sources.filter((source) => source.liveRequired).length;
  const unsafeLiveRequiredSources = sources.filter(
    (source) => source.liveRequired && !source.safeForCurrentState,
  ).length;
  const safeForCurrentState = sources.filter(
    (source) => source.safeForCurrentState,
  ).length;
  const sourcesWithSourceAsOf = sources.filter(
    (source) => source.sourceAsOf !== null,
  ).length;
  const observedDates = sources
    .map((source) => source.observedAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(b) - Date.parse(a));
  const latestObservedAt = observedDates[0] ?? null;

  const status: KrossFabricHealth["status"] =
    liveRequiredSources > 0 &&
    unsafeLiveRequiredSources === 0 &&
    sourcesWithSourceAsOf > 0
      ? "verified"
      : "unverified";

  return {
    status,
    registeredSources: sources.length,
    liveRequiredSources,
    safeForCurrentState,
    sourcesWithSourceAsOf,
    unsafeLiveRequiredSources,
    currentReservationRows,
    latestObservedAt,
    detail:
      status === "verified"
        ? "El Data Fabric Kross tiene fuentes live verificables. Los agregados aún deben respetar source_as_of antes de llamarse actuales."
        : "No hay feed Kross actual verificable. 0 filas en current_reservations_safe no significa 0 reservas del hotel.",
    sources,
  };
}

export async function loadSystemsHealth(): Promise<SystemsHealthData> {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro/sistemas");
  }
  if (session.role !== "FOUNDER" && session.role !== "SYSTEMS") {
    redirect("/toro");
  }

  const supabase = await createServerSupabaseClient();
  const [connectorHealth, krossResult, currentReservationsResult] =
    await Promise.all([
      getConnectorHealth(),
      supabase
        .schema("integrations")
        .from("kross_snapshot_health")
        .select(
          "source_name,snapshot_kind,row_count,source_as_of,observed_at,live_required,freshness_status,safe_for_current_state",
        )
        .order("observed_at", { ascending: false })
        .limit(50),
      supabase
        .schema("operations")
        .from("current_reservations_safe")
        .select("id", { count: "exact", head: true }),
    ]);

  if (krossResult.error) {
    throw new Error(
      `Unable to read Kross Data Fabric health: ${krossResult.error.message ?? "unknown error"}`,
    );
  }
  if (currentReservationsResult.error) {
    throw new Error(
      `Unable to read Kross Data Fabric current reservations: ${currentReservationsResult.error.message ?? "unknown error"}`,
    );
  }
  if (!Array.isArray(krossResult.data)) {
    throw new Error("Invalid Kross Data Fabric health payload.");
  }

  const rows = krossResult.data.map(parseKrossHealthRow);
  const currentReservationRows =
    typeof currentReservationsResult.count === "number" &&
    currentReservationsResult.count >= 0
      ? currentReservationsResult.count
      : 0;

  return {
    connectorHealth,
    krossFabric: summarizeKrossFabric(rows, currentReservationRows),
  };
}
