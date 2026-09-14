import test from "node:test";
import assert from "node:assert/strict";
import { createAirtableSearchLoader } from "./airtable-search-loader.mjs";

const source = {
  tableName: "rooms",
  tableId: "tblzfPcXbDft3upck",
  fields: ["room_key", "room_number", "official_name_es"],
  searchFields: ["room_key", "room_number", "official_name_es"],
  pageSize: 12,
};

test("passes governed source scope into the read-only Airtable connector", async () => {
  const calls = [];
  const readRecords = async (input) => {
    calls.push(input);
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: { records: [{ id: "rec25", fields: { room_key: "DC-ROOM-25" } }] },
      error: null,
    };
  };

  const loadSource = createAirtableSearchLoader({ baseId: "apptlzWcI6DdpLO0B", readRecords });
  const result = await loadSource(source, "25");

  assert.deepEqual(calls, [
    {
      baseId: "apptlzWcI6DdpLO0B",
      tableId: "tblzfPcXbDft3upck",
      fields: ["room_key", "room_number", "official_name_es"],
      searchFields: ["room_key", "room_number", "official_name_es"],
      query: "25",
      pageSize: 12,
    },
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.records.length, 1);
  assert.equal(result.stale, false);
});

test("connector errors fail one source closed without exposing connector details", async () => {
  const loadSource = createAirtableSearchLoader({
    baseId: "apptlzWcI6DdpLO0B",
    readRecords: async () => ({
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "Airtable read failed with 500. internal detail",
    }),
  });

  const result = await loadSource(source, "25");
  assert.deepEqual(result, { ok: false, records: [], stale: false });
});

test("unconfigured connector fails closed", async () => {
  const loadSource = createAirtableSearchLoader({
    baseId: "apptlzWcI6DdpLO0B",
    readRecords: async () => ({
      configured: false,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "AIRTABLE_TOKEN is not configured",
    }),
  });

  const result = await loadSource(source, "25");
  assert.deepEqual(result, { ok: false, records: [], stale: false });
});
