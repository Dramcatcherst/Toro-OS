import "server-only";

import { classifyOperationalSnapshot, type ClassifiedOperationalSnapshot } from "@/features/hotel/operational-snapshot";
import type { ConnectorHealthRecord } from "@/lib/toro-types";

import { getConnectorHealth } from "./connector-health";
import { formatOperationalStatusForChat } from "./operational-status-message";

type ConnectorHealthData = Awaited<ReturnType<typeof getConnectorHealth>>;

type PublicSourceHealth = Pick<
  ConnectorHealthRecord,
  "id" | "name" | "health" | "checkedAt" | "live" | "detail"
>;

export type ToroOperationalStatus = {
  version: "v1";
  generatedAt: string;
  currentHotelClaimsAllowed: boolean;
  hotel: ClassifiedOperationalSnapshot;
  sources: {
    summary: ConnectorHealthData["summary"];
    records: PublicSourceHealth[];
  };
  warnings: string[];
  chatSummary: string;
};

export function buildOperationalStatus(input: {
  connectorHealth: ConnectorHealthData;
  hotelOperational: ClassifiedOperationalSnapshot;
  generatedAt?: string;
}): ToroOperationalStatus {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const kross = input.connectorHealth.records.find((record) => record.id === "kross");
  const warnings: string[] = [];

  if (!input.hotelOperational.canClaimCurrent) {
    warnings.push(
      input.hotelOperational.state === "unavailable"
        ? "Kross no tiene un snapshot operativo verificable; no afirmar ocupación, llegadas, salidas ni huéspedes en casa como actuales."
        : `Kross operativo disponible solo como ${input.hotelOperational.state}; usar sourceAsOf y no presentarlo como estado actual.`,
    );
  }

  if (!kross || kross.health !== "reachable") {
    warnings.push("Kross PMS autenticado no está verificado como reachable en este estado runtime.");
  }

  if (input.connectorHealth.summary.degraded > 0) {
    warnings.push(`${input.connectorHealth.summary.degraded} fuente(s) runtime están degradadas.`);
  }

  const base = {
    version: "v1" as const,
    generatedAt,
    currentHotelClaimsAllowed: input.hotelOperational.canClaimCurrent,
    hotel: input.hotelOperational,
    sources: {
      summary: input.connectorHealth.summary,
      records: input.connectorHealth.records.map((record) => ({
        id: record.id,
        name: record.name,
        health: record.health,
        checkedAt: record.checkedAt,
        live: record.live,
        detail: record.detail,
      })),
    },
    warnings,
  };

  return {
    ...base,
    chatSummary: formatOperationalStatusForChat(base),
  };
}

export async function getOperationalStatus(): Promise<ToroOperationalStatus> {
  const connectorHealth = await getConnectorHealth();

  // No canonical current Kross mirror exists yet. Keep this fail-closed until
  // an authenticated aggregate or governed recent snapshot is wired here.
  const hotelOperational = classifyOperationalSnapshot(null);

  return buildOperationalStatus({ connectorHealth, hotelOperational });
}
