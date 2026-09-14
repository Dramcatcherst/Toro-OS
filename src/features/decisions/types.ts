export type DecisionApprovalLevel =
  | "manager_approval"
  | "founder_approval";

export type DecisionCard = {
  id: string;
  title: string;
  domain: string;
  urgency: string;
  recommendation: string | null;
  rationale: string | null;
  evidence: string | null;
  owner: string | null;
  deadline: string | null;
  approvalLevel: DecisionApprovalLevel;
  status: string;
};
