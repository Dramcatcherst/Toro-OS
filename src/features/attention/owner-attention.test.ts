import { describe, expect, it } from "vitest";

import type { ToroResolvedContext } from "@/features/context/types";

import {
  buildOwnerAttentionProjection,
  canViewOwnerAttention,
  projectInvoiceAttention,
  projectObligationAttention,
} from "./owner-attention";

const ORG_ID = "11111111-1111-4111-8111-111111111111";

function context(role: "ADMIN" | "GERENCIA" | "CONTABILIDAD"): ToroResolvedContext {
  return {
    userId: "user-1",
    email: "owner@example.invalid",
    displayName: "Owner",
    mode: "organization",
    orgId: ORG_ID,
    membership: {
      orgId: ORG_ID,
      membershipId: null,
      membershipType: "owner",
      status: "active",
      roles: [role],
      employeeId: null,
      employeePreferredName: null,
      positionId: null,
      positionCode: null,
      positionName: null,
      workArea: null,
      source: "legacy_user_roles",
    },
    availableOrgIds: [ORG_ID],
    allowedDataScopes: ["work_org"],
    allowedTools: [],
    canUsePersonalVault: false,
    canUseOrganizationData: true,
    requiresContextChoice: false,
  };
}

describe("Owner Attention authorization", () => {
  it("allows ADMIN and GERENCIA only for v1 owner surface", () => {
    expect(canViewOwnerAttention(context("ADMIN"))).toBe(true);
    expect(canViewOwnerAttention(context("GERENCIA"))).toBe(true);
    expect(canViewOwnerAttention(context("CONTABILIDAD"))).toBe(false);
  });
});

describe("Owner Attention projection", () => {
  it("elevates a declined-payment obligation to critical", () => {
    const item = projectObligationAttention(
      {
        obligation_key: "meta_ads_usage_billing",
        obligation_name: "Meta Ads",
        counterparty: "Meta Ads",
        status: "needs_verification",
        verification_status: "payment_declined_2026_09_04_latest_connected_billing_event",
        next_due_date: null,
        next_review_date: "2026-09-29",
        current_amount: null,
        current_amount_currency: "USD",
        owner_agent: "FIONA + SKY",
        human_owner: "Mauricio",
        source_system: "Gmail",
        source_path: "info@dreamcatcherhotel.com",
      },
      "2026-09-28",
    );

    expect(item).toMatchObject({
      key: "meta_ads_usage_billing",
      priority: "critical",
      kind: "obligation",
    });
  });

  it("keeps paid invoices out of Owner Attention", () => {
    expect(
      projectInvoiceAttention(
        {
          invoice_key: "paid",
          issuer_name: "Vendor",
          document_number: "1",
          due_date: "2026-09-28",
          currency: "USD",
          total: 20,
          payment_status: "paid",
          obligation_key: null,
          mailbox: "info@example.com",
          source_url: null,
        },
        "2026-09-28",
      ),
    ).toBeNull();
  });

  it("deduplicates a communication follow-up and its linked obligation", () => {
    const projection = buildOwnerAttentionProjection({
      today: "2026-09-28",
      generatedAt: "2026-09-28T23:00:00.000Z",
      followups: [
        {
          followup_key: "booking-followup",
          subject: "Booking collection notice",
          followup_state: "review",
          priority: "critical",
          owner_agent: "FIONA",
          human_owner: "Mauricio",
          due_date: "2026-09-28",
          source_url: "https://example.invalid/message",
          mailbox: "admin@example.com",
          related_obligation_key: "booking-balance",
        },
      ],
      obligations: [
        {
          obligation_key: "booking-balance",
          obligation_name: "Booking balance reconciliation",
          counterparty: "Booking",
          status: "needs_verification",
          verification_status: "collection_claim_unreconciled",
          next_due_date: null,
          next_review_date: "2026-09-28",
          current_amount: "9382.97",
          current_amount_currency: "USD",
          owner_agent: "FIONA",
          human_owner: "Mauricio",
          source_system: "Booking",
          source_path: null,
        },
      ],
      invoices: [],
    });

    expect(projection.total).toBe(1);
    expect(projection.items[0]).toMatchObject({
      dedupeRef: "booking-balance",
      kind: "communication",
      priority: "critical",
    });
  });

  it("suppresses routine active obligations until review/due attention is reached", () => {
    const item = projectObligationAttention(
      {
        obligation_key: "routine",
        obligation_name: "Routine service",
        counterparty: "Vendor",
        status: "active",
        verification_status: "healthy",
        next_due_date: "2026-10-25",
        next_review_date: "2026-10-20",
        current_amount: null,
        current_amount_currency: null,
        owner_agent: "FIONA",
        human_owner: "Mauricio",
        source_system: "Provider",
        source_path: null,
      },
      "2026-09-28",
    );

    expect(item).toBeNull();
  });
});
