import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  buildMaintenanceExecutiveSignals,
  parseMaintenanceRoundPayload,
  type MaintenanceExecutiveSignals,
} from "./maintenance-round";

const SOURCE = "Supabase · get_current_maintenance_round";

function unavailableSignal(title: string): MaintenanceExecutiveSignals {
  return {
    exceptions: [{
      id: "maintenance-round-unavailable",
      title,
      domain: "Operación hotelera",
      source: SOURCE,
      freshness: null,
    }],
    delegatedActions: [],
  };
}

export async function loadMaintenanceExecutiveSignals(): Promise<MaintenanceExecutiveSignals> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_current_maintenance_round");

  if (error) {
    return unavailableSignal("No se pudo verificar la ronda de mantenimiento");
  }

  try {
    return buildMaintenanceExecutiveSignals(parseMaintenanceRoundPayload(data));
  } catch {
    return unavailableSignal("La ronda de mantenimiento devolvió datos no válidos");
  }
}
