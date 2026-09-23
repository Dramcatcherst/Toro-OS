import "server-only";

import { redirect } from "next/navigation";

import { getToroSession } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const revenueRoles = new Set(["FOUNDER", "GERENCIA", "FINANZAS"]);
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export type RevenueFilterInput = {
  agencyKey?: unknown;
  roomNumber?: unknown;
  stayDate?: unknown;
  seasonCode?: unknown;
};

export type RevenueFilters = {
  agencyKey: string | null;
  roomNumber: number | null;
  stayDate: string | null;
  seasonCode: string | null;
};

export type RevenueRateItem = {
  agencyKey: string;
  agencyName: string;
  roomNumber: number;
  roomName: string;
  seasonCode: string;
  startsOn: string;
  endsOn: string;
  currency: string;
  baseRackRate: number | null;
  rackRate: number | null;
  baseCommissionRate: number | null;
  commissionRate: number | null;
  agencyEarnAmount: number | null;
  hotelNetRate: number | null;
  commercialConditions: string | null;
  overrideReason: string | null;
  overrideActive: boolean;
};

export type RevenueDirectoryData =
  | {
      kind: "ready";
      filters: RevenueFilters;
      queried: boolean;
      rows: RevenueRateItem[];
      source: "Supabase · get_agency_rate_lookup";
    }
  | {
      kind: "forbidden";
      detail: string;
    }
  | {
      kind: "error";
      detail: string;
    };

function optionalText(value: unknown, label: string, max = 128): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > max) throw new Error(`${label} is too long.`);
  return normalized;
}

function validIsoDate(value: string) {
  if (!isoDatePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

export function normalizeRevenueFilters(input: RevenueFilterInput): RevenueFilters {
  const agency = optionalText(input.agencyKey, "Agency");
  const room = optionalText(input.roomNumber, "Room");
  const date = optionalText(input.stayDate, "Stay date");
  const season = optionalText(input.seasonCode, "Season");

  let roomNumber: number | null = null;
  if (room !== null) {
    roomNumber = Number(room);
    if (!Number.isInteger(roomNumber) || roomNumber < 0 || roomNumber > 999) {
      throw new Error("Room number must be an integer between 0 and 999.");
    }
  }

  if (date !== null && !validIsoDate(date)) {
    throw new Error("Stay date must be a valid ISO date.");
  }

  return {
    agencyKey: agency?.toLowerCase() ?? null,
    roomNumber,
    stayDate: date,
    seasonCode: season?.toUpperCase() ?? null,
  };
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid Revenue row.");
  }
  return value as Record<string, unknown>;
}

function requiredString(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || !value.trim()) throw new Error("Invalid Revenue row.");
  return value;
}

function nullableString(row: Record<string, unknown>, key: string): string | null {
  const value = row[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new Error("Invalid Revenue row.");
  return value;
}

function numeric(row: Record<string, unknown>, key: string): number | null {
  const value = row[key];
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error("Invalid Revenue row.");
  return parsed;
}

function parseRevenueRow(value: unknown): RevenueRateItem {
  const row = record(value);
  const roomNumber = numeric(row, "room_number");
  if (roomNumber === null || !Number.isInteger(roomNumber) || roomNumber < 0 || roomNumber > 999) {
    throw new Error("Invalid Revenue row.");
  }
  if (typeof row.override_active !== "boolean") throw new Error("Invalid Revenue row.");

  return {
    agencyKey: requiredString(row, "agency_key"),
    agencyName: requiredString(row, "agency_name"),
    roomNumber,
    roomName: requiredString(row, "room_name"),
    seasonCode: requiredString(row, "season_code"),
    startsOn: requiredString(row, "starts_on"),
    endsOn: requiredString(row, "ends_on"),
    currency: requiredString(row, "currency"),
    baseRackRate: numeric(row, "base_rack_rate"),
    rackRate: numeric(row, "rack_rate"),
    baseCommissionRate: numeric(row, "base_commission_rate"),
    commissionRate: numeric(row, "commission_rate"),
    agencyEarnAmount: numeric(row, "agency_earn_amount"),
    hotelNetRate: numeric(row, "hotel_net_rate"),
    commercialConditions: nullableString(row, "commercial_conditions"),
    overrideReason: nullableString(row, "override_reason"),
    overrideActive: row.override_active,
  };
}

export async function loadRevenueDirectory(
  input: RevenueFilterInput,
): Promise<RevenueDirectoryData> {
  const session = await getToroSession();
  if (!session) {
    redirect("/login?next=/toro/revenue");
  }
  if (!revenueRoles.has(session.role)) {
    redirect("/toro");
  }

  let filters: RevenueFilters;
  try {
    filters = normalizeRevenueFilters(input);
  } catch (error) {
    return {
      kind: "error",
      detail: error instanceof Error ? error.message : "Los filtros de Revenue no son válidos.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const access = await supabase.rpc("get_current_revenue_access");

  if (access.error) {
    return {
      kind: "error",
      detail: "No se pudo verificar el acceso privado de Revenue.",
    };
  }
  if (access.data !== true) {
    return {
      kind: "forbidden",
      detail: "Tu identidad TORO no tiene acceso al módulo privado de Revenue.",
    };
  }

  const queried = Object.values(filters).some((value) => value !== null);
  if (!queried) {
    return {
      kind: "ready",
      filters,
      queried: false,
      rows: [],
      source: "Supabase · get_agency_rate_lookup",
    };
  }

  const lookup = await supabase.rpc("get_agency_rate_lookup", {
    p_agency_key: filters.agencyKey,
    p_room_number: filters.roomNumber,
    p_stay_date: filters.stayDate,
    p_season_code: filters.seasonCode,
  });

  if (lookup.error) {
    return {
      kind: "error",
      detail: "No se pudo consultar la tarifa privada de Revenue.",
    };
  }
  if (!Array.isArray(lookup.data)) {
    return {
      kind: "error",
      detail: "Revenue devolvió una respuesta no válida y TORO la bloqueó.",
    };
  }

  try {
    return {
      kind: "ready",
      filters,
      queried: true,
      rows: lookup.data.map(parseRevenueRow),
      source: "Supabase · get_agency_rate_lookup",
    };
  } catch {
    return {
      kind: "error",
      detail: "Revenue devolvió datos no válidos y TORO no los mostrará.",
    };
  }
}
