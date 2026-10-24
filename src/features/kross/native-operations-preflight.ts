/**
 * Preflight for operator-originated Kross evidence and proposed actions.
 * Deliberately no Kross credentials, UI control, network, database or writes.
 */
export type KrossNativeSurface = "authenticated_app" | "authenticated_web" | "email" | "push" | "historical_mirror";

export type KrossNativeContext = {
  surface: KrossNativeSurface;
  roleVerified: boolean;
  authorizedForRead: boolean;
  authorizedForAction: boolean;
  scopeVerified: boolean;
  roomMappingVerified: boolean;
  nativeObjectReference: string | null;
  sourceAsOf: string;
  observedAt: string;
};

export type HousekeepingObservation = {
  type: "housekeeping_observation";
  context: KrossNativeContext;
  markedClean: boolean;
  markedByAuthenticatedStaff: boolean;
  markedAt: string | null;
  lastKnownDirtyAt: string | null;
};

export type PaymentRegistrationCandidate = {
  type: "payment_registration";
  context: KrossNativeContext;
  nativeFolioReference: string | null;
  amount: number | null;
  currency: string | null;
  method: "CASH" | "CARD" | "BANK_TRANSFER" | "WINK" | "OTA" | "OTHER";
  evidenceLevel: "none" | "reported" | "cash_count_ack" | "processor_authorized" | "bank_posted";
  evidenceReference: string | null;
  duplicateCheckPerformed: boolean;
  matchingPaymentAlreadyExists: boolean | null;
};

export type ReservationNoteCandidate = {
  type: "reservation_note";
  context: KrossNativeContext;
  nativeVersionReference: string | null;
  audience: "internal_only" | "guest_visible" | "unknown";
  contentReviewedByAuthorizedRole: boolean;
  guestNotificationDisabledVerified: boolean;
};

export type KrossNativeActionInput =
  | HousekeepingObservation
  | PaymentRegistrationCandidate
  | ReservationNoteCandidate;

export type KrossNativeActionPreflight = {
  status: "blocked" | "cleaning_confirmed" | "pilot_prepared";
  blockers: string[];
  // A verified native Kross cleaning mark means housekeeping needn't repeat it.
  skipDuplicateCleaningConfirmation: boolean;
  // Room readiness needs independent maintenance / QA / access rules.
  canDeclareReady: false;
  // A preparatory check never grants tool privileges or causes a PMS change.
  pmsWriteAuthorizedByThisPreflight: false;
  bankReconciled: false;
  alegraPosted: false;
  next: "verify_native_state" | "prepare_governed_writer_pilot" | "consume_native_cleaning_fact";
};

function validRef(x: unknown): x is string {
  return typeof x === "string" && x.length > 0 && x.length <= 160 &&
    x.trim().length === x.length && !/[\x00-\x1f<>]/.test(x);
}
function validTimestamp(x: unknown): number {
  if (typeof x !== "string" ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(x)) return NaN;
  // Explicit date-only roundtrip prevents JS date rollover (e.g. Feb 30).
  const datePart = x.slice(0, 10);
  const calendar = Date.parse(datePart + "T00:00:00Z");
  if (!Number.isFinite(calendar) || new Date(calendar).toISOString().slice(0, 10) !== datePart) return NaN;
  const n = Date.parse(x);
  return Number.isFinite(n) ? n : NaN;
}
const restricted = {
  canDeclareReady: false,
  pmsWriteAuthorizedByThisPreflight: false,
  bankReconciled: false,
  alegraPosted: false,
} as const;

export function preflightKrossNativeAction(
  input: KrossNativeActionInput,
  evaluatedAt: string,
): KrossNativeActionPreflight {
  const blockers: string[] = [];
  const context = input.context;
  const now = validTimestamp(evaluatedAt);
  const sourceTime = validTimestamp(context.sourceAsOf);
  const readTime = validTimestamp(context.observedAt);

  // Incoming emails and notifications may wake a workflow but cannot establish PMS truth.
  if (context.surface !== "authenticated_app" && context.surface !== "authenticated_web") {
    blockers.push("not_authenticated_native_kross");
  }
  if (!context.scopeVerified) blockers.push("property_scope_not_verified");
  if (!context.roleVerified || !context.authorizedForRead) blockers.push("native_actor_or_read_capability_unverified");
  if (input.type !== "housekeeping_observation" && !context.authorizedForAction) blockers.push("native_action_capability_unverified");
  if (!validRef(context.nativeObjectReference)) blockers.push("missing_native_object_reference");
  if (!Number.isFinite(now) || !Number.isFinite(readTime) || !Number.isFinite(sourceTime) ||
      readTime < sourceTime || readTime > now || sourceTime > now ||
      now - sourceTime > 2 * 60 * 60 * 1000) {
    blockers.push("native_state_not_current");
  }

  if (input.type === "housekeeping_observation") {
    const cleanAt = validTimestamp(input.markedAt);
    const dirtyAt = input.lastKnownDirtyAt === null ? null : validTimestamp(input.lastKnownDirtyAt);
    if (!context.roomMappingVerified) blockers.push("physical_room_mapping_not_verified");
    if (!input.markedClean || !input.markedByAuthenticatedStaff || !Number.isFinite(cleanAt)) {
      blockers.push("clean_mark_not_confirmed");
    }
    if (Number.isFinite(cleanAt) && Number.isFinite(sourceTime) && cleanAt > sourceTime) {
      blockers.push("clean_mark_after_source_snapshot");
    }
    if (input.lastKnownDirtyAt !== null && (!Number.isFinite(dirtyAt) ||
         (Number.isFinite(cleanAt) && Number(dirtyAt) > cleanAt))) {
      blockers.push("newer_dirty_or_unknown_reclean_required");
    }
    const ok = blockers.length === 0;
    return {
      ...restricted,
      status: ok ? "cleaning_confirmed" : "blocked",
      blockers,
      skipDuplicateCleaningConfirmation: ok,
      next: ok ? "consume_native_cleaning_fact" : "verify_native_state",
    };
  }

  if (input.type === "reservation_note") {
    if (!validRef(input.nativeVersionReference)) blockers.push("reservation_version_missing");
    if (input.audience !== "internal_only") blockers.push("note_audience_not_verified_internal");
    if (!input.contentReviewedByAuthorizedRole) blockers.push("note_privacy_review_missing");
    if (!input.guestNotificationDisabledVerified) blockers.push("guest_notification_side_effect_unknown");
  } else {
    if (!validRef(input.nativeFolioReference)) blockers.push("folio_identity_missing");
    if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount <= 0) {
      blockers.push("invalid_native_amount");
    }
    if (typeof input.currency !== "string" || !/^[A-Z]{3}$/.test(input.currency)) {
      blockers.push("native_currency_missing");
    }
    if (!validRef(input.evidenceReference)) blockers.push("payment_source_evidence_missing");
    if (!input.duplicateCheckPerformed || input.matchingPaymentAlreadyExists !== false) {
      blockers.push("duplicate_or_uncertain_native_payment");
    }
    const requiredProof = input.method === "CASH" ? "cash_count_ack" :
      input.method === "CARD" || input.method === "OTA" ? "processor_authorized" :
      input.method === "BANK_TRANSFER" || input.method === "WINK" ? "bank_posted" : null;
    if (requiredProof === null || input.evidenceLevel !== requiredProof) {
      blockers.push("payment_method_evidence_not_adequate");
    }
  }

  return {
    ...restricted,
    status: blockers.length === 0 ? "pilot_prepared" : "blocked",
    blockers,
    skipDuplicateCleaningConfirmation: false,
    next: blockers.length === 0 ? "prepare_governed_writer_pilot" : "verify_native_state",
  };
}
