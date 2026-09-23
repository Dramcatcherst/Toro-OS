"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type {
  ToroOnboardingFirstValueTarget,
  ToroOnboardingJourney,
  ToroOnboardingStep,
} from "./server";

type Answer = {
  stepKey: string;
  choiceKey?: string;
  label: string;
};

function fillTemplate(
  value: string | undefined,
  firstName: string,
  businessName: string,
) {
  if (!value) return "";
  return value
    .replaceAll("{first_name}", firstName)
    .replaceAll("{business_name}", businessName);
}

function dynamicChoices(journeyKey: string) {
  if (journeyKey === "specialist_office") {
    return [
      { key: "pending", emoji: "⚠️", label: "Ver pendientes" },
      { key: "work", emoji: "📋", label: "Mi trabajo" },
      { key: "other", emoji: "💬", label: "Preguntar otra cosa" },
    ];
  }
  return [];
}

export function GuidedOnboarding({
  firstName,
  businessName,
  journey,
  firstValueTargets,
}: {
  firstName: string;
  businessName: string;
  journey: ToroOnboardingJourney;
  firstValueTargets: ToroOnboardingFirstValueTarget[];
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [input, setInput] = useState("");

  const selectedChoiceKeys = new Set(
    answers.map((answer) => answer.choiceKey).filter(Boolean),
  );
  const orderedFirstValueTargets = [
    ...firstValueTargets.filter((target) => selectedChoiceKeys.has(target.key)),
    ...firstValueTargets.filter((target) => !selectedChoiceKeys.has(target.key)),
  ].slice(0, 3);

  const complete = stepIndex >= journey.steps.length;
  const step: ToroOnboardingStep | null = complete
    ? null
    : journey.steps[stepIndex];

  const choices = useMemo(() => {
    if (!step) return [];
    if (step.choices?.length) return step.choices.slice(0, 3);
    if (step.dynamic_choices) return dynamicChoices(journey.key).slice(0, 3);
    return [];
  }, [journey.key, step]);

  function advance(label?: string, choiceKey?: string) {
    if (step && label) {
      setAnswers((current) => [
        ...current,
        { stepKey: step.key, choiceKey, label },
      ]);
    }
    setInput("");
    setStepIndex((current) => current + 1);
  }

  function back() {
    if (stepIndex <= 0) return;
    const previousIndex = stepIndex - 1;
    const previousStep = journey.steps[previousIndex];
    setStepIndex(previousIndex);
    setAnswers((current) =>
      current.filter((answer) => answer.stepKey !== previousStep?.key),
    );
    setInput("");
  }

  function restart() {
    setStepIndex(0);
    setAnswers([]);
    setInput("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;

    const normalized = value.toLowerCase();

    if (["0", "inicio", "menú", "menu"].includes(normalized)) {
      router.push("/my-toro");
      return;
    }
    if (["9", "atrás", "atras"].includes(normalized)) {
      back();
      return;
    }
    if (["saltar", "después", "despues", "ahora no"].includes(normalized)) {
      advance("Saltado por ahora");
      return;
    }
    if (["continuar", "seguir"].includes(normalized)) {
      advance("Continuar");
      return;
    }

    const numeric = Number(value);
    if (
      Number.isInteger(numeric) &&
      numeric >= 1 &&
      numeric <= choices.length
    ) {
      advance(choices[numeric - 1].label, choices[numeric - 1].key);
      return;
    }

    advance(value);
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
        <header className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/80 p-5 shadow-2xl md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                <Sparkles className="h-4 w-4" /> Onboarding TORO
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
                Hazlo fácil desde el principio.
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Puedes responder con un número, una palabra o escribir normal.
                Reiniciar esta guía no borra nada de tu cuenta ni de {businessName}.
              </p>
            </div>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-300/30 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2">
            {journey.steps.map((item, index) => (
              <span
                key={item.key}
                className={[
                  "h-1.5 flex-1 rounded-full",
                  index < stepIndex
                    ? "bg-emerald-300"
                    : index === stepIndex && !complete
                      ? "bg-cyan-300"
                      : "bg-slate-800",
                ].join(" ")}
              />
            ))}
          </div>
        </header>

        <section className="mt-5 rounded-[2rem] border border-slate-800 bg-slate-950/75 p-5 md:p-6">
          {complete ? (
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
                <CheckCircle2 className="h-4 w-4" /> Listo
              </div>
              <h2 className="mt-4 text-3xl font-black text-white">
                Ya tienes lo necesario para empezar.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                No necesitas completar más configuración para empezar. TORO te deja primero lo que ya puede consultar con fuente y permiso.
              </p>

              {orderedFirstValueTargets.length ? (
                <div className="mt-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Puedes empezar ahora con
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {orderedFirstValueTargets.map((target, index) => (
                      <button
                        key={target.capability}
                        type="button"
                        onClick={() => router.push(target.href)}
                        className={[
                          "rounded-2xl border p-4 text-left transition",
                          index === 0
                            ? "border-cyan-300/30 bg-cyan-300/[0.08] hover:border-cyan-300/50"
                            : "border-slate-800 bg-black/25 hover:border-slate-700",
                        ].join(" ")}
                      >
                        <div className="text-sm font-semibold text-white">{target.label}</div>
                        <div className="mt-1 text-xs text-slate-500">Lectura disponible</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-black/25 p-4 text-sm leading-6 text-slate-400">
                  TORO ya conoce tu contexto, pero todavía no hay una lectura específica que pueda abrir aquí con suficiente evidencia. Puedes entrar a Mi TORO y ver qué está disponible.
                </div>
              )}

              {answers.length ? (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-black/25 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Lo que elegiste en esta sesión
                  </div>
                  <div className="mt-3 space-y-2">
                    {answers.slice(0, 4).map((answer) => (
                      <div
                        key={answer.stepKey}
                        className="text-sm text-slate-300"
                      >
                        • {answer.label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/my-toro")}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950"
                >
                  Entrar a Mi TORO <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" /> Hacerlo de nuevo
                </button>
              </div>
            </div>
          ) : step ? (
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Paso {stepIndex + 1} de {journey.steps.length}
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-slate-800 bg-slate-900/80 px-4 py-4 text-sm leading-6 text-slate-200">
                {fillTemplate(step.message, firstName, businessName)}
              </div>

              {step.prompt ? (
                <h2 className="mt-5 text-2xl font-black text-white">
                  {fillTemplate(step.prompt, firstName, businessName)}
                </h2>
              ) : null}

              {choices.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {choices.map((choice, index) => (
                    <button
                      key={choice.key}
                      type="button"
                      onClick={() => advance(choice.label, choice.key)}
                      className="rounded-2xl border border-slate-800 bg-black/25 p-4 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.05]"
                    >
                      <div className="text-xl">{choice.emoji ?? "➡️"}</div>
                      <div className="mt-2 font-semibold text-white">
                        {index + 1}. {choice.label}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {step.free_text ? (
                <p className="mt-4 text-sm text-slate-500">
                  {fillTemplate(step.free_text, firstName, businessName)}
                </p>
              ) : null}

              <form onSubmit={submit} className="mt-5 flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Escribe aquí o responde con un número"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  aria-label="Continuar"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 px-3 py-1.5 text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Atrás
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => advance("Saltado por ahora")}
                  className="rounded-full border border-slate-800 px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Saltar
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/my-toro")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  <Home className="h-3.5 w-3.5" /> Inicio
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <p className="mt-4 text-center text-xs leading-5 text-slate-600">
          Esta versión no guarda “completado” todavía. Eso evita que una prueba
          te bloquee el onboarding y mantiene intacto el estado canónico.
        </p>
      </div>
    </div>
  );
}
