import { afterEach, expect, it, vi } from "vitest";
const { handler } = vi.hoisted(() => ({ handler: vi.fn() }));
vi.mock("@/features/mcp/server", () => ({ toroMcpAuthHandler: handler }));
import { GET as metadata } from "@/app/.well-known/oauth-protected-resource/route";
import { POST as mcp } from "@/app/api/mcp/route";
afterEach(() => vi.unstubAllEnvs());
it.each([metadata, mcp])("R50-01 returns configured failure503 before delegating transport", async route => {
  vi.stubEnv("TORO_MCP_ENABLED", "true");
  vi.stubEnv("TORO_MCP_RESOURCE_URL", "https://synthetic.invalid/api/mcp");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
  expect((await route(new Request("https://synthetic.invalid/api/mcp"))).status).toBe(503);
  expect(handler).not.toHaveBeenCalled();
});
