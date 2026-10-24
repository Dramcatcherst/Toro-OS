import { publicDemoResponse } from "@/lib/server/public-demo";
import {
  getToroMcpRuntimeConfig,
  isToroMcpEnabled,
} from "@/features/mcp/config";
import { toroMcpAuthHandler } from "@/features/mcp/server";

function disabledResponse() {
  return new Response(null, { status: 404 });
}

function unconfiguredResponse() {
  return Response.json(
    { error: "TORO MCP runtime configuration is incomplete." },
    { status: 503 },
  );
}

async function handle(request: Request) {
  const demo = publicDemoResponse();
  if (demo) return demo;
  if (!isToroMcpEnabled()) return disabledResponse();

  const config = getToroMcpRuntimeConfig();
  if (!config) return unconfiguredResponse();

  return toroMcpAuthHandler(request);
}

export { handle as GET, handle as POST };
