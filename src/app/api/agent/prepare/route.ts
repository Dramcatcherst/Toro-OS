import { NextResponse } from "next/server";
import { evaluatePolicy } from "@/lib/policy-engine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "draft_business_recommendation");
  const decision = evaluatePolicy({
    action,
    actionLevel: body.actionLevel ?? "draft",
    risk: body.risk ?? "High",
    externalImpact: Boolean(body.externalImpact ?? true),
  });

  return NextResponse.json({
    mode: "prepare_only",
    externalWrite: false,
    decision,
    draft: {
      title: body.title ?? "Prepared TORO OS agent output",
      summary: "This is a guarded draft. It can be reviewed, edited and queued, but not executed externally in v0.3.",
      nextAction: decision.approval === "Blocked" ? "Revise action scope." : "Route to approval queue.",
    },
  });
}
