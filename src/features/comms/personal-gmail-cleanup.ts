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
  /\b(invoic|receipt|statement|payment|refund|tax|salary|payroll|security|password|sign.?in|verify|verification|account|fraud|access|flight|booking|reservation|contract|legal|immigration|visa|passport)\b/i,
  /factur|recibo|comprobante|transferenc|reembols|pago|dep[oó]sito|seguridad|contrase[ñn]a|acceso|alerta|banco|reserva|confirmaci[oó]n|vuel[oa]|pasaporte|visado|visa|impuesto|hacienda|asegur|contrato|n[oó]mina|suscripci[oó]n rechazada/i,
];

export function recommendPersonalGmailCleanup(
  mail: PersonalGmailClassification,
): PersonalGmailRecommendation {
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
