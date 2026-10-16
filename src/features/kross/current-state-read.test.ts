import { describe, expect, it } from "vitest";

import {
  evaluateKrossCurrentState,
  loadKrossCurrentStateWithClient,
  type KrossCurrentStateHealthRow,
  type KrossCurrentStateReservationRow,
} from "./current-state-read";
import type { SupabaseClient } from "@supabase/supabase-js";

const NOW = "2026-10-16T12:00:00.000Z";

function freshHealth(
  overrides: Partial<KrossCurrentStateHealthRow> = {},
): KrossCurrentStateHealthRow {
  return {
    property_id: "property-a",
    source_system: "Kross",
    source_name: "Kross reservation mirror",
    snapshot_kind: "reservation_mirror",
    row_count: 2,
    source_as_of: "2026-10-16T11:45:00.000Z",
    observed_at: "2026-10-16T11:46:00.000Z",
    live_required: true,
    use_as_current_state: true,
    freshness_status: "fresh",
    safe_for_current_state: true,
    ...overrides,
  };
}

function reservation(
  overrides: Partial<KrossCurrentStateReservationRow> = {},
): KrossCurrentStateReservationRow {
  return {
    id: "reservation-internal-a",
    property_id: "property-a",
    room_code_raw: "21",
    check_in: "2026-10-16",
    check_out: "2026-10-18",
    status: "confirmed",
    guests_count: 2,
    adults: 2,
    children: 0,
    channel: "direct",
    breakfast_included: true,
    snapshot_as_of: "2026-10-16T11:45:00.000Z",
    last_synced_at: "2026-10-16T11:46:00.000Z",
    movement: ["arrival"],
    transactional_authority: "Kross",
    read_only_mirror: true,
    source_is_live: true,
    source_system: "Kross",
    data_quality_status: "verified",
    ...overrides,
  };
}

describe("Kross current-state read projection", () => {
  it("returns only a minimized operational projection from a current promoted mirror", () => {
    const source = reservation() as KrossCurrentStateReservationRow & {
      guest_name: string;
      phone: string;
      email: string;
      total_amount: number;
      payment_status: string;
      external_reservation_id: string;
    };
    source.guest_name = "Sensitive Guest";
    source.phone = "+50600000000";
    source.email = "private@example.invalid";
    source.total_amount = 999;
    source.payment_status = "paid";
    source.external_reservation_id = "KROSS-SECRET-1";

    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "daily_movements",
        limit: 10,
      },
      healthRows: [freshHealth()],
      reservationRows: [source],
    });

    expect(result).toMatchObject({
      state: "READY",
      authoritySystem: "Kross",
      mirrorSystem: "Supabase",
      propertyId: "property-a",
      sourceAsOf: "2026-10-16T11:45:00.000Z",
      coverage: {
        matchedCount: 1,
        returnedCount: 1,
        truncated: false,
      },
      counts: { arrivals: 1, departures: 0 },
      rateAvailability: "SEPARATE_LIVE_AUTHORITY_REQUIRED",
    });
    expect(result.items).toEqual([
      {
        roomCode: "21",
        checkIn: "2026-10-16",
        checkOut: "2026-10-18",
        status: "confirmed",
        guestsCount: 2,
        adults: 2,
        children: 0,
        channel: "direct",
        breakfastIncluded: true,
        movement: ["arrival"],
      },
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /Sensitive Guest|private@example|50600000000|KROSS-SECRET|total_amount|payment_status|reservation-internal/,
    );
    expect(result.message).toContain("Fuente: Kross");
  });

  it("fails closed and returns no operational rows when the promoted source is stale", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "arrivals",
        limit: 10,
      },
      healthRows: [
        freshHealth({
          source_as_of: "2026-10-16T04:00:00.000Z",
          observed_at: "2026-10-16T04:01:00.000Z",
        }),
      ],
      reservationRows: [reservation()],
    });

    expect(result.state).toBe("STALE");
    expect(result.items).toEqual([]);
    expect(result.message).toContain("no es válido como estado actual");
  });

  it("does not promote a fresh-looking row without the current-state flag", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "departures",
        limit: 10,
      },
      healthRows: [freshHealth({ use_as_current_state: false })],
      reservationRows: [reservation()],
    });

    expect(result.state).toBe("STALE");
    expect(result.items).toEqual([]);
  });

  it("never lets a fresh rate or availability snapshot unlock reservation state", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "arrivals",
        limit: 10,
      },
      healthRows: [freshHealth({ snapshot_kind: "rate_availability" })],
      reservationRows: [reservation()],
    });

    expect(result.state).toBe("UNAVAILABLE");
    expect(result.reason).toBe("source_missing");
    expect(result.items).toEqual([]);
  });

  it("rejects future source timestamps", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "arrivals",
        limit: 10,
      },
      healthRows: [
        freshHealth({
          source_as_of: "2026-10-16T12:05:00.000Z",
          observed_at: "2026-10-16T12:06:00.000Z",
        }),
      ],
      reservationRows: [],
    });

    expect(result.state).toBe("STALE");
    expect(result.items).toEqual([]);
  });

  it("returns unavailable rather than interpreting a missing source as an empty hotel", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "daily_movements",
        limit: 10,
      },
      healthRows: [],
      reservationRows: [],
    });

    expect(result.state).toBe("UNAVAILABLE");
    expect(result.items).toEqual([]);
    expect(result.message).toContain("No puedo confirmar Kross ahora");
  });

  it("allows an explicit current zero-result query without claiming that the hotel is empty", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "arrivals",
        limit: 10,
      },
      healthRows: [freshHealth({ row_count: 0 })],
      reservationRows: [],
    });

    expect(result).toMatchObject({
      state: "READY",
      coverage: { matchedCount: 0, returnedCount: 0 },
      counts: { arrivals: 0, departures: 0 },
    });
    expect(result.message).toContain("No aparecen llegadas");
    expect(result.message).not.toMatch(/hotel vac[ií]o/i);
  });

  it("requires an explicit property when more than one current property exists", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        date: "2026-10-16",
        movement: "daily_movements",
        limit: 10,
      },
      healthRows: [
        freshHealth({ property_id: "property-a" }),
        freshHealth({ property_id: "property-b" }),
      ],
      reservationRows: [],
    });

    expect(result.state).toBe("UNAVAILABLE");
    expect(result.reason).toBe("property_choice_required");
  });

  it("fails the whole projection when any returned row is outside the six-hour ceiling", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "arrivals",
        limit: 10,
      },
      healthRows: [freshHealth()],
      reservationRows: [
        reservation({
          snapshot_as_of: "2026-10-16T03:00:00.000Z",
          last_synced_at: "2026-10-16T03:05:00.000Z",
        }),
      ],
    });

    expect(result.state).toBe("STALE");
    expect(result.items).toEqual([]);
  });

  it("fails closed when a mirror row omits or changes an authority proof", () => {
    const rowWithoutProof = {
      ...reservation(),
      source_is_live: undefined,
    } as unknown as KrossCurrentStateReservationRow;
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "arrivals",
        limit: 10,
      },
      healthRows: [freshHealth()],
      reservationRows: [rowWithoutProof],
    });

    expect(result.state).toBe("STALE");
    expect(result.reason).toBe("reservation_rows_stale");
    expect(result.items).toEqual([]);
  });

  it("deduplicates the same row returned as both arrival and departure", () => {
    const both = reservation({
      check_out: "2026-10-16",
      movement: ["arrival", "departure"],
    });
    const duplicate = { ...both, movement: ["departure"] as const };
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "daily_movements",
        limit: 10,
      },
      healthRows: [freshHealth()],
      reservationRows: [both, duplicate],
    });

    expect(result.state).toBe("READY");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.movement).toEqual(["arrival", "departure"]);
    expect(result.counts).toEqual({ arrivals: 1, departures: 1 });
  });

  it("applies a bounded result limit and labels truncation", () => {
    const result = evaluateKrossCurrentState({
      nowIso: NOW,
      query: {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "arrivals",
        limit: 1,
      },
      healthRows: [freshHealth()],
      reservationRows: [
        reservation(),
        reservation({ id: "reservation-internal-b", room_code_raw: "22" }),
      ],
    });

    expect(result.state).toBe("READY");
    expect(result.items).toHaveLength(1);
    expect(result.coverage).toEqual({
      matchedCount: 2,
      returnedCount: 1,
      truncated: true,
    });
  });

  it("loads only the safe view with an explicit PII-minimized select", async () => {
    const calls: Array<{
      schema: string;
      table: string;
      select: string;
      filters: Array<[string, unknown]>;
    }> = [];
    const fakeClient = {
      schema(schema: string) {
        return {
          from(table: string) {
            const call = {
              schema,
              table,
              select: "",
              filters: [] as Array<[string, unknown]>,
            };
            calls.push(call);
            const builder = {
              select(value: string) {
                call.select = value;
                return builder;
              },
              eq(column: string, value: unknown) {
                call.filters.push([column, value]);
                return builder;
              },
              ilike(column: string, value: unknown) {
                call.filters.push([column, value]);
                return builder;
              },
              order() {
                return builder;
              },
              limit() {
                if (table === "kross_snapshot_health") {
                  return Promise.resolve({ data: [freshHealth()], error: null });
                }
                return Promise.resolve({
                  data: [reservation()],
                  error: null,
                });
              },
            };
            return builder;
          },
        };
      },
    } as unknown as SupabaseClient;

    const result = await loadKrossCurrentStateWithClient(
      fakeClient,
      {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "arrivals",
        limit: 10,
      },
      new Date(NOW),
    );

    expect(result.state).toBe("READY");
    expect(calls.map((call) => `${call.schema}.${call.table}`)).toEqual([
      "integrations.kross_snapshot_health",
      "operations.current_reservations_safe",
    ]);
    expect(calls[1]?.select).not.toMatch(
      /guest_id|guest_key|phone|email|total_amount|amount_paid|payment_status|external_reservation_id/,
    );
    expect(calls[1]?.filters).toEqual(
      expect.arrayContaining([
        ["org_id", "org-a"],
        ["property_id", "property-a"],
        ["check_in", "2026-10-16"],
      ]),
    );
    expect(calls[0]?.filters).toEqual(
      expect.arrayContaining([
        ["org_id", "org-a"],
        ["source_system", "kross"],
        ["snapshot_kind", "reservation_mirror"],
        ["live_required", true],
      ]),
    );
  });

  it("does not query reservation rows when health is not direct, promoted and current", async () => {
    const tables: string[] = [];
    const fakeClient = {
      schema() {
        return {
          from(table: string) {
            tables.push(table);
            const builder = {
              select() {
                return builder;
              },
              eq() {
                return builder;
              },
              ilike() {
                return builder;
              },
              order() {
                return builder;
              },
              limit() {
                return Promise.resolve({
                  data: [
                    freshHealth({
                      source_system: "Kross v1/Airtable staging",
                    }),
                  ],
                  error: null,
                });
              },
            };
            return builder;
          },
        };
      },
    } as unknown as SupabaseClient;

    const result = await loadKrossCurrentStateWithClient(
      fakeClient,
      {
        orgId: "org-a",
        propertyId: "property-a",
        date: "2026-10-16",
        movement: "daily_movements",
        limit: 10,
      },
      new Date(NOW),
    );

    expect(result.state).toBe("UNAVAILABLE");
    expect(tables).toEqual(["kross_snapshot_health"]);
  });

  it("converts a thrown transport failure into UNAVAILABLE instead of leaking an exception", async () => {
    const throwingClient = {
      schema() {
        throw new Error("synthetic transport secret must not escape");
      },
    } as unknown as SupabaseClient;

    await expect(
      loadKrossCurrentStateWithClient(
        throwingClient,
        {
          orgId: "org-a",
          propertyId: "property-a",
          date: "2026-10-16",
          movement: "arrivals",
          limit: 10,
        },
        new Date(NOW),
      ),
    ).resolves.toMatchObject({
      state: "UNAVAILABLE",
      reason: "mirror_read_failed",
      items: [],
    });
  });
});
