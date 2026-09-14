import test from "node:test";
import assert from "node:assert/strict";
import { mapAirtableRecordsToCandidates } from "./airtable-candidates.mjs";

const fixture = {
  rooms: [
    {
      id: "rec-room-25",
      fields: {
        room_key: "DC-ROOM-25",
        room_number: "25",
        official_name_es: "#25 Suite premium cinema con cocina",
        official_name_en: "#25 Premium Cinema Suite with Kitchen",
        max_capacity: 5,
        kitchen_type: "Private",
        has_projector: true,
        guest_facing_status: "active",
        notes: "private operational notes must not be copied",
      },
    },
  ],
  staff_directory: [
    {
      id: "rec-staff-oliver",
      fields: {
        staff_key: "EMP-00004",
        display_name: "OLIVER MENDOZA",
        known_as: "Oliver",
        department: "Mantenimiento",
        role_title: "Mantenimiento",
        status: "active",
        direct_contact_phone: "+50600000000",
      },
    },
  ],
  sops: [
    {
      id: "rec-sop-breakfast",
      fields: {
        sop_key: "SOP-FNB-001",
        sop_name: "Registro y conciliación de alimentos y bebidas",
        category: "F&B",
        status: "in_review",
        applies_to: "desayuno",
        procedure_text: "large internal procedure",
      },
    },
  ],
  properties: [
    {
      id: "rec-santa-toro",
      fields: {
        property_key: "ST-SANTA-TORO-INN",
        property_name: "Santa Toro Inn",
        operational_status: "archived",
        public_positioning: "Histórico / no comercial",
        internal_scope_notes: "private internal notes",
      },
    },
  ],
  amenities: [
    {
      id: "rec-projector",
      fields: {
        amenity_key: "amenity_projector_room",
        amenity_name_es: "Habitación con proyector",
        amenity_name_en: "Projector Room",
        verified_status: "verified",
        notes: "internal coverage notes",
      },
    },
  ],
};

test("maps room records into safe search candidates", () => {
  const [room] = mapAirtableRecordsToCandidates("rooms", fixture.rooms);
  assert.deepEqual(room, {
    entityType: "room",
    key: "DC-ROOM-25",
    title: "#25 Suite premium cinema con cocina",
    aliases: ["25", "Habitación 25", "#25 Premium Cinema Suite with Kitchen"],
    subtitle: "5 huéspedes · Private · proyector",
    status: "active",
    destination: "/toro/habitaciones/DC-ROOM-25",
    source: "Airtable rooms",
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
  assert.equal(sop.key, "SOP-FNB-001");
  assert.equal(sop.searchText.includes("large internal procedure"), false);

  assert.equal(property.entityType, "property");
  assert.equal(property.title, "Santa Toro Inn");
  assert.equal(JSON.stringify(property).includes("private internal notes"), false);

  assert.equal(amenity.entityType, "amenity");
  assert.equal(amenity.key, "amenity_projector_room");
  assert.equal(JSON.stringify(amenity).includes("internal coverage notes"), false);
});

test("unknown table produces no candidates instead of leaking raw records", () => {
  assert.deepEqual(
    mapAirtableRecordsToCandidates("financial_accounts", [
      { id: "secret", fields: { account_label: "private", notes: "secret" } },
    ]),
    [],
  );
});

test("invalid or keyless records are ignored", () => {
  assert.deepEqual(mapAirtableRecordsToCandidates("rooms", [{ id: "bad", fields: { room_number: "99" } }]), []);
  assert.deepEqual(mapAirtableRecordsToCandidates("rooms", null), []);
});
