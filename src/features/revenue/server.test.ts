import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToroSession, createServerSupabaseClient, redirect } = vi.hoisted(() => ({
  getToroSession: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("@/features/auth/session", () => ({ getToroSession }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { loadRevenueDirectory, normalizeRevenueFilters } from "./server";

function supabaseWith({
  access = true,
  accessError = null,
  rows = [],
  lookupError = null,
}: {
  access?: boolean;
  accessError?: { message?: string } | null;
  rows?: unknown[];
  lookupError?: { message?: string } | null;
} = {}) {
  const rpc = vi.fn(async (name: string, args?: Record<string, unknown>) => {
    if (name === "get_current_revenue_access") {
      return { data: access, error: accessError };
    }
    if (name === "get_agency_rate_lookup") {
      return { data: rows, error: lookupError };
    }
    throw new Error(`unexpected rpc:${name}:${JSON.stringify(args)}`);
  });
  return { rpc };
}

const founder = {
  userId: "00000000-0000-0000-0000-000000000001",
  role: "FOUNDER",
  navRole: "FOUNDER",
  displayName: "Founder",
  memberships: [],
};

describe("normalizeRevenueFilters", () => {
  it("normalizes bounded private lookup filters", () => {
    expect(normalizeRevenueFilters({
      agencyKey: " Best_Of_Costa_Rica ",
      roomNumber: "25",
      stayDate: "2026-12-15",
      seasonCode: " green ",
    })).toEqual({
      agencyKey: "best_of_costa_rica",
      roomNumber: 25,
      stayDate: "2026-12-15",
      seasonCode: "GREEN",
    });
  });

  it("rejects malformed room/date filters", () => {
    expect(() => normalizeRevenueFilters({ roomNumber: "x" })).toThrow(/room/i);
    expect(() => normalizeRevenueFilters({ stayDate: "2026-02-30" })).toThrow(/date/i);
  });
});

describe("loadRevenueDirectory", () => {
  beforeEach(() => {
    getToroSession.mockReset();
    createServerSupabaseClient.mockReset();
    redirect.mockClear();
    getToroSession.mockResolvedValue(founder);
  });

  it("requires TORO authentication", async () => {
    getToroSession.mockResolvedValue(null);
    await expect(loadRevenueDirectory({})).rejects.toThrow("redirect:/login?next=/toro/revenue");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("keeps Revenue out of unrelated TORO roles", async () => {
    getToroSession.mockResolvedValue({ ...founder, role: "RECEPCION", navRole: "RECEPCION" });
    await expect(loadRevenueDirectory({})).rejects.toThrow("redirect:/toro");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("uses canonical revenue access and lookup RPCs without a second login", async () => {
    const rows = [{
      agency_key: "best_of_costa_rica",
      agency_name: "Best of Costa Rica",
      room_number: 25,
      room_name: "#25",
      season_code: "GREEN",
      starts_on: "2026-11-01",
      ends_on: "2026-12-19",
      currency: "USD",
      base_rack_rate: 100,
      rack_rate: 100,
      base_commission_rate: 0.15,
      commission_rate: 0.15,
      agency_earn_amount: 15,
      hotel_net_rate: 85,
      commercial_conditions: null,
      override_reason: null,
      override_active: false,
    }];
    const client = supabaseWith({ rows });
    createServerSupabaseClient.mockResolvedValue(client);

    const result = await loadRevenueDirectory({
      agencyKey: "best_of_costa_rica",
      roomNumber: "25",
      seasonCode: "GREEN",
    });

    expect(result.kind).toBe("ready");
    if (result.kind !== "ready") throw new Error("expected ready result");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ roomNumber: 25, hotelNetRate: 85 });
    expect(client.rpc).toHaveBeenNthCalledWith(1, "get_current_revenue_access");
    expect(client.rpc).toHaveBeenNthCalledWith(2, "get_agency_rate_lookup", {
      p_agency_key: "best_of_costa_rica",
      p_room_number: 25,
      p_stay_date: null,
      p_season_code: "GREEN",
    });
  });

  it("fails closed when canonical revenue access is denied", async () => {
    const client = supabaseWith({ access: false });
    createServerSupabaseClient.mockResolvedValue(client);

    await expect(loadRevenueDirectory({})).resolves.toEqual({
      kind: "forbidden",
      detail: "Tu identidad TORO no tiene acceso al módulo privado de Revenue.",
    });
    expect(client.rpc).toHaveBeenCalledTimes(1);
  });
});
