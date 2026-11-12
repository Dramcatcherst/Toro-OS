"use client";

import { useEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

export const PRIVATE_VIEW_INVALIDATION_KEY = "toro_private_view_invalidation_v1";

/** A content-free UI invalidation signal, never an identity or session grant. */
export function notifyPrivateViews() {
  try {
    window.localStorage.setItem(PRIVATE_VIEW_INVALIDATION_KEY,
      globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
  } catch {
    // Storage can be disabled. The native same-origin logout POST still works.
  }
}

/** Discard private DOM before leaving or restoring a cached document. */
export function PrivateViewGuard({ children }: { children: ReactNode }) {
  const [invalidated, setInvalidated] = useState(false);
  useEffect(() => {
    const discard = () => { flushSync(() => setInvalidated(true)); };
    const storage = (event: StorageEvent) => {
      if (event.key !== PRIVATE_VIEW_INVALIDATION_KEY || !event.newValue) return;
      discard();
      // A private-page reload could race the other tab's pending logout POST.
      // The login document never contains the old private page's server payload.
      window.location.replace("/login?next=/my-toro");
    };
    const pagehide = () => { discard(); };
    const pageshow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      discard();
      // Authentication and scope are checked anew by the existing server page.
      window.location.reload();
    };
    window.addEventListener("storage", storage);
    window.addEventListener("pagehide", pagehide);
    window.addEventListener("pageshow", pageshow);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("pagehide", pagehide);
      window.removeEventListener("pageshow", pageshow);
    };
  }, []);
  return invalidated ? null : children;
}
