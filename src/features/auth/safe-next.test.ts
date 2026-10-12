import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("defaults to the personalized My TORO surface and accepts internal paths", () => {
    expect(safeNextPath(undefined)).toBe("/my-toro");
    expect(safeNextPath("/brain")).toBe("/brain");
    expect(safeNextPath("/brain?mode=focus")).toBe("/brain?mode=focus");
  });

  it("rejects protocol-relative and external destinations", () => {
    expect(safeNextPath("//example.com")).toBe("/my-toro");
    expect(safeNextPath("https://example.com")).toBe("/my-toro");
    expect(safeNextPath(null)).toBe("/my-toro");
  });

  it.each(["/\\example.com", "/\\\\example.com", "/%5cexample.com", "/%2f%2fexample.com", "/portal\n", "/portal\r", "/portal\t", "/portal\u0000", "/portal\u007f", "/portal?x=%0a", "/%ZZ", "https://toro.invalid/portal"])("rejects separator/control/origin bypass %j", value => {
    expect(safeNextPath(value)).toBe("/my-toro");
  });

  it("retains the exact safe internal route, query and fragment", () => {
    expect(safeNextPath("/portal")).toBe("/portal");
    expect(safeNextPath("/my-toro?focus=projects.status#focus-heading")).toBe("/my-toro?focus=projects.status#focus-heading");
    expect(safeNextPath("/my-toro?search=legal%20finanzas")).toBe("/my-toro?search=legal%20finanzas");
  });
});
