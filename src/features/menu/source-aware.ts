import type { ToroMenuAvailabilityState } from "./types";

export type ToroSourceProbe = {
  readable: boolean;
  rows: number;
  latestAt?: string | null;
  fresh?: boolean;
};

export type ToroMenuSourceSnapshot = {
  executiveDecisions: ToroSourceProbe;
  projects: ToroSourceProbe;
  tasks: ToroSourceProbe;
  maintenanceEvents: ToroSourceProbe;
  reservations: ToroSourceProbe;
  stays: ToroSourceProbe;
  rooms: ToroSourceProbe;
  villas: ToroSourceProbe;
  experiences: ToroSourceProbe;
  bankTransactions: ToroSourceProbe;
};

export type ToroSourceReadiness = {
  readyReads: string[];
  blockedReads: string[];
};

function usable(probe: ToroSourceProbe) {
  return probe.readable && probe.rows > 0;
}

function current(probe: ToroSourceProbe) {
  return usable(probe) && probe.fresh === true;
}

export function evaluateSourceAwareCapabilityStates(
  baseline: Record<string, ToroMenuAvailabilityState>,
  snapshot: ToroMenuSourceSnapshot,
): {
  states: Record<string, ToroMenuAvailabilityState>;
  readiness: ToroSourceReadiness;
} {
  const states = { ...baseline };
  const readyReads: string[] = [];
  const blockedReads: string[] = [];

  const enableRead = (capability: string, label: string, condition: boolean) => {
    if (!(capability in states)) return;

    if (condition) {
      states[capability] = "READ_ONLY";
      readyReads.push(label);
    } else {
      states[capability] = "BLOCKED";
      blockedReads.push(label);
    }
  };

  // Owner/executive: canonical TORO-owned data updated through current runtime.
  enableRead(
    "executive.brief",
    "Resumen ejecutivo",
    current(snapshot.executiveDecisions) &&
      current(snapshot.projects) &&
      current(snapshot.tasks),
  );
  enableRead(
    "executive.decisions",
    "Decisiones",
    current(snapshot.executiveDecisions),
  );
  enableRead("projects.status", "Proyectos", current(snapshot.projects));
  enableRead(
    "operations.exceptions",
    "Excepciones operativas",
    current(snapshot.tasks) || current(snapshot.maintenanceEvents),
  );

  // Finance remains closed unless the cash source is readable and fresh.
  enableRead(
    "finance.exceptions",
    "Caja / finanzas actuales",
    usable(snapshot.bankTransactions) && snapshot.bankTransactions.fresh === true,
  );

  // Reception: catalog knowledge is safe to read, live operational truth is not.
  enableRead(
    "catalog.rooms_villas",
    "Habitaciones y villas",
    usable(snapshot.rooms) && usable(snapshot.villas),
  );
  enableRead(
    "catalog.experiences",
    "Experiencias",
    usable(snapshot.experiences),
  );
  enableRead(
    "guest.arrivals_departures",
    "Llegadas y salidas live",
    usable(snapshot.reservations) &&
      snapshot.reservations.fresh === true &&
      usable(snapshot.stays),
  );

  // A snapshot is not live PMS authority, so quote remains blocked here.
  if ("hospitality.quote" in states) {
    states["hospitality.quote"] = "BLOCKED";
    if (!blockedReads.includes("Cotización live")) blockedReads.push("Cotización live");
  }

  // Guest inbox stays blocked until channel/runtime identity and continuity are verified.
  if ("comms.guest_messages" in states) {
    states["comms.guest_messages"] = "BLOCKED";
    if (!blockedReads.includes("Inbox omnicanal live")) blockedReads.push("Inbox omnicanal live");
  }

  // Maintenance can safely see priorities from TORO-owned operational data.
  enableRead(
    "maintenance.priorities",
    "Prioridades de mantenimiento",
    current(snapshot.maintenanceEvents),
  );
  enableRead(
    "maintenance.my_tasks",
    "Tareas de mantenimiento",
    current(snapshot.tasks) && current(snapshot.maintenanceEvents),
  );

  // Manager high-level operational read.
  enableRead(
    "operations.hotel_today",
    "Hotel hoy",
    current(snapshot.tasks) || current(snapshot.maintenanceEvents),
  );

  return {
    states,
    readiness: {
      readyReads: [...new Set(readyReads)],
      blockedReads: [...new Set(blockedReads)],
    },
  };
}
