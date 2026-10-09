import type { AlegraWriteIntent } from "./alegra-writer-contract";

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

function exactIdentityMatch(intent: AlegraWriteIntent, candidate: AlegraDuplicateCandidate): boolean {
  if (candidate.idempotencyKey && candidate.idempotencyKey === intent.idempotencyKey) return true;
  if (candidate.evidenceHash && eq(candidate.evidenceHash, intent.evidence.evidenceHash)) return true;

  const sameEntity = !candidate.legalEntityKey || eq(candidate.legalEntityKey, intent.scope.legalEntityKey);
  const sameType = !candidate.targetType || eq(candidate.targetType, intent.targetType);
  const sameDocument = eq(candidate.documentNumber, intent.payload.documentNumber);
  const sameSupplier =
    eq(candidate.supplierNativeId, intent.payload.supplierNativeId) ||
    eq(candidate.issuerTaxId, intent.payload.issuerTaxId);
  const sameCurrency = eq(candidate.currency, intent.payload.currency);
  const sameTotal = eq(candidate.total, intent.payload.total);

  return sameEntity && sameType && sameDocument && sameSupplier && sameCurrency && sameTotal;
}

function probableIdentityMatch(intent: AlegraWriteIntent, candidate: AlegraDuplicateCandidate): boolean {
  const sameEntity = !candidate.legalEntityKey || eq(candidate.legalEntityKey, intent.scope.legalEntityKey);
  const sameType = !candidate.targetType || eq(candidate.targetType, intent.targetType);
  const sameDocument = eq(candidate.documentNumber, intent.payload.documentNumber);
  const sameCurrency = eq(candidate.currency, intent.payload.currency);
  const sameTotal = eq(candidate.total, intent.payload.total);
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
  const states = new Map(input.sourceStates.map((state) => [state.source, state.coverage]));

  const insufficientCoverage = [...requiredSources].some((source) => {
    const coverage = states.get(source as AlegraDuplicateSourceState["source"]);
    return !coverage || coverage === "partial" || coverage === "stale" || coverage === "unavailable";
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
