export const PORTAL_READ_REFRESH_MS = 120_000;

/** UI reads only. Source timestamps and business state never change here. */
export function createPortalReadRefresh(input: {
  now: () => number; ready: () => boolean; refresh: () => void;
  schedule: (callback: () => void, delay: number) => () => void;
}) {
  let lastRequest = input.now();
  let lastManualRequest = Number.NEGATIVE_INFINITY;
  let active = true;
  function request(manual = false) {
    const now = input.now();
    const elapsed = now - lastRequest;
    if (!active || !input.ready() || !Number.isFinite(now) ||
        !Number.isFinite(elapsed) || (manual ? now - lastManualRequest < 1_000 : elapsed < PORTAL_READ_REFRESH_MS)) return false;
    lastRequest = now;
    if (manual) lastManualRequest = now;
    input.refresh();
    return true;
  }
  const cancel = input.schedule(() => request(), PORTAL_READ_REFRESH_MS);
  return { request, stop() { active = false; cancel(); } };
}
