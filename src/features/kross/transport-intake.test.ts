import { describe, expect, it } from "vitest";

import { evaluateKrossTransportIntake } from "./transport-intake";

const base = {
  providerName: "Kross Booking",
  ticketReference: "KB-305650/26",
  transportKind: "api" as const,
  readOnlyConfirmed: true,
  authorizedByProvider: true,
  billableActivationRequired: false,
  setupFee: null,
  recurringFee: null,
  otherFees: null,
  documentationReference: "provider-doc-1",
  credentialScopeSummary: "reservations:read",
  reservationsSupported: true,
  currentStaysSupported: true,
  arrivalsDeparturesSupported: true,
  liveRatesSupported: false,
  liveAvailabilitySupported: false,
  webhookEvents: [],
  exportFrequencyMinutes: null,
  sourceTimestampAvailable: true,
  externalReservationIdentityAvailable: true,
  fieldMapReady: true,
  approvedForFirstRead: true,
};

describe("evaluateKrossTransportIntake", () => {
  it("accepts a fully documented read-only reservation transport for first-read preparation", () => {
    const result = evaluateKrossTransportIntake(base);

    expect(result.validForReservationReadPreparation).toBe(true);
    expect(result.readyForFirstAuthorizedRead).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("fails closed when provider authorization or read-only evidence is missing", () => {
    const result = evaluateKrossTransportIntake({
      ...base,
      authorizedByProvider: false,
      readOnlyConfirmed: false,
    });

    expect(result.validForReservationReadPreparation).toBe(false);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map((issue) => issue.key)).toEqual(
      expect.arrayContaining(["provider_authorization", "read_only"]),
    );
  });

  it("does not allow first read while billing status is unknown", () => {
    const result = evaluateKrossTransportIntake({
      ...base,
      billableActivationRequired: null,
    });

    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map((issue) => issue.key)).toContain("billing_unknown");
  });

  it("requires an official field map before reservation ingestion", () => {
    const result = evaluateKrossTransportIntake({
      ...base,
      fieldMapReady: false,
    });

    expect(result.validForReservationReadPreparation).toBe(true);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
    expect(result.issues.map((issue) => issue.key)).toContain("field_map");
  });

  it("tracks rate/availability preparation separately from reservation truth", () => {
    const result = evaluateKrossTransportIntake({
      ...base,
      reservationsSupported: false,
      currentStaysSupported: false,
      arrivalsDeparturesSupported: false,
      externalReservationIdentityAvailable: false,
      fieldMapReady: false,
      liveRatesSupported: true,
      liveAvailabilitySupported: true,
      approvedForFirstRead: false,
    });

    expect(result.validForReservationReadPreparation).toBe(false);
    expect(result.validForRateAvailabilityPreparation).toBe(true);
    expect(result.readyForFirstAuthorizedRead).toBe(false);
  });
});
