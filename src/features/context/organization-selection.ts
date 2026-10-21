import "server-only";

import { cookies } from "next/headers";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ToroResolvedContext } from "./types";

export const TORO_ACTIVE_ORGANIZATION_COOKIE = "toro_active_organization_v1";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ToroOrganizationPreference = {
  userId: string;
  organizationId: string;
};

export type ToroOrganizationChoice = {
  id: string;
  name: string;
};

export type ToroOrganizationChoices =
  | { state: "ready"; choices: ToroOrganizationChoice[] }
  | { state: "unavailable"; choices: [] };

export function parseToroOrganizationId(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return UUID_PATTERN.test(normalized) ? normalized.toLowerCase() : null;
}

export function serializeToroOrganizationPreference(userId: string, organizationId: string) {
  const parsedUserId = parseToroOrganizationId(userId);
  const parsedOrganizationId = parseToroOrganizationId(organizationId);
  if (!parsedUserId || !parsedOrganizationId) {
    throw new Error("Invalid organization preference.");
  }
  return `${parsedUserId}:${parsedOrganizationId}`;
}

export function parseToroOrganizationPreference(value: unknown): ToroOrganizationPreference | null {
  if (typeof value !== "string") return null;
  const parts = value.split(":");
  if (parts.length !== 2) return null;
  const userId = parseToroOrganizationId(parts[0]);
  const organizationId = parseToroOrganizationId(parts[1]);
  return userId && organizationId ? { userId, organizationId } : null;
}

export async function readSelectedToroOrganizationPreference() {
  try {
    const value = (await cookies()).get(TORO_ACTIVE_ORGANIZATION_COOKIE)?.value;
    return parseToroOrganizationPreference(value);
  } catch {
    // Some deterministic tests and non-request runtimes have no cookie store.
    return null;
  }
}

export function toroOrganizationCookieOptions(requestUrl: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: new URL(requestUrl).protocol === "https:",
    path: "/",
    priority: "high" as const,
  };
}

export async function loadToroOrganizationChoices(
  context: ToroResolvedContext,
): Promise<ToroOrganizationChoices> {
  if (!context.requiresContextChoice || context.availableOrgIds.length < 2) {
    return { state: "unavailable", choices: [] };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("id,name")
      .in("id", context.availableOrgIds)
      .is("deleted_at", null);

    if (error || !Array.isArray(data)) {
      return { state: "unavailable", choices: [] };
    }

    const names = new Map<string, string>();
    for (const row of data) {
      const id = (row as { id?: unknown }).id;
      const name = (row as { name?: unknown }).name;
      if (typeof id === "string" && typeof name === "string" && name.trim()) {
        names.set(id, name.trim());
      }
    }

    const choices = context.availableOrgIds.flatMap((id) => {
      const name = names.get(id);
      return name ? [{ id, name }] : [];
    });

    // Never show a partial selector: an omitted label could steer the user into
    // the wrong scope. The membership resolver remains the authority either way.
    if (choices.length !== context.availableOrgIds.length) {
      return { state: "unavailable", choices: [] };
    }

    return { state: "ready", choices };
  } catch {
    return { state: "unavailable", choices: [] };
  }
}
