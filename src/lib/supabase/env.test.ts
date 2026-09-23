import { afterEach, describe, expect, it } from "vitest";
import { getSupabasePublicConfig } from "./env";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("getSupabasePublicConfig", () => {
  it("requires a URL and publishable key", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(() => getSupabasePublicConfig()).toThrow(/Supabase public configuration/i);
  });

  it("accepts the server preferred publishable key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    expect(getSupabasePublicConfig()).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });
});
