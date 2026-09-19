// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  parseMaintenanceFieldRound,
  sortMaintenanceChecks,
} from "./maintenance";
import { MaintenanceBoard } from "./maintenance-board";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const raw = {
  round: {
    round_key: "MNT-DAILY-P0-P1-20260919",
    round_name: "Ronda diaria mantenimiento · P0/P1 · 19/09/2026",
    round_status: "ready",
    priority: "p0",
    objective: "Cerrar riesgos reales con evidencia.",
    estimated_minutes: 75,
    responsible_name: "Mantenimiento + Housekeeping QA",
    total_checks: 2,
    required_checks: 2,
    pass_checks: 0,
    fail_checks: 0,
    not_reviewed_checks: 0,
    pending_checks: 2,
    closure_ready_passes: 0,
    last_check_updated_at: null,
  },
  checks: [
    {
      check_id: "00000000-0000-0000-0000-000000000002",
      check_order: 200,
      block_label: "P1 · Lavandería",
      area_label: "LG OE",
      room_number: null,
      check_text: "Diagnosticar lavadora.",
      pass_criteria: "PASS = causa y decisión documentadas.",
      result_status: "pending",
      evidence_ref: null,
      evidence_note: null,
      responsible_name: null,
      captured_at: null,
      requires_supervisor_review: false,
      supervisor_confirmed: false,
      closure_ready: false,
      supplier_or_technician: "Técnico LG",
      cost_signal_amount: 2800,
      cost_signal_currency: "USD",
      cost_signal_kind: "vendor_quote",
      cost_signal_verification: "source_reported",
      approved_cost_amount: null,
      approved_cost_currency: null,
    },
    {
      check_id: "00000000-0000-0000-0000-000000000001",
      check_order: 10,
      block_label: "P0 · Agua/Humedad",
      area_label: "#22",
      room_number: 22,
      check_text: "Cerrar salida de agua.",
      pass_criteria: "PASS = sin fuga bajo prueba.",
      result_status: "pending",
      evidence_ref: null,
      evidence_note: null,
      responsible_name: null,
      captured_at: null,
      requires_supervisor_review: true,
      supervisor_confirmed: false,
      closure_ready: false,
      supplier_or_technician: null,
      cost_signal_amount: null,
      cost_signal_currency: null,
      cost_signal_kind: "unknown",
      cost_signal_verification: "source_reported",
      approved_cost_amount: null,
      approved_cost_currency: null,
    },
  ],
};

describe("maintenance workspace", () => {
  it("parses governed RPC data and keeps P0 before P1 regardless of source order", () => {
    const data = parseMaintenanceFieldRound(raw);
    const sorted = sortMaintenanceChecks(data.checks);

    expect(sorted.map((check) => check.checkId)).toEqual([
      "00000000-0000-0000-0000-000000000001",
      "00000000-0000-0000-0000-000000000002",
    ]);
  });

  it("renders room/area linkage and requires evidence-oriented field controls", () => {
    const data = parseMaintenanceFieldRound(raw);

    render(
      <MaintenanceBoard
        data={data}
        defaultResponsible="Oliver"
        canConfirmP0={false}
      />,
    );

    expect(screen.getByText(/#22 · Habitación 22/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/foto \/ evidencia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "PASS" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "FAIL" }).length).toBeGreaterThan(0);
  });

  it("never presents a vendor quote as an approved cost", () => {
    const data = parseMaintenanceFieldRound(raw);

    render(
      <MaintenanceBoard
        data={data}
        defaultResponsible="Oliver"
        canConfirmP0={false}
      />,
    );

    expect(screen.getByText(/cotización reportada/i)).toHaveTextContent("USD 2,800");
    expect(screen.getByText(/costo aprobado/i)).toHaveTextContent(/no disponible/i);
  });

  it("fails closed on malformed field payloads", () => {
    expect(() =>
      parseMaintenanceFieldRound({
        round: { round_key: "bad" },
        checks: [],
      }),
    ).toThrow(/maintenance/i);
  });
});
