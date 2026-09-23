import Link from "next/link";
import { LockKeyhole, UserRound } from "lucide-react";

import { GuidedOnboarding } from "@/features/onboarding/guided-onboarding";
import { resolveCurrentOnboarding } from "@/features/onboarding/server";

export default async function OnboardingPage() {
  const view = await resolveCurrentOnboarding();

  if (!view) {
    return (
      <main className="min-h-screen bg-[#030712] px-5 py-10 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-800 bg-slate-950/80 p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">
            <LockKeyhole className="h-4 w-4" /> Sesión requerida
          </div>
          <h1 className="mt-4 text-3xl font-black text-white">
            Entra a TORO para iniciar tu onboarding.
          </h1>
          <Link
            href="/login?next=/onboarding"
            className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  if (view.state === "context_choice_required") {
    return (
      <main className="min-h-screen bg-[#030712] px-5 py-10 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-cyan-300/15 bg-slate-950/80 p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
            <UserRound className="h-4 w-4" /> Contexto
          </div>
          <h1 className="mt-4 text-3xl font-black text-white">
            {view.firstName}, primero elige el negocio donde quieres entrar.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            TORO no mezcla organizaciones automáticamente.
          </p>
          <Link
            href="/my-toro"
            className="mt-6 inline-flex rounded-full border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300"
          >
            Volver a Mi TORO
          </Link>
        </div>
      </main>
    );
  }

  if (!view.journey) {
    return (
      <main className="min-h-screen bg-[#030712] px-5 py-10 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-800 bg-slate-950/80 p-7">
          <h1 className="text-3xl font-black text-white">
            TORO ya reconoce tu contexto.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Todavía no existe un recorrido específico para este perfil, así que no voy a forzarte a pasar por un onboarding genérico.
          </p>
          <Link
            href="/my-toro"
            className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950"
          >
            Entrar a Mi TORO
          </Link>
        </div>
      </main>
    );
  }

  return (
    <GuidedOnboarding
      firstName={view.firstName}
      businessName={view.businessName}
      journey={view.journey}
      firstValueTargets={view.firstValueTargets}
    />
  );
}
