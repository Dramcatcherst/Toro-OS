import { createHash } from "node:crypto";
import { prepareAlertDelivery, type WhatsAppGroupBinding } from "@/features/comms/alert-delivery";

// Preparation only. Existing control-plane workers own writes, sends and receipts.
export type MaintenanceScope = { orgId: string; propertyId: string };
export type MaintenanceWork = MaintenanceScope & {
  taskKey: string;
  assetId: string;
  actionKey: string;
  period: string;
  assetLabel: string;
  actionLabel: string;
  priority: "P0" | "P1" | "P2" | "P3";
  ownerRole: string;
  sourceRef: string;
  sourceAt: string;
  technicianRequired: boolean;
  staffSafe: boolean;
  roomKey?: string;
  closure: {
    state: "open" | "reported_resolved" | "verified_closed" | "historical";
    verifiedAt?: string;
    evidenceRef?: string;
    functionalTestPassed?: boolean;
  };
};

const text = (value: string | undefined) => Boolean(value?.trim());
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sameScope = (a: MaintenanceScope, b: MaintenanceScope) =>
  Boolean(a.orgId && a.propertyId && a.orgId === b.orgId && a.propertyId === b.propertyId);
const dated = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
  new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const instant = (value: string | undefined) =>
  value && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && dated(value.slice(0, 10)) ? Date.parse(value) : NaN;
const identity = (w: MaintenanceWork) => [w.orgId, w.propertyId, w.assetId, w.actionKey, w.period];
const rank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const line = (value: string) => value.replace(/\s+/g, " ").trim();

export function buildPreventiveWorklist(scope: MaintenanceScope, work: MaintenanceWork[], now: string) {
  const nowMs = instant(now);
  if (!Number.isFinite(nowMs)) throw new Error("An explicit current timestamp with timezone is required.");
  const groups = new Map<string, MaintenanceWork[]>();
  const excluded: { taskKey: string | null; reason: string }[] = [];
  for (const w of work) {
    if (!sameScope(scope, w)) { excluded.push({ taskKey: null, reason: "scope_mismatch" }); continue; }
    if (![w.taskKey, w.assetId, w.actionKey, w.period, w.assetLabel, w.actionLabel, w.ownerRole, w.sourceRef].every(text) ||
      !Number.isFinite(instant(w.sourceAt)) || instant(w.sourceAt) > nowMs) {
      excluded.push({ taskKey: w.taskKey, reason: "identity_or_source_missing" }); continue;
    }
    const key = digest(identity(w));
    groups.set(key, [...(groups.get(key) ?? []), w]);
  }
  const conflicts: { identity: string; taskKeys: string[]; priority: MaintenanceWork["priority"] }[] = [];
  const items: (MaintenanceWork & { reviewClosure: boolean })[] = [];
  for (const [key, entries] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    const sorted = [...entries].sort((a, b) => a.taskKey.localeCompare(b.taskKey));
    const w = sorted[0];
    // Do not pick an open/closed state or owner merely because that row arrived first.
    const payload = (x: MaintenanceWork) => [x.assetLabel, x.actionLabel, x.priority, x.ownerRole,
      x.sourceRef, x.sourceAt, x.technicianRequired, x.staffSafe, x.roomKey ?? null, x.closure.state,
      x.closure.verifiedAt ?? null, x.closure.evidenceRef ?? null, x.closure.functionalTestPassed ?? false];
    if (new Set(sorted.map((x) => digest(payload(x)))).size !== 1) {
      conflicts.push({ identity: key, taskKeys: sorted.map((x) => x.taskKey),
        priority: sorted.reduce((p, x) => rank[x.priority] < rank[p] ? x.priority : p, w.priority) });
      continue;
    }
    sorted.slice(1).forEach((x) => excluded.push({ taskKey: x.taskKey, reason: "equivalent_duplicate" }));
    if (w.closure.state === "historical") {
      excluded.push({ taskKey: w.taskKey, reason: "historical" }); continue;
    }
    const closedAt = instant(w.closure.verifiedAt);
    const verified = w.closure.state === "verified_closed" && Number.isFinite(closedAt) &&
      closedAt <= nowMs && text(w.closure.evidenceRef) && w.closure.functionalTestPassed === true;
    if (verified) { excluded.push({ taskKey: w.taskKey, reason: "verified_closed" }); continue; }
    items.push({ ...w, reviewClosure: w.closure.state !== "open" });
  }
  items.sort((a, b) => rank[a.priority] - rank[b.priority] || a.taskKey.localeCompare(b.taskKey));
  return { items, conflicts, excluded, fingerprint: digest(items.map((w) => [identity(w),
    w.priority, w.ownerRole, w.assetLabel, w.actionLabel, w.sourceRef, w.reviewClosure, w.technicianRequired])) };
}

export function nextVerifiedMaintenanceDue(input: {
  lastServiceDate: string; serviceVerified: boolean; intervalDays: number;
  intervalApproved: boolean; manualRef: string; today: string;
}) {
  if (!input.serviceVerified || !input.intervalApproved || !text(input.manualRef) ||
    !dated(input.today) || !dated(input.lastServiceDate) || input.lastServiceDate > input.today ||
    !Number.isSafeInteger(input.intervalDays) || input.intervalDays <= 0) return null;
  const date = new Date(`${input.lastServiceDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + input.intervalDays);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function isDeliverableEmployeeAddress(input: {
  activeEmployee: boolean; emailVerified: boolean; email: string;
}) {
  return input.activeEmployee && input.emailVerified &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) &&
    !/\.(?:internal|invalid|test|localhost)$/i.test(input.email) &&
    !/@(?:[^@.]+\.)*example\.(?:com|net|org)$/i.test(input.email);
}

export type ScopedMaintenanceBinding = WhatsAppGroupBinding & MaintenanceScope;
export function prepareMaintenanceDispatch(input: MaintenanceScope & {
  canonicalTaskKey: string; period: string; sourceCutoff: string; sourceRef: string;
  now: string; maxEvidenceAgeHours: number; approvedRequestRef: string | null;
  runtime: { liveVerified: boolean; receiptRoundtripVerified: boolean; observedAt: string; evidenceRef: string };
  work: MaintenanceWork[]; bindings: ScopedMaintenanceBinding[];
  receipts: { dedupeKey: string; state: "sent" | "delivered" | "unknown" | "failed" }[];
}) {
  const plan = buildPreventiveWorklist(input, input.work, input.now);
  const blockers: string[] = [];
  const nowMs = instant(input.now);
  const maxAge = input.maxEvidenceAgeHours * 3_600_000;
  const recent = (at: string) => Number.isFinite(instant(at)) && instant(at) <= nowMs && nowMs - instant(at) <= maxAge;
  if (!text(input.approvedRequestRef ?? undefined)) blockers.push("send_authorization_missing");
  if (!text(input.canonicalTaskKey) || !text(input.period) || !text(input.sourceRef)) blockers.push("canonical_source_missing");
  if (!(Number.isFinite(maxAge) && maxAge > 0) || !recent(input.sourceCutoff)) blockers.push("source_not_current");
  if (!input.runtime.liveVerified || !input.runtime.receiptRoundtripVerified ||
    !text(input.runtime.evidenceRef) || !recent(input.runtime.observedAt)) blockers.push("runtime_not_verified_current");
  if (plan.conflicts.length) blockers.push("work_identity_conflict");
  if (plan.items.some((w) => !w.staffSafe)) blockers.push("staff_safe_projection_required");
  if (plan.items.length === 0) blockers.push("no_pending_work");
  const bindings = input.bindings.filter((b) => sameScope(input, b) && b.lastEventAt && recent(b.lastEventAt));
  const candidate = prepareAlertDelivery({
    sourceKind: "module_alert", sourceKey: digest([input.orgId, input.propertyId, input.canonicalTaskKey, input.period]),
    version: plan.fingerprint, room: "maintenance", privacy: "internal",
    priority: plan.items.some((w) => w.priority === "P0") ? "critical" : plan.items.some((w) => w.priority === "P1") ? "high" : "normal",
    title: `Plan preventivo · ${input.period}`, summary: `${plan.items.length} intervenciones o verificaciones pendientes`,
    impact: "Piscinas, jacuzzis y climatización; prioridad por seguridad y servicio",
    requiredAction: "Confirmar responsable y ventana; adjuntar prueba de cierre",
    owner: "Mantenimiento", dueAt: "Según plan y ventanas confirmadas", sourceSystem: "TORO Operations",
    sourceCutoff: input.sourceCutoff, sourceRef: input.sourceRef,
  }, bindings);
  blockers.push(...candidate.blockers);
  const prior = input.receipts.filter((r) => r.dedupeKey === candidate.dedupeKey);
  if (prior.length) blockers.push(prior.every((r) => r.state === "sent" || r.state === "delivered") ? "already_sent" : "provider_receipt_reconciliation_required");
  const details = plan.items.filter((w) => w.staffSafe).slice(0, 8).map((w) =>
    `${w.priority} · ${line(w.assetLabel).slice(0, 60)} · ${w.reviewClosure ? "Verificar cierre" : line(w.actionLabel).slice(0, 70)} · ${line(w.ownerRole).slice(0, 45)}${w.technicianRequired ? " · TÉCNICO" : ""}`);
  return { ...candidate, status: blockers.length ? "blocked" as const : "ready" as const,
    blockers: [...new Set(blockers)], plan,
    message: [candidate.message, ...details, ...(plan.items.length > 8 ? [`+${plan.items.length - 8} casos en el plan canónico`] : [])].join("\n"),
    sendsPerformed: 0 as const };
}

export function prepareMaintenanceCalendarEvent(input: MaintenanceScope & {
  work: MaintenanceWork; now: string; approvedRequestRef: string | null;
  calendar: MaintenanceScope & { id: string; ownerVerified: boolean; public: boolean };
  maxSourceAgeHours: number;
  window: { start: string; end: string; receptionConfirmed: boolean; assigneeConfirmed: boolean;
    technicianConfirmed?: boolean; evidenceRef: string };
  kross: MaintenanceScope & { readOnly: boolean; liveVerified: boolean; maintenanceReadVerified: boolean;
    validUntil: string; roomKey: string; mappingVerified: boolean; windowApproved: boolean; evidenceRef: string } | null;
}) {
  const blockers: string[] = [];
  const now = instant(input.now), start = instant(input.window.start), end = instant(input.window.end);
  if (!Number.isFinite(now)) blockers.push("current_timestamp_invalid");
  if (!sameScope(input, input.work) || !sameScope(input, input.calendar)) blockers.push("scope_mismatch");
  if (![input.work.taskKey, input.work.assetId, input.work.actionKey, input.work.period, input.work.sourceRef].every(text)) blockers.push("canonical_work_identity_missing");
  if (!text(input.approvedRequestRef ?? undefined)) blockers.push("calendar_authorization_missing");
  if (!input.calendar.ownerVerified || !text(input.calendar.id) || input.calendar.public) blockers.push("private_owned_calendar_required");
  if (!input.work.staffSafe) blockers.push("staff_safe_projection_required");
  const sourceAge = now - instant(input.work.sourceAt);
  if (!Number.isFinite(sourceAge) || sourceAge < 0 || !Number.isFinite(input.maxSourceAgeHours) ||
    input.maxSourceAgeHours <= 0 || sourceAge > input.maxSourceAgeHours * 3_600_000) blockers.push("source_not_current");
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || start < now ||
    !input.window.receptionConfirmed || !input.window.assigneeConfirmed || !text(input.window.evidenceRef)) blockers.push("confirmed_future_window_required");
  if (input.work.technicianRequired && !input.window.technicianConfirmed) blockers.push("technician_confirmation_required");
  if (input.work.closure.state !== "open") blockers.push("closure_review_before_scheduling");
  if (input.work.roomKey) {
    const k = input.kross;
    if (!k || !sameScope(input, k) || !k.readOnly || !k.liveVerified || !k.maintenanceReadVerified ||
      !k.mappingVerified || k.roomKey !== input.work.roomKey || !k.windowApproved ||
      !text(k.evidenceRef) || !(instant(k.validUntil) >= end && instant(k.validUntil) >= now)) {
      blockers.push("kross_room_window_not_verified");
    }
  }
  return { status: blockers.length ? "blocked" as const : "ready" as const, blockers,
    // Stable across rescheduling: update the existing event, never create another copy.
    eventId: digest([input.calendar.id, ...identity(input.work)]),
    calendarId: input.calendar.id,
    event: blockers.length ? null : { summary: `${input.work.priority} · ${line(input.work.assetLabel)} · ${line(input.work.actionLabel)}`,
      start: input.window.start, end: input.window.end, transparency: "transparent" as const,
      description: `Responsable: ${line(input.work.ownerRole)}\nIntervención técnica: ${input.work.technicianRequired ? "Sí" : "Según diagnóstico"}\nCaso: ${input.work.taskKey}\nFuente: ${input.work.sourceRef}\nVentana: ${input.window.evidenceRef}\nProgramado no significa realizado. Kross conserva la autoridad comercial.` },
    pmsWritesPerformed: 0 as const, calendarWritesPerformed: 0 as const };
}
