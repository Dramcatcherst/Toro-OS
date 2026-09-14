"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("No pudimos iniciar sesión con esas credenciales.");
        return;
      }

      const next = searchParams.get("next");
      router.replace(next?.startsWith("/") ? next : "/toro");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Correo</span>
        <input
          autoComplete="email"
          className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-3 outline-none focus:border-black"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Contraseña</span>
        <input
          autoComplete="current-password"
          className="min-h-12 w-full rounded-xl border border-black/15 bg-white px-3 outline-none focus:border-black"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
      <button
        className="min-h-12 w-full rounded-xl bg-black px-4 font-semibold text-white disabled:opacity-50"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Entrando…" : "Entrar a TORO"}
      </button>
    </form>
  );
}
