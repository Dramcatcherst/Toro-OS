"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

import { safeNextPath } from "./safe-next";

export function LoginForm({ dreamTeamAccess = false }: { dreamTeamAccess?: boolean }) {
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
      if (dreamTeamAccess) {
        const response = await fetch("/api/auth/login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email.trim(), password, nextPath: safeNextPath(searchParams.get("next")) }),
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true) {
          setError(result.error || "No pudimos verificar tu acceso.");
          return;
        }
        router.replace(safeNextPath(result.nextPath));
      } else {
        const supabase = createBrowserSupabaseClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) {
          setError("No pudimos entrar. Revisa tu correo y contraseña.");
          return;
        }
        router.replace(safeNextPath(searchParams.get("next")));
      }
      setPassword("");
      router.refresh();
    } catch {
      setError("No pudimos iniciar sesión. Revisa la configuración e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1">
        <span className="text-sm font-medium">{dreamTeamAccess ? "Usuario o correo de DreamTeam" : "Correo"}</span>
        <input
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={dreamTeamAccess ? "Tu usuario habitual" : "tu-correo@ejemplo.com"}
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 caret-slate-950 outline-none focus:border-sky-500"
          onChange={(event) => setEmail(event.target.value)}
          required
          type={dreamTeamAccess ? "text" : "email"}
          maxLength={254}
          value={email}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Contraseña</span>
        <span className="relative block">
        <input
          autoComplete="current-password"
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-12 text-slate-950 caret-slate-950 outline-none focus:border-sky-500"
          onChange={(event) => setPassword(event.target.value)}
          required
          type={showPassword ? "text" : "password"}
          value={password}
          maxLength={128}
        />
        <button type="button" className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center text-slate-600"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}
          onClick={() => setShowPassword(value => !value)}>
          {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
        </button>
        </span>
      </label>
      {error ? <p className="text-sm text-amber-300" role="alert">{error}</p> : null}
      <button
        className="min-h-11 w-full rounded-lg bg-slate-950 px-4 font-semibold text-white disabled:opacity-50"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Entrando…" : "Entrar a TORO"}
      </button>
      <details className="rounded-lg border border-slate-600 px-3 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium">Ayuda de acceso</summary>
        <p className="mb-2">{dreamTeamAccess ? "Mismo usuario y contraseña. La sesión de este sitio se abre por separado." : "Usa tu correo de trabajo."}</p>
        <a className="inline-flex min-h-11 items-center underline" href="https://dream-team-public.vercel.app/dreamteam/ingresar" target="_blank" rel="noopener noreferrer">Abrir DreamTeam ↗</a>
      </details>
    </form>
  );
}
