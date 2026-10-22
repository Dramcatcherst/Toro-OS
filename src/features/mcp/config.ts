import "server-only";
import { internalCapabilityEnabled } from "@/lib/server/public-demo";

import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { normalizeToroMcpResourceUrl } from "./resource-url";

export type ToroMcpRuntimeConfig = {
  resourceUrl: string;
  authServerUrl: string;
};

export function isToroMcpEnabled() {
  return internalCapabilityEnabled("TORO_MCP_ENABLED");
}

export function getToroMcpRuntimeConfig(): ToroMcpRuntimeConfig | null {
  if (!isToroMcpEnabled()) return null;

  const resourceUrl = normalizeToroMcpResourceUrl(process.env.TORO_MCP_RESOURCE_URL);
  if (!resourceUrl) return null;

  let url: string;
  try { ({ url } = getSupabasePublicConfig()); }
  catch { return null; }
  const authServerUrl = `${url.replace(/\/$/, "")}/auth/v1`;

  return {
    resourceUrl,
    authServerUrl,
  };
}
