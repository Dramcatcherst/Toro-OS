export const PATRIMONY_OWNER_SUMMARY_RPC =
  "public.toro_patrimony_owner_summary_v1" as const;

export const PATRIMONY_OWNER_SUMMARY_CAPABILITY =
  "patrimony.owner_summary.read" as const;

export const openClawPatrimonyOwnerSummaryControls = [
  "canonical_cloud_host",
  "primary_writer_only",
  "whatsapp_channel",
  "protected_account_binding",
  "private_scope",
  "direct_conversation",
  "verified_binding",
  "active_binding",
  "binding_org_matches_target",
  "active_session",
  "session_not_revoked",
  "session_not_expired",
  "session_org_matches_target",
  "actor_bound",
  "actor_matches_request",
  "active_membership",
  "admin_role",
  "founder_claim",
  "capability_granted",
  "user_jwt_only",
  "exact_rpc",
  "fresh_request",
  "bounded_timeout",
  "single_attempt",
  "idempotency_and_correlation",
  "sanitized_logs",
  "aggregate_top_level_shape",
  "response_contract_and_scope",
  "numeric_aggregates",
  "forbidden_registry_fields_absent",
] as const;

export type OpenClawPatrimonyControl =
  (typeof openClawPatrimonyOwnerSummaryControls)[number];

type ControlCheck = {
  key: OpenClawPatrimonyControl;
  passed: boolean;
  detail: string;
};

export type OpenClawPatrimonyRequest = {
  runtime: {
    expectedHostId: string;
    hostId: string;
    mode: "cloud" | "local";
    writerMode: "primary" | "cold-standby";
  };
  channel: {
    expectedAccountKey: string;
    accountKey: string;
    kind: string;
    scope: "private" | "organization" | "shared";
    conversationKind: "direct" | "group";
    bindingStatus: "verified" | "unverified" | "revoked";
    bindingActive: boolean;
    bindingOrgId: string;
  };
  session: {
    status: "active" | "inactive";
    actorUserId: string | null;
    orgId: string;
    expiresAt: string | null;
    revokedAt: string | null;
  };
  actor: {
    userId: string;
    membershipStatus: "active" | "inactive";
    roles: readonly string[];
    toroRole: string;
    capabilities: readonly string[];
  };
  auth: {
    dbRole: "authenticated" | "anon" | "service_role";
    tokenKind: "user" | "publishable" | "service_role" | "none";
    tokenPresent: boolean;
  };
  request: {
    rpc: string;
    orgId: string;
    actorId: string;
    ageMs: number;
    timeoutMs: number;
    attempt: number;
    idempotencyKey: string;
    correlationId: string;
  };
  observability: {
    mode: "sanitized" | "raw";
    rawIdentifiersIncluded: boolean;
    rawPayloadIncluded: boolean;
  };
};

export type OpenClawPatrimonyRequestEvaluation = {
  allowed: boolean;
  checks: ControlCheck[];
  blockers: OpenClawPatrimonyControl[];
};

const SAFE_KEY = /^[A-Za-z0-9._:-]{8,180}$/;

function timestampMs(value: unknown) {
  if (typeof value !== "string") return Number.NaN;
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!parts) return Number.NaN;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = parts;
  const [year, month, day, hour, minute, second] = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1] || hour > 23 || minute > 59 || second > 59) return Number.NaN;
  return Date.parse(value);
}

export function evaluateOpenClawPatrimonyRequest(
  input: OpenClawPatrimonyRequest,
  nowMs = Date.now(),
): OpenClawPatrimonyRequestEvaluation {
  const expiresAt = timestampMs(input.session.expiresAt);

  const checks: ControlCheck[] = [
    { key: "canonical_cloud_host", passed: Boolean(input.runtime.expectedHostId) && input.runtime.hostId === input.runtime.expectedHostId && input.runtime.mode === "cloud", detail: "The observed host matches the protected cloud host configuration." },
    { key: "primary_writer_only", passed: input.runtime.writerMode === "primary", detail: "Only the primary cloud runtime may execute the capability." },
    { key: "whatsapp_channel", passed: input.channel.kind === "whatsapp", detail: "The request arrived through the governed WhatsApp channel." },
    { key: "protected_account_binding", passed: Boolean(input.channel.expectedAccountKey) && input.channel.accountKey === input.channel.expectedAccountKey, detail: "The account matches the protected binding without hard-coding its identifier." },
    { key: "private_scope", passed: input.channel.scope === "private", detail: "Patrimony is restricted to the owner's private scope." },
    { key: "direct_conversation", passed: input.channel.conversationKind === "direct", detail: "Groups and shared threads are denied." },
    { key: "verified_binding", passed: input.channel.bindingStatus === "verified", detail: "The channel binding is verified." },
    { key: "active_binding", passed: input.channel.bindingActive, detail: "The channel binding is active." },
    { key: "binding_org_matches_target", passed: input.channel.bindingOrgId === input.request.orgId, detail: "The binding and patrimony target use the same organization." },
    { key: "active_session", passed: input.session.status === "active", detail: "The durable channel session is active." },
    { key: "session_not_revoked", passed: input.session.revokedAt === null, detail: "The session has not been revoked." },
    { key: "session_not_expired", passed: Number.isFinite(expiresAt) && expiresAt > nowMs, detail: "The session has a finite expiration after the current time." },
    { key: "session_org_matches_target", passed: input.session.orgId === input.request.orgId, detail: "The session and patrimony target use the same organization." },
    { key: "actor_bound", passed: typeof input.session.actorUserId === "string" && input.session.actorUserId.length > 0, detail: "The session is durably bound to a canonical user." },
    { key: "actor_matches_request", passed: input.session.actorUserId === input.actor.userId && input.actor.userId === input.request.actorId, detail: "Session, actor and RPC actor are identical." },
    { key: "active_membership", passed: input.actor.membershipStatus === "active", detail: "The actor has an active organization membership." },
    { key: "admin_role", passed: input.actor.roles.includes("ADMIN"), detail: "The actor has the required active ADMIN role." },
    { key: "founder_claim", passed: input.actor.toroRole === "FOUNDER", detail: "The actor carries the required FOUNDER claim." },
    { key: "capability_granted", passed: input.actor.capabilities.includes(PATRIMONY_OWNER_SUMMARY_CAPABILITY), detail: "The exact read capability is present." },
    { key: "user_jwt_only", passed: input.auth.dbRole === "authenticated" && input.auth.tokenKind === "user" && input.auth.tokenPresent, detail: "Only a real authenticated user JWT is accepted; anon and service role are denied." },
    { key: "exact_rpc", passed: input.request.rpc === PATRIMONY_OWNER_SUMMARY_RPC, detail: "Only the bounded owner-summary RPC may be invoked." },
    { key: "fresh_request", passed: Number.isFinite(input.request.ageMs) && input.request.ageMs >= 0 && input.request.ageMs <= 60_000, detail: "The request is no more than 60 seconds old." },
    { key: "bounded_timeout", passed: Number.isFinite(input.request.timeoutMs) && input.request.timeoutMs >= 250 && input.request.timeoutMs <= 3_000, detail: "The request timeout is bounded to three seconds." },
    { key: "single_attempt", passed: input.request.attempt === 1, detail: "No blind retry is allowed for an ambiguous result." },
    { key: "idempotency_and_correlation", passed: SAFE_KEY.test(input.request.idempotencyKey) && SAFE_KEY.test(input.request.correlationId) && input.request.idempotencyKey !== input.request.correlationId, detail: "Distinct safe idempotency and correlation identifiers are required." },
    { key: "sanitized_logs", passed: input.observability.mode === "sanitized" && !input.observability.rawIdentifiersIncluded && !input.observability.rawPayloadIncluded, detail: "Logs exclude raw identifiers, tokens and payloads." },
  ];

  const blockers = checks
    .filter((check) => !check.passed)
    .map((check) => check.key);

  return { allowed: blockers.length === 0, checks, blockers };
}

const TOP_LEVEL_KEYS = [
  "actorId",
  "conflicts",
  "contract",
  "counts",
  "generatedAt",
  "orgId",
  "snapshot",
] as const;

const COUNT_KEYS = [
  "assetInterests",
  "assets",
  "conflicts",
  "legalEntities",
  "people",
  "propertyRelations",
  "propertyRights",
  "registryEntries",
  "snapshots",
  "subjects",
  "vehicles",
] as const;

const CONFLICT_KEYS = ["critical", "high", "open"] as const;

const FORBIDDEN_KEYS = new Set([
  "name", "names", "legalid", "cedula", "folio", "plan", "plate", "vin",
  "chassis", "amount", "value", "mortgage", "creditor", "counterparty",
  "hash", "path", "file", "document", "payload", "details",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value: unknown, expected: readonly string[]) {
  return isRecord(value) &&
    Object.keys(value).sort().join("|") === [...expected].sort().join("|");
}

function nonNegativeInteger(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function containsForbiddenKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenKey);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, child]) =>
    FORBIDDEN_KEYS.has(key.toLowerCase()) || containsForbiddenKey(child));
}

export type OpenClawPatrimonyResponseEvaluation = {
  safe: boolean;
  checks: ControlCheck[];
  blockers: OpenClawPatrimonyControl[];
};

export function evaluateOpenClawPatrimonyResponse(
  payload: unknown,
  expected: { orgId: string; actorId: string },
): OpenClawPatrimonyResponseEvaluation {
  const row = isRecord(payload) ? payload : {};
  const counts = isRecord(row.counts) ? row.counts : {};
  const conflicts = isRecord(row.conflicts) ? row.conflicts : {};
  const snapshot = row.snapshot;
  const generatedAt = timestampMs(row.generatedAt);
  const snapshotDatesSafe = isRecord(snapshot) &&
    (snapshot.observedAt === null || (Number.isFinite(timestampMs(snapshot.observedAt)) && timestampMs(snapshot.observedAt) <= generatedAt)) &&
    (snapshot.verifiedAt === null || (Number.isFinite(timestampMs(snapshot.verifiedAt)) && timestampMs(snapshot.verifiedAt) <= generatedAt)) &&
    (snapshot.observedAt === null || snapshot.verifiedAt === null || timestampMs(snapshot.observedAt) <= timestampMs(snapshot.verifiedAt));
  const snapshotSafe = snapshot === null ||
    (hasExactKeys(snapshot, ["matrixVersion", "observedAt", "verifiedAt"]) &&
      isRecord(snapshot) &&
      typeof snapshot.matrixVersion === "string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,179}$/.test(snapshot.matrixVersion) &&
      snapshotDatesSafe);

  const checks: ControlCheck[] = [
    { key: "aggregate_top_level_shape", passed: hasExactKeys(row, TOP_LEVEL_KEYS) && snapshotSafe, detail: "The response exposes only the approved aggregate envelope and snapshot metadata." },
    { key: "response_contract_and_scope", passed: row.contract === "patrimony-owner-summary-v1" && row.orgId === expected.orgId && row.actorId === expected.actorId && Number.isFinite(generatedAt), detail: "The contract, actor, organization and timestamp match the request." },
    { key: "numeric_aggregates", passed: hasExactKeys(counts, COUNT_KEYS) && COUNT_KEYS.every((key) => nonNegativeInteger(counts[key])) && hasExactKeys(conflicts, CONFLICT_KEYS) && CONFLICT_KEYS.every((key) => nonNegativeInteger(conflicts[key])) && Number(conflicts.critical) + Number(conflicts.high) <= Number(conflicts.open) && Number(conflicts.open) <= Number(counts.conflicts), detail: "All approved aggregate values are safe non-negative integers with coherent conflict totals." },
    { key: "forbidden_registry_fields_absent", passed: !containsForbiddenKey(row), detail: "No registry identity, folio, vehicle, amount, document, hash, path or details field is present." },
  ];

  const blockers = checks
    .filter((check) => !check.passed)
    .map((check) => check.key);

  return { safe: blockers.length === 0, checks, blockers };
}
