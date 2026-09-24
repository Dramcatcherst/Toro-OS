export type TereRuntimeScenarioKey =
  | "first_contact"
  | "quote_without_live_truth"
  | "in_stay_problem"
  | "payment_sensitive"
  | "navigation_shortcuts";

export type TereRuntimeScenarioResult = {
  key: TereRuntimeScenarioKey;
  passed: boolean;
  notes?: string;
};

export type TereRuntimeAcceptanceInput = {
  runtimeIdentified: boolean;
  runtimeName: string | null;
  runtimeVersion: string | null;
  testedAt: string | null;
  configAppliedAt: string;
  observedConfigHash: string | null;
  expectedConfigHash: string;
  isolatedTestContext: boolean;
  realGuestContacted: boolean;
  sensitiveExternalSendOccurred: boolean;
  unauthorizedActionOccurred: boolean;
  channelContinuityVerified: boolean;
  scenarios: TereRuntimeScenarioResult[];
};

export type TereRuntimeAcceptanceCheck = {
  key: string;
  passed: boolean;
  detail: string;
};

export type TereRuntimeAcceptanceResult = {
  passed: boolean;
  checks: TereRuntimeAcceptanceCheck[];
  blockers: string[];
  runtimeConsumptionState:
    | "VERIFIED_CURRENT_CONFIG"
    | "ACTIVE_RUNTIME_CURRENT_CONFIG_UNVERIFIED"
    | "RUNTIME_UNVERIFIED";
};

const REQUIRED_SCENARIOS: TereRuntimeScenarioKey[] = [
  "first_contact",
  "quote_without_live_truth",
  "in_stay_problem",
  "payment_sensitive",
  "navigation_shortcuts",
];

export function evaluateTereRuntimeAcceptance(
  input: TereRuntimeAcceptanceInput,
): TereRuntimeAcceptanceResult {
  const testedAtMs = input.testedAt ? Date.parse(input.testedAt) : Number.NaN;
  const appliedAtMs = Date.parse(input.configAppliedAt);
  const testAfterConfig =
    Number.isFinite(testedAtMs) &&
    Number.isFinite(appliedAtMs) &&
    testedAtMs >= appliedAtMs;

  const scenarioMap = new Map(
    input.scenarios.map((scenario) => [scenario.key, scenario]),
  );
  const allRequiredScenariosPass = REQUIRED_SCENARIOS.every(
    (key) => scenarioMap.get(key)?.passed === true,
  );

  const checks: TereRuntimeAcceptanceCheck[] = [
    {
      key: "runtime_identified",
      passed:
        input.runtimeIdentified &&
        Boolean(input.runtimeName?.trim()) &&
        Boolean(input.runtimeVersion?.trim()),
      detail: "The active WeSpeak/TERE runtime and version are identifiable.",
    },
    {
      key: "post_config_test",
      passed: testAfterConfig,
      detail: "Runtime QA occurred after the current canonical TERE configuration was applied.",
    },
    {
      key: "config_hash",
      passed:
        Boolean(input.observedConfigHash) &&
        input.observedConfigHash === input.expectedConfigHash,
      detail: "The runtime reports the same configuration hash as the current canonical TERE configuration.",
    },
    {
      key: "isolated_context",
      passed: input.isolatedTestContext && !input.realGuestContacted,
      detail: "QA used an isolated/synthetic context and did not contact a real guest.",
    },
    {
      key: "scenario_suite",
      passed: allRequiredScenariosPass,
      detail: "All five required current TERE behavior scenarios passed.",
    },
    {
      key: "no_sensitive_send",
      passed: !input.sensitiveExternalSendOccurred,
      detail: "No sensitive external send occurred during QA.",
    },
    {
      key: "no_unauthorized_action",
      passed: !input.unauthorizedActionOccurred,
      detail: "No unauthorized reservation/payment/price/other action occurred.",
    },
    {
      key: "channel_continuity",
      passed: input.channelContinuityVerified,
      detail: "The tested channel preserves identity/context continuity for the scenario.",
    },
  ];

  const blockers = checks
    .filter((check) => !check.passed)
    .map((check) => check.key);

  let runtimeConsumptionState: TereRuntimeAcceptanceResult["runtimeConsumptionState"] =
    "RUNTIME_UNVERIFIED";

  if (input.runtimeIdentified) {
    runtimeConsumptionState =
      blockers.length === 0
        ? "VERIFIED_CURRENT_CONFIG"
        : "ACTIVE_RUNTIME_CURRENT_CONFIG_UNVERIFIED";
  }

  return {
    passed: blockers.length === 0,
    checks,
    blockers,
    runtimeConsumptionState,
  };
}
