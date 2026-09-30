import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from "mcp-handler";

import {
  getToroMcpRuntimeConfig,
  isToroMcpEnabled,
} from "@/features/mcp/config";

function disabledResponse() {
  return new Response(null, { status: 404 });
}

function unconfiguredResponse() {
  return Response.json(
    { error: "TORO MCP OAuth metadata is not configured." },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  if (!isToroMcpEnabled()) return disabledResponse();

  const config = getToroMcpRuntimeConfig();
  if (!config) return unconfiguredResponse();

  const handler = protectedResourceHandler({
    authServerUrls: [config.authServerUrl],
    resourceUrl: config.resourceUrl,
  });

  return handler(request);
}

export async function OPTIONS(request: Request) {
  if (!isToroMcpEnabled()) return disabledResponse();

  const config = getToroMcpRuntimeConfig();
  if (!config) return unconfiguredResponse();

  return metadataCorsOptionsRequestHandler()(request);
}
