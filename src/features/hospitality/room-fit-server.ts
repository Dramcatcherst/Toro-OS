import "server-only";

import { resolveToroContext } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { RoomFitCandidate } from "./room-fit";

export type RoomFitCatalogView = {
  displayName: string;
  candidates: RoomFitCandidate[];
};

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

export async function loadCurrentRoomFitCatalog(): Promise<RoomFitCatalogView | null> {
  const context = await resolveToroContext({ mode: "organization" });
  if (!context || !context.orgId || !context.membership || context.requiresContextChoice) {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  const [roomsResult, villasResult] = await Promise.all([
    supabase
      .schema("core")
      .from("rooms")
      .select(
        "room_key, room_number, name_es, name_en, max_capacity, best_for, kitchen_type, premium_tier, verified_status, public_visibility, ai_permission, active",
      )
      .eq("org_id", context.orgId)
      .eq("active", true)
      .eq("public_visibility", true)
      .eq("verified_status", "verified")
      .eq("ai_permission", "Guest Facing"),
    supabase
      .schema("core")
      .from("villas")
      .select(
        "villa_key, villa_code, name_es, name_en, max_capacity, best_for, verified_status, public_visibility, active",
      )
      .eq("org_id", context.orgId)
      .eq("active", true)
      .eq("public_visibility", true)
      .eq("verified_status", "verified"),
  ]);

  if (roomsResult.error || villasResult.error) return null;

  const rooms: RoomFitCandidate[] = (roomsResult.data ?? [])
    .map((raw) => {
      const row = raw as unknown as Record<string, unknown>;
      const capacity = cleanNumber(row.max_capacity);
      const roomNumber = cleanNumber(row.room_number);
      const key =
        cleanText(row.room_key) ??
        (roomNumber === null ? null : `room-${roomNumber}`);
      if (!capacity || !key) return null;

      return {
        key,
        kind: "room" as const,
        label:
          cleanText(row.name_es) ??
          cleanText(row.name_en) ??
          (roomNumber === null ? "Habitación" : `Habitación #${roomNumber}`),
        capacity,
        bestFor: cleanStringArray(row.best_for),
        kitchenType: cleanText(row.kitchen_type),
        premiumTier: cleanText(row.premium_tier),
        verified: true,
      };
    })
    .filter((item): item is RoomFitCandidate => item !== null);

  const villas: RoomFitCandidate[] = (villasResult.data ?? [])
    .map((raw) => {
      const row = raw as unknown as Record<string, unknown>;
      const capacity = cleanNumber(row.max_capacity);
      const key = cleanText(row.villa_key) ?? cleanText(row.villa_code);
      if (!capacity || !key) return null;

      return {
        key,
        kind: "villa" as const,
        label: cleanText(row.name_es) ?? cleanText(row.name_en) ?? "Villa",
        capacity,
        bestFor: cleanStringArray(row.best_for),
        verified: true,
      };
    })
    .filter((item): item is RoomFitCandidate => item !== null);

  return {
    displayName:
      context.membership.employeePreferredName ?? context.displayName,
    candidates: [...rooms, ...villas],
  };
}
