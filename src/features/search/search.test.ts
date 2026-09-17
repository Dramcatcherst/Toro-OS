import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ rpc }),
}));

import { searchToro } from "./server";

describe("searchToro", () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it("returns no results and performs no RPC for an empty query", async () => {
    await expect(searchToro("   ")).resolves.toEqual([]);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps only authorization-safe result fields and disables destinations that are not implemented", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          entity_type: "room",
          entity_id: "00000000-0000-0000-0000-000000000001",
          title: "Habitación 25",
          subtitle: "Toro Villa",
          destination_path: "/toro/hotel?room=00000000-0000-0000-0000-000000000001",
          freshness: "2026-09-14T21:50:00Z",
          private_payload: "must-not-leak",
        },
      ],
      error: null,
    });

    await expect(searchToro("25")).resolves.toEqual([
      {
        entityType: "room",
        id: "00000000-0000-0000-0000-000000000001",
        title: "Habitación 25",
        subtitle: "Toro Villa",
        href: null,
        freshness: "2026-09-14T21:50:00Z",
      },
    ]);
  });

  it("makes only canonical Room 360 destinations actionable for room results", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          entity_type: "room",
          entity_id: "00000000-0000-0000-0000-000000000025",
          title: "Habitación 25",
          subtitle: "suite · Hab. 25",
          destination_path: "/toro/habitaciones/DC-ROOM-25",
          freshness: "2026-09-17T18:30:00Z",
        },
      ],
      error: null,
    });

    await expect(searchToro("25")).resolves.toEqual([
      {
        entityType: "room",
        id: "00000000-0000-0000-0000-000000000025",
        title: "Habitación 25",
        subtitle: "suite · Hab. 25",
        href: "/toro/habitaciones/DC-ROOM-25",
        freshness: "2026-09-17T18:30:00Z",
      },
    ]);
  });

  it("makes only UUID-scoped TORO project destinations actionable", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          entity_type: "project",
          entity_id: "00000000-0000-0000-0000-000000000021",
          title: "TORO Executive Control",
          subtitle: "systems · In Progress",
          destination_path: "/toro/proyectos?project=00000000-0000-0000-0000-000000000021",
          freshness: "2026-09-15T14:45:16.838Z",
        },
        {
          entity_type: "project",
          entity_id: "00000000-0000-0000-0000-000000000022",
          title: "Bad path",
          subtitle: null,
          destination_path: "/toro/proyectos?project=not-a-uuid",
          freshness: null,
        },
      ],
      error: null,
    });

    await expect(searchToro("TORO")).resolves.toEqual([
      {
        entityType: "project",
        id: "00000000-0000-0000-0000-000000000021",
        title: "TORO Executive Control",
        subtitle: "systems · In Progress",
        href: "/toro/proyectos?project=00000000-0000-0000-0000-000000000021",
        freshness: "2026-09-15T14:45:16.838Z",
      },
      {
        entityType: "project",
        id: "00000000-0000-0000-0000-000000000022",
        title: "Bad path",
        subtitle: null,
        href: null,
        freshness: null,
      },
    ]);
  });

  it("keeps only explicitly implemented TORO destinations actionable", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          entity_type: "knowledge",
          entity_id: "00000000-0000-0000-0000-000000000002",
          title: "Decisiones",
          subtitle: null,
          destination_path: "/toro/decisiones",
          freshness: null,
        },
      ],
      error: null,
    });

    await expect(searchToro("decisiones")).resolves.toEqual([
      {
        entityType: "knowledge",
        id: "00000000-0000-0000-0000-000000000002",
        title: "Decisiones",
        subtitle: null,
        href: "/toro/decisiones",
        freshness: null,
      },
    ]);
  });

  it("rejects unsupported entity types instead of rendering privileged payloads", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          entity_type: "finance_secret",
          entity_id: "00000000-0000-0000-0000-000000000001",
          title: "Cuenta",
          subtitle: null,
          destination_path: "/toro/dinero",
          freshness: null,
        },
      ],
      error: null,
    });

    await expect(searchToro("cuenta")).rejects.toThrow(/search result/i);
  });

  it("normalizes the query and caps result count server-side", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    await searchToro("  habitación 25  ");
    expect(rpc).toHaveBeenCalledWith("search_toro", {
      p_query: "habitación 25",
      p_limit: 12,
    });
  });

  it("fails closed on RPC errors", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });
    await expect(searchToro("hotel")).rejects.toThrow(/permission denied/i);
  });
});
