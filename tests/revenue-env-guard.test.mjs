import test from "node:test";
import assert from "node:assert/strict";
import { validateRevenueBuildEnv } from "../scripts/revenue-env-guard.mjs";

test("rejects Vercel builds when SUPABASE_PUBLISHABLE_KEY is missing", () => {
  assert.throws(
    () => validateRevenueBuildEnv({ VERCEL: "1" }),
    /SUPABASE_PUBLISHABLE_KEY/,
  );
});

test("accepts Vercel builds when the publishable key is configured", () => {
  assert.doesNotThrow(() => validateRevenueBuildEnv({
    VERCEL: "1",
    SUPABASE_PUBLISHABLE_KEY: "present-but-not-inspected",
  }));
});

test("does not require Vercel-only runtime env during ordinary CI", () => {
  assert.doesNotThrow(() => validateRevenueBuildEnv({ CI: "true" }));
});
