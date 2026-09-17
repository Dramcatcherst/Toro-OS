import type { ConnectorHealthRecord } from "@/lib/toro-types";

export type KrossFabricSource = {
  name: string;
  kind: string;
  rowCount: number;
  sourceAsOf: string | null;
  observedAt: string | null;
  liveRequired: boolean;
  freshness: string;
  safeForCurrentState: boolean;
};

export type KrossFabricHealth = {
  status: "verified" | "unverified";
  registeredSources: number;
  liveRequiredSources: number;
  safeForCurrentState: number;
  sourcesWithSourceAsOf: number;
  unsafeLiveRequiredSources: number;
  currentReservationRows: number;
  latestObservedAt: string | null;
  detail: string;
  sources: KrossFabricSource[];
};

export type SystemsHealthData = {
  connectorHealth: {
    records: ConnectorHealthRecord[];
    summary: {
      live: number;
      configured: number;
      blocked: number;
      degraded: number;
    };
  };
  krossFabric: KrossFabricHealth;
};
