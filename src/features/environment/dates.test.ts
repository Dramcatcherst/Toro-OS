import { expect, it } from "vitest";
import { projectDates } from "./dates";
const scope = { orgId: "qa", propertyId: "qa-place" };
const now = Date.parse("2026-10-12T06:30:00Z");
const event = { org_id: scope.orgId, property_id: scope.propertyId,
  event_key: "qa-event", name_es: "QA", starts_on: "2026-10-11", ends_on: "2026-10-13",
  status: "active", verified_status: "verified", publish_status: "published", public_visibility: true,
  requires_human_verification: false, expires_at: "2026-10-13", last_verified: "2026-10-10", next_review: "2026-10-13" };
const holiday = { id: "qa-date", org_id: scope.orgId, employee_id: null, deleted_at: null,
  status: "active", data: { date: "2026-10-15", name: "QA holiday", payroll_secret: "never render" } };
it("includes ongoing events and minimizes holiday output", () => {
  const result = projectDates([event], [holiday], scope, now);
  expect(result).toHaveLength(2);
  expect(JSON.stringify(result)).not.toContain("payroll_secret");
});
it("excludes foreign-scope and employee-linked private dates", () => {
  expect(projectDates([{ ...event, org_id: "other" }], [{ ...holiday, employee_id: "private" }], scope, now)).toEqual([]);
});
it("excludes unverified, expired, unpublished and overdue-review events", () => {
  for (const patch of [{ verified_status: "candidate" }, { expires_at: "2026-10-11" },
    { publish_status: "draft" }, { next_review: "2026-10-11" }, { property_id: "other" }])
    expect(projectDates([{ ...event, ...patch }], [], scope, now)).toEqual([]);
});
it("excludes ambiguous duplicates and invalid source dates", () => {
  expect(projectDates([event, event], [{ ...holiday, data: { date: "2026-02-31", name: "bad" } }], scope, now)).toEqual([]);
});
