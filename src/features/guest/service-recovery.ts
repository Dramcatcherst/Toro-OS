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
  | "staff"
  | "unknown";

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
const CATEGORIES: readonly GuestServiceRecoveryCategory[] = [
  "maintenance",
  "housekeeping",
  "noise",
  "amenity",
  "breakfast",
  "water",
  "electricity",
  "safety",
  "general",
];
const URGENCIES = ["normal", "high", "critical"] as const;
const BREAKFAST_CONCERNS: readonly GuestBreakfastConcern[] = [
  "quality",
  "wait",
  "availability",
  "entitlement_or_charge",
  "other",
];
const BREAKFAST_ENTITLEMENTS: readonly GuestBreakfastEntitlement[] = [
  "included",
  "extra",
  "unknown",
];

function clean(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function containsTemplatePlaceholder(value: string) {
  let candidate = value;

  for (let pass = 0; pass < 3; pass += 1) {
    if (TEMPLATE_PLACEHOLDER_RE.test(candidate)) return true;

    try {
      const decoded = decodeURIComponent(candidate);
      if (decoded === candidate) return false;
      candidate = decoded;
    } catch {
      return false;
    }
  }

  return TEMPLATE_PLACEHOLDER_RE.test(candidate);
}

function validateOptionalLink(
  label: "privateFeedbackLink" | "guestPortalLink",
  value: unknown,
  errors: string[],
) {
  if (value == null) return;
  if (typeof value !== "string") {
    errors.push(`${label} must be a string URL.`);
    return;
  }

  const link = clean(value);
  if (!link) return;

  if (containsTemplatePlaceholder(link)) {
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
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["feedback input must be an object."] };
  }

  const errors: string[] = [];
  const sourceEventKey = clean(input.sourceEventKey);
  const summary = clean(input.summary);
  const location = clean(input.locationLabel);
  const detail = clean(input.detail);
  const language = input.guestLanguage ?? "es";
  const sourceChannel = input.sourceChannel ?? "unknown";

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
  if (
    !["survey", "whatsapp", "portal", "staff", "unknown"].includes(
      sourceChannel,
    )
  ) {
    errors.push(
      "sourceChannel must be survey, whatsapp, portal, staff, or unknown.",
    );
  }
  if (!CATEGORIES.includes(input.category)) {
    errors.push("category is not supported.");
  }
  if (input.urgency !== undefined && !URGENCIES.includes(input.urgency)) {
    errors.push("urgency must be normal, high, or critical.");
  }
  if (
    input.breakfastConcern != null &&
    !BREAKFAST_CONCERNS.includes(input.breakfastConcern)
  ) {
    errors.push("breakfastConcern is not supported.");
  }
  if (
    input.breakfastEntitlement != null &&
    !BREAKFAST_ENTITLEMENTS.includes(input.breakfastEntitlement)
  ) {
    errors.push("breakfastEntitlement is not supported.");
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

  const immediateHumanAttention = requiresImmediateHumanAttention(
    input.category,
    input.urgency,
  );

  const breakfast =
    input.category === "breakfast"
      ? {
          concern: input.breakfastConcern!,
          entitlement:
            input.bookingContextVerified === true
              ? input.breakfastEntitlement ?? "unknown"
              : "unknown",
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
  return JSON.stringify([
    issue.category,
    clean(issue.summary).toLocaleLowerCase(),
    clean(issue.locationLabel).toLocaleLowerCase(),
    clean(issue.detail).toLocaleLowerCase(),
    issue.breakfastConcern ?? "",
    issue.breakfastEntitlement ?? "",
  ]);
}

function mergeDuplicateIssue(
  current: GuestFeedbackBatchIssue,
  duplicate: GuestFeedbackBatchIssue,
) {
  const urgencyRank = { normal: 1, high: 2, critical: 3 } as const;
  const currentRank = current.urgency ? urgencyRank[current.urgency] : 0;
  const duplicateRank = duplicate.urgency ? urgencyRank[duplicate.urgency] : 0;
  const dueDates = [clean(current.dueDate), clean(duplicate.dueDate)]
    .filter(Boolean)
    .sort();

  return {
    ...current,
    urgency:
      duplicateRank > currentRank ? duplicate.urgency : current.urgency,
    dueDate: dueDates[0] || undefined,
  };
}

export function prepareGuestFeedbackBatch(
  input: GuestFeedbackBatchInput,
): GuestFeedbackBatchResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["feedback batch input must be an object."] };
  }

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

  for (const [index, issue] of input.issues.entries()) {
    if (!issue || typeof issue !== "object" || Array.isArray(issue)) {
      errors.push(`Issue ${index + 1}: feedback issue must be an object.`);
      continue;
    }

    const validation = prepareGuestServiceRecovery({
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

    if (!validation.ok) {
      errors.push(
        ...validation.errors.map((error) => `Issue ${index + 1}: ${error}`),
      );
    }
  }

  if (errors.length) return { ok: false, errors };

  const identities = new Map<string, number>();
  const uniqueIssues: GuestFeedbackBatchIssue[] = [];
  let duplicateIssueCount = 0;

  for (const issue of input.issues) {
    const identity = issueIdentity(issue);
    const existingIndex = identities.get(identity);
    if (existingIndex !== undefined) {
      duplicateIssueCount += 1;
      uniqueIssues[existingIndex] = mergeDuplicateIssue(
        uniqueIssues[existingIndex],
        issue,
      );
      continue;
    }
    identities.set(identity, uniqueIssues.length);
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
