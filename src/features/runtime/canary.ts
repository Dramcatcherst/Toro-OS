import { createHash, timingSafeEqual } from "node:crypto";

export type ToroWorkerCanaryConfig = {
  enabled: boolean;
  authConfigured: boolean;
  orgId: string | null;
  taskId: string | null;
  gitCommitSha: string | null;
};

function exactTrue(value: string | undefined) {
  return value === "true";
}

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function isToroWorkerCanaryEnabled(
  env: Record<string, string | undefined>,
) {
  return exactTrue(env.TORO_WORKER_CANARY_ENABLED);
}

export function isToroWorkerCanaryAuthorized(
  authorizationHeader: string | null,
  env: Record<string, string | undefined>,
) {
  const expected = env.TORO_WORKER_CANARY_TOKEN?.trim();
  if (!expected || !authorizationHeader?.startsWith("Bearer ")) return false;

  const received = authorizationHeader.slice("Bearer ".length).trim();
  if (!received) return false;

  return timingSafeEqual(digest(received), digest(expected));
}

export function getToroWorkerCanaryConfig(
  env: Record<string, string | undefined>,
): ToroWorkerCanaryConfig {
  return {
    enabled: isToroWorkerCanaryEnabled(env),
    authConfigured: configured(env.TORO_WORKER_CANARY_TOKEN),
    orgId: env.TORO_WORKER_CANARY_ORG_ID?.trim() || null,
    taskId: env.TORO_WORKER_CANARY_TASK_ID?.trim() || null,
    gitCommitSha: env.VERCEL_GIT_COMMIT_SHA?.trim() || null,
  };
}
