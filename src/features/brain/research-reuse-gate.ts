/**
 * TORO Research / Knowledge: deterministic preflight before a governed search.
 * The caller MUST resolve actor, tenant, capabilities and authoritative source on
 * the server, and read only scope-authorized knowledge/checkpoint rows.
 *
 * This pure decision helper neither queries external systems nor grants access.
 * A "reuse" result can reuse a known BLOCKED state; it is not a success receipt.
 */
export type ResearchEvidenceState = "verified" | "partial" | "blocked" | "unknown";
export type ResearchReuseAction =
  | "BLOCK"
  | "DISCOVER"
  | "REUSE"
  | "REFRESH_DELTA"
  | "REVALIDATE";

export type ResearchCheckpoint = {
  subjectKey: string;
  scopeKey: string;
  authority: string;
  sourceFingerprint: string | null;
  checkedAt: string;
  sourceAsOf: string | null;
  validUntil: string | null;
  evidenceRefs: string[];
  evidenceState: ResearchEvidenceState;
  unresolvedDependency?: string | null;
};

export type ResearchReuseRequest = {
  subjectKey: string;
  scopeKey: string;
  authority: string;
  accessGranted: boolean;
  checkedNow: string;
  checkpoint?: ResearchCheckpoint | null;
  latestSourceFingerprint?: string | null;
  forceRecheck?: boolean;
  materialGapChanged?: boolean;
  dependencyChanged?: boolean;
  requiresLiveSource?: boolean;
  maxSourceAgeMinutes?: number | null;
};

export type ResearchReuseDecision = {
  action: ResearchReuseAction;
  reason:
    | "unauthorized_or_unscoped"
    | "invalid_check_time"
    | "no_existing_checkpoint"
    | "scope_or_authority_mismatch"
    | "missing_evidence"
    | "source_changed"
    | "material_gap_changed"
    | "dependency_changed"
    | "requested_recheck"
    | "checkpoint_expired"
    | "source_not_fresh"
    | "reuse_verified"
    | "reuse_known_blocker"
    | "reuse_partial_known";
  previouslyVerified: boolean;
};

/** ISO dates only; invalid or absent dates may never make a source look fresh. */
function time(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function decideResearchReuse(
  request: ResearchReuseRequest,
): ResearchReuseDecision {
  const answer = (
    action: ResearchReuseAction,
    reason: ResearchReuseDecision["reason"],
    previouslyVerified = false,
  ): ResearchReuseDecision => ({ action, reason, previouslyVerified });

  if (
    !request.accessGranted ||
    !request.scopeKey?.trim() ||
    !request.subjectKey?.trim() ||
    !request.authority?.trim()
  ) {
    return answer("BLOCK", "unauthorized_or_unscoped");
  }

  const now = time(request.checkedNow);
  if (now === null) return answer("BLOCK", "invalid_check_time");

  const checkpoint = request.checkpoint;
  if (!checkpoint) return answer("DISCOVER", "no_existing_checkpoint");

  if (
    checkpoint.scopeKey !== request.scopeKey ||
    checkpoint.subjectKey !== request.subjectKey ||
    checkpoint.authority !== request.authority
  ) {
    return answer("BLOCK", "scope_or_authority_mismatch");
  }

  // A historical note with no source reference cannot be promoted to knowledge.
  if (checkpoint.evidenceRefs.length === 0 || time(checkpoint.checkedAt) === null) {
    return answer("REVALIDATE", "missing_evidence");
  }

  if (
    request.latestSourceFingerprint != null &&
    checkpoint.sourceFingerprint !== request.latestSourceFingerprint
  ) {
    return answer("REFRESH_DELTA", "source_changed");
  }
  if (request.materialGapChanged) {
    return answer("REFRESH_DELTA", "material_gap_changed");
  }
  if (request.dependencyChanged) {
    return answer("REFRESH_DELTA", "dependency_changed");
  }
  if (request.forceRecheck) {
    return answer("REVALIDATE", "requested_recheck");
  }

  const validUntil = time(checkpoint.validUntil);
  if (checkpoint.validUntil != null && (validUntil === null || validUntil < now)) {
    return answer("REVALIDATE", "checkpoint_expired");
  }

  if (request.requiresLiveSource) {
    // A documented/checkpointed state is never a live E2E proof.
    if (checkpoint.evidenceState !== "verified") {
      return answer("REVALIDATE", "source_not_fresh");
    }
    const observedAt = time(checkpoint.sourceAsOf);
    const minutes = request.maxSourceAgeMinutes;
    if (
      observedAt === null ||
      minutes == null ||
      !Number.isFinite(minutes) ||
      minutes < 0 ||
      observedAt > now ||
      now - observedAt > minutes * 60_000
    ) {
      return answer("REVALIDATE", "source_not_fresh");
    }
  }

  if (checkpoint.evidenceState === "blocked") {
    return answer("REUSE", "reuse_known_blocker");
  }
  if (checkpoint.evidenceState !== "verified") {
    return answer("REUSE", "reuse_partial_known");
  }
  return answer("REUSE", "reuse_verified", true);
}
