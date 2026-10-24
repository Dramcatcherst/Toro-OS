import { describe, expect, it } from "vitest";
import { buildPreventiveWorklist, isDeliverableEmployeeAddress, nextVerifiedMaintenanceDue,
  prepareMaintenanceCalendarEvent, prepareMaintenanceDispatch, type MaintenanceWork,
  type ScopedMaintenanceBinding } from "./preventive-plan";

const scope = { orgId: "test-org", propertyId: "test-hotel" };
const now = "2026-10-21T12:00:00-06:00";
const work = (change: Partial<MaintenanceWork> = {}): MaintenanceWork => ({ ...scope,
  taskKey: "existing-preventive-task", assetId: "ac-synthetic-1", actionKey: "inspect-drain",
  period: "2026-11", assetLabel: "A/C de prueba", actionLabel: "Revisar drenaje", priority: "P1",
  ownerRole: "Mantenimiento", sourceRef: "synthetic-evidence", sourceAt: now, technicianRequired: false,
  staffSafe: true, closure: { state: "open" }, ...change });
const binding = (change: Partial<ScopedMaintenanceBinding> = {}): ScopedMaintenanceBinding => ({ ...scope,
  scope: "organization", privacy: "internal", healthCheckedAt: now,
  id: "synthetic-maintenance-group", channel: "whatsapp", provider: "openclaw", endpointKind: "group",
  businessRole: "room:maintenance", authStatus: "connected", ingestionStatus: "healthy",
  verificationStatus: "verified", sendEnabled: true, active: true, lastEventAt: now, ...change });
const dispatch = () => ({ ...scope, canonicalTaskKey: "existing-preventive-task", period: "2026-11",
  sourceCutoff: now, sourceRef: "synthetic-source", now, maxEvidenceAgeHours: 24,
  messageBudget: { maxFieldBytes: 1024, maxMessageBytes: 4096 },
  approvedRequestRef: "synthetic-owner-directive", runtime: { liveVerified: true,
    receiptRoundtripVerified: true, observedAt: now, evidenceRef: "synthetic-receipt-roundtrip" },
  work: [work()], bindings: [binding()], receipts: [] as Parameters<typeof prepareMaintenanceDispatch>[0]["receipts"] });
const calendar = () => ({ ...scope, work: work(), now, approvedRequestRef: "synthetic-owner-directive",
  calendar: { ...scope, id: "synthetic-calendar", ownerVerified: true, public: false },
  maxSourceAgeHours: 24,
  window: { start: "2026-10-22T09:00:00-06:00", end: "2026-10-22T09:30:00-06:00",
    receptionConfirmed: true, assigneeConfirmed: true, technicianConfirmed: true, evidenceRef: "synthetic-window" },
  kross: null as Parameters<typeof prepareMaintenanceCalendarEvent>[0]["kross"] });

describe("preventive maintenance worklist", () => {
  it("preserves P0 first and quarantines other properties", () => {
    const p = buildPreventiveWorklist(scope, [work(), work({ taskKey: "critical", assetId: "pool", priority: "P0" }),
      work({ taskKey: "other-hotel", propertyId: "other" })], now);
    expect(p.items.map((w) => w.taskKey)).toEqual(["critical", "existing-preventive-task"]);
    expect(p.excluded).toContainEqual({ taskKey: null, reason: "scope_mismatch" });
    expect(JSON.stringify(p)).not.toContain("other-hotel");
  });
  it("deduplicates equivalent cases independently of input order", () => {
    const a = work({ taskKey: "a" }), b = work({ taskKey: "b" });
    expect(buildPreventiveWorklist(scope, [a, b], now)).toEqual(buildPreventiveWorklist(scope, [b, a], now));
    expect(buildPreventiveWorklist(scope, [a, b], now).items).toHaveLength(1);
  });
  it("quarantines contradictory closures instead of choosing the first row", () => {
    const p = buildPreventiveWorklist(scope, [work(), work({ taskKey: "conflicting", closure: { state: "reported_resolved" } })], now);
    expect(p.items).toHaveLength(0);
    expect(p.conflicts).toHaveLength(1);
    expect(p.conflicts[0].priority).toBe("P1");
  });
  it("excludes verified physical closure but keeps a legitimate new period", () => {
    const closed = work({ closure: { state: "verified_closed", verifiedAt: now, evidenceRef: "functional-test", functionalTestPassed: true } });
    const p = buildPreventiveWorklist(scope, [closed, work({ taskKey: "next-period", period: "2026-12" })], now);
    expect(p.items.map((w) => w.taskKey)).toEqual(["next-period"]);
    expect(p.excluded).toContainEqual({ taskKey: closed.taskKey, reason: "verified_closed" });
  });
  it.each([
    { state: "reported_resolved" as const },
    { state: "verified_closed" as const, verifiedAt: now, evidenceRef: "invoice-only" },
    { state: "verified_closed" as const, verifiedAt: "2026-12-01T12:00:00Z", evidenceRef: "future", functionalTestPassed: true },
  ])("requests closure verification instead of redoing reported work: %j", (closure) => {
    const p = buildPreventiveWorklist(scope, [work({ closure })], now);
    expect(p.items[0].reviewClosure).toBe(true);
  });
  it("does not turn historical or identity-less records into current work", () => {
    const p = buildPreventiveWorklist(scope, [work({ closure: { state: "historical" } }), work({ assetId: "" })], now);
    expect(p.items).toEqual([]);
    expect(p.excluded.map((w) => w.reason).sort()).toEqual(["historical", "identity_or_source_missing"]);
  });
});

describe("next verified service date and employee delivery", () => {
  const service = { lastServiceDate: "2026-10-01", serviceVerified: true, intervalDays: 31,
    intervalApproved: true, manualRef: "synthetic-manual", today: "2026-10-21" };
  it("calculates next service from verified service plus approved interval", () => {
    expect(nextVerifiedMaintenanceDue(service)).toBe("2026-11-01");
  });
  it.each([
    { serviceVerified: false }, { intervalApproved: false }, { manualRef: "" },
    { intervalDays: 0 }, { intervalDays: 1.5 }, { lastServiceDate: "2026-02-30" },
    { lastServiceDate: "2026-11-01" }, { today: "invalid" },
  ])("never invents a due date when evidence is incomplete: %j", (change) => {
    expect(nextVerifiedMaintenanceDue({ ...service, ...change })).toBeNull();
  });
  it("rejects internal aliases even when Auth marked the address confirmed", () => {
    expect(isDeliverableEmployeeAddress({ activeEmployee: true, emailVerified: true, email: "worker@dreamteam.internal" })).toBe(false);
    expect(isDeliverableEmployeeAddress({ activeEmployee: true, emailVerified: true, email: "worker@example.com" })).toBe(false);
    expect(isDeliverableEmployeeAddress({ activeEmployee: true, emailVerified: true, email: "worker@hotel.test" })).toBe(false);
    expect(isDeliverableEmployeeAddress({ activeEmployee: true, emailVerified: true, email: "worker@hotel.co.cr" })).toBe(true);
  });
  it("does not share with an offboarded or unverified employee", () => {
    expect(isDeliverableEmployeeAddress({ activeEmployee: false, emailVerified: true, email: "worker@hotel.co.cr" })).toBe(false);
    expect(isDeliverableEmployeeAddress({ activeEmployee: true, emailVerified: false, email: "worker@hotel.co.cr" })).toBe(false);
  });
});

describe("OpenClaw maintenance preparation", () => {
  it("prepares the existing maintenance group route with zero side effects", () => {
    const p = prepareMaintenanceDispatch(dispatch());
    expect(p.status).toBe("ready");
    expect(p.destinationBindingId).toBe("synthetic-maintenance-group");
    expect(p.message).toContain("Revisar drenaje");
    expect(p.sendsPerformed).toBe(0);
  });
  it.each([
    { endpointKind: "phone" }, { businessRole: "room:management" }, { propertyId: "another-hotel" },
    { healthCheckedAt: "2026-09-01T12:00:00Z" }, { sendEnabled: false },
    { scope: "private" as const }, { orgId: "other-org" },
  ])("does not fall back to a phone, another group, stale route or property: %j", (change) => {
    expect(prepareMaintenanceDispatch({ ...dispatch(), bindings: [binding(change)] }).status).toBe("blocked");
  });
  it("requires current runtime and provider receipt roundtrip evidence", () => {
    const i = dispatch(); i.runtime.receiptRoundtripVerified = false;
    expect(prepareMaintenanceDispatch(i).blockers).toContain("runtime_not_verified_current");
    i.runtime.receiptRoundtripVerified = true; i.runtime.observedAt = "2027-01-01T00:00:00Z";
    expect(prepareMaintenanceDispatch(i).status).toBe("blocked");
  });
  it("accepts a fresh health probe without inventing recent message traffic", () => {
    expect(prepareMaintenanceDispatch({ ...dispatch(), bindings: [binding({ lastEventAt: null })] }).status).toBe("ready");
    expect(prepareMaintenanceDispatch({ ...dispatch(), bindings: [binding({ healthCheckedAt: null })] }).status).toBe("blocked");
  });
  it("applies the caller byte budget to the complete message including maintenance details", () => {
    const i = dispatch();
    const full = prepareMaintenanceDispatch(i).message;
    const budget = Buffer.byteLength(full.split("\n").slice(0, -1).join("\n"), "utf8") + 1;
    expect(Buffer.byteLength(full, "utf8")).toBeGreaterThan(budget);
    const p = prepareMaintenanceDispatch({ ...i, messageBudget: { maxFieldBytes: 200, maxMessageBytes: budget } });
    expect(p.status).toBe("blocked");
    expect(p.blockers).toContain("alert_message_budget_exceeded");
    expect(p.message).toBe("");
  });
  it("requires explicit send authorization and current source data", () => {
    expect(prepareMaintenanceDispatch({ ...dispatch(), approvedRequestRef: null }).blockers).toContain("send_authorization_missing");
    expect(prepareMaintenanceDispatch({ ...dispatch(), sourceCutoff: "2026-01-01T00:00:00Z" }).blockers).toContain("source_not_current");
  });
  it.each(["sent", "delivered", "unknown", "failed"] as const)("does not resend a receipt state %s blindly", (state) => {
    const i = dispatch(); const first = prepareMaintenanceDispatch(i);
    i.receipts = [{ dedupeKey: first.dedupeKey, state }];
    const replay = prepareMaintenanceDispatch(i);
    expect(replay.status).toBe("blocked");
    expect(replay.blockers).toContain(["sent", "delivered"].includes(state) ? "already_sent" : "provider_receipt_reconciliation_required");
  });
  it("changes identity for material work changes and for a different period", () => {
    const i = dispatch(), initial = prepareMaintenanceDispatch(i).dedupeKey;
    expect(prepareMaintenanceDispatch({ ...i, period: "2026-12" }).dedupeKey).not.toBe(initial);
    expect(prepareMaintenanceDispatch({ ...i, work: [work({ priority: "P0" })] }).dedupeKey).not.toBe(initial);
  });
  it("blocks an unreviewed staff projection and does not copy its detail into the message", () => {
    const p = prepareMaintenanceDispatch({ ...dispatch(), work: [work({ staffSafe: false, actionLabel: "private-detail" })] });
    expect(p.blockers).toContain("staff_safe_projection_required");
    expect(p.message).not.toContain("private-detail");
  });
});

describe("maintenance calendar projection and Kross boundary", () => {
  it("prepares a confirmed common-area window without PMS mutation", () => {
    const p = prepareMaintenanceCalendarEvent(calendar());
    expect(p.status).toBe("ready");
    expect(p.event?.transparency).toBe("transparent");
    expect(p.calendarWritesPerformed).toBe(0);
    expect(p.pmsWritesPerformed).toBe(0);
    expect(p.eventId).toMatch(/^[a-f0-9]{64}$/);
  });
  it("keeps the same event identity when rescheduled", () => {
    const i = calendar(), first = prepareMaintenanceCalendarEvent(i);
    i.window.start = "2026-10-23T09:00:00-06:00"; i.window.end = "2026-10-23T09:30:00-06:00";
    expect(prepareMaintenanceCalendarEvent(i).eventId).toBe(first.eventId);
  });
  it("rejects public calendars, wrong property and unconfirmed windows", () => {
    const i = calendar(); i.calendar.public = true; i.window.receptionConfirmed = false; i.work.propertyId = "another-hotel";
    expect(prepareMaintenanceCalendarEvent(i).blockers).toEqual(expect.arrayContaining([
      "private_owned_calendar_required", "confirmed_future_window_required", "scope_mismatch",
    ]));
    expect(prepareMaintenanceCalendarEvent(i).event).toBeNull();
  });
  it("blocks a room intervention when maintenance data or live Kross evidence is missing", () => {
    const i = calendar(); i.work.roomKey = "verified-synthetic-room";
    expect(prepareMaintenanceCalendarEvent(i).blockers).toContain("kross_room_window_not_verified");
    i.kross = { ...scope, roomKey: i.work.roomKey, readOnly: true, liveVerified: true, maintenanceReadVerified: false,
      validUntil: "2026-10-23T00:00:00Z", mappingVerified: true, windowApproved: true, evidenceRef: "synthetic-kross-read" };
    expect(prepareMaintenanceCalendarEvent(i).status).toBe("blocked");
    i.kross.maintenanceReadVerified = true;
    expect(prepareMaintenanceCalendarEvent(i).status).toBe("ready");
  });
  it("does not accept a different or historical Kross room mapping", () => {
    const i = calendar(); i.work.roomKey = "room-current";
    i.kross = { ...scope, roomKey: "room-historical", readOnly: true, liveVerified: true, maintenanceReadVerified: true,
      validUntil: "2026-10-23T00:00:00Z", mappingVerified: true, windowApproved: true, evidenceRef: "synthetic-kross-read" };
    expect(prepareMaintenanceCalendarEvent(i).status).toBe("blocked");
  });
  it("rejects stale physical context, unconfirmed staff and unconfirmed technicians", () => {
    const i = calendar(); i.work.sourceAt = "2026-01-01T00:00:00Z";
    i.work.technicianRequired = true; i.window.technicianConfirmed = false; i.window.assigneeConfirmed = false;
    expect(prepareMaintenanceCalendarEvent(i).blockers).toEqual(expect.arrayContaining([
      "source_not_current", "technician_confirmation_required", "confirmed_future_window_required",
    ]));
  });
  it("rejects timestamps without timezone and impossible dates", () => {
    const i = calendar(); i.window.start = "2026-10-22T09:00:00";
    expect(prepareMaintenanceCalendarEvent(i).status).toBe("blocked");
    i.window.start = "2026-02-30T09:00:00Z";
    expect(prepareMaintenanceCalendarEvent(i).status).toBe("blocked");
  });
});
