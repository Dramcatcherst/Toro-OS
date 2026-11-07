import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/features/kross/operational-snapshot.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { projectKrossOperationalSnapshot, KROSS_INFORMATIONAL_MAX_AGE_MS } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const now = "2026-10-24T23:00:00.000Z";
const scope = { orgId: "org-1", propertyId: "property-1", reportingDate: "2026-10-24", asOf: now };
const row = (changes = {}) => ({
  org_id: "org-1", property_id: "property-1", external_reservation_id: "reservation-1",
  check_in: "2026-10-24", check_out: "2026-10-25", status: "Confirmada (Lista para Check In)",
  source_system: "Kross", transactional_authority: "Kross", read_only_mirror: true,
  source_is_live: false, snapshot_as_of: "2026-10-24T22:30:00Z",
  last_synced_at: "2026-10-24T22:31:00Z", source_hash: "synthetic-row-hash",
  data_quality_status: "review", ...changes,
});
const project = (rows, extra = {}) => projectKrossOperationalSnapshot(rows, { ...scope, ...extra });

test("a non-live informational mirror is usable within an hour, labelled partial", () => {
  const result = project([row()]);
  assert.equal(result.state, "snapshot");
  assert.equal(result.counts.observedScheduledArrivals, 1);
  assert.equal(result.mode, "informational_snapshot");
  assert.equal(result.sourceAsOf, "2026-10-24T22:30:00.000Z");
  assert.equal(result.coverage.completeness, "unverified");
  assert.equal(result.coverage.totalArrivalsInProperty, null);
  assert.equal(result.coverage.reviewRows, 1);
  assert.equal(result.externalWrite, false);
});
test("the source age ceiling is one hour, inclusive", () => {
  assert.equal(KROSS_INFORMATIONAL_MAX_AGE_MS, 3_600_000);
  assert.equal(project([row({ snapshot_as_of: "2026-10-24T22:00:00Z" })]).state, "snapshot");
});
test("one millisecond beyond the ceiling is stale", () => {
  const result = project([row({ snapshot_as_of: "2026-10-24T21:59:59.999Z" })]);
  assert.equal(result.state, "stale");
  assert.equal(result.counts, null);
});
test("resyncing an old source does not make its data current", () => {
  assert.equal(project([row({ snapshot_as_of: "2026-10-20T22:00:00Z", last_synced_at: now })]).state, "stale");
});
for (const changes of [
  { snapshot_as_of: "2026-10-24T23:01:00Z" },
  { snapshot_as_of: "2026-10-24T22:30:00" },
  { snapshot_as_of: "2026-02-30T22:30:00Z" },
  { last_synced_at: "2026-10-24T23:01:00Z" },
  { last_synced_at: "2026-10-24T22:00:00Z" },
  { snapshot_as_of: null },
  { check_in: "2026-02-30" },
  { check_out: "2026-10-23" },
  { source_system: "unverified copy" },
  { transactional_authority: "other" },
  { read_only_mirror: false },
  { source_hash: "" },
  { data_quality_status: "conflict" },
]) {
  test(`invalid/provenance-conflicting row cannot produce a current count: ${JSON.stringify(changes)}`, () => {
    const result = project([row(changes)]);
    assert.equal(result.state, "unavailable");
    assert.equal(result.counts, null);
  });
}
test("mixed source ages remain partial and report the oldest timestamp actually used", () => {
  const result = project([
    row({ snapshot_as_of: "2026-10-24T22:00:00Z" }),
    row({ external_reservation_id: "r2", snapshot_as_of: "2026-10-24T22:20:00Z" }),
    row({ external_reservation_id: "r3", snapshot_as_of: "2026-10-20T22:00:00Z" }),
  ]);
  assert.equal(result.state, "snapshot");
  assert.equal(result.counts.observedScheduledArrivals, 2);
  assert.equal(result.sourceAsOf, "2026-10-24T22:00:00.000Z");
  assert.equal(result.coverage.staleRows, 1);
});
test("cancelled reservations are excluded; unrecognized status is disclosed", () => {
  const result = project([row(), row({ external_reservation_id: "r2", status: "Cancelada" }),
    row({ external_reservation_id: "r3", status: "WAIT" })]);
  assert.equal(result.counts.observedScheduledArrivals, 1);
  assert.equal(result.coverage.cancelledRows, 1);
  assert.equal(result.coverage.unknownStatusRows, 1);
});
test("observed zero is never a complete-property zero", () => {
  const result = project([row({ status: "Cancelada" })]);
  assert.equal(result.state, "snapshot");
  assert.equal(result.counts.observedScheduledArrivals, 0);
  assert.equal(result.coverage.totalArrivalsInProperty, null);
});
test("a missing mirror does not become a zero", () => {
  assert.equal(project([]).state, "unavailable");
  assert.equal(project([]).counts, null);
});
test("duplicate reservation identity fails instead of double counting", () => {
  const result = project([row(), row({ status: "Check-in" })]);
  assert.equal(result.state, "unavailable");
  assert.equal(result.reason, "duplicate_identity");
});
for (const changes of [{ org_id: "other" }, { property_id: "other" }]) {
  test(`scope mismatch fails the entire projection: ${JSON.stringify(changes)}`, () => {
    assert.equal(project([row(), row({ external_reservation_id: "r2", ...changes })]).state, "unavailable");
  });
}
test("report date is explicit and does not use the host UTC date", () => {
  const result = project([row({ snapshot_as_of: "2026-10-25T00:15:00Z", last_synced_at: "2026-10-25T00:16:00Z" })],
    { asOf: "2026-10-25T00:30:00Z", reportingDate: "2026-10-24" });
  assert.equal(result.counts.observedScheduledArrivals, 1);
  assert.equal(result.reportingDate, "2026-10-24");
});
test("truncated results disclose their bound", () => {
  const result = project([row()], { truncated: true });
  assert.equal(result.coverage.truncated, true);
  assert.equal(result.coverage.completeness, "unverified");
});
test("private payload and unknown breakfast are not converted into guest/service totals", () => {
  const result = project([row({ guest_name: "PRIVATE_SYNTHETIC_NAME", phone: "PRIVATE_SYNTHETIC_PHONE", breakfast_included: null })]);
  assert.equal(JSON.stringify(result).includes("PRIVATE_SYNTHETIC"), false);
  assert.equal("breakfasts" in result.counts, false);
});
test("malformed or future request date never produces a projection", () => {
  assert.equal(project([row()], { asOf: "invalid" }).state, "unavailable");
  assert.equal(project([row()], { reportingDate: "2026-02-30" }).state, "unavailable");
});
