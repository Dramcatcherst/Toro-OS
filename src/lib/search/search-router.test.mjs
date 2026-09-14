import test from "node:test";
import assert from "node:assert/strict";
import { groupSearchResults, rankSearchResults } from "./search-router.mjs";

const candidates = [
  {
    entityType: "room",
    key: "DC-ROOM-25",
    title: "#25 Premium Cinema Suite with Kitchen",
    aliases: ["25", "Habitación 25", "Suite 25"],
    subtitle: "5 huéspedes · cocina privada · proyector",
    status: "active",
    destination: "/toro/habitaciones/DC-ROOM-25",
    source: "Airtable rooms",
    searchText: "familia cine cocina proyector",
    rawPayload: { privateNotes: "never expose" },
  },
  {
    entityType: "room",
    key: "DC-ROOM-26",
    title: "#26 Premium Family Suite with Kitchen",
    aliases: ["26", "Habitación 26"],
    subtitle: "5 huéspedes · cocina privada · proyector",
    status: "active",
    destination: "/toro/habitaciones/DC-ROOM-26",
    source: "Airtable rooms",
    searchText: "similar a la 25 en capacidad y cocina",
  },
  {
    entityType: "task",
    key: "TASK-MEDIA-25-NOTE",
    title: "Revisar media histórica",
    subtitle: "NEXT",
    status: "todo",
    destination: "/toro/tareas/TASK-MEDIA-25-NOTE",
    source: "Airtable tasks",
    searchText: "nota histórica menciona habitación 25 pero no está enlazada",
    notes: "private long note",
  },
  {
    entityType: "staff",
    key: "EMP-00004",
    title: "Oliver Mendoza",
    aliases: ["Oliver"],
    subtitle: "Mantenimiento",
    status: "active",
    destination: "/toro/equipo/EMP-00004",
    source: "Airtable staff_directory",
    direct_contact_phone: "+50600000000",
  },
  {
    entityType: "property",
    key: "property_santa_toro",
    title: "Santa Toro",
    aliases: ["Santa Toro Inn"],
    subtitle: "Histórico · no comercial",
    status: "archived",
    destination: "/toro/propiedades/property_santa_toro",
    source: "Airtable properties",
    searchText: "propiedad archivada",
  },
  {
    entityType: "sop",
    key: "SOP-FNB-001",
    title: "Registro y conciliación de alimentos y bebidas",
    aliases: ["desayuno", "A&B"],
    subtitle: "SOP en revisión",
    status: "in_review",
    destination: "/toro/conocimiento/SOP-FNB-001",
    source: "Airtable sops",
    searchText: "desayuno alimentos bebidas USD 15",
  },
];

test("empty query returns no results", () => {
  assert.deepEqual(rankSearchResults("   ", candidates), []);
});

test("exact room number outranks fuzzy mentions of the same number", () => {
  const results = rankSearchResults("25", candidates);
  assert.equal(results[0]?.key, "DC-ROOM-25");
  assert.equal(results[0]?.matchType, "exact-alias");
  assert.ok(results.findIndex((item) => item.key === "TASK-MEDIA-25-NOTE") > 0);
});

test("exact alias outranks fuzzy text", () => {
  const results = rankSearchResults("Oliver", candidates);
  assert.equal(results[0]?.key, "EMP-00004");
  assert.equal(results[0]?.matchType, "exact-alias");
});

test("normalization handles accents and casing", () => {
  const results = rankSearchResults("habitacion 25", candidates);
  assert.equal(results[0]?.key, "DC-ROOM-25");
});

test("result projection does not leak arbitrary raw or private fields", () => {
  const [result] = rankSearchResults("25", candidates);
  assert.ok(result);
  assert.equal("rawPayload" in result, false);
  assert.equal("notes" in result, false);
  assert.equal("direct_contact_phone" in result, false);
  assert.deepEqual(
    Object.keys(result).sort(),
    [
      "destination",
      "entityType",
      "key",
      "matchType",
      "score",
      "source",
      "status",
      "subtitle",
      "title",
    ].sort(),
  );
});

test("groups results into stable human-facing sections", () => {
  const results = rankSearchResults("a", candidates);
  const groups = groupSearchResults(results);
  assert.ok(Array.isArray(groups));
  for (const group of groups) {
    assert.ok(group.label);
    assert.ok(Array.isArray(group.results));
  }
});

test("exact property title and SOP alias resolve correctly", () => {
  assert.equal(rankSearchResults("Santa Toro", candidates)[0]?.key, "property_santa_toro");
  assert.equal(rankSearchResults("desayuno", candidates)[0]?.key, "SOP-FNB-001");
});
