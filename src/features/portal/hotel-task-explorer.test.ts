import { expect, it } from "vitest";
import type { HotelTask } from "./hotel-operations";
import { buildHotelTaskSummary, copyHotelTaskSummary, initialHotelTaskFilters, hotelTaskFiltersReducer, recordedTaskStatus, selectHotelTasks } from "./hotel-task-explorer";

const task = (index: number, change: Partial<HotelTask> = {}): HotelTask => ({
  canonicalRef: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
  title: `Caso ${index}`, status: "blocked", priority: "medium", area: "Recepción", owner: "Persona sintética",
  dueDate: null, sourceSystem: "TORO", updatedAt: "2026-10-22T12:00:00Z", needsRevalidation: false, ...change,
});
const rows = Array.from({ length: 25 }, (_, index) => task(index + 1, index === 24 ? {
  title: "Revisión de lámpara", area: "Mantenimiento", owner: null, needsRevalidation: true,
} : {}));

it("searches every eligible row before applying a twelve-row page, including accent-insensitive later matches", () => {
  const full = selectHotelTasks(rows, initialHotelTaskFilters);
  expect(full.items).toHaveLength(12); expect(full.end).toBe(12); expect(full.totalMatches).toBe(25);
  const result = selectHotelTasks(rows, { ...initialHotelTaskFilters, query: "revision lampara" });
  expect(result.totalMatches).toBe(1); expect(result.items[0].canonicalRef).toBe("00000000-0000-4000-8000-000000000025");
  expect(selectHotelTasks(rows, { ...initialHotelTaskFilters, query: "Persona sintética" }).totalMatches).toBe(24);
  expect(selectHotelTasks(rows, { ...initialHotelTaskFilters, query: "000000000025" }).totalMatches).toBe(1);
});

it("intersects area, missing owner and revalidation rather than filtering only the visible page", () => {
  const result = selectHotelTasks(rows, { ...initialHotelTaskFilters, area: "Mantenimiento", unassignedOnly: true, revalidationOnly: true });
  expect(result.items.map(item => item.canonicalRef)).toEqual(["00000000-0000-4000-8000-000000000025"]);
  expect(selectHotelTasks(rows, { ...initialHotelTaskFilters, area: "Recepción", unassignedOnly: true }).totalMatches).toBe(0);
});
it("treats prototype-shaped area and status values as unrecognized labels without crashing the mounted explorer", () => {
  const result = selectHotelTasks([task(1), task(2, { area: "constructor", status: "__proto__" })], initialHotelTaskFilters);
  expect(result.totalMatches).toBe(2);
  expect(result.summary.areas).toContain("Otra área registrada: 1");
  expect(recordedTaskStatus("constructor")).toBe("Otro estado registrado");
  expect(recordedTaskStatus("__proto__")).toBe("Otro estado registrado");
});
it("can find a task by pasting the exact minimized reference from a copied summary", () => {
  const selection = selectHotelTasks(rows, initialHotelTaskFilters);
  const summary = buildHotelTaskSummary(selection, initialHotelTaskFilters, { rowsRead: 25, limitReached: false, readAt: null });
  const reference = summary.match(/Referencia: ([^ ]+)/)?.[1];
  expect(reference).toBe("0000…00000001");
  expect(selectHotelTasks(rows, { ...initialHotelTaskFilters, query: reference! }).items.map(x => x.canonicalRef)).toEqual(["00000000-0000-4000-8000-000000000001"]);
});

it("sorts with missing dates last and deterministic reference tie breaks without mutating supplied rows", () => {
  const input = [task(3), task(2, { dueDate: "2026-11-09" }), task(1, { dueDate: "2026-11-08" }), task(4, { updatedAt: "2026-11-07T09:00:00Z" })];
  expect(selectHotelTasks(input, { ...initialHotelTaskFilters, sort: "due" }).items.map(x => x.canonicalRef.slice(-1))).toEqual(["1", "2", "4", "3"]);
  expect(selectHotelTasks(input, { ...initialHotelTaskFilters, sort: "recent" }).items[0].canonicalRef.slice(-1)).toBe("4");
  expect(selectHotelTasks([task(2), task(1)], initialHotelTaskFilters).items.map(x => x.canonicalRef.slice(-1))).toEqual(["1", "2"]);
  expect(input[0].canonicalRef.slice(-1)).toBe("3");
});

it("clamps stale pages and resets page for every criteria change and Reset", () => {
  const last = selectHotelTasks(rows, { ...initialHotelTaskFilters, page: 99 });
  expect(last.page).toBe(3); expect(last.start).toBe(25); expect(last.end).toBe(25);
  const state = { ...initialHotelTaskFilters, page: 3, query: "texto" };
  expect(hotelTaskFiltersReducer(state, { type: "criteria", change: { sort: "recent" } }).page).toBe(1);
  expect(hotelTaskFiltersReducer(state, { type: "reset" })).toEqual(initialHotelTaskFilters);
  expect(selectHotelTasks([], state)).toMatchObject({ page: 1, start: 0, end: 0, totalMatches: 0 });
});

it("copies only the current page and exact coverage without free text, names, raw query or an organization total", () => {
  const filters = { ...initialHotelTaskFilters, query: "Persona sintética", page: 2 };
  const selection = selectHotelTasks(rows, filters);
  const summary = buildHotelTaskSummary(selection, filters, { rowsRead: 141, limitReached: false, readAt: "2026-11-07T12:00:00Z" });
  expect(summary).toContain("Página 2 de 2 · 13–24 de 24 coincidencias");
  expect(summary).toContain("141 filas consultadas · 25 tareas elegibles");
  expect(summary).toContain("Texto y nombres omitidos");
  expect(summary).not.toContain("Persona sintética"); expect(summary).not.toContain("Caso ");
  expect(summary).not.toContain("000000000001\n");
  expect(summary.match(/Referencia:/g)).toHaveLength(3);
  expect(summary).toContain("Otras 9 referencias de esta página");
  expect(summary).toContain("Recepción: 24");
  expect(summary).toContain("Bloqueada: 24");
  expect(summary).toContain("Total del hotel desconocido");
});

it("reports success only after clipboard completes and returns manual fallback on failure or missing support", async () => {
  let copied = "";
  expect(await copyHotelTaskSummary("Resumen sintético", async value => { copied = value; })).toBe("copied");
  expect(copied).toBe("Resumen sintético");
  expect(await copyHotelTaskSummary("Resumen sintético", async () => { throw Error("denied"); })).toBe("manual");
  expect(await copyHotelTaskSummary("Resumen sintético")).toBe("manual");
});
