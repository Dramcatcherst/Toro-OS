import { describe, expect, it } from "vitest";

import { evaluateSourceAwareCapabilityStates } from "./source-aware";

const probe = (
  rows: number,
  options: { readable?: boolean; fresh?: boolean } = {},
) => ({
  readable: options.readable ?? true,
  rows,
  fresh: options.fresh,
});

describe("evaluateSourceAwareCapabilityStates", () => {
  it("enables current owner reads but keeps stale finance blocked", () => {
    const result = evaluateSourceAwareCapabilityStates(
      {
        "executive.brief": "BLOCKED",
        "executive.decisions": "BLOCKED",
        "projects.status": "BLOCKED",
        "operations.exceptions": "BLOCKED",
        "finance.exceptions": "BLOCKED",
      },
      {
        executiveDecisions: probe(23),
        projects: probe(41),
        tasks: probe(344),
        maintenanceEvents: probe(163),
        reservations: probe(33, { fresh: false }),
        stays: probe(0),
        rooms: probe(20),
        villas: probe(3),
        experiences: probe(85),
        bankTransactions: probe(1839, { fresh: false }),
      },
    );

    expect(result.states["executive.brief"]).toBe("READ_ONLY");
    expect(result.states["executive.decisions"]).toBe("READ_ONLY");
    expect(result.states["projects.status"]).toBe("READ_ONLY");
    expect(result.states["operations.exceptions"]).toBe("READ_ONLY");
    expect(result.states["finance.exceptions"]).toBe("BLOCKED");
  });

  it("enables catalog reads while live reception flows remain blocked", () => {
    const result = evaluateSourceAwareCapabilityStates(
      {
        "catalog.rooms_villas": "BLOCKED",
        "catalog.experiences": "BLOCKED",
        "guest.arrivals_departures": "BLOCKED",
        "hospitality.quote": "BLOCKED",
        "comms.guest_messages": "BLOCKED",
      },
      {
        executiveDecisions: probe(1),
        projects: probe(1),
        tasks: probe(1),
        maintenanceEvents: probe(1),
        reservations: probe(33, { fresh: false }),
        stays: probe(0),
        rooms: probe(20),
        villas: probe(3),
        experiences: probe(85),
        bankTransactions: probe(1, { fresh: false }),
      },
    );

    expect(result.states["catalog.rooms_villas"]).toBe("READ_ONLY");
    expect(result.states["catalog.experiences"]).toBe("READ_ONLY");
    expect(result.states["guest.arrivals_departures"]).toBe("BLOCKED");
    expect(result.states["hospitality.quote"]).toBe("BLOCKED");
    expect(result.states["comms.guest_messages"]).toBe("BLOCKED");
  });

  it("fails closed when a source is unreadable", () => {
    const result = evaluateSourceAwareCapabilityStates(
      { "projects.status": "BLOCKED" },
      {
        executiveDecisions: probe(0, { readable: false }),
        projects: probe(41, { readable: false }),
        tasks: probe(0, { readable: false }),
        maintenanceEvents: probe(0, { readable: false }),
        reservations: probe(0, { readable: false }),
        stays: probe(0, { readable: false }),
        rooms: probe(0, { readable: false }),
        villas: probe(0, { readable: false }),
        experiences: probe(0, { readable: false }),
        bankTransactions: probe(0, { readable: false }),
      },
    );

    expect(result.states["projects.status"]).toBe("BLOCKED");
  });
});
