import type {
  ToroBoundedRunContext,
  ToroBoundedRunHandler,
} from "./bounded-worker";

export const GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION =
  "google_tasks.connector_preflight";

export type GoogleTasksConnectorStatus =
  | "CONNECTED"
  | "READ_ONLY"
  | "WRITE_GATED"
  | "NOT_CONFIGURED"
  | "AUTH_REQUIRED"
  | "ERROR";

export type GoogleTasksConnectorPreflightSnapshot = {
  orgId: string;
  taskId: string;
  runId: string;
  actionKey: typeof GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION;
  accountRef: string;
  status: GoogleTasksConnectorStatus;
  readMode: "read_only";
  externalWritesAllowed: false;
  tenantIsolationVerified: true;
  observedAt: string;
  permissions: string[];
  sourceRefs: string[];
};

export type GoogleTasksConnectorPreflightReader = (input: {
  orgId: string;
  taskId: string;
  runId: string;
  actionKey: typeof GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION;
  signal: AbortSignal;
}) => Promise<GoogleTasksConnectorPreflightSnapshot>;

const ACCEPTED_STATUSES = new Set<GoogleTasksConnectorStatus>([
  "CONNECTED",
  "READ_ONLY",
  "WRITE_GATED",
  "NOT_CONFIGURED",
  "AUTH_REQUIRED",
  "ERROR",
]);

function isSnapshot(
  value: unknown,
): value is GoogleTasksConnectorPreflightSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<GoogleTasksConnectorPreflightSnapshot>;
  return (
    typeof snapshot.orgId === "string" &&
    typeof snapshot.taskId === "string" &&
    typeof snapshot.runId === "string" &&
    snapshot.actionKey === GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION &&
    typeof snapshot.accountRef === "string" &&
    typeof snapshot.status === "string" &&
    ACCEPTED_STATUSES.has(snapshot.status as GoogleTasksConnectorStatus) &&
    snapshot.readMode === "read_only" &&
    snapshot.externalWritesAllowed === false &&
    snapshot.tenantIsolationVerified === true &&
    typeof snapshot.observedAt === "string" &&
    Array.isArray(snapshot.permissions) &&
    snapshot.permissions.every((permission) => typeof permission === "string") &&
    Array.isArray(snapshot.sourceRefs) &&
    snapshot.sourceRefs.length > 0 &&
    snapshot.sourceRefs.every(
      (reference) => typeof reference === "string" && reference.trim().length > 0,
    )
  );
}

export function createGoogleTasksConnectorPreflightHandler(input: {
  expectedAccountRef: string;
  readSnapshot: GoogleTasksConnectorPreflightReader;
  maxAgeMs?: number;
  now?: () => number;
}): ToroBoundedRunHandler {
  const maxAgeMs = input.maxAgeMs ?? 5 * 60_000;
  const now = input.now ?? Date.now;

  return {
    authority: "L0",
    effectMode: "read_only",
    externalActions: 0,
    execute: (context) =>
      input.readSnapshot({
        orgId: context.run.orgId,
        taskId: context.run.taskId,
        runId: context.run.id,
        actionKey: GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION,
        signal: context.signal,
      }),
    verify: async (value, context: ToroBoundedRunContext) => {
      if (!isSnapshot(value)) return null;

      const observedAt = Date.parse(value.observedAt);
      const ageMs = now() - observedAt;
      if (
        value.orgId !== context.run.orgId ||
        value.taskId !== context.run.taskId ||
        value.runId !== context.run.id ||
        value.actionKey !== context.run.actionKey ||
        value.actionKey !== context.admission.actionKey ||
        value.accountRef !== input.expectedAccountRef ||
        !Number.isFinite(observedAt) ||
        ageMs < 0 ||
        ageMs > maxAgeMs
      ) {
        return null;
      }

      return {
        verified: true,
        desiredState: {
          actionKey: GOOGLE_TASKS_CONNECTOR_PREFLIGHT_ACTION,
          effectMode: "read_only",
          externalWritesAllowed: false,
        },
        executedState: {
          externalActions: 0,
          externalWrites: 0,
        },
        observedAfter: {
          accountRef: value.accountRef,
          status: value.status,
          observedAt: value.observedAt,
          permissions: value.permissions,
          tenantIsolationVerified: true,
        },
        verificationMethod: "google_tasks_connector_capability_readback",
        evidenceRefs: value.sourceRefs,
      };
    },
  };
}
