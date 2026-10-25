import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";
import { loadKrossOperationalSnapshotWithClient } from "./operational-read";

const orgId = "00000000-0000-4000-8000-000000000001";
const propertyId = "00000000-0000-4000-8000-000000000002";
const context: ToroResolvedContext = {
  userId: "user-1", email: null, displayName: "Synthetic manager", mode: "organization", orgId,
  membership: { orgId, membershipId: "member-1", membershipType: "employee", status: "active",
    roles: ["GERENCIA"], employeeId: "employee-1", source: "organization_memberships" },
  availableOrgIds: [orgId], allowedDataScopes: ["work_org"], allowedTools: [],
  canUsePersonalVault: false, canUseOrganizationData: true, requiresContextChoice: false,
};
const row = { org_id: orgId, property_id: propertyId, external_reservation_id: "synthetic-r1",
  check_in: "2026-10-24", check_out: "2026-10-25", status: "CONF", source_system: "Kross",
  transactional_authority: "Kross", read_only_mirror: true, source_is_live: false,
  snapshot_as_of: "2026-10-25T00:15:00Z", last_synced_at: "2026-10-25T00:16:00Z",
  source_hash: "synthetic-hash", data_quality_status: "review" };
const input = { propertyId, asOf: new Date("2026-10-25T00:30:00Z") };

function fixture(data: unknown = [row], error: unknown = null, count: number | null = 1) {
  const q = { select: vi.fn(), eq: vi.fn(), lte: vi.fn(), gte: vi.fn(), order: vi.fn(), limit: vi.fn(), abortSignal: vi.fn() };
  for (const key of ["select", "eq", "lte", "gte", "order", "limit"] as const) q[key].mockReturnValue(q);
  q.abortSignal.mockResolvedValue({ data, error, count });
  const from = vi.fn().mockReturnValue(q);
  const client = { schema: vi.fn().mockReturnValue({ from }) };
  return { client, q };
}

describe("canonical informational Kross read", () => {
  beforeEach(() => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
    vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "direct");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("reads the existing mirror with explicit org/property and Costa Rica date", async () => {
    const { client, q } = fixture();
    const result = await loadKrossOperationalSnapshotWithClient(context, client as never, input);
    expect(result.state).toBe("snapshot");
    expect(result.counts?.observedScheduledArrivals).toBe(1);
    expect(result.reportingDate).toBe("2026-10-24");
    expect(q.eq).toHaveBeenCalledWith("org_id", orgId);
    expect(q.eq).toHaveBeenCalledWith("property_id", propertyId);
    expect(q.lte).toHaveBeenCalledWith("check_in", "2026-10-24");
    expect(q.gte).toHaveBeenCalledWith("check_out", "2026-10-24");
    expect(q.limit).toHaveBeenCalledWith(201);
    expect(q.abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(q.select.mock.calls[0][0]).not.toMatch(/guest|phone|amount|payment|breakfast/);
  });
  it("preserves the existing read flag before touching the data client", async () => {
    vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "false");
    const { client } = fixture();
    await expect(loadKrossOperationalSnapshotWithClient(context, client as never, input))
      .resolves.toMatchObject({ state: "unavailable", reason: "read_disabled" });
    expect(client.schema).not.toHaveBeenCalled();
  });
  it("keeps the first slice manager-only instead of granting a role through recognition", async () => {
    const { client } = fixture();
    const employee = { ...context, membership: { ...context.membership!, roles: ["EMPLEADO" as const] } };
    await expect(loadKrossOperationalSnapshotWithClient(employee, client as never, input))
      .resolves.toMatchObject({ state: "forbidden" });
    expect(client.schema).not.toHaveBeenCalled();
  });
  it("denies cross-org membership and personal scope before reading", async () => {
    for (const invalid of [{ ...context, membership: { ...context.membership!, orgId: "other" } },
      { ...context, mode: "personal" as const }, { ...context, requiresContextChoice: true }]) {
      const { client } = fixture();
      expect((await loadKrossOperationalSnapshotWithClient(invalid, client as never, input)).state).toBe("forbidden");
      expect(client.schema).not.toHaveBeenCalled();
    }
  });
  it("does not downgrade the Portal session RPC into direct reservation access", async () => {
    vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "rpc_v1");
    const { client } = fixture();
    expect((await loadKrossOperationalSnapshotWithClient(context, client as never, input)).state).toBe("unavailable");
    expect(client.schema).not.toHaveBeenCalled();
  });
  it("rejects malformed property and request time without a query", async () => {
    for (const invalid of [{ ...input, propertyId: "other/.eq" }, { ...input, asOf: new Date("invalid") }]) {
      const { client } = fixture();
      expect((await loadKrossOperationalSnapshotWithClient(context, client as never, invalid)).state).toBe("unavailable");
      expect(client.schema).not.toHaveBeenCalled();
    }
  });
  it("preserves stale/empty/error distinctions without leaking provider details", async () => {
    const stale = fixture([{ ...row, snapshot_as_of: "2026-10-20T22:00:00Z" }]);
    expect((await loadKrossOperationalSnapshotWithClient(context, stale.client as never, input)).state).toBe("stale");
    const empty = fixture([], null, 0);
    expect((await loadKrossOperationalSnapshotWithClient(context, empty.client as never, input)).counts).toBeNull();
    const failed = fixture(null, { message: "SYNTHETIC_PRIVATE_HEADER" }, null);
    const result = await loadKrossOperationalSnapshotWithClient(context, failed.client as never, input);
    expect(result.state).toBe("unavailable");
    expect(JSON.stringify(result)).not.toContain("SYNTHETIC_PRIVATE_HEADER");
  });
  it("reports truncation from exact query count without claiming full coverage", async () => {
    const { client } = fixture([row], null, 500);
    const result = await loadKrossOperationalSnapshotWithClient(context, client as never, input);
    expect(result.coverage?.truncated).toBe(true);
    expect(result.coverage?.completeness).toBe("unverified");
  });
});
