import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { resolveToroRole, type ToroRole } from "./roles";

export type ToroSession = {
  userId: string;
  email: string | null;
  displayName: string;
  role: ToroRole;
};

function membershipCode(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;

  const code = (value as { code?: unknown }).code;
  return typeof code === "string" && code.trim() ? code.trim() : null;
}

function roleCodesFromRows(rows: unknown): string[] | null {
  if (!Array.isArray(rows)) return null;

  const codes: string[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object" || !("roles" in row)) return null;

    const roles = (row as { roles: unknown }).roles;
    if (Array.isArray(roles)) {
      if (roles.length === 0) return null;
      for (const role of roles) {
        const code = membershipCode(role);
        if (!code) return null;
        codes.push(code);
      }
      continue;
    }

    const code = membershipCode(roles);
    if (!code) return null;
    codes.push(code);
  }

  return codes;
}

export async function getToroSession(): Promise<ToroSession | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const explicitToroRole =
    typeof user.app_metadata?.toro_role === "string"
      ? user.app_metadata.toro_role
      : null;

  const metadataRoleCodes = Array.isArray(user.app_metadata?.role_codes)
    ? user.app_metadata.role_codes.filter(
        (role: unknown): role is string => typeof role === "string",
      )
    : [];

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .is("revoked_at", null);

  if (roleError) return null;

  const membershipRoleCodes = roleCodesFromRows(roleRows);
  if (!membershipRoleCodes?.length) return null;

  const role = resolveToroRole({
    explicitToroRole,
    systemRoleCodes: [
      ...metadataRoleCodes,
      ...membershipRoleCodes,
    ],
  });

  if (!role) return null;
  if (
    role === "FOUNDER" &&
    !membershipRoleCodes.some((code) =>
      ["ADMIN", "GERENCIA"].includes(code.toUpperCase()),
    )
  ) {
    return null;
  }

  const displayNameCandidate =
    user.user_metadata?.display_name ?? user.user_metadata?.full_name;

  return {
    userId: user.id,
    email: user.email ?? null,
    displayName:
      typeof displayNameCandidate === "string" && displayNameCandidate.trim()
        ? displayNameCandidate.trim()
        : user.email ?? "Usuario TORO",
    role,
  };
}
