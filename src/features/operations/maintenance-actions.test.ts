import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ rpc }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  confirmMaintenanceCheck,
  submitMaintenanceCheck,
} from "./maintenance-actions";

const checkId = "00000000-0000-0000-0000-000000000001";

describe("maintenance actions", () => {
  beforeEach(() => rpc.mockReset());

  it("requires evidence before PASS/FAIL reaches the RPC", async () => {
    await expect(
      submitMaintenanceCheck({
        checkId,
        result: "pass",
        evidenceRef: "",
        evidenceNote: "",
        responsibleName: "Oliver",
      }),
    ).rejects.toThrow(/evidence|evidencia/i);

    expect(rpc).not.toHaveBeenCalled();
  });

  it("submits normalized PASS evidence through the governed RPC", async () => {
    rpc.mockResolvedValue({
      data: {
        check: {
          check_id: checkId,
          result_status: "pass",
          evidence_ref: "dropbox://foto-22",
          responsible_name: "Oliver",
          captured_at: "2026-09-19T07:00:00Z",
          requires_supervisor_review: true,
          supervisor_confirmed: false,
        },
        progress: {
          total_checks: 20,
          pass_checks: 1,
          fail_checks: 0,
          not_reviewed_checks: 0,
          pending_checks: 19,
        },
      },
      error: null,
    });

    await submitMaintenanceCheck({
      checkId,
      result: "pass",
      evidenceRef: " dropbox://foto-22 ",
      evidenceNote: " Sin fuga ",
      responsibleName: " Oliver ",
    });

    expect(rpc).toHaveBeenCalledWith("submit_maintenance_inspection_check", {
      p_check_id: checkId,
      p_result: "pass",
      p_evidence_ref: "dropbox://foto-22",
      p_evidence_note: "Sin fuga",
      p_responsible_name: "Oliver",
    });
  });

  it("uses the supervisor RPC for P0 confirmation", async () => {
    rpc.mockResolvedValue({ data: null, error: null });

    await confirmMaintenanceCheck({
      checkId,
      supervisorName: "Mauricio",
    });

    expect(rpc).toHaveBeenCalledWith("confirm_maintenance_inspection_check", {
      p_check_id: checkId,
      p_supervisor_name: "Mauricio",
    });
  });
});
