import "server-only";

import { listMyDecisions } from "@/features/decisions/server";

import { loadMaintenanceExecutiveSignals } from "./maintenance-server";
import type { ExecutiveHomeData } from "./types";

export async function loadExecutiveHome(): Promise<ExecutiveHomeData> {
  const decisions = await listMyDecisions({ limit: 5 });
  const maintenance = await loadMaintenanceExecutiveSignals();

  return {
    decisions,
    exceptions: maintenance.exceptions,
    delegatedActions: maintenance.delegatedActions,
    projects: [],
    systemHealth: {
      status: "unknown",
      label: "Estado de sistemas pendiente de fuentes conectadas",
      checkedAt: null,
    },
  };
}
