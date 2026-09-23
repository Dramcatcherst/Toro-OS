import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./form", () => ({
  LeaveRequestForm: () => <div data-testid="leave-form">Formulario</div>,
}));

import type { PeopleSelfServiceState } from "@/features/people/self-service/types";

import { PeopleLeaveWorkspace } from "./workspace";

const ready: PeopleSelfServiceState = {
  status: "ready",
  data: {
    employment: {
      employeeId: "employee-1",
      preferredName: "Persona",
      employmentStatus: "active",
      hireDate: "2026-01-10",
      workArea: "Recepción",
    },
    profile: null,
    upcomingShifts: [],
    leaveRequests: [
      {
        id: "leave-1",
        leaveType: "vacation",
        startsOn: "2026-10-01",
        endsOn: "2026-10-03",
        requestStatus: "pending_manager",
        reason: "Descanso familiar",
      },
      {
        id: "leave-2",
        leaveType: "personal",
        startsOn: "2026-09-10",
        endsOn: "2026-09-10",
        requestStatus: "approved",
        reason: "Cita",
      },
    ],
    leaveBalances: [
      {
        leaveType: "vacation",
        availableDays: 5.5,
        asOfDate: "2026-09-23",
      },
    ],
    recentAttendance: [],
    source: "supabase_canonical",
    loadedAt: "2026-09-23T12:00:00Z",
  },
};

describe("PeopleLeaveWorkspace", () => {
  it("counts the governed pending_manager state and labels requests", () => {
    render(<PeopleLeaveWorkspace state={ready} />);

    expect(screen.getByText("Pendientes: 1")).toBeInTheDocument();
    expect(screen.getByText("Pendiente de jefatura")).toBeInTheDocument();
    expect(screen.getByText("Aprobada")).toBeInTheDocument();
    expect(screen.getByText("5.50 días")).toBeInTheDocument();
    expect(screen.getByTestId("leave-form")).toBeInTheDocument();
  });

  it("does not render the form when self-service data is unavailable", () => {
    render(
      <PeopleLeaveWorkspace
        state={{
          status: "not_available",
          reason: "employee_link_required",
        }}
      />,
    );

    expect(screen.queryByTestId("leave-form")).not.toBeInTheDocument();
    expect(screen.getByText("Solicitudes no disponibles")).toBeInTheDocument();
  });

  it("blocks write UX while source data is unavailable", () => {
    render(
      <PeopleLeaveWorkspace
        state={{
          status: "error",
          reason: "data_unavailable",
          failedSources: ["leave_requests"],
        }}
      />,
    );

    expect(screen.queryByTestId("leave-form")).not.toBeInTheDocument();
  });
});
