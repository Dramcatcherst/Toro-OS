import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { classifyOperationalSnapshot } from "./operational-snapshot";
import type { HotelDirectoryData, HotelRoomItem, HotelSourceState } from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STALE_AFTER_MS = 48 * 60 * 60 * 1000;
const hotelRoles = new Set(["FOUNDER", "GERENCIA", "RECEPCION", "OPERACIONES"]);

type RoomOperationalGateRow = {
  room_id: string;
  gate_status: string;
  gate_reason: string;
  p0_blocker_count: number;
  p1_attention_count: number;
  recent_unresolved_evidence_count: number;
  open_task_summary: string | null;
  calculated_at_cr: string | null;
};

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

function parseOperationalGateRow(value: unknown): RoomOperationalGateRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.room_id !== "string" ||
    !uuidPattern.test(row.room_id) ||
    typeof row.gate_status !== "string" ||
    typeof row.gate_reason !== "string" ||
    typeof row.p0_blocker_count !== "number" ||
    typeof row.p1_attention_count !== "number" ||
    typeof row.recent_unresolved_evidence_count !== "number" ||
    !isNullableString(row.open_task_summary) ||
    !isNullableString(row.calculated_at_cr)
  ) return null;
  return row as RoomOperationalGateRow;
}

function normalizedGateStatus(value: string | undefined) {
  if (value === "BLOCKED" || value === "REVIEW_REQUIRED" || value === "HUMAN_QA_REQUIRED") return value;
  return "UNKNOWN" as const;
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
  const [roomRead, gateRead] = await Promise.all([
    supabase
      .schema("core")
      .from("rooms")
      .select("id,room_number,name_es,name_en,room_type,max_capacity,kitchen_type,verified_status,last_reviewed,updated_at")
      .eq("active", true)
      .order("room_number", { ascending: true })
      .limit(50),
    supabase
      .schema("operations")
      .from("room_operational_gate")
      .select("room_id,gate_status,gate_reason,p0_blocker_count,p1_attention_count,recent_unresolved_evidence_count,open_task_summary,calculated_at_cr")
      .limit(100),
  ]);

  if (roomRead.error) {
    throw new Error(roomRead.error.message || "Unable to load TORO hotel rooms.");
  }
  if (!Array.isArray(roomRead.data)) {
    throw new Error("Invalid hotel room payload received from the server.");
  }

  const gateByRoomId = new Map(
    (Array.isArray(gateRead.data) ? gateRead.data : [])
      .map(parseOperationalGateRow)
      .filter((row): row is RoomOperationalGateRow => Boolean(row))
      .map((row) => [row.room_id, row] as const),
  );

  const rooms = roomRead.data.map((raw) => {
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
      operationalGate: (() => {
        if (gateRead.error) {
          return {
            status: "UNKNOWN" as const,
            reason: "No se pudo consultar el gate operativo; requiere verificación humana.",
            p0BlockerCount: 0,
            p1AttentionCount: 0,
            recentUnresolvedEvidenceCount: 0,
            openTaskSummary: null,
            calculatedAtCr: null,
          };
        }
        const gate = gateByRoomId.get(row.id);
        return {
          status: normalizedGateStatus(gate?.gate_status),
          reason: gate?.gate_reason ?? "Sin gate operativo calculado; requiere verificación humana.",
          p0BlockerCount: gate?.p0_blocker_count ?? 0,
          p1AttentionCount: gate?.p1_attention_count ?? 0,
          recentUnresolvedEvidenceCount: gate?.recent_unresolved_evidence_count ?? 0,
          openTaskSummary: gate?.open_task_summary ?? null,
          calculatedAtCr: gate?.calculated_at_cr ?? null,
        };
      })(),
    } satisfies HotelRoomItem;
  });

  return {
    rooms,
    source: sourceState(rooms),
    operational: classifyOperationalSnapshot(null),
  };
}
