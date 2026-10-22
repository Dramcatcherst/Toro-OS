export type OpenClawAuditProfileKey =
  | "openclaw_personal_owner"
  | "openclaw_company_shared"
  | "openclaw_guest_channel";

export type OpenClawAuditGateKey =
  | "runtime_identity"
  | "live_channel_probe"
  | "channel_capabilities"
  | "session_isolation"
  | "group_access"
  | "bindings_routing"
  | "least_privilege_tools"
  | "security_audit"
  | "logs_privacy"
  | "replay_idempotency"
  | "toro_identity_authority"
  | "human_escalation"
  | "health_recovery"
  | "backup_restore";

export type OpenClawAuditGateEvidence = {
  key: OpenClawAuditGateKey;
  passed: boolean;
  evidenceReference: string | null;
  findingIds?: string[];
  notes?: string;
};

export type OpenClawRuntimeEvidencePacket = {
  auditAt: string | null;
  profileKey: OpenClawAuditProfileKey;
  runtimeVersion: string | null;
  channelAliases: string[];
  rawSecretsIncluded: boolean;
  realGuestContactedForAudit: boolean;
  productionMutationOccurred: boolean;
  gates: OpenClawAuditGateEvidence[];
};

export type OpenClawRuntimeAuditCheck = {
  key: OpenClawAuditGateKey | "audit_timestamp" | "secret_hygiene" | "safe_audit_mode" | "packet_schema";
  passed: boolean;
  detail: string;
};

export type OpenClawRuntimeAuditResult = {
  packetComplete: boolean;
  checks: OpenClawRuntimeAuditCheck[];
  blockers: string[];
  state: "EVIDENCE_PACKET_COMPLETE_UNVERIFIED" | "CONFIGURED_UNVERIFIED";
  evidenceCoverage: number;
};

const REQUIRED_GATES: OpenClawAuditGateKey[] = [
  "runtime_identity",
  "live_channel_probe",
  "channel_capabilities",
  "session_isolation",
  "group_access",
  "bindings_routing",
  "least_privilege_tools",
  "security_audit",
  "logs_privacy",
  "replay_idempotency",
  "toro_identity_authority",
  "human_escalation",
  "health_recovery",
  "backup_restore",
];

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseTimestamp(value: string | null) {
  if (!value) return Number.NaN;
  return Date.parse(value);
}

// Bounded packet parsing only; these ceilings do not authenticate evidence or certify runtime health.
const MAX_ITEMS = 128;
const PROFILES = new Set<OpenClawAuditProfileKey>([
  "openclaw_personal_owner", "openclaw_company_shared", "openclaw_guest_channel",
]);
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function onlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).every((key) => keys.includes(key));
}
function boundedText(value: unknown, max: number) {
  return typeof value === "string" && value.length <= max && value.trim().length > 0;
}
function textArray(value: unknown, maxLength: number) {
  return Array.isArray(value) && value.length <= MAX_ITEMS &&
    Array.from(value).every((item) => boundedText(item, maxLength));
}
function validPacket(value: unknown): value is OpenClawRuntimeEvidencePacket {
  if (!record(value) || !onlyKeys(value, [
        "auditAt", "profileKey", "runtimeVersion", "channelAliases", "rawSecretsIncluded",
        "realGuestContactedForAudit", "productionMutationOccurred", "gates",
      ]) || !PROFILES.has(value.profileKey as OpenClawAuditProfileKey) ||
      !(value.auditAt === null || boundedText(value.auditAt, 128)) ||
      !(value.runtimeVersion === null || boundedText(value.runtimeVersion, 128)) ||
      !textArray(value.channelAliases, 128) ||
      typeof value.rawSecretsIncluded !== "boolean" ||
      typeof value.realGuestContactedForAudit !== "boolean" ||
      typeof value.productionMutationOccurred !== "boolean" ||
      !Array.isArray(value.gates) || value.gates.length > MAX_ITEMS) return false;
  return Array.from(value.gates).every((gate) =>
    record(gate) && onlyKeys(gate, ["key", "passed", "evidenceReference", "findingIds", "notes"]) &&
    REQUIRED_GATES.includes(gate.key as OpenClawAuditGateKey) &&
    typeof gate.passed === "boolean" &&
    (gate.evidenceReference === null || boundedText(gate.evidenceReference, 2048)) &&
    (gate.findingIds === undefined || textArray(gate.findingIds, 128)) &&
    (gate.notes === undefined || (typeof gate.notes === "string" && gate.notes.length <= 4096)),
  );
}

export function evaluateOpenClawRuntimeEvidence(
  packet: unknown,
): OpenClawRuntimeAuditResult {
  if (!validPacket(packet)) return {
    packetComplete: false,
    checks: [{ key: "packet_schema", passed: false, detail: "Audit packet fields must match the bounded evidence schema." }],
    blockers: ["packet_schema"],
    state: "CONFIGURED_UNVERIFIED",
    evidenceCoverage: 0,
  };
  const gateMap = new Map<OpenClawAuditGateKey, OpenClawAuditGateEvidence>();
  const duplicateGateKeys = new Set<OpenClawAuditGateKey>();

  for (const gate of packet.gates) {
    if (gateMap.has(gate.key)) duplicateGateKeys.add(gate.key);
    gateMap.set(gate.key, gate);
  }

  const auditTimestampValid = Number.isFinite(parseTimestamp(packet.auditAt));

  const checks: OpenClawRuntimeAuditCheck[] = [
    {
      key: "audit_timestamp",
      passed: auditTimestampValid,
      detail: "Audit timestamp is present and parseable.",
    },
    {
      key: "secret_hygiene",
      passed: packet.rawSecretsIncluded === false,
      detail: "No token, QR secret, auth file, password or raw credential is retained in the evidence packet.",
    },
    {
      key: "safe_audit_mode",
      passed:
        packet.realGuestContactedForAudit === false &&
        packet.productionMutationOccurred === false,
      detail: "Audit did not use a real guest merely for proof and did not mutate production configuration/actions.",
    },
  ];

  for (const key of REQUIRED_GATES) {
    const gate = gateMap.get(key);
    const unique = !duplicateGateKeys.has(key);
    const evidenced = hasText(gate?.evidenceReference);
    const runtimeIdentityExtra =
      key !== "runtime_identity" ||
      (hasText(packet.runtimeVersion) && packet.channelAliases.length > 0);

    checks.push({
      key,
      passed:
        gate?.passed === true &&
        evidenced &&
        unique &&
        runtimeIdentityExtra,
      detail:
        key === "runtime_identity"
          ? "OpenClaw runtime version and sanitized channel alias(es) are identified with evidence."
          : `${key} passed with a unique explicit evidence reference.`,
    });
  }

  const blockers = checks
    .filter((check) => !check.passed)
    .map((check) => check.key);

  const requiredEvidence = REQUIRED_GATES
    .map((key) => gateMap.get(key))
    .filter(Boolean) as OpenClawAuditGateEvidence[];

  const evidenceCoverage =
    REQUIRED_GATES.length === 0
      ? 0
      : requiredEvidence.filter((gate) => hasText(gate.evidenceReference)).length /
        REQUIRED_GATES.length;

  return {
    packetComplete: blockers.length === 0,
    checks,
    blockers,
    state: blockers.length === 0 ? "EVIDENCE_PACKET_COMPLETE_UNVERIFIED" : "CONFIGURED_UNVERIFIED",
    evidenceCoverage,
  };
}

export const openClawRequiredAuditGateKeys = [...REQUIRED_GATES];
