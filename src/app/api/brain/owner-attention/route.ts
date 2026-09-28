import { NextResponse } from "next/server";

import { resolveToroContext } from "@/features/context/resolver";
import {
  canViewOwnerAttention,
} from "@/features/attention/owner-attention";
import { loadOwnerAttentionProjection } from "@/features/attention/owner-attention-server";

export async function GET() {
  try {
    const context = await resolveToroContext({ mode: "organization" });

    if (!context) {
      return NextResponse.json(
        { state: "unresolved", ownerAttentionAllowed: false },
        { status: 401 },
      );
    }

    if (context.requiresContextChoice) {
      return NextResponse.json(
        {
          state: "context_choice_required",
          ownerAttentionAllowed: false,
          availableOrganizationCount: context.availableOrgIds.length,
        },
        { status: 409 },
      );
    }

    if (!canViewOwnerAttention(context)) {
      return NextResponse.json(
        { state: "forbidden", ownerAttentionAllowed: false },
        { status: 403 },
      );
    }

    const projection = await loadOwnerAttentionProjection(context);

    return NextResponse.json({
      state: "ready",
      ownerAttentionAllowed: true,
      projection,
    });
  } catch {
    return NextResponse.json(
      { state: "runtime_unavailable", ownerAttentionAllowed: false },
      { status: 503 },
    );
  }
}
