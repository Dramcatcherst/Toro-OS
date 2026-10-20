export type SupabaseWorkerSecretSource =
  | "SUPABASE_SECRET_KEY"
  | "SUPABASE_SECRET_KEYS.default"
  | "SUPABASE_SERVICE_ROLE_KEY";

export type SupabaseWorkerSecret = {
  key: string;
  source: SupabaseWorkerSecretSource;
  legacy: boolean;
};

export function resolveSupabaseWorkerSecret(
  env: Record<string, string | undefined>,
): SupabaseWorkerSecret | null {
  const direct = env.SUPABASE_SECRET_KEY?.trim();
  if (direct) {
    return {
      key: direct,
      source: "SUPABASE_SECRET_KEY",
      legacy: false,
    };
  }

  const bundle = env.SUPABASE_SECRET_KEYS?.trim();
  if (bundle) {
    try {
      const parsed = JSON.parse(bundle) as Record<string, unknown>;
      const defaultKey =
        typeof parsed.default === "string" ? parsed.default.trim() : "";
      if (defaultKey) {
        return {
          key: defaultKey,
          source: "SUPABASE_SECRET_KEYS.default",
          legacy: false,
        };
      }
    } catch {
      // Fail closed below. Never log the raw secret bundle.
    }
  }

  const legacy = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (legacy) {
    return {
      key: legacy,
      source: "SUPABASE_SERVICE_ROLE_KEY",
      legacy: true,
    };
  }

  return null;
}

export function hasSupabaseWorkerSecret(
  env: Record<string, string | undefined>,
): boolean {
  return Boolean(resolveSupabaseWorkerSecret(env));
}
