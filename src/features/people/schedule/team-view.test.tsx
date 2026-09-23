import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TeamScheduleState } from "./team-types";
import { TeamScheduleView } from "./team-view";

const ready: TeamScheduleState = {
  status: "ready",
  data: {
    roles: ["RRHH"],
    rangeFrom: "2026-09-23",
    rangeTo: "2026-10-13",
    shifts: [
      {
        id: "shift-1",
        employeeId: "employee-1",
        employeeName: "Persona Uno",
        workArea: "Recepción",
        department: "Recepción",
        shiftDate: "2026-09-24",
        startsAt: "08:00:00",
        endsAt: "16:00:00",
        breakMinutes: 30,
        assignmentStatus: "draft",
      },
      {
        id: "shift-2",
        employeeId: "employee-2",
        employeeName: "Persona Dos",
        workArea: "Mantenimiento",
        department: "Operaciones",
        shiftDate: "2026-09-24",
        startsAt: "09:00:00",
        endsAt: "17:00:00",
        breakMinutes: 60,
        assignmentStatus: "published",
      },
    ],
    source: "supabase_canonical",
    loadedAt: "2026-09-23T12:00:00Z",
  },
};

describe("TeamScheduleView", () => {
  it("renders a read-only team schedule without finance/admin internals", () => {
    render(<TeamScheduleView state={ready} />);

    expect(
      screen.getByRole("heading", { name: "Horarios" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Persona Uno")).toBeInTheDocument();
    expect(screen.getByText("Persona Dos")).toBeInTheDocument();
    expect(screen.getByText("Borrador")).toBeInTheDocument();
    expect(screen.getByText("Publicado")).toBeInTheDocument();

    expect(screen.queryByText(/salario/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/forecast/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /publicar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
  });

  it("renders role-denied state safely", () => {
    render(
      <TeamScheduleView
        state={{
          status: "not_available",
          reason: "team_schedule_role_required",
        }}
      />,
    );

    expect(
      screen.getByText("Horarios de equipo no disponibles"),
    ).toBeInTheDocument();
  });
});
