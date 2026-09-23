import "server-only";

import { resolveToroContext } from "@/features/context/resolver";
import type { ToroContextRequest } from "@/features/context/types";
import {
  BRAIN_CONTRACT_VERSION,
  type BrainNode,
  type BrainProjection,
  type BrainVerificationState,
} from "@/lib/brain-contracts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { composeDreamcatcherBrainSlice } from "./projections/dreamcatcher";
import { projectKnowledgeNode } from "./projections/knowledge";
import { projectMediaNode } from "./projections/media";
import type {
  AuthorizedKnowledgeProjection,
  SafeMediaAssignment,
  SafeMediaProjectionRow,
} from "./projections/types";

const R3_KNOWLEDGE_KEY =
  "housekeeping_laundry_operating_manual_snapshot_2026_09_18_v1";

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function nullableString(value: unknown): string | null {
  return value === null || typeof value === "string" ? value : null;
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function parseKnowledgeRow(value: unknown): AuthorizedKnowledgeProjection | null {
  const row = record(value);
  if (!row) return null;

  const structured = record(row.structured_content);
  const projection = record(structured?.normalized_projection_r3);

  const id = stringValue(row.id);
  const orgId = stringValue(row.org_id);
  const knowledgeKey = stringValue(row.knowledge_key);
  const title = stringValue(row.title);
  const visibility = stringValue(row.visibility);
  const verifiedStatus = stringValue(row.verified_status);
  const riskLevel = stringValue(row.risk_level);
  const requiresHumanVerification = booleanValue(
    row.requires_human_verification,
  );

  if (
    !id ||
    !orgId ||
    !knowledgeKey ||
    !title ||
    !visibility ||
    !verifiedStatus ||
    !riskLevel ||
    requiresHumanVerification === null
  ) {
    return null;
  }

  return {
    id,
    orgId,
    knowledgeKey,
    title,
    visibility,
    verifiedStatus,
    riskLevel,
    requiresHumanVerification,
    lastVerified: nullableString(row.last_verified),
    nextReview: nullableString(row.next_review),
    sourceSystem: nullableString(row.source_system),
    sourceAsOf: nullableString(projection?.source_as_of),
    projectionUpdatedAt: nullableString(projection?.recorded_at),
    projectionStatus: nullableString(projection?.status),
  };
}

function parseMediaRow(value: unknown): SafeMediaProjectionRow | null {
  const row = record(value);
  if (!row) return null;

  const id = stringValue(row.id);
  const orgId = stringValue(row.org_id);
  const assetKey = stringValue(row.asset_key);
  const assetType = stringValue(row.asset_type);
  const rightsVerified = booleanValue(row.rights_verified);
  const publicSafe = booleanValue(row.public_safe);
  const verifiedStatus = stringValue(row.verified_status);
  const requiresHumanVerification = booleanValue(
    row.requires_human_verification,
  );
  const riskLevel = stringValue(row.risk_level);
  const updatedAt = stringValue(row.updated_at);

  if (
    !id ||
    !orgId ||
    !assetKey ||
    !assetType ||
    rightsVerified === null ||
    publicSafe === null ||
    !verifiedStatus ||
    requiresHumanVerification === null ||
    !riskLevel ||
    !updatedAt
  ) {
    return null;
  }

  return {
    id,
    orgId,
    assetKey,
    assetType,
    title: nullableString(row.title),
    publicUrl: nullableString(row.public_url),
    subjectType: nullableString(row.subject_type),
    subjectKey: nullableString(row.subject_key),
    rightsStatus: nullableString(row.rights_status),
    rightsVerified,
    publicSafe,
    verifiedStatus,
    requiresHumanVerification,
    riskLevel,
    sourceSystem: nullableString(row.source_system),
    lastVerified: nullableString(row.last_verified),
    nextReview: nullableString(row.next_review),
    updatedAt,
  };
}

type RawAssignment = {
  id: string;
  assetId: string;
  targetType: SafeMediaAssignment["targetType"];
  targetKey: string;
  mediaRole: string;
  verifiedStatus: string;
  requiresHumanVerification: boolean;
};

function parseAssignment(value: unknown): RawAssignment | null {
  const row = record(value);
  if (!row) return null;

  const id = stringValue(row.id);
  const assetId = stringValue(row.asset_id);
  const targetType = stringValue(row.target_type)?.toLowerCase();
  const targetKey = stringValue(row.target_key);
  const mediaRole = stringValue(row.media_role);
  const verifiedStatus = stringValue(row.verified_status);
  const requiresHumanVerification = booleanValue(
    row.requires_human_verification,
  );

  if (
    !id ||
    !assetId ||
    !targetType ||
    !["room", "knowledge", "asset"].includes(targetType) ||
    !targetKey ||
    !mediaRole ||
    !verifiedStatus ||
    requiresHumanVerification === null
  ) {
    return null;
  }

  return {
    id,
    assetId,
    targetType: targetType as SafeMediaAssignment["targetType"],
    targetKey,
    mediaRole,
    verifiedStatus,
    requiresHumanVerification,
  };
}

function verificationState(value: string): BrainVerificationState {
  const normalized = value.trim().toLowerCase();
  if (normalized === "verified") return "verified";
  if (normalized === "conflicted" || normalized === "conflict") {
    return "conflicted";
  }
  if (normalized === "needs_verification") return "partially_verified";
  return "unverified";
}

function parseRoomNode(
  value: unknown,
  scopeRef: string,
): BrainNode | null {
  const row = record(value);
  if (!row) return null;

  const roomKey = stringValue(row.room_key);
  const roomNumber =
    typeof row.room_number === "number" && Number.isInteger(row.room_number)
      ? row.room_number
      : null;
  const verifiedStatus = stringValue(row.verified_status);
  const sourceSystem = nullableString(row.source_system);

  if (!roomKey || roomNumber === null || !verifiedStatus) return null;

  const verification = verificationState(verifiedStatus);

  return {
    id: `room:${roomKey}`,
    kind: "asset",
    label:
      nullableString(row.name_es)?.trim() ||
      nullableString(row.name_en)?.trim() ||
      `Habitación ${roomNumber}`,
    scopeRef,
    status: verification === "verified" ? "Active" : "Review",
    risk: "Low",
    verification,
    freshness: nullableString(row.last_reviewed) ? "aging" : "unknown",
    sourceSystem: sourceSystem ?? "core.rooms",
    authoritySystem: "TORO Data",
    capabilities: {
      canOpen: true,
      canInspectEvidence: true,
      canPrepareAction: false,
      canExecute: false,
      canApprove: false,
      actionCeiling: "observe",
      approvalRequirement: "None",
    },
    summary: "Canonical room identity for read-only Brain projection.",
  };
}

function safeRows(
  read: { data: unknown[] | null; error: { message?: string } | null },
): { rows: unknown[]; degraded: boolean } {
  if (read.error || !Array.isArray(read.data)) {
    return { rows: [], degraded: true };
  }
  return { rows: read.data, degraded: false };
}

export async function loadAuthorizedBrainProjection(
  request: ToroContextRequest = {},
): Promise<BrainProjection | null> {
  const context = await resolveToroContext(request);

  if (
    !context ||
    context.mode !== "organization" ||
    !context.orgId ||
    !context.canUseOrganizationData ||
    context.requiresContextChoice
  ) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const orgId = context.orgId;
  const scopeRef = `org:${orgId}`;

  const [knowledgeRead, mediaRead, assignmentRead, roomRead] =
    await Promise.all([
      supabase
        .schema("operations")
        .from("knowledge_items")
        .select(
          "id,org_id,knowledge_key,title,visibility,verified_status,risk_level,requires_human_verification,last_verified,next_review,source_system,structured_content,updated_at",
        )
        .eq("org_id", orgId)
        .eq("active", true)
        .eq("knowledge_key", R3_KNOWLEDGE_KEY)
        .limit(1),
      supabase
        .schema("content")
        .from("media_assets")
        .select(
          "id,org_id,asset_key,asset_type,title,public_url,subject_type,subject_key,rights_status,rights_verified,public_safe,verified_status,requires_human_verification,risk_level,source_system,last_verified,next_review,updated_at",
        )
        .eq("org_id", orgId)
        .eq("active", true)
        .limit(50),
      supabase
        .schema("content")
        .from("media_assignments")
        .select(
          "id,org_id,asset_id,target_type,target_key,media_role,active,verified_status,requires_human_verification,updated_at",
        )
        .eq("org_id", orgId)
        .eq("active", true)
        .limit(100),
      supabase
        .schema("core")
        .from("rooms")
        .select(
          "id,org_id,room_key,room_number,name_es,name_en,verified_status,last_reviewed,source_system,updated_at",
        )
        .eq("org_id", orgId)
        .eq("active", true)
        .limit(50),
    ]);

  const knowledgeSafe = safeRows(knowledgeRead);
  const mediaSafe = safeRows(mediaRead);
  const assignmentSafe = safeRows(assignmentRead);
  const roomSafe = safeRows(roomRead);

  let partial =
    knowledgeSafe.degraded ||
    mediaSafe.degraded ||
    assignmentSafe.degraded ||
    roomSafe.degraded;

  const now = new Date();

  const knowledge = knowledgeSafe.rows.flatMap((raw) => {
    const row = parseKnowledgeRow(raw);
    if (!row || row.orgId !== orgId) {
      partial = true;
      return [];
    }
    return [projectKnowledgeNode(row, now)];
  });

  const mediaNodeByRawId = new Map<string, BrainNode>();
  const media = mediaSafe.rows.flatMap((raw) => {
    const row = parseMediaRow(raw);
    if (!row || row.orgId !== orgId) {
      partial = true;
      return [];
    }

    const node = projectMediaNode(row, now);
    if (!node) {
      partial = true;
      return [];
    }

    mediaNodeByRawId.set(row.id, node);
    return [node];
  });

  const targets = roomSafe.rows.flatMap((raw) => {
    const rawRecord = record(raw);
    if (stringValue(rawRecord?.org_id) !== orgId) {
      partial = true;
      return [];
    }

    const node = parseRoomNode(raw, scopeRef);
    if (!node) {
      partial = true;
      return [];
    }
    return [node];
  });

  const assignments: SafeMediaAssignment[] = [];
  for (const raw of assignmentSafe.rows) {
    const rawRecord = record(raw);
    if (stringValue(rawRecord?.org_id) !== orgId) {
      partial = true;
      continue;
    }

    const assignment = parseAssignment(raw);
    if (!assignment) {
      partial = true;
      continue;
    }

    const mediaNode = mediaNodeByRawId.get(assignment.assetId);
    if (!mediaNode) {
      partial = true;
      continue;
    }

    assignments.push({
      ...assignment,
      assetId: mediaNode.id,
    });
  }

  const slice = composeDreamcatcherBrainSlice({
    scopeRef,
    knowledge,
    media,
    targets,
    assignments,
  });

  partial ||= slice.partial;

  return {
    contractVersion: BRAIN_CONTRACT_VERSION,
    generatedAt: now.toISOString(),
    mode: "workspace",
    synthetic: false,
    context: {
      mode: "organization",
      scopeRef,
      organizationRef: orgId,
      isolationMode: "private",
    },
    nodes: slice.nodes,
    edges: slice.edges,
    sources: slice.sources,
    partial,
    degradedReason:
      knowledgeSafe.degraded ||
      mediaSafe.degraded ||
      assignmentSafe.degraded ||
      roomSafe.degraded
        ? "One or more canonical source unavailable; projection is partial."
        : slice.degradedReason,
  };
}
