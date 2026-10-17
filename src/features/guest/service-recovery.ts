import {
  validateToroInternalWorkRequest,
  type ToroInternalWorkPriority,
  type ToroInternalWorkRequest,
} from "@/features/actions/internal-work";

export type GuestServiceRecoveryCategory =
  | "maintenance"
  | "housekeeping"
  | "noise"
  | "amenity"
  | "breakfast"
  | "water"
  | "electricity"
  | "safety"
  | "general";

export type GuestServiceRecoverySource =
  | "survey"
  | "whatsapp"
  | "portal"
  | "staff";

export type GuestBreakfastConcern =
  | "quality"
  | "wait"
  | "availability"
  | "entitlement_or_charge"
  | "other";

export type GuestBreakfastEntitlement = "included" | "extra" | "unknown";

export type GuestServiceRecoveryPrepareInput = {
  sourceEventKey: string;
  sourceChannel?: GuestServiceRecoverySource;
  projectKey?: string | null;
  category: GuestServiceRecoveryCategory;
  summary: string;
  locationLabel?: string | null;
  detail?: string | null;
  urgency?: "normal" | "high" | "critical";
  guestLanguage?: "es" | "en" | "pt";
  dueDate?: string | null;
  contactConsent?: boolean;
  roomEntryConsent?: boolean;
  bookingContextVerified?: boolean;
  privateFeedbackLink?: string | null;
  guestPortalLink?: string | null;
  breakfastConcern?: GuestBreakfastConcern | null;
  breakfastEntitlement?: GuestBreakfastEntitlement | null;
};

export type PreparedGuestServiceRecovery = {
  workflowState: "prepared";
  externalSend: false;
  internalWriteExecuted: false;
  internalWork: ToroInternalWorkRequest;
  guestReplyDraft: {
    language: "es" | "en" | "pt";
    text: string;
    sendState: "draft_only";
  };
  context: {
    sourceChannel: GuestServiceRecoverySource;
    bookingContextVerified: boolean;
    contactConsent: boolean;
    roomEntryConsent: boolean;
    breakfast: {
      concern: GuestBreakfastConcern;
      entitlement: GuestBreakfastEntitlement;
    } | null;
  };
  handoff: {
    owner: "RICO" | "TORO";
    canonicalModule: "toro_operations";
    evidenceRequired: true;
    completionRequiresOperationalProof: true;
    immediateHumanAttention: boolean;
  };
};

export type GuestServiceRecoveryPrepareResult =
  | { ok: true; value: PreparedGuestServiceRecovery }
  | { ok: false; errors: string[] };

export type GuestFeedbackBatchIssue = Omit<
  GuestServiceRecoveryPrepareInput,
  | "sourceEventKey"
  | "sourceChannel"
  | "projectKey"
  | "guestLanguage"
  | "contactConsent"
  | "roomEntryConsent"
  | "bookingContextVerified"
  | "privateFeedbackLink"
  | "guestPortalLink"
>;

export type GuestFeedbackBatchInput = {
  submissionId: string;
  sourceChannel: GuestServiceRecoverySource;
  projectKey?: string | null;
  guestLanguage?: "es" | "en" | "pt";
  contactConsent?: boolean;
  roomEntryConsent?: boolean;
  bookingContextVerified?: boolean;
  privateFeedbackLink?: string | null;
  guestPortalLink?: string | null;
  issues: GuestFeedbackBatchIssue[];
};

export type PreparedGuestFeedbackBatch = {
  workflowState: "prepared";
  externalSend: false;
  internalWriteExecuted: false;
  submissionId: string;
  issueCount: number;
  duplicateIssueCount: number;
  immediateHumanAttention: boolean;
  issues: PreparedGuestServiceRecovery[];
  guestReplyDraft: PreparedGuestServiceRecovery["guestReplyDraft"];
};

export type GuestFeedbackBatchResult =
  | { ok: true; value: PreparedGuestFeedbackBatch }
  | { ok: false; errors: string[] };

const SOURCE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9:_-]{7,121}$/;
const SUBMISSION_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{7,63}$/;
const TEMPLATE_PLACEHOLDER_RE = /\[[A-Z][A-Z0-9_]{2,80}\]/;

function clean(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function validateOptionalLink(
  label: "privateFeedbackLink" | "guestPortalLink",
  value: string | null | undefined,
  errors: string[],
) {
  const link = clean(value);
  if (!link) return;

  if (TEMPLATE_PLACEHOLDER_RE.test(link)) {
    errors.push(`${label} contains an unresolved template placeholder.`);
    return;
  }

  try {
    const parsed = new URL(link);
    if (parsed.protocol !== "https:") {
      errors.push(`${label} must use https.`);
    }
  } catch {
    errors.push(`${label} must be a valid URL.`);
  }
}

function requiresImmediateHumanAttention(
  category: GuestServiceRecoveryCategory,
  urgency: GuestServiceRecoveryPrepareInput["urgency"],
) {
  return (
    urgency === "critical" ||
    category === "safety" ||
    category === "electricity"
  );
}

function priorityFor(
  category: GuestServiceRecoveryCategory,
  urgency: GuestServiceRecoveryPrepareInput["urgency"],
): ToroInternalWorkPriority {
  if (requiresImmediateHumanAttention(category, urgency)) return "critical";
  if (urgency === "high" || category === "water") return "high";
  return "medium";
}

function actionFor(category: GuestServiceRecoveryCategory) {
  return ["maintenance", "water", "electricity", "safety"].includes(category)
    ? "maintenance.task"
    : "task.create";
}

function ownerFor(category: GuestServiceRecoveryCategory) {
  return ["maintenance", "water", "electricity", "safety"].includes(category)
    ? "RICO"
    : "TORO";
}

function replyFor(
  language: "es" | "en" | "pt",
  immediateHumanAttention: boolean,
  urgency: GuestServiceRecoveryPrepareInput["urgency"],
) {
  const urgent =
    immediateHumanAttention || urgency === "critical" || urgency === "high";

  if (language === "en") {
    return urgent
      ? "Thanks for telling us. I’m prioritizing this now and will keep you updated once there is verified progress."
      : "Thanks for letting us know. I’m organizing this with the team and will update you once there is verified progress.";
  }

  if (language === "pt") {
    return urgent
      ? "Obrigado por nos avisar. Vou priorizar isso agora e te aviso assim que houver um avanço verificado."
      : "Obrigado por nos avisar. Vou organizar isso com a equipe e te aviso assim que houver um avanço verificado.";
  }

  return urgent
    ? "Gracias por avisarnos. Voy a priorizar esto ahora y te aviso apenas haya un avance verificado."
    : "Gracias por avisarnos. Voy a coordinarlo con el equipo y te aviso apenas haya un avance verificado.";
}

export function prepareGuestServiceRecovery(
  input: GuestServiceRecoveryPrepareInput,
): GuestServiceRecoveryPrepareResult {
  const errors: string[] = [];
  const sourceEventKey = clean(input.sourceEventKey);
  const summary = clean(input.summary);
  const location = clean(input.locationLabel);
  const detail = clean(input.detail);
  const language = input.guestLanguage ?? "es";
  const sourceChannel = input.sourceChannel ?? "staff";
  const immediateHumanAttention = requiresImmediateHumanAttention(
    input.category,
    input.urgency,
  );

  if (!SOURCE_KEY_RE.test(sourceEventKey)) {
    errors.push(
      "sourceEventKey must be 8-122 characters using letters, numbers, :, _ or -.",
    );
  }
  if (summary.length < 3 || summary.length > 180) {
    errors.push("summary must be between 3 and 180 characters.");
  }
  if (location.length > 120) {
    errors.push("locationLabel must be <= 120 characters.");
  }
  if (detail.length > 3000) {
    errors.push("detail must be <= 3000 characters.");
  }
  if (!["es", "en", "pt"].includes(language)) {
    errors.push("guestLanguage must be es, en, or pt.");
  }
  if (!["survey", "whatsapp", "portal", "staff"].includes(sourceChannel)) {
    errors.push("sourceChannel must be survey, whatsapp, portal, or staff.");
  }

  validateOptionalLink(
    "privateFeedbackLink",
    input.privateFeedbackLink,
    errors,
  );
  validateOptionalLink("guestPortalLink", input.guestPortalLink, errors);

  if (input.category === "breakfast" && !input.breakfastConcern) {
    errors.push("breakfastConcern is required for breakfast feedback.");
  }
  if (input.category !== "breakfast" && input.breakfastConcern) {
    errors.push("breakfastConcern is only valid for breakfast feedback.");
  }
  if (input.category !== "breakfast" && input.breakfastEntitlement) {
    errors.push("breakfastEntitlement is only valid for breakfast feedback.");
  }

  if (errors.length) return { ok: false, errors };

  const breakfast =
    input.category === "breakfast"
      ? {
          concern: input.breakfastConcern!,
          entitlement: input.breakfastEntitlement ?? "unknown",
        }
      : null;

  const title = location ? `${summary} — ${location}` : summary;
  const descriptionParts = [
    detail || null,
    location ? `Location: ${location}` : null,
    `Guest-service recovery source: ${sourceEventKey}`,
    `Source channel: ${sourceChannel}`,
    `Booking context verified: ${input.bookingContextVerified === true ? "yes" : "no"}`,
    breakfast
      ? `Breakfast concern: ${breakfast.concern}; entitlement: ${breakfast.entitlement}`
      : null,
    "Contact consent and room-entry consent are separate and must not be inferred from one another.",
    "External guest reply remains draft-only until an authorized send path is used.",
  ].filter(Boolean);

  const parsed = validateToroInternalWorkRequest({
    action: actionFor(input.category),
    title,
    description: descriptionParts.join("\n"),
    priority: priorityFor(input.category, input.urgency),
    projectKey: input.projectKey ?? null,
    dueDate: input.dueDate ?? null,
    idempotencyKey: `guest:${sourceEventKey}`,
  });

  if (!parsed.ok) {
    return { ok: false, errors: [parsed.error] };
  }

  return {
    ok: true,
    value: {
      workflowState: "prepared",
      externalSend: false,
      internalWriteExecuted: false,
      internalWork: parsed.value,
      guestReplyDraft: {
        language,
        text: replyFor(language, immediateHumanAttention, input.urgency),
        sendState: "draft_only",
      },
      context: {
        sourceChannel,
        bookingContextVerified: input.bookingContextVerified === true,
        contactConsent: input.contactConsent === true,
        roomEntryConsent: input.roomEntryConsent === true,
        breakfast,
      },
      handoff: {
        owner: ownerFor(input.category),
        canonicalModule: "toro_operations",
        evidenceRequired: true,
        completionRequiresOperationalProof: true,
        immediateHumanAttention,
      },
    },
  };
}

function issueIdentity(issue: GuestFeedbackBatchIssue) {
  return [
    issue.category,
    clean(issue.summary).toLocaleLowerCase(),
    clean(issue.locationLabel).toLocaleLowerCase(),
    clean(issue.detail).toLocaleLowerCase(),
    issue.breakfastConcern ?? "",
    issue.breakfastEntitlement ?? "",
  ].join("|");
}

export function prepareGuestFeedbackBatch(
  input: GuestFeedbackBatchInput,
): GuestFeedbackBatchResult {
  const submissionId = clean(input.submissionId);
  const errors: string[] = [];

  if (!SUBMISSION_ID_RE.test(submissionId)) {
    errors.push(
      "submissionId must be 8-64 characters using letters, numbers, _ or -.",
    );
  }
  if (!Array.isArray(input.issues) || input.issues.length === 0) {
    errors.push("At least one feedback issue is required.");
  }
  if (Array.isArray(input.issues) && input.issues.length > 6) {
    errors.push("A feedback submission may contain at most 6 raw issues.");
  }
  if (errors.length) return { ok: false, errors };

  const seen = new Set<string>();
  const uniqueIssues: GuestFeedbackBatchIssue[] = [];
  let duplicateIssueCount = 0;

  for (const issue of input.issues) {
    const identity = issueIdentity(issue);
    if (seen.has(identity)) {
      duplicateIssueCount += 1;
      continue;
    }
    seen.add(identity);
    uniqueIssues.push(issue);
  }

  if (uniqueIssues.length > 3) {
    return {
      ok: false,
      errors: [
        "A feedback submission may create at most 3 unique operational issues.",
      ],
    };
  }

  const prepared: PreparedGuestServiceRecovery[] = [];
  for (const [index, issue] of uniqueIssues.entries()) {
    const result = prepareGuestServiceRecovery({
      ...issue,
      sourceEventKey: `${input.sourceChannel}:${submissionId}:${String(index + 1).padStart(2, "0")}`,
      sourceChannel: input.sourceChannel,
      projectKey: input.projectKey ?? null,
      guestLanguage: input.guestLanguage,
      contactConsent: input.contactConsent,
      roomEntryConsent: input.roomEntryConsent,
      bookingContextVerified: input.bookingContextVerified,
      privateFeedbackLink: input.privateFeedbackLink,
      guestPortalLink: input.guestPortalLink,
    });

    if (!result.ok) {
      errors.push(
        ...result.errors.map(
          (error) => `Issue ${index + 1}: ${error}`,
        ),
      );
      continue;
    }
    prepared.push(result.value);
  }

  if (errors.length) return { ok: false, errors };

  const urgent = prepared.find(
    (issue) => issue.handoff.immediateHumanAttention,
  );

  return {
    ok: true,
    value: {
      workflowState: "prepared",
      externalSend: false,
      internalWriteExecuted: false,
      submissionId,
      issueCount: prepared.length,
      duplicateIssueCount,
      immediateHumanAttention: Boolean(urgent),
      issues: prepared,
      guestReplyDraft: (urgent ?? prepared[0]).guestReplyDraft,
    },
  };
}
