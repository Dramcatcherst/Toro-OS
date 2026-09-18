import { NextResponse } from "next/server";

import { evaluatePolicy } from "@/lib/policy-engine";
import { authorizeToroApi } from "@/lib/server/api-auth";

export async function POST(request: Request) {
  const auth = await authorizeToroApi();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    mode: "read_only",
    externalWrite: false,
    decision: evaluatePolicy({
      action: body.action ?? "draft",
      actionLevel: body.actionLevel ?? "draft",
      risk: body.risk ?? "Medium",
      externalImpact: Boolean(body.externalImpact),
    }),
  });
}
