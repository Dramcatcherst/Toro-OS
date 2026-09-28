import "server-only";

import type { ToroResolvedContext } from "@/features/context/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  buildOwnerAttentionProjection,
  canViewOwnerAttention,
  type CommunicationFollowupRow,
  type InvoiceRow,
  type ObligationRow,
  type OwnerAttentionProjection,
} from "./owner-attention";

export async function loadOwnerAttentionProjection(
  context: ToroResolvedContext,
  input: { today?: string; limit?: number } = {},
): Promise<OwnerAttentionProjection> {
  if (!canViewOwnerAttention(context) || !context.orgId) {
    throw new Error("Owner Attention requires an authorized organization context.");
  }

  const supabase = await createServerSupabaseClient();

  const [followupsResult, obligationsResult, invoicesResult] = await Promise.all([
    supabase
      .schema("operations")
      .from("communication_followups")
      .select(
        "followup_key,subject,followup_state,priority,owner_agent,human_owner,due_date,source_url,mailbox,related_obligation_key",
      )
      .eq("org_id", context.orgId)
      .eq("active", true)
      .limit(100),
    supabase
      .schema("operations")
      .from("obligations")
      .select(
        "obligation_key,obligation_name,counterparty,status,verification_status,next_due_date,next_review_date,current_amount,current_amount_currency,owner_agent,human_owner,source_system,source_path",
      )
      .eq("org_id", context.orgId)
      .eq("active", true)
      .limit(150),
    supabase
      .schema("finance")
      .from("invoices")
      .select(
        "invoice_key,issuer_name,document_number,due_date,currency,total,payment_status,obligation_key,mailbox,source_url",
      )
      .eq("org_id", context.orgId)
      .eq("active", true)
      .limit(200),
  ]);

  for (const result of [followupsResult, obligationsResult, invoicesResult]) {
    if (result.error) {
      throw new Error("Owner Attention source unavailable.");
    }
  }

  const today = input.today ?? new Date().toISOString().slice(0, 10);

  return buildOwnerAttentionProjection({
    followups: (followupsResult.data ?? []) as CommunicationFollowupRow[],
    obligations: (obligationsResult.data ?? []) as ObligationRow[],
    invoices: (invoicesResult.data ?? []) as InvoiceRow[],
    today,
    limit: input.limit,
  });
}
