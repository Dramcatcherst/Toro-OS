import { describe, expect, it } from "vitest";

import { evaluateKrossFirstLiveRead } from "./acceptance";

const passing = {
  authorizedRealRunEvidenced: true,
  runReadOnly: true,
  duplicateGroups: 0,
  idempotentReplayPassed: true,
  futureTimestampRows: 0,
  unsafeRowsInSafeView: 0,
  sourceIsLiveEvidenceVerified: true,
  eligibleCurrentReservationExpected: true,
  currentReservationsSafeRows: 4,
  zeroCurrentStateProvenFromKross: false,
  receptionRlsReadPassed: true,
  unauthorizedReservationReadBlocked: true,
  pmsWriteCount: 0,
  rollbackEvidencePresent: true,
  safeCurrentHealthSources: 1,
};

describe("evaluateKrossFirstLiveRead", () => {
  it("passes only when the full read-only acceptance gate is satisfied", () => {
    const result = evaluateKrossFirstLiveRead(passing);

    expect(result.passed).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.unlocks).toEqual(["guest.arrivals_departures:READ_ONLY"]);
    expect(result.checks).toHaveLength(12);
  });

  it("fails closed when transport/run evidence is missing", () => {
    const result = evaluateKrossFirstLiveRead({
      ...passing,
      authorizedRealRunEvidenced: false,
      sourceIsLiveEvidenceVerified: false,
      safeCurrentHealthSources: 0,
    });

    expect(result.passed).toBe(false);
    expect(result.unlocks).toEqual([]);
    expect(result.blockers).toEqual(
      expect.arrayContaining(["authorized_real_run", "live_evidence"]),
    );
  });

  it("accepts a proven zero-current-reservation state when no eligible reservation is expected", () => {
    const result = evaluateKrossFirstLiveRead({
      ...passing,
      eligibleCurrentReservationExpected: false,
      currentReservationsSafeRows: 0,
      zeroCurrentStateProvenFromKross: true,
    });

    expect(result.passed).toBe(true);
  });

  it("does not infer an empty hotel from zero rows alone", () => {
    const result = evaluateKrossFirstLiveRead({
      ...passing,
      eligibleCurrentReservationExpected: false,
      currentReservationsSafeRows: 0,
      zeroCurrentStateProvenFromKross: false,
    });

    expect(result.passed).toBe(false);
    expect(result.blockers).toContain("current_state_truth");
  });

  it("blocks on any PMS write evidence", () => {
    const result = evaluateKrossFirstLiveRead({
      ...passing,
      pmsWriteCount: 1,
    });

    expect(result.passed).toBe(false);
    expect(result.blockers).toContain("no_pms_write");
  });
});
