import { afterEach, expect, it, vi } from "vitest";
import { getToroMcpRuntimeConfig } from "./config";
import { verifySupabaseBearerToken } from "@/lib/supabase/bearer";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });
function configured() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.invalid");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "synthetic-public-key");
}
it("R50-01 contains missing public configuration as nullable MCP configuration", () => {
  vi.stubEnv("TORO_MCP_ENABLED", "true");
  vi.stubEnv("TORO_MCP_RESOURCE_URL", "https://synthetic.invalid/api/mcp");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
  expect(getToroMcpRuntimeConfig()).toBeNull();
});
it("R50-02 contains unexpected bearer verification errors", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  await expect(verifySupabaseBearerToken("synthetic-token")).resolves.toBeNull();
});
it.each(["headers", "body"])("R50-03 bounds real SDK bearer %s reads and permits the next request", async phase => {
  configured(); vi.useFakeTimers();
  let signal: AbortSignal | undefined;
  let deliver: ((response: Response) => void) | undefined;
  const user = { id: "synthetic-user", aud: "authenticated", role: "authenticated", email: "synthetic@example.invalid", app_metadata: {}, user_metadata: {}, created_at: "2026-10-22T00:00:00Z" };
  const fetchMock = vi.fn<typeof fetch>().mockImplementationOnce(async (_input, init) => {
    signal = init?.signal as AbortSignal;
    if (phase === "headers") return new Promise<Response>(resolve => { deliver = resolve; });
    return new Response(new ReadableStream({ start() {} }), { headers: { "content-type": "application/json" } });
  }).mockImplementation(async () => Response.json(user));
  vi.stubGlobal("fetch", fetchMock);
  const first = verifySupabaseBearerToken("synthetic-first");
  await vi.advanceTimersByTimeAsync(20_000);
  await expect(first).resolves.toBeNull();
  expect(signal?.aborted).toBe(true);
  deliver?.(Response.json(user));
  await vi.advanceTimersByTimeAsync(1);
  const next = await verifySupabaseBearerToken("synthetic-next");
  expect(next?.user.id).toBe("synthetic-user");
  expect(fetchMock).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(60_000);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
it("R50-02 redacts network exceptions before the real auth SDK can log them", async () => {
  configured();
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("synthetic-private-provider-detail")));
  try { expect(await verifySupabaseBearerToken("synthetic-token")).toBeNull(); expect(log).not.toHaveBeenCalled(); }
  finally { log.mockRestore(); }
});
