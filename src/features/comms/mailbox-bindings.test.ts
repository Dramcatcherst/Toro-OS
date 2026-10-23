import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";

import {
  canUseMailboxBinding,
  isMailboxBindingReadable,
  mailboxBindingHealth,
  normalizeMailboxEndpoint,
  projectMailboxBindingStatus,
  type ToroMailboxBinding,
} from "./mailbox-bindings";

const baseBinding: ToroMailboxBinding = {
  id: "binding-1",
  orgId: "org-1",
  propertyId: null,
  channel: "email",
  provider: "gmail",
  endpointKind: "user_mailbox",
  normalizedEndpoint: "admin@dreamcatcherhotel.com",
  displayName: "Dreamcatcher",
  businessRole: "admin",
  authStatus: "connected",
  readEnabled: true,
  draftEnabled: false,
  sendEnabled: false,
  deleteEnabled: false,
  adminEnabled: false,
  ingestionStatus: "healthy",
  verificationStatus: "verified",
  lastSyncAt: "2026-09-28T22:00:00Z",
  lastEventAt: "2026-09-28T21:59:00Z",
  lastErrorCode: null,
  active: true,
};

const orgContext: ToroResolvedContext = {
  userId: "user-1",
  email: "owner@example.com",
  displayName: "Owner",
  mode: "organization",
  orgId: "org-1",
  membership: {
    orgId: "org-1",
    membershipId: null,
    membershipType: "owner",
    status: "active",
    roles: ["ADMIN"],
    employeeId: null,
    employeePreferredName: null,
    positionId: null,
    positionCode: null,
    positionName: null,
    workArea: null,
    source: "legacy_user_roles",
  },
  availableOrgIds: ["org-1"],
  allowedDataScopes: ["work_org"],
  allowedTools: [],
  canUsePersonalVault: false,
  canUseOrganizationData: true,
  requiresContextChoice: false,
};

const healthPolicy = { nowMs: Date.parse("2026-09-28T22:01:00Z"), maxSyncAgeMs: 120_000 };

describe("normalizeMailboxEndpoint", () => {
  it("normalizes email casing and whitespace", () => {
    expect(normalizeMailboxEndpoint(" Admin@DreamcatcherHotel.COM ")).toBe(
      "admin@dreamcatcherhotel.com",
    );
  });

  it("rejects invalid endpoints", () => {
    expect(normalizeMailboxEndpoint("not-an-email")).toBeNull();
    expect(normalizeMailboxEndpoint("")).toBeNull();
    expect(normalizeMailboxEndpoint(null)).toBeNull();
  });
});

describe("mailbox operational policy", () => {
  it("allows a verified connected healthy read binding", () => {
    expect(isMailboxBindingReadable(baseBinding)).toBe(true);
    expect(mailboxBindingHealth(baseBinding, healthPolicy)).toBe("healthy");
  });

  it.each([
    [{ authStatus: "revoked" as const }, "unavailable"],
    [{ authStatus: "disconnected" as const }, "unavailable"],
    [{ authStatus: "pending" as const }, "unverified"],
    [{ ingestionStatus: "paused" as const }, "degraded"],
    [{ verificationStatus: "conflict" as const }, "degraded"],
  ])("fails closed for %o", (patch, health) => {
    const binding = { ...baseBinding, ...patch };
    expect(isMailboxBindingReadable(binding)).toBe(false);
    expect(mailboxBindingHealth(binding, healthPolicy)).toBe(health);
  });

  it("requires matching active organization context", () => {
    expect(canUseMailboxBinding(orgContext, baseBinding)).toBe(true);

    expect(
      canUseMailboxBinding(
        { ...orgContext, orgId: "other-org" },
        baseBinding,
      ),
    ).toBe(false);

    expect(
      canUseMailboxBinding(
        { ...orgContext, canUseOrganizationData: false },
        baseBinding,
      ),
    ).toBe(false);
  });

  it("projects only non-secret operational status fields", () => {
    const projection = projectMailboxBindingStatus(baseBinding, healthPolicy);
    expect(projection).toEqual({
      id: "binding-1",
      endpoint: "admin@dreamcatcherhotel.com",
      provider: "gmail",
      endpointKind: "user_mailbox",
      businessRole: "admin",
      readable: true,
      health: "healthy",
      verificationStatus: "verified",
      lastSyncAt: "2026-09-28T22:00:00Z",
      lastEventAt: "2026-09-28T21:59:00Z",
      errorCode: null,
    });

    expect(Object.keys(projection)).not.toContain("credentialRef");
    expect(Object.keys(projection)).not.toContain("providerAccountRef");
  });
});


describe("C50-05 observed mailbox health", () => {
  it.each(["not_configured", "backfill_pending", "backfilling", "syncing"] as const)("does not call %s ingestion healthy", (ingestionStatus) => {
    expect(mailboxBindingHealth({ ...baseBinding, ingestionStatus }, healthPolicy)).toBe("unverified");
  });

  it("does not call partially verified identity healthy", () => {
    expect(mailboxBindingHealth({ ...baseBinding, verificationStatus: "partial" }, healthPolicy)).toBe("unverified");
  });

  it.each([null, "not-a-date", "2000-01-01T00:00:00Z", "2026-09-28T22:01:01Z", "2026-02-31T22:00:00Z"])("requires a real recent nonfuture sync: %s", (lastSyncAt) => {
    const binding = { ...baseBinding, lastSyncAt };
    expect(mailboxBindingHealth(binding, healthPolicy)).not.toBe("healthy");
    expect(projectMailboxBindingStatus(binding, healthPolicy).health).not.toBe("healthy");
    expect(isMailboxBindingReadable(binding)).toBe(true);
  });

  it("rejects a rolled calendar date even when Date.parse places it inside the freshness window", () => {
    expect(mailboxBindingHealth({ ...baseBinding, lastSyncAt: "2026-02-31T22:00:00Z" }, {
      nowMs: Date.parse("2026-03-03T22:01:00Z"), maxSyncAgeMs: 120_000,
    })).toBe("degraded");
    expect(mailboxBindingHealth({ ...baseBinding, lastSyncAt: "2026-09-28T23:00:00+01:00" }, healthPolicy)).toBe("healthy");
  });

  it("uses an explicit protected clock/window and includes its exact boundary", () => {
    expect(mailboxBindingHealth(baseBinding, { ...healthPolicy, maxSyncAgeMs: 60_000 })).toBe("healthy");
    expect(mailboxBindingHealth(baseBinding, { ...healthPolicy, maxSyncAgeMs: 59_999 })).toBe("degraded");
    for (const maxSyncAgeMs of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(mailboxBindingHealth(baseBinding, { ...healthPolicy, maxSyncAgeMs })).not.toBe("healthy");
    }
    expect(mailboxBindingHealth(baseBinding, { ...healthPolicy, nowMs: Number.NaN })).not.toBe("healthy");
    expect(mailboxBindingHealth({ ...baseBinding, lastEventAt: null }, healthPolicy)).toBe("healthy");
    expect(mailboxBindingHealth({ ...baseBinding, channel: "sms" as never }, healthPolicy)).not.toBe("healthy");
  });
});

describe("C50-06 coherent mailbox context", () => {
  it("rejects missing work scope and a membership from another organization", () => {
    expect(canUseMailboxBinding({ ...orgContext, allowedDataScopes: [] }, baseBinding)).toBe(false);
    expect(canUseMailboxBinding({ ...orgContext, membership: { ...orgContext.membership!, orgId: "other" } }, baseBinding)).toBe(false);
    for (const userId of ["", " ", " user-1"]) expect(canUseMailboxBinding({ ...orgContext, userId }, baseBinding)).toBe(false);
    expect(canUseMailboxBinding({ ...orgContext, mode: "personal" }, baseBinding)).toBe(false);
  });
});
