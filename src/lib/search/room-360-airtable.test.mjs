import test from "node:test";
import assert from "node:assert/strict";
import { buildRoom360FromAirtable } from "./room-360-airtable.mjs";

const raw = {
  roomRecords: [{
    id: "rec25",
    fields: {
      room_key: "DC-ROOM-25",
      room_number: "25",
      official_name_es: "#25 Suite premium cinema con cocina",
      guest_facing_status: "active",
      max_capacity: 5,
      bed_configuration: "1 King, 1 Queen, 1 individual",
      kitchen_type: "Private",
      has_projector: true,
      direct_booking_url: "https://dreamcatcherhotel.kross.travel/es/rooms/25",
      notes: "private note",
    },
  }],
  amenityLinkRecords: Array.from({ length: 22 }, (_, index) => ({ id: `amenity-link-${index + 1}`, fields: {} })),
  taskRecords: [
    { id: "task1", fields: { task_key: "TASK-25", task_name: "Revisar proyector", status: "in_progress", priority: "P1", linked_entity_key: "DC-ROOM-25" } },
    { id: "task2", fields: { task_key: "TASK-26", task_name: "Otra", status: "todo", linked_entity_key: "DC-ROOM-26" } },
  ],
  validationRecords: [
    { id: "val1", fields: { validation_key: "VAL-25", validation_type: "media", status: "open", severity: "high", linked_entity_key: "DC-ROOM-25" } },
  ],
  mediaRecords: [
    { id: "media1", fields: { asset_key: "MEDIA-25", asset_name: "#25 Bedroom", public_url: "https://example.com/25.jpg", approved_for_web: true, hero_candidate: true } },
    { id: "media2", fields: { asset_key: "MEDIA-25-26", asset_name: "#25-26 Bedroom Shared", public_url: "https://example.com/25-26.jpg", approved_for_web: true } },
  ],
};

test("builds the Room 25 360 view from safe Airtable fields", () => {
  const view = buildRoom360FromAirtable(raw);

  assert.equal(view.summary.key, "DC-ROOM-25");
  assert.equal(view.summary.capacity, 5);
  assert.equal(view.summary.amenityCount, 22);
  assert.equal(view.kross.authority, "Kross");
  assert.equal(view.kross.directBookingUrl, "https://dreamcatcherhotel.kross.travel/es/rooms/25");
  assert.equal("price" in view.kross, false);
  assert.equal(JSON.stringify(view).includes("private note"), false);
});

test("preserves the three validated sellable contexts for the Room 25 pilot", () => {
  const view = buildRoom360FromAirtable(raw);
  assert.deepEqual(view.sale.map((item) => item.name), [
    "#25 Suite premium cinema con cocina",
    "Villa Toro",
    "Dreamcatcher Full Property Buyout",
  ]);
});

test("uses exact linked entity keys for operation", () => {
  const view = buildRoom360FromAirtable(raw);
  assert.deepEqual(view.operation.tasks.map((item) => item.key), ["TASK-25"]);
  assert.deepEqual(view.operation.validations.map((item) => item.key), ["VAL-25"]);
});

test("marks only explicitly paired media as shared", () => {
  const view = buildRoom360FromAirtable(raw);
  assert.equal(view.media.hero[0].identityScope, "exact");
  assert.equal(view.media.web[0].identityScope, "shared");
  assert.deepEqual(view.media.web[0].sharedWith, ["DC-ROOM-26"]);
});
