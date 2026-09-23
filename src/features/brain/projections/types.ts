export type SafeMediaProjectionRow = {
  id: string;
  orgId: string;
  assetKey: string;
  assetType: string;
  title: string | null;
  publicUrl: string | null;
  subjectType: string | null;
  subjectKey: string | null;
  rightsStatus: string | null;
  rightsVerified: boolean;
  publicSafe: boolean;
  verifiedStatus: string;
  requiresHumanVerification: boolean;
  riskLevel: string;
  sourceSystem: string | null;
  lastVerified: string | null;
  nextReview: string | null;
  updatedAt: string;
};


export type AuthorizedKnowledgeProjection = {
  id: string;
  orgId: string;
  knowledgeKey: string;
  title: string;
  visibility: string;
  verifiedStatus: string;
  riskLevel: string;
  requiresHumanVerification: boolean;
  lastVerified: string | null;
  nextReview: string | null;
  sourceSystem: string | null;
  sourceAsOf: string | null;
  projectionUpdatedAt: string | null;
  projectionStatus: string | null;
};


export type SafeMediaAssignment = {
  id: string;
  assetId: string;
  targetType: "room" | "knowledge" | "asset";
  targetKey: string;
  mediaRole: string;
  verifiedStatus: string;
  requiresHumanVerification: boolean;
};
