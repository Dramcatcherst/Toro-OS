import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { HotelDirectoryData, HotelRoomItem, HotelSourceState } from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STALE_AFTER_MS = 48 * 60 * 60 * 1000;
const hotelRoles = new Set(["FOUNDER", "GERENCIA", "RECEPCION", "OPERACIONES"]);

type HotelRoomRow = {
  id: string;
  room_number: number;
  name_es: string | null;
  name_en: string | null;
  room_type: string | null;
  max_capacity: number | null;
  kitchen_type: string | null;
  verified_status: string;
  last_reviewed: string | null;
  updated_at: string;
};

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableDate(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseRoomRow(value: unknown): HotelRoomRow {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid hotel room payload received from the server.");
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !uuidPattern.test(row.id) ||
    typeof row.room_number !== "number" ||
    !Number.isInteger(row.room_number) ||
    row.room_number < 0 ||
    row.room_number > 999 ||
    !isNullableString(row.name_es) ||
    !isNullableString(row.name_en) ||
    !isNullableString(row.room_type) ||
    !(row.max_capacity === null ||
      (typeof row.max_capacity === "number" && Number.isInteger(row.max_capacity) && row.max_capacity >= 0)) ||
    !isNullableString(row.kitchen_type) ||
    typeof row.verified_status !== "string" ||
    !isNullableDate(row.last_reviewed) ||
    !isIsoDate(row.updated_at)
  ) {
    throw new Error("Invalid hotel room payload received from the server.");
  }

  return row as HotelRoomRow;
}

function sourceState(rooms: HotelRoomItem[]): HotelSourceState {
  if (!rooms.length) {
    return { status: "empty", latestAt: null };
  }

  const latestAt = rooms.reduce((latest, room) =>
    Date.parse(room.freshness) > Date.parse(latest) ? room.freshness : latest,
  rooms[0].freshness);
  const ageMs = Date.now() - Date.parse(latestAt);

  return {
    status: ageMs > STALE_AFTER_MS ? "stale" : "fresh",
    latestAt,
  };
}

export async function loadHotelDirectory(): Promise<HotelDirectoryData> {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro/hotel");
  }
  if (!hotelRoles.has(session.role)) {
    redirect("/toro");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .schema("core")
    .from("rooms")
    .select("id,room_number,name_es,name_en,room_type,max_capacity,kitchen_type,verified_status,last_reviewed,updated_at")
    .eq("active", true)
    .order("room_number", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(error.message || "Unable to load TORO hotel rooms.");
  }
  if (!Array.isArray(data)) {
    throw new Error("Invalid hotel room payload received from the server.");
  }

  const rooms = data.map((raw) => {
    const row = parseRoomRow(raw);
    return {
      id: row.id,
      roomNumber: row.room_number,
      title: row.name_es || row.name_en || `Habitación ${row.room_number}`,
      roomType: row.room_type,
      maxCapacity: row.max_capacity,
      kitchenType: row.kitchen_type,
      verifiedStatus: row.verified_status,
      lastReviewed: row.last_reviewed,
      freshness: row.updated_at,
      room360Key: `DC-ROOM-${row.room_number}`,
    } satisfies HotelRoomItem;
  });

  return {
    rooms,
    source: sourceState(rooms),
  };
}
