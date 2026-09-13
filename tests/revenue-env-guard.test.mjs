import test from "node:test";
import assert from "node:assert/strict";
import { validateRevenueBuildEnv } from "../scripts/revenue-env-guard.mjs";

test("rejects Vercel builds when no Supabase publishable key is configured", () => {
  assert.throws(
    () => validateRevenueBuildEnv({ VERCEL: "1" }),
    /SUPABASE_PUBLISHABLE_KEY/,
  );
});

test("accepts Vercel builds when the server-side publishable key is configured", () => {
  assert.doesNotThrow(() => validateRevenueBuildEnv({
    VERCEL: "1",
    SUPABASE_PUBLISHABLE_KEY: "present-but-not-inspected",
  }));
});

test("accepts Vercel builds when the existing public publishable key alias is configured", () => {
  assert.doesNotThrow(() => validateRevenueBuildEnv({
    VERCEL: "1",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "present-but-not-inspected",
  }));
});

test("rejects Vercel builds that override AIRTABLE_BASE_ID to a retiring Dreamcatcher base", () => {
  for (const baseId of [
    "appuk6zInco941sgc",
    "appYRL3P7ugPtQN1h",
    "appltN1brkbhD4FVb",
  ]) {
    assert.throws(
      () => validateRevenueBuildEnv({
        VERCEL: "1",
        SUPABASE_PUBLISHABLE_KEY: "present-but-not-inspected",
        AIRTABLE_BASE_ID: baseId,
      }),
      /AIRTABLE_BASE_ID/,
    );
  }
});

test("checks a retiring AIRTABLE_BASE_ID before reporting a missing Supabase key", () => {
  assert.throws(
    () => validateRevenueBuildEnv({
      VERCEL: "1",
      AIRTABLE_BASE_ID: "appuk6zInco941sgc",
    }),
    /AIRTABLE_BASE_ID/,
  );
});

test("allows a safe Airtable base override while migration is in progress", () => {
  assert.doesNotThrow(() => validateRevenueBuildEnv({
    VERCEL: "1",
    SUPABASE_PUBLISHABLE_KEY: "present-but-not-inspected",
    AIRTABLE_BASE_ID: "appFdcxw7KqReHJI6",
  }));
});

test("does not require Vercel-only runtime env during ordinary CI", () => {
  assert.doesNotThrow(() => validateRevenueBuildEnv({ CI: "true" }));
});
