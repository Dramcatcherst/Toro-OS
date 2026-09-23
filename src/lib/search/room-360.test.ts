import { describe, expect, it } from "vitest";

import { buildRoom360 } from "./room-360";

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

describe("buildRoom360", () => {
  it("builds a concise room summary from verified fields", () => {
    const view = buildRoom360(input);
    expect(view.summary).toEqual({
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

  it("deduplicates sellable contexts", () => {
    const view = buildRoom360(input);
    expect(view.sale.map((unit) => unit.key)).toEqual(["DC-ROOM-25", "DC-VILLA-VT", "DC-FULL-BUYOUT"]);
  });

  it("keeps Kross as authority without copying live price or availability", () => {
    const view = buildRoom360(input);
    expect(view.kross.authority).toBe("Kross");
    expect(view.kross.directBookingUrl).toBe("https://dreamcatcherhotel.kross.travel/25");
    expect("price" in view.kross).toBe(false);
    expect("availability" in view.kross).toBe(false);
    expect("secret" in view.kross).toBe(false);
  });

  it("groups media and preserves approved shared-room identity", () => {
    const view = buildRoom360(input);
    expect(view.media.hero).toHaveLength(1);
    expect(view.media.web).toHaveLength(1);
    expect(view.media.kross).toHaveLength(1);
    expect(view.media.pending).toHaveLength(1);
    expect(view.media.web[0].sharedWith).toEqual(["DC-ROOM-26"]);
    expect(view.media.web[0].identityScope).toBe("shared");
    expect(view.media.hero[0].identityScope).toBe("exact");
    expect("rawPayload" in view.media.pending[0]).toBe(false);
  });

  it("uses exact structural links for operation and knowledge", () => {
    const view = buildRoom360(input);
    expect(view.operation.tasks.map((item) => item.key)).toEqual(["TASK-25-EXACT"]);
    expect(view.operation.validations.map((item) => item.key)).toEqual(["VALID-25"]);
    expect(view.knowledge.map((item) => item.key)).toEqual(["SOP-ROOM-25"]);
  });

  it("does not leak unknown or private fields", () => {
    const serialized = JSON.stringify(buildRoom360(input));
    expect(serialized).not.toContain("never expose");
    expect(serialized).not.toContain("privatePayload");
    expect(serialized).not.toContain("rawPayload");
  });
});
