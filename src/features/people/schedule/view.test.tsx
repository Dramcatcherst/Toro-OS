import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MyScheduleState } from "./types";
import { MyScheduleView } from "./view";

const ready: MyScheduleState = {
  status: "ready",
  data: {
    employeeId: "employee-1",
    preferredName: "Persona",
    shifts: [
      {
        id: "shift-1",
        shiftDate: "2026-09-24",
        startsAt: "08:00:00",
        endsAt: "16:00:00",
        breakMinutes: 30,
        assignmentStatus: "published",
        publishedAt: "2026-09-22T10:00:00Z",
        confirmedAt: null,
      },
      {
        id: "shift-2",
        shiftDate: "2026-09-25",
        startsAt: "09:00:00",
        endsAt: "17:00:00",
        breakMinutes: 60,
        assignmentStatus: "confirmed",
        publishedAt: "2026-09-22T10:00:00Z",
        confirmedAt: "2026-09-23T08:00:00Z",
      },
    ],
    source: "supabase_canonical",
    loadedAt: "2026-09-23T12:00:00Z",
  },
};

describe("MyScheduleView", () => {
  it("renders published/confirmed self schedule without internal fields", () => {
    render(<MyScheduleView state={ready} />);

    expect(
      screen.getByRole("heading", { name: "Mi horario" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Publicado")).toBeInTheDocument();
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
    expect(screen.getAllByText("7h 30m").length).toBeGreaterThan(0);
    expect(screen.getAllByText("7h 00m").length).toBeGreaterThan(0);

    expect(screen.queryByText(/salary/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/template/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/nota interna/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
  });

  it("renders safe unavailable state", () => {
    render(
      <MyScheduleView
        state={{
          status: "not_available",
          reason: "employee_link_required",
        }}
      />,
    );

    expect(
      screen.getByText("Mi horario no está disponible"),
    ).toBeInTheDocument();
  });

  it("does not show partial shifts on source error", () => {
    render(
      <MyScheduleView
        state={{
          status: "error",
          reason: "data_unavailable",
          failedSources: ["shift_assignments"],
        }}
      />,
    );

    expect(
      screen.getByText("No pudimos cargar tu horario"),
    ).toBeInTheDocument();
  });
});
