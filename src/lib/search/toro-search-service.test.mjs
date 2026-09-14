import test from "node:test";
import assert from "node:assert/strict";
import { createToroSearchService, SEARCH_SOURCES } from "./toro-search-service.mjs";

const room25 = {
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
    notes: "private note that must never be requested",
  },
};

function makeLoader({ failTable } = {}) {
  const calls = [];

  const loadSource = async (source, query) => {
    calls.push({ source, query });
    if (source.tableName === failTable) {
      return { ok: false, records: [], error: `${source.tableName} unavailable`, stale: false };
    }

    if (source.tableName === "rooms" && query === "25") {
      return { ok: true, records: [room25], error: null, stale: false };
    }

    return { ok: true, records: [], error: null, stale: false };
  };

  return { loadSource, calls };
}

test("empty query returns empty state without connector calls", async () => {
  const { loadSource, calls } = makeLoader();
  const search = createToroSearchService({ loadSource });

  const result = await search("   ");

  assert.equal(result.state, "empty");
  assert.deepEqual(result.groups, []);
  assert.equal(result.callCount, 0);
  assert.equal(calls.length, 0);
});

test("queries every governed V1 source once and ranks exact room first", async () => {
  const { loadSource, calls } = makeLoader();
  const search = createToroSearchService({ loadSource });

  const result = await search("25");

  assert.equal(SEARCH_SOURCES.length, 11);
  assert.equal(calls.length, 11);
  assert.equal(result.callCount, 11);
  assert.equal(result.state, "ready");
  assert.equal(result.results[0]?.key, "DC-ROOM-25");
  assert.equal(result.results[0]?.matchType, "exact-alias");
  assert.equal(JSON.stringify(result).includes("private note"), false);
});

test("source configs use explicit safe allowlists and search fields are subsets", () => {
  for (const source of SEARCH_SOURCES) {
    assert.ok(source.tableName);
    assert.ok(source.tableId.startsWith("tbl"));
    assert.ok(source.fields.length >= 3);
    assert.ok(source.searchFields.length >= 1);
    assert.ok(source.pageSize > 0 && source.pageSize <= 25);

    for (const field of source.searchFields) {
      assert.ok(source.fields.includes(field), `${source.tableName}: ${field} must be allowlisted`);
    }

    const serialized = JSON.stringify(source.fields).toLowerCase();
    assert.equal(serialized.includes("phone"), false);
    assert.equal(serialized.includes("email"), false);
    assert.equal(serialized.includes("notes"), false);
    assert.equal(serialized.includes("payload"), false);
  }
});

test("one failed source produces partial results instead of failing the whole search", async () => {
  const { loadSource } = makeLoader({ failTable: "tasks" });
  const search = createToroSearchService({ loadSource });

  const result = await search("25");

  assert.equal(result.state, "partial");
  assert.equal(result.results[0]?.key, "DC-ROOM-25");
  assert.deepEqual(result.failedSources, ["tasks"]);
  assert.equal(result.callCount, 11);
});

test("all failed sources produce error state with no results", async () => {
  const search = createToroSearchService({
    loadSource: async (source) => ({ ok: false, records: [], error: `${source.tableName} down`, stale: false }),
  });

  const result = await search("25");

  assert.equal(result.state, "error");
  assert.deepEqual(result.results, []);
  assert.equal(result.failedSources.length, 11);
});
