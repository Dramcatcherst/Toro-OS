import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getToroSession,
  getConnectorHealth,
  createServerSupabaseClient,
  redirect,
  krossQuery,
  reservationQuery,
} = vi.hoisted(() => ({
  getToroSession: vi.fn(),
  getConnectorHealth: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  krossQuery: {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  },
  reservationQuery: {
    select: vi.fn(),
  },
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));
vi.mock("@/lib/server/connector-health", () => ({ getConnectorHealth }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { loadSystemsHealth } from "./server";

const founder = {
  userId: "00000000-0000-0000-0000-000000000001",
  role: "FOUNDER",
  navRole: "FOUNDER",
  displayName: "Founder",
  memberships: [],
};

const health = {
  records: [
    {
      id: "supabase",
      name: "Supabase",
      live: true,
      configured: true,
      mode: "live_read",
      health: "reachable",
      checkedAt: "2026-09-17T22:09:00.000Z",
      detail: "Supabase respondió a una prueba read-only.",
      source: "runtime",
      status: "Active",
      risk: "High",
      confidence: 96,
      approval: "Human review",
      nextAction: "Observe",
    },
  ],
  summary: { live: 1, configured: 1, blocked: 0, degraded: 0 },
};

const krossRows = [
  {
    source_name: "Kross Reservations",
    snapshot_kind: "reservation_planner_snapshot",
    row_count: 0,
    source_as_of: null,
    observed_at: "2026-09-12T18:38:12.546183+00:00",
    live_required: true,
    freshness_status: "unknown",
    safe_for_current_state: false,
  },
  {
    source_name: "Kross Core Guests",
    snapshot_kind: "guest_directory_snapshot",
    row_count: 0,
    source_as_of: null,
    observed_at: "2026-09-12T18:38:12.546183+00:00",
    live_required: false,
    freshness_status: "unknown",
    safe_for_current_state: true,
  },
];

describe("loadSystemsHealth", () => {
  beforeEach(() => {
    getToroSession.mockReset();
    getConnectorHealth.mockReset();
    createServerSupabaseClient.mockReset();
    redirect.mockClear();

    krossQuery.select.mockReset();
    krossQuery.order.mockReset();
    krossQuery.limit.mockReset();
    reservationQuery.select.mockReset();

    getToroSession.mockResolvedValue(founder);
    getConnectorHealth.mockResolvedValue(health);

    krossQuery.select.mockReturnValue(krossQuery);
    krossQuery.order.mockReturnValue(krossQuery);
    krossQuery.limit.mockResolvedValue({ data: krossRows, error: null });

    reservationQuery.select.mockResolvedValue({
      data: null,
      count: 0,
      error: null,
    });

    createServerSupabaseClient.mockResolvedValue({
      schema: vi.fn((schema: string) => ({
        from: vi.fn((table: string) => {
          if (schema === "integrations" && table === "kross_snapshot_health") return krossQuery;
          if (schema === "operations" && table === "current_reservations_safe") return reservationQuery;
          throw new Error(`unexpected table ${schema}.${table}`);
        }),
      })),
    });
  });

  it("requires an authenticated Founder or Systems role", async () => {
    getToroSession.mockResolvedValue(null);
    await expect(loadSystemsHealth()).rejects.toThrow("redirect:/login?next=/toro/sistemas");
    expect(getConnectorHealth).not.toHaveBeenCalled();
    expect(createServerSupabaseClient).not.toHaveBeenCalled();

    getToroSession.mockResolvedValue({ ...founder, role: "RECEPCION", navRole: "RECEPCION" });
    await expect(loadSystemsHealth()).rejects.toThrow("redirect:/toro");
    expect(getConnectorHealth).not.toHaveBeenCalled();
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("adds governed Kross snapshot evidence without treating zero current rows as zero reservations", async () => {
    const result = await loadSystemsHealth();

    expect(result.connectorHealth).toEqual(health);
    expect(result.krossFabric).toEqual({
      status: "unverified",
      registeredSources: 2,
      liveRequiredSources: 1,
      safeForCurrentState: 1,
      sourcesWithSourceAsOf: 0,
      unsafeLiveRequiredSources: 1,
      currentReservationRows: 0,
      latestObservedAt: "2026-09-12T18:38:12.546183+00:00",
      detail:
        "No hay feed Kross actual verificable. 0 filas en current_reservations_safe no significa 0 reservas del hotel.",
      sources: [
        {
          name: "Kross Reservations",
          kind: "reservation_planner_snapshot",
          rowCount: 0,
          sourceAsOf: null,
          observedAt: "2026-09-12T18:38:12.546183+00:00",
          liveRequired: true,
          freshness: "unknown",
          safeForCurrentState: false,
        },
        {
          name: "Kross Core Guests",
          kind: "guest_directory_snapshot",
          rowCount: 0,
          sourceAsOf: null,
          observedAt: "2026-09-12T18:38:12.546183+00:00",
          liveRequired: false,
          freshness: "unknown",
          safeForCurrentState: true,
        },
      ],
    });

    expect(krossQuery.select).toHaveBeenCalledWith(
      "source_name,snapshot_kind,row_count,source_as_of,observed_at,live_required,freshness_status,safe_for_current_state",
    );
    expect(krossQuery.limit).toHaveBeenCalledWith(50);
    expect(reservationQuery.select).toHaveBeenCalledWith("id", {
      count: "exact",
      head: true,
    });
  });

  it("allows Founder and Systems to read the same governed health shape", async () => {
    const founderResult = await loadSystemsHealth();
    expect(founderResult.connectorHealth).toEqual(health);

    getToroSession.mockResolvedValue({ ...founder, role: "SYSTEMS", navRole: "SYSTEMS" });
    const systemsResult = await loadSystemsHealth();
    expect(systemsResult.krossFabric.registeredSources).toBe(2);
    expect(getConnectorHealth).toHaveBeenCalledTimes(2);
  });

  it("fails closed if Kross Data Fabric health cannot be read", async () => {
    krossQuery.limit.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });

    await expect(loadSystemsHealth()).rejects.toThrow(/Kross Data Fabric/i);
  });
});
