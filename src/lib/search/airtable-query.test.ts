import { describe, expect, it } from "vitest";

import { buildAirtableReadQuery } from "./airtable-query";

describe("buildAirtableReadQuery", () => {
  it("projects only declared fields and clamps page size", () => {
    const params = buildAirtableReadQuery({
      fields: ["room_key", "room_number", "room_key", "  official_name_es  ", ""],
      pageSize: 999,
    });

    expect(params.get("pageSize")).toBe("25");
    expect(params.getAll("fields[]")).toEqual(["room_key", "room_number", "official_name_es"]);
  });

  it("allows search only across fields already present in the projection", () => {
    const params = buildAirtableReadQuery({
      fields: ["room_key", "official_name_es"],
      searchFields: ["room_key", "private_notes", "official_name_es"],
      query: "Room 25",
      pageSize: 10,
    });

    const formula = params.get("filterByFormula") ?? "";
    expect(formula).toContain("{room_key}");
    expect(formula).toContain("{official_name_es}");
    expect(formula).not.toContain("private_notes");
  });

  it("escapes Airtable formula string input instead of interpolating raw query text", () => {
    const params = buildAirtableReadQuery({
      fields: ["room_key"],
      searchFields: ["room_key"],
      query: '25\\\"),RECORD_ID(),(\"',
    });

    const formula = params.get("filterByFormula") ?? "";
    expect(formula).toContain('25\\\\\\\"),record_id(),(\\\"');
    expect(formula).toMatch(/^SEARCH\(/);
  });

  it("does not create a filter when the query is empty or no safe search fields remain", () => {
    expect(
      buildAirtableReadQuery({ fields: ["room_key"], searchFields: ["private_notes"], query: "25" }).has(
        "filterByFormula",
      ),
    ).toBe(false);

    expect(
      buildAirtableReadQuery({ fields: ["room_key"], searchFields: ["room_key"], query: "   " }).has(
        "filterByFormula",
      ),
    ).toBe(false);
  });
});
