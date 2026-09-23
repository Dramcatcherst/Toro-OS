import type {
  ToroCommsChannel,
  ToroCommsInboxState,
  ToroCommsMessage,
} from "./types";

function channelLabel(channel: ToroCommsChannel) {
  switch (channel) {
    case "general":
      return "General";
    case "operacion":
      return "Operación";
    case "rrhh":
      return "RR. HH.";
    case "dm":
      return "Directo";
    default:
      return "Otro";
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isUnread(message: ToroCommsMessage, lastReadAt: string | null) {
  if (message.isMine) return false;
  if (!lastReadAt) return true;

  const created = Date.parse(message.createdAt);
  const cutoff = Date.parse(lastReadAt);
  return Number.isFinite(created) && Number.isFinite(cutoff) && created > cutoff;
}

function MessageCard({
  message,
  lastReadAt,
}: {
  message: ToroCommsMessage;
  lastReadAt: string | null;
}) {
  const unread = isUnread(message, lastReadAt);
  const label =
    channelLabel(message.channel) +
    " · " +
    (message.isMine ? "Enviado por ti" : "Recibido");

  return (
    <article
      className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
      aria-label={label}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
            {channelLabel(message.channel)}
          </span>
          <span className="text-xs font-medium text-neutral-500">
            {message.isMine ? "Tú" : "Equipo"}
          </span>
          {unread ? (
            <span className="rounded-full bg-neutral-950 px-2 py-1 text-[11px] font-semibold text-white">
              Nuevo
            </span>
          ) : null}
        </div>
        <time dateTime={message.createdAt} className="text-xs text-neutral-500">
          {formatDateTime(message.createdAt)}
        </time>
      </div>

      {message.channel === "dm" && message.isMine && message.recipientName ? (
        <p className="mt-2 text-xs font-medium text-neutral-500">
          Para: {message.recipientName}
        </p>
      ) : null}

      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
        {message.body || "Mensaje sin texto."}
      </p>

      {message.hasAttachment ? (
        <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          Adjunto: {message.attachmentName ?? "archivo"}
        </div>
      ) : null}
    </article>
  );
}

export function ToroCommsInboxView({
  state,
}: {
  state: ToroCommsInboxState;
}) {
  if (state.status === "not_available") {
    return (
      <section
        role="status"
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-neutral-950">
          Mensajes no disponibles
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Esta bandeja requiere un contexto de empresa activo y autorizado.
        </p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-neutral-950">
          No pudimos cargar tus mensajes
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          TORO no mostrará una bandeja parcial como si estuviera actualizada.
        </p>
      </section>
    );
  }

  const channelCounts = state.data.messages.reduce<
    Record<ToroCommsChannel, number>
  >(
    (counts, message) => {
      counts[message.channel] += 1;
      return counts;
    },
    { general: 0, operacion: 0, rrhh: 0, dm: 0, other: 0 },
  );

  const channels: ToroCommsChannel[] = [
    "general",
    "operacion",
    "rrhh",
    "dm",
    "other",
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          TORO Comms · Comunicación interna
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              Mensajes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Una sola bandeja para tus mensajes internos visibles en el contexto
              actual. Esta primera versión es de solo lectura.
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-950 px-4 py-3 text-white">
            <p className="text-xs uppercase tracking-wide text-neutral-300">
              Sin leer
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {state.data.unreadCount}
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Resumen de canales" className="flex flex-wrap gap-2">
        {channels.map((channel) =>
          channelCounts[channel] ? (
            <span
              key={channel}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700"
            >
              {channelLabel(channel)}: {channelCounts[channel]}
            </span>
          ) : null,
        )}
      </section>

      <section aria-labelledby="inbox-heading" className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="inbox-heading" className="text-xl font-semibold text-neutral-950">
              Bandeja
            </h2>
            <p className="text-sm text-neutral-600">
              Máximo 100 mensajes recientes visibles según tus permisos.
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            Notificaciones:{" "}
            {state.data.notificationsEnabled ? "activadas" : "desactivadas"}
          </p>
        </div>

        {state.data.messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            lastReadAt={state.data.lastReadAt}
          />
        ))}

        {!state.data.messages.length ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
            No hay mensajes visibles en esta bandeja.
          </div>
        ) : null}
      </section>

      <p className="px-1 text-xs leading-5 text-neutral-500">
        Leer esta bandeja no cambia el estado de leído todavía. Enviar mensajes,
        conectar WhatsApp/OpenClaw y convertir mensajes en tareas/handoffs son
        capacidades separadas que se activarán con sus propios controles.
      </p>
    </div>
  );
}
