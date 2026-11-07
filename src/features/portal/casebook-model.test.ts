import { describe, expect, it } from "vitest";
import { CASEBOOK_DEMO_RECORDS } from "./casebook-demo";
import { casebookReducer, createCasebookState, filterCasebookRecords, formatCasebookAmount, selectedCasebookRecord } from "./casebook-model";

describe("synthetic casebook exploration", () => {
  it("combines entity, category, period and status without mixing records", () => {
    let state = createCasebookState();
    state = casebookReducer(state, { type: "entity", value: "demo-company" });
    state = casebookReducer(state, { type: "category", value: "tax" });
    state = casebookReducer(state, { type: "period", value: "2026" });
    state = casebookReducer(state, { type: "status", value: "unknown" });
    expect(filterCasebookRecords(CASEBOOK_DEMO_RECORDS, state).map(row => row.id)).toEqual(["demo-tax"]);
    expect(selectedCasebookRecord(CASEBOOK_DEMO_RECORDS, state)?.id).toBe("demo-tax");
  });

  it("searches accents, casing and surrounding whitespace and can clear the search", () => {
    let state = casebookReducer(createCasebookState(), { type: "query", value: "  INSPECCION  " });
    expect(filterCasebookRecords(CASEBOOK_DEMO_RECORDS, state).map(row => row.id)).toEqual(["demo-vehicle"]);
    state = casebookReducer(state, { type: "query", value: "" });
    expect(filterCasebookRecords(CASEBOOK_DEMO_RECORDS, state)).toHaveLength(CASEBOOK_DEMO_RECORDS.length);
  });

  it("does not retain a hidden selection or stale detail when filters produce no matches", () => {
    const initial = createCasebookState();
    const selected = casebookReducer(initial, { type: "select", id: "demo-property" });
    expect(selected.detailOpen).toBe(true);
    expect(selectedCasebookRecord(CASEBOOK_DEMO_RECORDS, selected)?.id).toBe("demo-property");
    const empty = casebookReducer(selected, { type: "query", value: "no-result-xyz" });
    expect(empty.detailOpen).toBe(false);
    expect(empty.selectedId).toBeNull();
    expect(selectedCasebookRecord(CASEBOOK_DEMO_RECORDS, empty)).toBeNull();
    expect(initial.selectedId).toBeNull();
    expect(selected.selectedId).toBe("demo-property");
  });

  it("falls back safely for unknown IDs and keeps filters when returning to the list", () => {
    let state = casebookReducer(createCasebookState(), { type: "category", value: "assets" });
    state = casebookReducer(state, { type: "select", id: "not-in-fixtures" });
    expect(selectedCasebookRecord(CASEBOOK_DEMO_RECORDS, state)?.category).toBe("assets");
    const back = casebookReducer(state, { type: "back" });
    expect(back.category).toBe("assets");
    expect(back.detailOpen).toBe(false);
    expect(casebookReducer(back, { type: "reset" })).toEqual(createCasebookState());
  });

  it("filters missing periods separately from known years", () => {
    const state = casebookReducer(createCasebookState(), { type: "period", value: "unknown" });
    const rows = filterCasebookRecords(CASEBOOK_DEMO_RECORDS, state);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(row => row.period === null)).toBe(true);
  });

  it("distinguishes unknown amount from exact zero and keeps currency and nature", () => {
    expect(formatCasebookAmount({ minor: null, currency: "CRC", nature: "Obligación de ejemplo" })).toBe("CRC · monto desconocido · Obligación de ejemplo");
    expect(formatCasebookAmount({ minor: 0, currency: "USD", nature: "Diferencia de ejemplo" })).toMatch(/^USD 0[,.]00 · Diferencia de ejemplo$/);
    expect(formatCasebookAmount(null)).toBe("No aplica");
  });

  it("contains only fictional keys, physical and legal entities, and no original URLs", () => {
    expect(CASEBOOK_DEMO_RECORDS.every(row => row.id.startsWith("demo-"))).toBe(true);
    expect(CASEBOOK_DEMO_RECORDS.map(row => row.kind)).toEqual(expect.arrayContaining(["Persona física", "Persona jurídica", "Vehículo", "Inmueble"]));
    expect(CASEBOOK_DEMO_RECORDS.every(row => row.entityId.startsWith("demo-"))).toBe(true);
    expect(JSON.stringify(CASEBOOK_DEMO_RECORDS)).not.toMatch(/https?:|source_payload|\b\d{8,}\b/i);
  });
});
