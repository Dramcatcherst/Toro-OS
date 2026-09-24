import { describe, expect, it } from "vitest";

import {
  buildKrossTransportIntakeFromProviderEvidence,
  type KrossProviderEvidencePacket,
} from "./provider-evidence";

const ev = "email:KB-305650/26#provider-response";

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
  it("produces a ready intake only when positive claims are explicitly evidenced", () => {
    const result = buildKrossTransportIntakeFromProviderEvidence(packet());

    expect(result.evidenceIssues).toEqual([]);
    expect(result.intakeEvaluation.readyForFirstAuthorizedRead).toBe(true);
    expect(result.readyForFirstAuthorizedRead).toBe(true);
    expect(result.explicitEvidenceCoverage).toBe(1);
  });

  it("fails closed when a positive authorization claim lacks evidence", () => {
    const input = packet();
    input.authorizedByProvider = claim(true, null);

    const result = buildKrossTransportIntakeFromProviderEvidence(input);

    expect(result.intake.authorizedByProvider).toBe(false);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.evidenceIssues.map((issue) => issue.key)).toContain(
      "provider_authorization",
    );
  });

  it("does not convert unknown billing into no-cost approval", () => {
    const input = packet();
    input.billableActivationRequired = claim(null, null);

    const result = buildKrossTransportIntakeFromProviderEvidence(input);

    expect(result.intake.billableActivationRequired).toBeNull();
    expect(result.intakeEvaluation.readyForFirstAuthorizedRead).toBe(false);
    expect(result.intakeEvaluation.issues.map((issue) => issue.key)).toContain(
      "billing_unknown",
    );
  });

  it("keeps unsupported or unevidenced live availability false", () => {
    const input = packet();
    input.liveAvailabilitySupported = claim(true, null);

    const result = buildKrossTransportIntakeFromProviderEvidence(input);

    expect(result.intake.liveAvailabilitySupported).toBe(false);
    expect(result.evidenceIssues.map((issue) => issue.key)).toContain(
      "live_availability_supported",
    );
  });
});
