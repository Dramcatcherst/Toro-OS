import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PeopleSelfServiceState } from "./types";
import { PeopleSelfServiceView } from "./view";

const readyState: PeopleSelfServiceState = {
  status: "ready",
  data: {
    employment: {
      employeeId: "employee-1",
      preferredName: "Persona",
      employmentStatus: "active",
      hireDate: "2026-01-10",
      workArea: "Recepción",
    },
    profile: {
      employeeId: "employee-1",
      preferredName: "Persona",
      phone: "0000",
      personalEmail: "person@example.invalid",
      address: "Dirección privada",
      emergencyName: "Contacto",
      emergencyRelationship: "Familia",
      emergencyPhone: "1111",
    },
    upcomingShifts: [
      {
        id: "shift-1",
        shiftDate: "2026-09-24",
        startsAt: "08:00:00",
        endsAt: "16:00:00",
        breakMinutes: 30,
        assignmentStatus: "published",
        publishedAt: null,
        confirmedAt: null,
      },
    ],
    leaveRequests: [
      {
        id: "leave-1",
        leaveType: "vacation",
        startsOn: "2026-10-01",
        endsOn: "2026-10-02",
        requestStatus: "pending",
        reason: "Personal",
      },
    ],
    leaveBalances: [
      {
        leaveType: "vacation",
        availableDays: 5.5,
        asOfDate: "2026-09-23",
      },
    ],
    recentAttendance: [
      {
        id: "day-1",
        workDate: "2026-09-22",
        firstEntry: "2026-09-22T14:00:00Z",
        lastExit: "2026-09-22T22:00:00Z",
        workedMinutes: 480,
        attendanceStatus: "complete",
        approvalStatus: "approved",
      },
    ],
    source: "supabase_canonical",
    loadedAt: "2026-09-23T12:00:00Z",
  },
};

describe("PeopleSelfServiceView", () => {
  it("renders only the employee's self-service summary", () => {
    render(<PeopleSelfServiceView state={readyState} />);

    expect(screen.getByRole("heading", { name: "Persona" })).toBeInTheDocument();
    expect(screen.getByText("5.50 días")).toBeInTheDocument();
    expect(screen.getByText("person@example.invalid")).toBeInTheDocument();
    expect(screen.getByText("8h 00m")).toBeInTheDocument();

    expect(screen.queryByText(/cuenta bancaria/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/salario/i)).not.toBeInTheDocument();
  });

  it("renders a safe unavailable state for missing employee linkage", () => {
    render(
      <PeopleSelfServiceView
        state={{
          status: "not_available",
          reason: "employee_link_required",
        }}
      />,
    );

    expect(
      screen.getByText("Mi perfil no está disponible todavía"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/todavía no está vinculada a un expediente laboral/i),
    ).toBeInTheDocument();
  });

  it("renders a safe blocked state for identity mismatch", () => {
    render(
      <PeopleSelfServiceView
        state={{
          status: "not_available",
          reason: "employee_identity_mismatch",
        }}
      />,
    );

    expect(screen.getByText(/diferencia de identidad/i)).toBeInTheDocument();
  });

  it("does not render partial data on source error", () => {
    render(
      <PeopleSelfServiceView
        state={{
          status: "error",
          reason: "data_unavailable",
          failedSources: ["attendance"],
        }}
      />,
    );

    expect(
      screen.getByText("No pudimos cargar tu información"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Persona")).not.toBeInTheDocument();
  });
});
