import { describe, expect, it } from "vitest";

import { buildRoom360FromAirtable } from "./room-360-airtable";

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
    { id: "media3", fields: { asset_key: "WHATSAPP-INCIDENTAL-25", asset_name: "dc_whatsapp_5ad6fe67936b1e15_image_218940025.JPEG", public_url: "https://example.com/incidental.jpg", approved_for_web: true } },
  ],
};

describe("buildRoom360FromAirtable", () => {
  it("builds Room 25 from safe Airtable fields without leaking private notes", () => {
    const view = buildRoom360FromAirtable(raw);

    expect(view.summary.key).toBe("DC-ROOM-25");
    expect(view.summary.capacity).toBe(5);
    expect(view.summary.amenityCount).toBe(22);
    expect(view.kross.authority).toBe("Kross");
    expect(view.kross.directBookingUrl).toBe("https://dreamcatcherhotel.kross.travel/es/rooms/25");
    expect("price" in view.kross).toBe(false);
    expect(JSON.stringify(view)).not.toContain("private note");
  });

  it("preserves only validated sellable contexts for the Room 25 pilot", () => {
    const view = buildRoom360FromAirtable(raw);
    expect(view.sale.map((item) => item.name)).toEqual([
      "#25 Suite premium cinema con cocina",
      "Villa Toro",
      "Dreamcatcher Full Property Buyout",
    ]);
  });

  it("uses exact linked entity keys for operation", () => {
    const view = buildRoom360FromAirtable(raw);
    expect(view.operation.tasks.map((item) => item.key)).toEqual(["TASK-25"]);
    expect(view.operation.validations.map((item) => item.key)).toEqual(["VAL-25"]);
  });

  it("marks only explicitly paired media as shared", () => {
    const view = buildRoom360FromAirtable(raw);
    expect(view.media.hero[0].identityScope).toBe("exact");
    expect(view.media.web[0].identityScope).toBe("shared");
    expect(view.media.web[0].sharedWith).toEqual(["DC-ROOM-26"]);
  });

  it("rejects media whose asset name only contains the room number incidentally", () => {
    const view = buildRoom360FromAirtable(raw);
    const mediaKeys = Object.values(view.media).flat().map((item) => item.key);

    expect(mediaKeys).toEqual(["MEDIA-25", "MEDIA-25-26"]);
    expect(mediaKeys).not.toContain("WHATSAPP-INCIDENTAL-25");
  });
});
