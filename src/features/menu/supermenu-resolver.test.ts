import { describe, expect, it } from "vitest";

import {
  listToroSuperMenuCategories,
  resolveToroSuperMenuIntent,
  type ToroSuperMenuReceipt,
} from "./supermenu-resolver";

const capabilityStates = {
  "operations.exceptions": "READY",
  "hospitality.quote": "READ_ONLY",
  "personal.today": "READY",
  "systems.connector_health": "READ_ONLY",
} as const;

const liveReceipt: ToroSuperMenuReceipt = {
  id: "mrcpt_7Qn4uX2pL9sV5kDf",
  menuVersion: "2026.10.16-v1",
  subjectId: "subject-owner-001",
  contextFingerprint: "org-dreamcatcher-manager",
  issuedAt: "2026-10-16T07:00:00.000Z",
  expiresAt: "2026-10-16T07:30:00.000Z",
};

const receiptContext = {
  activeMenuReceipt: liveReceipt,
  currentSubjectId: liveReceipt.subjectId,
  currentContextFingerprint: liveReceipt.contextFingerprint,
  nowIso: "2026-10-16T07:10:00.000Z",
};

describe("TORO supermenu stable-code resolver", () => {
  it("resolves canonical prefixed codes without an active menu receipt", () => {
    const result = resolveToroSuperMenuIntent({
      rawInput: "MC7",
      mode: "organization",
      capabilityStates,
    });

    expect(result).toMatchObject({
      kind: "action",
      canonicalCode: "MC7",
      shortCode: "C7",
      capability: "operations.exceptions",
      state: "READY",
    });
  });

  it("accepts short menu codes only with a live receipt for the same subject and context", () => {
    expect(
      resolveToroSuperMenuIntent({
        rawInput: "C7",
        mode: "organization",
        capabilityStates,
      }),
    ).toMatchObject({ kind: "ambiguous", canonicalCode: "MC7" });

    expect(
      resolveToroSuperMenuIntent({
        rawInput: "C7",
        mode: "organization",
        capabilityStates,
        ...receiptContext,
      }),
    ).toMatchObject({ kind: "action", canonicalCode: "MC7" });
  });

  it("keeps A4 a menu route and never interprets it as autonomy", () => {
    const result = resolveToroSuperMenuIntent({
      rawInput: "A4",
      mode: "organization",
      capabilityStates,
      ...receiptContext,
    });

    expect(result).toMatchObject({
      kind: "action",
      canonicalCode: "MA4",
      capability: "ui.resume_active_workflow",
      state: "UI",
    });
  });

  it("rejects stale and cross-context short-code receipts", () => {
    expect(
      resolveToroSuperMenuIntent({
        rawInput: "C7",
        mode: "organization",
        capabilityStates,
        ...receiptContext,
        currentContextFingerprint: "org-other-company-manager",
      }),
    ).toMatchObject({ kind: "ambiguous", reason: "menu_receipt_mismatch" });

    expect(
      resolveToroSuperMenuIntent({
        rawInput: "C7",
        mode: "organization",
        capabilityStates,
        ...receiptContext,
        currentSubjectId: "subject-other-user",
      }),
    ).toMatchObject({ kind: "ambiguous", reason: "menu_receipt_mismatch" });

    expect(
      resolveToroSuperMenuIntent({
        rawInput: "C7",
        mode: "organization",
        capabilityStates,
        ...receiptContext,
        nowIso: "2026-10-16T07:31:00.000Z",
      }),
    ).toMatchObject({ kind: "ambiguous", reason: "menu_receipt_expired" });
  });

  it("fails closed when a recognized capability is not currently available", () => {
    expect(
      resolveToroSuperMenuIntent({
        rawInput: "MC7",
        mode: "organization",
        capabilityStates: {},
      }),
    ).toMatchObject({
      kind: "unavailable",
      canonicalCode: "MC7",
      reason: "capability_unavailable",
    });
  });

  it("does not dispatch blocked, connect or request-access routes", () => {
    for (const state of ["BLOCKED", "CONNECT", "REQUEST_ACCESS"] as const) {
      expect(
        resolveToroSuperMenuIntent({
          rawInput: "MC7",
          mode: "organization",
          capabilityStates: { "operations.exceptions": state },
        }),
      ).toMatchObject({
        kind: "unavailable",
        canonicalCode: "MC7",
        reason: "capability_unavailable",
      });
    }
  });

  it("keeps TARGET_BLOCKED routes unavailable even if a caller forges READY", () => {
    expect(
      resolveToroSuperMenuIntent({
        rawInput: "MJ9",
        mode: "organization",
        capabilityStates: {
          "browser.execute_confirmed_action": "READY",
        },
      }),
    ).toMatchObject({
      kind: "unavailable",
      canonicalCode: "MJ9",
      reason: "capability_unavailable",
    });
  });

  it("does not expose Personal routes from an organization context", () => {
    expect(
      resolveToroSuperMenuIntent({
        rawInput: "MG1",
        mode: "organization",
        capabilityStates,
      }),
    ).toMatchObject({
      kind: "unavailable",
      canonicalCode: "MG1",
      reason: "scope_mismatch",
    });
  });

  it("does not expose organization administration from Personal", () => {
    expect(
      resolveToroSuperMenuIntent({
        rawInput: "MI2",
        mode: "personal",
        capabilityStates,
      }),
    ).toMatchObject({
      kind: "unavailable",
      canonicalCode: "MI2",
      reason: "scope_mismatch",
    });
  });

  it("resolves universal navigation and rejects unknown codes", () => {
    expect(
      resolveToroSuperMenuIntent({
        rawInput: "M0",
        mode: "organization",
        capabilityStates,
      }),
    ).toMatchObject({ kind: "navigation", intent: "full_menu" });

    expect(
      resolveToroSuperMenuIntent({
        rawInput: "MZ9",
        mode: "organization",
        capabilityStates,
      }),
    ).toEqual({ kind: "unknown" });
  });

  it("lists Personal and organization categories without crossing scopes", () => {
    const personal = listToroSuperMenuCategories({
      mode: "personal",
      capabilityStates,
    });
    const organization = listToroSuperMenuCategories({
      mode: "organization",
      capabilityStates,
    });

    expect(personal.map((category) => category.canonicalCode)).toContain("MG");
    expect(personal.map((category) => category.canonicalCode)).not.toContain("MI");
    expect(organization.map((category) => category.canonicalCode)).toContain("MI");
    expect(organization.map((category) => category.canonicalCode)).not.toContain("MG");
  });

  it("does not list categories or count items without a compiled capability grant", () => {
    const withoutAdminGrant = listToroSuperMenuCategories({
      mode: "organization",
      capabilityStates: {
        "operations.exceptions": "READY",
      },
    });
    const operations = withoutAdminGrant.find(
      (category) => category.canonicalCode === "MC",
    );

    expect(withoutAdminGrant.map((category) => category.canonicalCode)).not.toContain(
      "MI",
    );
    expect(operations?.itemCount).toBe(1);
  });

  it("does not resolve a category whose children are all unavailable", () => {
    expect(
      resolveToroSuperMenuIntent({
        rawInput: "MI",
        mode: "organization",
        capabilityStates: {},
      }),
    ).toMatchObject({
      kind: "unavailable",
      canonicalCode: "MI",
      reason: "capability_unavailable",
    });
  });
});
