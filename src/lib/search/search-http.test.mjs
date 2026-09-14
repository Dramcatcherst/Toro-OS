import test from "node:test";
import assert from "node:assert/strict";
import { parseSearchQuery } from "./search-http.mjs";

test("trims a normal search query", () => {
  assert.equal(parseSearchQuery("  Habitación 25  "), "Habitación 25");
});

test("blank search query stays empty", () => {
  assert.equal(parseSearchQuery("   "), "");
});

test("caps oversized queries to a safe length", () => {
  const value = "x".repeat(500);
  assert.equal(parseSearchQuery(value).length, 120);
});

test("non-string values fail closed", () => {
  assert.equal(parseSearchQuery(null), "");
  assert.equal(parseSearchQuery(undefined), "");
  assert.equal(parseSearchQuery(25), "");
});
