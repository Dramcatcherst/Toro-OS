import { authFetch, withAuthBudget } from "@/features/auth/request-budget";

// Stable for the cached client. Each call owns its own deadline, so a timed-out
// password request never leaves the client's next refresh using an aborted signal.
export const browserAuthFetch: typeof fetch = (input, init) => withAuthBudget(15_000, async signal => {
  const response = await authFetch(signal)(input, init);
  if (!response.body) return response;

  // Auth parses JSON after fetch resolves. Finish reading inside this same
  // budget so headers arriving promptly cannot leave sign-in waiting on a body.
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    signal.throwIfAborted();
    for (;;) {
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      chunks.push(value);
      length += value.byteLength;
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return new Response(bytes, { status: response.status, statusText: response.statusText, headers: response.headers });
  } finally {
    signal.removeEventListener("abort", cancel);
    cancel();
  }
}, init?.signal ?? (input instanceof Request ? input.signal : undefined));
