"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

import { safeNextPath } from "./safe-next";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("No pudimos entrar. Revisa tu correo y contraseña. No necesitas crear otra cuenta.");
        return;
      }

      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch {
      setError("No pudimos iniciar sesión. Revisa la configuración e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Correo</span>
        <input
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="tu-correo@ejemplo.com"
          className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 caret-slate-950 outline-none focus:border-slate-950"
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
          className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 caret-slate-950 outline-none focus:border-slate-950"
          onChange={(event) => setPassword(event.target.value)}
          required
          type={showPassword ? "text" : "password"}
          value={password}
        />
      </label>
      <button type="button" className="min-h-11 text-sm underline" aria-pressed={showPassword}
        onClick={() => setShowPassword(value => !value)}>
        {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      </button>
      {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
      <button
        className="min-h-12 w-full rounded-xl bg-slate-950 px-4 font-semibold text-white disabled:opacity-50"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Entrando…" : "Entrar a TORO"}
      </button>
      <details className="rounded-xl border border-slate-200 p-3 text-sm">
        <summary className="cursor-pointer font-medium">No sé qué cuenta usar</summary>
        <p className="mt-2">Usa el correo de tu cuenta de trabajo. Si vienes de DreamTeam, empieza con el correo que usas allí. No necesitas inventar un usuario nuevo.</p>
        <p className="mt-2">Cada sitio puede pedirte entrar por separado. Si no recuerdas tu contraseña, usa la recuperación de tu cuenta en DreamTeam. No la compartas por chat.</p>
        <a className="mt-3 inline-block underline" href="https://dream-team-public.vercel.app/dreamteam/ingresar" target="_blank" rel="noopener noreferrer">Abrir el acceso de DreamTeam ↗</a>
      </details>
    </form>
  );
}
