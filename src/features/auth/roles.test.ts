import { describe, expect, it } from "vitest";

import { getRoleNavigation } from "./role-nav";
import { resolveToroRole, type ToroRole } from "./roles";

const toroRoles: ToroRole[] = [
  "FOUNDER",
  "ADMIN",
  "RRHH",
  "GERENCIA",
  "JEFE_DEPARTAMENTO",
  "AUDITOR",
  "EMPLEADO",
  "RECEPCION",
  "OPERACIONES",
  "FINANZAS",
  "GROWTH",
  "SYSTEMS",
];

describe("resolveToroRole", () => {
  it("uses an explicit TORO experience role for the founder", () => {
    expect(
      resolveToroRole({ explicitToroRole: "FOUNDER", systemRoleCodes: ["ADMIN"] }),
    ).toBe("FOUNDER");
  });

  it("maps canonical organization roles conservatively", () => {
    expect(resolveToroRole({ systemRoleCodes: ["ADMIN"] })).toBe("ADMIN");
    expect(resolveToroRole({ systemRoleCodes: ["RRHH"] })).toBe("RRHH");
    expect(resolveToroRole({ systemRoleCodes: ["GERENCIA"] })).toBe("GERENCIA");
    expect(resolveToroRole({ systemRoleCodes: ["CONTABILIDAD"] })).toBe("FINANZAS");
    expect(resolveToroRole({ systemRoleCodes: ["AUDITOR"] })).toBe("AUDITOR");
    expect(resolveToroRole({ systemRoleCodes: ["JEFE_DEPARTAMENTO"] })).toBe(
      "JEFE_DEPARTAMENTO",
    );
    expect(resolveToroRole({ systemRoleCodes: ["EMPLEADO"] })).toBe("EMPLEADO");
  });

  it("never infers founder privileges from ADMIN alone", () => {
    expect(resolveToroRole({ systemRoleCodes: ["ADMIN"] })).toBe("ADMIN");
  });

  it("preserves explicit functional experience roles only when recognized", () => {
    expect(
      resolveToroRole({
        explicitToroRole: "RECEPCION",
        systemRoleCodes: ["EMPLEADO"],
      }),
    ).toBe("RECEPCION");
    expect(resolveToroRole({ explicitToroRole: "SUPERUSER" })).toBeNull();
  });
});

describe("getRoleNavigation", () => {
  it.each(toroRoles)("only enables routes that exist for %s", (role) => {
    const enabledHrefs = getRoleNavigation(role).flatMap((item) =>
      item.href ? [item.href] : [],
    );

    expect(
      enabledHrefs.every((href) => [
          "/toro",
          "/toro/decisiones",
          "/toro/mi-perfil",
          "/toro/mi-asistencia",
          "/toro/asistencia",
          "/toro/solicitudes",
        ].includes(href)),
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

  it("gives founder the current executive navigation", () => {
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

  it("gives an employee a self-service-oriented future navigation", () => {
    expect(getRoleNavigation("EMPLEADO").map((item) => item.label)).toEqual([
      "Inicio",
      "Mi trabajo",
      "Horario",
      "Solicitudes",
      "Mensajes",
      "Mi perfil",
    ]);
    expect(
      getRoleNavigation("EMPLEADO").find((item) => item.label === "Mi perfil"),
    ).toMatchObject({
      availability: "available",
      href: "/toro/mi-perfil",
    });
    expect(
      getRoleNavigation("EMPLEADO").find(
        (item) => item.label === "Solicitudes",
      ),
    ).toMatchObject({
      availability: "available",
      href: "/toro/solicitudes",
    });
    expect(
      getRoleNavigation("EMPLEADO").find(
        (item) => item.label === "Mi asistencia",
      ),
    ).toMatchObject({
      availability: "available",
      href: "/toro/mi-asistencia",
    });
  });

  it("keeps payroll and restricted attendance review away from department leads", () => {
    const navigation = getRoleNavigation("JEFE_DEPARTAMENTO");
    const labels = navigation.map((item) => item.label);
    expect(labels).not.toContain("Planilla");
    expect(labels).toContain("Equipo");
    expect(
      navigation.find((item) => item.label === "Asistencia"),
    ).toMatchObject({ availability: "coming-soon" });
  });

  it.each(["ADMIN", "RRHH", "AUDITOR"] as const)(
    "enables read-only attendance review navigation for %s",
    (role) => {
      expect(
        getRoleNavigation(role).find((item) => item.label === "Asistencia"),
      ).toMatchObject({
        availability: "available",
        href: "/toro/asistencia",
      });
    },
  );

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
