import { describe, expect, it } from "vitest";

import {
  hasSupabaseWorkerSecret,
  resolveSupabaseWorkerSecret,
} from "./worker-config";

describe("Supabase worker secret resolution", () => {
  it("prefers a direct modern secret key", () => {
    const result = resolveSupabaseWorkerSecret({
      SUPABASE_SECRET_KEY: "sb_secret_direct",
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: "sb_secret_bundle" }),
      SUPABASE_SERVICE_ROLE_KEY: "legacy-service-role",
    });

    expect(result).toEqual({
      key: "sb_secret_direct",
      source: "SUPABASE_SECRET_KEY",
      legacy: false,
    });
  });

  it("uses the default key from the modern secret bundle", () => {
    const result = resolveSupabaseWorkerSecret({
      SUPABASE_SECRET_KEYS: JSON.stringify({
        default: "sb_secret_default",
        billing: "sb_secret_billing",
      }),
    });

    expect(result).toEqual({
      key: "sb_secret_default",
      source: "SUPABASE_SECRET_KEYS.default",
      legacy: false,
    });
  });

  it("falls back to the legacy service-role key only when necessary", () => {
    const result = resolveSupabaseWorkerSecret({
      SUPABASE_SERVICE_ROLE_KEY: "legacy-service-role",
    });

    expect(result).toEqual({
      key: "legacy-service-role",
      source: "SUPABASE_SERVICE_ROLE_KEY",
      legacy: true,
    });
  });

  it("fails closed for malformed or missing secret configuration", () => {
    expect(
      resolveSupabaseWorkerSecret({
        SUPABASE_SECRET_KEYS: "{not-json",
      }),
    ).toBeNull();

    expect(hasSupabaseWorkerSecret({})).toBe(false);
  });
});
