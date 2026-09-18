import { describe, expect, it } from "vitest";

import { classifyOperationalSnapshot } from "./operational-snapshot";

const metrics = {
  occupancyPct: 65,
  arrivals: 3,
  departures: 2,
  inHouse: 9,
  availableRooms: 7,
  occupiedRooms: 13,
  blockedRooms: 0,
  reservations: 14,
};

describe("classifyOperationalSnapshot", () => {
  const now = Date.parse("2026-09-17T22:30:00.000Z");

  it("allows a current claim only for a live authenticated source within the current window", () => {
    const result = classifyOperationalSnapshot({
      sourceAsOf: "2026-09-17T22:20:00.000Z",
      sourceIsLive: true,
      metrics,
    }, now);

    expect(result).toMatchObject({
      state: "current",
      canClaimCurrent: true,
      sourceAsOf: "2026-09-17T22:20:00.000Z",
      metrics,
    });
  });

  it("labels a recent non-live mirror as a snapshot and never as current", () => {
    const result = classifyOperationalSnapshot({
      sourceAsOf: "2026-09-17T21:45:00.000Z",
      sourceIsLive: false,
      metrics,
    }, now);

    expect(result.state).toBe("recent_snapshot");
    expect(result.canClaimCurrent).toBe(false);
    expect(result.label).toMatch(/snapshot/i);
  });

  it("marks old snapshots stale while preserving the exact source timestamp", () => {
    const result = classifyOperationalSnapshot({
      sourceAsOf: "2026-09-17T15:00:00.000Z",
      sourceIsLive: false,
      metrics,
    }, now);

    expect(result.state).toBe("stale_snapshot");
    expect(result.canClaimCurrent).toBe(false);
    expect(result.sourceAsOf).toBe("2026-09-17T15:00:00.000Z");
  });

  it("returns unavailable instead of zeros when no verified source exists", () => {
    const result = classifyOperationalSnapshot(null, now);

    expect(result).toEqual({
      state: "unavailable",
      canClaimCurrent: false,
      sourceAsOf: null,
      ageMinutes: null,
      label: "Sin snapshot operativo verificable",
      metrics: null,
    });
  });

  it("rejects invalid or impossible aggregate values", () => {
    expect(() => classifyOperationalSnapshot({
      sourceAsOf: "2026-09-17T22:20:00.000Z",
      sourceIsLive: true,
      metrics: { ...metrics, occupancyPct: 120 },
    }, now)).toThrow(/snapshot/i);

    expect(() => classifyOperationalSnapshot({
      sourceAsOf: "not-a-date",
      sourceIsLive: false,
      metrics,
    }, now)).toThrow(/snapshot/i);
  });
});
