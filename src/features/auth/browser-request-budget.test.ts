import { afterEach, beforeEach, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createBrowserClient: sdk.create }));
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "synthetic-public-config");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", undefined);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function configuredFetch(): typeof fetch {
  createBrowserSupabaseClient();
  return sdk.create.mock.calls.at(-1)?.[2]?.global?.fetch ?? fetch;
}

it("uses a stable transport without tying the cached browser client to one request", () => {
  configuredFetch();
  const first = sdk.create.mock.calls.at(-1)?.[2]?.global?.fetch;
  configuredFetch();
  const second = sdk.create.mock.calls.at(-1)?.[2]?.global?.fetch;
  expect(first).toBeTypeOf("function");
  expect(first).toBe(second);
  expect(sdk.create.mock.calls.at(-1)?.[2]?.isSingleton).not.toBe(false);
});

it("aborts slow network I/O and permits the next request on the same transport", async () => {
  const signals: AbortSignal[] = [];
  const network = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.signal) signals.push(init.signal);
    if (signals.length > 1) return Promise.resolve(Response.json({ ok: true }));
    return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("synthetic timeout")), { once: true }));
  });
  vi.stubGlobal("fetch", network);
  const transport = configuredFetch();
  let rejected = false;
  const pending = transport("https://synthetic.supabase.co/auth/v1/token?grant_type=password").catch(() => { rejected = true; });
  await vi.advanceTimersByTimeAsync(15_001);
  expect(rejected).toBe(true);
  expect(signals[0]?.aborted).toBe(true);
  await pending;
  const response = await transport("https://synthetic.supabase.co/auth/v1/token?grant_type=refresh_token");
  expect(await response.json()).toEqual({ ok: true });
  expect(signals[1]).not.toBe(signals[0]);
  expect(signals[1].aborted).toBe(false);
});

it("includes a stalled response body in the budget and cancels its reader", async () => {
  const cancel = vi.fn();
  let signal: AbortSignal | undefined;
  const network = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    signal = init?.signal ?? undefined;
    return Promise.resolve(new Response(new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(new TextEncoder().encode('{"ok":')); }, cancel,
    }), { headers: { "Content-Type": "application/json" } }));
  });
  vi.stubGlobal("fetch", network);
  const transport = configuredFetch();
  let rejected = false;
  const pending = transport("https://synthetic.supabase.co/auth/v1/token?grant_type=password")
    .then(response => response.json()).catch(() => { rejected = true; });
  await vi.advanceTimersByTimeAsync(15_001);
  expect(rejected).toBe(true);
  expect(signal?.aborted).toBe(true);
  expect(cancel).toHaveBeenCalledOnce();
  await pending;
  network.mockImplementationOnce(() => Promise.resolve(Response.json({ recovered: true })));
  expect(await (await transport("https://synthetic.supabase.co/auth/v1/user")).json()).toEqual({ recovered: true });
});

it.each([204, 205, 304])("preserves a bodyless %s response and its headers", async status => {
  const upstream = new Response(null, { status, statusText: "Synthetic status", headers: { "X-Synthetic": "preserved" } });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(upstream));
  const response = await configuredFetch()("https://synthetic.supabase.co/auth/v1/user");
  expect(response).toBe(upstream);
  expect(response.body).toBeNull();
  expect(response.status).toBe(status);
  expect(response.statusText).toBe("Synthetic status");
  expect(response.headers.get("X-Synthetic")).toBe("preserved");
});

it("preserves status, headers and response bytes when a body is read within budget", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"ok":false}', {
    status: 401, statusText: "Synthetic denial", headers: { "Content-Type": "application/json", "Retry-After": "12" },
  })));
  const response = await configuredFetch()("https://synthetic.supabase.co/auth/v1/token?grant_type=password");
  expect(response.status).toBe(401);
  expect(response.statusText).toBe("Synthetic denial");
  expect(response.headers.get("Retry-After")).toBe("12");
  expect(await response.json()).toEqual({ ok: false });
});
