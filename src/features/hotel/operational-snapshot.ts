export type KrossOperationalMetrics = {
  occupancyPct: number;
  arrivals: number;
  departures: number;
  inHouse: number;
  availableRooms: number;
  occupiedRooms: number;
  blockedRooms: number;
  reservations: number;
};

export type KrossOperationalSnapshot = {
  sourceAsOf: string;
  sourceIsLive: boolean;
  metrics: KrossOperationalMetrics;
};

export type ClassifiedOperationalSnapshot = {
  state: "current" | "recent_snapshot" | "stale_snapshot" | "unavailable";
  canClaimCurrent: boolean;
  sourceAsOf: string | null;
  ageMinutes: number | null;
  label: string;
  metrics: KrossOperationalMetrics | null;
};

const CURRENT_WINDOW_MS = 30 * 60 * 1000;
const RECENT_SNAPSHOT_WINDOW_MS = 2 * 60 * 60 * 1000;

function assertMetrics(metrics: KrossOperationalMetrics) {
  if (!metrics || typeof metrics !== "object") {
    throw new Error("Invalid Kross operational snapshot metrics.");
  }

  if (!Number.isFinite(metrics.occupancyPct) || metrics.occupancyPct < 0 || metrics.occupancyPct > 100) {
    throw new Error("Invalid Kross operational snapshot occupancy.");
  }

  const counts = [
    metrics.arrivals,
    metrics.departures,
    metrics.inHouse,
    metrics.availableRooms,
    metrics.occupiedRooms,
    metrics.blockedRooms,
    metrics.reservations,
  ];

  if (counts.some((value) => !Number.isInteger(value) || value < 0)) {
    throw new Error("Invalid Kross operational snapshot counts.");
  }
}

export function classifyOperationalSnapshot(
  snapshot: KrossOperationalSnapshot | null,
  nowMs = Date.now(),
): ClassifiedOperationalSnapshot {
  if (!snapshot) {
    return {
      state: "unavailable",
      canClaimCurrent: false,
      sourceAsOf: null,
      ageMinutes: null,
      label: "Sin snapshot operativo verificable",
      metrics: null,
    };
  }

  const sourceMs = Date.parse(snapshot.sourceAsOf);
  if (!Number.isFinite(sourceMs)) {
    throw new Error("Invalid Kross operational snapshot source timestamp.");
  }
  if (typeof snapshot.sourceIsLive !== "boolean") {
    throw new Error("Invalid Kross operational snapshot source mode.");
  }
  assertMetrics(snapshot.metrics);

  const ageMs = Math.max(0, nowMs - sourceMs);
  const ageMinutes = Math.floor(ageMs / 60000);

  if (snapshot.sourceIsLive && ageMs <= CURRENT_WINDOW_MS) {
    return {
      state: "current",
      canClaimCurrent: true,
      sourceAsOf: snapshot.sourceAsOf,
      ageMinutes,
      label: "Kross autenticado · estado operativo actual",
      metrics: snapshot.metrics,
    };
  }

  if (ageMs <= RECENT_SNAPSHOT_WINDOW_MS) {
    return {
      state: "recent_snapshot",
      canClaimCurrent: false,
      sourceAsOf: snapshot.sourceAsOf,
      ageMinutes,
      label: `Snapshot operativo reciente · hace ${ageMinutes} min`,
      metrics: snapshot.metrics,
    };
  }

  return {
    state: "stale_snapshot",
    canClaimCurrent: false,
    sourceAsOf: snapshot.sourceAsOf,
    ageMinutes,
    label: `Snapshot operativo desactualizado · hace ${ageMinutes} min`,
    metrics: snapshot.metrics,
  };
}
