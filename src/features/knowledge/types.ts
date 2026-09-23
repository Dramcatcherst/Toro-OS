export type KnowledgeDirectoryItem = {
  id: string;
  title: string;
  knowledgeClass: string;
  visibility: string;
  verifiedStatus: string;
  riskLevel: string;
  requiresHumanVerification: boolean;
  lastVerified: string | null;
  nextReview: string | null;
  sourceSystem: string | null;
  freshness: string;
};
