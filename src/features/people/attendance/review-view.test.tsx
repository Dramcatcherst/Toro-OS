import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AttendanceReviewState } from "./review-types";
import { AttendanceReviewView } from "./review-view";

const ready: AttendanceReviewState = {
  status: "ready",
  data: {
    roles: ["RRHH"],
    canViewImports: true,
    days: [
      {
        id: "day-1",
        employeeId: "employee-1",
        employeeName: "Persona",
        workArea: "Recepción",
        workDate: "2026-09-22",
        actualWorkedMinutes: 480,
        officialWorkedMinutes: 475,
        attendanceStatus: "incomplete",
        approvalStatus: "pending",
        payrollEligible: false,
      },
    ],
    openExceptions: [
      {
        id: "exception-1",
        attendanceDayId: "day-1",
        exceptionType: "missing_punch",
        severity: "medium",
        description: "Falta la salida.",
        resolutionStatus: "open",
        createdAt: "2026-09-22T20:00:00Z",
      },
    ],
    recentImports: [
      {
        id: "import-1",
        periodFrom: "2026-09-01",
        periodTo: "2026-09-15",
        rawRowCount: 120,
        acceptedPunchCount: 118,
        duplicateCount: 2,
        importedAt: "2026-09-16T10:00:00Z",
        status: "committed",
      },
    ],
    source: "supabase_canonical",
    loadedAt: "2026-09-23T12:00:00Z",
  },
};

describe("AttendanceReviewView", () => {
  it("renders read-only review without raw clock/import payload", () => {
    render(<AttendanceReviewView state={ready} />);

    expect(
      screen.getByRole("heading", { name: "Asistencia" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Falta una marca")).toBeInTheDocument();
    expect(screen.getByText("Persona · Recepción · 22/09/2026")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /resolver/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/sha/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/raw_payload/i)).not.toBeInTheDocument();
  });

  it("hides import cards when the role cannot view time imports", () => {
    render(
      <AttendanceReviewView
        state={{
          ...ready,
          data: {
            ...ready.data,
            roles: ["GERENCIA"],
            canViewImports: false,
            recentImports: [],
          },
        }}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "Últimas importaciones del reloj" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Las importaciones del reloj no forman parte de tu vista autorizada.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a safe role-denied state", () => {
    render(
      <AttendanceReviewView
        state={{
          status: "not_available",
          reason: "attendance_review_role_required",
        }}
      />,
    );

    expect(
      screen.getByText("Revisión de asistencia no disponible"),
    ).toBeInTheDocument();
  });
});
