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
});
