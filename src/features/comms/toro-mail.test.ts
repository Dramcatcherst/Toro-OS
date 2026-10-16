import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "../context/types";
import type { ToroMailboxBinding } from "./mailbox-bindings";
import type { ToroPersonalMailboxConnection } from "./personal-mailbox-guard";
import {
  projectToroMail,
  validateToroMailActionReceipt,
  type ToroMailAccount,
} from "./toro-mail";

const personalContext: ToroResolvedContext = {
  userId: "owner-1",
  email: null,
  displayName: "Owner",
  mode: "personal",
  orgId: null,
  membership: null,
  availableOrgIds: ["org-1"],
  allowedDataScopes: ["personal"],
  allowedTools: [
    { provider: "gmail", actions: ["read", "draft", "execute"], owner: "personal", orgId: null },
    { provider: "outlook-email", actions: ["read"], owner: "personal", orgId: null },
  ],
  canUsePersonalVault: true,
  canUseOrganizationData: false,
  requiresContextChoice: false,
};

const orgContext: ToroResolvedContext = {
  ...personalContext,
  mode: "organization",
  orgId: "org-1",
  membership: {
    orgId: "org-1",
    membershipId: "membership-1",
    membershipType: "owner",
    status: "active",
    roles: ["ADMIN"],
    employeeId: null,
    source: "organization_memberships",
  },
  allowedDataScopes: ["work_org"],
  allowedTools: [],
  canUsePersonalVault: false,
  canUseOrganizationData: true,
};

function personalConnection(
  provider: ToroPersonalMailboxConnection["provider"],
  runtimeVerified: boolean,
): ToroPersonalMailboxConnection {
  return {
    ownerUserId: "owner-1",
    provider,
    status: "connected",
    verificationStatus: "verified",
    runtimeVerified,
    readEnabled: true,
    modifyEnabled: true,
    draftEnabled: true,
    sendEnabled: false,
    settingsEnabled: false,
  };
}

const organizationBinding: ToroMailboxBinding = {
  id: "hotel-mail",
  orgId: "org-1",
  propertyId: null,
  channel: "email",
  provider: "gmail",
  endpointKind: "user_mailbox",
  normalizedEndpoint: "hotel@example.invalid",
  displayName: "Hotel",
  businessRole: "admin",
  authStatus: "connected",
  readEnabled: true,
  draftEnabled: false,
  sendEnabled: false,
  deleteEnabled: false,
  adminEnabled: false,
  ingestionStatus: "healthy",
  verificationStatus: "verified",
  lastSyncAt: "2026-10-15T12:00:00Z",
  lastEventAt: "2026-10-15T11:59:00Z",
  lastErrorCode: null,
  active: true,
};

const accounts: ToroMailAccount[] = [
  {
    kind: "personal",
    id: "personal-gmail",
    endpoint: "owner@gmail.invalid",
    displayName: "Personal Gmail",
    connection: personalConnection("gmail", true),
    connectorEvidence: { connectorSessionVerified: true, observedAt: "2026-10-15T12:00:00Z" },
  },
  {
    kind: "personal",
    id: "personal-outlook",
    endpoint: "owner@outlook.invalid",
    displayName: "Personal Outlook",
    connection: personalConnection("outlook", false),
    connectorEvidence: { connectorSessionVerified: true, observedAt: "2026-10-15T12:00:00Z" },
  },
  {
    kind: "personal",
    id: "other-person",
    endpoint: "other@gmail.invalid",
    displayName: "Other",
    connection: { ...personalConnection("gmail", true), ownerUserId: "other-user" },
    connectorEvidence: { connectorSessionVerified: true, observedAt: "2026-10-15T12:00:00Z" },
  },
  {
    kind: "organization",
    binding: organizationBinding,
    connectorEvidence: { connectorSessionVerified: true, observedAt: "2026-10-15T12:00:00Z" },
  },
];

describe("TORO Mail account projection", () => {
  it("keeps personal and organization mailboxes in separate views", () => {
    expect(projectToroMail(personalContext, accounts).map((item) => item.id)).toEqual([
      "personal-gmail", "personal-outlook",
    ]);
    expect(projectToroMail(orgContext, accounts).map((item) => item.id)).toEqual([
      "hotel-mail",
    ]);
  });

  it("does not treat a ChatGPT connector session as TORO runtime OAuth", () => {
    const [gmail, outlook] = projectToroMail(personalContext, accounts);
    expect(gmail).toMatchObject({ runtimeState: "runtime_verified", readable: true });
    expect(outlook).toMatchObject({ runtimeState: "connector_only", readable: false });
  });

  it("does not expose personal accounts to an organization administrator", () => {
    const projections = projectToroMail(orgContext, accounts);
    expect(projections).toHaveLength(1);
    expect(projections[0].scope).toBe("organization");
  });

  it("requires explicit action gates instead of advertising unrestricted control", () => {
    const [gmail] = projectToroMail(personalContext, accounts);
    expect(gmail.actionPolicy).toEqual({
      labelAndArchive: "message_evidence_required",
      trash: "approval_and_readback_required",
      unsubscribe: "native_provider_review_required",
      send: "blocked",
      permanentDelete: "separate_human_gate",
    });
  });
});

describe("TORO Mail action receipts", () => {
  const receipt = {
    receiptId: "mail-receipt-1",
    accountId: "personal-gmail",
    action: "trash" as const,
    requestedAt: "2026-10-15T12:00:00Z",
    completedAt: "2026-10-15T12:01:00Z",
    providerObjectIdsHash: "sha256:synthetic",
    beforeReadback: "not_in_trash:2",
    afterReadback: "in_trash:2",
    approvalReceiptId: "approval-1",
    outcome: "succeeded" as const,
  };

  it("accepts a bounded mutation only with approval and before/after readback", () => {
    expect(validateToroMailActionReceipt(receipt)).toEqual({ valid: true, errors: [] });
  });

  it("fails closed when a mutation lacks approval or provider readback", () => {
    const result = validateToroMailActionReceipt({
      ...receipt,
      approvalReceiptId: null,
      afterReadback: null,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      "missing_after_readback",
      "missing_approval_receipt",
    ]));
  });

  it("never turns a receipt into permanent-delete authority", () => {
    const result = validateToroMailActionReceipt({ ...receipt, action: "permanent_delete" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("permanent_delete_requires_separate_human_flow");
  });
});
