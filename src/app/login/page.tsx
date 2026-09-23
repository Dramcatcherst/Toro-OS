import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-950/10 bg-white p-6 text-slate-950 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">TORO Brain</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Entra a tu TORO</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-slate-600">
          Entra y TORO te lleva directo a lo que corresponde a tu trabajo. No necesitas elegir módulos ni configurar agentes.
        </p>
        <Suspense fallback={<p className="text-sm text-slate-500">Cargando acceso…</p>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
