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
  | "general";

export type GuestServiceRecoveryPrepareInput = {
  sourceEventKey: string;
  category: GuestServiceRecoveryCategory;
  summary: string;
  locationLabel?: string | null;
  detail?: string | null;
  urgency?: "normal" | "high" | "critical";
  guestLanguage?: "es" | "en" | "pt";
  dueDate?: string | null;
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
  handoff: {
    owner: "RICO" | "TORO";
    canonicalModule: "toro_operations";
    evidenceRequired: true;
    completionRequiresOperationalProof: true;
  };
};

export type GuestServiceRecoveryPrepareResult =
  | { ok: true; value: PreparedGuestServiceRecovery }
  | { ok: false; errors: string[] };

const SOURCE_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9:_-]{7,121}$/;

function clean(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function priorityFor(
  urgency: GuestServiceRecoveryPrepareInput["urgency"],
): ToroInternalWorkPriority {
  if (urgency === "critical") return "critical";
  if (urgency === "high") return "high";
  return "medium";
}

function actionFor(category: GuestServiceRecoveryCategory) {
  return category === "maintenance" ? "maintenance.task" : "task.create";
}

function ownerFor(category: GuestServiceRecoveryCategory) {
  return category === "maintenance" ? "RICO" : "TORO";
}

function replyFor(
  language: "es" | "en" | "pt",
  urgency: GuestServiceRecoveryPrepareInput["urgency"],
) {
  const urgent = urgency === "critical" || urgency === "high";

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

  if (errors.length) return { ok: false, errors };

  const title = location ? `${summary} — ${location}` : summary;
  const descriptionParts = [
    detail || null,
    location ? `Location: ${location}` : null,
    `Guest-service recovery source: ${sourceEventKey}`,
    "External guest reply remains draft-only until an authorized send path is used.",
  ].filter(Boolean);

  const parsed = validateToroInternalWorkRequest({
    action: actionFor(input.category),
    title,
    description: descriptionParts.join("\n"),
    priority: priorityFor(input.urgency),
    projectKey: null,
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
        text: replyFor(language, input.urgency),
        sendState: "draft_only",
      },
      handoff: {
        owner: ownerFor(input.category),
        canonicalModule: "toro_operations",
        evidenceRequired: true,
        completionRequiresOperationalProof: true,
      },
    },
  };
}
