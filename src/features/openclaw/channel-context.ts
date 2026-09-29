import "server-only";

import { createHmac } from "node:crypto";

import { deriveToroContextPolicy } from "@/features/context/policy";
import type {
  ToroCanonicalRole,
  ToroMembershipType,
  ToroResolvedContext,
} from "@/features/context/types";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const CHANNEL_RE = /^[a-z][a-z0-9_]{1,31}$/;
const CANONICAL_ROLES = new Set<ToroCanonicalRole>([
  "ADMIN",
  "RRHH",
  "GERENCIA",
  "JEFE_DEPARTAMENTO",
  "CONTABILIDAD",
  "AUDITOR",
  "EMPLEADO",
]);
const MEMBERSHIP_TYPES = new Set<ToroMembershipType>([
  "employee",
  "owner",
  "contractor",
  "advisor",
  "provider",
  "other",
]);

export type OpenClawChannelIdentityInput = {
  channel: string;
  connectionKey: string;
  subject: string;
};

export type OpenClawChannelContextResult =
  | { state: "resolved"; context: ToroResolvedContext }
  | { state: "invalid"; error: string }
  | { state: "unlinked" }
  | { state: "forbidden"; error: string }
  | { state: "unavailable"; error: string };

type PrivilegedClient = ReturnType<typeof createPrivilegedSupabaseClient>;

type NormalizedChannelIdentity = {
  channel: string;
  connectionKey: string;
  subject: string;
};

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  if (!clean || clean.length > maxLength) return null;
  return clean;
}

export function normalizeOpenClawChannelIdentity(
  input: unknown,
):
  | { ok: true; value: NormalizedChannelIdentity }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Channel identity must be an object." };
  }

  const record = input as Record<string, unknown>;
  const channel = normalizeText(record.channel, 32)?.toLowerCase() ?? null;
  const connectionKey = normalizeText(record.connectionKey, 128);
  const subject = normalizeText(record.subject, 512);

  if (!channel || !CHANNEL_RE.test(channel)) {
    return { ok: false, error: "Invalid channel." };
  }
  if (!connectionKey || connectionKey.length < 3) {
    return { ok: false, error: "Invalid connectionKey." };
  }
  if (!subject) {
    return { ok: false, error: "Invalid channel subject." };
  }

  return {
    ok: true,
    value: { channel, connectionKey, subject },
  };
}

export function hashOpenClawChannelSubject(
  identity: NormalizedChannelIdentity,
  secret = process.env.TORO_CHANNEL_IDENTITY_HMAC_SECRET,
) {
  const key = secret?.trim();
  if (!key || key.length < 32) {
    throw new Error("Channel identity HMAC secret is not configured.");
  }

  const canonical = [
    identity.channel,
    identity.connectionKey,
    identity.subject,
  ].join("\u0000");

  return createHmac("sha256", key).update(canonical, "utf8").digest("hex");
}

function roleCode(value: unknown): ToroCanonicalRole | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return CANONICAL_ROLES.has(code as ToroCanonicalRole)
    ? (code as ToroCanonicalRole)
    : null;
}

function parseRoles(rows: unknown): ToroCanonicalRole[] | null {
  if (!Array.isArray(rows)) return null;

  const roles = new Set<ToroCanonicalRole>();
  for (const row of rows) {
    if (!row || typeof row !== "object") return null;
    const relation = (row as { roles?: unknown }).roles;
    const candidates = Array.isArray(relation) ? relation : [relation];
    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== "object") continue;
      const role = roleCode((candidate as { code?: unknown }).code);
      if (role) roles.add(role);
    }
  }

  return [...roles];
}

function membershipType(value: unknown): ToroMembershipType | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return MEMBERSHIP_TYPES.has(normalized as ToroMembershipType)
    ? (normalized as ToroMembershipType)
    : null;
}

function cleanOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function resolveOpenClawChannelContext(
  input: unknown,
  client?: PrivilegedClient,
): Promise<OpenClawChannelContextResult> {
  const normalized = normalizeOpenClawChannelIdentity(input);
  if (!normalized.ok) return { state: "invalid", error: normalized.error };

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
      error: "Privileged identity resolver is not configured.",
    };
  }

  const identityResult = await supabase
    .from("employee_channel_identities")
    .select("id,org_id,employee_id,status")
    .eq("channel", normalized.value.channel)
    .eq("connection_key", normalized.value.connectionKey)
    .eq("subject_hash", subjectHash)
    .eq("status", "active")
    .limit(2);

  if (identityResult.error) {
    return { state: "unavailable", error: "Channel identity lookup failed." };
  }

  if (!Array.isArray(identityResult.data) || identityResult.data.length === 0) {
    return { state: "unlinked" };
  }
  if (identityResult.data.length !== 1) {
    return {
      state: "unavailable",
      error: "Channel identity is not uniquely resolved.",
    };
  }

  const identity = identityResult.data[0] as {
    org_id?: unknown;
    employee_id?: unknown;
  };
  const orgId = cleanOptionalText(identity.org_id);
  const employeeId = cleanOptionalText(identity.employee_id);
  if (!orgId || !employeeId) {
    return { state: "unavailable", error: "Channel identity row is incomplete." };
  }

  const employeeResult = await supabase
    .from("employees")
    .select(
      "id,user_id,preferred_name,position_id,work_area,employment_status,status,deleted_at,positions(code,name)",
    )
    .eq("id", employeeId)
    .eq("org_id", orgId)
    .eq("employment_status", "active")
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(2);

  if (employeeResult.error) {
    return { state: "unavailable", error: "Employee identity lookup failed." };
  }
  if (!Array.isArray(employeeResult.data) || employeeResult.data.length !== 1) {
    return {
      state: "forbidden",
      error: "Channel actor is not an active employee identity.",
    };
  }

  const employee = employeeResult.data[0] as {
    id?: unknown;
    user_id?: unknown;
    preferred_name?: unknown;
    position_id?: unknown;
    work_area?: unknown;
    positions?: unknown;
  };
  const userId = cleanOptionalText(employee.user_id);
  if (!userId) {
    return {
      state: "forbidden",
      error: "Channel actor has no linked TORO user.",
    };
  }

  const membershipResult = await supabase
    .schema("identity")
    .from("organization_memberships")
    .select("id,membership_type,status,primary_employee_id")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(2);

  if (membershipResult.error) {
    return { state: "unavailable", error: "Organization membership lookup failed." };
  }
  if (!Array.isArray(membershipResult.data) || membershipResult.data.length !== 1) {
    return {
      state: "forbidden",
      error: "Active organization membership is required.",
    };
  }

  const membershipRow = membershipResult.data[0] as {
    id?: unknown;
    membership_type?: unknown;
    primary_employee_id?: unknown;
  };
  if (membershipRow.primary_employee_id !== employeeId) {
    return {
      state: "forbidden",
      error: "Channel identity does not match the active membership actor.",
    };
  }

  const roleResult = await supabase
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .eq("status", "active")
    .is("revoked_at", null);

  if (roleResult.error) {
    return { state: "unavailable", error: "Role lookup failed." };
  }

  const roles = parseRoles(roleResult.data);
  if (!roles?.length) {
    return {
      state: "forbidden",
      error: "An active canonical role is required.",
    };
  }

  const relation = Array.isArray(employee.positions)
    ? employee.positions[0]
    : employee.positions;
  const position =
    relation && typeof relation === "object"
      ? (relation as { code?: unknown; name?: unknown })
      : null;

  const resolvedMembershipType =
    membershipType(membershipRow.membership_type) ?? "employee";

  const resolvedMembership = {
    orgId,
    membershipId: cleanOptionalText(membershipRow.id),
    membershipType: resolvedMembershipType,
    status: "active" as const,
    roles,
    employeeId,
    employeePreferredName: cleanOptionalText(employee.preferred_name),
    positionId: cleanOptionalText(employee.position_id),
    positionCode: cleanOptionalText(position?.code),
    positionName: cleanOptionalText(position?.name),
    workArea: cleanOptionalText(employee.work_area),
    source: "organization_memberships" as const,
  };

  const policy = deriveToroContextPolicy({
    mode: "organization",
    membershipStatus: "active",
    roles,
  });

  return {
    state: "resolved",
    context: {
      userId,
      email: null,
      displayName:
        cleanOptionalText(employee.preferred_name) ?? "Usuario TORO",
      mode: "organization",
      orgId,
      membership: resolvedMembership,
      availableOrgIds: [orgId],
      allowedDataScopes: policy.allowedDataScopes,
      allowedTools: [],
      canUsePersonalVault: policy.canUsePersonalVault,
      canUseOrganizationData: policy.canUseOrganizationData,
      requiresContextChoice: false,
    },
  };
}
