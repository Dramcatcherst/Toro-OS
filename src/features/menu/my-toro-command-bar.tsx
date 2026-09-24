"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { resolveToroMenuIntent } from "./resolver";
import type { ToroCapabilitySafeAlternative } from "./server";
import type { ToroResolvedMenu } from "./types";

export function MyToroCommandBar({
  menu,
  focusableCapabilities,
  currentFocus,
  availableSubmenus,
  capabilityAlternatives,
}: {
  menu: ToroResolvedMenu;
  focusableCapabilities: string[];
  currentFocus?: string | null;
  availableSubmenus: Record<string, ToroResolvedMenu>;
  capabilityAlternatives: Record<string, ToroCapabilitySafeAlternative>;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [safeAlternative, setSafeAlternative] =
    useState<ToroCapabilitySafeAlternative | null>(null);
  const [activeSubmenuKey, setActiveSubmenuKey] = useState<string | null>(null);
  const focusable = useMemo(
    () => new Set(focusableCapabilities),
    [focusableCapabilities],
  );

  const activeMenu =
    (activeSubmenuKey && availableSubmenus[activeSubmenuKey]) || menu;

  const suggestions = activeMenu.items
    .filter((item) => item.capability !== currentFocus)
    .slice(0, currentFocus || activeSubmenuKey ? 2 : 3);

  function navigateToCapability(capability: string) {
    router.push(`/my-toro?focus=${encodeURIComponent(capability)}`);
  }

  function handleValue(raw: string) {
    const value = raw.trim();
    if (!value) return;

    const normalized = value.toLowerCase();
    if (
      currentFocus &&
      ["continuar", "siguiente", "seguir"].includes(normalized)
    ) {
      const ordered = menu.items.filter((item) =>
        focusable.has(item.capability),
      );
      const currentIndex = ordered.findIndex(
        (item) => item.capability === currentFocus,
      );
      const next =
        currentIndex >= 0 ? ordered[currentIndex + 1] ?? ordered[0] : ordered[0];

      if (next && next.capability !== currentFocus) {
        setFeedback(null);
      setSafeAlternative(null);
        navigateToCapability(next.capability);
      } else {
        setFeedback("No hay otra lectura disponible ahora. Puedes volver al inicio.");
      }
      return;
    }

    const resolution = resolveToroMenuIntent(activeMenu, value);

    if (resolution.kind === "home") {
      setFeedback(null);
      setSafeAlternative(null);
      setActiveSubmenuKey(null);
      router.push("/my-toro");
      return;
    }

    if (resolution.kind === "back") {
      setFeedback(null);
      setSafeAlternative(null);
      if (activeSubmenuKey) {
        setActiveSubmenuKey(null);
      } else {
        router.push("/my-toro");
      }
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
      const submenu = availableSubmenus[resolution.item.key];
      if (!activeSubmenuKey && submenu) {
        setFeedback(null);
      setSafeAlternative(null);
        setActiveSubmenuKey(resolution.item.key);
        return;
      }

      if (focusable.has(resolution.item.capability)) {
        setFeedback(null);
      setSafeAlternative(null);
        navigateToCapability(resolution.item.capability);
        return;
      }

      const alternative = capabilityAlternatives[resolution.item.capability] ?? null;
      setSafeAlternative(alternative);
      setFeedback(
        alternative
          ? `“${resolution.item.label}” todavía no puede resolverse dentro de TORO con fuente live. Puedes continuar en el canal oficial.`
          : `“${resolution.item.label}” pertenece a tu menú, pero todavía no tiene una lectura actual habilitada en esta superficie.`,
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
        {activeSubmenuKey
          ? "Estás dentro de un submenú seguro. 9 vuelve un nivel."
          : "Escribe un número, una palabra o una frase normal. Aquí solo navegamos lecturas autorizadas."}
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

      {suggestions.length || currentFocus ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeSubmenuKey ? (
            <button
              type="button"
              onClick={() => handleValue("9")}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/40"
            >
              ↩️ Atrás
            </button>
          ) : null}
          {currentFocus ? (
            <button
              type="button"
              onClick={() => handleValue("inicio")}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/40"
            >
              🏠 Inicio
            </button>
          ) : null}
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
          {currentFocus && !activeSubmenuKey && focusableCapabilities.length > 1 ? (
            <button
              type="button"
              onClick={() => handleValue("continuar")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
            >
              ➡️ Continuar
            </button>
          ) : null}
        </div>
      ) : null}

      {feedback ? (
        <div className="mt-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-100/80">
          <div>{feedback}</div>
          {safeAlternative ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={safeAlternative.href}
                target={safeAlternative.external ? "_blank" : undefined}
                rel={safeAlternative.external ? "noreferrer" : undefined}
                className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-2 text-xs font-semibold text-amber-50 hover:border-amber-200/45"
              >
                {safeAlternative.label} <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <span className="max-w-md text-xs leading-5 text-amber-100/60">
                {safeAlternative.note}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
