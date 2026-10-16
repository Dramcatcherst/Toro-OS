import { describe, expect, it } from "vitest";

import {
  compareEffectiveProfileReceipts,
  compileEffectiveProfile,
  type EffectiveProfileInput,
} from "./effective-profile";

const NOW = "2026-10-14T12:00:00.000Z";

function input(overrides: Partial<EffectiveProfileInput> = {}): EffectiveProfileInput {
  return {
    subject: { kind: "person", key: "mauricio_owner" },
    binding: {
      subject: { kind: "person", key: "mauricio_owner" },
      status: "verified",
      channelAccountKey: "owner-private",
      organizationId: "dreamcatcher",
      propertyIds: ["main-property"],
      verifiedAt: "2026-10-14T10:00:00.000Z",
      expiresAt: "2026-11-14T10:00:00.000Z",
      deviceKey: "owner-device",
      deviceStatus: "verified",
      deviceExpiresAt: "2026-11-14T10:00:00.000Z",
    },
    authority: {
      subject: { kind: "person", key: "mauricio_owner" },
      active: true,
      organizationId: "dreamcatcher",
      propertyIds: ["main-property"],
      roleProfile: "owner_executive",
      allowedDataScopes: ["work_org", "system"],
      capabilityIds: ["people.employee_records", "operations.read"],
      peopleAssistantAuthorized: true,
    },
    now: NOW,
    ...overrides,
  };
}

describe("compileEffectiveProfile", () => {
  it("compiles a verified individual while preserving runtime authority exactly", () => {
    const result = compileEffectiveProfile(input());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile).toMatchObject({
      addressName: "Mau",
      roleProfile: "owner_executive",
      peopleAssistantAllowed: true,
      allowedDataScopes: ["system", "work_org"],
      capabilityIds: ["operations.read", "people.employee_records"],
    });
    expect(result.profile.receipt.profileHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("keeps Ana gated by both individual allowlist and runtime authority", () => {
    const base = input({
      subject: { kind: "person", key: "ana_carolina_admin" },
      binding: {
        ...input().binding,
        subject: { kind: "person", key: "ana_carolina_admin" },
      },
      authority: {
        ...input().authority,
        subject: { kind: "person", key: "ana_carolina_admin" },
        roleProfile: "hr_people",
        peopleAssistantAuthorized: false,
      },
    });
    const denied = compileEffectiveProfile(base);
    expect(denied.ok && denied.profile.peopleAssistantAllowed).toBe(false);
    const allowed = compileEffectiveProfile({
      ...base,
      authority: { ...base.authority, peopleAssistantAuthorized: true },
    });
    expect(allowed.ok && allowed.profile.peopleAssistantAllowed).toBe(true);
    if (allowed.ok) expect(allowed.profile.nameConfirmationRequired).toBe(true);
  });

  it("never grants People access to Alexandra even if runtime input requests it", () => {
    const result = compileEffectiveProfile(input({
      subject: { kind: "person", key: "alexandra_reception" },
      binding: {
        ...input().binding,
        subject: { kind: "person", key: "alexandra_reception" },
      },
      authority: {
        ...input().authority,
        subject: { kind: "person", key: "alexandra_reception" },
        roleProfile: "reception",
        peopleAssistantAuthorized: true,
      },
    }));
    expect(result.ok && result.profile.peopleAssistantAllowed).toBe(false);
  });

  it("uses a team identity for the shared Reception account", () => {
    const result = compileEffectiveProfile(input({
      subject: { kind: "shared_account", key: "dreamcatcher_reception_whatsapp" },
      binding: {
        ...input().binding,
        subject: { kind: "shared_account", key: "dreamcatcher_reception_whatsapp" },
        deviceKey: null,
        deviceStatus: "not_applicable",
        deviceExpiresAt: null,
      },
      authority: {
        ...input().authority,
        subject: { kind: "shared_account", key: "dreamcatcher_reception_whatsapp" },
        roleProfile: "reception",
        peopleAssistantAuthorized: true,
      },
    }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile).toMatchObject({
      addressName: "equipo de Recepción",
      teamIdentity: true,
      peopleAssistantAllowed: false,
    });
  });

  it.each([
    ["unverified binding", input({ binding: { ...input().binding, status: "unverified" } }), "binding_not_verified"],
    ["expired binding", input({ binding: { ...input().binding, expiresAt: NOW } }), "binding_expired"],
    ["revoked device", input({ binding: { ...input().binding, deviceStatus: "revoked" } }), "device_not_verified"],
    ["inactive authority", input({ authority: { ...input().authority, active: false } }), "inactive_authority"],
    ["subject mismatch", input({ binding: { ...input().binding, subject: { kind: "person", key: "alexandra_reception" } } }), "subject_mismatch"],
    ["missing organization", input({ binding: { ...input().binding, organizationId: null, propertyIds: [] }, authority: { ...input().authority, organizationId: null, propertyIds: [] } }), "organization_required"],
    ["wrong organization", input({ authority: { ...input().authority, organizationId: "other-org" } }), "organization_mismatch"],
    ["missing property", input({ binding: { ...input().binding, propertyIds: [] } }), "property_scope_missing"],
    ["unauthorized property", input({ binding: { ...input().binding, propertyIds: ["other-property"] } }), "property_scope_mismatch"],
    ["role escalation", input({ authority: { ...input().authority, roleProfile: "finance" } }), "role_profile_mismatch"],
    ["unknown identity", input({
      subject: { kind: "person", key: "unknown" },
      binding: { ...input().binding, subject: { kind: "person", key: "unknown" } },
      authority: { ...input().authority, subject: { kind: "person", key: "unknown" } },
    }), "unknown_subject"],
  ])("fails closed for %s", (_label, candidate, reason) => {
    expect(compileEffectiveProfile(candidate as EffectiveProfileInput)).toEqual({ ok: false, reason });
  });

  it("produces the same profile hash across channels and detects drift", () => {
    const compiled = compileEffectiveProfile(input());
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    const receipts = (["portal", "openclaw", "whatsapp"] as const).map((surface) => ({
      surface,
      receipt: { ...compiled.profile.receipt, channelAccountKey: `${surface}-alias` },
    }));
    expect(compareEffectiveProfileReceipts(receipts)).toEqual({
      deployedConsistently: true,
      missing: [],
      duplicates: [],
      matching: true,
    });
    receipts[2].receipt.profileHash = "0".repeat(64);
    expect(compareEffectiveProfileReceipts(receipts).deployedConsistently).toBe(false);
  });

  it("changes the hash when authority scope or capabilities differ", () => {
    const first = compileEffectiveProfile(input());
    const second = compileEffectiveProfile(input({
      authority: {
        ...input().authority,
        allowedDataScopes: ["system"],
        capabilityIds: ["operations.read"],
      },
    }));
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.profile.receipt.profileHash).not.toBe(second.profile.receipt.profileHash);
  });
});
