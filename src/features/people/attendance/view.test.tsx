import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MyAttendanceState } from "./types";
import { MyAttendanceView } from "./view";

const ready: MyAttendanceState = {
  status: "ready",
  data: {
    employeeId: "employee-1",
    preferredName: "Persona",
    days: [
      {
        id: "day-1",
        workDate: "2026-09-22",
        firstEntry: "2026-09-22T14:00:00Z",
        lastExit: "2026-09-22T22:00:00Z",
        actualWorkedMinutes: 480,
        officialWorkedMinutes: 475,
        attendanceStatus: "complete",
        approvalStatus: "approved",
        payrollEligible: true,
      },
    ],
    source: "supabase_canonical",
    loadedAt: "2026-09-23T12:00:00Z",
  },
};

describe("MyAttendanceView", () => {
  it("renders own summarized attendance without raw clock data", () => {
    render(<MyAttendanceView state={ready} />);

    expect(
      screen.getByRole("heading", { name: "Mi asistencia" }),
    ).toBeInTheDocument();
    expect(screen.getByText("8h 00m")).toBeInTheDocument();
    expect(screen.getByText("7h 55m")).toBeInTheDocument();
    expect(screen.getByText("Incluida")).toBeInTheDocument();

    expect(screen.queryByText(/clock_employee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/source_import/i)).not.toBeInTheDocument();
  });

  it("renders safe unavailable state", () => {
    render(
      <MyAttendanceView
        state={{
          status: "not_available",
          reason: "employee_link_required",
        }}
      />,
    );

    expect(
      screen.getByText("Mi asistencia no está disponible"),
    ).toBeInTheDocument();
  });

  it("does not render partial data on error", () => {
    render(
      <MyAttendanceView
        state={{
          status: "error",
          reason: "data_unavailable",
          failedSources: ["attendance"],
        }}
      />,
    );

    expect(
      screen.getByText("No pudimos cargar tu asistencia"),
    ).toBeInTheDocument();
  });
});
