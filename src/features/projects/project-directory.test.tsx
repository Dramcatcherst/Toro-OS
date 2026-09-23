import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectDirectory } from "./project-directory";

const projects = [
  {
    id: "00000000-0000-0000-0000-000000000021",
    title: "TORO Executive Control",
    status: "In Progress",
    priority: "critical",
    owner: "Gerencia",
    nextAction: "Cerrar Room 360",
    category: "systems",
    businessArea: "hotel",
    freshness: "2026-09-15T14:45:16.838Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    title: "Website",
    status: "Blocked",
    priority: "high",
    owner: null,
    nextAction: null,
    category: "growth",
    businessArea: "hotel",
    freshness: "2026-09-15T10:00:00.000Z",
  },
];

describe("ProjectDirectory", () => {
  it("renders a read-only project directory and highlights the project selected by Search", () => {
    render(
      <ProjectDirectory
        projects={projects}
        selectedProjectId="00000000-0000-0000-0000-000000000021"
      />,
    );

    expect(screen.getByRole("heading", { name: "Proyectos" })).toBeInTheDocument();
    expect(screen.getByText("TORO Executive Control").closest("article")).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(screen.getByText("Website").closest("article")).toHaveAttribute("data-selected", "false");
    expect(screen.getByText(/Última actualización/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows an honest empty state", () => {
    render(<ProjectDirectory projects={[]} selectedProjectId={null} />);
    expect(screen.getByText(/No hay proyectos activos disponibles/i)).toBeInTheDocument();
  });
});
