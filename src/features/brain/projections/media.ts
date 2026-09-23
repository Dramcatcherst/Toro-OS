import type {
  BrainFreshnessState,
  BrainMediaSummary,
  BrainMediaType,
  BrainNode,
  BrainVerificationState,
} from "@/lib/brain-contracts";
import type { RiskLevel } from "@/lib/toro-types";

import type { SafeMediaProjectionRow } from "./types";

const MEDIA_TYPE_MAP: Record<string, BrainMediaType> = {
  image: "image",
  photo: "image",
  photograph: "image",
  video: "video",
  audio: "audio",
  document: "document",
  pdf: "document",
  diagram: "diagram",
  floorplan: "diagram",
  map: "diagram",
};

function normalizeMediaType(value: string): BrainMediaType | null {
  return MEDIA_TYPE_MAP[value.trim().toLowerCase()] ?? null;
}

function normalizeRisk(value: string): RiskLevel {
  switch (value.trim().toLowerCase()) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    default:
      return "Low";
  }
}

function resolveRightsState(
  status: string | null,
  verified: boolean,
): BrainMediaSummary["rightsState"] {
  const normalized = status?.trim().toLowerCase() ?? "";

  if (normalized === "expired") return "expired";
  if (normalized === "restricted") return "restricted";
  if (
    verified &&
    ["cleared", "approved", "owned", "verified"].includes(normalized)
  ) {
    return "cleared";
  }

  return "unknown";
}

function resolveVerification(
  row: SafeMediaProjectionRow,
): BrainVerificationState {
  if (
    row.verifiedStatus.trim().toLowerCase() === "verified" &&
    !row.requiresHumanVerification &&
    row.rightsVerified
  ) {
    return "verified";
  }

  if (
    row.verifiedStatus.trim().toLowerCase() === "needs_verification" ||
    row.requiresHumanVerification ||
    row.rightsVerified
  ) {
    return "partially_verified";
  }

  return "unverified";
}

function resolveFreshness(
  row: SafeMediaProjectionRow,
  now: Date,
): BrainFreshnessState {
  if (!row.lastVerified) return "unknown";

  if (row.nextReview) {
    const reviewAt = Date.parse(`${row.nextReview}T23:59:59Z`);
    if (!Number.isNaN(reviewAt) && reviewAt < now.getTime()) return "stale";
    return "current";
  }

  return "aging";
}

export function projectMediaNode(
  row: SafeMediaProjectionRow,
  now: Date,
): BrainNode | null {
  const mediaType = normalizeMediaType(row.assetType);
  if (!mediaType) return null;

  const rightsState = resolveRightsState(row.rightsStatus, row.rightsVerified);
  const verification = resolveVerification(row);
  const canOpen =
    Boolean(row.publicUrl) &&
    row.publicSafe &&
    rightsState === "cleared" &&
    verification === "verified";

  return {
    id: `media:${row.assetKey || row.id}`,
    kind: "media",
    label: row.title?.trim() || row.assetKey,
    scopeRef: `org:${row.orgId}`,
    status: canOpen ? "Ready" : "Review",
    risk: normalizeRisk(row.riskLevel),
    verification,
    freshness: resolveFreshness(row, now),
    sourceSystem: row.sourceSystem ?? "content.media_assets",
    authoritySystem: "TORO Content",
    capabilities: {
      canOpen,
      canInspectEvidence: true,
      canPrepareAction: false,
      canExecute: false,
      canApprove: false,
      actionCeiling: "observe",
      approvalRequirement: row.requiresHumanVerification
        ? "Human review"
        : "None",
    },
    summary: row.subjectKey
      ? `Media associated with ${row.subjectType ?? "entity"} ${row.subjectKey}.`
      : "Governed media asset.",
    media: {
      mediaType,
      provenanceState:
        verification === "verified"
          ? "verified"
          : row.sourceSystem
            ? "partial"
            : "unknown",
      rightsState,
      aiDisclosure: "unknown",
    },
  };
}
