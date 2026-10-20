import { createHash, timingSafeEqual } from "node:crypto";

import { resolveSupabaseWorkerSecret } from "@/lib/supabase/worker-config";

export type ToroRuntimeHealthConfig = {
  enabled: boolean;
  authConfigured: boolean;
  supabasePublicConfigured: boolean;
  workerSecretConfigured: boolean;
  workerSecretSource: string | null;
  workerSecretLegacy: boolean | null;
  mcpEnabled: boolean;
  mcpResourceConfigured: boolean;
  brainCanonicalReadEnabled: boolean;
  ownerAttentionReadEnabled: boolean;
  deployment: {
    environment: string | null;
    gitCommitSha: string | null;
    productionUrl: string | null;
  };
};

function exactTrue(value: string | undefined) {
  return value === "true";
}

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

function resourceUrlConfigured(value: string | undefined) {
  const raw = value?.trim();
  if (!raw) return false;

  try {
    const url = new URL(raw);
    const local =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";

    return (
      (url.protocol === "https:" || local) &&
      url.pathname.endsWith("/api/mcp")
    );
  } catch {
    return false;
  }
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function isToroRuntimeHealthEnabled(
  env: Record<string, string | undefined>,
) {
  return exactTrue(env.TORO_RUNTIME_HEALTH_ENABLED);
}

export function isToroRuntimeHealthAuthorized(
  authorizationHeader: string | null,
  env: Record<string, string | undefined>,
) {
  const expected = env.TORO_RUNTIME_HEALTH_TOKEN?.trim();
  if (!expected || !authorizationHeader?.startsWith("Bearer ")) return false;

  const received = authorizationHeader.slice("Bearer ".length).trim();
  if (!received) return false;

  return timingSafeEqual(digest(received), digest(expected));
}

export function buildToroRuntimeHealthConfig(
  env: Record<string, string | undefined>,
): ToroRuntimeHealthConfig {
  const workerSecret = resolveSupabaseWorkerSecret(env);

  return {
    enabled: isToroRuntimeHealthEnabled(env),
    authConfigured: configured(env.TORO_RUNTIME_HEALTH_TOKEN),
    supabasePublicConfigured:
      configured(env.NEXT_PUBLIC_SUPABASE_URL) &&
      (configured(env.SUPABASE_PUBLISHABLE_KEY) ||
        configured(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)),
    workerSecretConfigured: Boolean(workerSecret),
    workerSecretSource: workerSecret?.source ?? null,
    workerSecretLegacy: workerSecret?.legacy ?? null,
    mcpEnabled: exactTrue(env.TORO_MCP_ENABLED),
    mcpResourceConfigured: resourceUrlConfigured(env.TORO_MCP_RESOURCE_URL),
    brainCanonicalReadEnabled: exactTrue(
      env.TORO_BRAIN_CANONICAL_READ_ENABLED,
    ),
    ownerAttentionReadEnabled: exactTrue(
      env.TORO_OWNER_ATTENTION_READ_ENABLED,
    ),
    deployment: {
      environment: env.VERCEL_ENV?.trim() || null,
      gitCommitSha: env.VERCEL_GIT_COMMIT_SHA?.trim() || null,
      productionUrl: env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || null,
    },
  };
}
