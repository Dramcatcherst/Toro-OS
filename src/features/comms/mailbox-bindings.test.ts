import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";

import {
  canUseMailboxBinding,
  isMailboxBindingReadable,
  mailboxBindingHealth,
  normalizeMailboxEndpoint,
  projectMailboxBindingStatus,
  TORO_MAIL_METADATA_READ_CAPABILITY,
  type ToroMailboxBinding,
  type ToroMailboxMetadataReadGrant,
} from "./mailbox-bindings";

const baseBinding: ToroMailboxBinding = {
  id: "binding-1",
  orgId: "org-1",
  businessId: "business-1",
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

const readGrant: ToroMailboxMetadataReadGrant = {
  capability: TORO_MAIL_METADATA_READ_CAPABILITY,
  actorId: "user-1",
  orgId: "org-1",
  businessId: "business-1",
  propertyId: null,
  bindingId: "binding-1",
  provider: "gmail",
  status: "active",
};

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
    expect(mailboxBindingHealth(baseBinding)).toBe("healthy");
  });

  it.each([
    [{ authStatus: "revoked" as const }, "unavailable"],
    [{ authStatus: "disconnected" as const }, "unavailable"],
    [{ authStatus: "pending" as const }, "unverified"],
    [{ ingestionStatus: "paused" as const }, "degraded"],
    [{ ingestionStatus: "degraded" as const }, "degraded"],
    [{ ingestionStatus: "backfill_pending" as const }, "unverified"],
    [{ verificationStatus: "conflict" as const }, "degraded"],
    [{ verificationStatus: "partial" as const }, "unverified"],
    [{ lastErrorCode: "sync_failure" }, "degraded"],
  ])("fails closed for %o", (patch, health) => {
    const binding = { ...baseBinding, ...patch };
    expect(isMailboxBindingReadable(binding)).toBe(false);
    expect(mailboxBindingHealth(binding)).toBe(health);
  });

  it("requires a server-issued grant for the exact actor and mailbox scope", () => {
    expect(canUseMailboxBinding(orgContext, baseBinding)).toBe(false);
    expect(canUseMailboxBinding(orgContext, baseBinding, readGrant)).toBe(true);

    expect(
      canUseMailboxBinding(
        { ...orgContext, orgId: "other-org" },
        baseBinding,
        readGrant,
      ),
    ).toBe(false);

    expect(
      canUseMailboxBinding(
        { ...orgContext, canUseOrganizationData: false },
        baseBinding,
        readGrant,
      ),
    ).toBe(false);
  });

  it.each([
    ["another actor", { actorId: "another-user" }],
    ["another organization", { orgId: "org-2" }],
    ["another business", { businessId: "business-2" }],
    ["another property", { propertyId: "property-2" }],
    ["another binding", { bindingId: "binding-2" }],
    ["another provider", { provider: "outlook" }],
    ["revoked grant", { status: "revoked" as const }],
    ["obsolete hotel capability", { capability: "comms.hotel.metadata.read" }],
  ])("denies %s", (_label, patch) => {
    expect(canUseMailboxBinding(orgContext, baseBinding, { ...readGrant, ...patch } as ToroMailboxMetadataReadGrant)).toBe(false);
  });

  it("denies personal, unscoped and inactive memberships", () => {
    expect(canUseMailboxBinding({ ...orgContext, mode: "personal" }, baseBinding, readGrant)).toBe(false);
    expect(canUseMailboxBinding(orgContext, { ...baseBinding, businessId: null }, readGrant)).toBe(false);
    expect(canUseMailboxBinding(orgContext, { ...baseBinding, propertyId: "property-1" }, readGrant)).toBe(false);
    expect(canUseMailboxBinding(orgContext, { ...baseBinding, verificationStatus: "partial" }, readGrant)).toBe(false);
    expect(canUseMailboxBinding({ ...orgContext, membership: { ...orgContext.membership!, status: "suspended" } }, baseBinding, readGrant)).toBe(false);
    expect(canUseMailboxBinding({ ...orgContext, membership: { ...orgContext.membership!, orgId: "org-2" } }, baseBinding, readGrant)).toBe(false);
  });

  it("projects only non-secret operational status fields", () => {
    const projection = projectMailboxBindingStatus(baseBinding);
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
