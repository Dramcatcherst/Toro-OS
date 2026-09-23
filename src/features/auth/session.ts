import "server-only";

import { resolveLegacySessionRole } from "@/features/context/legacy-session-adapter";
import { resolveToroContext } from "@/features/context/resolver";
import type { ToroCanonicalRole } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { ToroRole } from "./roles";

export type ToroSession = {
  userId: string;
  email: string | null;
  displayName: string;
  role: ToroRole;
  orgId: string;
  employeeId: string | null;
  canonicalRoles: ToroCanonicalRole[];
};

export async function getToroSession(): Promise<ToroSession | null> {
  const context = await resolveToroContext({ mode: "organization" });

  if (
    !context ||
    context.requiresContextChoice ||
    context.mode !== "organization" ||
    !context.orgId ||
    !context.membership ||
    context.membership.status !== "active"
  ) {
    return null;
  }

  // Revalidate the Auth identity at the shell boundary. This deliberately
  // catches sign-out/account changes between context resolution and render.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== context.userId) return null;

  const explicitToroRole =
    typeof user.app_metadata?.toro_role === "string"
      ? user.app_metadata.toro_role
      : null;

  const role = resolveLegacySessionRole({
    context,
    explicitToroRole,
  });

  if (!role) return null;

  return {
    userId: context.userId,
    email: context.email,
    displayName: context.displayName,
    role,
    orgId: context.orgId,
    employeeId: context.membership.employeeId,
    canonicalRoles: context.membership.roles,
  };
}
