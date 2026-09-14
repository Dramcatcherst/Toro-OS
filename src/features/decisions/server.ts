import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { DecisionApprovalLevel, DecisionCard } from "./types";

type DecisionRpcRow = {
  id: string;
  title: string;
  domain: string;
  urgency: string;
  recommendation: string | null;
  rationale: string | null;
  evidence: string | null;
  owner: string | null;
  deadline: string | null;
  approval_level: DecisionApprovalLevel;
  status: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isApprovalLevel(value: unknown): value is DecisionApprovalLevel {
  return value === "manager_approval" || value === "founder_approval";
}

function parseDecisionRow(value: unknown): DecisionRpcRow {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid decision payload received from the server.");
  }

  const row = value as Record<string, unknown>;

  if (
    typeof row.id !== "string" ||
    !uuidPattern.test(row.id) ||
    typeof row.title !== "string" ||
    typeof row.domain !== "string" ||
    typeof row.urgency !== "string" ||
    !isNullableString(row.recommendation) ||
    !isNullableString(row.rationale) ||
    !isNullableString(row.evidence) ||
    !isNullableString(row.owner) ||
    !isNullableString(row.deadline) ||
    !isApprovalLevel(row.approval_level) ||
    typeof row.status !== "string"
  ) {
    throw new Error("Invalid decision payload received from the server.");
  }

  return row as DecisionRpcRow;
}

export async function listMyDecisions({ limit = 5 }: { limit?: number }) {
  const requestedLimit = Number.isFinite(limit)
    ? Math.min(20, Math.max(1, Math.trunc(limit)))
    : 5;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("list_my_decisions", {
    p_limit: requestedLimit,
  });

  if (error) {
    throw new Error(error.message || "Unable to load governed decisions.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Invalid decision payload received from the server.");
  }

  return data.map((raw): DecisionCard => {
    const row = parseDecisionRow(raw);
    return {
      id: row.id,
      title: row.title,
      domain: row.domain,
      urgency: row.urgency,
      recommendation: row.recommendation,
      rationale: row.rationale,
      evidence: row.evidence,
      owner: row.owner,
      deadline: row.deadline,
      approvalLevel: row.approval_level,
      status: row.status,
    };
  });
}
