import "server-only";

import { listMyDecisions } from "@/features/decisions/server";

import type { ExecutiveHomeData } from "./types";

export async function loadExecutiveHome(): Promise<ExecutiveHomeData> {
  const decisions = await listMyDecisions({ limit: 5 });

  return {
    decisions,
    exceptions: [],
    delegatedActions: [],
    projects: [],
    systemHealth: {
      status: "unknown",
      label: "Estado de sistemas pendiente de fuentes conectadas",
      checkedAt: null,
    },
  };
}
