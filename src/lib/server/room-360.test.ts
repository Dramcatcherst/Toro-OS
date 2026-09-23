import { beforeEach, describe, expect, it, vi } from "vitest";

const { readAirtableRecords } = vi.hoisted(() => ({
  readAirtableRecords: vi.fn(),
}));

vi.mock("@/lib/server/read-only-connectors", () => ({ readAirtableRecords }));

import { loadRoom360FromAirtable } from "./room-360";

const roomRecord = {
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
  },
};

function ok(records: unknown[]) {
  return {
    configured: true,
    externalWrite: false as const,
    mode: "read_only" as const,
    data: { records },
    error: null,
  };
}

describe("loadRoom360FromAirtable", () => {
  beforeEach(() => {
    readAirtableRecords.mockReset();
  });

  it("rejects arbitrary route keys before making an external read", async () => {
    const result = await loadRoom360FromAirtable("../../private");
    expect(result.state).toBe("not_found");
    expect(result.view.summary.key).toBe("");
    expect(readAirtableRecords).not.toHaveBeenCalled();
  });

  it("distinguishes an unconfigured connector from a missing room", async () => {
    readAirtableRecords.mockResolvedValueOnce({
      configured: false,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "AIRTABLE_TOKEN is not configured.",
    });

    const result = await loadRoom360FromAirtable("DC-ROOM-25");
    expect(result.state).toBe("unconfigured");
    expect(result.configured).toBe(false);
    expect(readAirtableRecords).toHaveBeenCalledTimes(1);
  });

  it("requires an exact room_key match before reading related sources", async () => {
    readAirtableRecords.mockResolvedValueOnce(ok([{ ...roomRecord, fields: { ...roomRecord.fields, room_key: "DC-ROOM-26" } }]));

    const result = await loadRoom360FromAirtable("DC-ROOM-25");
    expect(result.state).toBe("not_found");
    expect(readAirtableRecords).toHaveBeenCalledTimes(1);
  });

  it("loads only allowlisted fields and returns a ready governed Room 360 view", async () => {
    readAirtableRecords
      .mockResolvedValueOnce(ok([roomRecord]))
      .mockResolvedValueOnce(ok(Array.from({ length: 22 }, (_, index) => ({ id: `amenity-${index + 1}`, fields: {} }))))
      .mockResolvedValueOnce(ok([{ id: "task", fields: { task_key: "TASK-25", task_name: "Revisar proyector", status: "in_progress", priority: "P1", linked_entity_key: "DC-ROOM-25" } }]))
      .mockResolvedValueOnce(ok([{ id: "validation", fields: { validation_key: "VAL-25", validation_type: "media", severity: "high", status: "open", linked_entity_key: "DC-ROOM-25" } }]))
      .mockResolvedValueOnce(ok([{ id: "media", fields: { asset_key: "MEDIA-25", asset_name: "#25 Bedroom", public_url: "https://example.com/25.jpg", approved_for_web: true, hero_candidate: true } }]));

    const result = await loadRoom360FromAirtable("  DC-ROOM-25  ");

    expect(result.state).toBe("ready");
    expect(result.configured).toBe(true);
    expect(result.failedSources).toEqual([]);
    expect(result.view.summary.key).toBe("DC-ROOM-25");
    expect(result.view.summary.amenityCount).toBe(22);
    expect(result.view.media.hero).toHaveLength(1);

    expect(readAirtableRecords).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        tableId: "tblzfPcXbDft3upck",
        fields: expect.arrayContaining(["room_key", "room_number", "direct_booking_url"]),
        searchFields: ["room_key"],
        query: "DC-ROOM-25",
        pageSize: 2,
      }),
    );

    for (const call of readAirtableRecords.mock.calls) {
      expect(call[0].fields).not.toContain("notes");
      expect(call[0].fields).not.toContain("private_notes");
    }
  });

  it("returns partial data when a secondary source fails without hiding the room", async () => {
    readAirtableRecords
      .mockResolvedValueOnce(ok([roomRecord]))
      .mockResolvedValueOnce(ok([]))
      .mockResolvedValueOnce({ configured: true, externalWrite: false, mode: "read_only", data: null, error: "Airtable read failed with 503." })
      .mockResolvedValueOnce(ok([]))
      .mockResolvedValueOnce(ok([]));

    const result = await loadRoom360FromAirtable("DC-ROOM-25");
    expect(result.state).toBe("partial");
    expect(result.failedSources).toEqual(["tasks"]);
    expect(result.view.summary.key).toBe("DC-ROOM-25");
  });
});
