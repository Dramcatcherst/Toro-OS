import "server-only";

import { getToroSession } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { SearchEntityType, SearchResult } from "./types";

type SearchRpcRow = {
  entity_type: SearchEntityType;
  entity_id: string;
  title: string;
  subtitle: string | null;
  destination_path: string;
  freshness: string | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const implementedDestinations = new Set([
  "/toro",
  "/toro/buscar",
  "/toro/decisiones",
]);

const room360DestinationPattern = /^\/toro\/habitaciones\/DC-ROOM-\d{1,3}$/;
const projectDestinationPattern =
  /^\/toro\/proyectos\?project=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isEntityType(value: unknown): value is SearchEntityType {
  return value === "room" || value === "project" || value === "knowledge";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function parseSearchResult(value: unknown): SearchRpcRow {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid search result received from the server.");
  }

  const row = value as Record<string, unknown>;
  if (
    !isEntityType(row.entity_type) ||
    typeof row.entity_id !== "string" ||
    !uuidPattern.test(row.entity_id) ||
    typeof row.title !== "string" ||
    !isNullableString(row.subtitle) ||
    typeof row.destination_path !== "string" ||
    !row.destination_path.startsWith("/toro") ||
    !isNullableString(row.freshness)
  ) {
    throw new Error("Invalid search result received from the server.");
  }

  return row as SearchRpcRow;
}

function actionableDestination(
  row: SearchRpcRow,
  canOpenProjects: boolean,
) {
  if (row.entity_type === "project") {
    return canOpenProjects && projectDestinationPattern.test(row.destination_path)
      ? row.destination_path
      : null;
  }

  const [pathname] = row.destination_path.split("?", 1);
  if (implementedDestinations.has(pathname)) return row.destination_path;
  if (row.entity_type === "room" && room360DestinationPattern.test(pathname)) return pathname;
  return null;
}

export async function searchToro(query: string): Promise<SearchResult[]> {
  const normalized = query.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return [];
  }

  const [session, supabase] = await Promise.all([
    getToroSession(),
    createServerSupabaseClient(),
  ]);
  const canOpenProjects = session?.role === "FOUNDER" || session?.role === "GERENCIA";

  const { data, error } = await supabase.rpc("search_toro", {
    p_query: normalized,
    p_limit: 12,
  });

  if (error) {
    throw new Error(error.message || "Unable to search TORO.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Invalid search result received from the server.");
  }

  return data.map((raw) => {
    const row = parseSearchResult(raw);
    return {
      entityType: row.entity_type,
      id: row.entity_id,
      title: row.title,
      subtitle: row.subtitle,
      href: actionableDestination(row, canOpenProjects),
      freshness: row.freshness,
    };
  });
}
