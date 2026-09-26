"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setPending(true);
    setError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      // On a shared device, end this browser session without closing sessions on other devices.
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) {
        setError("No se pudo cerrar la sesión. Inténtalo de nuevo antes de entregar el teléfono.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo antes de entregar el teléfono.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={pending}
        onClick={handleSignOut}
        className="min-h-11 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-white hover:border-cyan-300/40 disabled:opacity-50"
      >
        {pending ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error ? <p role="alert" className="mt-2 text-xs text-amber-200">{error}</p> : null}
    </div>
  );
}
