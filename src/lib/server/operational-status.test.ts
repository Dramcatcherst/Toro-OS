import { describe, expect, it } from "vitest";

import { buildOperationalStatus } from "./operational-status";

const connectorHealth = {
  records: [
    {
      id: "supabase",
      name: "Supabase",
      live: true,
      configured: true,
      mode: "live_read" as const,
      health: "reachable" as const,
      checkedAt: "2026-09-17T22:30:00.000Z",
      detail: "Runtime reachable.",
      source: "runtime",
      status: "Active" as const,
      risk: "High" as const,
      confidence: 96,
      approval: "Human review" as const,
      nextAction: "Observe",
    },
    {
      id: "kross",
      name: "Kross PMS",
      live: false,
      configured: true,
      mode: "read_only" as const,
      health: "configured_unverified" as const,
      checkedAt: "2026-09-17T22:30:00.000Z",
      detail: "Motor público reachable. Operación autenticada no verificada.",
      source: "Kross",
      status: "Review" as const,
      risk: "Critical" as const,
      confidence: 92,
      approval: "Owner approval" as const,
      nextAction: "Verify authenticated read.",
    },
  ],
  summary: { live: 1, configured: 2, blocked: 0, degraded: 0 },
};

const unavailableHotel = {
  state: "unavailable" as const,
  canClaimCurrent: false,
  sourceAsOf: null,
  ageMinutes: null,
  label: "Sin snapshot operativo verificable",
  metrics: null,
};

describe("buildOperationalStatus", () => {
  it("builds one PII-free envelope and refuses current hotel claims without verified Kross data", () => {
    const result = buildOperationalStatus({
      connectorHealth,
      hotelOperational: unavailableHotel,
      generatedAt: "2026-09-17T22:31:00.000Z",
    });

    expect(result).toMatchObject({
      version: "v1",
      generatedAt: "2026-09-17T22:31:00.000Z",
      currentHotelClaimsAllowed: false,
      hotel: unavailableHotel,
      sources: {
        summary: connectorHealth.summary,
      },
    });
    expect(result.sources.records).toEqual([
      {
        id: "supabase",
        name: "Supabase",
        health: "reachable",
        checkedAt: "2026-09-17T22:30:00.000Z",
        live: true,
        detail: "Runtime reachable.",
      },
      {
        id: "kross",
        name: "Kross PMS",
        health: "configured_unverified",
        checkedAt: "2026-09-17T22:30:00.000Z",
        live: false,
        detail: "Motor público reachable. Operación autenticada no verificada.",
      },
    ]);
    expect(result.warnings.join(" ")).toMatch(/Kross/i);
    expect(JSON.stringify(result)).not.toMatch(/email|guest_name|phone|password|token/i);
  });

  it("allows current claims only when the governed hotel snapshot allows it", () => {
    const currentHotel = {
      state: "current" as const,
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
    };

    const result = buildOperationalStatus({
      connectorHealth,
      hotelOperational: currentHotel,
      generatedAt: "2026-09-17T22:31:00.000Z",
    });

    expect(result.currentHotelClaimsAllowed).toBe(true);
    expect(result.warnings.some((warning) => /sin snapshot operativo/i.test(warning))).toBe(false);
  });
});
