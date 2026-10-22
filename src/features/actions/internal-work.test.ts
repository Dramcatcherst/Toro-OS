import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";

import {
  buildToroInternalTaskDraft,
  canCreateToroInternalWork,
  isExactToroInternalTaskReplay,
  validateToroInternalWorkRequest,
} from "./internal-work";

function context(
  roles: ToroResolvedContext["membership"] extends infer T
    ? T extends { roles: infer R }
      ? R
      : never
    : never,
  workArea = "Gerencia",
): ToroResolvedContext {
  return {
    userId: "user-1",
    email: null,
    displayName: "Mauricio",
    mode: "organization",
    orgId: "org-1",
    membership: {
      orgId: "org-1",
      membershipId: null,
      membershipType: "owner",
      status: "active",
      roles: roles as NonNullable<ToroResolvedContext["membership"]>["roles"],
      employeeId: "employee-1",
      employeePreferredName: "Mau",
      positionId: null,
      positionCode: "OWNER",
      positionName: "Owner",
      workArea,
      source: "legacy_user_roles",
    },
    availableOrgIds: ["org-1"],
    allowedDataScopes: ["work_org"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

describe("validateToroInternalWorkRequest", () => {
  it("accepts a bounded maintenance task", () => {
    const result = validateToroInternalWorkRequest({
      action: "maintenance.task",
      title: "Revisar fuga del jacuzzi",
      priority: "high",
      idempotencyKey: "wa:msg_123456",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.priority).toBe("high");
      expect(result.value.projectKey).toBeNull();
    }
  });

  it("requires projectKey for project follow-up", () => {
    const result = validateToroInternalWorkRequest({
      action: "project.followup",
      title: "Revisar bloqueo del portal",
      idempotencyKey: "wa:msg_123457",
    });

    expect(result).toEqual({
      ok: false,
      error: "project.followup requires projectKey.",
    });
  });

  it("rejects malformed idempotency keys", () => {
    const result = validateToroInternalWorkRequest({
      action: "task.create",
      title: "Tarea válida",
      idempotencyKey: "x",
    });

    expect(result.ok).toBe(false);
  });

  it.each([
    { projectKey: 42 }, { projectKey: "x".repeat(129) },
    { dueDate: true }, { dueDate: "2026-02-31" }, { dueDate: "2026-02-29" }, { dueDate: "2026-04-31" },
    { priority: ["critical"] }, { priority: "x".repeat(17) },
  ])("rejects present invalid intake fields rather than losing intent: %j", (change) => {
    expect(validateToroInternalWorkRequest({
      action: "task.create", title: "Review fixture task", idempotencyKey: "fixture:request:0001", ...change,
    }).ok).toBe(false);
  });

  it("allows optional omissions and a real leap day", () => {
    const result = validateToroInternalWorkRequest({
      action: "task.create", title: "Review fixture task", idempotencyKey: "fixture:request:0001",
      dueDate: "2028-02-29", projectKey: null,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toMatchObject({ priority: "medium", projectKey: null, dueDate: "2028-02-29" });
  });
});

describe("canCreateToroInternalWork", () => {
  it("allows ADMIN and GERENCIA only in the initial controlled-write slice", () => {
    expect(canCreateToroInternalWork(context(["ADMIN"]))).toBe(true);
    expect(canCreateToroInternalWork(context(["GERENCIA"]))).toBe(true);
    expect(canCreateToroInternalWork(context(["EMPLEADO"]))).toBe(false);
  });
});

describe("buildToroInternalTaskDraft", () => {
  it("routes maintenance to RICO and the canonical operations module", () => {
    const parsed = validateToroInternalWorkRequest({
      action: "maintenance.task",
      title: "Revisar A/C habitación 26",
      description: "No enfría correctamente.",
      priority: "high",
      dueDate: "2026-09-24",
      idempotencyKey: "wa:maintenance_0001",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const draft = buildToroInternalTaskDraft({
      request: parsed.value,
      context: context(["ADMIN"]),
      nowIso: "2026-09-23T23:00:00.000Z",
    });

    expect(draft).toMatchObject({
      task_key: "toro_intake:wa:maintenance_0001",
      category: "operations",
      area: "Maintenance",
      canonical_module_key: "toro_operations",
      module_lead: "RICO",
      owner_name: "Mau",
      status: "planned",
    });
  });

  it("routes builder work to SOBRESITO/CODEX and can link a project", () => {
    const parsed = validateToroInternalWorkRequest({
      action: "builder.task",
      title: "Añadir seguimiento de deploy",
      projectKey: "toro_os_portfolio_master",
      idempotencyKey: "wa:builder_000001",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const draft = buildToroInternalTaskDraft({
      request: parsed.value,
      context: context(["ADMIN"]),
      projectId: "project-1",
      nowIso: "2026-09-23T23:00:00.000Z",
    });

    expect(draft).toMatchObject({
      project_id: "project-1",
      area: "Systems",
      canonical_module_key: "toro_builder",
      module_lead: "SOBRESITO/CODEX",
    });
  });
});

describe("isExactToroInternalTaskReplay", () => {
  function draft(overrides: {
    priority?: "medium" | "high" | "critical";
    dueDate?: string | null;
    description?: string;
    nowIso?: string;
  } = {}) {
    const parsed = validateToroInternalWorkRequest({
      action: "maintenance.task",
      title: "Revisar incidencia de huésped",
      description: overrides.description ?? "Contact consent: unknown",
      priority: overrides.priority ?? "medium",
      dueDate: overrides.dueDate ?? "2026-10-20",
      idempotencyKey: "guest:survey:case_0001",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error(parsed.error);
    return buildToroInternalTaskDraft({
      request: parsed.value,
      context: context(["ADMIN"]),
      nowIso: overrides.nowIso ?? "2026-10-18T06:00:00.000Z",
    });
  }

  it("accepts an exact replay even when the new draft has a different creation time", () => {
    expect(
      isExactToroInternalTaskReplay(
        draft(),
        draft({ nowIso: "2026-10-18T07:00:00.000Z" }),
      ),
    ).toBe(true);
  });

  it("rejects a replay when the effective work area differs", () => {
    const parsed = validateToroInternalWorkRequest({
      action: "task.create",
      title: "Revisar incidencia de huésped",
      description: "Contact consent: unknown",
      priority: "medium",
      dueDate: "2026-10-20",
      idempotencyKey: "guest:survey:case_0001",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const existing = buildToroInternalTaskDraft({
      request: parsed.value,
      context: context(["ADMIN"], "Gerencia"),
      nowIso: "2026-10-18T06:00:00.000Z",
    });
    const retry = buildToroInternalTaskDraft({
      request: parsed.value,
      context: context(["GERENCIA"], "Guest Experience"),
      nowIso: "2026-10-18T07:00:00.000Z",
    });

    expect(retry.area).not.toBe(existing.area);
    expect(isExactToroInternalTaskReplay(existing, retry)).toBe(false);
  });

  it("rejects a replay whose caller-independent route changed", () => {
    const request = {
      title: "Revisar incidencia de huésped",
      description: "Contact consent: unknown",
      priority: "medium" as const,
      dueDate: "2026-10-20",
      idempotencyKey: "guest:survey:case_0001",
    };
    const general = validateToroInternalWorkRequest({
      ...request,
      action: "task.create",
    });
    const maintenance = validateToroInternalWorkRequest({
      ...request,
      action: "maintenance.task",
    });
    expect(general.ok).toBe(true);
    expect(maintenance.ok).toBe(true);
    if (!general.ok || !maintenance.ok) return;

    const existing = buildToroInternalTaskDraft({
      request: general.value,
      context: context(["ADMIN"], "Maintenance"),
      nowIso: "2026-10-18T06:00:00.000Z",
    });
    const retry = buildToroInternalTaskDraft({
      request: maintenance.value,
      context: context(["ADMIN"], "Maintenance"),
      nowIso: "2026-10-18T07:00:00.000Z",
    });

    expect(existing.category).toBe(retry.category);
    expect(existing.area).toBe(retry.area);
    expect(existing.canonical_module_key).toBe(retry.canonical_module_key);
    expect(existing.module_lead).not.toBe(retry.module_lead);
    expect(isExactToroInternalTaskReplay(existing, retry)).toBe(false);
  });

  it("rejects a replay whose priority became stricter", () => {
    expect(
      isExactToroInternalTaskReplay(
        draft({ priority: "medium" }),
        draft({ priority: "critical" }),
      ),
    ).toBe(false);
  });

  it("rejects a replay whose due date moved earlier", () => {
    expect(
      isExactToroInternalTaskReplay(
        draft({ dueDate: "2026-10-20" }),
        draft({ dueDate: "2026-10-18" }),
      ),
    ).toBe(false);
  });

  it("rejects a replay whose persisted consent description changed", () => {
    expect(
      isExactToroInternalTaskReplay(
        draft({ description: "Contact consent: unknown" }),
        draft({ description: "Contact consent: granted" }),
      ),
    ).toBe(false);
  });
});
