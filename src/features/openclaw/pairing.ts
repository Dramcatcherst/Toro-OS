import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";

import { resolveToroContext } from "@/features/context/resolver";
import {
  hashOpenClawChannelSubject,
  normalizeOpenClawChannelIdentity,
} from "@/features/openclaw/channel-context";
import type { ToroResolvedContext } from "@/features/context/types";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

type PrivilegedClient = ReturnType<typeof createPrivilegedSupabaseClient>;

const CHANNEL_RE = /^[a-z][a-z0-9_]{1,31}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > maxLength) return null;
  return cleaned;
}

function canManageOpenClawPairing(context: ToroResolvedContext) {
  return Boolean(
    context.mode === "organization" &&
      context.orgId &&
      context.membership?.status === "active" &&
      context.canUseOrganizationData &&
      !context.requiresContextChoice &&
      context.membership.roles.some(
        (role) => role === "ADMIN" || role === "GERENCIA",
      ),
  );
}

export type OpenClawPairingResult =
  | {
      state: "issued";
      enrollmentId: string;
      token: string;
      expiresAt: string;
      channel: string;
      connectionKey: string;
    }
  | { state: "revoked"; identityId: string }
  | { state: "cancelled"; enrollmentId: string }
  | { state: "invalid"; error: string }
  | { state: "unauthenticated" }
  | { state: "forbidden"; error: string }
  | { state: "unavailable"; error: string };

export function hashOpenClawPairingToken(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function loadManagerContext() {
  const context = await resolveToroContext({ mode: "organization" });
  if (!context) return { context: null, error: "unauthenticated" as const };
  if (!canManageOpenClawPairing(context)) {
    return { context: null, error: "forbidden" as const };
  }
  return { context, error: null };
}

export async function issueOpenClawPairing(
  input: unknown,
  injected?: {
    context?: ToroResolvedContext;
    client?: PrivilegedClient;
    now?: Date;
    token?: string;
  },
): Promise<OpenClawPairingResult> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { state: "invalid", error: "Pairing request must be an object." };
  }

  const record = input as Record<string, unknown>;
  const employeeId = cleanText(record.employeeId, 36);
  const channel = cleanText(record.channel, 32)?.toLowerCase() ?? null;
  const connectionKey = cleanText(record.connectionKey, 128);
  const confirmation = cleanText(record.confirmation, 32);

  if (confirmation !== "PAIR_CHANNEL") {
    return { state: "invalid", error: "Explicit PAIR_CHANNEL confirmation is required." };
  }
  if (!employeeId || !UUID_RE.test(employeeId)) {
    return { state: "invalid", error: "A canonical employeeId is required." };
  }
  if (!channel || !CHANNEL_RE.test(channel)) {
    return { state: "invalid", error: "Invalid channel." };
  }
  if (!connectionKey || connectionKey.length < 3) {
    return { state: "invalid", error: "Invalid connectionKey." };
  }

  let context = injected?.context;
  if (!context) {
    const managed = await loadManagerContext();
    if (managed.error === "unauthenticated") return { state: "unauthenticated" };
    if (managed.error === "forbidden") {
      return { state: "forbidden", error: "ADMIN or GERENCIA is required." };
    }
    context = managed.context!;
  }

  if (!canManageOpenClawPairing(context) || !context.orgId) {
    return { state: "forbidden", error: "ADMIN or GERENCIA is required." };
  }

  let client: PrivilegedClient;
  try {
    client = injected?.client ?? createPrivilegedSupabaseClient();
  } catch {
    return { state: "unavailable", error: "Privileged pairing transport is not configured." };
  }

  const employee = await client
    .from("employees")
    .select("id,user_id,employment_status,status,deleted_at")
    .eq("id", employeeId)
    .eq("org_id", context.orgId)
    .eq("employment_status", "active")
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(1);

  if (employee.error) {
    return { state: "unavailable", error: "Employee verification failed safely." };
  }

  const employeeRow = Array.isArray(employee.data) ? employee.data[0] : null;
  if (
    !employeeRow ||
    typeof (employeeRow as { user_id?: unknown }).user_id !== "string"
  ) {
    return {
      state: "forbidden",
      error: "Target employee must be active and linked to a TORO user.",
    };
  }

  const userId = (employeeRow as { user_id: string }).user_id;
  const membership = await client
    .schema("identity")
    .from("organization_memberships")
    .select("id")
    .eq("org_id", context.orgId)
    .eq("user_id", userId)
    .eq("primary_employee_id", employeeId)
    .eq("status", "active")
    .limit(1);

  if (membership.error) {
    return { state: "unavailable", error: "Membership verification failed safely." };
  }
  if (!Array.isArray(membership.data) || membership.data.length !== 1) {
    return {
      state: "forbidden",
      error: "Target employee needs one active organization membership.",
    };
  }

  const cancelled = await client
    .from("employee_channel_enrollments")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("org_id", context.orgId)
    .eq("employee_id", employeeId)
    .eq("channel", channel)
    .eq("connection_key", connectionKey)
    .eq("status", "pending");

  if (cancelled.error) {
    return { state: "unavailable", error: "Prior pairing cancellation failed safely." };
  }

  const token = injected?.token ?? randomBytes(32).toString("base64url");
  if (token.length < 32) {
    return { state: "unavailable", error: "Generated pairing token was invalid." };
  }

  const now = injected?.now ?? new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60_000).toISOString();
  const tokenHash = hashOpenClawPairingToken(token);
  const idempotencyKey = `openclaw-enroll:${randomUUID()}`;

  const inserted = await client
    .from("employee_channel_enrollments")
    .insert({
      org_id: context.orgId,
      employee_id: employeeId,
      channel,
      connection_key: connectionKey,
      token_hash: tokenHash,
      status: "pending",
      expires_at: expiresAt,
      created_by: context.userId,
      idempotency_key: idempotencyKey,
    })
    .select("id")
    .single();

  if (inserted.error || !inserted.data || typeof inserted.data.id !== "string") {
    return { state: "unavailable", error: "Pairing challenge creation failed safely." };
  }

  return {
    state: "issued",
    enrollmentId: inserted.data.id,
    token,
    expiresAt,
    channel,
    connectionKey,
  };
}

export async function revokeOpenClawChannelIdentity(
  input: unknown,
  injected?: {
    context?: ToroResolvedContext;
    client?: PrivilegedClient;
    now?: Date;
  },
): Promise<OpenClawPairingResult> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { state: "invalid", error: "Revocation request must be an object." };
  }

  const revocationRecord = input as Record<string, unknown>;
  const confirmation = cleanText(revocationRecord.confirmation, 32);
  const identityId = cleanText(
    revocationRecord.identityId,
    36,
  );
  if (confirmation !== "REVOKE_CHANNEL") {
    return { state: "invalid", error: "Explicit REVOKE_CHANNEL confirmation is required." };
  }
  if (!identityId || !UUID_RE.test(identityId)) {
    return { state: "invalid", error: "A canonical identityId is required." };
  }

  let context = injected?.context;
  if (!context) {
    const managed = await loadManagerContext();
    if (managed.error === "unauthenticated") return { state: "unauthenticated" };
    if (managed.error === "forbidden") {
      return { state: "forbidden", error: "ADMIN or GERENCIA is required." };
    }
    context = managed.context!;
  }

  if (!canManageOpenClawPairing(context) || !context.orgId) {
    return { state: "forbidden", error: "ADMIN or GERENCIA is required." };
  }

  let client: PrivilegedClient;
  try {
    client = injected?.client ?? createPrivilegedSupabaseClient();
  } catch {
    return { state: "unavailable", error: "Privileged pairing transport is not configured." };
  }

  const nowIso = (injected?.now ?? new Date()).toISOString();
  const updated = await client
    .from("employee_channel_identities")
    .update({
      status: "revoked",
      revoked_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", identityId)
    .eq("org_id", context.orgId)
    .eq("status", "active")
    .select("id")
    .limit(1);

  if (updated.error) {
    return { state: "unavailable", error: "Channel identity revocation failed safely." };
  }

  if (!Array.isArray(updated.data) || updated.data.length !== 1) {
    return { state: "invalid", error: "Active channel identity was not found." };
  }

  return { state: "revoked", identityId };
}

export async function cancelOpenClawPairing(
  input: unknown,
  injected?: {
    context?: ToroResolvedContext;
    client?: PrivilegedClient;
    now?: Date;
  },
): Promise<OpenClawPairingResult> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { state: "invalid", error: "Cancellation request must be an object." };
  }

  const cancellationRecord = input as Record<string, unknown>;
  const confirmation = cleanText(cancellationRecord.confirmation, 32);
  const enrollmentId = cleanText(
    cancellationRecord.enrollmentId,
    36,
  );
  if (confirmation !== "CANCEL_PAIRING") {
    return { state: "invalid", error: "Explicit CANCEL_PAIRING confirmation is required." };
  }
  if (!enrollmentId || !UUID_RE.test(enrollmentId)) {
    return { state: "invalid", error: "A canonical enrollmentId is required." };
  }

  let context = injected?.context;
  if (!context) {
    const managed = await loadManagerContext();
    if (managed.error === "unauthenticated") return { state: "unauthenticated" };
    if (managed.error === "forbidden") {
      return { state: "forbidden", error: "ADMIN or GERENCIA is required." };
    }
    context = managed.context!;
  }

  if (!canManageOpenClawPairing(context) || !context.orgId) {
    return { state: "forbidden", error: "ADMIN or GERENCIA is required." };
  }

  let client: PrivilegedClient;
  try {
    client = injected?.client ?? createPrivilegedSupabaseClient();
  } catch {
    return { state: "unavailable", error: "Privileged pairing transport is not configured." };
  }

  const nowIso = (injected?.now ?? new Date()).toISOString();
  const updated = await client
    .from("employee_channel_enrollments")
    .update({ status: "cancelled", cancelled_at: nowIso })
    .eq("id", enrollmentId)
    .eq("org_id", context.orgId)
    .eq("status", "pending")
    .select("id")
    .limit(1);

  if (updated.error) {
    return { state: "unavailable", error: "Pairing cancellation failed safely." };
  }

  if (!Array.isArray(updated.data) || updated.data.length !== 1) {
    return { state: "invalid", error: "Pending enrollment was not found." };
  }

  return { state: "cancelled", enrollmentId };
}


export type OpenClawPairingConsumeResult =
  | { state: "bound" | "already_bound" | "already_used" }
  | { state: "invalid" | "expired" | "cancelled" | "employee_inactive" | "employee_has_active_identity" | "subject_already_bound" | "conflict" }
  | { state: "unavailable"; error: string };

export async function consumeOpenClawPairing(
  input: unknown,
  client?: PrivilegedClient,
): Promise<OpenClawPairingConsumeResult> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { state: "invalid" };
  }

  const record = input as Record<string, unknown>;
  const token = cleanText(record.token, 256);
  const normalized = normalizeOpenClawChannelIdentity(record.identity);

  if (!token || token.length < 32 || !normalized.ok) {
    return { state: "invalid" };
  }

  let subjectHash: string;
  try {
    subjectHash = hashOpenClawChannelSubject(normalized.value);
  } catch {
    return {
      state: "unavailable",
      error: "Channel identity hashing is not configured.",
    };
  }

  let supabase: PrivilegedClient;
  try {
    supabase = client ?? createPrivilegedSupabaseClient();
  } catch {
    return {
      state: "unavailable",
      error: "Privileged pairing transport is not configured.",
    };
  }

  const result = await supabase.rpc("consume_employee_channel_enrollment_v1", {
    p_token_hash: hashOpenClawPairingToken(token),
    p_channel: normalized.value.channel,
    p_connection_key: normalized.value.connectionKey,
    p_subject_hash: subjectHash,
  });

  if (result.error) {
    return { state: "unavailable", error: "Pairing consumption failed safely." };
  }

  const status =
    result.data &&
    typeof result.data === "object" &&
    !Array.isArray(result.data) &&
    typeof (result.data as { status?: unknown }).status === "string"
      ? (result.data as { status: string }).status
      : null;

  switch (status) {
    case "bound":
    case "already_bound":
    case "already_used":
    case "invalid":
    case "expired":
    case "cancelled":
    case "employee_inactive":
    case "employee_has_active_identity":
    case "subject_already_bound":
    case "conflict":
      return { state: status };
    default:
      return { state: "unavailable", error: "Pairing response was not recognized." };
  }
}
