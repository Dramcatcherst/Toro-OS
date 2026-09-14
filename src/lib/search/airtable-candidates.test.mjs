import test from "node:test";
import assert from "node:assert/strict";
import { mapAirtableRecordsToCandidates } from "./airtable-candidates.mjs";

const fixture = {
  rooms: [{ id: "rec-room-25", fields: { room_key: "DC-ROOM-25", room_number: "25", official_name_es: "#25 Suite premium cinema con cocina", official_name_en: "#25 Premium Cinema Suite with Kitchen", max_capacity: 5, kitchen_type: "Private", has_projector: true, guest_facing_status: "active", notes: "private operational notes must not be copied" } }],
  villas: [{ id: "rec-villa-toro", fields: { villa_key: "DC-VILLA-VT", villa_name: "Villa Toro", max_capacity: 25, room_count: 8, has_pool: true, has_kitchen: true, has_jacuzzi: true, guest_facing_status: "active", notes: "private villa notes" } }],
  sellable_units: [{ id: "rec-unit-25", fields: { unit_key: "DC-ROOM-25", unit_name: "#25 Premium Cinema Suite with Kitchen", unit_type: "room", sales_status: "active", max_capacity: 5, commercial_summary_es: "Suite premium con cocina y cine privado", notes: "private unit notes" } }],
  staff_directory: [{ id: "rec-staff-oliver", fields: { staff_key: "EMP-00004", display_name: "OLIVER MENDOZA", known_as: "Oliver", department: "Mantenimiento", role_title: "Mantenimiento", status: "active", direct_contact_phone: "+50600000000" } }],
  tasks: [{ id: "rec-task", fields: { task_key: "TASK-HUMAN-MODE", task_name: "Cerrar Human Mode", domain: "system", status: "in_progress", priority: "p0", linked_entity_key: "toro_human_mode", notes: "private task notes" } }],
  validations: [{ id: "rec-validation", fields: { validation_key: "VALID-HUMAN-MODE", validation_type: "system", severity: "high", status: "open", linked_entity_key: "toro_human_mode", notes: "private validation notes" } }],
  experiences: [{ id: "rec-experience", fields: { experience_key: "EXP-TORTUGA", experience_name: "Isla Tortuga", experience_category: "Tour", publish_status: "published", verified_status: "verified", guest_facing_summary_es: "Tour de día completo", notes: "private experience notes" } }],
  sops: [{ id: "rec-sop-breakfast", fields: { sop_key: "SOP-FNB-001", sop_name: "Registro y conciliación de alimentos y bebidas", category: "F&B", status: "in_review", applies_to: "desayuno", procedure_text: "large internal procedure" } }],
  properties: [{ id: "rec-santa-toro", fields: { property_key: "ST-SANTA-TORO-INN", property_name: "Santa Toro Inn", operational_status: "archived", public_positioning: "Histórico / no comercial", internal_scope_notes: "private internal notes" } }],
  amenities: [{ id: "rec-projector", fields: { amenity_key: "amenity_projector_room", amenity_name_es: "Habitación con proyector", amenity_name_en: "Projector Room", verified_status: "verified", notes: "internal coverage notes" } }],
  source_objects: [{ id: "rec-source", fields: { source_key: "source_kross", source_name: "Kross", source_type: "pms", source_status: "active", freshness_status: "fresh", notes: "private source notes", source_url: "https://private.example.com" } }],
};

test("maps room records into safe search candidates", () => {
  const [room] = mapAirtableRecordsToCandidates("rooms", fixture.rooms);
  assert.deepEqual(room, {
    entityType: "room", key: "DC-ROOM-25", title: "#25 Suite premium cinema con cocina",
    aliases: ["25", "Habitación 25", "#25 Premium Cinema Suite with Kitchen"],
    subtitle: "5 huéspedes · Private · proyector", status: "active",
    destination: "/toro/habitaciones/DC-ROOM-25", source: "Airtable rooms",
    searchText: "#25 Suite premium cinema con cocina #25 Premium Cinema Suite with Kitchen 25 Private proyector",
  });
});

test("maps staff without leaking direct phone", () => {
  const [staff] = mapAirtableRecordsToCandidates("staff_directory", fixture.staff_directory);
  assert.equal(staff.key, "EMP-00004");
  assert.equal(staff.title, "OLIVER MENDOZA");
  assert.deepEqual(staff.aliases, ["Oliver"]);
  assert.equal(staff.subtitle, "Mantenimiento · Mantenimiento");
  assert.equal(JSON.stringify(staff).includes("+506"), false);
});

test("maps SOP, property and amenity with safe concise fields", () => {
  const [sop] = mapAirtableRecordsToCandidates("sops", fixture.sops);
  const [property] = mapAirtableRecordsToCandidates("properties", fixture.properties);
  const [amenity] = mapAirtableRecordsToCandidates("amenities", fixture.amenities);
  assert.equal(sop.entityType, "sop");
  assert.equal(sop.searchText.includes("large internal procedure"), false);
  assert.equal(property.entityType, "property");
  assert.equal(JSON.stringify(property).includes("private internal notes"), false);
  assert.equal(amenity.entityType, "amenity");
  assert.equal(JSON.stringify(amenity).includes("internal coverage notes"), false);
});

test("maps remaining Search V1 governed sources without leaking notes", () => {
  const villa = mapAirtableRecordsToCandidates("villas", fixture.villas)[0];
  const unit = mapAirtableRecordsToCandidates("sellable_units", fixture.sellable_units)[0];
  const task = mapAirtableRecordsToCandidates("tasks", fixture.tasks)[0];
  const validation = mapAirtableRecordsToCandidates("validations", fixture.validations)[0];
  const experience = mapAirtableRecordsToCandidates("experiences", fixture.experiences)[0];
  const source = mapAirtableRecordsToCandidates("source_objects", fixture.source_objects)[0];

  assert.equal(villa.entityType, "villa");
  assert.equal(villa.key, "DC-VILLA-VT");
  assert.equal(unit.entityType, "sellable_unit");
  assert.equal(task.entityType, "task");
  assert.equal(validation.entityType, "validation");
  assert.equal(experience.entityType, "experience");
  assert.equal(source.entityType, "source");
  assert.equal(source.title, "Kross");

  for (const candidate of [villa, unit, task, validation, experience, source]) {
    assert.ok(candidate.destination);
    assert.equal(JSON.stringify(candidate).includes("private"), false);
  }
});

test("unknown table produces no candidates instead of leaking raw records", () => {
  assert.deepEqual(mapAirtableRecordsToCandidates("financial_accounts", [{ id: "secret", fields: { account_label: "private", notes: "secret" } }]), []);
});

test("invalid or keyless records are ignored", () => {
  assert.deepEqual(mapAirtableRecordsToCandidates("rooms", [{ id: "bad", fields: { room_number: "99" } }]), []);
  assert.deepEqual(mapAirtableRecordsToCandidates("rooms", null), []);
});
