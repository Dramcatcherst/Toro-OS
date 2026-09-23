import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("accepts an internal absolute path", () => {
    expect(safeNextPath("/brain")).toBe("/brain");
    expect(safeNextPath("/brain?mode=focus")).toBe("/brain?mode=focus");
  });

  it("rejects protocol-relative and external destinations", () => {
    expect(safeNextPath("//example.com")).toBe("/brain");
    expect(safeNextPath("https://example.com")).toBe("/brain");
    expect(safeNextPath(null)).toBe("/brain");
  });
});
