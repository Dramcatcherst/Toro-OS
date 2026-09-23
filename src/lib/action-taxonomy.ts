import type { RiskLevel } from "./toro-types";

export type ToroActionDomain =
  | "TORO Comms"
  | "TORO Revenue"
  | "TORO Finance"
  | "TORO Growth"
  | "TORO Builder"
  | "TORO Operations"
  | "TORO People"
  | "TORO Governance"
  | "TORO Tools"
  | "TORO Systems";

export type ToroActionIntentId =
  | "guest_inquiry"
  | "availability_quote"
  | "reservation_change"
  | "guest_payment"
  | "guest_invoice"
  | "supplier_invoice"
  | "refund_or_chargeback"
  | "social_publication"
  | "website_change"
  | "seo_content"
  | "paid_campaign"
  | "maintenance_incident"
  | "purchase_request"
  | "employee_onboarding"
  | "attendance_or_payroll_exception"
  | "legal_or_insurance"
  | "access_or_secret_change"
  | "new_app_or_connector";

export type ToroActionIntentDefinition = {
  id: ToroActionIntentId;
  label: string;
  domains: readonly ToroActionDomain[];
  defaultRisk: RiskLevel;
  examples: {
    es: readonly string[];
    en: readonly string[];
  };
};

export const TORO_ACTION_TAXONOMY = [
  {
    id: "guest_inquiry",
    label: "Guest inquiry",
    domains: ["TORO Comms"],
    defaultRisk: "Low",
    examples: {
      es: ["consulta de huésped", "mensaje de un huésped"],
      en: ["guest inquiry", "guest question"],
    },
  },
  {
    id: "availability_quote",
    label: "Availability quote",
    domains: ["TORO Revenue", "TORO Comms"],
    defaultRisk: "Low",
    examples: {
      es: ["cotiza disponibilidad", "precio y disponibilidad"],
      en: ["availability quote", "check availability"],
    },
  },
  {
    id: "reservation_change",
    label: "Reservation change",
    domains: ["TORO Revenue", "TORO Comms"],
    defaultRisk: "High",
    examples: {
      es: ["cambiar una reserva", "modificar una reserva"],
      en: ["change a reservation", "modify booking"],
    },
  },
  {
    id: "guest_payment",
    label: "Guest payment",
    domains: ["TORO Finance", "TORO Revenue"],
    defaultRisk: "Critical",
    examples: {
      es: ["pago de un huésped", "registrar pago de reserva"],
      en: ["guest payment", "collect guest payment"],
    },
  },
  {
    id: "guest_invoice",
    label: "Guest invoice",
    domains: ["TORO Finance"],
    defaultRisk: "High",
    examples: {
      es: ["factura para un huésped", "facturar hospedaje"],
      en: ["invoice for the hotel guest", "guest invoice"],
    },
  },
  {
    id: "supplier_invoice",
    label: "Supplier invoice",
    domains: ["TORO Finance"],
    defaultRisk: "High",
    examples: {
      es: ["factura de un proveedor", "cuenta por pagar proveedor"],
      en: ["supplier invoice", "vendor bill"],
    },
  },
  {
    id: "refund_or_chargeback",
    label: "Refund or chargeback",
    domains: ["TORO Finance", "TORO Revenue"],
    defaultRisk: "Critical",
    examples: {
      es: ["reembolso de reserva", "contracargo"],
      en: ["refund guest", "chargeback"],
    },
  },
  {
    id: "social_publication",
    label: "Social publication",
    domains: ["TORO Growth"],
    defaultRisk: "High",
    examples: {
      es: ["publicar un reel en Instagram", "publicar en redes sociales"],
      en: ["social media post", "publish a reel"],
    },
  },
  {
    id: "website_change",
    label: "Website change",
    domains: ["TORO Builder", "TORO Growth"],
    defaultRisk: "High",
    examples: {
      es: ["cambiar el home de la página web", "editar la página web"],
      en: ["website change", "update the homepage"],
    },
  },
  {
    id: "seo_content",
    label: "SEO content",
    domains: ["TORO Growth"],
    defaultRisk: "Medium",
    examples: {
      es: ["artículo SEO", "contenido para Google"],
      en: ["SEO article", "organic search content"],
    },
  },
  {
    id: "paid_campaign",
    label: "Paid campaign",
    domains: ["TORO Growth", "TORO Finance"],
    defaultRisk: "High",
    examples: {
      es: ["campaña de Google Ads", "campaña de Meta Ads"],
      en: ["paid campaign", "Google Ads campaign"],
    },
  },
  {
    id: "maintenance_incident",
    label: "Maintenance incident",
    domains: ["TORO Operations"],
    defaultRisk: "High",
    examples: {
      es: ["equipo no funciona", "avería de mantenimiento"],
      en: ["maintenance incident", "equipment failure"],
    },
  },
  {
    id: "purchase_request",
    label: "Purchase request",
    domains: ["TORO Operations", "TORO Finance"],
    defaultRisk: "High",
    examples: {
      es: ["solicitud de compra", "comprar equipo para el hotel"],
      en: ["purchase request", "buy hotel equipment"],
    },
  },
  {
    id: "employee_onboarding",
    label: "Employee onboarding",
    domains: ["TORO People", "TORO Systems"],
    defaultRisk: "High",
    examples: {
      es: ["ingresar nuevo empleado", "crear usuario para empleado"],
      en: ["employee onboarding", "invite new employee"],
    },
  },
  {
    id: "attendance_or_payroll_exception",
    label: "Attendance or payroll exception",
    domains: ["TORO People", "TORO Finance"],
    defaultRisk: "High",
    examples: {
      es: ["corregir una marca del reloj", "problema de planilla"],
      en: ["attendance correction", "payroll exception"],
    },
  },
  {
    id: "legal_or_insurance",
    label: "Legal or insurance",
    domains: ["TORO Governance", "TORO Finance"],
    defaultRisk: "Critical",
    examples: {
      es: ["renovar la póliza", "contrato legal"],
      en: ["insurance renewal", "legal document"],
    },
  },
  {
    id: "access_or_secret_change",
    label: "Access or secret change",
    domains: ["TORO Systems", "TORO Governance"],
    defaultRisk: "Critical",
    examples: {
      es: ["rotar un secreto", "dar acceso a una aplicación"],
      en: ["revoke user access", "rotate a secret"],
    },
  },
  {
    id: "new_app_or_connector",
    label: "New app or connector",
    domains: ["TORO Tools", "TORO Systems"],
    defaultRisk: "High",
    examples: {
      es: ["conectar una nueva aplicación", "nueva integración"],
      en: ["new app integration", "add a connector"],
    },
  },
] as const satisfies readonly ToroActionIntentDefinition[];

const BY_ID = new Map<ToroActionIntentId, ToroActionIntentDefinition>(
  TORO_ACTION_TAXONOMY.map((definition) => [definition.id, definition]),
);

const INTENT_AMBIGUITY_MARGIN = 0.03;

export type ToroActionIntentClassification =
  | {
      status: "matched";
      id: ToroActionIntentId;
      matchedPhrase: string;
      confidence: number;
    }
  | {
      status: "ambiguous";
      candidates: ToroActionIntentId[];
    }
  | {
      status: "unclassified";
    };

function normalizeIntentText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function intentPhraseScore(normalizedRequest: string, normalizedPhrase: string) {
  if (!normalizedRequest || !normalizedPhrase) return 0;

  if (normalizedRequest.includes(normalizedPhrase)) {
    const phraseLengthBoost = Math.min(0.04, normalizedPhrase.length / 1000);
    return Math.min(0.99, 0.95 + phraseLengthBoost);
  }

  const requestTokens = new Set(normalizedRequest.split(" "));
  const phraseTokens = normalizedPhrase.split(" ").filter(Boolean);
  if (phraseTokens.length < 2) return 0;
  if (!phraseTokens.every((token) => requestTokens.has(token))) return 0;

  return Math.min(0.94, 0.68 + phraseTokens.length * 0.04);
}

export function classifyToroActionIntentText(
  request: string,
): ToroActionIntentClassification {
  const normalizedRequest = normalizeIntentText(request);
  if (!normalizedRequest) return { status: "unclassified" };

  const strongest = new Map<
    ToroActionIntentId,
    {
      id: ToroActionIntentId;
      matchedPhrase: string;
      confidence: number;
      phraseTokenCount: number;
    }
  >();

  for (const definition of TORO_ACTION_TAXONOMY) {
    for (const phrase of [...definition.examples.es, ...definition.examples.en]) {
      const normalizedPhrase = normalizeIntentText(phrase);
      const confidence = intentPhraseScore(normalizedRequest, normalizedPhrase);
      if (confidence <= 0) continue;

      const candidate = {
        id: definition.id,
        matchedPhrase: phrase,
        confidence,
        phraseTokenCount: normalizedPhrase.split(" ").filter(Boolean).length,
      };
      const current = strongest.get(definition.id);

      if (
        !current ||
        candidate.confidence > current.confidence ||
        (candidate.confidence === current.confidence &&
          candidate.phraseTokenCount > current.phraseTokenCount)
      ) {
        strongest.set(definition.id, candidate);
      }
    }
  }

  const matches = [...strongest.values()].sort(
    (left, right) =>
      right.confidence - left.confidence ||
      right.phraseTokenCount - left.phraseTokenCount ||
      left.id.localeCompare(right.id),
  );

  if (matches.length === 0) return { status: "unclassified" };

  const best = matches[0];
  const competing = matches[1];

  if (
    competing &&
    best.id !== competing.id &&
    best.confidence - competing.confidence <= INTENT_AMBIGUITY_MARGIN
  ) {
    return {
      status: "ambiguous",
      candidates: [best.id, competing.id].sort(),
    };
  }

  return {
    status: "matched",
    id: best.id,
    matchedPhrase: best.matchedPhrase,
    confidence: best.confidence,
  };
}

export function getToroActionIntent(
  id: ToroActionIntentId,
): ToroActionIntentDefinition {
  const definition = BY_ID.get(id);
  if (!definition) {
    throw new Error("Unknown TORO action intent.");
  }
  return definition;
}
