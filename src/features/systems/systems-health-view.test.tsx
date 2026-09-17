import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SystemsHealthView } from "./systems-health-view";

const data = {
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
});
