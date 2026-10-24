import { authFetch, withAuthBudget } from "@/features/auth/request-budget";

export const SUPABASE_READ_TIMEOUT_MS = 8_000;

/** Each SDK fetch owns its deadline through body consumption, including retries. */
export function boundedSupabaseReadFetch(parent?: AbortSignal): typeof fetch {
  return (input, init) => {
    const incoming = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    const requestParent = parent && incoming ? AbortSignal.any([parent, incoming]) : parent ?? incoming;
    return withAuthBudget(SUPABASE_READ_TIMEOUT_MS, async signal => {
      const response = await authFetch(signal)(input, init);
      signal.throwIfAborted();
      if (!response.body) return response;
      const reader = response.body.getReader();
      const cancel = () => { void reader.cancel().catch(() => {}); };
      const chunks: Uint8Array[] = [];
      let size = 0;
      signal.addEventListener("abort", cancel, { once: true });
      try {
        for (;;) {
          signal.throwIfAborted();
          const { done, value } = await reader.read();
          signal.throwIfAborted();
          if (done) break;
          chunks.push(value);
          size += value.byteLength;
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
        return new Response(bytes, { status: response.status, statusText: response.statusText, headers: response.headers });
      } finally {
        signal.removeEventListener("abort", cancel);
        cancel();
      }
    }, requestParent).catch(() => Response.json({ message: "TORO read source unavailable." }, { status: 503 }));
  };
}
