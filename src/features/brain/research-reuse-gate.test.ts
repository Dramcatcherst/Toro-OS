import { describe, expect, it } from "vitest";
import {
  decideResearchReuse,
  type ResearchCheckpoint,
  type ResearchReuseRequest,
} from "./research-reuse-gate";

const base: ResearchCheckpoint = {
  subjectKey: "hotel.openclaw.cloud",
  scopeKey: "org:dreamcatcher",
  authority: "TORO Systems",
  sourceFingerprint: "sha256:abc",
  checkedAt: "2026-10-24T20:00:00Z",
  sourceAsOf: "2026-10-24T20:00:00Z",
  validUntil: "2026-10-25T00:00:00Z",
  evidenceRefs: ["https://github.com/Dramcatcherst/Toro-OS/pull/387"],
  evidenceState: "verified",
  verificationTier: "source_observed",
};

function request(overrides: Partial<ResearchReuseRequest> = {}): ResearchReuseRequest {
  return {
    scopeKey: base.scopeKey,
    subjectKey: base.subjectKey,
    authority: base.authority,
    accessGranted: true,
    checkedNow: "2026-10-24T21:00:00Z",
    checkpoint: base,
    ...overrides,
  };
}

describe("TORO Research reuse-first preflight", () => {
  it("reuses verified matching evidence within its validity", () => {
    expect(decideResearchReuse(request())).toEqual({
      action: "REUSE", reason: "reuse_verified", previouslyVerified: true,
    });
  });

  it("does not reread the same unresolved blocker without a new trigger", () => {
    const checkpoint = { ...base, evidenceState: "blocked" as const, unresolvedDependency: "authorized cloud browser" };
    expect(decideResearchReuse(request({ checkpoint }))).toEqual({
      action: "REUSE", reason: "reuse_known_blocker", previouslyVerified: false,
    });
  });

  it("updates only the source delta after a new fingerprint", () => {
    expect(decideResearchReuse(request({ latestSourceFingerprint: "sha256:changed" }))).toMatchObject({
      action: "REFRESH_DELTA", reason: "source_changed", previouslyVerified: false,
    });
  });

  it("reopens a material missing part without duplicating the whole search", () => {
    expect(decideResearchReuse(request({ materialGapChanged: true }))).toMatchObject({
      action: "REFRESH_DELTA", reason: "material_gap_changed",
    });
  });

  it("reacts when an outstanding dependency changes", () => {
    expect(decideResearchReuse(request({ dependencyChanged: true }))).toMatchObject({
      action: "REFRESH_DELTA", reason: "dependency_changed",
    });
  });

  it("keeps cross-tenant or cross-authority material inaccessible", () => {
    expect(decideResearchReuse(request({ scopeKey: "org:other" }))).toMatchObject({
      action: "BLOCK", reason: "scope_or_authority_mismatch",
    });
    expect(decideResearchReuse(request({ authority: "different-source" }))).toMatchObject({
      action: "BLOCK", reason: "scope_or_authority_mismatch",
    });
    expect(decideResearchReuse(request({ accessGranted: false }))).toMatchObject({
      action: "BLOCK", reason: "unauthorized_or_unscoped",
    });
  });

  it("does not treat historical health as live occupancy or WhatsApp delivery", () => {
    expect(decideResearchReuse(request({
      requiresLiveSource: true,
      maxSourceAgeMinutes: 10,
    }))).toMatchObject({ action: "REVALIDATE", reason: "source_not_fresh" });
    expect(decideResearchReuse(request({
      requiresLiveSource: true,
      maxSourceAgeMinutes: 90,
      checkpoint: { ...base, evidenceState: "partial" },
    }))).toMatchObject({ action: "REVALIDATE", reason: "source_not_fresh" });
  });

  it("does not promote a fresh document into live E2E evidence", () => {
    expect(decideResearchReuse(request({
      requiresLiveSource: true,
      maxSourceAgeMinutes: 90,
      checkpoint: { ...base, verificationTier: "document" },
    }))).toMatchObject({ action: "REVALIDATE", reason: "source_not_fresh" });

    expect(decideResearchReuse(request({
      requiresLiveSource: true,
      maxSourceAgeMinutes: 90,
      checkpoint: { ...base, verificationTier: "runtime_verified" },
    }))).toMatchObject({ action: "REUSE", reason: "reuse_verified" });
  });

  it("rejects checkpoints with a checked-at date in the future", () => {
    expect(decideResearchReuse(request({
      checkpoint: { ...base, checkedAt: "2026-10-25T23:00:00Z" },
    }))).toMatchObject({ action: "REVALIDATE", reason: "missing_evidence" });
  });

  it("refuses missing provenance even if a note says verified", () => {
    expect(decideResearchReuse(request({ checkpoint: { ...base, evidenceRefs: [] } }))).toMatchObject({
      action: "REVALIDATE", reason: "missing_evidence",
    });
  });

  it("starts discovery only when no scoped checkpoint exists", () => {
    expect(decideResearchReuse(request({ checkpoint: null }))).toMatchObject({
      action: "DISCOVER", reason: "no_existing_checkpoint",
    });
  });

  it("revalidates expired, invalid, future or explicitly requested material", () => {
    expect(decideResearchReuse(request({ checkedNow: "2026-10-26T00:00:00Z" }))).toMatchObject({
      action: "REVALIDATE", reason: "checkpoint_expired",
    });
    expect(decideResearchReuse(request({ checkedNow: "invalid" }))).toMatchObject({
      action: "BLOCK", reason: "invalid_check_time",
    });
    expect(decideResearchReuse(request({ forceRecheck: true }))).toMatchObject({
      action: "REVALIDATE", reason: "requested_recheck",
    });
    expect(decideResearchReuse(request({
      requiresLiveSource: true,
      maxSourceAgeMinutes: 90,
      checkpoint: { ...base, sourceAsOf: "2026-10-24T23:00:00Z" },
    }))).toMatchObject({ action: "REVALIDATE", reason: "source_not_fresh" });
  });
});
