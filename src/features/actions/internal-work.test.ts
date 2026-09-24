import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";

import {
  buildToroInternalTaskDraft,
  canCreateToroInternalWork,
  validateToroInternalWorkRequest,
} from "./internal-work";

function context(
  roles: ToroResolvedContext["membership"] extends infer T
    ? T extends { roles: infer R }
      ? R
      : never
    : never,
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
      workArea: "Gerencia",
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
