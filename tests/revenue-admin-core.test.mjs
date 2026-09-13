import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeRevenueFilters,
  buildRevenueRpcBody,
} from "../src/lib/revenue-admin-core.mjs";

test("normalizes agency, room, stay date and season filters", () => {
  assert.deepEqual(
    normalizeRevenueFilters({
      agencyKey: "  Dream-Planners  ",
      roomNumber: "25",
      stayDate: "2026-09-20",
      seasonCode: " high ",
    }),
    {
      agencyKey: "dream-planners",
      roomNumber: 25,
      stayDate: "2026-09-20",
      seasonCode: "HIGH",
    },
  );
});

test("turns empty optional filters into null RPC arguments", () => {
  assert.deepEqual(
    buildRevenueRpcBody({
      agencyKey: "",
      roomNumber: "",
      stayDate: "",
      seasonCode: "",
    }),
    {
      p_agency_key: null,
      p_room_number: null,
      p_stay_date: null,
      p_season_code: null,
    },
  );
});

test("rejects invalid room numbers and malformed ISO dates", () => {
  assert.throws(
    () => normalizeRevenueFilters({ roomNumber: "0" }),
    /room number/i,
  );
  assert.throws(
    () => normalizeRevenueFilters({ stayDate: "20-09-2026" }),
    /stay date/i,
  );
});
