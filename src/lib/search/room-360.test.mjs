import test from "node:test";
import assert from "node:assert/strict";
import { buildRoom360 } from "./room-360.mjs";

const input = {
  room: {
    key: "DC-ROOM-25",
    number: "25",
    name: "#25 Premium Cinema Suite with Kitchen",
    status: "active",
    capacity: 5,
    beds: "1 King, 1 Queen, 1 pull-out / rollaway single",
    kitchen: "Private",
    projector: true,
    floor: "Segundo piso",
    property: "Dreamcatcher Hotel",
    amenities: Array.from({ length: 22 }, (_, index) => ({
      key: `amenity-${index + 1}`,
      name: `Amenity ${index + 1}`,
    })),
    privatePayload: "never expose room internals",
  },
  sellableUnits: [
    { key: "DC-ROOM-25", name: "#25 Premium Cinema Suite with Kitchen", type: "room", status: "active" },
    { key: "DC-VILLA-VT", name: "Villa Toro", type: "villa", status: "active" },
    { key: "DC-FULL-BUYOUT", name: "Dreamcatcher Full Property Buyout", type: "buyout", status: "active" },
    { key: "DC-VILLA-VT", name: "Villa Toro duplicate", type: "villa", status: "active" },
  ],
  kross: {
    referenceKey: "kross_room_25",
    directBookingUrl: "https://dreamcatcherhotel.kross.travel/25",
    syncStatus: "verified",
    price: 999,
    availability: "available",
    secret: "never expose",
  },
  media: [
    {
      key: "HERO-25",
      name: "Room 25 hero",
      role: "hero",
      publicUrl: "https://example.com/hero.jpg",
      approved: true,
      roomKeys: ["DC-ROOM-25"],
    },
    {
      key: "WEB-25-26-SHARED",
      name: "Room 25-26 shared web photo",
      role: "web",
      publicUrl: "https://example.com/web.jpg",
      approved: true,
      roomKeys: ["DC-ROOM-25", "DC-ROOM-26"],
    },
    { key: "KROSS-25", name: "Room 25 Kross", role: "kross", publicUrl: "https://example.com/kross.jpg", approved: true },
    { key: "PENDING-25", name: "Room 25 pending", role: "pending", approved: false, rawPayload: "never expose" },
  ],
  tasks: [
    { key: "TASK-25-EXACT", title: "Revisar ficha 25", linkedEntityKey: "DC-ROOM-25", status: "in_progress", priority: "p1" },
    { key: "TASK-FALSE-POSITIVE", title: "Otra tarea", linkedEntityKey: "DC-ROOM-26", status: "todo", notes: "menciona habitación 25 en texto" },
  ],
  validations: [
    { key: "VALID-25", title: "Validación Room 25", linkedEntityKey: "DC-ROOM-25", status: "open", severity: "high" },
    { key: "VALID-OTHER", title: "Otra validación", linkedEntityKey: "DC-ROOM-21", status: "open", notes: "25 aparece aquí pero no relaciona" },
  ],
  knowledge: [
    { key: "SOP-ROOM-25", title: "Uso de proyector", linkedEntityKeys: ["DC-ROOM-25"], status: "active" },
    { key: "SOP-OTHER", title: "Otro SOP", linkedEntityKeys: ["DC-ROOM-26"], text: "habitación 25" },
  ],
};

test("builds a concise room summary from verified fields", () => {
  const view = buildRoom360(input);
  assert.deepEqual(view.summary, {
    key: "DC-ROOM-25",
    number: "25",
    name: "#25 Premium Cinema Suite with Kitchen",
    status: "active",
    property: "Dreamcatcher Hotel",
    capacity: 5,
    beds: "1 King, 1 Queen, 1 pull-out / rollaway single",
    kitchen: "Private",
    projector: true,
    floor: "Segundo piso",
    amenityCount: 22,
  });
});

test("deduplicates the three sellable contexts for room 25", () => {
  const view = buildRoom360(input);
  assert.deepEqual(view.sale.map((unit) => unit.key), ["DC-ROOM-25", "DC-VILLA-VT", "DC-FULL-BUYOUT"]);
});

test("keeps Kross as authority without copying live price or availability", () => {
  const view = buildRoom360(input);
  assert.equal(view.kross.authority, "Kross");
  assert.equal(view.kross.directBookingUrl, "https://dreamcatcherhotel.kross.travel/25");
  assert.equal("price" in view.kross, false);
  assert.equal("availability" in view.kross, false);
  assert.equal("secret" in view.kross, false);
});

test("groups media instead of returning raw assets", () => {
  const view = buildRoom360(input);
  assert.equal(view.media.hero.length, 1);
  assert.equal(view.media.web.length, 1);
  assert.equal(view.media.kross.length, 1);
  assert.equal(view.media.pending.length, 1);
  assert.equal("rawPayload" in view.media.pending[0], false);
});

test("marks structurally shared media as valid shared-room media", () => {
  const view = buildRoom360(input);
  assert.deepEqual(view.media.web[0].sharedWith, ["DC-ROOM-26"]);
  assert.equal(view.media.web[0].identityScope, "shared");
  assert.equal(view.media.hero[0].identityScope, "exact");
});

test("operation uses exact structural links and ignores textual number mentions", () => {
  const view = buildRoom360(input);
  assert.deepEqual(view.operation.tasks.map((item) => item.key), ["TASK-25-EXACT"]);
  assert.deepEqual(view.operation.validations.map((item) => item.key), ["VALID-25"]);
});

test("knowledge also requires an explicit structural relationship", () => {
  const view = buildRoom360(input);
  assert.deepEqual(view.knowledge.map((item) => item.key), ["SOP-ROOM-25"]);
});

test("does not leak unknown/private fields into the view model", () => {
  const serialized = JSON.stringify(buildRoom360(input));
  assert.equal(serialized.includes("never expose"), false);
  assert.equal(serialized.includes("privatePayload"), false);
  assert.equal(serialized.includes("rawPayload"), false);
});
