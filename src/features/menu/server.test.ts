import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";
import { projectKrossOperationalSnapshot } from "@/features/kross/operational-snapshot";

const { resolveToroContextMock, createClientMock, krossReadMock, brainReadMock } = vi.hoisted(() => ({
  resolveToroContextMock: vi.fn(),
  createClientMock: vi.fn(),
  krossReadMock: vi.fn(),
  brainReadMock: vi.fn(),
}));

vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: resolveToroContextMock,
}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: createClientMock }));
vi.mock("@/features/kross/operational-read", () => ({ loadKrossOperationalSnapshotWithClient: krossReadMock }));
vi.mock("@/features/brain/canonical-read", () => ({ loadCanonicalBrainReadSliceWithClient: brainReadMock }));

import { resolveCurrentToroReadOnlyMenu, resolveToroReadOnlyMenuForContext } from "./server";
import { resolveToroMenuIntent } from "./resolver";

describe("resolveCurrentToroReadOnlyMenu", () => {
  beforeEach(() => {
    resolveToroContextMock.mockReset();
    createClientMock.mockReset().mockRejectedValue(new Error("Synthetic client unavailable"));
    krossReadMock.mockReset();
  });

  it("builds a reception menu from real resolved position context", async () => {
    resolveToroContextMock.mockResolvedValue({
      userId: "user-1",
      email: "qa@example.invalid",
      displayName: "Camila QA",
      mode: "organization",
      orgId: "org-1",
      membership: {
        orgId: "org-1",
        membershipId: null,
        membershipType: "employee",
        status: "active",
        roles: ["EMPLEADO"],
        employeeId: "employee-1",
        employeePreferredName: "Camila",
        positionId: "position-1",
        positionCode: "RECEPTION",
        positionName: "Recepción",
        workArea: "Recepción",
        source: "legacy_user_roles",
      },
      availableOrgIds: ["org-1"],
      allowedDataScopes: ["work_private", "work_org", "shared", "system"],
      allowedTools: [],
      canUsePersonalVault: false,
      canUseOrganizationData: true,
      requiresContextChoice: false,
    });

    const view = await resolveCurrentToroReadOnlyMenu();

    expect(view?.state).toBe("resolved");
    expect(view?.preferredDisplayName).toBe("Camila");
    expect(view?.menu?.profileId).toBe("reception");
    expect(
      view?.menu?.items.find((item) => item.capability === "hospitality.quote")?.state,
    ).toBe("BLOCKED");
    expect(
      view?.menu?.items.find((item) => item.capability === "guest.arrivals_departures")?.state,
    ).toBe("BLOCKED");
    expect(view?.capabilityNotes["hospitality.quote"]).toBe(
      "Cotizar exige precio y disponibilidad live del PMS.",
    );
    expect(view?.capabilityNotes["guest.arrivals_departures"]).toBe(
      "Falta verdad live de reservas/estancias del PMS.",
    );
    expect(view?.capabilityAlternatives["hospitality.quote"]).toEqual({
      label: "Preparar búsqueda en Kross",
      href: "/booking-assist",
      note:
        "TORO prepara fechas y ocupación; Kross confirma tarifas, disponibilidad y reserva final.",
      external: false,
    });
  });

  it("does not choose an organization when explicit context choice is required", async () => {
    resolveToroContextMock.mockResolvedValue({
      userId: "user-1",
      email: "qa@example.invalid",
      displayName: "QA",
      mode: "organization",
      orgId: null,
      membership: null,
      availableOrgIds: ["org-1", "org-2"],
      allowedDataScopes: ["system"],
      allowedTools: [],
      canUsePersonalVault: false,
      canUseOrganizationData: false,
      requiresContextChoice: true,
    });

    const view = await resolveCurrentToroReadOnlyMenu();

    expect(view?.state).toBe("context_choice_required");
    expect(view?.menu).toBeNull();
  });

  it("returns null when authenticated context cannot be resolved", async () => {
    resolveToroContextMock.mockResolvedValue(null);
    await expect(resolveCurrentToroReadOnlyMenu()).resolves.toBeNull();
  });
});

describe("internal menu informational arrivals", () => {
  const orgId = "00000000-0000-4000-8000-000000000001";
  const propertyId = "00000000-0000-4000-8000-000000000002";
  const asOf = "2026-10-24T23:00:00.000Z";
  const capability = "operations.hotel_today";
  const context: ToroResolvedContext = {
    userId: "synthetic-manager", email: null, displayName: "Synthetic manager", mode: "organization", orgId,
    membership: { orgId, membershipId: "synthetic-membership", membershipType: "employee", status: "active",
      roles: ["GERENCIA"], employeeId: "synthetic-employee", source: "organization_memberships" },
    availableOrgIds: [orgId], allowedDataScopes: ["work_org"], allowedTools: [],
    canUsePersonalVault: false, canUseOrganizationData: true, requiresContextChoice: false,
  };
  const row = (changes = {}) => ({
    org_id: orgId, property_id: propertyId, external_reservation_id: "synthetic-r1",
    check_in: "2026-10-24", check_out: "2026-10-25", status: "CONF", source_system: "Kross",
    transactional_authority: "Kross", read_only_mirror: true, source_is_live: false,
    snapshot_as_of: "2026-10-24T22:30:00Z", last_synced_at: "2026-10-24T22:31:00Z",
    source_hash: "synthetic-hash", data_quality_status: "review", ...changes,
  });
  const project = (rows: unknown[], truncated = false) => projectKrossOperationalSnapshot(rows, {
    orgId, propertyId, reportingDate: "2026-10-24", asOf, truncated,
  });
  function client(live = false) {
    return { schema: vi.fn(() => ({ from: vi.fn((table: string) => {
      const count = live && ["current_reservations_safe", "kross_snapshot_health"].includes(table) ? 1 : 0;
      const q = {
        select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn(),
        then: (resolve: (result: unknown) => unknown) => Promise.resolve({ count, data: [], error: null }).then(resolve),
      };
      for (const key of ["select", "eq", "order", "limit"] as const) q[key].mockReturnValue(q);
      return q;
    }) })) };
  }
  beforeEach(() => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
    vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "direct");
    krossReadMock.mockReset();
    brainReadMock.mockReset().mockResolvedValue({ projects: [] });
    createClientMock.mockReset();
    resolveToroContextMock.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("uses the existing non-live snapshot once and exposes partial evidence in the focus", async () => {
    const source = client();
    krossReadMock.mockResolvedValue(project([row()]));
    const view = await resolveToroReadOnlyMenuForContext(context, source as never, capability, { propertyId });
    expect(krossReadMock).toHaveBeenCalledExactlyOnceWith(context, source, { propertyId });
    expect(view.menu?.items.find(item => item.capability === capability)?.state).toBe("READ_ONLY");
    expect(view.sourceReadiness?.readyReads).toContain("Hotel hoy · copia informativa parcial");
    expect(view.sourceReadiness?.readyReads).not.toContain("Llegadas y salidas live");
    expect(view.capabilityNotes[capability]).toContain("2026-10-24T22:30:00.000Z (30 min al leer)");
    expect(view.focus?.items[0]).toMatchObject({
      title: "Llegadas previstas observadas: 1",
      evidence: { source: "Kross", observedAt: "2026-10-24T22:30:00.000Z", readAt: asOf },
    });
    expect(view.focus?.coverage).toContain(`Propiedad ${propertyId}`);
    expect(view.focus?.coverage).toContain("Cobertura total no acreditada");
    expect(view.focus?.coverage).toContain("1 en revisión");
    expect(view.focus?.label).toContain("movimientos programados observados de Kross");
    expect(view.capabilityNotes[capability]).toContain("No resume toda la operación ni acredita aseo, mantenimiento u ocupación física");
  });

  it("uses the manager's actual menu intents without inventing an arrivals alias or promoting other capabilities", async () => {
    const before = await resolveToroReadOnlyMenuForContext(context, client() as never);
    krossReadMock.mockResolvedValue(project([row()]));
    const view = await resolveToroReadOnlyMenuForContext(context, client() as never, capability, { propertyId });
    expect(view.menu?.profileId).toBe("manager");
    const item = view.menu!.items.find(item => item.capability === capability)!;
    for (const text of [String(item.index), "Hotel hoy", "operación", "quiero ver hotel hoy"]) {
      expect(resolveToroMenuIntent(view.menu!, text)).toMatchObject({ kind: "item", item: { capability, state: "READ_ONLY" } });
    }
    expect(resolveToroMenuIntent(view.menu!, "llegadas")).toEqual({ kind: "unknown" });
    expect(view.menu!.items.some(item => item.capability === "guest.arrivals_departures")).toBe(false);
    for (const other of before.menu!.items.filter(item => item.capability !== capability)) {
      expect(view.menu!.items.find(item => item.capability === other.capability)?.state).toBe(other.state);
    }
    expect(view.sourceReadiness?.blockedReads.filter(label => label !== "Hotel hoy"))
      .toEqual(before.sourceReadiness?.blockedReads.filter(label => label !== "Hotel hoy"));
    expect(view.sourceReadiness?.readyReads).toEqual(["Hotel hoy · copia informativa parcial"]);
  });

  it("accepts the inclusive 60-minute result without changing its policy", async () => {
    krossReadMock.mockResolvedValue(project([row({ snapshot_as_of: "2026-10-24T22:00:00Z" })]));
    const view = await resolveToroReadOnlyMenuForContext(context, client() as never, capability, { propertyId });
    expect(view.focusableCapabilities).toContain(capability);
    expect(view.capabilityNotes[capability]).toContain("60 min al leer");
  });

  for (const [name, rows] of [
    ["61 minutes old", [row({ snapshot_as_of: "2026-10-24T21:59:00Z" })]],
    ["future cutoff", [row({ snapshot_as_of: "2026-10-24T23:01:00Z" })]],
    ["missing cutoff", [row({ snapshot_as_of: null })]],
    ["missing source", []],
    ["wrong organization", [row({ org_id: "other" })]],
    ["wrong property", [row({ property_id: "other" })]],
  ] as const) {
    it(`does not turn ${name} into a current count or fall back to the live probe`, async () => {
      krossReadMock.mockResolvedValue(project([...rows]));
      const view = await resolveToroReadOnlyMenuForContext(context, client(true) as never, capability, { propertyId });
      expect(view.menu?.items.find(item => item.capability === capability)?.state).toBe("BLOCKED");
      expect(view.focusableCapabilities).not.toContain(capability);
      expect(view.focus).toBeNull();
      expect(view.capabilityNotes[capability]).toContain("desconocidos");
      expect(view.sourceReadiness?.readyReads).not.toContain("Hotel hoy");
      expect(view.sourceReadiness?.blockedReads).toContain(name === "61 minutes old"
        ? "Hotel hoy · copia antigua" : "Hotel hoy · copia no disponible");
    });
  }

  it("keeps an observed zero partial and discloses all coverage limitations", async () => {
    krossReadMock.mockResolvedValue(project([
      row({ status: "Cancelada" }),
      row({ external_reservation_id: "r2", status: "WAIT" }),
      row({ external_reservation_id: "r3", data_quality_status: "conflict" }),
      row({ external_reservation_id: "r4", snapshot_as_of: "2026-10-20T22:30:00Z" }),
    ], true));
    const view = await resolveToroReadOnlyMenuForContext(context, client() as never, capability, { propertyId });
    expect(view.focus?.items[0].title).toBe("Llegadas previstas observadas: 0");
    expect(view.focus?.coverage).toContain("4 registros leídos, 1 excluidos, 1 antiguos, 2 en revisión, 1 cancelados y 1 de estado desconocido");
    expect(view.focus?.coverage).toContain("Lectura truncada");
    expect(view.focus?.coverage).toContain("Cobertura total no acreditada");
    expect(JSON.stringify(view.focus)).not.toMatch(/no hay llegadas|total de llegadas/i);
  });

  it("preserves the previous live gate when no property selector was supplied", async () => {
    const reception = { ...context, membership: { ...context.membership!, positionCode: "RECEPTION" } };
    const view = await resolveToroReadOnlyMenuForContext(reception, client(true) as never, "guest.arrivals_departures");
    expect(krossReadMock).not.toHaveBeenCalled();
    expect(view.menu?.items.find(item => item.capability === "guest.arrivals_departures")?.state).toBe("READ_ONLY");
    expect(view.sourceReadiness?.readyReads).toContain("Llegadas y salidas live");
    expect(view.focusableCapabilities).not.toContain("guest.arrivals_departures");
    expect(view.focus).toBeNull();
  });

  it("leaves the current UI wrapper without a property selector", async () => {
    resolveToroContextMock.mockResolvedValue(context);
    createClientMock.mockResolvedValue(client());
    const view = await resolveCurrentToroReadOnlyMenu(capability);
    expect(krossReadMock).not.toHaveBeenCalled();
    expect(view?.menu?.items.find(item => item.capability === capability)?.state).toBe("BLOCKED");
  });

  for (const mode of ["public", "portal"]) {
    it(`does not add the informational reader to the ${mode} deployment`, async () => {
      vi.stubEnv("TORO_DEPLOYMENT_MODE", mode);
      await resolveToroReadOnlyMenuForContext(context, client() as never, capability, { propertyId });
      expect(krossReadMock).not.toHaveBeenCalled();
    });
  }

  it("keeps the Portal session transport closed for reservations", async () => {
    vi.stubEnv("TORO_PORTAL_READ_TRANSPORT", "rpc_v1");
    const view = await resolveToroReadOnlyMenuForContext(context, client() as never, capability, { propertyId });
    expect(krossReadMock).not.toHaveBeenCalled();
    expect(view.focus).toBeNull();
    expect(view.menu?.items.find(item => item.capability === capability)?.state).toBe("BLOCKED");
  });

  it("retains a denied staff role and does not open quoting", async () => {
    const reception = { ...context, membership: { ...context.membership!, roles: ["EMPLEADO" as const], positionCode: "RECEPTION" } };
    krossReadMock.mockResolvedValue({ state: "forbidden", counts: null });
    const view = await resolveToroReadOnlyMenuForContext(reception, client(true) as never, "guest.arrivals_departures", { propertyId });
    expect(view.menu?.items.find(item => item.capability === "guest.arrivals_departures")?.state).toBe("BLOCKED");
    expect(view.menu?.items.find(item => item.capability === "hospitality.quote")?.state).toBe("BLOCKED");
    expect(view.focus).toBeNull();
    expect(view.capabilityNotes["guest.arrivals_departures"]).toContain("no autoriza");
  });

  it("uses the existing arrivals item for an authorized manager with a reception profile without enabling quotes", async () => {
    const reception = { ...context, membership: { ...context.membership!, positionCode: "RECEPTION" } };
    krossReadMock.mockResolvedValue(project([row()]));
    const view = await resolveToroReadOnlyMenuForContext(reception, client() as never, "guest.arrivals_departures", { propertyId });
    expect(view.focus?.capability).toBe("guest.arrivals_departures");
    expect(view.sourceReadiness?.readyReads).toContain("Llegadas y salidas · copia informativa parcial");
    expect(view.sourceReadiness?.readyReads).not.toContain("Llegadas y salidas live");
    expect(view.menu?.items.find(item => item.capability === "hospitality.quote")?.state).toBe("BLOCKED");
  });

  it("does not add arrivals to an existing profile that does not expose that capability", async () => {
    const owner = { ...context, membership: { ...context.membership!, roles: ["ADMIN" as const] } };
    await resolveToroReadOnlyMenuForContext(owner, client() as never, capability, { propertyId });
    expect(krossReadMock).not.toHaveBeenCalled();
  });

  it("sanitizes provider failure without using another source", async () => {
    krossReadMock.mockRejectedValue(new Error("SYNTHETIC_PRIVATE_PROVIDER_DETAIL"));
    const view = await resolveToroReadOnlyMenuForContext(context, client(true) as never, capability, { propertyId });
    expect(view.focus).toBeNull();
    expect(view.menu?.items.find(item => item.capability === capability)?.state).toBe("BLOCKED");
    expect(JSON.stringify(view)).not.toContain("SYNTHETIC_PRIVATE_PROVIDER_DETAIL");
  });
});
