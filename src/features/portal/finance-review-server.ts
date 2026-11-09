import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToroResolvedContext } from "@/features/context/types";
import { resolveToroContextWithSupabase } from "@/features/context/resolver";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { internalCapabilityEnabled } from "@/lib/server/public-demo";
import { DIRECTORY_SCOPE } from "@/features/tools/directory";
import { canReadPortalFinance, emptyFinanceReview, FINANCE_REVIEW_FIELDS, FINANCE_REVIEW_LIMIT, projectFinanceReview, type FinanceReviewView } from "./finance-review";

/** Existing authenticated RLS client only. No service role, writer, RPC or schema change. */
export async function loadFinanceReviewWithClient(context: ToroResolvedContext, client: SupabaseClient): Promise<FinanceReviewView> {
  if (!internalCapabilityEnabled("TORO_BRAIN_CANONICAL_READ_ENABLED")) return emptyFinanceReview("disabled");
  if (!canReadPortalFinance(context)) return emptyFinanceReview("denied");
  const requested = { userId: context.userId, orgId: context.orgId };
  let read;
  try {
    read = await client.schema("finance").from("reconciliations").select(FINANCE_REVIEW_FIELDS)
      .eq("org_id", DIRECTORY_SCOPE.orgId).eq("property_id", DIRECTORY_SCOPE.propertyId)
      .order("updated_at", { ascending: false }).limit(FINANCE_REVIEW_LIMIT + 1);
  } catch { return emptyFinanceReview("unavailable"); }
  let current: ToroResolvedContext | null;
  try { current = await resolveToroContextWithSupabase(client, { mode:"organization", orgId:DIRECTORY_SCOPE.orgId }); }
  catch { return emptyFinanceReview("denied"); }
  if (!canReadPortalFinance(current) || current!.userId !== requested.userId || current!.orgId !== requested.orgId ||
    !canReadPortalFinance(context) || context.userId !== requested.userId || context.orgId !== requested.orgId) return emptyFinanceReview("denied");
  if (read.error) return emptyFinanceReview("unavailable");
  return projectFinanceReview(read.data, new Date().toISOString());
}

export async function loadFinanceReview(context: ToroResolvedContext): Promise<FinanceReviewView> {
  try { return await loadFinanceReviewWithClient(context, await createServerSupabaseClient()); }
  catch { return emptyFinanceReview("unavailable"); }
}
