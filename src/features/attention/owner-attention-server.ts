import "server-only";
import { internalCapabilityEnabled } from "@/lib/server/public-demo";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createToroReportingContext } from "@/lib/reporting-policy";
import { readPortalAttentionRpc, portalReadRpcSelected } from "@/lib/server/portal-read-rpc";

import {
  buildOwnerAttentionProjection,
  canViewOwnerAttention,
  type CommunicationFollowupRow,
  type InvoiceRow,
  type ObligationRow,
  type OwnerAttentionProjection,
} from "./owner-attention";

export type OwnerAttentionReadInput = {
  /** Existing internal date-only override; not exposed by HTTP or MCP. */
  today?: string;
  limit?: number;
  /** Internal request instant; never read from untrusted tool arguments. */
  asOf?: Date;
};

/** Finance reads are a separate capability, not implied by Brain Stage C v1. */
export function ownerAttentionReadEnabled(): boolean {
  return (
    internalCapabilityEnabled("TORO_BRAIN_CANONICAL_READ_ENABLED") &&
    process.env.TORO_OWNER_ATTENTION_READ_ENABLED === "true"
  );
}

export async function loadOwnerAttentionProjectionWithClient(
  context: ToroResolvedContext,
  supabase: SupabaseClient,
  input: OwnerAttentionReadInput = {},
): Promise<OwnerAttentionProjection> {
  if (!ownerAttentionReadEnabled()) {
    throw new Error("Owner Attention read is disabled.");
  }

  if (!canViewOwnerAttention(context) || !context.orgId) {
    throw new Error("Owner Attention requires an authorized organization context.");
  }

  let asOf = input.asOf ?? new Date();
  let reportContext = createToroReportingContext(asOf, input.today);

  const bundle = portalReadRpcSelected() ? await readPortalAttentionRpc(context, supabase) : null;
  if (bundle && !input.asOf) {
    asOf = new Date(bundle.generatedAt);
    reportContext = createToroReportingContext(asOf, input.today);
  }
  const [followupsResult, obligationsResult, invoicesResult] = bundle ? [
    { data: bundle.sources.followups.rows, error: null },
    { data: bundle.sources.obligations.rows, error: null },
    { data: bundle.sources.invoices.rows, error: null },
  ] : await Promise.all([
    supabase
      .schema("operations")
      .from("communication_followups")
      .select(
        "followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key",
      )
      .eq("org_id", context.orgId)
      .eq("active", true)
      .order("followup_key", { ascending: true })
      .limit(100),
    supabase
      .schema("operations")
      .from("obligations")
      .select(
        "obligation_key,obligation_name,counterparty,status,verification_status,next_due_date,next_review_date,current_amount,current_amount_currency,owner_agent,human_owner,source_system,source_path",
      )
      .eq("org_id", context.orgId)
      .eq("active", true)
      .order("obligation_key", { ascending: true })
      .limit(150),
    supabase
      .schema("finance")
      .from("invoices")
      .select(
        "invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url",
      )
      .eq("org_id", context.orgId)
      .eq("active", true)
      .order("invoice_key", { ascending: true })
      .limit(200),
  ]);

  for (const result of [followupsResult, obligationsResult, invoicesResult]) {
    if (result.error) {
      throw new Error("Owner Attention source unavailable.");
    }
  }

  if (
    !Array.isArray(followupsResult.data) ||
    !Array.isArray(obligationsResult.data) ||
    !Array.isArray(invoicesResult.data)
  ) {
    throw new Error("Owner Attention source unavailable.");
  }

  const projection = buildOwnerAttentionProjection({
    followups: followupsResult.data as CommunicationFollowupRow[],
    obligations: obligationsResult.data as ObligationRow[],
    invoices: invoicesResult.data as InvoiceRow[],
    today: reportContext.reportingDate,
    generatedAt: reportContext.asOf,
    limit: input.limit,
  });

  return {
    ...projection,
    reportContext,
    coverage: {
      contractVersion: "owner-attention-coverage-v1",
      scope: { kind: "organization", orgId: context.orgId },
      sources: [
        {
          source: "operations.communication_followups",
          rowsRead: followupsResult.data.length,
          limit: 100,
          limitReached: followupsResult.data.length >= 100,
          completeness: "unverified",
        },
        {
          source: "operations.obligations",
          rowsRead: obligationsResult.data.length,
          limit: 150,
          limitReached: obligationsResult.data.length >= 150,
          completeness: "unverified",
        },
        {
          source: "finance.invoices",
          rowsRead: invoicesResult.data.length,
          limit: 200,
          limitReached: invoicesResult.data.length >= 200,
          completeness: "unverified",
        },
      ],
      // A bounded read is neither a census nor a transactionally consistent snapshot.
      totalInOrganization: null,
      partial: true,
      snapshot: "non_transactional",
    },
  };
}

export async function loadOwnerAttentionProjection(
  context: ToroResolvedContext,
  input: OwnerAttentionReadInput = {},
): Promise<OwnerAttentionProjection> {
  // Preserve the direct-provider gate before allocating any database client.
  if (!ownerAttentionReadEnabled()) {
    throw new Error("Owner Attention read is disabled.");
  }

  if (!canViewOwnerAttention(context) || !context.orgId) {
    throw new Error("Owner Attention requires an authorized organization context.");
  }

  const supabase = await createServerSupabaseClient();
  return loadOwnerAttentionProjectionWithClient(context, supabase, input);
}
