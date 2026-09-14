function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function valueName(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.name === "string") return value.name;
  return "";
}

function compact(parts) {
  return parts.map((part) => text(part)).filter(Boolean).join(" ");
}

function safeRecordFields(record) {
  return record && typeof record === "object" && record.fields && typeof record.fields === "object"
    ? record.fields
    : {};
}

function mapRoom(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.room_key);
  if (!key) return null;

  const number = text(fields.room_number);
  const title = text(fields.official_name_es) || text(fields.official_name_en) || (number ? `Habitación ${number}` : key);
  const englishName = text(fields.official_name_en);
  const capacity = Number.isFinite(fields.max_capacity) ? fields.max_capacity : null;
  const kitchen = text(fields.kitchen_type);
  const projector = fields.has_projector === true ? "proyector" : "";

  return {
    entityType: "room",
    key,
    title,
    aliases: [number, number ? `Habitación ${number}` : "", englishName].filter(Boolean),
    subtitle: [capacity !== null ? `${capacity} huéspedes` : "", kitchen, projector].filter(Boolean).join(" · "),
    status: valueName(fields.guest_facing_status),
    destination: `/toro/habitaciones/${encodeURIComponent(key)}`,
    source: "Airtable rooms",
    searchText: compact([title, englishName, number, kitchen, projector]),
  };
}

function mapStaff(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.staff_key);
  if (!key) return null;

  const title = text(fields.display_name) || text(fields.known_as) || key;
  const knownAs = text(fields.known_as);
  const department = text(fields.department);
  const role = text(fields.role_title);

  return {
    entityType: "staff",
    key,
    title,
    aliases: [knownAs].filter(Boolean),
    subtitle: [department, role].filter(Boolean).join(" · "),
    status: text(fields.status),
    destination: `/toro/equipo/${encodeURIComponent(key)}`,
    source: "Airtable staff_directory",
    searchText: compact([title, knownAs, department, role]),
  };
}

function mapSop(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.sop_key);
  if (!key) return null;

  const title = text(fields.sop_name) || key;
  const category = valueName(fields.category);
  const appliesTo = text(fields.applies_to);

  return {
    entityType: "sop",
    key,
    title,
    aliases: [appliesTo].filter(Boolean),
    subtitle: [category, valueName(fields.status)].filter(Boolean).join(" · "),
    status: valueName(fields.status),
    destination: `/toro/conocimiento/${encodeURIComponent(key)}`,
    source: "Airtable sops",
    searchText: compact([title, category, appliesTo]),
  };
}

function mapProperty(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.property_key);
  if (!key) return null;

  const title = text(fields.property_name) || key;
  const positioning = text(fields.public_positioning);

  return {
    entityType: "property",
    key,
    title,
    aliases: [],
    subtitle: positioning,
    status: valueName(fields.operational_status),
    destination: `/toro/propiedades/${encodeURIComponent(key)}`,
    source: "Airtable properties",
    searchText: compact([title, positioning]),
  };
}

function mapAmenity(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.amenity_key);
  if (!key) return null;

  const title = text(fields.amenity_name_es) || text(fields.amenity_name_en) || key;
  const english = text(fields.amenity_name_en);

  return {
    entityType: "amenity",
    key,
    title,
    aliases: [english].filter(Boolean),
    subtitle: valueName(fields.verified_status),
    status: valueName(fields.verified_status),
    destination: `/toro/conocimiento/amenidades/${encodeURIComponent(key)}`,
    source: "Airtable amenities",
    searchText: compact([title, english]),
  };
}

const MAPPERS = {
  rooms: mapRoom,
  staff_directory: mapStaff,
  sops: mapSop,
  properties: mapProperty,
  amenities: mapAmenity,
};

export function mapAirtableRecordsToCandidates(tableName, records) {
  const mapper = MAPPERS[tableName];
  if (!mapper || !Array.isArray(records)) return [];

  return records.map(mapper).filter(Boolean);
}
