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
      const parsed: unknown = JSON.parse(bundle);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
      if (!Object.hasOwn(parsed, "default")) return null;
      const value = (parsed as Record<string, unknown>).default;
      const defaultKey =
        typeof value === "string" ? value.trim() : "";
      if (defaultKey) {
        return {
          key: defaultKey,
          source: "SUPABASE_SECRET_KEYS.default",
          legacy: false,
        };
      }
      return null;
    } catch {
      // An explicit broken modern configuration must not select another authority.
      // Never log the raw secret bundle.
      return null;
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
