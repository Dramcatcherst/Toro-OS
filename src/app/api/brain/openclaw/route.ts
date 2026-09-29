import { NextResponse } from "next/server";

import { canViewOwnerAttention } from "@/features/attention/owner-attention";
import { loadOwnerAttentionProjectionWithClient } from "@/features/attention/owner-attention-server";
import { createToroInternalWorkWithContext } from "@/features/actions/internal-work-server";
import { loadCanonicalBrainReadSliceWithClient } from "@/features/brain/canonical-read";
import { resolveOpenClawChannelContext } from "@/features/openclaw/channel-context";
import type { ToroResolvedContext } from "@/features/context/types";
import { authorizeOpenClawService } from "@/features/openclaw/service-auth";
import { consumeOpenClawPairing } from "@/features/openclaw/pairing";
import { resolveToroReadOnlyMenuForContext } from "@/features/menu/server";
import { resolveToroMenuIntent } from "@/features/menu/resolver";
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
    operation !== "channel_identity.consume_enrollment" &&
    operation !== "brain.read" &&
    operation !== "menu.read" &&
    operation !== "menu.resolve"
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

  if (operation === "menu.resolve") {
    const rawText =
      record.input &&
      typeof record.input === "object" &&
      !Array.isArray(record.input) &&
      typeof (record.input as { text?: unknown }).text === "string"
        ? (record.input as { text: string }).text.trim()
        : "";

    if (!rawText || rawText.length > 500) {
      return response(
        { state: "invalid", error: "A bounded menu input text is required." },
        400,
      );
    }

    try {
      const view = await resolveToroReadOnlyMenuForContext(
        context,
        supabase,
        null,
      );
      if (!view.menu) {
        return response(
          { state: "runtime_unavailable", error: "No authorized TORO menu is available." },
          503,
        );
      }

      return response({
        state: "ready",
        principal: auth.principal,
        intent: resolveToroMenuIntent(view.menu, rawText),
        menuProfileId: view.menu.profileId,
      });
    } catch {
      return response(
        { state: "runtime_unavailable", error: "TORO menu resolution is unavailable." },
        503,
      );
    }
  }

  if (operation === "menu.read") {
    const focusCapability =
      record.input &&
      typeof record.input === "object" &&
      !Array.isArray(record.input) &&
      typeof (record.input as { focusCapability?: unknown }).focusCapability === "string"
        ? (record.input as { focusCapability: string }).focusCapability.trim()
        : null;

    try {
      const view = await resolveToroReadOnlyMenuForContext(
        context,
        supabase,
        focusCapability,
      );

      return response({
        state: "ready",
        principal: auth.principal,
        menu: view,
      });
    } catch {
      return response(
        { state: "runtime_unavailable", error: "TORO menu is unavailable." },
        503,
      );
    }
  }

  if (operation === "brain.read") {
    try {
      const brain = await loadCanonicalBrainReadSliceWithClient(
        context,
        supabase,
      );

      return response({
        state: "ready",
        principal: auth.principal,
        brain,
      });
    } catch {
      return response(
        { state: "runtime_unavailable", error: "Canonical Brain read is unavailable." },
        503,
      );
    }
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
