"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const SIGN_OUT_ERROR =
  "No pudimos confirmar el cierre de todas las sesiones. Inténtalo de nuevo.";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginLink, setShowLoginLink] = useState(false);

  async function signOut() {
    if (pending) return;

    const isRetry = error !== null;
    setError(null);
    setShowLoginLink(false);
    setPending(true);
    try {
      const supabase = createBrowserSupabaseClient();
      if (isRetry) {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setError(SIGN_OUT_ERROR);
          setShowLoginLink(true);
          return;
        }
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(SIGN_OUT_ERROR);
        setShowLoginLink(isRetry);
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError(SIGN_OUT_ERROR);
      setShowLoginLink(isRetry);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex shrink-0 flex-col items-end">
      <button
        type="button"
        onClick={signOut}
        disabled={pending}
        aria-describedby={error ? "sign-out-error" : undefined}
        className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 disabled:opacity-50"
      >
        {pending ? "Saliendo…" : "Salir"}
      </button>
      {error ? (
        <p
          id="sign-out-error"
          role="alert"
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-800 shadow-lg"
        >
          {error}
          {showLoginLink ? (
            <a
              href="/login"
              className="mt-2 block font-medium underline underline-offset-2"
            >
              Iniciar sesión de nuevo
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
