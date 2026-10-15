import { describe, expect, it } from "vitest";
import { recommendPersonalGmailCleanup, type PersonalGmailClassification } from "./personal-gmail-cleanup";

const sample: PersonalGmailClassification = {
  category: "promotions",
  subject: "New Galaxy 30% discount",
  senderDomain: "latam.email.samsung.com",
  ageDays: 180,
  starred: false,
  important: false,
  hasAttachment: false,
  authenticatedSender: true,
  trustedMarketingDomains: ["latam.email.samsung.com"],
};

describe("personal Gmail cleanup recommendations", () => {
  it("archives only old verified allowlisted promotions without deleting", () => {
    expect(recommendPersonalGmailCleanup(sample)).toMatchObject({
      classification: "marketing_low_risk",
      automaticArchive: true,
      allowAutomaticTrash: false,
    });
  });

  it("never automatically archives new, spoofed or non-allowlisted emails", () => {
    expect(recommendPersonalGmailCleanup({ ...sample, ageDays: 5 }).automaticArchive).toBe(false);
    expect(recommendPersonalGmailCleanup({ ...sample, authenticatedSender: false }).automaticArchive).toBe(false);
    expect(recommendPersonalGmailCleanup({ ...sample, senderDomain: "fake.latam.email.samsung.com" }).automaticArchive).toBe(false);
    expect(recommendPersonalGmailCleanup({ ...sample, category: "updates" }).automaticArchive).toBe(false);
  });

  it("preserves invoices and security notices misfiled as promotions", () => {
    for (const subject of [
      "Factura de alojamiento", "Visa Japón aprobada",
      "Alerta de seguridad Google", "Pago rechazado para Instagram",
      "Booking reservation confirmed", "Transferencia bancaria",
    ]) {
      const r = recommendPersonalGmailCleanup({ ...sample, subject });
      expect(r.classification).toBe("protected");
      expect(r.automaticArchive).toBe(false);
    }
  });

  it("protects user-important, starred and attached emails", () => {
    expect(recommendPersonalGmailCleanup({ ...sample, important: true }).classification).toBe("protected");
    expect(recommendPersonalGmailCleanup({ ...sample, starred: true }).classification).toBe("protected");
    expect(recommendPersonalGmailCleanup({ ...sample, hasAttachment: true }).classification).toBe("protected");
  });

  it("does not mistake LinkedIn messages as low-risk marketing", () => {
    const r = recommendPersonalGmailCleanup({
      ...sample, category: "social", subject: "Tienes 3 mensajes nuevos",
    });
    expect(r.automaticArchive).toBe(false);
    expect(r.allowAutomaticTrash).toBe(false);
  });
});
