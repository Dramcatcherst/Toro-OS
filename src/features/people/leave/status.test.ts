import { describe, expect, it } from "vitest";

import { isPendingLeaveStatus, leaveStatusLabel } from "./status";

describe("TORO People leave status", () => {
  it.each(["pending", "pending_manager", "pending_hr"])(
    "treats %s as pending",
    (status) => {
      expect(isPendingLeaveStatus(status)).toBe(true);
    },
  );

  it.each(["approved", "rejected", "cancelled", ""])(
    "does not treat %s as pending",
    (status) => {
      expect(isPendingLeaveStatus(status)).toBe(false);
    },
  );

  it("presents governed workflow labels", () => {
    expect(leaveStatusLabel("pending_manager")).toBe("Pendiente de jefatura");
    expect(leaveStatusLabel("pending_hr")).toBe("Pendiente de RR. HH.");
    expect(leaveStatusLabel("approved")).toBe("Aprobada");
  });
});
