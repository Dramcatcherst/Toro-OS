import { isAlegraWriteBusinessKey, type AlegraWriteIntent } from "./alegra-writer-contract";

export type AlegraDuplicateCandidate = {
  source: "toro" | "alegra" | "receipt";
  sourceRef: string;
  confidence: "exact" | "probable";
  legalEntityKey?: string | null;
  targetType?: string | null;
  documentNumber?: string | null;
  supplierNativeId?: string | null;
  issuerTaxId?: string | null;
  currency?: string | null;
  total?: string | null;
  evidenceHash?: string | null;
  idempotencyKey?: string | null;
  paymentMovementRef?: string | null;
};

export type AlegraDuplicateSourceState = {
  source: "toro" | "alegra" | "receipt";
  coverage: "complete" | "partial" | "stale" | "unavailable";
  checkedAt?: string | null;
};

export type AlegraDuplicateDecision = {
  clear: boolean;
  state: "CLEAR" | "DUPLICATE_EXACT" | "DUPLICATE_CANDIDATE" | "COVERAGE_INSUFFICIENT";
  exactMatches: AlegraDuplicateCandidate[];
  probableMatches: AlegraDuplicateCandidate[];
  sourceStates: AlegraDuplicateSourceState[];
  reasons: string[];
};

function norm(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function eq(left?: string | null, right?: string | null): boolean {
  return Boolean(norm(left)) && norm(left) === norm(right);
}

function sameAmount(left?: string | null, right?: string | null): boolean {
  const decimal = (value?: string | null) => {
    const raw = norm(value);
    if (raw.length > 128 || !/^\d+(?:\.\d+)?$/.test(raw)) return null;
    const [whole, fraction = ""] = raw.split(".");
    return `${whole.replace(/^0+(?=\d)/, "")}.${fraction.replace(/0+$/, "")}`;
  };
  const value = decimal(left);
  return value !== null && value === decimal(right);
}

function timestamp(value?: string | null): number {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) return Number.NaN;
  // Date.parse rolls e.g. February 31 into March. Validate the local calendar
  // separately, before interpreting the explicitly supplied timezone offset.
  const day = value.slice(0, 10);
  const calendar = new Date(`${day}T00:00:00.000Z`);
  if (!Number.isFinite(calendar.valueOf()) || calendar.toISOString().slice(0, 10) !== day) return Number.NaN;
  return Date.parse(value);
}

function exactIdentityMatch(intent: AlegraWriteIntent, candidate: AlegraDuplicateCandidate): boolean {
  if (candidate.idempotencyKey && isAlegraWriteBusinessKey(intent, candidate.idempotencyKey)) return true;
  const sameEntity = !candidate.legalEntityKey || eq(candidate.legalEntityKey, intent.scope.legalEntityKey);
  const sameType = !candidate.targetType || eq(candidate.targetType, intent.targetType);
  if (!sameEntity || !sameType) return false;
  // An invoice can support multiple payments. Its bytes are not the movement's
  // identity, nor does an unscoped hash establish the owning accounting scope.
  if (intent.targetType === "purchase_bill" && candidate.legalEntityKey && candidate.targetType &&
      candidate.evidenceHash && eq(candidate.evidenceHash, intent.evidence.evidenceHash)) return true;

  const sameDocument = eq(candidate.documentNumber, intent.payload.documentNumber);
  const sameSupplier =
    eq(candidate.supplierNativeId, intent.payload.supplierNativeId) ||
    eq(candidate.issuerTaxId, intent.payload.issuerTaxId);
  const sameBusinessReference = intent.targetType === "outgoing_payment"
    ? eq(candidate.paymentMovementRef, intent.payload.paymentMovementRef)
    : sameDocument && sameSupplier;
  return sameEntity && sameType && sameBusinessReference;
}

function probableIdentityMatch(intent: AlegraWriteIntent, candidate: AlegraDuplicateCandidate): boolean {
  const sameEntity = !candidate.legalEntityKey || eq(candidate.legalEntityKey, intent.scope.legalEntityKey);
  const sameType = !candidate.targetType || eq(candidate.targetType, intent.targetType);
  const sameDocument = eq(candidate.documentNumber, intent.payload.documentNumber);
  const sameCurrency = eq(candidate.currency, intent.payload.currency);
  const sameTotal = sameAmount(candidate.total, intent.payload.total);
  const sameSupplier =
    eq(candidate.supplierNativeId, intent.payload.supplierNativeId) ||
    eq(candidate.issuerTaxId, intent.payload.issuerTaxId);

  const signals = [sameDocument, sameCurrency, sameTotal, sameSupplier].filter(Boolean).length;
  return sameEntity && sameType && signals >= 3;
}

export function evaluateAlegraDuplicatePreflight(input: {
  intent: AlegraWriteIntent;
  candidates: AlegraDuplicateCandidate[];
  sourceStates: AlegraDuplicateSourceState[];
  // The server host supplies the evaluation clock and an explicitly approved
  // freshness policy. There is no commercial TTL default. This prepared result
  // must be evaluated from current source reads before execution admission.
  now: string;
  maxAgeMs: number;
}): AlegraDuplicateDecision {
  const exactMatches: AlegraDuplicateCandidate[] = [];
  const probableMatches: AlegraDuplicateCandidate[] = [];

  for (const candidate of input.candidates) {
    if (exactIdentityMatch(input.intent, candidate)) {
      exactMatches.push(candidate);
      continue;
    }

    if (probableIdentityMatch(input.intent, candidate)) {
      probableMatches.push(candidate);
    }
  }

  const reasons: string[] = [];
  const requiredSources = new Set(["toro", "alegra", "receipt"]);
  const now = timestamp(input.now);
  const validWindow = Number.isFinite(now) && Number.isSafeInteger(input.maxAgeMs) && input.maxAgeMs > 0;
  const insufficientCoverage = [...requiredSources].some((source) => {
    const observations = input.sourceStates.filter(state => state.source === source);
    if (!validWindow || observations.length !== 1 || observations[0].coverage !== "complete") return true;
    const checkedAt = timestamp(observations[0].checkedAt);
    return !Number.isFinite(checkedAt) || checkedAt > now || now - checkedAt > input.maxAgeMs;
  });

  if (exactMatches.length > 0) {
    reasons.push("EXACT_DUPLICATE_FOUND");
    return {
      clear: false,
      state: "DUPLICATE_EXACT",
      exactMatches,
      probableMatches,
      sourceStates: input.sourceStates,
      reasons,
    };
  }

  if (probableMatches.length > 0) {
    reasons.push("PROBABLE_DUPLICATE_FOUND");
    return {
      clear: false,
      state: "DUPLICATE_CANDIDATE",
      exactMatches,
      probableMatches,
      sourceStates: input.sourceStates,
      reasons,
    };
  }

  if (insufficientCoverage) {
    reasons.push("DUPLICATE_SEARCH_COVERAGE_INSUFFICIENT");
    return {
      clear: false,
      state: "COVERAGE_INSUFFICIENT",
      exactMatches,
      probableMatches,
      sourceStates: input.sourceStates,
      reasons,
    };
  }

  return {
    clear: true,
    state: "CLEAR",
    exactMatches,
    probableMatches,
    sourceStates: input.sourceStates,
    reasons,
  };
}
