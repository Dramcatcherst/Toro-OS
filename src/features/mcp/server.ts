import "server-only";

import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";

import {
  resolveToroMcpBearerRuntime,
  verifyToroMcpBearerToken,
} from "@/features/mcp/auth";
import { runToroMcpReadTool } from "@/features/mcp/read-adapter-server";
import type { ToroMcpCoreToolName } from "@/lib/toro-mcp-contracts";

const scopeRef = z.string().min(1).max(240).optional();
const correlationId = z.string().min(1).max(240).optional();
const limit = z.number().int().min(1).max(25).optional();

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

function toolResult(
  tool: ToroMcpCoreToolName,
  response: Awaited<ReturnType<typeof runToroMcpReadTool>>,
) {
  const structuredContent = JSON.parse(
    JSON.stringify(response),
  ) as Record<string, unknown>;

  const text = response.error
    ? `TORO ${tool}: ${response.error.code} — ${response.error.message}`
    : `TORO ${tool}: read-only result${response.partial ? " (partial/degraded sources are labeled in structured data)" : ""}.`;

  return {
    content: [{ type: "text" as const, text }],
    structuredContent,
    isError: Boolean(response.error),
  };
}

async function executeTool(
  tool: ToroMcpCoreToolName,
  args: Record<string, unknown>,
  bearerToken?: string,
) {
  if (!bearerToken) {
    return {
      content: [
        {
          type: "text" as const,
          text: "TORO MCP authentication is required.",
        },
      ],
      isError: true,
    };
  }

  const runtime = await resolveToroMcpBearerRuntime(
    bearerToken,
    typeof args.scopeRef === "string" ? args.scopeRef : undefined,
  );
  const response = await runToroMcpReadTool(tool, args, runtime);
  return toolResult(tool, response);
}

const handler = createMcpHandler((server) => {
  server.registerTool(
    "get_brain_status",
    {
      title: "TORO Brain status",
      description:
        "Read the authenticated user's permission-filtered TORO Brain projection. Returns only canonical real data; synthetic fixtures are rejected as business truth.",
      inputSchema: z.object({
        scopeRef,
        correlationId,
      }),
      annotations: readOnlyAnnotations,
    },
    async (args, ctx) =>
      executeTool("get_brain_status", args, ctx.http?.authInfo?.token),
  );

  server.registerTool(
    "search_toro",
    {
      title: "Search TORO",
      description:
        "Search canonical TORO objects already visible in the authenticated user's current permission-filtered Brain scope.",
      inputSchema: z.object({
        query: z.string().trim().min(1).max(500),
        scopeRef,
        kinds: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
        limit,
        correlationId,
      }),
      annotations: readOnlyAnnotations,
    },
    async (args, ctx) =>
      executeTool("search_toro", args, ctx.http?.authInfo?.token),
  );

  server.registerTool(
    "get_priorities",
    {
      title: "TORO priorities",
      description:
        "Read current authorized Owner Attention priorities. MCP v1 exposes only the current/now horizon and labels partial evidence honestly.",
      inputSchema: z.object({
        scopeRef,
        horizon: z.literal("now").optional(),
        limit,
        correlationId,
      }),
      annotations: readOnlyAnnotations,
    },
    async (args, ctx) =>
      executeTool("get_priorities", args, ctx.http?.authInfo?.token),
  );

  server.registerTool(
    "get_business_status",
    {
      title: "TORO business status",
      description:
        "Read a cross-domain status summary from the current canonical TORO Brain projection without inventing unavailable metrics.",
      inputSchema: z.object({
        scopeRef,
        correlationId,
      }),
      annotations: readOnlyAnnotations,
    },
    async (args, ctx) =>
      executeTool("get_business_status", args, ctx.http?.authInfo?.token),
  );

  server.registerTool(
    "get_pending_decisions",
    {
      title: "TORO pending decisions",
      description:
        "Read decisions or approvals only when the current canonical Brain projection exposes their verified source. Does not approve or reject anything.",
      inputSchema: z.object({
        scopeRef,
        limit,
        correlationId,
      }),
      annotations: readOnlyAnnotations,
    },
    async (args, ctx) =>
      executeTool("get_pending_decisions", args, ctx.http?.authInfo?.token),
  );

  server.registerTool(
    "get_execution_receipts",
    {
      title: "TORO execution receipts",
      description:
        "Read verified execution/result lineage already represented by canonical TORO evidence. Never manufactures a receipt from narrative claims.",
      inputSchema: z.object({
        scopeRef,
        receiptCorrelationId: z.string().min(1).max(240).optional(),
        actionRef: z.string().min(1).max(240).optional(),
        workflowRunRef: z.string().min(1).max(240).optional(),
        since: z.string().datetime().optional(),
        until: z.string().datetime().optional(),
        limit,
        correlationId,
      }),
      annotations: readOnlyAnnotations,
    },
    async (args, ctx) =>
      executeTool("get_execution_receipts", args, ctx.http?.authInfo?.token),
  );
}, {});

export const toroMcpAuthHandler = withMcpAuth(
  handler,
  verifyToroMcpBearerToken,
  {
    required: true,
    resourceMetadataPath: "/.well-known/oauth-protected-resource",
  },
);
