/** A single cancellable deadline for an entire authentication operation. */
export async function withAuthBudget<T>(milliseconds: number, work: (signal: AbortSignal) => Promise<T>, parent?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort(new Error("authentication_deadline"));
  const timer = setTimeout(abort, milliseconds);
  parent?.addEventListener("abort", abort, { once: true });
  if (parent?.aborted) abort();
  let onAbort: () => void = () => {};
  try {
    return await new Promise<T>((resolve, reject) => {
      onAbort = () => reject(controller.signal.reason);
      controller.signal.addEventListener("abort", onAbort, { once: true });
      if (controller.signal.aborted) { onAbort(); return; }
      Promise.resolve().then(() => work(controller.signal)).then(resolve, reject);
    });
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", onAbort);
  }
}

/** Pass cancellation into actual I/O, including the SDK's refresh/retry calls. */
export function authFetch(signal: AbortSignal): typeof fetch {
  return (input, init) => {
    signal.throwIfAborted();
    const incoming = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    return fetch(input, { ...init, signal: incoming ? AbortSignal.any([signal, incoming]) : signal });
  };
}
