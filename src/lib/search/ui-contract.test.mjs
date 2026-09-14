import test from "node:test";
import assert from "node:assert/strict";
import { TORO_SEARCH_PATH, getSearchResultAction } from "./ui-contract.mjs";

test("global TORO search path stays one tap away", () => {
  assert.equal(TORO_SEARCH_PATH, "/toro/buscar");
});

test("rooms open Room 360 while other governed results disclose inline", () => {
  assert.deepEqual(getSearchResultAction({ entityType: "room", key: "DC-ROOM-25" }), {
    kind: "room360",
    label: "Ver ficha 360",
    href: "/toro/habitaciones/DC-ROOM-25",
  });

  assert.deepEqual(getSearchResultAction({ entityType: "staff", key: "EMP-00004" }), {
    kind: "inline",
    label: "Ver",
    href: null,
  });
});
