import { expect, it } from "vitest";
import { readBoundedText } from "./transport";
it("reads UTF-8 while preserving a strict byte limit", async () => {
  expect(await readBoundedText(new Response("Mar y luna"), 100)).toBe("Mar y luna");
  expect(await readBoundedText(new Response("á".repeat(10)), 10)).toBeNull();
});
it("rejects failed responses", async () => {
  expect(await readBoundedText(new Response("upstream error", { status: 503 }))).toBeNull();
});
