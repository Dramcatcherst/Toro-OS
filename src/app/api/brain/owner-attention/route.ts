import { NextResponse } from "next/server";

import { resolveToroContext } from "@/features/context/resolver";
import {
  canViewOwnerAttention,
} from "@/features/attention/owner-attention";
import {
  loadOwnerAttentionProjection,
  ownerAttentionReadEnabled,
} from "@/features/attention/owner-attention-server";

// Authenticated financial responses must never be reused by a shared cache.
function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  return NextResponse.json(body, { ...init, headers });
}

export async function GET() {
  // Context resolution itself can use Supabase; demo mode must stop before it.
  if (!ownerAttentionReadEnabled()) {
    return jsonResponse(
      { state: "disabled", ownerAttentionAllowed: false },
      { status: 503 },
    );
  }

  try {
    const context = await resolveToroContext({ mode: "organization" });

    if (!context) {
      return jsonResponse(
        { state: "unresolved", ownerAttentionAllowed: false },
        { status: 401 },
      );
    }

    if (context.requiresContextChoice) {
      return jsonResponse(
        {
          state: "context_choice_required",
          ownerAttentionAllowed: false,
          availableOrganizationCount: context.availableOrgIds.length,
        },
        { status: 409 },
      );
    }

    if (!canViewOwnerAttention(context)) {
      return jsonResponse(
        { state: "forbidden", ownerAttentionAllowed: false },
        { status: 403 },
      );
    }

    const projection = await loadOwnerAttentionProjection(context);

    return jsonResponse({
      state: "ready",
      ownerAttentionAllowed: true,
      projection,
    });
  } catch {
    return jsonResponse(
      { state: "runtime_unavailable", ownerAttentionAllowed: false },
      { status: 503 },
    );
  }
}
