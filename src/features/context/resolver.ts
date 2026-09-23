import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { deriveToroContextPolicy } from "./policy";
import type {
  ResolveToroContext,
  ToroCanonicalRole,
  ToroContextRequest,
  ToroResolvedMembership,
} from "./types";

const CANONICAL_ROLES = new Set<ToroCanonicalRole>([
  "ADMIN",
  "RRHH",
  "GERENCIA",
  "JEFE_DEPARTAMENTO",
  "CONTABILIDAD",
  "AUDITOR",
  "EMPLEADO",
]);

function normalizeRoleCode(value: unknown): ToroCanonicalRole | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return CANONICAL_ROLES.has(code as ToroCanonicalRole)
    ? (code as ToroCanonicalRole)
    : null;
}

function parseRoleRows(rows: unknown): Map<string, ToroCanonicalRole[]> | null {
  if (!Array.isArray(rows)) return null;

  const byOrg = new Map<string, Set<ToroCanonicalRole>>();

  for (const row of rows) {
    if (!row || typeof row !== "object") return null;

    const orgId = (row as { org_id?: unknown }).org_id;
    const relation = (row as { roles?: unknown }).roles;
    if (typeof orgId !== "string" || !orgId.trim()) return null;

    const rawRoles = Array.isArray(relation) ? relation : [relation];
    if (!rawRoles.length) return null;

    const roleSet = byOrg.get(orgId) ?? new Set<ToroCanonicalRole>();
    for (const role of rawRoles) {
      if (!role || typeof role !== "object") return null;
      const code = normalizeRoleCode((role as { code?: unknown }).code);
      if (code) roleSet.add(code);
    }

    if (roleSet.size) byOrg.set(orgId, roleSet);
  }

  return new Map(
    [...byOrg.entries()].map(([orgId, roles]) => [orgId, [...roles]]),
  );
}

function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}) {
  const candidate =
    user.user_metadata?.display_name ?? user.user_metadata?.full_name;

  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : user.email ?? "Usuario TORO";
}

async function resolveEmployeeId(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  orgId: string,
): Promise<string | null | undefined> {
  const { data, error } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .limit(1);

  if (error) return undefined;
  if (!Array.isArray(data) || data.length === 0) return null;

  const id = data[0]?.id;
  return typeof id === "string" && id ? id : null;
}

/**
 * Transitional resolver.
 *
 * Until organization_memberships lands, active/non-revoked user_roles are used
 * only as membership evidence. The output labels that provenance so WhatsApp,
 * Portal and agents can migrate to the final membership model without changing
 * their context contract.
 */
export const resolveToroContext: ResolveToroContext = async (
  request: ToroContextRequest = {},
) => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("org_id, roles(code)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .is("revoked_at", null);

  if (roleError) return null;

  const rolesByOrg = parseRoleRows(roleRows);
  if (!rolesByOrg) return null;

  const availableOrgIds = [...rolesByOrg.keys()].sort();
  const mode = request.mode ?? "organization";

  if (mode === "personal") {
    const policy = deriveToroContextPolicy({ mode: "personal" });

    return {
      userId: user.id,
      email: user.email ?? null,
      displayName: displayNameFromUser(user),
      mode,
      orgId: null,
      membership: null,
      availableOrgIds,
      allowedDataScopes: policy.allowedDataScopes,
      allowedTools: [],
      canUsePersonalVault: policy.canUsePersonalVault,
      canUseOrganizationData: policy.canUseOrganizationData,
      requiresContextChoice: false,
    };
  }

  let orgId = request.orgId ?? null;
  if (!orgId && availableOrgIds.length === 1) {
    orgId = availableOrgIds[0];
  }

  if (!orgId && availableOrgIds.length > 1) {
    const policy = deriveToroContextPolicy({
      mode: "organization",
      membershipStatus: null,
    });

    return {
      userId: user.id,
      email: user.email ?? null,
      displayName: displayNameFromUser(user),
      mode,
      orgId: null,
      membership: null,
      availableOrgIds,
      allowedDataScopes: policy.allowedDataScopes,
      allowedTools: [],
      canUsePersonalVault: policy.canUsePersonalVault,
      canUseOrganizationData: policy.canUseOrganizationData,
      requiresContextChoice: true,
    };
  }

  if (!orgId) return null;

  const roles = rolesByOrg.get(orgId);
  if (!roles?.length) return null;

  const employeeId = await resolveEmployeeId(supabase, user.id, orgId);
  if (employeeId === undefined) return null;

  const membership: ToroResolvedMembership = {
    orgId,
    membershipId: null,
    membershipType: employeeId ? "employee" : null,
    status: "active",
    roles,
    employeeId,
    source: "legacy_user_roles",
  };

  const policy = deriveToroContextPolicy({
    mode: "organization",
    membershipStatus: membership.status,
    roles,
  });

  return {
    userId: user.id,
    email: user.email ?? null,
    displayName: displayNameFromUser(user),
    mode,
    orgId,
    membership,
    availableOrgIds,
    allowedDataScopes: policy.allowedDataScopes,
    allowedTools: [],
    canUsePersonalVault: policy.canUsePersonalVault,
    canUseOrganizationData: policy.canUseOrganizationData,
    requiresContextChoice: false,
  };
};
