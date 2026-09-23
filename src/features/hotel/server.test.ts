import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

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

import { loadHotelDirectory } from "./server";

function query(result: { data: unknown[] | null; error: { message?: string } | null }) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(async () => result),
  };
  return chain;
}

const founderSession = {
  userId: "00000000-0000-0000-0000-000000000001",
  role: "FOUNDER",
  navRole: "FOUNDER",
  displayName: "Founder",
  memberships: [],
};

describe("loadHotelDirectory", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-17T21:20:00.000Z"));
    getToroSession.mockReset();
    createServerSupabaseClient.mockReset();
    redirect.mockClear();
    getToroSession.mockResolvedValue(founderSession);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("requires an authenticated operational hotel role", async () => {
    getToroSession.mockResolvedValue(null);
    await expect(loadHotelDirectory()).rejects.toThrow("redirect:/login?next=/toro/hotel");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();

    getToroSession.mockResolvedValue({ ...founderSession, role: "FINANZAS", navRole: "FINANZAS" });
    await expect(loadHotelDirectory()).rejects.toThrow("redirect:/toro");
    expect(createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it.each(["FOUNDER", "GERENCIA", "RECEPCION", "OPERACIONES"])(
    "allows %s to read safe active room metadata",
    async (role) => {
      getToroSession.mockResolvedValue({ ...founderSession, role, navRole: role });
      const roomQuery = query({
        data: [
          {
            id: "00000000-0000-0000-0000-000000000025",
            room_number: 25,
            name_es: "Suite premium cinema",
            name_en: "Premium cinema suite",
            room_type: "suite",
            max_capacity: 5,
            kitchen_type: "private",
            verified_status: "verified",
            last_reviewed: "2026-09-14",
            updated_at: "2026-09-14T09:59:49.828Z",
            room_page_copy_es: "must-not-leak",
            source_record_id: "must-not-leak",
          },
        ],
        error: null,
      });
      const gateQuery = query({
        data: [
          {
            room_id: "00000000-0000-0000-0000-000000000025",
            gate_status: "HUMAN_QA_REQUIRED",
            gate_reason: "Fresh housekeeping QA and human reception release are required.",
            p0_blocker_count: 0,
            p1_attention_count: 0,
            recent_unresolved_evidence_count: 0,
            open_task_summary: null,
            calculated_at_cr: "2026-09-19T12:02:05.000Z",
          },
        ],
        error: null,
      });
      const schema = vi.fn((name: string) => ({
        from: (table: string) => {
          if (name === "core" && table === "rooms") return roomQuery;
          if (name === "operations" && table === "room_operational_gate") return gateQuery;
          throw new Error(`unexpected source:${name}.${table}`);
        },
      }));
      createServerSupabaseClient.mockResolvedValue({ schema });

      const data = await loadHotelDirectory();

      expect(data.rooms).toEqual([
        {
          id: "00000000-0000-0000-0000-000000000025",
          roomNumber: 25,
          title: "Suite premium cinema",
          roomType: "suite",
          maxCapacity: 5,
          kitchenType: "private",
          verifiedStatus: "verified",
          lastReviewed: "2026-09-14",
          freshness: "2026-09-14T09:59:49.828Z",
          room360Key: "DC-ROOM-25",
          operationalGate: {
            status: "HUMAN_QA_REQUIRED",
            reason: "Fresh housekeeping QA and human reception release are required.",
            p0BlockerCount: 0,
            p1AttentionCount: 0,
            recentUnresolvedEvidenceCount: 0,
            openTaskSummary: null,
            calculatedAtCr: "2026-09-19T12:02:05.000Z",
          },
        },
      ]);
      expect(JSON.stringify(data)).not.toContain("must-not-leak");
      expect(roomQuery.select).toHaveBeenCalledWith(
        "id,room_number,name_es,name_en,room_type,max_capacity,kitchen_type,verified_status,last_reviewed,updated_at",
      );
      expect(roomQuery.eq).toHaveBeenCalledWith("active", true);
      expect(roomQuery.limit).toHaveBeenCalledWith(50);
      expect(data.source.status).toBe("stale");
      expect(data.source.latestAt).toBe("2026-09-14T09:59:49.828Z");
    },
  );

  it("fails closed on source errors or malformed room rows", async () => {
    const failedQuery = query({ data: null, error: { message: "permission denied" } });
    createServerSupabaseClient.mockResolvedValue({ schema: () => ({ from: () => failedQuery }) });
    await expect(loadHotelDirectory()).rejects.toThrow(/permission denied/i);

    const malformedQuery = query({
      data: [{ id: "bad", room_number: 25, name_es: "Bad", name_en: null, room_type: "suite", max_capacity: 2, kitchen_type: null, verified_status: "verified", last_reviewed: null, updated_at: "bad-date" }],
      error: null,
    });
    createServerSupabaseClient.mockResolvedValue({ schema: () => ({ from: () => malformedQuery }) });
    await expect(loadHotelDirectory()).rejects.toThrow(/hotel room payload/i);
  });
});
