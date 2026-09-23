import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("accepts internal absolute paths", () => {
    expect(safeNextPath("/toro")).toBe("/toro");
    expect(safeNextPath("/toro/revenue?room=25")).toBe("/toro/revenue?room=25");
  });

  it("rejects protocol-relative and external destinations", () => {
    expect(safeNextPath("//example.com")).toBe("/toro");
    expect(safeNextPath("https://example.com")).toBe("/toro");
    expect(safeNextPath("javascript:alert(1)")).toBe("/toro");
    expect(safeNextPath(null)).toBe("/toro");
  });
});
