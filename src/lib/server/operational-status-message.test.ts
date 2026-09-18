import { describe, expect, it } from "vitest";

import { formatOperationalStatusForChat } from "./operational-status-message";

const sources = {
  summary: { live: 2, configured: 4, blocked: 1, degraded: 0 },
  records: [
    {
      id: "kross",
      name: "Kross PMS",
      health: "configured_unverified" as const,
      checkedAt: "2026-09-17T22:30:00.000Z",
      live: false,
      detail: "Motor público Kross reachable. Operación autenticada no verificada.",
    },
  ],
};

describe("formatOperationalStatusForChat", () => {
  it("gives an honest compact WhatsApp response when Kross operations are unavailable", () => {
    const text = formatOperationalStatusForChat({
      version: "v1",
      generatedAt: "2026-09-17T22:31:00.000Z",
      currentHotelClaimsAllowed: false,
      hotel: {
        state: "unavailable",
        canClaimCurrent: false,
        sourceAsOf: null,
        ageMinutes: null,
        label: "Sin snapshot operativo verificable",
        metrics: null,
      },
      sources,
      warnings: ["Kross PMS autenticado no está verificado como reachable en este estado runtime."],
    });

    expect(text).toMatch(/Estado del hotel/i);
    expect(text).toMatch(/Kross.*operación autenticada no verificada/i);
    expect(text).toMatch(/ocupación.*no disponible/i);
    expect(text).toMatch(/llegadas.*no disponible/i);
    expect(text).toMatch(/salidas.*no disponible/i);
    expect(text).not.toMatch(/0%|0 llegadas|0 salidas/i);
    expect(text).not.toMatch(/guest|teléfono|email|password|token/i);
  });

  it("includes aggregate current metrics and source timestamp when current claims are allowed", () => {
    const text = formatOperationalStatusForChat({
      version: "v1",
      generatedAt: "2026-09-17T22:31:00.000Z",
      currentHotelClaimsAllowed: true,
      hotel: {
        state: "current",
        canClaimCurrent: true,
        sourceAsOf: "2026-09-17T22:25:00.000Z",
        ageMinutes: 6,
        label: "Kross autenticado · estado operativo actual",
        metrics: {
          occupancyPct: 60,
          arrivals: 2,
          departures: 1,
          inHouse: 8,
          availableRooms: 8,
          occupiedRooms: 12,
          blockedRooms: 0,
          reservations: 13,
        },
      },
      sources: {
        ...sources,
        records: [{ ...sources.records[0], health: "reachable" as const, live: true, detail: "Kross operativo reachable." }],
      },
      warnings: [],
    });

    expect(text).toMatch(/Ocupación: 60%/i);
    expect(text).toMatch(/Llegadas: 2/i);
    expect(text).toMatch(/Salidas: 1/i);
    expect(text).toMatch(/En casa: 8/i);
    expect(text).toMatch(/2026-09-17T22:25:00.000Z/);
  });
});
