import type {
  TereRuntimeAcceptanceInput,
  TereRuntimeScenarioKey,
  TereRuntimeScenarioResult,
} from "./runtime-acceptance";

export type TereRuntimeEvidenceScenario = {
  key: TereRuntimeScenarioKey;
  passed: boolean;
  notes?: string;
};

export type TereRuntimeEvidencePacket = {
  runtime: {
    identified: boolean;
    name: string | null;
    version: string | null;
    observed_config_hash: string | null;
  };
  test: {
    tested_at: string | null;
    isolated_context: boolean;
    real_guest_contacted: boolean;
    sensitive_external_send_occurred: boolean;
    unauthorized_action_occurred: boolean;
    channel_continuity_verified: boolean;
  };
  scenarios: TereRuntimeEvidenceScenario[];
};

export type TereRuntimeEvidenceValidation = {
  valid: boolean;
  errors: string[];
  acceptanceInput: TereRuntimeAcceptanceInput | null;
};

const REQUIRED_KEYS: TereRuntimeScenarioKey[] = [
  "first_contact",
  "quote_without_live_truth",
  "in_stay_problem",
  "payment_sensitive",
  "navigation_shortcuts",
];

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isScenarioKey(value: unknown): value is TereRuntimeScenarioKey {
  return (
    typeof value === "string" &&
    REQUIRED_KEYS.includes(value as TereRuntimeScenarioKey)
  );
}

export function validateTereRuntimeEvidencePacket(
  raw: unknown,
  {
    configAppliedAt,
    expectedConfigHash,
  }: {
    configAppliedAt: string;
    expectedConfigHash: string;
  },
): TereRuntimeEvidenceValidation {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      valid: false,
      errors: ["Evidence packet must be an object."],
      acceptanceInput: null,
    };
  }

  const packet = raw as Record<string, unknown>;
  const runtime =
    packet.runtime && typeof packet.runtime === "object" && !Array.isArray(packet.runtime)
      ? (packet.runtime as Record<string, unknown>)
      : null;
  const test =
    packet.test && typeof packet.test === "object" && !Array.isArray(packet.test)
      ? (packet.test as Record<string, unknown>)
      : null;
  const scenariosRaw = Array.isArray(packet.scenarios) ? packet.scenarios : null;

  if (!runtime) errors.push("runtime object is required.");
  if (!test) errors.push("test object is required.");
  if (!scenariosRaw) errors.push("scenarios array is required.");

  if (errors.length) {
    return { valid: false, errors, acceptanceInput: null };
  }

  const runtimeIdentified = runtime?.identified;
  const isolatedContext = test?.isolated_context;
  const realGuestContacted = test?.real_guest_contacted;
  const sensitiveExternalSendOccurred = test?.sensitive_external_send_occurred;
  const unauthorizedActionOccurred = test?.unauthorized_action_occurred;
  const channelContinuityVerified = test?.channel_continuity_verified;

  for (const [field, value] of Object.entries({
    "runtime.identified": runtimeIdentified,
    "test.isolated_context": isolatedContext,
    "test.real_guest_contacted": realGuestContacted,
    "test.sensitive_external_send_occurred": sensitiveExternalSendOccurred,
    "test.unauthorized_action_occurred": unauthorizedActionOccurred,
    "test.channel_continuity_verified": channelContinuityVerified,
  })) {
    if (!isBoolean(value)) errors.push(`${field} must be boolean.`);
  }

  const seen = new Set<TereRuntimeScenarioKey>();
  const scenarios: TereRuntimeScenarioResult[] = [];

  for (const rawScenario of scenariosRaw ?? []) {
    if (!rawScenario || typeof rawScenario !== "object" || Array.isArray(rawScenario)) {
      errors.push("Each scenario must be an object.");
      continue;
    }

    const scenario = rawScenario as Record<string, unknown>;
    if (!isScenarioKey(scenario.key)) {
      errors.push("Scenario key is invalid.");
      continue;
    }
    if (seen.has(scenario.key)) {
      errors.push(`Scenario ${scenario.key} is duplicated.`);
      continue;
    }
    seen.add(scenario.key);

    if (!isBoolean(scenario.passed)) {
      errors.push(`Scenario ${scenario.key} passed must be boolean.`);
      continue;
    }

    scenarios.push({
      key: scenario.key,
      passed: scenario.passed,
      notes: clean(scenario.notes) ?? undefined,
    });
  }

  for (const key of REQUIRED_KEYS) {
    if (!seen.has(key)) errors.push(`Scenario ${key} is missing.`);
  }

  const acceptanceInput: TereRuntimeAcceptanceInput | null =
    errors.length === 0
      ? {
          runtimeIdentified: runtimeIdentified as boolean,
          runtimeName: clean(runtime?.name),
          runtimeVersion: clean(runtime?.version),
          testedAt: clean(test?.tested_at),
          configAppliedAt,
          observedConfigHash: clean(runtime?.observed_config_hash),
          expectedConfigHash,
          isolatedTestContext: isolatedContext as boolean,
          realGuestContacted: realGuestContacted as boolean,
          sensitiveExternalSendOccurred:
            sensitiveExternalSendOccurred as boolean,
          unauthorizedActionOccurred: unauthorizedActionOccurred as boolean,
          channelContinuityVerified: channelContinuityVerified as boolean,
          scenarios,
        }
      : null;

  return {
    valid: errors.length === 0,
    errors,
    acceptanceInput,
  };
}
