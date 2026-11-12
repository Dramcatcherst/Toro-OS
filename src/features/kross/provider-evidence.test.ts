import { describe, expect, it } from "vitest";

import {
  buildKrossTransportIntakeFromProviderEvidence,
  type KrossProviderEvidencePacket,
} from "./provider-evidence";

const ev = "email:KB-305650/26#provider-response";
const now = "2026-10-22T12:00:00Z";

function claim<T>(value: T, evidenceReference: string | null = ev) {
  return { value, evidenceReference };
}

function packet(): KrossProviderEvidencePacket {
  return {
    observedAt: "2026-09-24T12:00:00.000Z",
    providerName: claim("Kross Booking"),
    ticketReference: claim("KB-305650/26"),
    transportKind: claim("api"),
    readOnlyConfirmed: claim(true),
    authorizedByProvider: claim(true),
    billableActivationRequired: claim(false),
    setupFee: claim(null),
    recurringFee: claim(null),
    otherFees: claim(null),
    documentationReference: claim("docs:kross-api-v1"),
    credentialScopeSummary: claim("reservations:read"),
    reservationsSupported: claim(true),
    currentStaysSupported: claim(true),
    arrivalsDeparturesSupported: claim(true),
    liveRatesSupported: claim(false),
    liveAvailabilitySupported: claim(false),
    sourceTimestampAvailable: claim(true),
    externalReservationIdentityAvailable: claim(true),
    fieldMapReady: claim(true),
    approvedForFirstRead: claim(true),
  };
}

describe("buildKrossTransportIntakeFromProviderEvidence", () => {
  it.each(["invalid", "2026-02-30T00:00:00Z", "2026-10-22T24:00:00Z", "2026-10-22T12:01:00Z", "2026-10-22T12:00:00"])("blocks an invalid or future provider observation %s", observedAt => {
    const result = buildKrossTransportIntakeFromProviderEvidence({ ...packet(), observedAt }, now);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.evidenceIssues.map(issue => issue.key)).toContain("observed_at");
  });

  it.each([undefined, "invalid", "2026-02-30T12:00:00Z"])("requires an explicit valid evaluation clock %s", clock => {
    const result = buildKrossTransportIntakeFromProviderEvidence(packet(), clock as string);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.evidenceIssues.map(issue => issue.key)).toContain("evaluation_time");
  });

  it("retains a valid historical observation without inventing an authorization TTL", () => {
    const result = buildKrossTransportIntakeFromProviderEvidence(packet(), now);
    expect(result.readyForFirstAuthorizedRead).toBe(true);
    expect(result.observedAt).toBe(packet().observedAt);
  });

  it.each(["false", "true", 1, {}, undefined])("does not admit an unevidenced nonboolean authorization %j", value => {
    const input = { ...packet(), authorizedByProvider: claim(value, null) } as unknown as KrossProviderEvidencePacket;
    const result = buildKrossTransportIntakeFromProviderEvidence(input, now);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.intake.authorizedByProvider).toBe(false);
    expect(result.evidenceIssues.map(issue => issue.key)).toContain("provider_authorization");
  });

  it.each([null, {}, { ...packet(), readOnlyConfirmed: undefined }, { ...packet(), providerName: claim(123) }, { ...packet(), setupFee: claim({}) }])("returns blocked evidence for a malformed packet instead of throwing", input => {
    const result = buildKrossTransportIntakeFromProviderEvidence(input as unknown as KrossProviderEvidencePacket, now);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.evidenceIssues.length).toBeGreaterThan(0);
  });

  it.each([undefined, "unknown", 0])("preserves malformed billing as unknown %j", value => {
    const input = { ...packet(), billableActivationRequired: claim(value) } as unknown as KrossProviderEvidencePacket;
    const result = buildKrossTransportIntakeFromProviderEvidence(input, now);
    expect(result.intake.billableActivationRequired).toBeNull();
    expect(result.readyForFirstAuthorizedRead).toBe(false);
  });

  it.each(["ftp", undefined])("blocks an unsupported transport kind %s", value => {
    const input = { ...packet(), transportKind: claim(value) } as unknown as KrossProviderEvidencePacket;
    const result = buildKrossTransportIntakeFromProviderEvidence(input, now);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.evidenceIssues.map(issue => issue.key)).toContain("transport_kind");
  });

  it.each([60, 0.5])("preserves an evidenced scheduled-export cadence %s", frequency => {
    const input = { ...packet(), transportKind: claim("scheduled_export"), exportFrequencyMinutes: claim(frequency) } as KrossProviderEvidencePacket;
    const result = buildKrossTransportIntakeFromProviderEvidence(input, now);
    expect(result.intake.exportFrequencyMinutes).toBe(frequency);
    expect(result.readyForFirstAuthorizedRead).toBe(true);
  });

  it("does not require an irrelevant unknown export cadence for API evidence", () => {
    const result = buildKrossTransportIntakeFromProviderEvidence({ ...packet(), exportFrequencyMinutes: claim(null, null) }, now);
    expect(result.readyForFirstAuthorizedRead).toBe(true);
    expect(result.intake.exportFrequencyMinutes).toBeNull();
  });

  it.each([claim(60, null), claim(Infinity), claim("60"), claim(null, null), undefined])("blocks an unknown or malformed scheduled-export cadence", frequency => {
    const input = { ...packet(), transportKind: claim("scheduled_export"), exportFrequencyMinutes: frequency } as KrossProviderEvidencePacket;
    const result = buildKrossTransportIntakeFromProviderEvidence(input, now);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
  });

  it("produces a ready intake only when positive claims are explicitly evidenced", () => {
    const result = buildKrossTransportIntakeFromProviderEvidence(packet(), now);

    expect(result.evidenceIssues).toEqual([]);
    expect(result.intakeEvaluation.readyForFirstAuthorizedRead).toBe(true);
    expect(result.readyForFirstAuthorizedRead).toBe(true);
    expect(result.explicitEvidenceCoverage).toBe(1);
  });

  it("fails closed when a positive authorization claim lacks evidence", () => {
    const input = packet();
    input.authorizedByProvider = claim(true, null);

    const result = buildKrossTransportIntakeFromProviderEvidence(input, now);

    expect(result.intake.authorizedByProvider).toBe(false);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.evidenceIssues.map((issue) => issue.key)).toContain(
      "provider_authorization",
    );
  });

  it("does not convert unknown billing into no-cost approval", () => {
    const input = packet();
    input.billableActivationRequired = claim(null, null);

    const result = buildKrossTransportIntakeFromProviderEvidence(input, now);

    expect(result.intake.billableActivationRequired).toBeNull();
    expect(result.intakeEvaluation.readyForFirstAuthorizedRead).toBe(false);
    expect(result.intakeEvaluation.issues.map((issue) => issue.key)).toContain(
      "billing_unknown",
    );
  });

  it("keeps unsupported or unevidenced live availability false", () => {
    const input = packet();
    input.liveAvailabilitySupported = claim(true, null);

    const result = buildKrossTransportIntakeFromProviderEvidence(input, now);

    expect(result.intake.liveAvailabilitySupported).toBe(false);
    expect(result.evidenceIssues.map((issue) => issue.key)).toContain(
      "live_availability_supported",
    );
  });
});
