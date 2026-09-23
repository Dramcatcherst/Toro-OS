import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveToroContextMock } = vi.hoisted(() => ({
  resolveToroContextMock: vi.fn(),
}));

vi.mock("@/features/context/resolver", () => ({
  resolveToroContext: resolveToroContextMock,
}));

import { resolveCurrentToroReadOnlyMenu } from "./server";

describe("resolveCurrentToroReadOnlyMenu", () => {
  beforeEach(() => {
    resolveToroContextMock.mockReset();
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
      label: "Abrir Kross oficial",
      href: "https://dreamcatcherhotel.kross.travel/",
      note:
        "Kross confirma las tarifas y disponibilidad vigentes. TORO no importa ni interpreta ese resultado automáticamente.",
      external: true,
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
