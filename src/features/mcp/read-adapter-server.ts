import "server-only";
import { isPublicDemo } from "@/lib/server/public-demo";

import { randomUUID } from "node:crypto";

import {
  canViewOwnerAttention,
} from "@/features/attention/owner-attention";
import { loadOwnerAttentionProjection } from "@/features/attention/owner-attention-server";
import { resolveToroContext } from "@/features/context/resolver";
import type { ToroResolvedContext } from "@/features/context/types";
import {
  businessStatusFromProjection,
  executionReceiptsFromProjection,
  pendingDecisionsFromProjection,
  prioritiesFromOwnerAttention,
  projectionHasRealDecisionSource,
  projectionHasReceiptSource,
  searchToroProjection,
} from "@/features/mcp/read-adapter";
import { loadBrainProjectionView } from "@/lib/server/brain-projection";
import {
  TORO_MCP_CONTRACT_VERSION,
  type ToroMcpCoreToolName,
  type ToroMcpErrorCode,
  type ToroMcpResponse,
} from "@/lib/toro-mcp-contracts";

type ReadInput = Record<string, unknown> & {
  correlationId?: string;
};

function errorResponse(
  tool: ToroMcpCoreToolName,
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
  tool: ToroMcpCoreToolName,
  input: ReadInput,
): Promise<
  | { ok: true; context: ToroResolvedContext & { orgId: string } }
  | { ok: false; response: ToroMcpResponse<never> }
> {
  let context: ToroResolvedContext | null = null;
  try {
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
  tool: ToroMcpCoreToolName,
  input: ReadInput = {},
): Promise<ToroMcpResponse<unknown>> {
  if (isPublicDemo()) {
    return errorResponse(tool, input, "capability_unavailable", "Operational reads are disabled in the public demo.", false);
  }
  const resolved = await resolveReadContext(tool, input);
  if (!resolved.ok) return resolved.response;

  const correlationId = input.correlationId ?? randomUUID();

  let view;
  try {
    view = await loadBrainProjectionView();
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
    generatedAt: new Date().toISOString(),
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
      data: {
        hits: searchToroProjection(projection, { query, kinds, limit }),
      },
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
    if (!canViewOwnerAttention(resolved.context)) {
      return errorResponse(
        tool,
        { ...input, correlationId },
        "capability_unavailable",
        "Role-specific priorities are not yet available for this TORO role.",
        false,
      );
    }

    try {
      const attention = await loadOwnerAttentionProjection(resolved.context, {
        limit: typeof input.limit === "number" ? input.limit : undefined,
      });

      return {
        ...base,
        partial: true,
        data: {
          items: prioritiesFromOwnerAttention(
            attention,
            typeof input.limit === "number" ? input.limit : undefined,
          ),
          sourceContract: attention.contractVersion,
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
            typeof input.filterCorrelationId === "string"
              ? input.filterCorrelationId
              : undefined,
          actionRef:
            typeof input.actionRef === "string" ? input.actionRef : undefined,
          workflowRunRef:
            typeof input.workflowRunRef === "string"
              ? input.workflowRunRef
              : undefined,
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
