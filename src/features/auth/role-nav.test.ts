import { describe, expect, it } from "vitest";

import { getRoleNavigation } from "./role-nav";

function availableHrefs(role: Parameters<typeof getRoleNavigation>[0]) {
  return getRoleNavigation(role)
    .filter((item) => item.availability === "available")
    .map((item) => item.href);
}

describe("role navigation phase 2 maintenance", () => {
  it.each(["FOUNDER", "GERENCIA", "OPERACIONES", "CAMPO"] as const)(
    "exposes maintenance to %s",
    (role) => {
      expect(availableHrefs(role)).toContain("/toro/operacion/mantenimiento");
    },
  );

  it("keeps CAMPO limited to maintenance plus home", () => {
    expect(availableHrefs("CAMPO")).toEqual([
      "/toro",
      "/toro/operacion/mantenimiento",
    ]);
  });

  it("does not expose maintenance to RECEPCION", () => {
    expect(availableHrefs("RECEPCION")).not.toContain(
      "/toro/operacion/mantenimiento",
    );
  });
});
