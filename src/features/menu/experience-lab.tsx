"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, MessageCircle, RotateCcw, Send, ShieldCheck, Sparkles } from "lucide-react";

import submenusData from "../../../data/toro_conversational_submenus_v2.json";
import { resolveToroMenu, resolveToroMenuIntent } from "./resolver";
import type {
  ToroMenuAvailabilityState,
  ToroMenuResolutionInput,
  ToroResolvedMenu,
  ToroResolvedMenuItem,
} from "./types";

type PersonaId = "owner" | "reception" | "tere_prospect" | "tere_guest";

type Persona = {
  id: PersonaId;
  label: string;
  subtitle: string;
  greeting: string;
  input: ToroMenuResolutionInput;
  capabilities: string[];
};

type ChatMessage = {
  id: number;
  actor: "toro" | "user";
  text: string;
};

type SubmenuItem = {
  key: string;
  emoji: string;
  label: string;
  aliases: string[];
  capability: string;
};

const personas: Persona[] = [
  {
    id: "owner",
    label: "Owner",
    subtitle: "Mauricio · visión ejecutiva",
    greeting:
      "Buen día, Mauricio. Ya separé lo importante de lo que puede esperar. ¿Qué quieres revisar primero?",
    input: {
      mode: "organization",
      roles: ["ADMIN"],
      positionName: "Gerente General",
      positionCode: "GENERAL_MANAGER",
    },
    capabilities: [
      "executive.brief",
      "executive.decisions",
      "finance.exceptions",
      "operations.exceptions",
      "projects.status",
    ],
  },
  {
    id: "reception",
    label: "Recepción",
    subtitle: "Camila · atención y venta",
    greeting:
      "Hola, Camila 👋 Tengo recepción ordenada para que llegues rápido a lo importante.",
    input: {
      mode: "organization",
      roles: ["EMPLEADO"],
      positionName: "Recepción",
      positionCode: "RECEPTION",
    },
    capabilities: [
      "guest.arrivals_departures",
      "comms.guest_messages",
      "hospitality.quote",
      "catalog.rooms_villas",
      "catalog.experiences",
    ],
  },
  {
    id: "tere_prospect",
    label: "TERE · Prospecto",
    subtitle: "Primer contacto comercial",
    greeting:
      "¡Hola! Soy Tere 😊 Cuéntame qué estás buscando y te lo hago fácil.",
    input: {
      mode: "organization",
      externalAudience: "guest_or_prospect",
      guestLifecycle: "inquiry",
    },
    capabilities: [
      "hospitality.search_stay",
      "hospitality.quote",
      "catalog.experiences",
      "guest.hotel_info",
      "guest.ask",
    ],
  },
  {
    id: "tere_guest",
    label: "TERE · Huésped",
    subtitle: "Reserva conocida · durante la estadía",
    greeting:
      "Hola, Sofía 👋 Ya tengo tu estadía en contexto. ¿Qué necesitas?",
    input: {
      mode: "organization",
      externalAudience: "guest",
      guestLifecycle: "in_stay",
    },
    capabilities: [
      "guest.arrival",
      "guest.stay_details",
      "catalog.experiences",
      "catalog.breakfast_extras",
      "guest.request_help",
    ],
  },
];

const submenuMap: Partial<Record<PersonaId, Record<string, string>>> = {
  owner: {
    money: "owner_money",
  },
  reception: {
    quote_sell: "reception_quote",
    guest_messages: "reception_guest_messages",
  },
  tere_prospect: {
    quote: "guest_prospect_quote",
  },
  tere_guest: {
    help: "guest_reserved_help",
  },
};

const syntheticReplies: Record<string, string> = {
  "executive.brief":
    "Hoy pondría tu atención en 2 decisiones y 1 excepción operativa. En producción esto vendría de fuentes verificadas; aquí es una simulación de experiencia.",
  "executive.decisions":
    "Tienes una decisión lista para revisar. Puedo mostrarte el contexto, la evidencia o dejar preparada la aprobación.",
  "projects.status":
    "Te mostraría solo proyectos con movimiento, bloqueo o decisión pendiente, no una lista completa por defecto.",
  "operations.exceptions":
    "Primero aparecerían las excepciones que pueden afectar huéspedes, operación o dinero hoy.",
  "guest.arrivals_departures":
    "Recepción vería llegadas y salidas priorizadas por lo que necesita acción, no solo por hora.",
  "catalog.rooms_villas":
    "Puedo ayudarte a comparar habitaciones y villas por fit del huésped, capacidad y contexto comercial.",
  "catalog.experiences":
    "Te mostraría 1–3 experiencias que realmente encajen con esta persona, no un catálogo interminable.",
  "guest.hotel_info":
    "Puedo responder sobre Dreamcatcher de forma breve y luego ayudarte con el siguiente paso.",
  "guest.ask":
    "Claro. Escríbeme la pregunta como te salga; no tienes que usar el menú.",
  "guest.arrival":
    "Te ayudaría con tu llegada usando solo la información vigente y segura para huéspedes.",
  "guest.stay_details":
    "Puedo ayudarte con tu habitación o villa y llevar el contexto de tu estadía sin hacerte repetir todo.",
  "catalog.breakfast_extras":
    "Te mostraría desayuno y extras disponibles según el contexto autorizado de tu estadía.",
  "hospitality.search_stay":
    "Perfecto. Puedo empezar con fechas, cantidad de personas o simplemente con el tipo de viaje que tienes en mente.",
  "hospitality.quote":
    "Vamos a cotizarlo fácil. Primero necesito solo lo que cambie la recomendación: fechas y personas.",
  "hospitality.recommend":
    "Te propondría máximo 1–3 opciones y te diría por qué encajan, no solo cuál cuesta más.",
  "pms.live_availability_price":
    "En producción esto requiere autoridad live del PMS. El sandbox muestra la experiencia, no inventa disponibilidad.",
  "guest.followup":
    "Aquí continuaríamos una cotización existente sin hacer que recepción vuelva a buscar todo desde cero.",
  "comms.guest_messages":
    "Abriría solo conversaciones que necesitan atención y conservaría la continuidad aunque cambie el canal.",
  "guest.issue_handoff":
    "Primero resolveríamos el problema y crearíamos el handoff operativo necesario. Nada de vender mientras el huésped necesita ayuda.",
  "guest.followup_reviews":
    "Después de la estadía, TORO puede preparar seguimiento y reputación sin duplicar mensajes entre canales.",
  "finance.obligations":
    "Mostraría qué vence hoy, qué está confirmado y qué todavía necesita evidencia.",
  "finance.collections":
    "La cola de cobros debe usar el estado financiero vigente antes de enviar cualquier seguimiento.",
  "finance.export_reports":
    "Prepararía el reporte del periodo con las diferencias visibles, no escondidas.",
  "guest.request_help":
    "Entendido. Primero me enfoco en resolver esto. Puedo tomar el detalle, una foto o pasarlo a recepción según el caso.",
};

function capabilityStates(capabilities: string[]) {
  return Object.fromEntries(
    capabilities.map((capability) => [capability, "READY" as ToroMenuAvailabilityState]),
  );
}

function toResolvedSubmenu(id: string, persona: Persona): ToroResolvedMenu | null {
  const map = submenusData.submenus as Record<string, SubmenuItem[]>;
  const items = map[id];
  if (!items) return null;

  const allowed = new Set([
    ...persona.capabilities,
    "finance.obligations",
    "finance.collections",
    "finance.export_reports",
    "guest.followup",
    "hospitality.recommend",
    "pms.live_availability_price",
    "guest.issue_handoff",
    "guest.followup_reviews",
  ]);

  return {
    profileId: id,
    selectionReason: "experience_lab_submenu",
    hiddenCapabilityCount: 0,
    items: items
      .filter((item) => allowed.has(item.capability))
      .map((item, index) => ({
        ...item,
        index: index + 1,
        state: "READY" as const,
      })),
  };
}

function menuText(menu: ToroResolvedMenu) {
  return menu.items
    .map((item) => `${item.index}️⃣ ${item.emoji} ${item.label}`)
    .join("\n");
}

function continuationText(persona: PersonaId, capability: string) {
  if (capability === "hospitality.quote" || capability === "hospitality.recommend") {
    return "1️⃣ Seguir con esto\n2️⃣ Cambiar una opción\n0️⃣ Inicio";
  }
  if (capability === "guest.request_help") {
    return "1️⃣ Agregar un detalle\n2️⃣ Mandar una foto\n0️⃣ Inicio";
  }
  if (persona === "owner") {
    return "1️⃣ Ver detalle\n2️⃣ Seguir con lo próximo\n0️⃣ Inicio";
  }
  return "1️⃣ Continuar\n2️⃣ Ver otra opción\n0️⃣ Inicio";
}

export function ToroExperienceLab() {
  const [personaId, setPersonaId] = useState<PersonaId>("owner");
  const [submenuId, setSubmenuId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [counter, setCounter] = useState(2);
  const persona = personas.find((item) => item.id === personaId) ?? personas[0];

  const primaryMenu = useMemo(
    () =>
      resolveToroMenu({
        ...persona.input,
        capabilityStates: capabilityStates(persona.capabilities),
        hasSecondaryOptions: false,
      }),
    [persona],
  );

  const activeMenu = useMemo(() => {
    if (submenuId) return toResolvedSubmenu(submenuId, persona);
    return primaryMenu;
  }, [primaryMenu, persona, submenuId]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, actor: "toro", text: personas[0].greeting },
  ]);

  function reset(nextPersona: Persona = persona) {
    setSubmenuId(null);
    setInput("");
    setCounter(2);
    setMessages([{ id: 1, actor: "toro", text: nextPersona.greeting }]);
  }

  function switchPersona(id: PersonaId) {
    const next = personas.find((item) => item.id === id) ?? personas[0];
    setPersonaId(id);
    setSubmenuId(null);
    setInput("");
    setCounter(2);
    setMessages([{ id: 1, actor: "toro", text: next.greeting }]);
  }

  function append(actor: ChatMessage["actor"], text: string) {
    setMessages((current) => [...current, { id: counter, actor, text }]);
    setCounter((value) => value + 1);
  }

  function handleResolvedItem(item: ToroResolvedMenuItem) {
    const submenu = submenuMap[persona.id]?.[item.key];
    if (submenu) {
      const resolved = toResolvedSubmenu(submenu, persona);
      setSubmenuId(submenu);
      append(
        "toro",
        resolved
          ? `Perfecto. Aquí tienes lo más útil:\n\n${menuText(resolved)}\n\n9️⃣ Atrás · 0️⃣ Inicio`
          : "Ese submenú todavía no está disponible en el sandbox.",
      );
      return;
    }

    const body =
      syntheticReplies[item.capability] ??
      `Abriría “${item.label}” usando la capacidad ${item.capability}. Este sandbox no ejecuta acciones externas.`;

    append(
      "toro",
      `${body}\n\n¿Qué hacemos ahora?\n${continuationText(persona.id, item.capability)}`,
    );
  }

  function process(raw: string) {
    const value = raw.trim();
    if (!value || !activeMenu) return;

    append("user", value);

    if (["continuar", "dale", "sí", "si"].includes(value.toLowerCase())) {
      append(
        "toro",
        "Continuamos desde el contexto activo. En producción TORO retomaría el workflow abierto sin hacerte repetir lo anterior.\n\n1️⃣ Seguir\n2️⃣ Cambiar algo\n0️⃣ Inicio",
      );
      return;
    }

    const resolution = resolveToroMenuIntent(activeMenu, value);

    if (resolution.kind === "home") {
      setSubmenuId(null);
      append(
        "toro",
        primaryMenu
          ? `${persona.greeting}\n\n${menuText(primaryMenu)}\n\nPuedes responder con número, palabra o escribir normal.`
          : "No hay un menú disponible para este contexto.",
      );
      return;
    }

    if (resolution.kind === "back") {
      if (submenuId) {
        setSubmenuId(null);
        append(
          "toro",
          primaryMenu
            ? `Volvemos al inicio de ${persona.label}.\n\n${menuText(primaryMenu)}`
            : "Volvimos al inicio.",
        );
      } else {
        append("toro", "Ya estás en el menú principal. Puedes elegir una opción o escribir lo que necesitas.");
      }
      return;
    }

    if (resolution.kind === "more") {
      append(
        "toro",
        "En producción aquí aparecerían solo opciones secundarias permitidas y relevantes para esta persona. El sandbox mantiene la primera capa corta a propósito.",
      );
      return;
    }

    if (resolution.kind === "help") {
      append(
        "toro",
        "Puedes responder con un número, una palabra como “cotizar”, o una frase normal. 0 vuelve al inicio y 9 regresa un nivel.",
      );
      return;
    }

    if (resolution.kind === "item") {
      handleResolvedItem(resolution.item);
      return;
    }

    append(
      "toro",
      "No quiero adivinar mal. Puedes elegir una de las opciones visibles o decirlo de otra forma. Si esto fuera producción, TORO también podría mostrarte 1–3 interpretaciones probables sin ejecutar ninguna.",
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input;
    setInput("");
    process(value);
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <header className="mb-6 rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 p-5 shadow-2xl md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-cyan-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5">
                  <Sparkles className="h-4 w-4" /> Experience Lab
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" /> synthetic · no external writes
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
                TORO should feel easier than the business behind it.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                Prueba el mismo resolver conversacional con tres experiencias clave. Usa un número, una palabra
                o una frase normal. Todo aquí es local y sintético.
              </p>
            </div>
            <a
              href="/brain"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/30 hover:text-white"
            >
              <Brain className="h-4 w-4" /> Visual Brain
            </a>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-[2rem] border border-slate-800 bg-slate-950/65 p-4 md:p-5">
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Probar como</div>
              <div className="mt-1 text-lg font-bold text-white">Una experiencia, distinto contexto</div>
            </div>

            <div className="space-y-2">
              {personas.map((item) => {
                const active = item.id === persona.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchPersona(item.id)}
                    className={[
                      "w-full rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-cyan-300/35 bg-cyan-300/10"
                        : "border-slate-800 bg-black/20 hover:border-slate-700 hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <div className="font-semibold text-white">{item.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.subtitle}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-xs leading-5 text-amber-100/75">
              <strong className="block text-amber-100">Reglas del sandbox</strong>
              No consulta datos privados, no envía mensajes, no cambia reservas y no otorga permisos. Sirve para
              probar claridad, navegación y continuidad.
            </div>

            <button
              type="button"
              onClick={() => reset()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:border-cyan-300/30 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" /> Reiniciar conversación
            </button>
          </aside>

          <section className="overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-slate-950/80 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <div className="text-sm font-bold text-white">{persona.label}</div>
                <div className="text-xs text-slate-500">
                  {submenuId ? `Submenú: ${submenuId.replaceAll("_", " ")}` : "Menú principal"}
                </div>
              </div>
              {submenuId ? (
                <button
                  type="button"
                  onClick={() => process("9")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Atrás
                </button>
              ) : null}
            </div>

            <div className="h-[560px] space-y-4 overflow-y-auto px-4 py-5 md:px-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.actor === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={[
                      "max-w-[88%] whitespace-pre-line rounded-[1.4rem] px-4 py-3 text-sm leading-6 md:max-w-[76%]",
                      message.actor === "user"
                        ? "rounded-br-md bg-cyan-300 text-slate-950"
                        : "rounded-bl-md border border-slate-800 bg-slate-900/85 text-slate-200",
                    ].join(" ")}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {activeMenu ? (
                <div className="rounded-[1.5rem] border border-slate-800 bg-black/25 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <MessageCircle className="h-4 w-4" /> Respuestas rápidas
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {activeMenu.items.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => process(String(item.index))}
                        className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.06]"
                      >
                        <span className="font-mono text-xs text-cyan-300">{item.index}</span>
                        <span>{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    0 = inicio · 9 = atrás · también puedes escribir normal
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={submit} className="border-t border-slate-800 bg-slate-950 p-4 md:p-5">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder='Prueba: "3", "cotizar" o "quiero cotizar para 4 personas"'
                  className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200"
                  aria-label="Enviar"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Resolver real · contenido sintético · sin efectos externos
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
