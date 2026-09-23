"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { resolveToroMenuIntent } from "./resolver";
import type { ToroResolvedMenu } from "./types";

export function MyToroCommandBar({
  menu,
  focusableCapabilities,
}: {
  menu: ToroResolvedMenu;
  focusableCapabilities: string[];
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const focusable = useMemo(
    () => new Set(focusableCapabilities),
    [focusableCapabilities],
  );

  const suggestions = menu.items.slice(0, 3);

  function navigateToCapability(capability: string) {
    router.push(`/my-toro?focus=${encodeURIComponent(capability)}`);
  }

  function handleValue(raw: string) {
    const value = raw.trim();
    if (!value) return;

    const resolution = resolveToroMenuIntent(menu, value);

    if (resolution.kind === "home" || resolution.kind === "back") {
      setFeedback(null);
      router.push("/my-toro");
      return;
    }

    if (resolution.kind === "help") {
      setFeedback(
        "Puedes responder con un número, una palabra como “proyectos”, o escribir una frase normal.",
      );
      return;
    }

    if (resolution.kind === "more") {
      setFeedback(
        "Te mostraré opciones secundarias cuando estén conectadas y sean relevantes para tu contexto.",
      );
      return;
    }

    if (resolution.kind === "item") {
      if (focusable.has(resolution.item.capability)) {
        setFeedback(null);
        navigateToCapability(resolution.item.capability);
        return;
      }

      setFeedback(
        `“${resolution.item.label}” pertenece a tu menú, pero todavía no tiene una lectura actual habilitada en esta superficie.`,
      );
      return;
    }

    setFeedback(
      "No quiero adivinar mal. Prueba una de las opciones sugeridas o dilo de otra forma.",
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input;
    setInput("");
    handleValue(value);
  }

  return (
    <section className="mt-5 rounded-[2rem] border border-cyan-300/15 bg-slate-950/75 p-4 md:p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
        <MessageCircle className="h-4 w-4" /> Pregúntale a TORO
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Escribe un número, una palabra o una frase normal. Aquí solo navegamos lecturas autorizadas.
      </p>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder='Ej.: "proyectos", "2" o "quiero ver decisiones"'
          className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
        />
        <button
          type="submit"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {suggestions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleValue(String(item.index))}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
              {focusable.has(item.capability) ? (
                <ArrowRight className="h-3.5 w-3.5 text-cyan-300" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {feedback ? (
        <div className="mt-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-100/80">
          {feedback}
        </div>
      ) : null}
    </section>
  );
}
