import "server-only";

import { buildRoom360FromAirtable } from "../search/room-360-airtable.mjs";
import { readAirtableRecords } from "./read-only-connectors";

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
type Room360AirtableInput = {
  roomRecords?: AirtableRecord[];
  amenityLinkRecords?: AirtableRecord[];
  taskRecords?: AirtableRecord[];
  validationRecords?: AirtableRecord[];
  mediaRecords?: AirtableRecord[];
};

const buildRoom360 = buildRoom360FromAirtable as unknown as (input?: Room360AirtableInput) => ReturnType<typeof buildRoom360FromAirtable>;

function records(result: { data: unknown | null; error: string | null }): AirtableRecord[] {
  if (result.error || !result.data || typeof result.data !== "object") return [];
  const payload = result.data as AirtableListPayload;
  return Array.isArray(payload.records) ? payload.records : [];
}

function roomNumberFromKey(roomKey: string) {
  const match = roomKey.match(/(\d+)$/);
  return match?.[1] ?? roomKey;
}

export async function loadRoom360FromAirtable(roomKey: string) {
  const baseId = process.env.AIRTABLE_BASE_ID ?? CANONICAL_TORO_OS_BASE_ID;
  const cleanKey = String(roomKey ?? "").trim().slice(0, 80);
  if (!cleanKey) return buildRoom360();

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

  const roomRecords = records(roomResult).filter((record) => record.fields?.room_key === cleanKey);
  const roomNumber = typeof roomRecords[0]?.fields?.room_number === "string"
    ? roomRecords[0].fields.room_number
    : roomNumberFromKey(cleanKey);

  const [amenityResult, taskResult, validationResult, mediaResult] = await Promise.all([
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
      searchFields: ["asset_key", "asset_name"],
      query: roomNumber,
      pageSize: 25,
    }),
  ]);

  return buildRoom360({
    roomRecords,
    amenityLinkRecords: records(amenityResult),
    taskRecords: records(taskResult),
    validationRecords: records(validationResult),
    mediaRecords: records(mediaResult),
  });
}
