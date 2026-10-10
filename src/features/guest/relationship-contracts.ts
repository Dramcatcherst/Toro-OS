/**
 * CRM-TERE-EXPERIENCIAS-20261008-V1 / G2: pure preparation contracts.
 * No persistence, identity grants, sending, scheduling or transactional authority.
 * Adapters must use TORO Context / Control Plane; never trust caller assertions as auth.
 */
import type { ToroResolvedContext } from "@/features/context/types";
import { resolveToroExecutionAuthorityLevel } from "@/lib/control-plane-contracts";

export type ScopedRef = { orgId: string; id: string };
export type Evidence = {
  source: string;
  reference: string;
  observedAt: string;
  validUntil: string;
  version: string;
  confidence: "high" | "medium" | "low";
  status: "verified" | "review" | "conflict";
};
export type Party = ScopedRef & {
  type: "person" | "organization";
  externalReferences: Array<{ system: string; entityType: string; externalId: string }>;
};
export type ChannelPoint = ScopedRef & {
  channel: "whatsapp" | "email";
  subjectRef: string; // opaque reference, never raw phone or email
  parties: ScopedRef[];
  evidence: Evidence;
};
export type ScopedRelationship = ScopedRef & {
  party: ScopedRef;
  kind: "guest" | "supplier" | "agency" | "representative" | "employee" | "customer";
  related: { type: "organization" | "reservation" | "stay" | "case"; ref: ScopedRef };
  effectiveFrom: string;
  effectiveTo: string;
  evidence: Evidence;
};
export const CONTENT_PRECEDENCE = [
  "permissions_suppression", "authority_freshness", "process_handoff", "classification", "style",
] as const;

export function sameTenant(orgId: string, ...refs: ScopedRef[]): boolean {
  return Boolean(orgId.trim()) && refs.every((ref) => ref.orgId === orgId && Boolean(ref.id.trim()));
}
export function fresh(evidence: Evidence, now: string): boolean {
  const time = Date.parse(now);
  const observed = Date.parse(evidence.observedAt);
  const until = Date.parse(evidence.validUntil);
  return [time, observed, until].every(Number.isFinite) &&
    evidence.status === "verified" && observed <= time && time < until &&
    Boolean(evidence.source.trim() && evidence.reference.trim() && evidence.version.trim());
}
export function relationshipUsable(value: ScopedRelationship, now: string): boolean {
  return sameTenant(value.orgId, value, value.party, value.related.ref) &&
    fresh(value.evidence, now) && Date.parse(value.effectiveFrom) <= Date.parse(now) &&
    Date.parse(now) < Date.parse(value.effectiveTo);
}
export function channelPointUsable(value: ChannelPoint, now: string): boolean {
  return sameTenant(value.orgId, value, ...value.parties) &&
    Boolean(value.subjectRef.trim()) && value.parties.length > 0 && fresh(value.evidence, now);
}
export function matchCandidate(a: Party, b: Party): "cross_tenant" | "stable_candidate" | "review_only" {
  if (!sameTenant(a.orgId, a, b)) return "cross_tenant";
  const stable = a.externalReferences.some((x) =>
    Boolean(x.system && x.entityType && x.externalId) && b.externalReferences.some((y) =>
      x.system === y.system && x.entityType === y.entityType && x.externalId === y.externalId));
  return stable ? "stable_candidate" : "review_only"; // even stable matches require explicit review
}

export type Suppression = ScopedRef & {
  businessId: string;
  recipientRef: string;
  channel: "whatsapp" | "email";
  purpose: string;
  evidenceRef: string;
};
export type IdentitySnapshot = {
  parties: Party[];
  mappings: Array<ScopedRef & { partyId: string; sourceRef: string }>;
  suppressions: Suppression[];
};
export type MergeReview = {
  approved: boolean;
  evidence: Evidence;
  from: ScopedRef;
  into: ScopedRef;
};
export type MergeProposal = {
  before: IdentitySnapshot;
  after: IdentitySnapshot;
  review: MergeReview;
  state: "prepared_only";
};
/** A reversible mapping proposal, never a mutation or permission merge. */
export function prepareMerge(snapshot: IdentitySnapshot, review: MergeReview, now: string): MergeProposal | null {
  if (!review.approved || !fresh(review.evidence, now) ||
    !sameTenant(review.from.orgId, review.from, review.into, ...snapshot.parties,
      ...snapshot.mappings, ...snapshot.suppressions) || review.from.id === review.into.id) return null;
  const from = snapshot.parties.find((p) => p.id === review.from.id);
  const into = snapshot.parties.find((p) => p.id === review.into.id);
  if (!from || !into || !["person", "organization"].includes(from.type) || from.type !== into.type) return null;
  const before = structuredClone(snapshot);
  const after = structuredClone(snapshot);
  // Keep both source parties, provenance and all suppression records intact.
  after.mappings = after.mappings.map((m) => m.partyId === from.id ? { ...m, partyId: into.id } : m);
  after.suppressions.push(...before.suppressions
    .filter((s) => s.recipientRef === from.id)
    .map((s) => ({ ...s, id: JSON.stringify([s.id, into.id]), recipientRef: into.id })));
  return { before, after, review: structuredClone(review), state: "prepared_only" };
}
export function prepareSplit(proposal: MergeProposal, current: IdentitySnapshot): IdentitySnapshot | null {
  // Do not overwrite concurrent edits or newly captured revocations.
  if (JSON.stringify(current) !== JSON.stringify(proposal.after)) return null;
  return structuredClone(proposal.before);
}

export type Consent = Suppression & { status: "granted" | "revoked"; evidence: Evidence };
export type MarketingRequest = {
  orgId: string;
  businessId: string;
  recipientRef: string;
  channel: "whatsapp" | "email";
  purpose: string;
  classification: "guest" | "agency" | "supplier" | "employment" | "volunteer" | "system";
};
function scopeMatches(a: Suppression, b: MarketingRequest): boolean {
  return a.orgId === b.orgId && a.businessId === b.businessId && a.recipientRef === b.recipientRef &&
    a.channel === b.channel && a.purpose === b.purpose;
}
export function marketingCandidate(request: MarketingRequest, consents: Consent[], suppressions: Suppression[], now: string) {
  const suppressed = suppressions.some((s) => scopeMatches(s, request)) ||
    consents.some((c) => scopeMatches(c, request) && c.status === "revoked");
  const eligible = [request.orgId, request.businessId, request.recipientRef, request.purpose].every((s) => s.trim()) &&
    !suppressed && request.classification === "guest" &&
    consents.some((c) => scopeMatches(c, request) && c.status === "granted" && fresh(c.evidence, now));
  return { eligible, suppressed, sendAuthorized: false as const };
}
export type ControlledTag = ScopedRef & {
  key: "declared_interest" | "requested_language" | "handoff" | "process";
  owner: string;
  version: string;
  inferred: boolean;
  capturedAt: string;
  expiresAt: string;
  review: "approved" | "candidate";
  evidence: Evidence;
};
export function tagUsable(tag: ControlledTag, now: string): boolean {
  return ["declared_interest", "requested_language", "handoff", "process"].includes(tag.key) &&
    Boolean(tag.owner.trim() && tag.version.trim()) && tag.review === "approved" &&
    Date.parse(tag.capturedAt) <= Date.parse(now) && Date.parse(now) < Date.parse(tag.expiresAt) &&
    fresh(tag.evidence, now);
}
export function verifiedSale(input: {
  opportunity: ScopedRef; reservation: ScopedRef | null; source: string;
  live: boolean; evidence: Evidence | null; eventId: string | null;
}, now: string): boolean {
  return input.reservation !== null && sameTenant(input.opportunity.orgId, input.opportunity, input.reservation) &&
    input.source === "kross" && input.live && Boolean(input.eventId?.trim()) &&
    input.evidence !== null && input.evidence.source === "kross" && fresh(input.evidence, now);
}

export type Handoff = ScopedRef & {
  reason: string;
  owner: string;
  acceptedAt: string | null;
  nextActionRef: string;
  returnedToBotAt: string | null;
  returnEvidenceRef: string | null;
  closedAt: string | null;
};
export function botMayResume(handoff: Handoff, now: string): boolean {
  const time = Date.parse(now);
  const accepted = handoff.acceptedAt ? Date.parse(handoff.acceptedAt) : NaN;
  const closed = handoff.closedAt ? Date.parse(handoff.closedAt) : NaN;
  const returned = handoff.returnedToBotAt ? Date.parse(handoff.returnedToBotAt) : NaN;
  return Boolean(handoff.reason && handoff.owner && handoff.nextActionRef && handoff.returnEvidenceRef) &&
    [time, accepted, closed, returned].every(Number.isFinite) &&
    accepted <= closed && closed <= returned && returned <= time;
}

export type KnowledgeFact = ScopedRef & {
  kind: "fact" | "policy" | "style";
  content: { es: string; en: string };
  visibility: "public" | "internal";
  evidence: Evidence;
};
export function publicKnowledge(value: KnowledgeFact, language: "es" | "en", now: string): string | null {
  return value.visibility === "public" && fresh(value.evidence, now) && value.content[language].trim()
    ? value.content[language] : null;
}
export type KnowledgeManifest = {
  expectedHash: string;
  consumedHash: string | null;
  runtimeVersion: string | null;
  layers: Array<{ name: "central" | "tags" | "funnels" | "extra" | "native"; evidence: Evidence }>;
};
export function knowledgeConsumed(manifest: KnowledgeManifest, now: string): boolean {
  const expected = ["central", "tags", "funnels", "extra", "native"];
  return Boolean(manifest.expectedHash.trim() && manifest.runtimeVersion?.trim()) &&
    manifest.expectedHash === manifest.consumedHash && manifest.layers.length === expected.length &&
    new Set(manifest.layers.map((l) => l.name)).size === expected.length &&
    expected.every((name) => manifest.layers.some((l) => l.name === name && fresh(l.evidence, now)));
}

export type ExperiencePublic = ScopedRef & {
  evidence: Evidence;
  durationMinutes: number | null;
  schedule: string | null;
  languages: string[];
  location: string | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  price: { amount: number; currency: string; taxes: string } | null;
  cancellation: string | null;
  conditions: string | null;
};
export type ExperienceOperational = {
  experience: ScopedRef;
  responsibleRef: ScopedRef | null;
  evidence: Evidence;
  capacity: number | null;
  availabilityEvidence: Evidence | null;
};
export type ExperienceStage = "interest" | "requested" | "accepted" | "reserved" | "performed";
export function experienceReadiness(value: ExperiencePublic, internal: ExperienceOperational, now: string) {
  const complete = value.durationMinutes !== null && Number.isFinite(value.durationMinutes) && value.durationMinutes > 0 &&
    Boolean(value.schedule?.trim() && value.location?.trim() && value.cancellation?.trim() && value.conditions?.trim()) &&
    value.languages.length > 0 && value.inclusions !== null && value.exclusions !== null &&
    value.price !== null && Number.isFinite(value.price.amount) && value.price.amount >= 0 &&
    Boolean(value.price.currency.trim() && value.price.taxes.trim());
  const scoped = internal.responsibleRef !== null &&
    sameTenant(value.orgId, value, internal.experience, internal.responsibleRef) &&
    internal.experience.id === value.id;
  const recommendable = complete && scoped && fresh(value.evidence, now) && fresh(internal.evidence, now);
  const availabilityVerified = recommendable && internal.capacity !== null &&
    Number.isInteger(internal.capacity) && internal.capacity > 0 &&
    internal.availabilityEvidence !== null && fresh(internal.availabilityEvidence, now);
  return { recommendable, availabilityVerified, bookingAuthorized: false as const };
}
export function experienceActionGate(action: "recommend" | "refer" | "request" | "reserve" | "charge" | "cancel", sharesData: boolean) {
  return resolveToroExecutionAuthorityLevel({
    actionLevel: action === "recommend" || (action === "refer" && !sharesData) ? "analyze" : "execute_with_approval",
    risk: "Low", externalImpact: sharesData || ["request", "reserve", "charge", "cancel"].includes(action),
  });
}
export function advanceExperienceStage(current: ExperienceStage, next: ExperienceStage, evidence: Evidence, now: string): boolean {
  const stages: ExperienceStage[] = ["interest", "requested", "accepted", "reserved", "performed"];
  return stages.indexOf(next) === stages.indexOf(current) + 1 && fresh(evidence, now);
}

/** Validate already-normalized hospitality facts; no pricing, booking or age tags. */
export function hospitalityQuoteGate(input: {
  nights: number; purpose: "villa" | "event" | "room";
  ages: number[] | null; childrenPresent: boolean; krossEvidence: Evidence | null;
  ticosRequested: boolean;
  residenceEvidence: (Evidence & { country: "CR"; basis: "recipient_declaration" | "verified_document" }) | null;
  online: boolean;
}, now: string) {
  const reasons: string[] = [];
  if (!Number.isInteger(input.nights) || input.nights < 1 || input.nights > 30) reasons.push("night_limit");
  if (input.purpose === "event") reasons.push("event_handoff");
  if (!input.krossEvidence || input.krossEvidence.source !== "kross" || !fresh(input.krossEvidence, now)) reasons.push("kross_authority");
  if ((input.childrenPresent && (!input.ages || !input.ages.length)) ||
    input.ages?.some((age) => !Number.isInteger(age) || age < 0)) reasons.push("age_confirmation");
  if (input.ticosRequested && (!input.online || input.purpose === "villa" ||
    !input.residenceEvidence || input.residenceEvidence.country !== "CR" ||
    !["recipient_declaration", "verified_document"].includes(input.residenceEvidence.basis) ||
    !fresh(input.residenceEvidence, now))) reasons.push("ticos_eligibility");
  // Eligibility here is only preparation. Full promotion/rate/date terms require current Kross.
  return { canPrepare: reasons.length === 0, reasons, quoteConfirmed: false as const };
}
export function krossAgeBand(age: number): "baby" | "child" | "adult" | null {
  if (!Number.isInteger(age) || age < 0) return null;
  return age <= 3 ? "baby" : age <= 10 ? "child" : "adult";
}

export type ContextReference = ScopedRef & { kind: "reservation" | "stay" | "case" | "organization"; evidence: Evidence };
/** Authenticated context must be resolved server-side by existing TORO Identity, not by tags. */
export function prepareContext360(context: ToroResolvedContext, references: ContextReference[]) {
  if (!context.canUseOrganizationData || context.mode !== "organization" ||
    !context.orgId || context.membership?.status !== "active" || context.membership.orgId !== context.orgId ||
    !context.allowedDataScopes.includes("work_org") ||
    !context.membership.roles.some((r) => r === "ADMIN" || r === "GERENCIA")) return [];
  // Minimal references only; no content, contacts, costs or inferred permissions.
  return references.filter((ref) => sameTenant(context.orgId!, ref)).map((ref) => ({
    orgId: ref.orgId, id: ref.id, kind: ref.kind, source: ref.evidence.source,
    observedAt: ref.evidence.observedAt, version: ref.evidence.version, verification: ref.evidence.status,
  }));
}
export function actionReplayKey(orgId: string, eventId: string, action: string): string {
  // Preparation key for existing tasks/Control Plane, not a new queue or executor.
  if (![orgId, eventId, action].every((x) => x.trim().length > 0)) throw new Error("Scoped action identity required");
  return JSON.stringify([orgId, eventId, action]);
}
export function alertRoute(flow: string, authorizedRoute: string): string {
  return flow === "wespeak_authorized_operational_batch" ? "reception_only" : authorizedRoute;
}
