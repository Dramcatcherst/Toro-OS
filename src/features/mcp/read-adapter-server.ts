import "server-only";
import { isPublicDemo } from "@/lib/server/public-demo";

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  canViewOwnerAttention,
} from "@/features/attention/owner-attention";
import { canonicalScopeRefForOrgId } from "@/features/brain/canonical-read";
import {
  loadOwnerAttentionProjection,
  loadOwnerAttentionProjectionWithClient,
} from "@/features/attention/owner-attention-server";
import { CANONICAL_BRAIN_SEARCH_READ_LIMITS } from "@/features/brain/canonical-projection";
import { resolveToroContext } from "@/features/context/resolver";
import type { ToroResolvedContext } from "@/features/context/types";
import {
  currentCostaRicaDate,
  loadKrossCurrentStateWithClient,
  type KrossCurrentStateMovement,
} from "@/features/kross/current-state-read";
import {
  boundedMcpReadLimit,
  businessStatusFromProjection,
  executionReceiptsFromProjection,
  pendingDecisionsFromProjection,
  prioritiesFromOwnerAttention,
  projectionHasRealDecisionSource,
  projectionHasReceiptSource,
  searchToroProjectionResult,
} from "@/features/mcp/read-adapter";
import {
  loadBrainProjectionView,
  loadBrainProjectionViewForContext,
} from "@/lib/server/brain-projection";
import {
  TORO_MCP_CONTRACT_VERSION,
  type ToroMcpErrorCode,
  type ToroMcpRegisteredReadToolName,
  type ToroMcpResponse,
} from "@/lib/toro-mcp-contracts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ReadInput = Record<string, unknown> & {
  correlationId?: string;
};

export type ToroMcpReadRuntime = {
  context?: ToroResolvedContext;
  supabase?: SupabaseClient;
  error?: {
    code: ToroMcpErrorCode;
    message: string;
    retryable: boolean;
  };
};

function errorResponse(
  tool: ToroMcpRegisteredReadToolName,
  input: ReadInput,
  code: ToroMcpErrorCode,
  message: string,
  retryable: boolean,
): ToroMcpResponse<never> {
  return {
    contractVersion: TORO_MCP_CONTRACT_VERSION,
    tool,
    generatedAt: new Date().toISOString(),
    correlationId: input.correlationId ?? randomUUID(),
    partial: true,
    sources: [],
    error: { code, message, retryable },
  };
}

function validOrganizationContext(
  context: ToroResolvedContext | null,
): context is ToroResolvedContext & {
  mode: "organization";
  orgId: string;
  membership: NonNullable<ToroResolvedContext["membership"]>;
} {
  return Boolean(
    context &&
      context.mode === "organization" &&
      context.orgId &&
      context.membership &&
      context.membership.status === "active" &&
      context.membership.orgId === context.orgId &&
      context.canUseOrganizationData &&
      !context.requiresContextChoice,
  );
}

async function resolveReadContext(
  tool: ToroMcpRegisteredReadToolName,
  input: ReadInput,
  runtime: ToroMcpReadRuntime,
): Promise<
  | {
      ok: true;
      context: ToroResolvedContext & {
        mode: "organization";
        orgId: string;
        membership: NonNullable<ToroResolvedContext["membership"]>;
      };
    }
  | { ok: false; response: ToroMcpResponse<never> }
> {
  if (runtime.error) {
    return {
      ok: false,
      response: errorResponse(
        tool,
        input,
        runtime.error.code,
        runtime.error.message,
        runtime.error.retryable,
      ),
    };
  }

  let context: ToroResolvedContext | null = null;

  if (runtime.context || runtime.supabase) {
    if (!runtime.context || !runtime.supabase) {
      return {
        ok: false,
        response: errorResponse(
          tool,
          input,
          "runtime_unconfigured",
          "TORO MCP authenticated runtime is incomplete.",
          false,
        ),
      };
    }
    context = runtime.context;
  } else try {
    context = await resolveToroContext({ mode: "organization" });
  } catch {
    return {
      ok: false,
      response: errorResponse(
        tool,
        input,
        "runtime_unconfigured",
        "TORO identity/context runtime is unavailable.",
        true,
      ),
    };
  }

  if (!context) {
    return {
      ok: false,
      response: errorResponse(
        tool,
        input,
        "unauthenticated",
        "An authenticated TORO identity is required.",
        false,
      ),
    };
  }

  if (context.requiresContextChoice) {
    return {
      ok: false,
      response: errorResponse(
        tool,
        input,
        "context_choice_required",
        "Choose an authorized TORO organization before reading business data.",
        false,
      ),
    };
  }

  if (!validOrganizationContext(context)) {
    return {
      ok: false,
      response: errorResponse(
        tool,
        input,
        "forbidden",
        "This identity cannot read the requested TORO organization context.",
        false,
      ),
    };
  }

  return { ok: true, context };
}

export async function runToroMcpReadTool(
  tool: ToroMcpRegisteredReadToolName,
  input: ReadInput = {},
  runtime: ToroMcpReadRuntime = {},
): Promise<ToroMcpResponse<unknown>> {
  if (isPublicDemo()) {
    return errorResponse(tool, input, "capability_unavailable", "Operational reads are disabled in the public demo.", false);
  }
  const resolved = await resolveReadContext(tool, input, runtime);
  if (!resolved.ok) return resolved.response;

  const correlationId = input.correlationId ?? randomUUID();
  const asOf = new Date();

  if (tool === "get_hotel_current_state") {
    const allowedRoles = new Set([
      "ADMIN",
      "GERENCIA",
      "JEFE_DEPARTAMENTO",
      "AUDITOR",
    ]);
    if (
      !resolved.context.membership.roles.some((role) =>
        allowedRoles.has(role),
      )
    ) {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "forbidden",
        "This identity cannot read current hotel reservation state.",
        false,
      );
    }

    const movementValues = new Set<KrossCurrentStateMovement>([
      "arrivals",
      "departures",
      "daily_movements",
    ]);
    const movement =
      typeof input.movement === "string" &&
      movementValues.has(input.movement as KrossCurrentStateMovement)
        ? (input.movement as KrossCurrentStateMovement)
        : "daily_movements";
    const date =
      typeof input.date === "string" ? input.date : currentCostaRicaDate(asOf);
    const propertyId =
      typeof input.propertyId === "string" && input.propertyId.trim()
        ? input.propertyId.trim()
        : undefined;
    const limit =
      typeof input.limit === "number" && Number.isInteger(input.limit)
        ? input.limit
        : 10;

    let supabase: SupabaseClient;
    try {
      supabase = runtime.supabase ?? (await createServerSupabaseClient());
    } catch {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "runtime_unconfigured",
        "TORO cannot reach its governed Supabase read runtime.",
        true,
      );
    }

    const state = await loadKrossCurrentStateWithClient(
      supabase,
      {
        orgId: resolved.context.orgId,
        propertyId,
        date,
        movement,
        limit,
      },
      asOf,
    );
    const base = {
      contractVersion: TORO_MCP_CONTRACT_VERSION,
      tool,
      generatedAt: asOf.toISOString(),
      correlationId,
      context: {
        mode: "organization" as const,
        scopeRef: canonicalScopeRefForOrgId(resolved.context.orgId),
      },
      sources: [
        {
          sourceSystem: "Supabase Kross read-only mirror",
          authoritySystem: "Kross",
          freshness:
            state.state === "READY"
              ? ("current" as const)
              : state.state === "STALE"
                ? ("stale" as const)
                : ("unknown" as const),
          verification:
            state.state === "READY"
              ? ("verified" as const)
              : ("unverified" as const),
          observedAt: state.observedAt ?? state.sourceAsOf ?? undefined,
          authoritative: false,
        },
      ],
      data: state,
    };

    if (state.state === "READY") {
      return { ...base, partial: state.coverage.truncated };
    }

    const contextChoice = state.reason === "property_choice_required";
    return {
      ...base,
      partial: true,
      error: {
        code: contextChoice
          ? ("context_choice_required" as const)
          : state.state === "STALE"
            ? ("stale_source" as const)
            : ("capability_unavailable" as const),
        message: state.message,
        retryable: !contextChoice,
        nextAction: contextChoice
          ? "Choose one authorized property."
          : "Restore and verify the hosted Kross-to-Supabase synchronization before retrying.",
      },
    };
  }

  let view;
  try {
    const options = { purpose: tool === "search_toro" ? "search" as const : "visual" as const };
    view = runtime.supabase
      ? await loadBrainProjectionViewForContext(resolved.context, runtime.supabase, options)
      : await loadBrainProjectionView(options);
  } catch {
    return errorResponse(
      tool,
      { ...input, correlationId },
      "degraded",
      "TORO Brain read projection is unavailable.",
      true,
    );
  }

  if (!view.runtime.realData || view.projection.synthetic) {
    return errorResponse(
      tool,
      { ...input, correlationId },
      "capability_unavailable",
      "Authenticated canonical Brain reads are not currently enabled or verified.",
      false,
    );
  }

  const projection = view.projection;
  const base = {
    contractVersion: TORO_MCP_CONTRACT_VERSION,
    tool,
    generatedAt: asOf.toISOString(),
    correlationId,
    context: {
      mode: "organization" as const,
      scopeRef: projection.context.scopeRef,
      organizationRef: projection.context.organizationRef,
      workspaceRef: projection.context.workspaceRef,
    },
    sources: projection.sources,
  };

  if (tool === "get_brain_status") {
    return {
      ...base,
      partial: projection.partial,
      data: projection,
    };
  }

  if (tool === "search_toro") {
    const query = typeof input.query === "string" ? input.query : "";
    if (!query.trim()) {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "invalid_request",
        "search_toro requires a non-empty query.",
        false,
      );
    }

    const kinds = Array.isArray(input.kinds)
      ? input.kinds.filter((value): value is string => typeof value === "string")
      : undefined;
    const limit = typeof input.limit === "number" ? input.limit : undefined;

    return {
      ...base,
      partial: projection.partial,
      generatedAt: projection.generatedAt,
      data: searchToroProjectionResult(
        projection,
        { query, kinds, limit },
        CANONICAL_BRAIN_SEARCH_READ_LIMITS,
      ),
    };
  }

  if (tool === "get_business_status") {
    return {
      ...base,
      partial: projection.partial,
      data: businessStatusFromProjection(projection),
    };
  }

  if (tool === "get_priorities") {
    if (typeof input.horizon === "string" && input.horizon !== "now") {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "capability_unavailable",
        "Only the current/now priority horizon is exposed in MCP v1.",
        false,
      );
    }

    if (!canViewOwnerAttention(resolved.context)) {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "capability_unavailable",
        "Role-specific priorities are not yet available for this TORO role.",
        false,
      );
    }

    const priorityLimit = boundedMcpReadLimit(
      typeof input.limit === "number" ? input.limit : undefined,
    );
    try {
      const attention = runtime.supabase
        ? await loadOwnerAttentionProjectionWithClient(
            resolved.context,
            runtime.supabase,
            {
              asOf,
              limit: priorityLimit,
            },
          )
        : await loadOwnerAttentionProjection(resolved.context, {
            asOf,
            limit: priorityLimit,
          });

      return {
        ...base,
        generatedAt: attention.generatedAt,
        partial: true,
        data: {
          items: prioritiesFromOwnerAttention(attention, priorityLimit),
          sourceContract: attention.contractVersion,
          reportContext: attention.reportContext,
          selection: attention.selection,
          coverage: attention.coverage,
        },
      };
    } catch {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "degraded",
        "TORO Owner Attention sources are unavailable.",
        true,
      );
    }
  }

  if (tool === "get_pending_decisions") {
    if (!projectionHasRealDecisionSource(projection)) {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "capability_unavailable",
        "The current canonical Brain projection does not yet expose the decision ledger.",
        false,
      );
    }

    return {
      ...base,
      partial: projection.partial,
      data: {
        items: pendingDecisionsFromProjection(
          projection,
          typeof input.limit === "number" ? input.limit : undefined,
        ),
      },
    };
  }

  if (tool === "get_execution_receipts") {
    if (!projectionHasReceiptSource(projection)) {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "capability_unavailable",
        "Verified execution receipt lineage is not yet exposed through the current Brain projection.",
        false,
      );
    }

    return {
      ...base,
      partial: projection.partial,
      data: {
        items: executionReceiptsFromProjection(projection, {
          correlationId:
            typeof input.receiptCorrelationId === "string"
              ? input.receiptCorrelationId
              : undefined,
          actionRef:
            typeof input.actionRef === "string" ? input.actionRef : undefined,
          workflowRunRef:
            typeof input.workflowRunRef === "string"
              ? input.workflowRunRef
              : undefined,
          since: typeof input.since === "string" ? input.since : undefined,
          until: typeof input.until === "string" ? input.until : undefined,
          limit: typeof input.limit === "number" ? input.limit : undefined,
        }),
      },
    };
  }

  return errorResponse(
    tool,
    { ...input, correlationId },
    "invalid_request",
    "Unsupported TORO MCP read tool.",
    false,
  );
}
