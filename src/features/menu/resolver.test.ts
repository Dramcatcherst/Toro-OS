import { describe, expect, it } from "vitest";

import { resolveToroMenu, resolveToroMenuIntent } from "./resolver";

const ready = (...capabilities: string[]) =>
  Object.fromEntries(capabilities.map((key) => [key, "READY" as const]));

describe("resolveToroMenu", () => {
  it("selects personal menu regardless of organization roles", () => {
    const menu = resolveToroMenu({
      mode: "personal",
      roles: ["ADMIN"],
      capabilityStates: ready("personal.today", "personal.calendar"),
    });

    expect(menu?.profileId).toBe("personal");
    expect(menu?.items.map((item) => item.key)).toEqual(["today", "calendar"]);
  });

  it("uses position-specific maintenance profile before generic employee", () => {
    const menu = resolveToroMenu({
      mode: "organization",
      roles: ["EMPLEADO"],
      positionName: "Mantenimiento",
      capabilityStates: ready("maintenance.priorities", "maintenance.my_tasks"),
    });

    expect(menu?.profileId).toBe("maintenance");
    expect(menu?.selectionReason).toBe("position:maintenance");
  });

  it("uses manager profile for reception operational lead", () => {
    const menu = resolveToroMenu({
      mode: "organization",
      roles: ["EMPLEADO", "JEFE_DEPARTAMENTO"],
      positionName: "Recepción + Líder Operativa",
      capabilityStates: ready("operations.hotel_today"),
    });

    expect(menu?.profileId).toBe("manager");
  });

  it("uses reception profile for a reception employee", () => {
    const menu = resolveToroMenu({
      mode: "organization",
      roles: ["EMPLEADO"],
      positionName: "Recepción",
      capabilityStates: ready("guest.arrivals_departures", "hospitality.quote"),
    });

    expect(menu?.profileId).toBe("reception");
    expect(menu?.items.map((item) => item.key)).toEqual(["arrivals", "quote_sell"]);
  });

  it("selects booked guest menu from lifecycle", () => {
    const menu = resolveToroMenu({
      mode: "organization",
      externalAudience: "guest",
      guestLifecycle: "in_stay",
      capabilityStates: ready("guest.arrival", "guest.request_help"),
    });

    expect(menu?.profileId).toBe("guest_reserved");
    expect(menu?.selectionReason).toBe("guest_lifecycle:in_stay");
  });

  it("fails closed for unresolved capabilities", () => {
    const menu = resolveToroMenu({
      mode: "organization",
      roles: ["CONTABILIDAD"],
      capabilityStates: {
        "finance.obligations": "READY",
        "finance.collections": "HIDDEN",
        "finance.reconcile": "BLOCKED",
      },
    });

    expect(menu?.profileId).toBe("finance");
    expect(menu?.items.map((item) => [item.key, item.state])).toEqual([
      ["obligations", "READY"],
      ["reconcile", "BLOCKED"],
    ]);
    expect(menu?.hiddenCapabilityCount).toBeGreaterThan(0);
  });

  it("shows more control only when secondary options exist", () => {
    const withoutMore = resolveToroMenu({
      mode: "organization",
      roles: ["EMPLEADO"],
      capabilityStates: ready("people.my_day"),
      hasSecondaryOptions: false,
    });
    const withMore = resolveToroMenu({
      mode: "organization",
      roles: ["EMPLEADO"],
      capabilityStates: ready("people.my_day"),
      hasSecondaryOptions: true,
    });

    expect(withoutMore?.items.some((item) => item.key === "more")).toBe(false);
    expect(withMore?.items.some((item) => item.key === "more")).toBe(true);
  });

  it("returns null when no authorized internal profile can be resolved", () => {
    expect(resolveToroMenu({ mode: "organization", roles: [] })).toBeNull();
  });
});

describe("resolveToroMenuIntent", () => {
  const menu = resolveToroMenu({
    mode: "organization",
    roles: ["EMPLEADO"],
    positionName: "Recepción",
    capabilityStates: ready(
      "guest.arrivals_departures",
      "comms.guest_messages",
      "hospitality.quote",
    ),
  })!;

  it("resolves current visible number", () => {
    const result = resolveToroMenuIntent(menu, "3");
    expect(result.kind).toBe("item");
    if (result.kind === "item") expect(result.item.key).toBe("quote_sell");
  });

  it("resolves alias keyword accent-insensitively", () => {
    const result = resolveToroMenuIntent(menu, "cotizar");
    expect(result.kind).toBe("item");
    if (result.kind === "item") {
      expect(result.item.capability).toBe("hospitality.quote");
      expect(result.matchedBy).toBe("exact");
    }
  });

  it("resolves an unambiguous option phrase inside natural language", () => {
    const result = resolveToroMenuIntent(menu, "quiero cotizar para 4 personas");
    expect(result.kind).toBe("item");
    if (result.kind === "item") {
      expect(result.item.capability).toBe("hospitality.quote");
      expect(result.matchedBy).toBe("phrase");
    }
  });

  it("does not execute when natural language matches multiple visible options", () => {
    const ambiguous = resolveToroMenu({
      mode: "organization",
      roles: ["EMPLEADO"],
      positionName: "Recepción",
      capabilityStates: ready("comms.guest_messages", "hospitality.quote"),
    })!;
    expect(resolveToroMenuIntent(ambiguous, "quiero mensajes y cotizar").kind).toBe("unknown");
  });

  it("resolves universal navigation", () => {
    expect(resolveToroMenuIntent(menu, "menú").kind).toBe("home");
    expect(resolveToroMenuIntent(menu, "atrás").kind).toBe("back");
    expect(resolveToroMenuIntent(menu, "+").kind).toBe("more");
    expect(resolveToroMenuIntent(menu, "ayuda").kind).toBe("help");
  });

  it("does not fuzzy-execute ambiguous free text", () => {
    expect(resolveToroMenuIntent(menu, "quiero hacer algo").kind).toBe("unknown");
  });
});
