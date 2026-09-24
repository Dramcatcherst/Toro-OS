export type PostStayConsent = "allowed" | "unknown" | "denied";

export type PostStayPrepareInput = {
  sourceEventKey: string;
  stayCompletedAt: string;
  consent: PostStayConsent;
  serviceRecoveryOpen: boolean;
  reviewAlreadyRequested: boolean;
  returnInvitationEligible?: boolean;
  language?: "es" | "en" | "pt";
};

export type PreparedPostStayAction = {
  kind: "review_request" | "return_invitation";
  sendState: "draft_only";
  text: string;
  attributionState: "unattributed_until_observed_outcome";
};

export type PostStayPrepareResult =
  | {
      ok: true;
      state: "prepared";
      externalSend: false;
      actions: PreparedPostStayAction[];
      measurement: {
        opportunityKey: string;
        baselineRequired: true;
        outcomeRequired: true;
        directRevenueClaimAllowed: false;
      };
    }
  | {
      ok: true;
      state: "no_action";
      externalSend: false;
      reason:
        | "stay_not_complete"
        | "service_recovery_open"
        | "consent_not_allowed"
        | "review_already_requested_and_no_other_action";
      actions: [];
    }
  | { ok: false; errors: string[] };

const SOURCE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9:_-]{7,121}$/;

function validIso(value: string) {
  return Number.isFinite(Date.parse(value));
}

function reviewDraft(language: "es" | "en" | "pt") {
  if (language === "en") {
    return "Thanks for staying with us. If you’d like, you can share an honest review of your experience.";
  }
  if (language === "pt") {
    return "Obrigado por ficar com a gente. Se quiser, você pode compartilhar uma avaliação sincera da sua experiência.";
  }
  return "Gracias por hospedarte con nosotros. Si quieres, puedes compartir una reseña sincera sobre tu experiencia.";
}

function returnDraft(language: "es" | "en" | "pt") {
  if (language === "en") {
    return "We’d be happy to welcome you back. If you plan another visit, tell us what you’re looking for and we’ll help you find the best fit.";
  }
  if (language === "pt") {
    return "Será um prazer receber você novamente. Se planejar outra visita, conte o que procura e ajudamos a encontrar a melhor opção.";
  }
  return "Nos encantará recibirte de nuevo. Si planeas otra visita, cuéntanos qué buscas y te ayudamos a encontrar la mejor opción.";
}

export function preparePostStayOpportunity(
  input: PostStayPrepareInput,
): PostStayPrepareResult {
  const errors: string[] = [];
  const sourceEventKey = input.sourceEventKey.trim();
  const language = input.language ?? "es";

  if (!SOURCE_KEY_RE.test(sourceEventKey)) {
    errors.push(
      "sourceEventKey must be 8-122 characters using letters, numbers, :, _ or -.",
    );
  }
  if (!validIso(input.stayCompletedAt)) {
    errors.push("stayCompletedAt must be a valid ISO timestamp.");
  }
  if (!["allowed", "unknown", "denied"].includes(input.consent)) {
    errors.push("consent must be allowed, unknown, or denied.");
  }
  if (!["es", "en", "pt"].includes(language)) {
    errors.push("language must be es, en, or pt.");
  }

  if (errors.length) return { ok: false, errors };

  const completedMs = Date.parse(input.stayCompletedAt);
  if (completedMs > Date.now()) {
    return {
      ok: true,
      state: "no_action",
      externalSend: false,
      reason: "stay_not_complete",
      actions: [],
    };
  }

  if (input.serviceRecoveryOpen) {
    return {
      ok: true,
      state: "no_action",
      externalSend: false,
      reason: "service_recovery_open",
      actions: [],
    };
  }

  if (input.consent !== "allowed") {
    return {
      ok: true,
      state: "no_action",
      externalSend: false,
      reason: "consent_not_allowed",
      actions: [],
    };
  }

  const actions: PreparedPostStayAction[] = [];

  if (!input.reviewAlreadyRequested) {
    actions.push({
      kind: "review_request",
      sendState: "draft_only",
      text: reviewDraft(language),
      attributionState: "unattributed_until_observed_outcome",
    });
  }

  if (input.returnInvitationEligible) {
    actions.push({
      kind: "return_invitation",
      sendState: "draft_only",
      text: returnDraft(language),
      attributionState: "unattributed_until_observed_outcome",
    });
  }

  if (!actions.length) {
    return {
      ok: true,
      state: "no_action",
      externalSend: false,
      reason: "review_already_requested_and_no_other_action",
      actions: [],
    };
  }

  return {
    ok: true,
    state: "prepared",
    externalSend: false,
    actions,
    measurement: {
      opportunityKey: `poststay:${sourceEventKey}`,
      baselineRequired: true,
      outcomeRequired: true,
      directRevenueClaimAllowed: false,
    },
  };
}
