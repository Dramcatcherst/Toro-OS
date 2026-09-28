export type ToroCommsAttention =
  | "critical"
  | "today"
  | "followup"
  | "normal"
  | "informational"
  | "archive";

export type ToroCommsRoute = {
  domain:
    | "guest_revenue"
    | "finance"
    | "systems"
    | "growth"
    | "admin_legal"
    | "providers_hr"
    | "comms"
    | "archive"
    | "unclassified";
  agents: string[];
  attention: ToroCommsAttention;
  needsSecondaryClassification: boolean;
  matchedLabels: string[];
};

type LabelRule = {
  domain: ToroCommsRoute["domain"];
  agents: string[];
  attention?: ToroCommsAttention;
  needsSecondaryClassification?: boolean;
};

const LABEL_RULES: Record<string, LabelRule> = {
  "00 · URGENTE": {
    domain: "unclassified",
    agents: ["TORO"],
    attention: "critical",
    needsSecondaryClassification: true,
  },
  "01 · HOY": {
    domain: "unclassified",
    agents: ["TORO"],
    attention: "today",
    needsSecondaryClassification: true,
  },
  "02 · SEGUIMIENTO": {
    domain: "unclassified",
    agents: ["TORO"],
    attention: "followup",
    needsSecondaryClassification: true,
  },
  "10 · HUÉSPEDES & RESERVAS": {
    domain: "guest_revenue",
    agents: ["TERE"],
  },
  "20 · FINANZAS": {
    domain: "finance",
    agents: ["FIONA"],
  },
  "20.1 · BANCOS / SINPE": {
    domain: "finance",
    agents: ["FIONA"],
  },
  "20.2 · FACTURAS / RECIBOS": {
    domain: "finance",
    agents: ["FIONA"],
  },
  "20.3 · OTA / COMISIONES": {
    domain: "finance",
    agents: ["FIONA", "TERE"],
  },
  "20.4 · SUSCRIPCIONES / SERVICIOS": {
    domain: "finance",
    agents: ["FIONA", "SOBRESITO"],
  },
  "20.5 · PUBLICIDAD / ADS": {
    domain: "growth",
    agents: ["SKY"],
  },
  "20.6 · WHATSAPP / COMUNICACIÓN": {
    domain: "comms",
    agents: ["TORO", "SOBRESITO"],
  },
  "30 · SEGURIDAD": {
    domain: "systems",
    agents: ["SOBRESITO"],
  },
  "40 · SISTEMAS": {
    domain: "systems",
    agents: ["SOBRESITO"],
  },
  "40.1 · GITHUB / CI": {
    domain: "systems",
    agents: ["SOBRESITO"],
  },
  "40.2 · VERCEL / DEPLOYS": {
    domain: "systems",
    agents: ["SOBRESITO"],
  },
  "50 · PROVEEDORES / RRHH": {
    domain: "providers_hr",
    agents: ["FIONA"],
    needsSecondaryClassification: true,
  },
  "60 · COMERCIAL / ALIANZAS": {
    domain: "growth",
    agents: ["SKY"],
  },
  "60.1 · HOTELSWAPS": {
    domain: "growth",
    agents: ["SKY"],
  },
  "70 · ADMIN / LEGAL": {
    domain: "admin_legal",
    agents: ["FIONA"],
  },
  "90 · AUTOMÁTICO / LECTURA": {
    domain: "unclassified",
    agents: ["TORO"],
    attention: "informational",
    needsSecondaryClassification: true,
  },
  "99 · ARCHIVO HISTÓRICO": {
    domain: "archive",
    agents: [],
    attention: "archive",
  },

  // Legacy labels remain readable during migration but never outrank current
  // numbered labels when both are present.
  "Dreamcatcher/Accounting": {
    domain: "finance",
    agents: ["FIONA"],
  },
  "Dreamcatcher/Proveedores": {
    domain: "providers_hr",
    agents: ["FIONA"],
    needsSecondaryClassification: true,
  },
  "Dreamcatcher/Legacy Atrapasuenos": {
    domain: "archive",
    agents: [],
    attention: "archive",
  },
  "Dreamcatcher/Guest & Info": {
    domain: "guest_revenue",
    agents: ["TERE"],
  },
};

const ATTENTION_RANK: Record<ToroCommsAttention, number> = {
  critical: 6,
  today: 5,
  followup: 4,
  normal: 3,
  informational: 2,
  archive: 1,
};

const DOMAIN_SPECIFICITY: Record<ToroCommsRoute["domain"], number> = {
  guest_revenue: 5,
  finance: 5,
  systems: 5,
  growth: 5,
  admin_legal: 5,
  providers_hr: 4,
  comms: 4,
  archive: 2,
  unclassified: 1,
};

export function routeDreamcatcherGmailLabels(
  labels: string[],
): ToroCommsRoute {
  const matches = labels
    .map((label) => ({ label, rule: LABEL_RULES[label] }))
    .filter((item): item is { label: string; rule: LabelRule } =>
      Boolean(item.rule),
    );

  if (matches.length === 0) {
    return {
      domain: "unclassified",
      agents: ["TORO"],
      attention: "normal",
      needsSecondaryClassification: true,
      matchedLabels: [],
    };
  }

  let domain: ToroCommsRoute["domain"] = "unclassified";
  let attention: ToroCommsAttention = "normal";
  let needsSecondaryClassification = false;
  const agents = new Set<string>();

  for (const { rule } of matches) {
    if (DOMAIN_SPECIFICITY[rule.domain] > DOMAIN_SPECIFICITY[domain]) {
      domain = rule.domain;
    }
    if (
      rule.attention &&
      ATTENTION_RANK[rule.attention] > ATTENTION_RANK[attention]
    ) {
      attention = rule.attention;
    }
    if (rule.needsSecondaryClassification) {
      needsSecondaryClassification = true;
    }
    rule.agents.forEach((agent) => agents.add(agent));
  }

  // A specific domain resolves the ambiguity of attention-only/automatic labels.
  if (
    domain !== "unclassified" &&
    domain !== "providers_hr" &&
    matches.some(({ rule }) => rule.domain !== "unclassified")
  ) {
    needsSecondaryClassification = matches.some(
      ({ rule }) =>
        rule.needsSecondaryClassification && rule.domain !== "unclassified",
    );
  }

  return {
    domain,
    agents: [...agents],
    attention,
    needsSecondaryClassification,
    matchedLabels: matches.map(({ label }) => label),
  };
}
