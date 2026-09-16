"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DecisionAction =
  | "approve"
  | "modify"
  | "delegate"
  | "postpone"
  | "reject";

export type ResolveDecisionInput = {
  decisionId: string;
  action: DecisionAction;
  note?: string;
  delegateTo?: string;
};

export type ActionResult = {
  decisionId: string;
  action: DecisionAction;
  status: string;
  auditedAt: string;
};

type RpcActionResult = {
  decision_id: string;
  action: DecisionAction;
  status: string;
  audited_at: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function parseActionResult(value: unknown): RpcActionResult {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid decision action result received from the server.");
  }

  const row = value as Record<string, unknown>;
  const actions: DecisionAction[] = ["approve", "modify", "delegate", "postpone", "reject"];

  if (
    typeof row.decision_id !== "string" ||
    !uuidPattern.test(row.decision_id) ||
    typeof row.action !== "string" ||
    !actions.includes(row.action as DecisionAction) ||
    typeof row.status !== "string" ||
    typeof row.audited_at !== "string" ||
    Number.isNaN(Date.parse(row.audited_at))
  ) {
    throw new Error("Invalid decision action result received from the server.");
  }

  return row as RpcActionResult;
}

export async function resolveDecision(input: ResolveDecisionInput): Promise<ActionResult> {
  if (!uuidPattern.test(input.decisionId)) {
    throw new Error("Invalid decision id.");
  }

  const note = cleanOptional(input.note);
  const delegateTo = cleanOptional(input.delegateTo);

  if (input.action === "delegate" && !delegateTo) {
    throw new Error("A delegate target is required.");
  }

  if (input.action === "reject" && !note) {
    throw new Error("A note is required to reject a governed decision.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("resolve_toro_decision", {
    p_decision_id: input.decisionId,
    p_action: input.action,
    p_note: note,
    p_delegate_to: delegateTo,
  });

  if (error) {
    throw new Error(error.message || "Unable to resolve governed decision.");
  }

  const result = parseActionResult(data);

  return {
    decisionId: result.decision_id,
    action: result.action,
    status: result.status,
    auditedAt: result.audited_at,
  };
}
