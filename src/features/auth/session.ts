import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { resolveToroRole, type ToroRole } from "./roles";

export type ToroSession = {
  userId: string;
  email: string | null;
  displayName: string;
  role: ToroRole;
};

type UserRoleRow = {
  roles: { code?: string | null } | { code?: string | null }[] | null;
};

function roleCodesFromRows(rows: UserRoleRow[]): string[] {
  return rows.flatMap((row) => {
    if (Array.isArray(row.roles)) {
      return row.roles.map((role) => role.code).filter((code): code is string => Boolean(code));
    }
    return row.roles?.code ? [row.roles.code] : [];
  });
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

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .is("revoked_at", null);

  const role = resolveToroRole({
    explicitToroRole,
    systemRoleCodes: [
      ...metadataRoleCodes,
      ...roleCodesFromRows((roleRows ?? []) as unknown as UserRoleRow[]),
    ],
  });

  if (!role) return null;

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
