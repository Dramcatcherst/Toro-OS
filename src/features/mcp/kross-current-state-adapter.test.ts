import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";
import { runToroMcpReadTool } from "@/features/mcp/read-adapter-server";
import { toroMcpToolText } from "@/features/mcp/server";

const NOW = "2026-10-16T12:00:00.000Z";

function context(role: "GERENCIA" | "CONTABILIDAD"): ToroResolvedContext {
  return {
    userId: "synthetic-user",
    email: null,
    displayName: "Synthetic user",
    mode: "organization",
    orgId: "synthetic-org",
    membership: {
      orgId: "synthetic-org",
      membershipId: "synthetic-membership",
      membershipType: "employee",
      status: "active",
      roles: [role],
      employeeId: "synthetic-employee",
      source: "organization_memberships",
    },
    availableOrgIds: ["synthetic-org"],
    allowedDataScopes: ["work_org"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

function clientWithCurrentKrossState(queries: string[]): SupabaseClient {
  return {
    schema(schema: string) {
      return {
        from(table: string) {
          queries.push(`${schema}.${table}`);
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
              if (table === "kross_snapshot_health") {
                return Promise.resolve({
                  data: [{
                    property_id: "00000000-0000-4000-8000-000000000001",
                    source_system: "Kross",
                    source_name: "Kross reservation mirror",
                    snapshot_kind: "reservation_mirror",
                    row_count: 1,
                    source_as_of: "2026-10-16T11:45:00.000Z",
                    observed_at: "2026-10-16T11:46:00.000Z",
                    live_required: true,
                    use_as_current_state: true,
                    freshness_status: "fresh",
                    safe_for_current_state: true,
                  }],
                  error: null,
                });
              }
              return Promise.resolve({
                data: [{
                  id: "internal-reservation-id",
                  property_id: "00000000-0000-4000-8000-000000000001",
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
                  transactional_authority: "Kross",
                  read_only_mirror: true,
                  source_is_live: true,
                  source_system: "Kross",
                  data_quality_status: "verified",
                }],
                error: null,
              });
            },
          };
          return builder;
        },
      };
    },
  } as unknown as SupabaseClient;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Kross MCP current-state adapter", () => {
  it("returns a governed, non-authoritative Supabase projection for an allowed role", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
    const queries: string[] = [];

    const result = await runToroMcpReadTool(
      "get_hotel_current_state",
      {
        propertyId: "00000000-0000-4000-8000-000000000001",
        date: "2026-10-16",
        movement: "arrivals",
      },
      {
        context: context("GERENCIA"),
        supabase: clientWithCurrentKrossState(queries),
      },
    );

    expect(result.error).toBeUndefined();
    expect(result).toMatchObject({
      contractVersion: "1.1.0",
      tool: "get_hotel_current_state",
      context: {
        mode: "organization",
        scopeRef: expect.stringMatching(/^scope:[a-f0-9]{20}$/),
      },
      sources: [{
        sourceSystem: "Supabase Kross read-only mirror",
        authoritySystem: "Kross",
        freshness: "current",
        verification: "verified",
        authoritative: false,
      }],
      data: {
        state: "READY",
        authoritySystem: "Kross",
        mirrorSystem: "Supabase",
        coverage: { matchedCount: 1, returnedCount: 1 },
      },
    });
    expect(queries).toEqual([
      "integrations.kross_snapshot_health",
      "operations.current_reservations_safe",
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /internal-reservation-id|guest_name|phone|email|payment_status/,
    );
    expect(toroMcpToolText("get_hotel_current_state", result)).toContain(
      "Kross muestra 1 llegadas para 2026-10-16",
    );
  });

  it("blocks a role without reservation-read authority before any database read", async () => {
    const queries: string[] = [];
    const result = await runToroMcpReadTool(
      "get_hotel_current_state",
      {},
      {
        context: context("CONTABILIDAD"),
        supabase: clientWithCurrentKrossState(queries),
      },
    );

    expect(result.error?.code).toBe("forbidden");
    expect(queries).toEqual([]);
  });
});
