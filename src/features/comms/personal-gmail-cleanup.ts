/**
 * Pure decision helper: no Gmail API calls, side effects or permission grants.
 * All booleans below must come from server-verified Gmail metadata, NOT the
 * content of an email. Never trust a message asking TORO to reclassify itself.
 */
export type PersonalGmailClassification = {
  category: "promotions" | "social" | "updates" | "primary" | "other";
  subject: string;
  senderDomain: string;
  ageDays: number;
  starred: boolean;
  important: boolean;
  hasAttachment: boolean;
  authenticatedSender: boolean;
  /** Trusted explicitly-configured *exact* domains for reversible cleanup. */
  trustedMarketingDomains: readonly string[];
};

export type PersonalGmailRecommendation = {
  classification: "protected" | "marketing_low_risk" | "review";
  automaticArchive: boolean;
  allowAutomaticTrash: false;
  reason: string;
};

const PROTECTED_TOPICS = [
  /\b(invoices?|receipts?|statements?|payments?|refunds?|tax(?:es)?|salar(?:y|ies)|payroll|security|passwords?|sign.?in|verify|verification|accounts?|fraud|access|flights?|bookings?|reservations?|contracts?|legal|immigration|visas?|passports?)\b/i,
  /factur|recibo|comprobante|transferenc|reembols|pago|dep[oó]sito|seguridad|contrase[ñn]a|acceso|alerta|banco|reserva|confirmaci[oó]n|vuel[oa]|pasaporte|visado|visa|impuesto|hacienda|asegur|contrato|n[oó]mina|suscripci[oó]n rechazada/i,
];

// Parser ceilings bound untrusted metadata; they are not provider limits or a retention policy.
const MAX_METADATA_TEXT = 10_000;
const MAX_TRUSTED_DOMAINS = 1000;
const CATEGORIES = new Set(["promotions", "social", "updates", "primary", "other"]);
function validMetadata(mail: PersonalGmailClassification) {
  const boundedText = (value: unknown) => typeof value === "string" && value.length <= MAX_METADATA_TEXT;
  return mail && CATEGORIES.has(mail.category) && boundedText(mail.subject) && boundedText(mail.senderDomain) &&
    typeof mail.ageDays === "number" && Number.isFinite(mail.ageDays) && mail.ageDays >= 0 &&
    [mail.starred, mail.important, mail.hasAttachment, mail.authenticatedSender].every((value) => typeof value === "boolean") &&
    Array.isArray(mail.trustedMarketingDomains) && mail.trustedMarketingDomains.length <= MAX_TRUSTED_DOMAINS &&
    Array.from(mail.trustedMarketingDomains).every(boundedText);
}

export function recommendPersonalGmailCleanup(
  mail: PersonalGmailClassification,
): PersonalGmailRecommendation {
  if (!validMetadata(mail)) return {
    classification: "review", automaticArchive: false, allowAutomaticTrash: false,
    reason: "invalid_metadata_for_automation",
  };
  if (
    mail.starred ||
    mail.important ||
    mail.hasAttachment ||
    PROTECTED_TOPICS.some((rule) => rule.test(mail.subject))
  ) {
    return {
      classification: "protected",
      automaticArchive: false,
      allowAutomaticTrash: false,
      reason: "protected_signal",
    };
  }

  const sender = mail.senderDomain.toLowerCase().trim();
  const trusted = mail.trustedMarketingDomains.some(
    (domain) => domain.toLowerCase().trim() === sender && sender.length > 0,
  );

  if (
    mail.category === "promotions" &&
    mail.ageDays >= 90 &&
    mail.authenticatedSender &&
    trusted
  ) {
    return {
      classification: "marketing_low_risk",
      automaticArchive: true,
      allowAutomaticTrash: false,
      reason: "verified_old_promotional_mail",
    };
  }

  return {
    classification: "review",
    automaticArchive: false,
    allowAutomaticTrash: false,
    reason: "insufficient_evidence_for_automation",
  };
}
