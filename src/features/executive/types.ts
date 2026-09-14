import type { DecisionCard } from "@/features/decisions/types";

export type ExecutiveException = {
  id: string;
  title: string;
  domain: string;
  source: string;
  freshness: string | null;
};

export type DelegatedAction = {
  id: string;
  title: string;
  owner: string;
  nextStep: string;
  evidence: string | null;
};

export type ExecutiveProject = {
  id: string;
  title: string;
  milestone: string | null;
  blocker: string | null;
  nextAction: string | null;
  owner: string | null;
  status: string;
};

export type ExecutiveSystemHealth = {
  status: "healthy" | "degraded" | "unknown";
  label: string;
  checkedAt: string | null;
};

export type ExecutiveHomeData = {
  decisions: DecisionCard[];
  exceptions: ExecutiveException[];
  delegatedActions: DelegatedAction[];
  projects: ExecutiveProject[];
  systemHealth: ExecutiveSystemHealth;
};
