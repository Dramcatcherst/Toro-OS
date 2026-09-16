"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    if (pending) return;

    setError(null);
    setPending(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError("No pudimos cerrar la sesión. Inténtalo de nuevo.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError("No pudimos cerrar la sesión. Inténtalo de nuevo.");
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
        </p>
      ) : null}
    </div>
  );
}
