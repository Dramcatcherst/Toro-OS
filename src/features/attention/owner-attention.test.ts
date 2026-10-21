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

describe("Financial alert classification — never infer outstanding debt from document date alone", () => {
  const invoice = (payment_status: string | null, due_date: string | null = "2026-10-01") => ({
    invoice_key: "synthetic-finance-invoice",
    issuer_name: "Synthetic Provider",
    document_number: "QA-1",
    due_date,
    currency: "CRC",
    total: 15000,
    payment_status,
    obligation_key: null,
    mailbox: null,
    source_url: null,
  });

  it.each(["paid", "PAID", "credited", "no_payment_due_extranet_verified_2026_09_29"])(
    "suppresses non-payable or settled status %s from overdue-payment alerts", (status) => {
      expect(projectInvoiceAttention(invoice(status), "2026-10-20")).toBeNull();
    },
  );

  it.each([
    "unknown", "payment_reported", "payment_in_progress_2026_09_05",
    "duplicate_billing_dispute_unresolved",
    "paid_external_match_scope_pending", "paid_provider_confirmed_bank_match_pending",
    "no_payment_due_unverified", "no_payment_due_not_verified", "no_payment_due_extranet_pending", "OPEN",
  ])("marks %s as high verification rather than a verified overdue debt", (status) => {
    expect(projectInvoiceAttention(invoice(status), "2026-10-20")).toMatchObject({
      kind: "invoice", priority: "high", state: status, amount: 15000,
    });
  });

  it.each(["due", "overdue", "unpaid"])(
    "retains critical attention for explicit overdue status %s", (status) => {
      expect(projectInvoiceAttention(invoice(status), "2026-10-20")?.priority).toBe("critical");
    },
  );

  it("keeps a future due invoice out of attention unless dispute or processing warrants follow-up", () => {
    expect(projectInvoiceAttention(invoice("unknown", "2026-11-10"), "2026-10-20")).toBeNull();
    expect(projectInvoiceAttention(invoice("duplicate_billing_dispute_unresolved", null), "2026-10-20")?.priority).toBe("high");
  });
});
