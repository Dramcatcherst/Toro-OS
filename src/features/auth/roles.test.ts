import { describe, expect, it } from "vitest";

import { getRoleNavigation } from "./role-nav";
import { resolveToroRole, type ToroRole } from "./roles";

const toroRoles: ToroRole[] = [
  "FOUNDER",
  "GERENCIA",
  "RECEPCION",
  "OPERACIONES",
  "CAMPO",
  "FINANZAS",
  "GROWTH",
  "SYSTEMS",
];

describe("resolveToroRole", () => {
  it("uses an explicit canonical TORO role for the founder", () => {
    expect(resolveToroRole({ explicitToroRole: "FOUNDER", systemRoleCodes: ["ADMIN"] })).toBe("FOUNDER");
  });

  it("uses the explicit limited field role without broadening system privileges", () => {
    expect(resolveToroRole({ explicitToroRole: "CAMPO", systemRoleCodes: ["EMPLEADO"] })).toBe("CAMPO");
  });

  it("maps known system roles conservatively", () => {
    expect(resolveToroRole({ systemRoleCodes: ["GERENCIA"] })).toBe("GERENCIA");
    expect(resolveToroRole({ systemRoleCodes: ["CONTABILIDAD"] })).toBe("FINANZAS");
  });

  it("maps the existing REVENUE system role into the bounded finance surface", () => {
    expect(resolveToroRole({ systemRoleCodes: ["REVENUE"] })).toBe("FINANZAS");
  });

  it("does not infer field access from EMPLEADO alone", () => {
    expect(resolveToroRole({ systemRoleCodes: ["EMPLEADO"] })).toBeNull();
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
    const enabledHrefs = getRoleNavigation(role).flatMap((item) => item.href ? [item.href] : []);
    expect(enabledHrefs.every((href) => [
      "/toro",
      "/toro/decisiones",
      "/toro/operacion/mantenimiento",
      "/toro/hotel",
      "/toro/proyectos",
      "/toro/conocimiento",
      "/toro/sistemas",
      "/toro/revenue",
    ].includes(href))).toBe(true);
  });

  it("exposes implemented founder modules and keeps the rest non-actionable", () => {
    const navigation = getRoleNavigation("FOUNDER");

    expect(navigation.find((item) => item.label === "Mantenimiento")).toEqual({
      label: "Mantenimiento",
      availability: "available",
      href: "/toro/operacion/mantenimiento",
    });
    expect(navigation.find((item) => item.label === "Hotel")).toEqual({
      label: "Hotel",
      availability: "available",
      href: "/toro/hotel",
    });
    expect(navigation.find((item) => item.label === "Proyectos")).toEqual({
      label: "Proyectos",
      availability: "available",
      href: "/toro/proyectos",
    });
    expect(navigation.find((item) => item.label === "Conocimiento")).toEqual({
      label: "Conocimiento",
      availability: "available",
      href: "/toro/conocimiento",
    });
    expect(navigation.find((item) => item.label === "Sistemas")).toEqual({
      label: "Sistemas",
      availability: "available",
      href: "/toro/sistemas",
    });

    for (const label of ["Huéspedes", "Dinero", "Equipo"]) {
      const item = navigation.find((candidate) => candidate.label === label);
      expect(item).toMatchObject({ label, availability: "coming-soon" });
      expect(item?.href).toBeUndefined();
    }
  });

  it("gives founder the full executive navigation", () => {
    expect(getRoleNavigation("FOUNDER").map((item) => item.label)).toEqual([
      "Inicio", "Decisiones", "Mantenimiento", "Hotel", "Huéspedes", "Dinero", "Revenue", "Proyectos", "Equipo", "Conocimiento", "Sistemas",
    ]);
  });

  it("keeps CAMPO limited to Inicio and Mantenimiento", () => {
    expect(getRoleNavigation("CAMPO")).toEqual([
      { label: "Inicio", availability: "available", href: "/toro" },
      { label: "Mantenimiento", availability: "available", href: "/toro/operacion/mantenimiento" },
    ]);
  });

  it("exposes Hotel to reception but not finance or systems modules", () => {
    const navigation = getRoleNavigation("RECEPCION");
    expect(navigation.find((item) => item.label === "Hotel")).toEqual({
      label: "Hotel",
      availability: "available",
      href: "/toro/hotel",
    });
    const labels = navigation.map((item) => item.label);
    expect(labels).not.toContain("Dinero");
    expect(labels).not.toContain("Sistemas");
  });

  it("exposes Hotel and Maintenance to operations", () => {
    expect(getRoleNavigation("OPERACIONES").find((item) => item.label === "Mantenimiento")).toEqual({
      label: "Mantenimiento",
      availability: "available",
      href: "/toro/operacion/mantenimiento",
    });
    expect(getRoleNavigation("OPERACIONES").find((item) => item.label === "Hotel")).toEqual({
      label: "Hotel",
      availability: "available",
      href: "/toro/hotel",
    });
  });

  it("exposes Systems health to the Systems role", () => {
    expect(getRoleNavigation("SYSTEMS").find((item) => item.label === "Sistemas")).toEqual({
      label: "Sistemas",
      availability: "available",
      href: "/toro/sistemas",
    });
  });

  it("keeps finance away from guest-private operational navigation", () => {
    const labels = getRoleNavigation("FINANZAS").map((item) => item.label);
    expect(labels).toContain("Dinero");
    expect(labels).not.toContain("Huéspedes");
    expect(labels).not.toContain("Hotel");
  });

  it.each(["FOUNDER", "GERENCIA", "FINANZAS"] as const)(
    "exposes the private Revenue surface to %s",
    (role) => {
      expect(getRoleNavigation(role)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: "Revenue",
            availability: "available",
            href: "/toro/revenue",
          }),
        ]),
      );
    },
  );

  it("keeps Revenue out of reception navigation", () => {
    expect(getRoleNavigation("RECEPCION").map((item) => item.label)).not.toContain("Revenue");
  });
});
