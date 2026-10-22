import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getToroMcpRuntimeConfig } from "./config";
import { buildToroRuntimeHealthConfig } from "@/features/runtime/health";

beforeEach(() => {
  vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
  vi.stubEnv("TORO_MCP_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.invalid");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "synthetic-public-fixture");
});
afterEach(() => vi.unstubAllEnvs());

describe("MCP resource URL has the same safe contract in runtime and diagnostics", () => {
  it.each([
    "ftp://localhost/api/mcp",
    "https://user:synthetic-password@synthetic.invalid/api/mcp",
    "https://synthetic.invalid/api/mcp?token=synthetic-token",
    "https://synthetic.invalid/api/mcp#private",
    "http://synthetic.invalid/api/mcp",
  ])("rejects unsafe or credential-bearing resource %s", (resource) => {
    vi.stubEnv("TORO_MCP_RESOURCE_URL", resource);
    expect(getToroMcpRuntimeConfig()).toBeNull();
    expect(buildToroRuntimeHealthConfig({ TORO_MCP_RESOURCE_URL: resource }).mcpResourceConfigured).toBe(false);
  });

  it.each([
    "https://synthetic.invalid/api/mcp",
    "http://localhost:3000/api/mcp",
    "http://127.0.0.1:3000/api/mcp",
    "https://synthetic.invalid/prefix/api/mcp",
  ])("preserves the supported resource %s", (resource) => {
    vi.stubEnv("TORO_MCP_RESOURCE_URL", resource);
    expect(getToroMcpRuntimeConfig()?.resourceUrl).toBe(resource);
    expect(buildToroRuntimeHealthConfig({ TORO_MCP_RESOURCE_URL: resource }).mcpResourceConfigured).toBe(true);
  });
});
