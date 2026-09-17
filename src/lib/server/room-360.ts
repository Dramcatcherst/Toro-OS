import "server-only";

import { buildRoom360FromAirtable } from "@/lib/search/room-360-airtable";
import { buildRoom360, type Room360View } from "@/lib/search/room-360";
import { readAirtableRecords, type ReadOnlyConnectorResult } from "@/lib/server/read-only-connectors";

const CANONICAL_TORO_OS_BASE_ID = "apptlzWcI6DdpLO0B";

const TABLES = {
  rooms: "tblzfPcXbDft3upck",
  roomAmenityLinks: "tblBZKmY9nabY4FIT",
  tasks: "tblX3FBDLqm7K4O8B",
  validations: "tbl2BgFOn2uGIWQvv",
  mediaAssets: "tbltv6wmDwW6XgKdZ",
} as const;

type AirtableRecord = { id: string; fields?: Record<string, unknown> };
type AirtableListPayload = { records?: AirtableRecord[] };

export type Room360LoadState = "ready" | "partial" | "not_found" | "unconfigured" | "error";

export type Room360LoadResult = {
  state: Room360LoadState;
  configured: boolean;
  failedSources: string[];
  view: Room360View;
};

function emptyResult(state: Room360LoadState, configured: boolean, failedSources: string[] = []): Room360LoadResult {
  return { state, configured, failedSources, view: buildRoom360() };
}

function records(result: ReadOnlyConnectorResult<unknown>): AirtableRecord[] {
  if (result.error || !result.data || typeof result.data !== "object") return [];
  const payload = result.data as AirtableListPayload;
  return Array.isArray(payload.records) ? payload.records : [];
}

function roomNumberFromRecord(record: AirtableRecord, roomKey: string) {
  const value = record.fields?.room_number;
  if (typeof value === "string" && value.trim()) return value.trim();
  const match = roomKey.match(/(\d+)$/);
  return match?.[1] ?? "";
}

function isRoomKey(value: string) {
  return /^DC-ROOM-\d{1,3}$/.test(value);
}

export async function loadRoom360FromAirtable(roomKey: string): Promise<Room360LoadResult> {
  const cleanKey = String(roomKey ?? "").trim().slice(0, 80);
  if (!isRoomKey(cleanKey)) return emptyResult("not_found", Boolean(process.env.AIRTABLE_TOKEN));

  const baseId = process.env.AIRTABLE_BASE_ID ?? CANONICAL_TORO_OS_BASE_ID;
  const roomResult = await readAirtableRecords({
    baseId,
    tableId: TABLES.rooms,
    fields: [
      "room_key",
      "room_number",
      "official_name_es",
      "official_name_en",
      "guest_facing_status",
      "max_capacity",
      "bed_configuration",
      "kitchen_type",
      "has_projector",
      "direct_booking_url",
    ],
    searchFields: ["room_key"],
    query: cleanKey,
    pageSize: 2,
  });

  if (!roomResult.configured) return emptyResult("unconfigured", false, ["rooms"]);
  if (roomResult.error) return emptyResult("error", true, ["rooms"]);

  const exactRoomRecords = records(roomResult).filter((record) => record.fields?.room_key === cleanKey);
  if (exactRoomRecords.length === 0) return emptyResult("not_found", true);

  const roomNumber = roomNumberFromRecord(exactRoomRecords[0], cleanKey);

  const sourceReads = await Promise.all([
    readAirtableRecords({
      baseId,
      tableId: TABLES.roomAmenityLinks,
      fields: ["room_amenity_link_key", "room"],
      searchFields: ["room_amenity_link_key"],
      query: cleanKey,
      pageSize: 25,
    }),
    readAirtableRecords({
      baseId,
      tableId: TABLES.tasks,
      fields: ["task_key", "task_name", "status", "priority", "linked_entity_key"],
      searchFields: ["linked_entity_key"],
      query: cleanKey,
      pageSize: 15,
    }),
    readAirtableRecords({
      baseId,
      tableId: TABLES.validations,
      fields: ["validation_key", "validation_type", "severity", "status", "linked_entity_key"],
      searchFields: ["linked_entity_key"],
      query: cleanKey,
      pageSize: 15,
    }),
    readAirtableRecords({
      baseId,
      tableId: TABLES.mediaAssets,
      fields: [
        "asset_key",
        "asset_name",
        "asset_status",
        "public_url",
        "approved_for_web",
        "approved_for_kross",
        "hero_candidate",
        "kross_gallery_role",
      ],
      searchFields: ["asset_name"],
      query: roomNumber,
      pageSize: 25,
    }),
  ]);

  const sourceNames = ["amenities", "tasks", "validations", "media"] as const;
  const failedSources = sourceReads.flatMap((result, index) => (result.error ? [sourceNames[index]] : []));

  return {
    state: failedSources.length ? "partial" : "ready",
    configured: true,
    failedSources,
    view: buildRoom360FromAirtable({
      roomRecords: exactRoomRecords,
      amenityLinkRecords: records(sourceReads[0]),
      taskRecords: records(sourceReads[1]),
      validationRecords: records(sourceReads[2]),
      mediaRecords: records(sourceReads[3]),
    }),
  };
}
