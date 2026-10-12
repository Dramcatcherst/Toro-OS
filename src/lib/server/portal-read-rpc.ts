import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ToroResolvedContext } from "@/features/context/types";
import { resolveToroContextWithSupabase } from "@/features/context/resolver";
import { isPublicDemo } from "./public-demo";

const uuid = z.string().uuid();
const text = z.string().max(4096);
const nullableText = text.nullable();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}).nullable();
const timestamp = z.string().datetime({ offset: true });
const numeric = z.number().finite().nullable();
const scope = { org_id: uuid };
const rows = <T extends z.ZodType>(row: T, limit: number) =>
  z.object({ rows: z.array(row).max(limit), limit: z.literal(limit) }).strict();
const envelope = { contract: z.literal("portal-read-rpc-v1"), actorId: uuid, orgId: uuid, generatedAt: timestamp };

const brainSchema = z.object({ ...envelope, sources: z.object({
  organization: rows(z.object({ id: uuid, name: text.min(1), status: text }).strict(), 1),
  projects: rows(z.object({ ...scope, id: uuid, project_name: text, priority: nullableText, status: nullableText,
    business_area: nullableText, canonical_module_key: nullableText, completion_pct: numeric,
    needs_revalidation: z.boolean(), source_system: nullableText, updated_at: timestamp }).strict(), 25),
  sourceAuthority: rows(z.object({ ...scope, id: uuid, domain: text, official_source: text,
    human_approval_required: z.boolean(), authority_level: nullableText, rule_status: text,
    last_reviewed: date }).strict(), 25),
  domainGovernance: rows(z.object({ ...scope, id: uuid, domain: text, criticality: text,
    quality_target: numeric, current_quality_score: numeric, last_reviewed_at: timestamp.nullable(),
    next_review_at: timestamp.nullable() }).strict(), 25),
  krossHealth: rows(z.object({ ...scope, id: uuid.nullable(), source_name: nullableText, snapshot_kind: nullableText,
    source_as_of: timestamp.nullable(), observed_at: timestamp.nullable(), live_required: z.boolean().nullable(),
    freshness_status: nullableText, safe_for_current_state: z.boolean().nullable() }).strict(), 25),
}).strict() }).strict();

const attentionSchema = z.object({ ...envelope, sources: z.object({
  followups: rows(z.object({ ...scope, followup_key: text, subject: text, followup_state: text,
    priority: text, owner_agent: nullableText, human_owner: nullableText, due_date: date,
    source_url: nullableText, mailbox: nullableText, related_obligation_key: nullableText }).strict(), 100),
  obligations: rows(z.object({ ...scope, obligation_key: text, obligation_name: text, counterparty: text,
    status: text, verification_status: nullableText, next_due_date: date, next_review_date: date,
    current_amount: numeric, current_amount_currency: nullableText, owner_agent: nullableText, human_owner: nullableText,
    source_system: nullableText, source_path: nullableText }).strict(), 150),
  invoices: rows(z.object({ ...scope, invoice_key: text, issuer_name: text, document_number: nullableText,
    due_date: date, currency: nullableText, total: numeric, payment_status: nullableText,
    obligation_key: nullableText, mailbox: nullableText, source_url: nullableText }).strict(), 200),
}).strict() }).strict();

/** Server-only selection. A typo never silently downgrades to another transport. */
export function portalReadRpcSelected() {
  const mode = process.env.TORO_PORTAL_READ_TRANSPORT;
  if (mode === undefined || mode === "direct") return false;
  if (mode !== "rpc_v1" || isPublicDemo()) throw new Error("Portal read transport is unavailable.");
  return true;
}

function assertContext(context: ToroResolvedContext | null, finance: boolean) {
  const allowed = finance ? ["ADMIN", "GERENCIA"] : ["ADMIN", "GERENCIA", "JEFE_DEPARTAMENTO", "AUDITOR"];
  if (!context || context.mode !== "organization" || !uuid.safeParse(context.orgId).success ||
    !uuid.safeParse(context.userId).success || context.requiresContextChoice || !context.canUseOrganizationData ||
    !context.allowedDataScopes.includes("work_org") || context.membership?.status !== "active" ||
    context.membership.orgId !== context.orgId || !context.membership.roles.some(role => allowed.includes(role))) {
    throw new Error("Portal read requires an authorized organization context.");
  }
}

async function read<T extends typeof brainSchema | typeof attentionSchema>(
  context: ToroResolvedContext, client: SupabaseClient, schema: T, finance: boolean,
): Promise<z.infer<T>> {
  if (isPublicDemo() || process.env.TORO_BRAIN_CANONICAL_READ_ENABLED !== "true" ||
    (finance && process.env.TORO_OWNER_ATTENTION_READ_ENABLED !== "true") || !portalReadRpcSelected()) {
    throw new Error("Portal RPC read is disabled.");
  }
  assertContext(context, finance);
  const requested = { userId: context.userId, orgId: context.orgId! };
  const name = finance ? "toro_portal_owner_attention_read_v1" : "toro_portal_brain_read_v1";
  let response;
  try { response = await client.rpc(name, { p_org_id: requested.orgId, p_actor_id: requested.userId }); }
  catch { throw new Error("Portal read source unavailable."); }
  const { data, error } = response;
  if (error) throw new Error("Portal read source unavailable.");
  // Reject missing sources, unexpected fields and oversized responses before projection.
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error("Portal read response could not be verified.");
  const value = parsed.data;
  if (value.actorId !== requested.userId || value.orgId !== requested.orgId ||
    Object.values(value.sources).some(source => source.rows.some((row: { org_id?: string; id?: string | null }) =>
      "org_id" in row ? row.org_id !== requested.orgId : "id" in row && row.id !== requested.orgId))) {
    throw new Error("Portal read scope could not be verified.");
  }
  // No cached identity: revalidate the actual session and active roles after the await.
  let current;
  try { current = await resolveToroContextWithSupabase(client, { mode: "organization", orgId: requested.orgId }); }
  catch { throw new Error("Portal read session could not be verified."); }
  assertContext(current, finance);
  assertContext(context, finance);
  if (current!.userId !== requested.userId || current!.orgId !== requested.orgId ||
    context.userId !== requested.userId || context.orgId !== requested.orgId) {
    throw new Error("Portal read session changed.");
  }
  return value as z.infer<T>;
}

export const readPortalBrainRpc = (context: ToroResolvedContext, client: SupabaseClient) => read(context, client, brainSchema, false);
export const readPortalAttentionRpc = (context: ToroResolvedContext, client: SupabaseClient) => read(context, client, attentionSchema, true);
