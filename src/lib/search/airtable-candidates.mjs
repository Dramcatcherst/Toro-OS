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

function mapVilla(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.villa_key);
  if (!key) return null;

  const title = text(fields.villa_name) || key;
  const capacity = Number.isFinite(fields.max_capacity) ? fields.max_capacity : null;
  const roomCount = Number.isFinite(fields.room_count) ? fields.room_count : null;
  const features = [
    fields.has_pool === true ? "piscina" : "",
    fields.has_kitchen === true ? "cocina" : "",
    fields.has_jacuzzi === true ? "jacuzzi" : "",
  ].filter(Boolean);

  return {
    entityType: "villa",
    key,
    title,
    aliases: [],
    subtitle: [capacity !== null ? `${capacity} huéspedes` : "", roomCount !== null ? `${roomCount} habitaciones` : "", ...features]
      .filter(Boolean)
      .join(" · "),
    status: valueName(fields.guest_facing_status),
    destination: `/toro/villas/${encodeURIComponent(key)}`,
    source: "Airtable villas",
    searchText: compact([title, capacity !== null ? String(capacity) : "", roomCount !== null ? String(roomCount) : "", ...features]),
  };
}

function mapSellableUnit(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.unit_key);
  if (!key) return null;

  const title = text(fields.unit_name) || key;
  const type = valueName(fields.unit_type);
  const capacity = Number.isFinite(fields.max_capacity) ? fields.max_capacity : null;
  const summary = text(fields.commercial_summary_es);

  return {
    entityType: "sellable_unit",
    key,
    title,
    aliases: [],
    subtitle: [type, capacity !== null ? `${capacity} huéspedes` : "", summary].filter(Boolean).join(" · "),
    status: valueName(fields.sales_status),
    destination: `/toro/unidades/${encodeURIComponent(key)}`,
    source: "Airtable sellable_units",
    searchText: compact([title, type, capacity !== null ? String(capacity) : "", summary]),
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

function mapTask(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.task_key);
  if (!key) return null;

  const title = text(fields.task_name) || key;
  const domain = valueName(fields.domain);
  const priority = valueName(fields.priority);
  const linkedEntity = text(fields.linked_entity_key);

  return {
    entityType: "task",
    key,
    title,
    aliases: [],
    subtitle: [domain, priority, linkedEntity].filter(Boolean).join(" · "),
    status: valueName(fields.status),
    destination: `/toro/tareas/${encodeURIComponent(key)}`,
    source: "Airtable tasks",
    searchText: compact([title, domain, priority, linkedEntity]),
  };
}

function mapValidation(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.validation_key);
  if (!key) return null;

  const type = valueName(fields.validation_type);
  const severity = valueName(fields.severity);
  const linkedEntity = text(fields.linked_entity_key);
  const title = type ? `Validación · ${type}` : key;

  return {
    entityType: "validation",
    key,
    title,
    aliases: [],
    subtitle: [severity, linkedEntity].filter(Boolean).join(" · "),
    status: valueName(fields.status),
    destination: `/toro/validaciones/${encodeURIComponent(key)}`,
    source: "Airtable validations",
    searchText: compact([key, type, severity, linkedEntity]),
  };
}

function mapExperience(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.experience_key);
  if (!key) return null;

  const title = text(fields.experience_name) || key;
  const category = valueName(fields.experience_category);
  const summary = text(fields.guest_facing_summary_es);
  const verified = valueName(fields.verified_status);

  return {
    entityType: "experience",
    key,
    title,
    aliases: [],
    subtitle: [category, summary].filter(Boolean).join(" · "),
    status: valueName(fields.publish_status) || verified,
    destination: `/toro/experiencias/${encodeURIComponent(key)}`,
    source: "Airtable experiences",
    searchText: compact([title, category, summary, verified]),
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

function mapSourceObject(record) {
  const fields = safeRecordFields(record);
  const key = text(fields.source_key);
  if (!key) return null;

  const title = text(fields.source_name) || key;
  const type = valueName(fields.source_type);
  const freshness = valueName(fields.freshness_status);

  return {
    entityType: "source",
    key,
    title,
    aliases: [],
    subtitle: [type, freshness].filter(Boolean).join(" · "),
    status: valueName(fields.source_status),
    destination: `/toro/sistemas/fuentes/${encodeURIComponent(key)}`,
    source: "Airtable source_objects",
    searchText: compact([title, type, freshness]),
  };
}

const MAPPERS = {
  rooms: mapRoom,
  villas: mapVilla,
  sellable_units: mapSellableUnit,
  staff_directory: mapStaff,
  tasks: mapTask,
  validations: mapValidation,
  experiences: mapExperience,
  sops: mapSop,
  properties: mapProperty,
  amenities: mapAmenity,
  source_objects: mapSourceObject,
};

export function mapAirtableRecordsToCandidates(tableName, records) {
  const mapper = MAPPERS[tableName];
  if (!mapper || !Array.isArray(records)) return [];

  return records.map(mapper).filter(Boolean);
}
