export type KrossImportRunDraftInput = {
  sourceAsOf: string;
  rowCount: number;
  checksum: string;
  sourceReference: string;
  freshnessSlaHours: number;
};

export type KrossImportRunDraft = {
  sourceSystem: "Kross Booking";
  importKind: "operational_read_only_mirror";
  sourceAsOf: string;
  sourceReference: string;
  rowCount: number;
  checksum: string;
  freshnessSlaHours: number;
  status: "staged";
  validationSummary: {
    transactionalAuthority: "Kross";
    readOnlyMirror: true;
    sourceIsLive: true;
  };
  errorCount: 0;
};

export type KrossImportReadinessInput = {
  sourceAsOf: string;
  sourceIsLive: boolean;
  sourceRowCount: number;
  mirrorRowCount: number;
  sourceChecksum: string;
  mirrorChecksum: string;
  importedAt: string;
  now: string;
  freshnessSlaHours: number;
};

export type KrossImportReadiness = {
  ready: boolean;
  status:
    | "reconciled"
    | "reconciliation_failed"
    | "not_live"
    | "stale"
    | "invalid_time";
  reasons: string[];
  canUpdateCurrentState: boolean;
};

const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

function parseFiniteDate(value: string, label: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid Kross ${label} timestamp.`);
  }
  return parsed;
}

function assertNonNegativeInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid Kross ${label} row count.`);
  }
}

function assertChecksum(value: string, label: string) {
  if (!SHA256_PATTERN.test(value)) {
    throw new Error(`Invalid Kross ${label} checksum; expected SHA-256 hex.`);
  }
}

function assertFreshnessSla(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid Kross freshness SLA.");
  }
}

export function buildKrossImportRunDraft(
  input: KrossImportRunDraftInput,
): KrossImportRunDraft {
  parseFiniteDate(input.sourceAsOf, "source");
  assertNonNegativeInteger(input.rowCount, "source");
  assertChecksum(input.checksum, "source");
  assertFreshnessSla(input.freshnessSlaHours);

  const sourceReference = input.sourceReference.trim();
  if (!sourceReference) {
    throw new Error("Invalid Kross source reference.");
  }

  return {
    sourceSystem: "Kross Booking",
    importKind: "operational_read_only_mirror",
    sourceAsOf: input.sourceAsOf,
    sourceReference,
    rowCount: input.rowCount,
    checksum: input.checksum.toLowerCase(),
    freshnessSlaHours: input.freshnessSlaHours,
    status: "staged",
    validationSummary: {
      transactionalAuthority: "Kross",
      readOnlyMirror: true,
      sourceIsLive: true,
    },
    errorCount: 0,
  };
}

export function assessKrossImportReadiness(
  input: KrossImportReadinessInput,
): KrossImportReadiness {
  const sourceMs = parseFiniteDate(input.sourceAsOf, "source");
  const importedMs = parseFiniteDate(input.importedAt, "import");
  const nowMs = parseFiniteDate(input.now, "current");

  assertNonNegativeInteger(input.sourceRowCount, "source");
  assertNonNegativeInteger(input.mirrorRowCount, "mirror");
  assertChecksum(input.sourceChecksum, "source");
  assertChecksum(input.mirrorChecksum, "mirror");
  assertFreshnessSla(input.freshnessSlaHours);

  if (sourceMs > nowMs || importedMs > nowMs || importedMs < sourceMs) {
    return {
      ready: false,
      status: "invalid_time",
      reasons: ["invalid_time_order"],
      canUpdateCurrentState: false,
    };
  }

  if (!input.sourceIsLive) {
    return {
      ready: false,
      status: "not_live",
      reasons: ["source_is_not_live"],
      canUpdateCurrentState: false,
    };
  }

  const ageHours = (nowMs - sourceMs) / (60 * 60 * 1000);
  if (ageHours > input.freshnessSlaHours) {
    return {
      ready: false,
      status: "stale",
      reasons: ["source_exceeds_freshness_sla"],
      canUpdateCurrentState: false,
    };
  }

  const reconciliationReasons: string[] = [];
  if (input.sourceRowCount !== input.mirrorRowCount) {
    reconciliationReasons.push("row_count_mismatch");
  }
  if (
    input.sourceChecksum.toLowerCase() !== input.mirrorChecksum.toLowerCase()
  ) {
    reconciliationReasons.push("checksum_mismatch");
  }

  if (reconciliationReasons.length > 0) {
    return {
      ready: false,
      status: "reconciliation_failed",
      reasons: reconciliationReasons,
      canUpdateCurrentState: false,
    };
  }

  return {
    ready: true,
    status: "reconciled",
    reasons: [],
    canUpdateCurrentState: true,
  };
}
