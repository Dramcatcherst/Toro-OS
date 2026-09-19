import { describe, expect, it } from "vitest";

import { getRoleNavigation } from "./role-nav";
import { resolveToroRole, type ToroRole } from "./roles";

const toroRoles: ToroRole[] = [
  "FOUNDER",
  "GERENCIA",
  "RECEPCION",
  "OPERACIONES",
  "FINANZAS",
  "GROWTH",
  "SYSTEMS",
];

describe("resolveToroRole", () => {
  it("uses an explicit canonical TORO role for the founder", () => {
    expect(
      resolveToroRole({ explicitToroRole: "FOUNDER", systemRoleCodes: ["ADMIN"] }),
    ).toBe("FOUNDER");
  });

  it("maps known system roles conservatively", () => {
    expect(resolveToroRole({ systemRoleCodes: ["GERENCIA"] })).toBe("GERENCIA");
    expect(resolveToroRole({ systemRoleCodes: ["CONTABILIDAD"] })).toBe("FINANZAS");
  });

  it("does not infer founder privileges from ADMIN alone", () => {
    expect(resolveToroRole({ systemRoleCodes: ["ADMIN"] })).toBeNull();
  });

  it("fails closed for unknown explicit roles", () => {
    expect(resolveToroRole({ explicitToroRole: "SUPERUSER" })).toBeNull();
  });
});

describe("getRoleNavigation", () => {
  it.each(toroRoles)("only enables routes that exist for %s", (role) => {
    const enabledHrefs = getRoleNavigation(role).flatMap((item) =>
      item.href ? [item.href] : [],
    );

    expect(
      enabledHrefs.every((href) =>
        ["/toro", "/toro/decisiones", "/toro/operacion/mantenimiento"].includes(
          href,
        ),
      ),
    ).toBe(true);
  });

  it("keeps future founder modules visible without an actionable destination", () => {
    const navigation = getRoleNavigation("FOUNDER");

    for (const label of [
      "Hotel",
      "Huéspedes",
      "Dinero",
      "Proyectos",
      "Equipo",
      "Conocimiento",
      "Sistemas",
    ]) {
      const item = navigation.find((candidate) => candidate.label === label);
      expect(item).toMatchObject({ label, availability: "coming-soon" });
      expect(item?.href).toBeUndefined();
    }
  });

  it("gives founder the full executive navigation", () => {
    expect(getRoleNavigation("FOUNDER").map((item) => item.label)).toEqual([
      "Inicio",
      "Decisiones",
      "Mantenimiento",
      "Hotel",
      "Huéspedes",
      "Dinero",
      "Proyectos",
      "Equipo",
      "Conocimiento",
      "Sistemas",
    ]);
  });

  it("does not expose finance or systems navigation to reception", () => {
    const labels = getRoleNavigation("RECEPCION").map((item) => item.label);
    expect(labels).toContain("Huéspedes");
    expect(labels).not.toContain("Mantenimiento");
    expect(labels).not.toContain("Dinero");
    expect(labels).not.toContain("Sistemas");
  });

  it("keeps finance away from guest-private operational navigation", () => {
    const labels = getRoleNavigation("FINANZAS").map((item) => item.label);
    expect(labels).toContain("Dinero");
    expect(labels).not.toContain("Huéspedes");
    expect(labels).not.toContain("Mantenimiento");
  });
});
