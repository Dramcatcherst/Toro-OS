import test from "node:test";
import assert from "node:assert/strict";
import { buildAirtableReadQuery } from "./airtable-query.mjs";

test("builds an allowlisted Airtable query with bounded page size", () => {
  const params = buildAirtableReadQuery({
    fields: ["room_key", "room_number", "official_name_es"],
    searchFields: ["room_key", "room_number", "official_name_es"],
    query: "25",
    pageSize: 10,
  });

  assert.equal(params.get("pageSize"), "10");
  assert.deepEqual(params.getAll("fields[]"), ["room_key", "room_number", "official_name_es"]);
  assert.match(params.get("filterByFormula") ?? "", /SEARCH/i);
  assert.match(params.get("filterByFormula") ?? "", /room_number/);
  assert.match(params.get("filterByFormula") ?? "", /25/);
});

test("escapes quotes and backslashes in user search text", () => {
  const params = buildAirtableReadQuery({
    fields: ["property_name"],
    searchFields: ["property_name"],
    query: 'Santa "Toro" \\ test',
    pageSize: 8,
  });

  const formula = params.get("filterByFormula") ?? "";
  assert.equal(formula.includes('"Toro"'), false);
  assert.match(formula, /\\"Toro\\"/);
  assert.match(formula, /\\\\ test/);
});

test("clamps page size and never searches fields outside the allowlist", () => {
  const params = buildAirtableReadQuery({
    fields: ["task_key", "task_name", "status"],
    searchFields: ["task_name", "notes", "task_key"],
    query: "proyector",
    pageSize: 999,
  });

  assert.equal(params.get("pageSize"), "25");
  const formula = params.get("filterByFormula") ?? "";
  assert.match(formula, /task_name/);
  assert.match(formula, /task_key/);
  assert.equal(formula.includes("notes"), false);
});

test("blank query omits filter formula while preserving field allowlist", () => {
  const params = buildAirtableReadQuery({
    fields: ["source_key", "source_name"],
    searchFields: ["source_key", "source_name"],
    query: "   ",
    pageSize: 5,
  });

  assert.equal(params.has("filterByFormula"), false);
  assert.deepEqual(params.getAll("fields[]"), ["source_key", "source_name"]);
});
