import "server-only";

import { getSupabasePublicConfig } from "@/lib/supabase/env";

export type ToroMcpRuntimeConfig = {
  resourceUrl: string;
  authServerUrl: string;
};

export function isToroMcpEnabled() {
  return process.env.TORO_MCP_ENABLED === "true";
}

export function getToroMcpRuntimeConfig(): ToroMcpRuntimeConfig | null {
  if (!isToroMcpEnabled()) return null;

  const rawResourceUrl = process.env.TORO_MCP_RESOURCE_URL?.trim();
  if (!rawResourceUrl) return null;

  let resourceUrl: URL;
  try {
    resourceUrl = new URL(rawResourceUrl);
  } catch {
    return null;
  }

  const isLocal =
    resourceUrl.hostname === "localhost" ||
    resourceUrl.hostname === "127.0.0.1";

  if (resourceUrl.protocol !== "https:" && !isLocal) return null;
  if (!resourceUrl.pathname.endsWith("/api/mcp")) return null;

  const { url } = getSupabasePublicConfig();
  const authServerUrl = `${url.replace(/\/$/, "")}/auth/v1`;

  return {
    resourceUrl: resourceUrl.toString(),
    authServerUrl,
  };
}
