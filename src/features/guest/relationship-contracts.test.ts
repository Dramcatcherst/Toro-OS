import { describe, expect, it } from "vitest";
import type { ToroResolvedContext } from "@/features/context/types";
import {
  actionReplayKey, advanceExperienceStage, alertRoute, botMayResume, channelPointUsable, experienceActionGate,
  experienceReadiness, fresh, hospitalityQuoteGate, knowledgeConsumed, krossAgeBand,
  marketingCandidate, matchCandidate, prepareContext360, prepareMerge, prepareSplit,
  publicKnowledge, relationshipUsable, tagUsable, verifiedSale,
  type Consent, type Evidence, type ExperienceOperational, type ExperiencePublic,
  type Handoff, type IdentitySnapshot, type Party, type ScopedRelationship,
} from "./relationship-contracts";

const now = "2026-10-09T07:10:00Z";
const evidence: Evidence = {
  source: "synthetic", reference: "fixture-only", version: "test-v1", confidence: "high",
  observedAt: "2026-10-09T07:00:00Z", validUntil: "2026-10-09T08:00:00Z", status: "verified",
};
const kross = { ...evidence, source: "kross" };
const a: Party = { orgId: "synthetic-A", id: "person-A", type: "person", externalReferences: [] };
const b: Party = { ...a, id: "person-B" };
const request = {
  orgId: a.orgId, businessId: "business-A", recipientRef: a.id, channel: "whatsapp" as const,
  purpose: "marketing", classification: "guest" as const,
};
const consent: Consent = { ...request, id: "consent-A", evidenceRef: "grant-fixture", status: "granted", evidence };
const snapshot: IdentitySnapshot = {
  parties: [a, b], mappings: [{ orgId: a.orgId, id: "mapping-A", partyId: a.id, sourceRef: "external-A" }],
  suppressions: [{ ...request, id: "optout-A", evidenceRef: "revocation-fixture" }],
};
const review = { approved: true, from: a, into: b, evidence };

describe("CRM G2 local preparation only — synthetic cohort 20261009", () => {
  it("shared or recycled channel similarity does not identify a person or authorize merge", () => {
    const channel = { ...a, channel: "whatsapp" as const, subjectRef: "synthetic-shared", parties: [a, b], evidence };
    expect(channelPointUsable(channel, now)).toBe(true);
    expect(channelPointUsable({ ...channel, parties: [a, { ...b, orgId: "synthetic-B" }] }, now)).toBe(false);
    expect(matchCandidate(a, b)).toBe("review_only");
    expect(prepareMerge(snapshot, { ...review, approved: false }, now)).toBeNull();
    expect(prepareMerge(snapshot, { ...review, evidence: { ...evidence, status: "review" } }, now)).toBeNull();
  });
  it("stable references create review candidates, not a grant", () => {
    const refs = [{ system: "pms", entityType: "guest", externalId: "synthetic-1" }];
    expect(matchCandidate({ ...a, externalReferences: refs }, { ...b, externalReferences: refs })).toBe("stable_candidate");
  });
  it("agency is distinct from guest; group cannot be a party type; two tenants cannot merge", () => {
    expect(prepareMerge({ ...snapshot, parties: [a, { ...b, type: "organization" }] }, review, now)).toBeNull();
    expect(matchCandidate(a, { ...b, orgId: "synthetic-B" })).toBe("cross_tenant");
    expect(prepareMerge({ ...snapshot, mappings: [{ ...snapshot.mappings[0], orgId: "synthetic-B" }] }, review, now)).toBeNull();
    expect(prepareMerge({ ...snapshot, parties: [{ ...a, type: "group" as Party["type"] }, { ...b, type: "group" as Party["type"] }] }, review, now)).toBeNull();
  });
  it("employee also customer preserves independent relationships and scoped links", () => {
    const relation: ScopedRelationship = {
      orgId: a.orgId, id: "rel-A", party: a, kind: "employee",
      related: { type: "organization", ref: { orgId: a.orgId, id: "business-A" } },
      effectiveFrom: evidence.observedAt, effectiveTo: evidence.validUntil, evidence,
    };
    expect(relationshipUsable(relation, now)).toBe(true);
    expect(relationshipUsable({ ...relation, kind: "customer" }, now)).toBe(true);
    expect(relationshipUsable({ ...relation, related: { ...relation.related, ref: { ...b, orgId: "synthetic-B" } } }, now)).toBe(false);
  });
  it("merge/split is reversible, preserves sources and carries opt-out to the target", () => {
    const proposal = prepareMerge(snapshot, review, now)!;
    expect(snapshot.mappings[0].partyId).toBe(a.id);
    expect(proposal.after.mappings[0].partyId).toBe(b.id);
    expect(proposal.after.parties).toEqual(snapshot.parties);
    expect(marketingCandidate({ ...request, recipientRef: b.id }, [{ ...consent, recipientRef: b.id }], proposal.after.suppressions, now).eligible).toBe(false);
    expect(prepareSplit(proposal, proposal.after)).toEqual(snapshot);
    expect(prepareSplit(proposal, { ...proposal.after, suppressions: [...proposal.after.suppressions, { ...snapshot.suppressions[0], id: "new-optout" }] })).toBeNull();
    expect(Object.keys(proposal.after)).not.toContain("permissions");
  });
  it("opt-out persists across reimported grant and revoked consent", () => {
    expect(marketingCandidate(request, [consent], snapshot.suppressions, now).eligible).toBe(false);
    expect(marketingCandidate(request, [consent, { ...consent, status: "revoked" }], [], now).eligible).toBe(false);
    expect(marketingCandidate(request, [], [], now).eligible).toBe(false);
    expect(marketingCandidate(request, [consent], [], now)).toEqual({ eligible: true, suppressed: false, sendAuthorized: false });
  });
  it.each(["businessId", "recipientRef", "purpose", "orgId"] as const)("consent cannot cross %s", (key) => {
    expect(marketingCandidate({ ...request, [key]: "other" }, [consent], [], now).eligible).toBe(false);
  });
  it.each(["supplier", "employment", "volunteer", "system", "agency"] as const)("LEADS does not permit %s marketing", (classification) => {
    expect(marketingCandidate({ ...request, classification }, [consent], [], now).eligible).toBe(false);
  });
  it("expired tags and future/conflicting facts fail closed", () => {
    expect(tagUsable({ ...a, key: "declared_interest", owner: "synthetic-owner", version: "v1", inferred: true, capturedAt: evidence.observedAt, expiresAt: now, review: "approved", evidence }, now)).toBe(false);
    expect(fresh({ ...evidence, observedAt: evidence.validUntil }, now)).toBe(false);
    expect(fresh({ ...evidence, status: "conflict" }, now)).toBe(false);
    expect(fresh({ ...evidence, reference: "" }, now)).toBe(false);
  });
  it("a mentioned payment or won tag is not a verified new reservation event", () => {
    const sale = { opportunity: a, reservation: b, source: "kross", live: true, eventId: "event-A", evidence: kross };
    expect(verifiedSale({ ...sale, reservation: null }, now)).toBe(false);
    expect(verifiedSale({ ...sale, live: false }, now)).toBe(false);
    expect(verifiedSale({ ...sale, reservation: { ...b, orgId: "synthetic-B" } }, now)).toBe(false);
    expect(verifiedSale(sale, now)).toBe(true);
  });
  it("two hours does not release a human case; explicit accepted closure and return does", () => {
    const handoff: Handoff = { ...a, reason: "service", owner: "synthetic-owner", nextActionRef: "task-A", acceptedAt: "2026-10-09T01:00:00Z", closedAt: null, returnedToBotAt: null, returnEvidenceRef: null };
    expect(botMayResume(handoff, now)).toBe(false);
    expect(botMayResume({ ...handoff, closedAt: "2026-10-09T06:00:00Z", returnedToBotAt: "2026-10-09T06:01:00Z", returnEvidenceRef: "return-A" }, now)).toBe(true);
  });
  it("obsolete/internal content never appears in ES or EN output", () => {
    const fact = { ...a, kind: "fact" as const, visibility: "public" as const, content: { es: "Dato sintético", en: "Synthetic fact" }, evidence };
    expect(publicKnowledge(fact, "es", now)).toBe("Dato sintético");
    expect(publicKnowledge(fact, "en", now)).toBe("Synthetic fact");
    expect(publicKnowledge({ ...fact, evidence: { ...evidence, validUntil: now } }, "es", now)).toBeNull();
    expect(publicKnowledge({ ...fact, visibility: "internal" }, "en", now)).toBeNull();
  });
  it("saved layers do not prove consumed knowledge hash", () => {
    const manifest = { expectedHash: "synthetic-hash", consumedHash: null, runtimeVersion: "test-runtime", layers: (["central", "tags", "funnels", "extra", "native"] as const).map((name) => ({ name, evidence })) };
    expect(knowledgeConsumed(manifest, now)).toBe(false);
    expect(knowledgeConsumed({ ...manifest, consumedHash: manifest.expectedHash }, now)).toBe(true);
    expect(knowledgeConsumed({ ...manifest, consumedHash: manifest.expectedHash, layers: [...manifest.layers.slice(1), manifest.layers[1]] }, now)).toBe(false);
  });

  const experience: ExperiencePublic = { ...a, evidence, durationMinutes: 60, schedule: "synthetic schedule", languages: ["es", "en"], location: "synthetic", inclusions: [], exclusions: [], price: { amount: 10, currency: "USD", taxes: "included" }, cancellation: "synthetic", conditions: "synthetic" };
  const internal: ExperienceOperational = { experience: a, responsibleRef: b, evidence, capacity: 1, availabilityEvidence: evidence };
  it("experience without cupo may recommend verified facts but never confirm a booking", () => {
    expect(experienceReadiness(experience, { ...internal, capacity: 0 }, now)).toEqual({ recommendable: true, availabilityVerified: false, bookingAuthorized: false });
    expect(experienceReadiness({ ...experience, price: null }, internal, now).recommendable).toBe(false);
    expect(experienceReadiness(experience, { ...internal, responsibleRef: { ...b, orgId: "synthetic-B" } }, now).recommendable).toBe(false);
    expect(experienceActionGate("reserve", false)).toBe("L3");
    expect(experienceActionGate("refer", true)).toBe("L3");
    expect(experienceActionGate("recommend", false)).toBe("L1");
  });
  it("interest/request/acceptance/reservation/performed remain distinct evidenced stages", () => {
    expect(advanceExperienceStage("interest", "reserved", evidence, now)).toBe(false);
    expect(advanceExperienceStage("requested", "accepted", evidence, now)).toBe(true);
    expect(advanceExperienceStage("reserved", "performed", { ...evidence, status: "review" }, now)).toBe(false);
  });
  const quote = { nights: 1, purpose: "villa" as const, ages: [11, 12], childrenPresent: true, krossEvidence: kross, ticosRequested: false, residenceEvidence: null, online: true };
  it.each([8, 9, 30, 31])("night boundary %s is inclusive through 30", (nights) => {
    expect(hospitalityQuoteGate({ ...quote, nights }, now).canPrepare).toBe(nights <= 30);
  });
  it("villa is not event; TICOS needs residency/online/unit eligibility; age capture required", () => {
    expect(hospitalityQuoteGate(quote, now).canPrepare).toBe(true);
    expect(hospitalityQuoteGate({ ...quote, purpose: "event" }, now).reasons).toContain("event_handoff");
    expect(hospitalityQuoteGate({ ...quote, purpose: "room", ticosRequested: true }, now).reasons).toContain("ticos_eligibility");
    const residentQuote = { ...quote, purpose: "room" as const, ticosRequested: true,
      residenceEvidence: { ...evidence, country: "CR" as const, basis: "recipient_declaration" as const } };
    expect(hospitalityQuoteGate(residentQuote, now).canPrepare).toBe(true);
    expect(hospitalityQuoteGate({ ...residentQuote, online: false }, now).canPrepare).toBe(false);
    expect(hospitalityQuoteGate({ ...residentQuote, purpose: "villa" }, now).canPrepare).toBe(false);
    expect(hospitalityQuoteGate({ ...quote, ages: null }, now).reasons).toContain("age_confirmation");
    expect(krossAgeBand(11)).toBe("adult");
    expect(krossAgeBand(12)).toBe("adult");
  });
  it("360 uses existing resolved Context and excludes other tenants/unauthorized roles", () => {
    const context: ToroResolvedContext = {
      userId: "synthetic-user", email: null, displayName: "synthetic", mode: "organization", orgId: a.orgId,
      membership: { orgId: a.orgId, membershipId: "membership-A", membershipType: "owner", status: "active", roles: ["ADMIN"], employeeId: null, source: "organization_memberships" },
      availableOrgIds: [a.orgId], allowedDataScopes: ["work_org"], allowedTools: [], canUsePersonalVault: false, canUseOrganizationData: true, requiresContextChoice: false,
    };
    const refs = [{ ...a, kind: "reservation" as const, evidence }, { ...b, orgId: "synthetic-B", kind: "case" as const, evidence }];
    expect(prepareContext360(context, refs)).toHaveLength(1);
    expect(prepareContext360({ ...context, canUseOrganizationData: false }, refs)).toEqual([]);
    expect(prepareContext360({ ...context, membership: { ...context.membership!, roles: ["EMPLEADO"] } }, refs)).toEqual([]);
  });
  it("replay preparation is tenant/action scoped and only the authorized WeSpeak lot changes route", () => {
    expect(actionReplayKey(a.orgId, "event-A", "followup")).toBe(actionReplayKey(a.orgId, "event-A", "followup"));
    expect(actionReplayKey(a.orgId, "event-A", "followup")).not.toBe(actionReplayKey("synthetic-B", "event-A", "followup"));
    expect(actionReplayKey("a:b", "c", "d")).not.toBe(actionReplayKey("a", "b:c", "d"));
    expect(alertRoute("wespeak_authorized_operational_batch", "owner")).toBe("reception_only");
    expect(alertRoute("financial", "owner")).toBe("owner");
    expect(alertRoute("personal_urgent", "private")).toBe("private");
  });
});
