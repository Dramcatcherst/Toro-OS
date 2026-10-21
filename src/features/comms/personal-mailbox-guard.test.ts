import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "../context/types";
import {
  canUsePersonalMailbox,
  type ToroPersonalMailboxConnection,
} from "./personal-mailbox-guard";

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
  ],
  canUsePersonalVault: true,
  canUseOrganizationData: false,
  requiresContextChoice: false,
};

const connection: ToroPersonalMailboxConnection = {
  ownerUserId: "owner-1",
  provider: "gmail",
  status: "connected",
  verificationStatus: "verified",
  runtimeVerified: true,
  readEnabled: true,
  modifyEnabled: true,
  draftEnabled: true,
  sendEnabled: false,
  settingsEnabled: false,
};

describe("personal Gmail separation and action gates", () => {
  it("allows verified owner to read and draft within personal scope", () => {
    expect(canUsePersonalMailbox(personalContext, connection, "read")).toBe(true);
    expect(canUsePersonalMailbox(personalContext, connection, "draft")).toBe(true);
  });

  it("supports an independently granted personal Outlook connection", () => {
    expect(canUsePersonalMailbox({
      ...personalContext,
      allowedTools: [
        { provider: "outlook-email", actions: ["read"], owner: "personal", orgId: null },
      ],
    }, {
      ...connection,
      provider: "outlook",
      draftEnabled: false,
      modifyEnabled: false,
    }, "read")).toBe(true);
  });

  it("blocks any organization context even if it is the owner", () => {
    expect(canUsePersonalMailbox({
      ...personalContext,
      mode: "organization",
      orgId: "org-1",
      canUseOrganizationData: true,
    }, connection, "read")).toBe(false);
  });

  it("blocks other actors and organization-owned connector grants", () => {
    expect(canUsePersonalMailbox({
      ...personalContext, userId: "employee",
    }, connection, "read")).toBe(false);
    expect(canUsePersonalMailbox({
      ...personalContext,
      allowedTools: [{ provider: "gmail", actions: ["read", "execute"], owner: "organization", orgId: "org-1" }],
    }, connection, "read")).toBe(false);
  });

  it("fails closed without runtime OAuth readback, verification or personal vault", () => {
    expect(canUsePersonalMailbox(personalContext, {
      ...connection, runtimeVerified: false,
    }, "read")).toBe(false);
    expect(canUsePersonalMailbox(personalContext, {
      ...connection, verificationStatus: "unverified",
    }, "read")).toBe(false);
    expect(canUsePersonalMailbox({
      ...personalContext, canUsePersonalVault: false,
    }, connection, "read")).toBe(false);
  });

  it("archives only reviewed low-risk marketing without a verified approval", () => {
    expect(canUsePersonalMailbox(personalContext, connection, "archive")).toBe(false);
    expect(canUsePersonalMailbox(personalContext, connection, "label", {
      messageClass: "protected",
    })).toBe(false);
    expect(canUsePersonalMailbox(personalContext, connection, "archive", {
      messageClass: "marketing_low_risk",
    })).toBe(true);
  });

  it("requires a verified approval receipt for sending, trash and settings", () => {
    expect(canUsePersonalMailbox(personalContext, { ...connection, sendEnabled: true }, "send")).toBe(false);
    expect(canUsePersonalMailbox(personalContext, { ...connection, sendEnabled: true }, "send", {
      approvalReceiptVerified: true,
    })).toBe(true);
    expect(canUsePersonalMailbox(personalContext, connection, "trash")).toBe(false);
    expect(canUsePersonalMailbox(personalContext, connection, "trash", {
      approvalReceiptVerified: true,
    })).toBe(true);
    expect(canUsePersonalMailbox(personalContext, connection, "settings", {
      approvalReceiptVerified: true,
    })).toBe(false);
  });

  it("never allows unreviewed permanent deletion or delegation through this guard", () => {
    const approved = { approvalReceiptVerified: true };
    expect(canUsePersonalMailbox(personalContext, connection, "delegate", approved)).toBe(false);
    expect(canUsePersonalMailbox(personalContext, connection, "permanent_delete", approved)).toBe(false);
  });
});
