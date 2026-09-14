import { buildRoom360 } from "./room-360.mjs";

function fields(record) {
  return record && typeof record === "object" && record.fields && typeof record.fields === "object" ? record.fields : {};
}

function text(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.name === "string") return value.name;
  return "";
}

function explicitRoomKeysFromAssetName(name) {
  const rawName = String(name ?? "");
  const normalized = rawName.replace(/\s+/g, "");

  if (/(?:room)?#?21[-/]22/i.test(normalized)) return ["DC-ROOM-21", "DC-ROOM-22"];
  if (/(?:room)?#?25[-/]26/i.test(normalized)) return ["DC-ROOM-25", "DC-ROOM-26"];

  const exactMatch = rawName.match(/(?:^|[^a-z0-9])(?:room\s*|#)(\d{1,3})(?!\d)/i);
  if (!exactMatch) return [];

  return [`DC-ROOM-${Number(exactMatch[1])}`];
}

function mediaRole(assetFields) {
  if (assetFields.hero_candidate === true) return "hero";
  if (assetFields.approved_for_kross === true || text(assetFields.kross_gallery_role)) return "kross";
  if (assetFields.approved_for_web === true) return "web";
  return "pending";
}

function validatedSaleContexts(roomKey, roomName) {
  const contexts = [{ key: roomKey, name: roomName || roomKey, type: "room", status: "active" }];

  if (roomKey === "DC-ROOM-25") {
    contexts.push(
      { key: "DC-VILLA-VT", name: "Villa Toro", type: "villa", status: "active" },
      { key: "DC-FULL-BUYOUT", name: "Dreamcatcher Full Property Buyout", type: "buyout", status: "active" },
    );
  }

  return contexts;
}

export function buildRoom360FromAirtable({
  roomRecords = [],
  amenityLinkRecords = [],
  taskRecords = [],
  validationRecords = [],
  mediaRecords = [],
} = {}) {
  const roomFields = fields(roomRecords[0]);
  const roomKey = text(roomFields.room_key);
  const roomName = text(roomFields.official_name_es) || text(roomFields.official_name_en) || roomKey;
  const roomNumber = text(roomFields.room_number);

  const input = {
    room: {
      key: roomKey,
      number: roomNumber,
      name: roomName,
      status: text(roomFields.guest_facing_status),
      property: roomKey.startsWith("DC-ROOM-") ? "Dreamcatcher Hotel" : "",
      capacity: Number.isFinite(roomFields.max_capacity) ? roomFields.max_capacity : null,
      beds: text(roomFields.bed_configuration),
      kitchen: text(roomFields.kitchen_type),
      projector: roomFields.has_projector === true,
      floor: "",
      amenities: amenityLinkRecords.map((record, index) => ({ key: record?.id ?? `amenity-${index + 1}` })),
    },
    sellableUnits: validatedSaleContexts(roomKey, roomName),
    kross: {
      referenceKey: roomKey ? `kross:${roomKey}` : "",
      directBookingUrl: text(roomFields.direct_booking_url),
      syncStatus: roomKey ? "authority_external" : "",
    },
    media: mediaRecords
      .map((record) => {
        const assetFields = fields(record);
        const key = text(assetFields.asset_key);
        if (!key) return null;
        const name = text(assetFields.asset_name);
        const roomKeys = explicitRoomKeysFromAssetName(name);
        return {
          key,
          name,
          publicUrl: text(assetFields.public_url),
          approved: assetFields.approved_for_web === true || assetFields.approved_for_kross === true,
          role: mediaRole(assetFields),
          roomKeys,
        };
      })
      .filter((asset) => asset && asset.roomKeys.includes(roomKey)),
    tasks: taskRecords.map((record) => {
      const taskFields = fields(record);
      return {
        key: text(taskFields.task_key),
        title: text(taskFields.task_name),
        status: text(taskFields.status),
        priority: text(taskFields.priority),
        linkedEntityKey: text(taskFields.linked_entity_key),
      };
    }),
    validations: validationRecords.map((record) => {
      const validationFields = fields(record);
      return {
        key: text(validationFields.validation_key),
        title: text(validationFields.validation_type) || text(validationFields.validation_key),
        status: text(validationFields.status),
        severity: text(validationFields.severity),
        linkedEntityKey: text(validationFields.linked_entity_key),
      };
    }),
    knowledge: [],
  };

  return buildRoom360(input);
}
