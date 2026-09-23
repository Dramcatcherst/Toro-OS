import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

import { LeaveRequestForm } from "./form";

describe("LeaveRequestForm", () => {
  beforeEach(() => {
    refresh.mockReset();
    vi.restoreAllMocks();
  });

  it("submits only leave fields and never an employee identity", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "request-a" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<LeaveRequestForm />);

    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2026-10-01" },
    });
    fireEvent.change(screen.getByLabelText("Hasta"), {
      target: { value: "2026-10-03" },
    });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Descanso familiar" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Enviar solicitud" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      leaveType: "vacation",
      startsOn: "2026-10-01",
      endsOn: "2026-10-03",
      reason: "Descanso familiar",
    });
    expect(String(init.body)).not.toContain("employeeId");

    expect(
      await screen.findByText(
        "Solicitud enviada. Quedó pendiente de revisión.",
      ),
    ).toBeInTheDocument();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("shows the governed API error and does not refresh", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Ya existe una solicitud que se cruza con esas fechas.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    render(<LeaveRequestForm />);

    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2026-10-01" },
    });
    fireEvent.change(screen.getByLabelText("Hasta"), {
      target: { value: "2026-10-03" },
    });
    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Descanso familiar" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Enviar solicitud" }),
    );

    expect(
      await screen.findByText(
        "Ya existe una solicitud que se cruza con esas fechas.",
      ),
    ).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });
});
