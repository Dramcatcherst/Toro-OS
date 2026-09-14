import { describe, expect, it } from "vitest";

import { getRoleNavigation } from "./role-nav";
import { resolveToroRole } from "./roles";

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
  it("gives founder the full executive navigation", () => {
    expect(getRoleNavigation("FOUNDER").map((item) => item.label)).toEqual([
      "Inicio",
      "Decisiones",
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
    expect(labels).not.toContain("Dinero");
    expect(labels).not.toContain("Sistemas");
  });

  it("keeps finance away from guest-private operational navigation", () => {
    const labels = getRoleNavigation("FINANZAS").map((item) => item.label);
    expect(labels).toContain("Dinero");
    expect(labels).not.toContain("Huéspedes");
  });
});
