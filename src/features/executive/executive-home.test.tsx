import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExecutiveHome } from "./executive-home";

const decisions = Array.from({ length: 7 }, (_, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  title: `Decisión ${index + 1}`,
  domain: "hotel",
  urgency: index < 2 ? "P0" : "P1",
  recommendation: "Revisar",
  rationale: "Impacto operativo",
  evidence: `evidence://${index + 1}`,
  owner: "Mauricio",
  deadline: null,
  approvalLevel: "founder_approval" as const,
  status: "En ejecución",
}));

const projectId = "00000000-0000-0000-0000-000000000021";

const data = {
  decisions,
  exceptions: [
    { id: "exception-1", title: "Internet degradado", domain: "Sistemas", source: "Supabase", freshness: "Hace 5 min" },
  ],
  delegatedActions: [
    { id: "action-1", title: "Revisar habitación 25", owner: "Mantenimiento", nextStep: "Validar proyector", evidence: "ticket://1" },
  ],
  projects: [
    { id: projectId, title: "TORO OS", milestone: "Fase 1", blocker: null, nextAction: "Validar Executive Home", owner: "Mauricio", status: "En curso" },
  ],
  systemHealth: { status: "healthy" as const, label: "Sistemas operativos", checkedAt: "2026-09-14T21:40:00Z" },
};

describe("ExecutiveHome", () => {
  it("renders the five required executive sections in Spanish", () => {
    render(<ExecutiveHome data={data} />);

    expect(screen.getByRole("heading", { name: "Necesita mi decisión" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Qué está mal hoy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Qué avanza sin mí" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mis proyectos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Acciones rápidas" })).toBeInTheDocument();
  });

  it("shows at most five decisions inline and links to the complete queue", () => {
    render(<ExecutiveHome data={data} />);

    expect(screen.getAllByTestId("executive-decision-card")).toHaveLength(5);
    expect(screen.queryByText("Decisión 6")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver todas las decisiones/i })).toHaveAttribute("href", "/toro/decisiones");
  });

  it("links executive projects to the governed read-only directory", () => {
    render(<ExecutiveHome data={data} />);

    expect(screen.getByRole("link", { name: /ver todos los proyectos/i })).toHaveAttribute("href", "/toro/proyectos");
    expect(screen.getByRole("link", { name: /abrir proyecto toro os/i })).toHaveAttribute(
      "href",
      `/toro/proyectos?project=${projectId}`,
    );
  });
});
