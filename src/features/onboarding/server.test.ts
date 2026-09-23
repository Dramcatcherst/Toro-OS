import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  resolveToroContextMock,
  createServerSupabaseClientMock,
  resolveCurrentToroReadOnlyMenuMock,
} = vi.hoisted(() => ({
  resolveToroContextMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn(),
  resolveCurrentToroReadOnlyMenuMock: vi.fn(),
}));

vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: resolveToroContextMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/features/menu/server", () => ({
  resolveCurrentToroReadOnlyMenu: resolveCurrentToroReadOnlyMenuMock,
}));

import { resolveCurrentOnboarding } from "./server";

describe("resolveCurrentOnboarding", () => {
  beforeEach(() => {
    resolveToroContextMock.mockReset();
    createServerSupabaseClientMock.mockReset();
    resolveCurrentToroReadOnlyMenuMock.mockReset();
  });

  it("selects the reception journey from canonical position context", async () => {
    resolveToroContextMock.mockResolvedValue({
      userId: "user-1",
      email: "camila@example.invalid",
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

    createServerSupabaseClientMock.mockResolvedValue({
      from: vi.fn(() => {
        const query = {
          select: vi.fn(),
          eq: vi.fn(),
          limit: vi.fn(),
        };
        query.select.mockReturnValue(query);
        query.eq.mockReturnValue(query);
        query.limit.mockResolvedValue({
          data: [{ name: "Dreamcatcher Hotel" }],
          error: null,
        });
        return query;
      }),
    });

    resolveCurrentToroReadOnlyMenuMock.mockResolvedValue({
      menu: {
        profileId: "reception",
        selectionReason: "position_code:reception",
        hiddenCapabilityCount: 0,
        items: [
          {
            index: 1,
            key: "rooms_villas",
            emoji: "🛏️",
            label: "Habitaciones y villas",
            aliases: ["habitaciones", "villas"],
            capability: "catalog.rooms_villas",
            state: "READ_ONLY",
          },
          {
            index: 2,
            key: "experiences",
            emoji: "✨",
            label: "Experiencias",
            aliases: ["experiencias", "tours"],
            capability: "catalog.experiences",
            state: "READ_ONLY",
          },
          {
            index: 3,
            key: "arrivals",
            emoji: "🛎️",
            label: "Llegadas y salidas",
            aliases: ["llegadas"],
            capability: "guest.arrivals_departures",
            state: "BLOCKED",
          },
        ],
      },
      focusableCapabilities: [
        "catalog.rooms_villas",
        "catalog.experiences",
      ],
    });

    const view = await resolveCurrentOnboarding();

    expect(view?.state).toBe("resolved");
    expect(view?.firstName).toBe("Camila");
    expect(view?.businessName).toBe("Dreamcatcher Hotel");
    expect(view?.profileId).toBe("reception");
    expect(view?.journey?.key).toBe("reception");
    expect(view?.journey?.steps[0]?.choices?.map((choice) => choice.label)).toEqual([
      "Habitaciones y villas",
      "Experiencias",
    ]);
    expect(view?.firstValueTargets).toEqual([
      {
        key: "rooms_villas",
        capability: "catalog.rooms_villas",
        label: "Habitaciones y villas",
        href: "/my-toro?focus=catalog.rooms_villas",
      },
      {
        key: "experiences",
        capability: "catalog.experiences",
        label: "Experiencias",
        href: "/my-toro?focus=catalog.experiences",
      },
    ]);
  });

  it("requires context choice instead of selecting among multiple organizations", async () => {
    resolveToroContextMock.mockResolvedValue({
      userId: "user-1",
      email: "owner@example.invalid",
      displayName: "Owner QA",
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

    const view = await resolveCurrentOnboarding();

    expect(view?.state).toBe("context_choice_required");
    expect(view?.journey).toBeNull();
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(resolveCurrentToroReadOnlyMenuMock).not.toHaveBeenCalled();
  });

  it("returns null when identity context is unresolved", async () => {
    resolveToroContextMock.mockResolvedValue(null);
    await expect(resolveCurrentOnboarding()).resolves.toBeNull();
  });
});
