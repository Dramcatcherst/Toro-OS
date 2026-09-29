import { NextResponse } from "next/server";

import { canViewOwnerAttention } from "@/features/attention/owner-attention";
import { loadOwnerAttentionProjectionWithClient } from "@/features/attention/owner-attention-server";
import { createToroInternalWorkWithContext } from "@/features/actions/internal-work-server";
import { resolveOpenClawChannelContext } from "@/features/openclaw/channel-context";
import type { ToroResolvedContext } from "@/features/context/types";
import { authorizeOpenClawService } from "@/features/openclaw/service-auth";
import { consumeOpenClawPairing } from "@/features/openclaw/pairing";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export const runtime = "nodejs";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0",
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

function safeContextProjection(context: ToroResolvedContext) {
  return {
    mode: context.mode,
    orgId: context.orgId,
    roles: context.membership?.roles ?? [],
    membershipType: context.membership?.membershipType ?? null,
    employeePreferredName:
      context.membership?.employeePreferredName ?? null,
    workArea: context.membership?.workArea ?? null,
    allowedDataScopes: context.allowedDataScopes,
    canUseOrganizationData: context.canUseOrganizationData,
    canUsePersonalVault: context.canUsePersonalVault,
  };
}

export async function POST(request: Request) {
  const auth = authorizeOpenClawService(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return response({ state: "invalid", error: "Request body must be an object." }, 400);
  }

  const record = body as {
    identity?: unknown;
    operation?: unknown;
    input?: unknown;
  };
  const operation =
    typeof record.operation === "string" ? record.operation.trim() : "";

  if (
    operation !== "context.resolve" &&
    operation !== "owner_attention.read" &&
    operation !== "internal_work.create" &&
    operation !== "channel_identity.consume_enrollment"
  ) {
    return response({ state: "invalid", error: "Unsupported OpenClaw operation." }, 400);
  }

  let supabase: ReturnType<typeof createPrivilegedSupabaseClient>;
  try {
    supabase = createPrivilegedSupabaseClient();
  } catch {
    return response(
      { state: "runtime_unavailable", error: "Privileged TORO bridge is not configured." },
      503,
    );
  }

  if (operation === "channel_identity.consume_enrollment") {
    const token =
      record.input &&
      typeof record.input === "object" &&
      !Array.isArray(record.input)
        ? (record.input as { token?: unknown }).token
        : null;

    const consumed = await consumeOpenClawPairing(
      { token, identity: record.identity },
      supabase,
    );

    if (consumed.state === "unavailable") {
      return response(consumed, 503);
    }

    if (
      consumed.state === "bound" ||
      consumed.state === "already_bound" ||
      consumed.state === "already_used"
    ) {
      return response({ state: consumed.state });
    }

    return response({ state: consumed.state }, 403);
  }

  const resolved = await resolveOpenClawChannelContext(record.identity, supabase);

  if (resolved.state === "invalid") {
    return response(resolved, 400);
  }
  if (resolved.state === "unlinked") {
    return response(
      {
        state: "unlinked",
        error: "Channel sender is not linked to a verified TORO identity.",
      },
      403,
    );
  }
  if (resolved.state === "forbidden") {
    return response(resolved, 403);
  }
  if (resolved.state === "unavailable") {
    return response(resolved, 503);
  }

  const { context } = resolved;

  if (operation === "context.resolve") {
    return response({
      state: "ready",
      principal: auth.principal,
      context: safeContextProjection(context),
    });
  }

  if (operation === "owner_attention.read") {
    if (!canViewOwnerAttention(context)) {
      return response(
        { state: "forbidden", error: "Owner Attention is not permitted for this actor." },
        403,
      );
    }

    try {
      const projection = await loadOwnerAttentionProjectionWithClient(
        context,
        supabase,
      );

      return response({
        state: "ready",
        principal: auth.principal,
        projection,
      });
    } catch {
      return response(
        { state: "runtime_unavailable", error: "Owner Attention is unavailable." },
        503,
      );
    }
  }

  const result = await createToroInternalWorkWithContext(
    record.input,
    context,
    supabase,
  );

  switch (result.state) {
    case "created":
      return response(
        {
          state: result.state,
          externalWrite: false,
          canonicalWrite: "operations.tasks",
          task: result.task,
        },
        201,
      );
    case "replayed":
      return response({
        state: result.state,
        externalWrite: false,
        canonicalWrite: "operations.tasks",
        task: result.task,
      });
    case "invalid":
      return response(result, 400);
    case "forbidden":
      return response(result, 403);
    case "unauthenticated":
      return response(result, 401);
    case "unavailable":
    default:
      return response(result, 503);
  }
}
