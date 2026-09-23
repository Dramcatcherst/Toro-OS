export type KrossLiveReadAcceptanceInput = {
  authorizedRealRunEvidenced: boolean;
  runReadOnly: boolean;
  duplicateGroups: number;
  idempotentReplayPassed: boolean;
  futureTimestampRows: number;
  unsafeRowsInSafeView: number;
  sourceIsLiveEvidenceVerified: boolean;
  eligibleCurrentReservationExpected: boolean;
  currentReservationsSafeRows: number;
  zeroCurrentStateProvenFromKross: boolean;
  receptionRlsReadPassed: boolean;
  unauthorizedReservationReadBlocked: boolean;
  pmsWriteCount: number;
  rollbackEvidencePresent: boolean;
  safeCurrentHealthSources: number;
};

export type KrossAcceptanceCheck = {
  key: string;
  passed: boolean;
  detail: string;
};

export type KrossLiveReadAcceptanceResult = {
  passed: boolean;
  checks: KrossAcceptanceCheck[];
  blockers: string[];
  unlocks: string[];
};

export function evaluateKrossFirstLiveRead(
  input: KrossLiveReadAcceptanceInput,
): KrossLiveReadAcceptanceResult {
  const checks: KrossAcceptanceCheck[] = [
    {
      key: "authorized_real_run",
      passed: input.authorizedRealRunEvidenced,
      detail: "A real authorized Kross import/read run is evidenced.",
    },
    {
      key: "read_only",
      passed: input.runReadOnly,
      detail: "The run is proven read-only.",
    },
    {
      key: "dedupe",
      passed: input.duplicateGroups === 0,
      detail: "No duplicate scoped Kross reservation identities exist.",
    },
    {
      key: "idempotent_replay",
      passed: input.idempotentReplayPassed,
      detail: "Replaying the same source does not create a second reservation.",
    },
    {
      key: "timestamp_safety",
      passed: input.futureTimestampRows === 0,
      detail: "No future source/sync timestamps pass acceptance.",
    },
    {
      key: "safe_view_quality",
      passed: input.unsafeRowsInSafeView === 0,
      detail: "Unsafe quality states stay outside current_reservations_safe.",
    },
    {
      key: "live_evidence",
      passed:
        input.sourceIsLiveEvidenceVerified &&
        input.safeCurrentHealthSources > 0,
      detail: "source_is_live is evidence-backed and Kross health is current-safe.",
    },
    {
      key: "current_state_truth",
      passed: input.eligibleCurrentReservationExpected
        ? input.currentReservationsSafeRows > 0
        : input.zeroCurrentStateProvenFromKross,
      detail:
        "Current reservation presence/absence is proven from Kross authority.",
    },
    {
      key: "reception_rls",
      passed: input.receptionRlsReadPassed,
      detail: "Authorized Reception can read the safe projection under RLS.",
    },
    {
      key: "private_data_isolation",
      passed: input.unauthorizedReservationReadBlocked,
      detail: "Unauthorized roles cannot read private reservation state.",
    },
    {
      key: "no_pms_write",
      passed: input.pmsWriteCount === 0,
      detail: "No PMS write occurred during the proof.",
    },
    {
      key: "rollback",
      passed: input.rollbackEvidencePresent,
      detail: "Recovery/rollback evidence exists.",
    },
  ];

  const blockers = checks
    .filter((check) => !check.passed)
    .map((check) => check.key);

  return {
    passed: blockers.length === 0,
    checks,
    blockers,
    unlocks:
      blockers.length === 0
        ? ["guest.arrivals_departures:READ_ONLY"]
        : [],
  };
}
