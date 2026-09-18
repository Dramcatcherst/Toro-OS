import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SystemsHealthView } from "./systems-health-view";

const data = {
  connectorHealth: {
    records: [
      {
        id: "supabase",
        name: "Supabase",
        live: true,
        configured: true,
        mode: "live_read" as const,
        health: "reachable" as const,
        checkedAt: "2026-09-17T22:09:00.000Z",
        detail: "Supabase respondió a una prueba read-only del runtime canónico.",
        source: "runtime",
        status: "Active" as const,
        risk: "High" as const,
        confidence: 96,
        approval: "Human review" as const,
        nextAction: "Observe",
      },
      {
        id: "codex",
        name: "Codex",
        live: false,
        configured: true,
        mode: "prepare_only" as const,
        health: "configured_unverified" as const,
        checkedAt: null,
        detail: "Configurado, pero sin prueba runtime activa.",
        source: "registry",
        status: "Ready" as const,
        risk: "High" as const,
        confidence: 80,
        approval: "Human review" as const,
        nextAction: "Add probe",
      },
    ],
    summary: { live: 1, configured: 2, blocked: 0, degraded: 0 },
  },
  krossFabric: {
    status: "unverified" as const,
    registeredSources: 11,
    liveRequiredSources: 10,
    safeForCurrentState: 1,
    sourcesWithSourceAsOf: 0,
    unsafeLiveRequiredSources: 10,
    currentReservationRows: 0,
    latestObservedAt: "2026-09-12T18:38:12.546183+00:00",
    detail:
      "No hay feed Kross actual verificable. 0 filas en current_reservations_safe no significa 0 reservas del hotel.",
    sources: [
      {
        name: "Kross Reservations",
        kind: "reservation_planner_snapshot",
        rowCount: 0,
        sourceAsOf: null,
        observedAt: "2026-09-12T18:38:12.546183+00:00",
        liveRequired: true,
        freshness: "unknown",
        safeForCurrentState: false,
      },
    ],
  },
};

describe("SystemsHealthView", () => {
  it("renders verified live status separately from configured but unverified status", () => {
    render(<SystemsHealthView data={data} />);

    expect(screen.getByRole("heading", { name: "Sistemas" })).toBeInTheDocument();
    expect(screen.getByText("Supabase")).toBeInTheDocument();
    expect(screen.getByText("Conectado ahora")).toBeInTheDocument();
    expect(screen.getByText("Codex")).toBeInTheDocument();
    expect(screen.getByText("Configurado · sin prueba runtime")).toBeInTheDocument();
    expect(screen.getByText(/2026-09-17T22:09:00.000Z/)).toBeInTheDocument();
  });

  it("shows Kross Data Fabric evidence without presenting zero safe rows as zero hotel reservations", () => {
    render(<SystemsHealthView data={data} />);

    expect(screen.getByRole("heading", { name: "Kross Data Fabric" })).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText(/10 requieren live/i)).toBeInTheDocument();
    expect(screen.getByText(/0 con source_as_of/i)).toBeInTheDocument();
    expect(screen.getByText(/0 filas seguras visibles/i)).toBeInTheDocument();
    expect(screen.getByText(/no significa 0 reservas del hotel/i)).toBeInTheDocument();
    expect(screen.getByText("Kross Reservations")).toBeInTheDocument();
    expect(screen.getByText(/No segura para estado actual/i)).toBeInTheDocument();
  });
});
