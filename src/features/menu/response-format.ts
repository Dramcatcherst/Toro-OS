export type ToroResponseStatus =
  | "READY"
  | "STALE"
  | "UNAVAILABLE"
  | "NO_PERMISSION"
  | "REQUIRES_CONFIRMATION"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PARTIAL"
  | "BLOCKED";

export type ToroResponseOption = {
  code: string;
  label: string;
  buttonLabel: string;
};

export type ToroFormattedResponse = {
  text: string;
  numberedOptions: ToroResponseOption[];
  whatsAppReplyButtons: Array<{ id: string; title: string }>;
};

const STATUS_LABELS: Record<ToroResponseStatus, string> = {
  READY: "🟢 Información vigente",
  STALE: "🟠 Información desactualizada",
  UNAVAILABLE: "🔴 No disponible",
  NO_PERMISSION: "🔒 Sin permiso",
  REQUIRES_CONFIRMATION: "🟣 Requiere confirmación",
  IN_PROGRESS: "🔵 En proceso",
  COMPLETED: "✅ Completado",
  PARTIAL: "⚠️ Parcial",
  BLOCKED: "⛔ Bloqueado",
};

function validateMenuReceiptId(menuReceiptId: string) {
  if (!/^mrcpt_[A-Za-z0-9_-]{16,80}$/.test(menuReceiptId)) {
    throw new Error("Invalid opaque TORO menu receipt id");
  }
}

function validateOption(option: ToroResponseOption, menuReceiptId: string) {
  if (!/^(M(?:[A-J][0-9]|[0-9]))$/.test(option.code)) {
    throw new Error(`Invalid TORO menu code: ${option.code}`);
  }
  if (option.buttonLabel.length > 20) {
    throw new Error(
      `WhatsApp reply button title exceeds 20 characters: ${option.buttonLabel}`,
    );
  }
  if (`toro:menu:${menuReceiptId}:${option.code}`.length > 256) {
    throw new Error(`WhatsApp reply button id exceeds 256 characters: ${option.code}`);
  }
}

export function formatToroConversationalResponse({
  contextLabel,
  status,
  result,
  menuReceiptId,
  sourceLabel,
  cutoffLabel,
  bullets = [],
  options = [],
  tone = "normal",
}: {
  contextLabel: string;
  status: ToroResponseStatus;
  result: string;
  menuReceiptId: string;
  sourceLabel?: string;
  cutoffLabel?: string;
  bullets?: string[];
  options?: ToroResponseOption[];
  tone?: "normal" | "serious" | "guest";
}): ToroFormattedResponse {
  const defaultOption: ToroResponseOption =
    tone === "serious"
      ? { code: "M6", label: "Pedir ayuda", buttonLabel: "Pedir ayuda" }
      : {
          code: "M1",
          label: "Menú de este contexto",
          buttonLabel: "Menú de contexto",
        };

  validateMenuReceiptId(menuReceiptId);

  const withoutReservedFullMenu = options.filter(
    (option) => option.code !== "M0",
  );
  const numberedOptions = (
    withoutReservedFullMenu.length ? withoutReservedFullMenu : [defaultOption]
  ).slice(0, 3);
  const uniqueCodes = new Set<string>();
  const uniqueTitles = new Set<string>();
  for (const option of numberedOptions) {
    validateOption(option, menuReceiptId);
    if (uniqueCodes.has(option.code)) {
      throw new Error(`Duplicate TORO response option code: ${option.code}`);
    }
    if (uniqueTitles.has(option.buttonLabel)) {
      throw new Error(
        `Duplicate WhatsApp reply button title: ${option.buttonLabel}`,
      );
    }
    uniqueCodes.add(option.code);
    uniqueTitles.add(option.buttonLabel);
  }

  const lines: string[] = [];
  if (tone === "normal") lines.push(`🐂 TORO · ${contextLabel}`);
  if (tone === "serious") lines.push(`TORO · ${contextLabel}`);

  const statusParts = [STATUS_LABELS[status]];
  if (sourceLabel) statusParts.push(sourceLabel);
  if (cutoffLabel) statusParts.push(`corte ${cutoffLabel}`);
  lines.push(statusParts.join(" · "));
  lines.push("", result.trim());

  for (const bullet of bullets.slice(0, 3)) {
    const clean = bullet.trim();
    if (clean) lines.push(`• ${clean}`);
  }

  lines.push("", "¿Qué hacemos ahora?");
  numberedOptions.forEach((option, index) => {
    lines.push(`${index + 1} · ${option.code}  ${option.label}`);
  });
  lines.push("M0 · Ver menú completo");
  lines.push("Responde con el número, el código o escríbelo a tu manera.");

  return {
    text: lines.join("\n"),
    numberedOptions,
    whatsAppReplyButtons: numberedOptions.map((option) => ({
      id: `toro:menu:${menuReceiptId}:${option.code}`,
      title: option.buttonLabel,
    })),
  };
}
