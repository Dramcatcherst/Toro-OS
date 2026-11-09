import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
import { canReadHotelOperations, emptyHotelOperations, HOTEL_OPERATIONS_SCOPE as scope, HOTEL_TASK_READ_LIMIT,
  initialPortalTab, projectHotelKrossHealth, projectHotelTasks } from "./hotel-operations";
import { HotelOperationsPanel } from "./hotel-operations-panel";
import { buildHotelHomeSummary } from "./hotel-home-summary";

const cut = "2026-11-07T12:00:00.000Z";
export const taskFixture = (overrides = {}) => ({ id: "11111111-1111-4111-8111-111111111111", org_id: scope.orgId,
  property_id: scope.propertyId, task_name: "Caso sintético de mantenimiento", status: "blocked", priority: "critical", area: "Mantenimiento",
  owner_name: "Responsable sintético", assignee_name: null, due_date: "2026-11-08", source_system: "TORO",
  updated_at: "2026-10-22T18:30:26.478Z", needs_revalidation: true, ...overrides });
export const healthFixture = (overrides = {}) => ({ id: "22222222-2222-4222-8222-222222222222", org_id: scope.orgId,
  property_id: scope.propertyId, source_name: "Copia sintética", snapshot_kind: "historical", source_as_of: "2026-10-20T22:03:34.982Z",
  observed_at: cut, live_required: false, freshness_status: "stale", safe_for_current_state: true, ...overrides });

it.each(["ADMIN", "GERENCIA"] as const)("permits %s within the exact active hotel context", role => {
  const context = authorizedContext(); context.membership!.roles = [role]; expect(canReadHotelOperations(context)).toBe(true);
});
it.each(["AUDITOR", "JEFE_DEPARTAMENTO", "EMPLEADO"] as const)("does not expand operations to %s", role => {
  const context = authorizedContext(); context.membership!.roles = [role]; expect(canReadHotelOperations(context)).toBe(false);
});
it.each(["org", "personal", "choice", "inactive", "scope"])("denies %s context", reason => {
  const context = authorizedContext();
  if (reason === "org") { context.orgId = "another-org"; context.membership!.orgId = context.orgId; }
  if (reason === "personal") context.mode = "personal";
  if (reason === "choice") context.requiresContextChoice = true;
  if (reason === "inactive") context.membership!.status = "offboarded";
  if (reason === "scope") context.allowedDataScopes = [];
  expect(canReadHotelOperations(context)).toBe(false);
});
it("accepts only the exact authorized operations deep link", () => {
  expect(initialPortalTab("operations", true)).toBe("operations");
  for (const value of [undefined, "OPERATIONS", ["operations"], "operations ", "../../api"]) expect(initialPortalTab(value, true)).toBe("home");
  expect(initialPortalTab("operations", false)).toBe("home");
});
it("normalizes absent assignments without inventing a responsible person or date", () => {
  const tasks = projectHotelTasks([taskFixture({ owner_name: "", assignee_name: "  ", due_date: null, status: null })]);
  expect(tasks.state).toBe("ready"); expect(tasks.items[0]).toMatchObject({ owner: null, dueDate: null, status: "unknown", needsRevalidation: true });
  expect(tasks.items[0].updatedAt).toBe("2026-10-22T18:30:26.478Z");
});
it.each(["other_property", "null_property", "other_org", "private_field", "duplicate", "impossible_date"])("rejects the affected source for %s", reason => {
  let rows = [taskFixture()];
  if (reason === "other_property") rows = [taskFixture({ property_id: "33333333-3333-4333-8333-333333333333" })];
  if (reason === "null_property") rows = [taskFixture({ property_id: null })];
  if (reason === "other_org") rows = [taskFixture({ org_id: "33333333-3333-4333-8333-333333333333" })];
  if (reason === "private_field") rows = [taskFixture({ notes: "private_sentinel" })];
  if (reason === "duplicate") rows = [taskFixture(), taskFixture()];
  if (reason === "impossible_date") rows = [taskFixture({ due_date: "2026-02-30" })];
  const result = projectHotelTasks(rows); expect(result.state).toBe("unavailable"); expect(result.rowsRead).toBeNull(); expect(result.items).toEqual([]);
});
it("keeps priorities and a bounded sample without pretending it is the hotel's total", () => {
  const rows = Array.from({ length: HOTEL_TASK_READ_LIMIT + 1 }, (_, index) => taskFixture({
    id: `11111111-1111-4111-8111-${String(index).padStart(12, "0")}`, priority: index === 19 ? "critical" : "normal",
  }));
  const result = projectHotelTasks(rows); expect(result.limitReached).toBe(true); expect(result.total).toBeNull();
  expect(result.items).toHaveLength(HOTEL_TASK_READ_LIMIT); expect(result.items[0].priority).toBe("critical"); expect(result.rowsRead).toBe(HOTEL_TASK_READ_LIMIT);
});
it("never converts historical live=false data into current occupation even when safe flag is true", () => {
  const health = projectHotelKrossHealth([healthFixture()], cut);
  expect(health.items[0].freshness).toBe("stale"); expect(health.occupancy).toBeNull();
  const html = renderToStaticMarkup(<HotelOperationsPanel view={{ ...emptyHotelOperations("ready"), readAt: cut,
    tasks: projectHotelTasks([taskFixture()]), kross: health }} />);
  expect(html).toContain("Sin dato actual verificado"); expect(html).toContain("Corte caducado");
  expect(html).toContain("Requiere revalidación"); expect(html).toContain("Último cambio"); expect(html).toContain("Referencia canónica");
  expect(html).not.toContain("0 pendientes"); expect(html).not.toContain("100 %");
});
it.each([null, "2026-11-07T12:01:00.000Z"])("does not refresh missing/future source dates %s from the read time", source_as_of => {
  const health = projectHotelKrossHealth([healthFixture({ source_as_of, observed_at: cut, freshness_status: "fresh" })], cut);
  expect(health.items[0].freshness).toBe("unknown"); expect(health.items[0].sourceAgeMinutes).toBeNull();
});
it("expires an informational source immediately after the actual 60-minute boundary", () => {
  const health = projectHotelKrossHealth([healthFixture({ source_as_of: "2026-11-07T10:59:59.999Z", freshness_status: "fresh" })], cut);
  expect(health.items[0].sourceAgeMinutes).toBe(60); expect(health.items[0].freshness).toBe("stale");
});
it("does not confuse a successful empty read with proof that there is no pending work", () => {
  const html = renderToStaticMarkup(<HotelOperationsPanel view={{ ...emptyHotelOperations("partial"), tasks: projectHotelTasks([]) }} />);
  expect(html).toContain("No confirma que el hotel esté libre de pendientes");
  const missing = renderToStaticMarkup(<HotelOperationsPanel view={emptyHotelOperations("unavailable")} />);
  expect(missing).toContain("no significa cero pendientes"); expect(missing).toContain("acceso privado es independiente");
  expect(renderToStaticMarkup(<HotelOperationsPanel view={emptyHotelOperations("denied")} />)).toBe("");
});

it("keeps all read tasks for Hoy while rendering at most twelve operational details", () => {
  const rows = Array.from({ length: 14 }, (_, index) => taskFixture({
    id: `11111111-1111-4111-8111-${String(index).padStart(12,"0")}`,
    task_name: `Release task ${index}`,
  }));
  const tasks = projectHotelTasks(rows);
  expect(buildHotelHomeSummary(tasks, cut).count).toBe(14);
  const html = renderToStaticMarkup(<HotelOperationsPanel view={{...emptyHotelOperations("ready"),readAt:cut,tasks}} />);
  expect(html).toContain("12 tareas visibles");
  expect(html).not.toContain("Release task 12");
  expect(html).not.toContain("Release task 13");
  expect(html).toContain("14 filas leídas");
});
