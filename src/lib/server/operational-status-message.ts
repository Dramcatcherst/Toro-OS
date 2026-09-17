import type { ClassifiedOperationalSnapshot } from "@/features/hotel/operational-snapshot";
import type { ConnectorHealthRecord } from "@/lib/toro-types";

type StatusForChat = {
  version: "v1";
  generatedAt: string;
  currentHotelClaimsAllowed: boolean;
  hotel: ClassifiedOperationalSnapshot;
  sources: {
    summary: { live: number; configured: number; blocked: number; degraded: number };
    records: Array<Pick<ConnectorHealthRecord, "id" | "name" | "health" | "checkedAt" | "live" | "detail">>;
  };
  warnings: string[];
};

export function formatOperationalStatusForChat(status: StatusForChat): string {
  const kross = status.sources.records.find((record) => record.id === "kross");
  const lines = [`Estado del hotel — ${status.generatedAt}`];

  if (status.currentHotelClaimsAllowed && status.hotel.metrics) {
    const metrics = status.hotel.metrics;
    lines.push(
      "• Kross: operación autenticada verificada.",
      `• Ocupación: ${metrics.occupancyPct}%`,
      `• Llegadas: ${metrics.arrivals}`,
      `• Salidas: ${metrics.departures}`,
      `• En casa: ${metrics.inHouse}`,
      `• Habitaciones: ${metrics.availableRooms} disponibles · ${metrics.occupiedRooms} ocupadas · ${metrics.blockedRooms} bloqueadas`,
      `• Reservas: ${metrics.reservations}`,
      `• Fuente Kross: ${status.hotel.sourceAsOf}`,
    );
    return lines.join("\n");
  }

  if (kross?.health === "configured_unverified") {
    lines.push("• Kross: motor público reachable; operación autenticada no verificada.");
  } else if (kross?.health === "degraded") {
    lines.push("• Kross: degradado; operación autenticada no verificada.");
  } else {
    lines.push("• Kross: operación autenticada no verificada.");
  }

  if (status.hotel.metrics && status.hotel.sourceAsOf) {
    const metrics = status.hotel.metrics;
    lines.push(
      `• Snapshot: ${status.hotel.label}`,
      `• Ocupación de referencia: ${metrics.occupancyPct}%`,
      `• Llegadas de referencia: ${metrics.arrivals}`,
      `• Salidas de referencia: ${metrics.departures}`,
      `• Fuente: ${status.hotel.sourceAsOf}`,
      "• Nota: estos valores no se presentan como estado actual.",
    );
  } else {
    lines.push(
      "• Ocupación: no disponible como actual.",
      "• Llegadas: no disponibles como actuales.",
      "• Salidas: no disponibles como actuales.",
      "• En casa: no disponible como actual.",
      "• Fuente operativa: sin snapshot verificable.",
    );
  }

  return lines.join("\n");
}
