import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 text-neutral-950 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Dreamcatcher</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Entrar a TORO</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-neutral-600">
          Acceso interno. Verás únicamente las áreas permitidas para tu rol.
        </p>
        <Suspense fallback={<p className="text-sm text-neutral-500">Cargando acceso…</p>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
