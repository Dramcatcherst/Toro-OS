import { describe, expect, it } from "vitest";

import { formatToroConversationalResponse } from "./response-format";

const menuReceiptId = "mrcpt_7Qn4uX2pL9sV5kDf";

describe("formatToroConversationalResponse", () => {
  it("uses a compact standard shape and always ends normal turns with choices", () => {
    const message = formatToroConversationalResponse({
      contextLabel: "Dreamcatcher · Recepción",
      status: "READY",
      sourceLabel: "Kross",
      cutoffLabel: "16 oct 2026 · 01:07 CR",
      result: "Hay dos llegadas verificables para hoy.",
      menuReceiptId,
      bullets: ["Una requiere revisar hora de llegada.", "No se muestran datos privados."],
      options: [
        { code: "MB1", label: "Ver llegadas", buttonLabel: "Ver llegadas" },
        { code: "MC3", label: "Abrir turno", buttonLabel: "Abrir turno" },
        { code: "MH3", label: "Capacitación", buttonLabel: "Capacitación" },
      ],
    });

    expect(message.text).toContain("🐂 TORO · Dreamcatcher · Recepción");
    expect(message.text).toContain("🟢 Información vigente · Kross");
    expect(message.text).toContain("1 · MB1  Ver llegadas");
    expect(message.text).toContain("M0 · Ver menú completo");
    expect(message.whatsAppReplyButtons).toHaveLength(3);
    expect(message.whatsAppReplyButtons[0]?.id).toBe(
      `toro:menu:${menuReceiptId}:MB1`,
    );
  });

  it("caps WhatsApp reply buttons at three and falls back to text", () => {
    const message = formatToroConversationalResponse({
      contextLabel: "Mi vida",
      status: "READY",
      result: "Tu agenda está ordenada.",
      menuReceiptId,
      options: [
        { code: "MG1", label: "Ver día", buttonLabel: "Ver día" },
        { code: "MG2", label: "Abrir agenda", buttonLabel: "Abrir agenda" },
        { code: "MH3", label: "Aprender", buttonLabel: "Aprender" },
        { code: "M0", label: "Menú completo", buttonLabel: "Menú completo" },
      ],
    });

    expect(message.numberedOptions).toHaveLength(3);
    expect(message.whatsAppReplyButtons).toHaveLength(3);
    expect(message.text).toContain("M0 · Ver menú completo");
  });

  it("keeps serious responses low-decoration while preserving a safe next step", () => {
    const message = formatToroConversationalResponse({
      contextLabel: "Incidente",
      status: "BLOCKED",
      tone: "serious",
      result: "No puedo confirmar el cierre todavía.",
      menuReceiptId,
      options: [
        { code: "MC7", label: "Escalar incidente", buttonLabel: "Escalar" },
      ],
    });

    expect(message.text).not.toContain("🐂");
    expect(message.text).toContain("1 · MC7  Escalar incidente");
  });

  it("rejects reply-button labels that exceed the WhatsApp limit", () => {
    expect(() =>
      formatToroConversationalResponse({
        contextLabel: "Recepción",
        status: "READY",
        result: "Listo.",
        menuReceiptId,
        options: [
          {
            code: "MB5",
            label: "Preparar una cotización completa",
            buttonLabel: "Este título supera veinte caracteres",
          },
        ],
      }),
    ).toThrow(/20/);
  });

  it("refuses to create interactive buttons without an opaque menu receipt", () => {
    expect(() =>
      formatToroConversationalResponse({
        contextLabel: "Recepción",
        status: "READY",
        result: "Listo.",
        menuReceiptId: "phone-50688889999",
      }),
    ).toThrow(/receipt/i);
  });

  it("reserves M0 for the single full-menu escape hatch", () => {
    const message = formatToroConversationalResponse({
      contextLabel: "Recepción",
      status: "READY",
      result: "Listo.",
      menuReceiptId,
      options: [
        { code: "M0", label: "Menú completo", buttonLabel: "Menú completo" },
        { code: "MC3", label: "Abrir turno", buttonLabel: "Abrir turno" },
      ],
    });

    expect(message.numberedOptions.map((option) => option.code)).toEqual(["MC3"]);
    expect(message.text.match(/M0 · Ver menú completo/g)).toHaveLength(1);
  });
});
